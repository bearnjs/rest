import { createServer } from 'http';

import { getRegisteredControllers } from '../decorators';
import { HttpException } from '../exceptions';
import { printStartupLog } from './logging';
import { createCorsMiddleware } from './middlewares/cors';
import { requestLogger } from './middlewares/requestLogeer';
import { enhanceRequest, parseBody } from '../http/request';
import { enhanceResponse } from '../http/response';
import { Router } from '../routing/router';

import type { AppOptions, AerixRequest, AerixResponse, ErrorHandler, Handler, ListenInfo, Route } from '../types';
import type { Server } from 'http';

/**
 * Creates a new Aerix application instance.
 *
 * This is the recommended way to create a new Aerix application rather than
 * instantiating {@link AerixApp} directly.
 *
 * @example
 * ```ts
 * import Aerix from 'Aerix';
 *
 * const app = Aerix({
 *   port: 3000,
 *   cors: {
 *     origin: 'http://localhost:3000',
 *     methods: ['GET', 'POST'],
 *   }
 * });
 *
 * app.start();
 * ```
 *
 * @param options - Configuration options for the Aerix application
 * @returns A new configured Aerix application instance
 */
export class AerixApp extends Router {
  private server?: Server;
  private errorHandlers: ErrorHandler[] = [];
  private decoratorsRegistered = false;
  private options: AppOptions = {};

  /** Registers a middleware.
   * @param handler @type {Handler} - The middleware handler.
   * @param path @type {string} - The path prefix.
   * @param pathOrHandler @type {string | Handler} - The path prefix or handler.
   */
  override use(handler: Handler): void;
  override use(path: string, handler: Handler): void;
  override use(path: string, router: Router): void;
  override use(router: Router): void;
  override use(pathOrHandler: string | Handler | Router, handler?: Handler | Router): void {
    super.use(pathOrHandler as never, handler as never);
  }

  /**
   * Creates a new Aerix application instance.
   * Pass {@link AppOptions} to customize listening, logging, and CORS.
   * @param options @type {AppOptions} - The options for the Aerix application.
   */
  constructor(options: AppOptions = {}) {
    super();
    this.options = options;
    if (options.cors) {
      this.use(createCorsMiddleware(options.cors));
    }
    if (!options.disableLogging) {
      this.use(requestLogger);
    }
  }

  /**
   * Starts the HTTP server and begins handling requests.
   * Returns the underlying Node `Server` instance.
   * @param callback @type {(info: ListenInfo) => void} - The callback function to call when the server starts.
   * @returns @type {Server} - The underlying Node `Server` instance.
   */
  start(callback?: (info: ListenInfo) => void): Server {
    const { host: configHost, port = 8000, backlog, appName, appVersion } = this.options;

    let host = configHost;
    if (host === '[::]') host = '::';
    else if (host === '[::1]') host = '::1';

    this.server = createServer((req, res) => {
      const AerixReq = enhanceRequest(req);
      const AerixRes = enhanceResponse(res);

      void (async () => {
        if (['POST', 'PUT', 'PATCH'].includes(req.method ?? '')) {
          await parseBody(AerixReq);
        }

        if (!this.decoratorsRegistered) {
          this.registerDecoratedControllers();
          this.decoratorsRegistered = true;
        }
        await this.handle(AerixReq, AerixRes);
      })().catch((err: unknown) => {
        this.handleGlobalError(err instanceof Error ? err : new Error(String(err)), AerixReq, AerixRes);
      });
    });

    const originalHost = host;
    const addresses = [originalHost ?? 'localhost'];

    const formatHandlerName = (handler: Handler | string): string => {
      if (typeof handler === 'string') {
        return handler;
      }
      if (typeof handler === 'function') {
        return handler.name || 'anonymous';
      }
      return 'unknown';
    };

    const decoratorRoutes = getRegisteredControllers().flatMap(ctrl =>
      ctrl.routes.map(r => ({
        method: r.method,
        path: `${ctrl.basePath}${r.path}`.replace(/\/+/g, '/'),
        handler: r.propertyKey as unknown as Handler,
        schema: r.schema,
      }))
    );

    const allRoutes = this.getRoutes();

    const routes = [...decoratorRoutes];
    for (const route of allRoutes) {
      const exists = routes.some(r => r.method === route.method && r.path === route.path);
      if (!exists) {
        routes.push({
          method: route.method,
          path: route.path,
          handler: route.handler,
          schema: route.schema,
        });
      }
    }

    const displayRoutes = routes.map(route => ({
      method: route.method,
      path: route.path,
      handler: formatHandlerName(route.handler),
      schema: route.schema,
    })) as unknown as Route[];

    const onListen = (): void => {
      const info: ListenInfo & { appName: string; appVersion: string } = {
        port,
        addresses,
        routes: displayRoutes,
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid,
        appName: appName ?? 'Aerix',
        appVersion: appVersion ?? '0.1.0',
      };

      const { disableLogging, printRoutes } = this.options;
      const logOptions = {
        host: originalHost ?? 'localhost',
        disableLogging: disableLogging ?? false,
        printRoutes: printRoutes ?? false,
        appName: appName ?? 'Aerix',
        appVersion: appVersion ?? '0.1.0',
      };

      printStartupLog(info, displayRoutes, logOptions);

      callback?.(info);
    };

    const listenArgs: [number, string, number?, (() => void)?] = [port, host ?? 'localhost'];
    if (typeof backlog === 'number') {
      listenArgs.push(backlog);
    }
    listenArgs.push(onListen);
    this.server.listen(...listenArgs);

    return this.server;
  }

