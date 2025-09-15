import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
import { Router } from './router';
import { enhanceRequest, parseBody } from './request';
import { enhanceResponse } from './response';
import { BlazeRequest, BlazeResponse, Handler, ErrorHandler } from './types';

export class Blaze extends Router {
    private server?: Server;
    private errorHandlers: ErrorHandler[] = [];

    constructor() {
        super();
    }

    listen(port: number, callback?: () => void): Server {
        this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
            const blazeReq = enhanceRequest(req);
            const blazeRes = enhanceResponse(res);

            try {
                if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
                    await parseBody(blazeReq);
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
                handler(err, req, res, () => { });
                return;
            } catch (handlerErr) {
                console.error('Error in error handler:', handlerErr);
            }
        }

        console.error('Unhandled error:', err);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
}