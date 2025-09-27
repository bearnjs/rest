import { MiddlewareManager } from './middlewareManager';
import { PathUtils } from './pathUtils';
import { RouteExecutor } from './routeExecutor';
import { RouteTrie } from './routeTrie';

import type {
  Request,
  Response,
  Handler,
  HttpMethod,
  Route,
  RouteSchema,
  PathHandler,
  JsonValue,
  RouterOptions,
} from '../types';

/**
 * @description Configuration for a router mounted at a specific path.
 */
interface MountedRouter {
  /** The path where the router is mounted. */
  path?: string;
  /** The router instance to be mounted. */
  router: RouterCore;
}

/**
 * @class
 * @classdesc Manages routes and middleware in an application.
 */
export class RouterCore {
  private routes: Route[] = [];
  private mountedRouters: MountedRouter[] = [];
  private routeMap = new Map<string, Route[]>();
  private trie = new RouteTrie();
  private middlewareManager = new MiddlewareManager();

  /** @readonly An optional prefix used when the router is mounted without a specific path. */
  public readonly basePrefix: string | undefined;
  /** @readonly An optional name for the router, useful for identification. */
  public readonly name: string | undefined;
  /** @readonly An optional description for the router, useful for documentation or logging. */
  public readonly description: string | undefined;

  /**
   * @constructs
   * @param {RouterOptions} [options] - Configuration options for the router.
   */
  constructor(options?: RouterOptions) {
    this.basePrefix = options?.prefix ? PathUtils.normalizePath(options.prefix) : undefined;
    this.name = options?.name;
    this.description = options?.description;

    const preset: Handler[] = options && Array.isArray(options.middlewares) ? options.middlewares : [];
    for (let i = 0; i < preset.length; i++) {
      const handler = preset[i];
      if (!handler) continue;
      this.middlewareManager.addMiddleware({ handler });
    }
  }

  /**
   * @function
   * @description Registers middleware or mounts a router at a specific path or globally.
   * @param {Path | Handler | RouterCore} pathOrHandler - The path or handler to register.
   * @param {Handler | RouterCore | PathHandler<Path>} [handler] - The handler or router to register.
   */
  use(handler: Handler): void;
  use<Path extends string>(path: Path, handler: Handler | PathHandler<Path>): void;
  use(path: string, router: RouterCore): void;
  use(router: RouterCore): void;
  use<Path extends string>(
    pathOrHandler: Path | Handler | RouterCore,
    handler?: Handler | RouterCore | PathHandler<Path>
  ): void {
    if (typeof pathOrHandler === 'string' && handler) {
      const normalized = PathUtils.normalizePath(pathOrHandler);
      const effectivePath = this.basePrefix ? PathUtils.normalizePath(`${this.basePrefix}${normalized}`) : normalized;
      if (handler instanceof RouterCore) {
        this.mountedRouters.push({ path: effectivePath, router: handler });
      } else {
        this.middlewareManager.addMiddleware({ path: effectivePath, handler: handler as Handler });
      }
    } else if (pathOrHandler instanceof RouterCore) {
      const effectivePath = this.basePrefix ?? undefined;
      if (effectivePath) {
        this.mountedRouters.push({ path: effectivePath, router: pathOrHandler });
      } else {
        this.mountedRouters.push({ router: pathOrHandler });
      }
    } else {
      this.middlewareManager.addMiddleware({ handler: pathOrHandler as Handler });
    }
  }

  /**
   * @function
   * @description An alias for the `use` method to register middleware.
   * @param {string | Handler} pathOrHandler - The path or handler to register.
   * @param {Handler} [handler] - The handler to register.
   */
  middleware(handler: Handler): void;
  middleware(path: string, handler: Handler): void;
  middleware(pathOrHandler: string | Handler, handler?: Handler): void {
    this.use(pathOrHandler as never, handler as never);
  }

  /**
   * @function
   * @description An alias for the `use` method to mount a router.
   * @param {string | RouterCore} pathOrRouter - The path or router to mount.
   * @param {RouterCore} [router] - The router to mount.
   */
  mount(router: RouterCore): void;
  mount(path: string, router: RouterCore): void;
  mount(pathOrRouter: string | RouterCore, router?: RouterCore): void {
    this.use(pathOrRouter as never, router as never);
  }

