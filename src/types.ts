import type { IncomingMessage, ServerResponse } from 'http';

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

export type Handler = (
  req: BlazeRequest,
  res: BlazeResponse,
  next: NextFunction,
) => void | Promise<void>;

export type ErrorHandler = (
  err: any,
  req: BlazeRequest,
  res: BlazeResponse,
  next: NextFunction,
) => void;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface Route {
  method: HttpMethod;
  path: string;
  handler: Handler;
  regex?: RegExp;
  paramNames?: string[];
  schema?: RouteSchema | undefined;
}

// Decorator metadata types
export type ControllerClass = { new (...args: any[]): any };
export interface RouteDefinition {
  method: HttpMethod | string;
  path: string;
  propertyKey: string;
  schema?: RouteSchema;
}

// Simple schema representation to feed OpenAPI
export interface RouteSchema {
  summary?: string;
  description?: string;
  tags?: string[];
  params?: Record<string, { type: string; description?: string; required?: boolean }>;
  query?: Record<string, { type: string; description?: string; required?: boolean }>;
  body?: { type: string; properties?: Record<string, any>; required?: string[] };
  responses?: Record<string, { description?: string; content?: any }>;
}

// Strongly typed request/response helpers for route authors
export type TypedRequest<
  TParams extends Record<string, any> = Record<string, string>,
  TQuery extends Record<string, any> = Record<string, string>,
  TBody = unknown,
> = Omit<BlazeRequest, 'params' | 'query' | 'body'> & {
  params: TParams;
  query: TQuery;
  body: TBody;
};

export type TypedResponse<TResponse = unknown> = Omit<BlazeResponse, 'json'> & {
  json(data: TResponse): void;
};

export type RouteHandler<
  TParams extends Record<string, any> = Record<string, string>,
  TQuery extends Record<string, any> = Record<string, string>,
  TBody = unknown,
  TResponse = unknown,
> = (
  req: TypedRequest<TParams, TQuery, TBody>,
  res: TypedResponse<TResponse>,
  next: NextFunction,
) => void | Promise<void>;
