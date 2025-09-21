import type { AerixRequest, AerixResponse, Handler, HttpMethod, Route, NextFunction, RouteSchema } from '../types';

/** Lightweight HTTP router with middleware support. */
export class Router {
  private routes: Route[] = [];
  private middleware: Array<{ path?: string; handler: Handler }> = [];
  private mountedRouters: Array<{ path?: string; router: Router }> = [];
  private routeMap = new Map<string, Route[]>();
  private middlewareCache = new Map<string, Handler[]>();

  /** Registers a middleware for all paths or a specific path prefix.
   * @param handler @type {Handler} - The middleware handler.
   * @param path @type {string} - The path prefix.
   * @param pathOrHandler @type {string | Handler} - The path prefix or handler.
   */
  use(handler: Handler): void;
  use(path: string, handler: Handler): void;
  use(path: string, router: Router): void;
  use(router: Router): void;
  use(pathOrHandler: string | Handler | Router, handler?: Handler | Router): void {
    if (typeof pathOrHandler === 'string' && handler) {
      if (handler instanceof Router) {
        this.mountedRouters.push({ path: pathOrHandler, router: handler });
      } else {
        this.middleware.push({ path: pathOrHandler, handler });
      }
    } else if (pathOrHandler instanceof Router) {
      this.mountedRouters.push({ router: pathOrHandler });
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

    const key = `${method}:${path}`;
    if (!this.routeMap.has(key)) {
      this.routeMap.set(key, []);
    }
    this.routeMap.get(key)?.push(route);
  }

  /** Handles an incoming request by running middleware and matching routes.
   * @param req @type {AerixRequest} - The request.
   * @param res @type {AerixResponse} - The response.
   */
  async handle(req: AerixRequest, res: AerixResponse): Promise<void> {
    const method = req.method as HttpMethod;
    const pathname = (req.url ?? '/').split('?')[0] ?? '/';

    req.path = pathname;
    req.query = this.parseQuery(req.url);

    const applicableMiddleware = this.getApplicableMiddleware(pathname);

    let middlewareIndex = 0;

    const runMiddleware = async (): Promise<void> => {
      if (middlewareIndex >= applicableMiddleware.length) {
        // All middleware has been processed, now handle the request
        return this.executeRoute(req, res, method, pathname);
      }

      const handler = applicableMiddleware[middlewareIndex++];
      if (!handler) {
        return this.executeRoute(req, res, method, pathname);
      }

      return new Promise((resolve, reject) => {
        const next: NextFunction = (err?: Error) => {
          if (err) return reject(err);
          void runMiddleware()
            .then(() => {
              // If middleware returned a Promise, wait for it to complete
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

  /** Handles a request for a mounted router.
   * @param mounted @type {{ path?: string; router: Router }} - The mounted router.
   * @param req @type {AerixRequest} - The request.
   * @param res @type {AerixResponse} - The response.
   * @param pathname @type {string} - The original pathname.
   */
  private async handleMountedRouter(
    mounted: { path?: string; router: Router },
    req: AerixRequest,
    res: AerixResponse,
    pathname: string
  ): Promise<void> {
    const originalPath: string | undefined = req.path;
    const originalUrl: string | undefined = req.url;

    // Adjust path for the mounted router
    if (mounted.path) {
      const adjustedPath = pathname.slice(mounted.path.length) || '/';
      req.path = adjustedPath.startsWith('/') ? adjustedPath : `/${adjustedPath}`;
      req.url = req.path + (req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
    }

    try {
      await mounted.router.handle(req, res);
    } finally {
      // Restore original path and URL
      if (originalPath !== undefined) {
        req.path = originalPath;
      }
      if (originalUrl !== undefined) {
        req.url = originalUrl;
      }
    }
  }

  /** Gets applicable middleware for a given path with caching.
   * @param pathname @type {string} - The path to get middleware for.
   * @returns @type {Handler[]} - The applicable middleware handlers.
   */
  private getApplicableMiddleware(pathname: string): Handler[] {
    if (this.middlewareCache.has(pathname)) {
      return this.middlewareCache.get(pathname) ?? [];
    }

    const applicable: Handler[] = [];
    for (const middleware of this.middleware) {
      if (!middleware.path || pathname.startsWith(middleware.path)) {
        applicable.push(middleware.handler);
      }
    }

    this.middlewareCache.set(pathname, applicable);
    return applicable;
  }

  /** Executes a route.
   * @param req @type {AerixRequest} - The request.
   * @param res @type {AerixResponse} - The response.
   * @param method @type {HttpMethod} - The method.
   * @param pathname @type {string} - The pathname.
   */
  private async executeRoute(
    req: AerixRequest,
    res: AerixResponse,
    method: HttpMethod,
    pathname: string
  ): Promise<void> {
    const exactKey = `${method}:${pathname}`;
    const exactRoutes = this.routeMap.get(exactKey);
    if (exactRoutes && exactRoutes.length > 0) {
      const route = exactRoutes[0];
      if (route) {
        req.params = {};
        return this.executeHandler(route.handler, req, res);
      }
    }

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
      }

      if (isMatch) {
        req.params = params;
        return this.executeHandler(route.handler, req, res);
      }
    }

    // If no local route matches, check mounted routers
    for (const mounted of this.mountedRouters) {
      if (this.shouldHandleWithMountedRouter(mounted, pathname)) {
        // For routers mounted at root path, delegate directly without checking routes
        if (!mounted.path) {
          return this.handleMountedRouter(mounted, req, res, pathname);
        }

        // For routers mounted with path prefix, check if they have a route for this path
        const mountedRoutes = mounted.router.getRoutes();
        const adjustedPath = pathname.slice(mounted.path.length) || '/';
        const finalPath = adjustedPath.startsWith('/') ? adjustedPath : `/${adjustedPath}`;

        const hasRoute = mountedRoutes.some(route => {
          if (route.method !== method) return false;

          // Check exact match with adjusted path
          if (route.path === finalPath) return true;

          // Check regex match with adjusted path
          if (route.regex?.test(finalPath)) return true;

          return false;
        });

        if (hasRoute) {
          return this.handleMountedRouter(mounted, req, res, pathname);
        }
      }
    }

    res.status(404).send('Not Found');
  }

  /** Determines if a request should be handled by a mounted router.
   * @param mounted @type {{ path?: string; router: Router }} - The mounted router.
   * @param pathname @type {string} - The request pathname.
   * @returns @type {boolean} - Whether the mounted router should handle this request.
   */
  private shouldHandleWithMountedRouter(mounted: { path?: string; router: Router }, pathname: string): boolean {
    if (!mounted.path) {
      // Router mounted without path prefix - handle all routes
      return true;
    }

    // Router mounted with path prefix - check if path starts with the prefix
    if (mounted.path === '/') {
      // Special case: router mounted at root - handle all routes
      return true;
    }

    if (pathname === mounted.path || pathname.startsWith(`${mounted.path}/`)) {
      return true;
    }

    return false;
  }

  /** Executes a route handler with Promise handling.
   * @param handler @type {Handler} - The handler to execute.
   * @param req @type {AerixRequest} - The request.
   * @param res @type {AerixResponse} - The response.
   */
  private async executeHandler(handler: Handler, req: AerixRequest, res: AerixResponse): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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

  /** Parses a query string.
   * @param url @type {string} - The URL.
   * @returns @type {Record<string, string>} - The query parameters.
   */
  private parseQuery(url?: string): Record<string, string> {
    if (!url) return {};
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) return {};

    const queryString = url.slice(queryIndex + 1);
    if (!queryString) return {};

    const params: Record<string, string> = {};
    const parts = queryString.split('&');

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      const equalIndex = part.indexOf('=');
      if (equalIndex === -1) {
        params[decodeURIComponent(part)] = '';
      } else {
        const key = part.slice(0, equalIndex);
        const value = part.slice(equalIndex + 1);
        if (key) params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }

    return params;
  }

  /** Handles an error.
   * @param err @type {Error} - The error.
   * @param req @type {AerixRequest} - The request.
   * @param res @type {AerixResponse} - The response.
   */
  private handleError(err: Error, req: AerixRequest, res: AerixResponse): void {
    process.stderr.write(`Router Error: ${String(err)}\n`);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  }

  /** Returns a copy of all registered routes.
   * @returns @type {Route[]} - The routes.
   */
  getRoutes(): Route[] {
    const allRoutes = [...this.routes];

    // Include routes from mounted routers
    for (const mounted of this.mountedRouters) {
      const mountedRoutes = mounted.router.getRoutes();
      for (const route of mountedRoutes) {
        const prefixedPath = mounted.path ? `${mounted.path}${route.path}`.replace(/\/+/g, '/') : route.path;
        allRoutes.push({
          ...route,
          path: prefixedPath,
        });
      }
    }

    return allRoutes;
  }
}