  /** Stops the server if running.
   * @param callback @type {(err?: Error) => void} - The callback function to call when the server stops.
   * @returns @type {void} - The underlying Node `Server` instance.
   */
  close(callback?: (err?: Error) => void): void {
    this.server?.close(callback);
  }

  /** Registers a global error handler invoked on uncaught route/middleware errors.
   * @param handler @type {ErrorHandler} - The error handler function to register.
   * @returns @type {void} - The underlying Node `Server` instance.
   */
  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  private handleGlobalError(err: Error, req: AerixRequest, res: AerixResponse): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(err, req, res, () => { }); // prettier-ignore
        return;
      } catch (handlerErr) {
        process.stderr.write(`Error in error handler: ${String(handlerErr)}\n`);
      }
    }

    if (!res.headersSent) {
      if (err instanceof HttpException) {
        const { payload, status, message } = err;
        let safePayload: string | number | boolean | null | { [key: string]: unknown } | unknown[] | { error: string } =
          { error: message };

        if (payload === null || ['string', 'number', 'boolean'].includes(typeof payload)) {
          safePayload = payload as string | number | boolean | null;
        } else if (Array.isArray(payload) || typeof payload === 'object') {
          safePayload = payload as unknown[] | { [key: string]: unknown };
        }

        res.status(status).json(safePayload as never);
      } else {
        process.stderr.write(`Unhandled error: ${String(err)}\n`);
        res.status(500).send('Internal Server Error');
      }
    }
  }

  /**
   * Registers any controllers discovered via decorators.
   * Typically invoked automatically on first request.
   * @returns @type {void} - The underlying Node `Server` instance.
   */
  registerDecoratedControllers(): void {
    for (const ctrl of getRegisteredControllers()) {
      const instance = ctrl.instance as Record<
        string,
        (req: AerixRequest, res: AerixResponse, next?: (err?: Error) => void) => unknown
      >;

      for (const r of ctrl.routes) {
        const fullPath = `${ctrl.basePath}${r.path}`.replace(/\/+/g, '/');
        const methodRef = instance[r.propertyKey];

        const boundHandler = (req: AerixRequest, res: AerixResponse, next?: (err?: Error) => void) => {
          if (typeof methodRef !== 'function') {
            next?.(new Error(`Handler ${String(r.propertyKey)} is not a function`));
            return;
          }

          const result = methodRef.call(instance, req, res, next);
          if (result && typeof result === 'object' && 'then' in result) {
            void (result as Promise<unknown>).catch(e => next?.(e instanceof Error ? e : new Error(String(e))));
          }
        };

        const method = r.method.toLowerCase() as keyof this;
        // @ts-expect-error runtime dispatch to method name
        this[method](fullPath, boundHandler, r.schema);
      }
    }
  }
}
