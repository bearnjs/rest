import type { Request, Response, Handler, NextFunction, Route } from '../types';

/**
 * @class RouteExecutor
 * @classdesc This class is responsible for executing route handlers with support for middleware.
 */
export class RouteExecutor {
  /**
   * @function executeRouteWithMiddlewares
   * @description Executes the middlewares associated with a route, followed by the route handler.
   * @async
   * @static
   * @param {Route} route - The route object containing the handler and middlewares.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} A promise that resolves when the handler and all middlewares have been executed.
   */
  static async executeRouteWithMiddlewares(route: Route, req: Request, res: Response): Promise<void> {
    const mws = route.middlewares ?? [];
    if (mws.length === 0) {
      return this.executeHandler(route.handler, req, res);
    }

    let index = 0;
    return new Promise<void>((resolve, reject) => {
      /**
       * @function runNext
       * @description Executes the next middleware in the chain or the route handler if all middlewares have been executed.
       * @param {Error} [err] - An optional error that may have occurred in a previous middleware.
       */
      const runNext: NextFunction = (err?: Error) => {
        if (err) return reject(err);
        const mw = mws[index++];
        if (!mw) {
          // All middlewares have been executed, now run the handler
          try {
            const out = route.handler(req, res, (e?: Error) => (e ? reject(e) : resolve()));
            if (out && typeof out === 'object' && typeof (out as { then?: unknown }).then === 'function') {
              void (out as Promise<unknown>)
                .then(() => resolve())
                .catch(e => reject(e instanceof Error ? e : new Error(String(e))));
            }
          } catch (e) {
            reject(e instanceof Error ? e : new Error(String(e)));
          }
          return;
        }
        try {
          const maybe = mw(req, res, runNext);
          if (maybe && typeof maybe === 'object' && typeof (maybe as { then?: unknown }).then === 'function') {
            void (maybe as Promise<unknown>).catch(e => runNext(e instanceof Error ? e : new Error(String(e))));
          }
        } catch (e) {
          runNext(e instanceof Error ? e : new Error(String(e)));
        }
      };
      runNext();
    });
  }

  /**
   * @function executeHandler
   * @description Executes a route handler and handles any promises it may return.
   * @async
   * @private
   * @static
   * @param {Handler} handler - The route handler function.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @returns {Promise<void>} A promise that resolves when the handler has been executed.
   */
  private static async executeHandler(handler: Handler, req: Request, res: Response): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      /**
       * @function next
       * @description Callback function to be called by the handler to indicate completion or error.
       * @param {Error} [err] - An optional error that may have occurred during handler execution.
       */
      const next: NextFunction = (err?: Error) => {
        if (err) return reject(err);
        resolve();
      };

      try {
        const maybe = handler(req, res, next);
        if (maybe && typeof maybe === 'object' && typeof (maybe as unknown as { then?: unknown }).then === 'function') {
          void (maybe as Promise<unknown>)
            .then(() => resolve())
            .catch(e => reject(e instanceof Error ? e : new Error(String(e))));
        } else {
          resolve();
        }
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }
}
