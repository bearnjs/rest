import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Represents the options available for setting HTTP cookies.
 * @interface
 */
export interface CookieOptions {
  /**
   * Indicates if the cookie is accessible only through HTTP(S).
   * @type {boolean}
   */
  httpOnly?: boolean;

  /**
   * Indicates if the cookie requires a secure connection (HTTPS).
   * @type {boolean}
   */
  secure?: boolean;

  /**
   * Specifies the maximum age of the cookie in seconds.
   * @type {number}
   */
  maxAge?: number;

  /**
   * Defines the path scope of the cookie.
   * @type {string}
   */
  path?: string;

  /**
   * Defines the domain scope of the cookie.
   * @type {string}
   */
  domain?: string;

  /**
   * Specifies the SameSite attribute of the cookie.
   * @type {'strict' | 'lax' | 'none'}
   */
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Represents the basic JSON primitive types.
 * @typedef {string | number | boolean | null} JsonPrimitive
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * Represents a recursive JSON value type, which can be a primitive, an array, or an object.
 * @typedef {JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }} JsonValue
 */
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/**
 * Utility type to allow a type or an array of that type.
 * @template T
 * @typedef {T | T[]} MaybeArray
 */
export type MaybeArray<T> = T | T[];

/**
 * Represents a set of MIME types for setting content types.
 * @typedef {string} SetContentType
 */
export type SetContentType =
  | 'application/octet-stream'
  | 'application/vnd.ms-fontobject'
  | 'application/epub+zip'
  | 'application/gzip'
  | 'application/json'
  | 'application/ld+json'
  | 'application/ogg'
  | 'application/pdf'
  | 'application/rtf'
  | 'application/wasm'
  | 'application/xhtml+xml'
  | 'application/xml'
  | 'application/zip'
  | 'text/css'
  | 'text/csv'
  | 'text/calendar'
  | 'text/event-stream'
  | 'text/html'
  | 'text/javascript'
  | 'text/plain'
  | 'text/xml'
  | 'image/avif'
  | 'image/bmp'
  | 'image/gif'
  | 'image/x-icon'
  | 'image/jpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'image/tiff'
  | 'image/webp'
  | 'multipart/mixed'
  | 'multipart/alternative'
  | 'multipart/form-data'
  | 'audio/aac'
  | 'audio/x-midi'
  | 'audio/mpeg'
  | 'audio/ogg'
  | 'audio/opus'
  | 'audio/webm'
  | 'video/x-msvideo'
  | 'video/quicktime'
  | 'video/x-ms-wmv'
  | 'video/x-flv'
  | 'video/av1'
  | 'video/mp4'
  | 'video/mpeg'
  | 'video/ogg'
  | 'video/mp2t'
  | 'video/webm'
  | 'video/3gpp'
  | 'video/3gpp2'
  | 'font/otf'
  | 'font/ttf'
  | 'font/woff'
  | 'font/woff2'
  | 'model/gltf+json'
  | 'model/gltf-binary';

/**
 * Represents content type hints and MIME types used in HTTP requests and responses.
 * @typedef {MaybeArray<'none' | 'text' | 'json' | 'formdata' | 'urlencoded' | 'arrayBuffer' | 'text/plain' | 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'application/octet-stream'>} ContentType
 */
export type ContentType = MaybeArray<
  | 'none'
  | 'text'
  | 'json'
  | 'formdata'
  | 'urlencoded'
  | 'arrayBuffer'
  | 'text/plain'
  | 'application/json'
  | 'multipart/form-data'
  | 'application/x-www-form-urlencoded'
  | 'application/octet-stream'
>;

/**
 * Represents a strongly typed record of HTTP headers.
 * @typedef {Record<string, string | number>} HTTPHeaders
 */
