import { ServerResponse } from 'http';
import { BlazeResponse } from './types';

export function enhanceResponse(res: ServerResponse): BlazeResponse {
    const blazeRes = res as BlazeResponse;

    blazeRes.json = function (data: any): void {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(data));
    };

    blazeRes.send = function (data: string | Buffer): void {
        if (typeof data === 'string') {
            this.setHeader('Content-Type', 'text/html');
        }
        this.end(data);
    };

    blazeRes.status = function (code: number): BlazeResponse {
        this.statusCode = code;
        return this;
    };

    blazeRes.redirect = function (url: string): void {
        this.statusCode = 302;
        this.setHeader('Location', url);
        this.end();
    };

    return blazeRes;
}