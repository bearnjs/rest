import { createServer } from 'http';

import { getRegisteredControllers } from '../decorators';
import { HttpException } from '../exceptions';
import { enhanceRequest, parseBody } from '../http/request';
import { enhanceResponse } from '../http/response';
import { Router } from '../routing/router';
import { NetworkType } from '../types';
import { createCorsMiddleware } from './cors';
import { printStartupLog } from './logging';
import { resolveListenAddresses } from './network';

import type { AppOptions, BlazeRequest, BlazeResponse, ErrorHandler, Handler, ListenInfo, Route } from '../types';
import type { IncomingMessage, Server, ServerResponse } from 'http';

/**
 * The main Blaze application class.
 * Extends the Router class to provide HTTP routing and middleware support.
 * @returns @type {BlazeApp}
 */
export class BlazeApp extends Router {
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
  override use(pathOrHandler: string | Handler, handler?: Handler): void {
    super.use(pathOrHandler as never, handler as never);
  }

  /**
   * Creates a new Blaze application instance.
   * Pass {@link AppOptions} to customize listening, logging, and CORS.
   * @param options @type {AppOptions} - The options for the Blaze application.
   */
  constructor(options: AppOptions = {}) {
    super();
    this.options = options;
    if (options.cors) {
      this.use(createCorsMiddleware(options.cors));
    }
  }

  /**
   * Starts the HTTP server and begins handling requests.
   * Returns the underlying Node `Server` instance.
   * @param callback @type {(info: ListenInfo) => void} - The callback function to call when the server starts.
   * @returns @type {Server} - The underlying Node `Server` instance.
   */
  start(callback?: (info: ListenInfo) => void): Server {
    const options = this.options;
    const port: number = options.port ?? 8000;
    const host: string = options.host ?? 'localhost';

    this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const blazeReq = enhanceRequest(req);
      const blazeRes = enhanceResponse(res);

      void (async () => {
        if (['POST', 'PUT', 'PATCH'].includes(req.method ?? '')) {
          await parseBody(blazeReq);
        }

        if (!this.decoratorsRegistered) {
          this.registerDecoratedControllers();
          this.decoratorsRegistered = true;
        }
        await this.handle(blazeReq, blazeRes);
      })().catch((err: unknown) => {
        this.handleGlobalError(err instanceof Error ? err : new Error(String(err)), blazeReq, blazeRes);
      });
    });

    // Auto-detect network type based on host if not provided
    const effectiveNetworkType: NetworkType =
      options.networkType ??
      (host === '::' ? NetworkType.ipv6 : host === '0.0.0.0' ? NetworkType.both : NetworkType.ipv4);

    const addresses: string[] = resolveListenAddresses(effectiveNetworkType, options.includeInternal ?? false);

    const controllers = getRegisteredControllers();
    const routes = controllers.flatMap(ctrl =>
      ctrl.routes.map(r => ({
        method: r.method,
        path: `${ctrl.basePath}${r.path}`.replace(/\/+/g, '/'),
        handler: r.propertyKey as unknown as Handler,
        schema: r.schema,
      }))
    );

    const backlog = options.backlog;
    if (typeof backlog === 'number') {
      this.server.listen(port, host, backlog, onListen);
    } else {
      this.server.listen(port, host, onListen);
    }

    function onListen(this: Server): void {
      const info: ListenInfo = {
        port,
        addresses,
        routes: routes as Route[],
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid,
      };

      const logOptions: {
        host: string;
        disableLogging?: boolean;
        printRoutes?: boolean;
        logFn?: (message: string) => void;
      } = {
        host,
      };
      if (typeof options.disableLogging !== 'undefined') logOptions.disableLogging = options.disableLogging;
      if (typeof options.printRoutes !== 'undefined') logOptions.printRoutes = options.printRoutes;
      if (typeof options.logFn !== 'undefined') logOptions.logFn = options.logFn;
      // If host is 0.0.0.0/::, prefer showing all non-internal addresses and 'localhost'
      const logInfo = {
        ...info,
        addresses:
          host === '0.0.0.0' || host === '::'
            ? Array.from(new Set([...addresses.filter(a => a !== '127.0.0.1'), 'localhost']))
            : info.addresses,
      } as ListenInfo;
      printStartupLog(logInfo, routes as Route[], logOptions);

      callback?.(info);
    }

    return this.server;
  }

  /** Stops the server if running.
   * @param callback @type {(err?: Error) => void} - The callback function to call when the server stops.
   * @returns @type {void} - The underlying Node `Server` instance.
   */
  close(callback?: (err?: Error) => void): void {
    if (this.server) {
      this.server.close(callback);
    }
  }

  /** Registers a global error handler invoked on uncaught route/middleware errors.
   * @param handler @type {ErrorHandler} - The error handler function to register.
   * @returns @type {void} - The underlying Node `Server` instance.
   */
  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  private handleGlobalError(err: Error, req: BlazeRequest, res: BlazeResponse): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(err, req, res, () => {
          // no-op
        });
        return;
      } catch (handlerErr) {
        process.stderr.write(`Error in error handler: ${String(handlerErr)}\n`);
      }
    }

    if (!res.headersSent) {
      if (err instanceof HttpException) {
        const payload = err.payload;
        let safePayload: string | number | boolean | null | { [key: string]: unknown } | unknown[] | { error: string } =
          { error: err.message };

        if (
          payload === null ||
          typeof payload === 'string' ||
          typeof payload === 'number' ||
          typeof payload === 'boolean'
        ) {
          safePayload = payload;
        } else if (Array.isArray(payload)) {
          safePayload = payload as unknown[];
        } else if (typeof payload === 'object') {
          safePayload = payload as { [key: string]: unknown };
        }

        res.status(err.status).json(safePayload as never);
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
    const controllers = getRegisteredControllers();
    for (const ctrl of controllers) {
      for (const r of ctrl.routes) {
        const fullPath = `${ctrl.basePath}${r.path}`.replace(/\/+/g, '/');
        const boundHandler = (req: BlazeRequest, res: BlazeResponse, next?: (err?: Error) => void) => {
          const methodRef = (
            ctrl.instance as Record<
              string,
              (req: BlazeRequest, res: BlazeResponse, next?: (err?: Error) => void) => unknown
            >
          )[r.propertyKey];
          if (typeof methodRef === 'function') {
            const result = methodRef.call(ctrl.instance, req, res, next);
            if (
              result !== null &&
              (typeof result === 'object' || typeof result === 'function') &&
              'then' in (result as unknown as Record<string, unknown>)
            ) {
              void (result as Promise<unknown>).catch(e => next?.(e instanceof Error ? e : new Error(String(e))));
            }
          } else {
            next?.(new Error(`Handler ${String(r.propertyKey)} is not a function`));
          }
        };
        const method = r.method.toLowerCase() as keyof this;
        // @ts-expect-error runtime dispatch to method name
        this[method](fullPath, boundHandler, r.schema);
      }
    }
  }
}