export type HTTPHeaders = Record<string, string | number> & {
  'www-authenticate'?: string;
  authorization?: string;
  'proxy-authenticate'?: string;
  'proxy-authorization'?: string;
  age?: string;
  'cache-control'?: string;
  'clear-site-data'?: string;
  expires?: string;
  'no-vary-search'?: string;
  pragma?: string;
  'last-modified'?: string;
  etag?: string;
  'if-match'?: string;
  'if-none-match'?: string;
  'if-modified-since'?: string;
  'if-unmodified-since'?: string;
  vary?: string;
  connection?: string;
  'keep-alive'?: string;
  accept?: string;
  'accept-encoding'?: string;
  'accept-language'?: string;
  expect?: string;
  'max-forwards'?: string;
  cookie?: string;
  'set-cookie'?: string | string[];
  'access-control-allow-origin'?: string;
  'access-control-allow-credentials'?: string;
  'access-control-allow-headers'?: string;
  'access-control-allow-methods'?: string;
  'access-control-expose-headers'?: string;
  'access-control-max-age'?: string;
  'access-control-request-headers'?: string;
  'access-control-request-method'?: string;
  origin?: string;
  'timing-allow-origin'?: string;
  'content-disposition'?: string;
  'content-length'?: string | number;
  'content-type'?: SetContentType | (string & {});
  'content-encoding'?: string;
  'content-language'?: string;
  'content-location'?: string;
  forwarded?: string;
  via?: string;
  location?: string;
  refresh?: string;
  allow?: string;
  server?: 'Elysia' | (string & {});
  'accept-ranges'?: string;
  range?: string;
  'if-range'?: string;
  'content-range'?: string;
  'content-security-policy'?: string;
  'content-security-policy-report-only'?: string;
  'cross-origin-embedder-policy'?: string;
  'cross-origin-opener-policy'?: string;
  'cross-origin-resource-policy'?: string;
  'expect-ct'?: string;
  'permission-policy'?: string;
  'strict-transport-security'?: string;
  'upgrade-insecure-requests'?: string;
  'x-content-type-options'?: string;
  'x-frame-options'?: string;
  'x-xss-protection'?: string;
  'last-event-id'?: string;
  'ping-from'?: string;
  'ping-to'?: string;
  'report-to'?: string;
  te?: string;
  trailer?: string;
  'transfer-encoding'?: string;
  'alt-svg'?: string;
  'alt-used'?: string;
  date?: string;
  dnt?: string;
  'early-data'?: string;
  'large-allocation'?: string;
  link?: string;
  'retry-after'?: string;
  'service-worker-allowed'?: string;
  'source-map'?: string;
  upgrade?: string;
  'x-dns-prefetch-control'?: string;
  'x-forwarded-for'?: string;
  'x-forwarded-host'?: string;
  'x-forwarded-proto'?: string;
  'x-powered-by'?: 'Elysia' | (string & {});
  'x-request-id'?: string;
  'x-requested-with'?: string;
  'x-robots-tag'?: string;
  'x-ua-compatible'?: string;
};

/**
 * Represents an augmented Node.js IncomingMessage with additional properties and methods for convenience.
 * @interface
 * @extends IncomingMessage
 * @template TParams, TQuery, TBody
 */
export interface Request<
  TParams extends Record<string, string> = Record<string, string>,
  TQuery extends Record<string, string> = Record<string, string>,
  TBody extends JsonValue = JsonValue,
> extends IncomingMessage {
  /**
   * URL parameters parsed from the route pattern.
   * @type {TParams}
   */
  params: TParams;

  /**
   * Query string parameters.
   * @type {TQuery}
   */
  query: TQuery;

  /**
   * HTTP method used for the request.
   * @type {HttpMethod}
   */
  method?: HttpMethod;

  /**
   * Parsed request body.
   * @type {TBody}
   */
  body?: TBody;

  /**
   * Request URL path.
   * @type {string}
   */
  path?: string;

  /**
   * Raw unparsed request body.
   * @type {string}
   */
  rawBody?: string;

  /**
   * Parsed cookies from the Cookie header.
   * @type {Record<string, string>}
   */
  cookies?: Record<string, string>;

  /**
   * Get the value of a header by name.
   * @function
   * @param {string} name - Header name.
   * @returns {string | string[] | undefined} Header value(s).
   */
  get(name: 'set-cookie'): string[] | undefined;
  get(name: string): string | undefined;

  /**
   * Alias for the get() method.
   * @function
   * @param {string} name - Header name.
   * @returns {string | string[] | undefined} Header value(s).
   */
  header(name: 'set-cookie'): string[] | undefined;
  header(name: string): string | undefined;

  /**
   * Request protocol (http/https).
   * @type {string}
   */
  protocol?: string;

  /**
   * Indicates if the request is made over HTTPS.
   * @type {boolean}
   */
  secure?: boolean;

  /**
   * Remote IP address of the client.
   * @type {string}
   */
  ip?: string;

  /**
   * Proxy IP addresses.
   * @type {string[]}
   */
  ips?: string[];

  /**
   * Hostname from the Host header.
   * @type {string}
   */
  hostname?: string | undefined;

  /**
   * Host header value.
   * @type {string}
   */
  host?: string | undefined;

  /**
   * Remote port of the client.
   * @type {number}
   */
  port?: number | undefined;

  /**
   * Indicates if the response is still fresh.
   * @type {boolean}
   */
  fresh?: boolean;

  /**
   * Indicates if the response is stale.
   * @type {boolean}
   */
  stale?: boolean;

  /**
   * Indicates if the request is an XMLHttpRequest (XHR).
   * @type {boolean}
   */
  xhr?: boolean;

  /**
   * Original request URL.
   * @type {string}
   */
  originalUrl?: string;

  /**
   * Array of subdomains.
   * @type {string[]}
   */
  subdomains: string[];

  /**
   * Get accepted content types.
   * @function
   * @returns {string[]} Array of accepted types.
   */
  accepts(): string[];

  /**
   * Get accepted charsets.
   * @function
   * @returns {string[]} Array of accepted charsets.
   */
  acceptsCharsets(): string[];

  /**
   * Get accepted encodings.
   * @function
   * @returns {string[]} Array of accepted encodings.
   */
  acceptsEncodings(): string[];

  /**
   * Get accepted languages.
   * @function
   * @returns {string[]} Array of accepted languages.
   */
  acceptsLanguages(): string[];
}