  /**
   * @function
   * @description Registers a GET route with optional middleware and schema.
   * @param {string} path - The path for the route.
   * @param {...Handler[]} handlers - The handlers and optional schema for the route.
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

  /**
   * @function
   * @description Registers a POST route with optional middleware and schema.
   * @param {string} path - The path for the route.
   * @param {...Handler[]} handlers - The handlers and optional schema for the route.
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

  /**
   * @function
   * @description Registers a PUT route with optional middleware and schema.
   * @param {string} path - The path for the route.
   * @param {...Handler[]} handlers - The handlers and optional schema for the route.
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

  /**
   * @function
   * @description Registers a DELETE route with optional middleware and schema.
   * @param {string} path - The path for the route.
   * @param {...Handler[]} handlers - The handlers and optional schema for the route.
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

  /**
   * @function
   * @description Registers a PATCH route with optional middleware and schema.
   * @param {string} path - The path for the route.
   * @param {...Handler[]} handlers - The handlers and optional schema for the route.
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
   * @function
   * @description Registers a HEAD route with optional middleware and schema.
   * @param {string} path - The path for the route.
   * @param {...Handler[]} handlers - The handlers and optional schema for the route.
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
   * @function
   * @description Registers an OPTIONS route with optional middleware and schema.
   * @param {string} path - The path for the route.
   * @param {...Handler[]} handlers - The handlers and optional schema for the route.
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

  /**
   * @function
   * @description Adds a new route to the router.
   * @param {HttpMethod} method - The HTTP method for the route.
   * @param {string} path - The path for the route.
   * @param {Handler} handler - The handler function for the route.
   * @param {RouteSchema} [schema] - An optional schema for the route.
   * @param {Handler[]} [middlewares=[]] - An optional array of middleware functions for the route.
   * @private
   */
  private addRoute<Path extends string>(
    method: HttpMethod,
    path: Path,
    handler: Handler,
    schema?: RouteSchema,
    middlewares: Handler[] = []
  ): void {
    const localPath = PathUtils.normalizePath(path);
    const normalizedPath = this.basePrefix ? PathUtils.normalizePath(`${this.basePrefix}${localPath}`) : localPath;
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

    this.trie.insertRoute(method, route);
  }

  /**
   * @async
   * @function
   * @description Handles an incoming request by executing middleware and matching routes.
   * @param {Request} req - The incoming request object.
   * @param {Response} res - The response object to send data back to the client.
   * @returns {Promise<void>}
   */
  async handle(req: Request, res: Response): Promise<void> {
    const method = req.method as HttpMethod;
    const rawPathname = (req.url ?? '/').split('?')[0] ?? '/';
    const pathname = PathUtils.normalizePath(rawPathname);

    req.path = pathname;
    req.query = PathUtils.parseQuery(req.url);

    await this.middlewareManager.executeMiddleware(req, res, pathname, () =>
      this.executeRoute(req, res, method, pathname)
    );
  }

  /**
   * @async
   * @function
   * @description Executes a matched route.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {HttpMethod} method - The HTTP method of the request.
   * @param {string} pathname - The path of the request.
   * @private
   * @returns {Promise<void>}
   */
  private async executeRoute(req: Request, res: Response, method: HttpMethod, pathname: string): Promise<void> {
    const exactKey = `${method}:${pathname}`;
    const exactRoutes = this.routeMap.get(exactKey);
    if (exactRoutes && exactRoutes.length > 0) {
      const route = exactRoutes[0];
      if (route) {
        req.params = {};
        return RouteExecutor.executeRouteWithMiddlewares(route, req, res);
      }
    }

    const trieResult = this.trie.searchRoute(method, pathname);
    if (trieResult) {
      req.params = trieResult.params;
      return RouteExecutor.executeRouteWithMiddlewares(trieResult.route, req, res);
    }

    for (const mounted of this.mountedRouters) {
      if (PathUtils.shouldHandleWithMountedRouter(mounted, pathname)) {
        if (!mounted.path) {
          return this.handleMountedRouter(mounted, req, res, pathname);
        }
        const mountedRoutes = mounted.router.getRoutes();
        const adjustedPath = pathname.slice(mounted.path.length) || '/';
        const finalPath = PathUtils.normalizePath(adjustedPath);

        const hasRoute = mountedRoutes.some(route => {
          if (route.method !== method) return false;
          if (route.path === finalPath) return true;
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

  /**
   * @async
   * @function
   * @description Handles a request for a router that is mounted at a specific path.
   * @param {MountedRouter} mounted - The mounted router configuration.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {string} pathname - The path of the request.
   * @private
   * @returns {Promise<void>}
   */
  private async handleMountedRouter(
    mounted: MountedRouter,
    req: Request,
    res: Response,
    pathname: string
  ): Promise<void> {
    const originalPath: string | undefined = req.path;
    const originalUrl: string | undefined = req.url;

    if (mounted.path) {
      const adjustedPath = pathname.slice(mounted.path.length) || '/';
      const finalAdjusted = PathUtils.normalizePath(adjustedPath);
      req.path = finalAdjusted;
      req.url = req.path + (req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
    }

    try {
      await mounted.router.handle(req, res);
    } finally {
      if (originalPath !== undefined) {
        req.path = originalPath;
      }
      if (originalUrl !== undefined) {
        req.url = originalUrl;
      }
    }
  }

  /**
   * @function
   * @description Retrieves a list of all registered routes, including those from mounted routers.
   * @returns {Route[]} An array of all routes.
   */
  getRoutes(): Route[] {
    const allRoutes = [...this.routes];
    for (const mounted of this.mountedRouters) {
      const mountedRoutes = mounted.router.getRoutes();
      for (const route of mountedRoutes) {
        const combined = mounted.path ? `${mounted.path}${route.path}` : route.path;
        const prefixedPath = PathUtils.normalizePath(combined);
        allRoutes.push({
          ...route,
          path: prefixedPath,
        });
      }
    }

    return allRoutes;
  }
}
