import type { BlazeRequest, BlazeResponse, Handler, HttpMethod, Route, NextFunction, RouteSchema } from '../types';

/** Lightweight HTTP router with middleware support. */
export class Router {
  private routes: Route[] = [];
  private middleware: Array<{ path?: string; handler: Handler }> = [];

  /** Registers a middleware for all paths or a specific path prefix.
   * @param handler @type {Handler} - The middleware handler.
   * @param path @type {string} - The path prefix.
   * @param pathOrHandler @type {string | Handler} - The path prefix or handler.
   */
  use(handler: Handler): void;
  use(path: string, handler: Handler): void;
  use(pathOrHandler: string | Handler, handler?: Handler): void {
    if (typeof pathOrHandler === 'string' && handler) {
      this.middleware.push({ path: pathOrHandler, handler });
    } else {
      this.middleware.push({ handler: pathOrHandler as Handler });
    }
  }

  /** Registers a GET route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  get(path: string, handler: Handler, schema?: RouteSchema): void {
    this.addRoute('GET', path, handler, schema);
  }

  /** Registers a POST route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  post(path: string, handler: Handler, schema?: RouteSchema): void {
    this.addRoute('POST', path, handler, schema);
  }

  /** Registers a PUT route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  put(path: string, handler: Handler, schema?: RouteSchema): void {
    this.addRoute('PUT', path, handler, schema);
  }

  /** Registers a DELETE route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  delete(path: string, handler: Handler, schema?: RouteSchema): void {
    this.addRoute('DELETE', path, handler, schema);
  }

  /** Registers a PATCH route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  patch(path: string, handler: Handler, schema?: RouteSchema): void {
    this.addRoute('PATCH', path, handler, schema);
  }

  /** Adds a route to the router.
   * @param method @type {HttpMethod} - The method.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  private addRoute(method: HttpMethod, path: string, handler: Handler, schema?: RouteSchema): void {
    const route: Route = { method, path, handler, schema };

    if (path.includes(':')) {
      const paramNames: string[] = [];
      const regexPath = path.replace(/:([^/]+)/g, (_match: string, paramName: string) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });
      route.regex = new RegExp(`^${regexPath}$`);
      route.paramNames = paramNames;
    }

    this.routes.push(route);
  }

  /** Handles an incoming request by running middleware and matching routes.
   * @param req @type {BlazeRequest} - The request.
   * @param res @type {BlazeResponse} - The response.
   */
  async handle(req: BlazeRequest, res: BlazeResponse): Promise<void> {
    const method = req.method as HttpMethod;
    const pathname = (req.url ?? '/').split('?')[0] ?? '/';

    req.path = pathname;
    req.query = this.parseQuery(req.url);

    let middlewareIndex = 0;

    const runMiddleware = async (): Promise<void> => {
      // Find next middleware that matches the request path
      let current: { path?: string; handler: Handler } | undefined;
      while (middlewareIndex < this.middleware.length) {
        const candidate = this.middleware[middlewareIndex++];
        if (!candidate?.path || pathname.startsWith(candidate.path)) {
          current = candidate;
          break;
        }
      }

      if (!current) {
        return this.executeRoute(req, res, method, pathname);
      }

      const handler = current.handler;
      return new Promise((resolve, reject) => {
        const next: NextFunction = (err?: Error) => {
          if (err) return reject(err);
          void runMiddleware()
            .then(resolve)
            .catch(e => reject(e instanceof Error ? e : new Error(String(e))));
        };

        try {
          const maybe = handler(req, res, next);
          if (typeof (maybe as unknown as { then?: unknown }).then === 'function') {
            void (maybe as Promise<unknown>).catch(e => reject(e instanceof Error ? e : new Error(String(e))));
          }
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

  /** Executes a route.
   * @param req @type {BlazeRequest} - The request.
   * @param res @type {BlazeResponse} - The response.
   * @param method @type {HttpMethod} - The method.
   * @param pathname @type {string} - The pathname.
   */
  private async executeRoute(
    req: BlazeRequest,
    res: BlazeResponse,
    method: HttpMethod,
    pathname: string
  ): Promise<void> {
    for (const route of this.routes) {
      if (route.method !== method) continue;

      let isMatch = false;
      const params: Record<string, string> = {};

      if (route.regex && route.paramNames) {
        const match = pathname.match(route.regex);
        if (match) {
          isMatch = true;
          route.paramNames.forEach((name, index) => {
            const captured = match[index + 1] ?? '';
            params[name] = captured;
          });
        }
      } else if (route.path === pathname) {
        isMatch = true;
      }

      if (isMatch) {
        req.params = params;

        return new Promise<void>((resolve, reject) => {
          const next: NextFunction = (err?: Error) => {
            if (err) return reject(err);
            resolve();
          };

          try {
            const maybe = route.handler(req, res, next);
            if (typeof (maybe as unknown as { then?: unknown }).then === 'function') {
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

    res.status(404).send('Not Found');
  }

  /** Parses a query string.
   * @param url @type {string} - The URL.
   * @returns @type {Record<string, string>} - The query parameters.
   */
  private parseQuery(url?: string): Record<string, string> {
    if (!url) return {};
    const queryString = url.split('?')[1];
    if (!queryString) return {};
    const params: Record<string, string> = {};
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value ?? '');
      }
    });
    return params;
  }

  /** Handles an error.
   * @param err @type {Error} - The error.
   * @param req @type {BlazeRequest} - The request.
   * @param res @type {BlazeResponse} - The response.
   */
  private handleError(err: Error, req: BlazeRequest, res: BlazeResponse): void {
    process.stderr.write(`Router Error: ${String(err)}\n`);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  }

  /** Returns a copy of all registered routes.
   * @returns @type {Route[]} - The routes.
   */
  getRoutes(): Route[] {
    return [...this.routes];
  }
}