/**
 * Represents an augmented Node.js ServerResponse with additional methods similar to Express.
 * @interface
 * @extends ServerResponse
 * @template TResponse
 */
export interface Response<TResponse extends JsonValue = JsonValue> extends ServerResponse {
  /**
   * Send a JSON response.
   * @function
   * @param {TResponse} data - Data to send as JSON.
   * @returns {Response<TResponse>} The response object.
   */
  json(data: TResponse): Response<TResponse>;

  /**
   * Send a response.
   * @function
   * @param {string | Buffer} data - Data to send.
   * @returns {Response<TResponse>} The response object.
   */
  send(data: string | Buffer): Response<TResponse>;

  /**
   * Set the response status code.
   * @function
   * @param {number} code - HTTP status code.
   * @returns {Response<TResponse>} The response object.
   */
  status(code: number): Response<TResponse>;

  /**
   * Send a status code as the response.
   * @function
   * @param {number} code - HTTP status code.
   * @returns {Response<TResponse>} The response object.
   */
  sendStatus(code: number): Response<TResponse>;

  /**
   * Set the Content-Type header.
   * @function
   * @param {SetContentType | string} type - MIME type.
   * @returns {Response<TResponse>} The response object.
   */
  type(type: SetContentType | (string & {})): Response<TResponse>;

  /**
   * Set the Content-Type header (alias for type()).
   * @function
   * @param {SetContentType | string} type - MIME type.
   * @returns {Response<TResponse>} The response object.
   */
  contentType(type: SetContentType | (string & {})): Response<TResponse>;

  /**
   * Redirect to a URL.
   * @function
   * @param {string} url - Redirect target URL.
   * @param {number} [status] - HTTP status code.
   * @returns {Response<TResponse>} The response object.
   */
  redirect(url: string, status?: number): Response<TResponse>;

  /**
   * Set a response header.
   * @function
   * @param {string | HTTPHeaders} field - Header name or object.
   * @param {string | string[] | number} [value] - Header value.
   * @returns {Response<TResponse>} The response object.
   */
  set(field: HTTPHeaders): Response<TResponse>;
  set(field: string, value?: string | string[] | number): Response<TResponse>;
  set<K extends keyof HTTPHeaders>(field: K, value: HTTPHeaders[K]): Response<TResponse>;

  /**
   * Set a response header (alias for set()).
   * @function
   * @param {string | HTTPHeaders} field - Header name or object.
   * @param {string | string[] | number} [value] - Header value.
   * @returns {Response<TResponse>} The response object.
   */
  header(field: HTTPHeaders): Response<TResponse>;
  header(field: string, value?: string | string[] | number): Response<TResponse>;
  header<K extends keyof HTTPHeaders>(field: K, value: HTTPHeaders[K]): Response<TResponse>;

  /**
   * Get a response header.
   * @function
   * @param {string} field - Header name.
   * @returns {string | undefined} The header value.
   */
  get(field: string): string | undefined;
  get<K extends keyof HTTPHeaders>(field: K): HTTPHeaders[K] | undefined;

