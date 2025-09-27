import { createServer } from 'http';

import { getRegisteredControllers } from '../decorators';
import { HttpException } from '../exceptions';
import { printStartupLog } from './logging';
import { createCorsMiddleware } from './middlewares/cors';
import { requestLogger } from './middlewares/requestLogeer';
import { enhanceRequest, parseBody } from '../http/request';
import { enhanceResponse } from '../http/response';
import { Router } from '../routing/router';

import type { AppOptions, Request, Response, ErrorHandler, Handler, ListenInfo, Route, RouterOptions } from '../types';
import type { Server } from 'http';

/**
 * @class BearnApp
 * @augments Router
 * This class represents a Bearn application, which is an extension of the Router class.
 * It provides methods to configure and start an HTTP server with middleware support.
 */
export class BearnApp extends Router {
  /**
   * @private
   * @type {Server | undefined}
   * The HTTP server instance.
   */
  private server?: Server;

  /**
   * @private
   * @type {ErrorHandler[]}
   * A list of global error handlers.
   */
  private errorHandlers: ErrorHandler[] = [];

  /**
   * @private
   * @type {boolean}
   * Flag to check if decorators have been registered.
   */
  private decoratorsRegistered = false;

  /**
   * @private
   * @type {AppOptions}
   * Configuration options for the Bearn application.
   */
  private appOptions: AppOptions = {};

  /**
   * Registers a middleware or router.
   * @override
   * @param {string | Handler | Router} pathOrHandler - The path prefix or handler.
   * @param {Handler | Router} [handler] - The middleware handler or router.
   */
  override use(handler: Handler): void;
  override use(path: string, handler: Handler): void;
  override use(path: string, router: Router): void;
  override use(router: Router): void;
  override use(pathOrHandler: string | Handler | Router, handler?: Handler | Router): void {
    super.use(pathOrHandler as never, handler as never);
  }

  /**
   * Constructs a new Bearn application instance.
   * @param {AppOptions} [options={}] - The options for the Bearn application.
   */
  constructor(options: AppOptions = {}) {
    const routerOptions: RouterOptions | undefined = options.rootPrefix ? { prefix: options.rootPrefix } : undefined;
    super(routerOptions);
    this.appOptions = options;
    if (options.cors) {
      this.use(createCorsMiddleware(options.cors));
    }
    if (!options.disableLogging) {
      this.use(requestLogger);
    }
  }

  /**
   * Starts the HTTP server and begins handling requests.
   * @function
   * @param {(info: ListenInfo) => void} [callback] - The callback function to call when the server starts.
   * @returns {Server} The underlying Node `Server` instance.
   */
  start(callback?: (info: ListenInfo) => void): Server {
    const { host: configHost, port = 8000, backlog, appName, appVersion } = this.appOptions;

    let host = configHost;
    if (host === '[::]') host = '::';
    else if (host === '[::1]') host = '::1';

    this.server = createServer((req, res) => {
      const BearnReq = enhanceRequest(req);
      const BearnRes = enhanceResponse(res);

      void (async () => {
        if (['POST', 'PUT', 'PATCH'].includes(req.method ?? '')) {
          await parseBody(BearnReq);
        }

        if (!this.decoratorsRegistered) {
          this.registerDecoratedControllers();
          this.decoratorsRegistered = true;
        }
        await this.handle(BearnReq, BearnRes);
      })().catch((err: unknown) => {
        this.handleGlobalError(err instanceof Error ? err : new Error(String(err)), BearnReq, BearnRes);
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
        appName: appName ?? 'Bearn',
        appVersion: appVersion ?? '0.1.0',
      };

      const { disableLogging, printRoutes } = this.appOptions;
      const logOptions = {
        host: originalHost ?? 'localhost',
        disableLogging: disableLogging ?? false,
        printRoutes: printRoutes ?? false,
        appName: appName ?? 'Bearn',
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

  /**
   * Stops the server if running.
   * @function
   * @param {(err?: Error) => void} [callback] - The callback function to call when the server stops.
   */
  close(callback?: (err?: Error) => void): void {
    this.server?.close(callback);
  }

  /**
   * Registers a global error handler invoked on uncaught route/middleware errors.
   * @function
   * @param {ErrorHandler} handler - The error handler function to register.
   */
  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Handles global errors by invoking registered error handlers.
   * @private
   * @param {Error} err - The error to handle.
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   */
  private handleGlobalError(err: Error, req: Request, res: Response): void {
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
   * @function
   */
  registerDecoratedControllers(): void {
    for (const ctrl of getRegisteredControllers()) {
      const instance = ctrl.instance as Record<
        string,
        (req: Request, res: Response, next?: (err?: Error) => void) => unknown
      >;

      for (const r of ctrl.routes) {
        const fullPath = `${ctrl.basePath}${r.path}`.replace(/\/+/g, '/');
        const methodRef = instance[r.propertyKey];

        const boundHandler = (req: Request, res: Response, next?: (err?: Error) => void) => {
          if (typeof methodRef !== 'function') {
            next?.(new Error(`Handler ${String(r.propertyKey)} is not a function`));
            return;
          }

          const run = () => methodRef.call(instance, req, res, next);
          const mws = r.middlewares ?? [];
          if (mws.length > 0) {
            let i = 0;
            const runNext = (err?: Error) => {
              if (err) return next?.(err);
              const mw = mws[i++];
              if (!mw) {
                const out = run();
                if (out && typeof out === 'object' && 'then' in out) {
                  void (out as Promise<unknown>).catch(e => next?.(e instanceof Error ? e : new Error(String(e))));
                }
                return;
              }
              try {
                const maybe = mw(req, res, runNext);
                if (maybe && typeof maybe === 'object' && 'then' in maybe) {
                  void (maybe as Promise<unknown>).catch(e => runNext(e instanceof Error ? e : new Error(String(e))));
                }
              } catch (e) {
                runNext(e instanceof Error ? e : new Error(String(e)));
              }
            };
            runNext();
            return;
          }

          const result = run();
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
