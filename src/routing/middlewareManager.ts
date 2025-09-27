import type { Request, Response, Handler, NextFunction } from '../types';

/**
 * @interface MiddlewareConfig
 * @description Configuration for a middleware, including its path and handler function.
 */
export interface MiddlewareConfig {
  /**
   * @property {string} [path]
   * @description Optional path that the middleware should apply to.
   */
  path?: string;

  /**
   * @property {Handler} handler
   * @description The function that will handle the middleware logic.
   */
  handler: Handler;
}

/**
 * @class MiddlewareManager
 * @classdesc Manages the execution and caching of middleware functions.
 */
export class MiddlewareManager {
  /**
   * @private
   * @type {MiddlewareConfig[]}
   * @description List of registered middleware configurations.
   */
  private middlewares: MiddlewareConfig[] = [];

  /**
   * @private
   * @type {Map<string, Handler[]>}
   * @description Cache for storing applicable middleware handlers for specific paths.
   */
  private middlewareCache = new Map<string, Handler[]>();

  /**
   * @function addMiddleware
   * @description Adds a new middleware to the manager and clears the cache.
   * @param {MiddlewareConfig} middleware - The middleware configuration to add.
   */
  addMiddleware(middleware: MiddlewareConfig): void {
    this.middlewares.push(middleware);
    this.middlewareCache.clear();
  }

  /**
   * @function getApplicableMiddleware
   * @description Retrieves middleware handlers applicable to a given path, using caching for efficiency.
   * @param {string} pathname - The path to get applicable middleware for.
   * @returns {Handler[]} An array of middleware handlers that apply to the given path.
   */
  getApplicableMiddleware(pathname: string): Handler[] {
    if (this.middlewareCache.has(pathname)) {
      return this.middlewareCache.get(pathname) ?? [];
    }

    const applicable: Handler[] = [];
    for (const middleware of this.middlewares) {
      if (!middleware.path || pathname.startsWith(middleware.path)) {
        applicable.push(middleware.handler);
      }
    }

    this.middlewareCache.set(pathname, applicable);
    return applicable;
  }

  /**
   * @async
   * @function executeMiddleware
   * @description Executes all middleware applicable to a request, then calls the route handler.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {string} pathname - The path of the request.
   * @param {() => Promise<void>} routeHandler - The final route handler to execute after middleware.
   * @returns {Promise<void>} A promise that resolves when all middleware and the route handler have been executed.
   */
  async executeMiddleware(
    req: Request,
    res: Response,
    pathname: string,
    routeHandler: () => Promise<void>
  ): Promise<void> {
    const applicableMiddleware = this.getApplicableMiddleware(pathname);
    let middlewareIndex = 0;

    const runMiddleware = async (): Promise<void> => {
      if (middlewareIndex >= applicableMiddleware.length) {
        return routeHandler();
      }

      const handler = applicableMiddleware[middlewareIndex++];
      if (!handler) {
        return routeHandler();
      }

      return new Promise((resolve, reject) => {
        const next: NextFunction = (err?: Error) => {
          if (err) return reject(err);
          void runMiddleware()
            .then(() => {
              if (
                middlewareResult &&
                typeof middlewareResult === 'object' &&
                typeof (middlewareResult as unknown as { then?: unknown }).then === 'function'
              ) {
                return middlewareResult as Promise<unknown>;
              }
            })
            .then(() => resolve())
            .catch(e => reject(e instanceof Error ? e : new Error(String(e))));
        };

        let middlewareResult: unknown;
        try {
          middlewareResult = handler(req, res, next);
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
    };

    try {
      await runMiddleware();
    } catch (err) {
      this.handleError(err instanceof Error ? err : new Error(String(err)), req, res);
    }
  }

  /**
   * @private
   * @function handleError
   * @description Handles errors that occur during middleware execution.
   * @param {Error} err - The error that occurred.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   */
  private handleError(err: Error, req: Request, res: Response): void {
    process.stderr.write(`Middleware Error: ${String(err)}\n`);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  }

  /**
   * @function clearCache
   * @description Clears the cache of middleware handlers.
   */
  clearCache(): void {
    this.middlewareCache.clear();
  }

  /**
   * @function getMiddlewares
   * @description Retrieves all registered middleware configurations.
   * @returns {MiddlewareConfig[]} An array of all registered middleware configurations.
   */
  getMiddlewares(): MiddlewareConfig[] {
    return [...this.middlewares];
  }
}