  /**
   * Append a value to a response header.
   * @function
   * @param {string} field - Header name.
   * @param {string | string[] | number} [value] - Value to append.
   * @returns {Response<TResponse>} The response object.
   */
  append(field: string, value?: string[] | string | number): Response<TResponse>;
  append<K extends keyof HTTPHeaders>(field: K, value?: HTTPHeaders[K]): Response<TResponse>;

  /**
   * Set Link headers.
   * @function
   * @param {Record<string, string>} links - Object of link relations.
   * @returns {Response<TResponse>} The response object.
   */
  links(links: Record<string, string>): Response<TResponse>;

  /**
   * Set the Location header.
   * @function
   * @param {string} url - URL to set in Location header.
   * @returns {Response<TResponse>} The response object.
   */
  location(url: string): Response<TResponse>;

  /**
   * Add a field to the Vary header.
   * @function
   * @param {string} field - Header to vary on.
   * @returns {Response<TResponse>} The response object.
   */
  vary(field: string): Response<TResponse>;

  /**
   * Send a JSONP response.
   * @function
   * @param {JsonValue} data - Data to send as JSONP.
   * @returns {Response<TResponse>} The response object.
   */
  jsonp(data: JsonValue): Response<TResponse>;

  /**
   * Set a cookie.
   * @function
   * @param {string} name - Cookie name.
   * @param {string} value - Cookie value.
   * @param {CookieOptions} [options] - Cookie options.
   * @returns {Response<TResponse>} The response object.
   */
  cookie(name: string, value: string, options?: CookieOptions): Response<TResponse>;

  /**
   * Clear a cookie.
   * @function
   * @param {string} name - Cookie name.
   * @param {CookieOptions} [options] - Cookie options.
   * @returns {Response<TResponse>} The response object.
   */
  clearCookie(name: string, options?: CookieOptions): Response<TResponse>;
}

/**
 * Callback function to signal completion or error in middleware/handlers.
 * @callback NextFunction
 * @param {Error} [err] - Optional error to pass to the next error handler.
 */
export type NextFunction = (err?: Error) => void;

/**
 * Represents a request handler signature.
 * @template TParams, TQuery, TBody, TRes
 * @typedef {function} Handler
 * @param {Request<TParams, TQuery, TBody>} req - Request object.
 * @param {Response<TRes>} res - Response object.
 * @param {NextFunction} [next] - Next function.
 * @returns {void | Response<TRes> | Promise<void | Response<TRes>>} Handler result.
 */
export type Handler<
  TParams extends Record<string, string> = Record<string, string>,
  TQuery extends Record<string, string> = Record<string, string>,
  TBody extends JsonValue = JsonValue,
  TRes extends JsonValue = JsonValue,
> = {
  (
    req: Request<TParams, TQuery, TBody>,
    res: Response<TRes>,
    next?: NextFunction
  ): void | Response<TRes> | Promise<void | Response<TRes>>;
} & {
  (req: Request, res: Response, next?: NextFunction): void | Response | Promise<void | Response>;
};

/**
 * Global error handler signature.
 * @param err Error being handled
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns ErrorHandler
 */
export type ErrorHandler<
  TParams extends Record<string, string> = Record<string, string>,
  TQuery extends Record<string, string> = Record<string, string>,
  TBody extends JsonValue = JsonValue,
  TRes extends JsonValue = JsonValue,
> = {
  (err: Error, req: Request<TParams, TQuery, TBody>, res: Response<TRes>, next?: NextFunction): void;
} & {
  (err: Error, req: Request, res: Response, next?: NextFunction): void;
};

/**
 * Represents the basic HTTP methods used in requests.
 * @typedef {string} HttpMethod
 * @example
 * // Example usage:
 * const method: HttpMethod = 'GET';
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Represents an extended set of HTTP methods, including those used by various specifications and proxies.
 * @typedef {string} HTTPMethod
 * @example
 * // Example usage:
 * const method: HTTPMethod = 'CONNECT';
 */
export type HTTPMethod =
  | (string & {})
  | 'ACL'
  | 'BIND'
  | 'CHECKOUT'
  | 'CONNECT'
  | 'COPY'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'LINK'
  | 'LOCK'
  | 'M-SEARCH'
  | 'MERGE'
  | 'MKACTIVITY'
  | 'MKCALENDAR'
  | 'MKCOL'
  | 'MOVE'
  | 'NOTIFY'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PROPFIND'
  | 'PROPPATCH'
  | 'PURGE'
  | 'PUT'
  | 'REBIND'
  | 'REPORT'
  | 'SEARCH'
  | 'SOURCE'
  | 'SUBSCRIBE'
  | 'TRACE'
  | 'UNBIND'
  | 'UNLINK'
  | 'UNLOCK'
  | 'UNSUBSCRIBE'
  | 'ALL';

