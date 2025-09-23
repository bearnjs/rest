import type {
  Request,
  Response,
  Handler,
  HttpMethod,
  Route,
  NextFunction,
  RouteSchema,
  PathHandler,
  JsonValue,
} from '../types';

/** Lightweight HTTP router with middleware support. */
export class Router {
  private routes: Route[] = [];
  private middlewares: Array<{ path?: string; handler: Handler }> = [];
  private mountedRouters: Array<{ path?: string; router: Router }> = [];
  private routeMap = new Map<string, Route[]>();
  private middlewareCache = new Map<string, Handler[]>();

  /** Normalize a path by ensuring leading slash and removing trailing slash (except root) */
  private normalizePath(input: string): string {
    const raw = input || '/';
    let path = raw.startsWith('/') ? raw : `/${raw}`;
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path;
  }

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
      const normalized = this.normalizePath(pathOrHandler);
      if (handler instanceof Router) {
        this.mountedRouters.push({ path: normalized, router: handler });
      } else {
        this.middlewares.push({ path: normalized, handler });
      }
    } else if (pathOrHandler instanceof Router) {
      this.mountedRouters.push({ router: pathOrHandler });
    } else {
      this.middlewares.push({ handler: pathOrHandler as Handler });
    }
  }

  /** Registers middleware; alias for use(). */
  middleware(handler: Handler): void;
  middleware(path: string, handler: Handler): void;
  middleware(pathOrHandler: string | Handler, handler?: Handler): void {
    this.use(pathOrHandler as never, handler as never);
  }

  /** Mounts a router; alias for use(). */
  mount(router: Router): void;
  mount(path: string, router: Router): void;
  mount(pathOrRouter: string | Router, router?: Router): void {
    this.use(pathOrRouter as never, router as never);
  }

  /** Registers a GET route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   *    * @param schema @type {RouteSchema} - The schema.
   */
  get<Path extends string, TResponse extends JsonValue = JsonValue>(
    path: Path,
    ...handlers:
      | [...Handler[], PathHandler<Path, TResponse>]
      | [...Handler[], PathHandler<Path, TResponse>, RouteSchema]
  ): void {
    const lastArg = handlers[handlers.length - 1] as unknown;
    const maybeSchema = typeof lastArg === 'object' ? (handlers.pop() as RouteSchema) : undefined;
    const handler = handlers.pop() as unknown as Handler;
    const mws = handlers as Handler[];
    this.addRoute('GET', path, handler, maybeSchema, mws);
  }
  /** Registers a POST route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  post<Path extends string, TResponse extends JsonValue = JsonValue>(
    path: Path,
    ...handlers:
      | [...Handler[], PathHandler<Path, TResponse>]
      | [...Handler[], PathHandler<Path, TResponse>, RouteSchema]
  ): void {
    const maybeSchema = typeof handlers[handlers.length - 1] === 'object' ? (handlers.pop() as RouteSchema) : undefined;
    const handler = handlers.pop() as unknown as Handler;
    const mws = handlers as Handler[];
    this.addRoute('POST', path, handler, maybeSchema, mws);
  }

  /** Registers a PUT route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  put<Path extends string, TResponse extends JsonValue = JsonValue>(
    path: Path,
    ...handlers:
      | [...Handler[], PathHandler<Path, TResponse>]
      | [...Handler[], PathHandler<Path, TResponse>, RouteSchema]
  ): void {
    const lastArg = handlers[handlers.length - 1] as unknown;
    const maybeSchema = typeof lastArg === 'object' ? (handlers.pop() as RouteSchema) : undefined;
    const handler = handlers.pop() as unknown as Handler;
    const mws = handlers as Handler[];
    this.addRoute('PUT', path, handler, maybeSchema, mws);
  }

  /** Registers a DELETE route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  delete<Path extends string, TResponse extends JsonValue = JsonValue>(
    path: Path,
    ...handlers:
      | [...Handler[], PathHandler<Path, TResponse>]
      | [...Handler[], PathHandler<Path, TResponse>, RouteSchema]
  ): void {
    const lastArg = handlers[handlers.length - 1] as unknown;
    const maybeSchema = typeof lastArg === 'object' ? (handlers.pop() as RouteSchema) : undefined;
    const handler = handlers.pop() as unknown as Handler;
    const mws = handlers as Handler[];
    this.addRoute('DELETE', path, handler, maybeSchema, mws);
  }

  /** Registers a PATCH route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  patch<Path extends string, TResponse extends JsonValue = JsonValue>(
    path: Path,
    ...handlers:
      | [...Handler[], PathHandler<Path, TResponse>]
      | [...Handler[], PathHandler<Path, TResponse>, RouteSchema]
  ): void {
    const lastArg = handlers[handlers.length - 1] as unknown;
    const maybeSchema = typeof lastArg === 'object' ? (handlers.pop() as RouteSchema) : undefined;
    const handler = handlers.pop() as unknown as Handler;
    const mws = handlers as Handler[];
    this.addRoute('PATCH', path, handler, maybeSchema, mws);
  }

  /**
   * Registers a HEAD route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  head<Path extends string, TResponse extends JsonValue = JsonValue>(
    path: Path,
    ...handlers:
      | [...Handler[], PathHandler<Path, TResponse>]
      | [...Handler[], PathHandler<Path, TResponse>, RouteSchema]
  ): void {
    const lastArg = handlers[handlers.length - 1] as unknown;
    const maybeSchema = typeof lastArg === 'object' ? (handlers.pop() as RouteSchema) : undefined;
    const handler = handlers.pop() as unknown as Handler;
    const mws = handlers as Handler[];
    this.addRoute('HEAD', path, handler, maybeSchema, mws);
  }

  /**
   * Registers an OPTIONS route.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  options<Path extends string, TResponse extends JsonValue = JsonValue>(
    path: Path,
    ...handlers:
      | [...Handler[], PathHandler<Path, TResponse>]
      | [...Handler[], PathHandler<Path, TResponse>, RouteSchema]
  ): void {
    const lastArg = handlers[handlers.length - 1] as unknown;
    const maybeSchema = typeof lastArg === 'object' ? (handlers.pop() as RouteSchema) : undefined;
    const handler = handlers.pop() as unknown as Handler;
    const mws = handlers as Handler[];
    this.addRoute('OPTIONS', path, handler, maybeSchema, mws);
  }

  /** Adds a route to the router.
   * @param method @type {HttpMethod} - The method.
   * @param path @type {string} - The path.
   * @param handler @type {Handler} - The handler.
   * @param schema @type {RouteSchema} - The schema.
   */
  private addRoute<Path extends string>(
    method: HttpMethod,
    path: Path,
    handler: Handler,
    schema?: RouteSchema,
    middlewares: Handler[] = []
  ): void {
    const normalizedPath = this.normalizePath(path);
    const route: Route = { method, path: normalizedPath, handler, schema, middlewares };

    if (normalizedPath.includes(':')) {
      const paramNames: string[] = [];
      const regexPath = normalizedPath.replace(/:([^/]+)/g, (_match: string, paramName: string) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });
      route.regex = new RegExp(`^${regexPath}$`);
      route.paramNames = paramNames;
    }

    this.routes.push(route);

    const key = `${method}:${normalizedPath}`;
    if (!this.routeMap.has(key)) {
      this.routeMap.set(key, []);
    }
    this.routeMap.get(key)?.push(route);
  }

  /** Handles an incoming request by running middleware and matching routes.
   * @param req @type {Request} - The request.
   * @param res @type {Response} - The response.
   */
  async handle(req: Request, res: Response): Promise<void> {
    const method = req.method as HttpMethod;
    const rawPathname = (req.url ?? '/').split('?')[0] ?? '/';
    const pathname = this.normalizePath(rawPathname);

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
   * @param req @type {Request} - The request.
   * @param res @type {Response} - The response.
   * @param pathname @type {string} - The original pathname.
   */
  private async handleMountedRouter(
    mounted: { path?: string; router: Router },
    req: Request,
    res: Response,
    pathname: string
  ): Promise<void> {
    const originalPath: string | undefined = req.path;
    const originalUrl: string | undefined = req.url;

    // Adjust path for the mounted router
    if (mounted.path) {
      const adjustedPath = pathname.slice(mounted.path.length) || '/';
      const finalAdjusted = this.normalizePath(adjustedPath);
      req.path = finalAdjusted;
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
    for (const middleware of this.middlewares) {
      if (!middleware.path || pathname.startsWith(middleware.path)) {
        applicable.push(middleware.handler);
      }
    }

    this.middlewareCache.set(pathname, applicable);
    return applicable;
  }

  /** Executes a route.
   * @param req @type {Request} - The request.
   * @param res @type {Response} - The response.
   * @param method @type {HttpMethod} - The method.
   * @param pathname @type {string} - The pathname.
   */
  private async executeRoute(req: Request, res: Response, method: HttpMethod, pathname: string): Promise<void> {
    const exactKey = `${method}:${pathname}`;
    const exactRoutes = this.routeMap.get(exactKey);
    if (exactRoutes && exactRoutes.length > 0) {
      const route = exactRoutes[0];
      if (route) {
        req.params = {};
        return this.executeRouteWithMiddlewares(route, req, res);
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
        return this.executeRouteWithMiddlewares(route, req, res);
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
        const finalPath = this.normalizePath(adjustedPath);

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

  /** Runs per-route middlewares (if any) then the route handler. */
  private async executeRouteWithMiddlewares(route: Route, req: Request, res: Response): Promise<void> {
    const mws = route.middlewares ?? [];
    if (mws.length === 0) {
      return this.executeHandler(route.handler, req, res);
    }

    let index = 0;
    return new Promise<void>((resolve, reject) => {
      const runNext: NextFunction = (err?: Error) => {
        if (err) return reject(err);
        const mw = mws[index++];
        if (!mw) {
          // run handler
          try {
            const out = route.handler(req, res, (e?: Error) => (e ? reject(e) : resolve()));
            if (out && typeof out === 'object' && typeof (out as { then?: unknown }).then === 'function') {
              void (out as Promise<unknown>)
                .then(() => resolve())
                .catch(e => reject(e instanceof Error ? e : new Error(String(e))));
            } else {
              // handler completed synchronously
              // resolve will be called by next() or immediately if none used
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
   * @param req @type {Request} - The request.
   * @param res @type {Response} - The response.
   */
  private async executeHandler(handler: Handler, req: Request, res: Response): Promise<void> {
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
   * @param req @type {Request} - The request.
   * @param res @type {Response} - The response.
   */
  private handleError(err: Error, req: Request, res: Response): void {
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
        const combined = mounted.path ? `${mounted.path}${route.path}` : route.path;
        const prefixedPath = this.normalizePath(combined);
        allRoutes.push({
          ...route,
          path: prefixedPath,
        });
      }
    }

    return allRoutes;
  }
}
