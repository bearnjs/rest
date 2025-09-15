import { createServer } from 'http';

import { getRegisteredControllers } from '../decorators';
import { HttpException } from '../exceptions';
import { enhanceRequest, parseBody } from '../http/request';
import { enhanceResponse } from '../http/response';
import { Router } from '../routing/router';

import type { BlazeRequest, BlazeResponse, ErrorHandler } from '../types';
import type { Server, IncomingMessage, ServerResponse } from 'http';

export class BlazeApp extends Router {
  private server?: Server;
  private errorHandlers: ErrorHandler[] = [];

  listen(port: number, callback?: () => void): Server {
    this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const blazeReq = enhanceRequest(req);
      const blazeRes = enhanceResponse(res);

      try {
        if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
          await parseBody(blazeReq);
        }

        if ((this as any).__decoratorsRegistered !== true) {
          this.registerDecoratedControllers();
          (this as any).__decoratorsRegistered = true;
        }
        await this.handle(blazeReq, blazeRes);
      } catch (err) {
        this.handleGlobalError(err, blazeReq, blazeRes);
      }
    });

    this.server.listen(port, callback);
    return this.server;
  }

  close(callback?: (err?: Error) => void): void {
    if (this.server) {
      this.server.close(callback);
    }
  }

  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  private handleGlobalError(err: any, req: BlazeRequest, res: BlazeResponse): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(err, req, res, () => {});
        return;
      } catch (handlerErr) {
        console.error('Error in error handler:', handlerErr);
      }
    }

    if (!res.headersSent) {
      if (err instanceof HttpException) {
        const body = err.payload ?? { error: err.message };
        res.status(err.status).json(body);
      } else {
        console.error('Unhandled error:', err);
        res.status(500).send('Internal Server Error');
      }
    }
  }

  registerDecoratedControllers(): void {
    const controllers = getRegisteredControllers();
    for (const ctrl of controllers) {
      for (const r of ctrl.routes) {
        const fullPath = `${ctrl.basePath}${r.path}`.replace(/\/+/g, '/');
        const boundHandler = (req: BlazeRequest, res: BlazeResponse, next: any) => {
          const result = (ctrl.instance as any)[r.propertyKey](req, res, next);
          if (result && typeof (result as any).then === 'function') {
            (result as Promise<any>).catch(next);
          }
        };
        const method = r.method.toUpperCase() as any;
        (this as any)[method.toLowerCase()](fullPath, boundHandler, r.schema);
      }
    }
  }
}