/**
 * Describes a route registered at runtime, including its method, path, and handler.
 * @interface Route
 */
export interface Route {
  /**
   * The HTTP method for the route.
   * @type {HttpMethod}
   */
  method: HttpMethod;
  /**
   * The URL path pattern for the route.
   * @type {string}
   */
  path: string;
  /**
   * The function that handles requests to this route.
   * @type {Handler}
   */
  handler: Handler;
  /**
   * A compiled regular expression for the path, if applicable.
   * @type {RegExp}
   */
  regex?: RegExp;
  /**
   * Names of parameters extracted from the path.
   * @type {string[]}
   */
  paramNames?: string[];
  /**
   * Metadata describing the route's schema.
   * @type {RouteSchema}
   */
  schema?: RouteSchema | undefined;
  /**
   * Middlewares that run before the route handler.
   * @type {Handler[]}
   */
  middlewares?: Handler[];
}

/**
 * Provides information about the server when it starts listening.
 * @interface ListenInfo
 */
export interface ListenInfo {
  /**
   * The port number the server is listening on.
   * @type {number}
   */
  port: number;
  /**
   * The addresses the server is bound to.
   * @type {string[]}
   */
  addresses: string[];
  /**
   * The routes available on the server.
   * @type {Route[]}
   */
  routes: Route[];
  /**
   * The timestamp when the server started.
   * @type {string}
   */
  timestamp: string;
  /**
   * The version of Node.js the server is running on.
   * @type {string}
   */
  nodeVersion: string;
  /**
   * The platform the server is running on.
   * @type {string}
   */
  platform: string;
  /**
   * The process ID of the server.
   * @type {number}
   */
  pid: number;
}

/**
 * Options for configuring server behavior and logging during startup.
 * @interface AppOptions
 */
export interface AppOptions {
  /**
   * The name of the application.
   * @type {string}
   */
  appName?: string;
  /**
   * The version of the application.
   * @type {string}
   */
  appVersion?: string;
  /**
   * A brief description of the application.
   * @type {string}
   */
  appDescription?: string;
  /**
   * The host address the server should listen on.
   * @type {string}
   */
  host?: string;
  /**
   * The port number the server should listen on.
   * @type {number}
   */
  port?: number;
  /**
   * Whether to disable logging during startup.
   * @type {boolean}
   */
  disableLogging?: boolean;
  /**
   * Whether to print the route table on startup.
   * @type {boolean}
   */
  printRoutes?: boolean;
  /**
   * Whether to include internal routes in the printed table.
   * @type {boolean}
   */
  includeInternal?: boolean;
  /**
   * The size of the listen backlog.
   * @type {number}
   */
  backlog?: number;
  /**
   * The CORS configuration for the server.
   * @type {CorsOptions | false}
   */
  cors?: CorsOptions | false;
  /**
   * A global prefix to apply to all application routes.
   * @type {string}
   * @example
   * // Example usage:
   * const options: AppOptions = { rootPrefix: '/api' };
   */
  rootPrefix?: string;
}

/**
 * Configuration options for CORS middleware.
 * @interface CorsOptions
 */
export interface CorsOptions {
  /**
   * The origins allowed to access the server.
   * @type {string | RegExp | (string | RegExp)[]}
   */
  origin?: string | RegExp | (string | RegExp)[];
  /**
   * The HTTP methods allowed for CORS requests.
   * @type {HTTPMethod[]}
   */
  methods?: HTTPMethod[];
  /**
   * The headers allowed in CORS requests.
   * @type {string[]}
   */
  headers?: string[];
  /**
   * Whether credentials are allowed in CORS requests.
   * @type {boolean}
   */
  credentials?: boolean;
  /**
   * The headers exposed to the client in CORS responses.
   * @type {string[]}
   */
  exposeHeaders?: string[];
  /**
   * The maximum age for preflight requests in seconds.
   * @type {number}
   */
  maxAgeSeconds?: number;
}

/**
 * Represents a class constructor for a controller.
 * @typedef {ControllerClass}
 */
export type ControllerClass = { new(...args: never[]): object }; // prettier-ignore

