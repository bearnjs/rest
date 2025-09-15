import { IncomingMessage, ServerResponse } from 'http';

export interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    maxAge?: number;
}

export interface BlazeRequest extends IncomingMessage {
    params?: Record<string, string>;
    query?: Record<string, string>;
    body?: any;
    path?: string;
}

export interface BlazeResponse extends ServerResponse {
    json(data: any): void;
    send(data: string | Buffer): void;
    status(code: number): BlazeResponse;
    redirect(url: string): void;
    cookie(name: string, value: string, options?: CookieOptions): void;
}

export type NextFunction = (err?: any) => void;

export type Handler = (req: BlazeRequest, res: BlazeResponse, next: NextFunction) => void;

export type ErrorHandler = (err: any, req: BlazeRequest, res: BlazeResponse, next: NextFunction) => void;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface Route {
    method: HttpMethod;
    path: string;
    handler: Handler;
    regex?: RegExp;
    paramNames?: string[];
}