/**
 * Metadata for defining routes using decorators.
 * @interface RouteDefinition
 */
export interface RouteDefinition {
  /**
   * The HTTP method for the route.
   * @type {HttpMethod}
   */
  method: HttpMethod;
  /**
   * The URL path pattern for the route.
   * @type {string}
   */
  path: string;
  /**
   * The name of the controller method handling the route.
   * @type {string}
   */
  propertyKey: string;
  /**
   * Metadata describing the route's schema.
   * @type {RouteSchema}
   */
  schema?: RouteSchema;
  /**
   * Middlewares to run before the route handler.
   * @type {Handler[]}
   */
  middlewares?: Handler[];
}

/**
 * A minimal schema structure for generating OpenAPI documentation.
 * @interface RouteSchema
 */
export interface RouteSchema {
  /**
   * A short summary of the route.
   * @type {string}
   */
  summary?: string;
  /**
   * A detailed description of the route.
   * @type {string}
   */
  description?: string;
  /**
   * Tags for categorizing the route in OpenAPI documentation.
   * @type {string[]}
   */
  tags?: string[];
  /**
   * Schemas for URL parameters.
   * @type {Record<string, { type: string; description?: string; required?: boolean }>}
   */
  params?: Record<string, { type: string; description?: string; required?: boolean }>;
  /**
   * Schemas for query parameters.
   * @type {Record<string, { type: string; description?: string; required?: boolean }>}
   */
  query?: Record<string, { type: string; description?: string; required?: boolean }>;
  /**
   * Schema for the request body.
   * @type {{ type: string; properties?: Record<string, JsonValue>; required?: string[] }}
   */
  body?: {
    type: string;
    properties?: Record<string, JsonValue>;
    required?: string[];
  };
  /**
   * Schemas for responses.
   * @type {Record<string, { description?: string; content?: JsonValue }>}
   */
  responses?: Record<string, { description?: string; content?: JsonValue }>;
}

/**
 * Defines a strongly-typed route handler function.
 * @typedef {RouteHandler}
 * @param {TParams} TParams - The type of the URL parameters.
 * @param {TQuery} TQuery - The type of the query parameters.
 * @param {TBody} TBody - The type of the request body.
 * @param {TResponse} TResponse - The type of the response.
 */
export type RouteHandler<
  TParams extends Record<string, string> = Record<string, string>,
  TQuery extends Record<string, string> = Record<string, string>,
  TBody extends JsonValue = JsonValue,
  TResponse extends JsonValue = JsonValue,
> = (
  req: Request<TParams, TQuery, TBody>,
  res: Response<TResponse>,
  next: NextFunction
) => void | Response | Promise<void | Response>;

/**
 * Extracts path parameter names into a record type.
 * @typedef {ExtractPathParams}
 * @param {TPath} TPath - The type of the path.
 * @example
 * // Example usage:
 * type Params = ExtractPathParams<'/users/:id/books/:bookId'>;
 * // Result: { id: string; bookId: string }
 */
export type ExtractPathParams<TPath extends string> = TPath extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractPathParams<`/${Rest}`>
  : TPath extends `${infer _Start}:${infer Param}`
  ? { [K in Param]: string } // prettier-ignore
  : Record<string, never>; // prettier-ignore

/**
 * Defines a handler inferred from the literal path, supporting both standard and typed handlers.
 * @typedef {PathHandler}
 * @param {TPath} TPath - The type of the path.
 * @param {TResponse} TResponse - The type of the response.
 */
export type PathHandler<TPath extends string, TResponse extends JsonValue = JsonValue> =
  | Handler<ExtractPathParams<TPath>, Record<string, string>, JsonValue, TResponse>
  | RouteHandler<ExtractPathParams<TPath>, Record<string, string>, JsonValue, TResponse>;

/**
 * Options for creating a Router, allowing configuration of a base prefix, middlewares, and metadata.
 * @interface RouterOptions
 */
export interface RouterOptions {
  /**
   * An optional path prefix applied when the router is mounted without an explicit path.
   * @type {string}
   */
  prefix?: string;
  /**
   * Middlewares to register on the router upon creation.
   * @type {Handler[]}
   */
  middlewares?: Handler[];
  /**
   * A human-friendly name for tooling purposes.
   * @type {string}
   */
  name?: string;
  /**
   * A description for documentation or printing purposes.
   * @type {string}
   */
  description?: string;
}
