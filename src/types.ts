import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Options for setting HTTP cookies.
 * @param httpOnly Whether the cookie is only accessible via HTTP(S)
 * @param secure Whether the cookie requires HTTPS
 * @param maxAge Maximum age of the cookie in seconds
 */
export interface CookieOptions {
  /** Whether the cookie is only accessible via HTTP(S)
   * @returns boolean
   */
  httpOnly?: boolean;
  /** Whether the cookie requires HTTPS
   * @returns boolean
   */
  secure?: boolean;
  /** Maximum age of the cookie in seconds
   * @returns number
   */
  maxAge?: number;
  /** Cookie path scope
   * @returns string
   */
  path?: string;
  /** Cookie domain scope
   * @returns string
   */
  domain?: string;
  /** SameSite attribute
   * @returns 'strict' | 'lax' | 'none'
   */
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * JSON primitive types
 * @param string String value
 * @param number Number value
 * @param boolean Boolean value
 * @param null Null value
 * @returns JsonPrimitive
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * Recursive JSON value type
 * @param JsonPrimitive The primitive JSON value
 * @param JsonValue[] The array of JSON values
 * @param { [key: string]: JsonValue } The object of JSON values
 * @returns JsonValue
 */
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/** Utility to allow a type or an array of that type */
export type MaybeArray<T> = T | T[];
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
 * Content type hints and MIME types used in requests/responses
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
 * Strongly typed HTTP headers record
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
 * Augmented Node IncomingMessage with framework conveniences.
 * Extends the base Node IncomingMessage with additional properties and methods.
 * @returns Request
 */
export interface Request<
  TParams extends Record<string, string> = Record<string, string>,
  TQuery extends Record<string, string> = Record<string, string>,
  TBody extends JsonValue = JsonValue,
> extends IncomingMessage {
  /** URL parameters parsed from route pattern
   * @returns URL parameters parsed from route pattern
   */
  params: TParams;

  /** Query string parameters
   * @returns Query string parameters
   */
  query: TQuery;

  /** HTTP method
   * @returns HTTP method
   */
  method?: HttpMethod;

  /** Parsed request body
   * @returns Parsed request body
   */
  body?: TBody | string | Buffer | Record<string, string>;

  /** Request URL path
   * @returns Request URL path
   */
  path?: string;

  /** Raw unparsed request body
   * @returns Raw unparsed request body
   */
  rawBody?: string;

  /** Parsed cookies from Cookie header
   * @returns Map of cookie name to value
   */
  cookies?: Record<string, string>;

  /**
   * Get header value by name
   * @param name Header name
   * @returns Header value(s)
   */
  get(name: 'set-cookie'): string[] | undefined;
  get(name: string): string | undefined;

  /**
   * Alias for get()
   * @param name Header name
   * @returns Header value(s)
   */
  header(name: 'set-cookie'): string[] | undefined;
  header(name: string): string | undefined;

  /** Request protocol (http/https)
   * @returns Request protocol (http/https)
   */
  protocol?: string;

  /** Whether request is HTTPS
   * @returns Whether request is HTTPS
   */
  secure?: boolean;

  /** Remote IP address
   * @returns Remote IP address
   */
  ip?: string;

  /** Proxy IP addresses
   * @returns Proxy IP addresses
   */
  ips?: string[];

  /** Hostname from Host header
   * @returns Hostname from Host header
   */
  hostname?: string | undefined;

  /** Host header value
   * @returns Host header value
   */
  host?: string | undefined;

  /** Remote port
   * @returns Remote port
   */
  port?: number | undefined;

  /** Whether response is still fresh
   * @returns Whether response is still fresh
   */
  fresh?: boolean;

  /** Whether response is stale
   * @returns Whether response is stale
   */
  stale?: boolean;

  /** Whether request is XHR
   * @returns Whether request is XHR
   */
  xhr?: boolean;

  /** Original request URL
   * @returns Original request URL
   */
  originalUrl?: string;

  /** Array of subdomains
   * @returns Array of subdomains
   */
  subdomains: string[];

  /**
   * Get accepted content types
   * @returns Array of accepted types
   */
  accepts(): string[];

  /**
   * Get accepted charsets
   * @returns Array of accepted charsets
   */
  acceptsCharsets(): string[];

  /**
   * Get accepted encodings
   * @returns Array of accepted encodings
   */
  acceptsEncodings(): string[];

  /**
   * Get accepted languages
   * @returns Array of accepted languages
   */
  acceptsLanguages(): string[];
}

/**
 * Augmented Node ServerResponse with Express-like helpers.
 * Extends the base Node ServerResponse with additional methods.
 * @returns Response
 */
export interface Response<TResponse extends JsonValue = JsonValue> extends ServerResponse {
  /**
   * Send a JSON response
   * @param data Data to send as JSON
   * @returns Response
   */
  json(data: TResponse): Response<TResponse>;

  /**
   * Send a response
   * @param data Data to send
   * @returns Response
   */
  send(data: string | Buffer): Response<TResponse>;

  /**
   * Set response status code
   * @param code HTTP status code
   * @returns Response
   */
  status(code: number): Response<TResponse>;

  /**
   * Send status code as response
   * @param code HTTP status code
   * @returns Response
   */
  sendStatus(code: number): Response<TResponse>;

  /**
   * Set Content-Type header
   * @param type MIME type
   * @returns Response
   */
  type(type: SetContentType | (string & {})): Response<TResponse>;

  /**
   * Set Content-Type header
   * @param type MIME type
   * @returns Response
   */
  contentType(type: SetContentType | (string & {})): Response<TResponse>;

  /**
   * Redirect to URL
   * @param url Redirect target URL
   * @param status HTTP status code
   * @returns Response
   */
  redirect(url: string, status?: number): Response<TResponse>;

  /**
   * Set response header
   * @param field Header name or object
   * @param value Header value
   * @returns Response
   */
  set(field: HTTPHeaders): Response<TResponse>;
  set(field: string, value?: string | string[] | number): Response<TResponse>;
  set<K extends keyof HTTPHeaders>(field: K, value: HTTPHeaders[K]): Response<TResponse>;

  /**
   * Set response header (alias for set())
   * @param field Header name or object
   * @param value Header value
   * @returns Response
   */
  header(field: HTTPHeaders): Response<TResponse>;
  header(field: string, value?: string | string[] | number): Response<TResponse>;
  header<K extends keyof HTTPHeaders>(field: K, value: HTTPHeaders[K]): Response<TResponse>;

  /**
   * Get response header
   * @param field Header name
   * @returns Response
   */
  get(field: string): string | undefined;
  get<K extends keyof HTTPHeaders>(field: K): HTTPHeaders[K] | undefined;

  /**
   * Append to response header
   * @param field Header name
   * @param value Value to append
   * @returns Response
   */
  append(field: string, value?: string[] | string | number): Response<TResponse>;
  append<K extends keyof HTTPHeaders>(field: K, value?: HTTPHeaders[K]): Response<TResponse>;

  /**
   * Set Link headers
   * @param links Object of link relations
   * @returns Response
   */
  links(links: Record<string, string>): Response<TResponse>;

  /**
   * Set Location header
   * @param url URL to set in Location header
   * @returns Response
   */
  location(url: string): Response<TResponse>;

  /**
   * Add field to Vary header
   * @param field Header to vary on
   * @returns Response
   */
  vary(field: string): Response<TResponse>;

  /**
   * Send JSONP response
   * @param data Data to send as JSONP
   * @returns Response
   */
  jsonp(data: JsonValue): Response<TResponse>;

  /**
   * Set cookie
   * @param name Cookie name
   * @param value Cookie value
   * @param options Cookie options
   * @returns Response
   */
  cookie(name: string, value: string, options?: CookieOptions): Response<TResponse>;

  /**
   * Clear cookie
   * @param name Cookie name
   * @param options Cookie options
   * @returns Response
   */
  clearCookie(name: string, options?: CookieOptions): Response<TResponse>;
}

/**
 * Callback to signal completion or error in middleware/handlers.
 * @param err Optional error to pass to next error handler
 * @returns NextFunction
 */
export type NextFunction = (err?: Error) => void;

/**
 * Request handler signature.
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns Handler
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

/** HTTP method type */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Extended HTTP method literals aligned with various specifications and proxies
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
 * Registered route definition at runtime.
 * @returns @type {Route}
 */
export interface Route {
  /** HTTP method
   * @returns HTTP method
   */
  method: HttpMethod;
  /** URL path pattern
   * @returns URL path pattern
   */
  path: string;
  /** Route handler function
   * @returns Route handler function
   */
  handler: Handler;
  /** Compiled path regex
   * @returns Compiled path regex
   */
  regex?: RegExp;
  /** Named parameters from path */
  paramNames?: string[];
  /** Route schema metadata
   * @returns Route schema metadata
   */
  /** Route schema metadata */
  schema?: RouteSchema | undefined;
  /** Optional per-route middlewares (run before handler) */
  middlewares?: Handler[];
}

/**
 * Information reported when the server starts listening.
 * @returns @type {ListenInfo}
 */
export interface ListenInfo {
  /**
   * The port of the server.
   * @returns The port of the server.
   */
  port: number;
  /**
   * The addresses of the server.
   * @returns The addresses of the server.
   */
  addresses: string[];
  /**
   * The routes of the server.
   * @returns The routes of the server.
   */
  routes: Route[];
  /**
   * The timestamp of the server.
   * @returns The timestamp of the server.
   */
  timestamp: string;
  /**
   * The node version of the server.
   * @returns The node version of the server.
   */
  nodeVersion: string;
  /**
   * The platform of the server.
   * @returns The platform of the server.
   */
  platform: string;
  /**
   * The process ID of the server.
   * @returns The process ID of the server.
   */
  pid: number;
}

/** Options controlling server listen behavior and startup logging */
/**
 * Options controlling server listen behavior and startup logging
 * @returns @type {AppOptions}
 */
export interface AppOptions {
  /**
   * The name of the application.
   * @returns The name of the application.
   */
  appName?: string;
  /**
   * The version of the application.
   * @returns The version of the application.
   */
  appVersion?: string;
  /**
   * The description of the application.
   * @returns The description of the application.
   */
  appDescription?: string;
  /**
   * The host to listen on.
   * @returns The host to listen on.
   */
  host?: string;
  /**
   * The port to listen on.
   * @returns The port to listen on.
   */
  port?: number;
  /**
   * Whether to disable startup logging.
   * @returns Whether to disable startup logging.
   */
  disableLogging?: boolean;
  /**
   * Whether to print route table on startup.
   * @returns Whether to print route table on startup.
   */
  printRoutes?: boolean;
  /** Include internal routes in table
   * @returns Include internal routes in table
   */
  includeInternal?: boolean;
  /**
   * The listen backlog size.
   * @returns The listen backlog size.
   */
  backlog?: number;
  /**
   * The CORS configuration.
   * @returns The CORS configuration.
   */
  cors?: CorsOptions | false;
  /**
   * A global prefix to apply to all application routes.
   * Example: '/api' prefixes every route.
   */
  rootPrefix?: string;
}

/** CORS configuration passed to the CORS middleware */
/**
 * CORS configuration passed to the CORS middleware
 * @returns @type {CorsOptions}
 */
export interface CorsOptions {
  /**
   * The allowed origins.
   * @returns The allowed origins.
   */
  origin?: string | RegExp | (string | RegExp)[];
  /**
   * The allowed HTTP methods.
   * @returns The allowed HTTP methods.
   */
  methods?: HTTPMethod[];
  /**
   * The allowed headers.
   * @returns The allowed headers.
   */
  headers?: string[];
  /**
   * Whether to allow credentials.
   * @returns Whether to allow credentials.
   */
  credentials?: boolean;
  /**
   * The headers exposed to client.
   * @returns The headers exposed to client.
   */
  exposeHeaders?: string[];
  /**
   * The preflight cache time.
   * @returns The preflight cache time.
   */
  maxAgeSeconds?: number;
}

/**
 * Controller class constructor type
 * @returns @type {ControllerClass}
 */
export type ControllerClass = { new(...args: never[]): object }; // prettier-ignore

/** Declarative route metadata used by decorators */
/**
 * Declarative route metadata used by decorators
 * @returns @type {RouteDefinition}
 */
export interface RouteDefinition {
  /**
   * The HTTP method.
   * @returns The HTTP method.
   */
  method: HttpMethod;
  /**
   * The URL path pattern.
   * @returns The URL path pattern.
   */
  path: string;
  /**
   * The controller method name.
   * @returns The controller method name.
   */
  propertyKey: string;
  /**
   * The route schema metadata.
   * @returns The route schema metadata.
   */
  schema?: RouteSchema;
  /**
   * Middlewares to run before the handler
   */
  middlewares?: Handler[];
}

/**
 * Minimal schema structure usable for OpenAPI generation
 * @param summary The short summary.
 * @param description The detailed description.
 * @param tags The OpenAPI tags.
 * @param params The URL parameter schemas.
 * @param query The query parameter schemas.
 * @param body The request body schema.
 * @param responses The response schemas.
 * @returns @type {RouteSchema}
 */
export interface RouteSchema {
  /**
   * The short summary.
   * @returns The short summary.
   */
  summary?: string;
  /**
   * The detailed description.
   * @returns The detailed description.
   */
  description?: string;
  /**
   * The OpenAPI tags.
   * @returns The OpenAPI tags.
   */
  tags?: string[];
  /**
   * The URL parameter schemas.
   * @returns The URL parameter schemas.
   */
  params?: Record<string, { type: string; description?: string; required?: boolean }>;
  /**
   * The query parameter schemas.
   * @returns The query parameter schemas.
   */
  query?: Record<string, { type: string; description?: string; required?: boolean }>;
  /**
   * The request body schema.
   * @returns The request body schema.
   */
  body?: {
    type: string;
    properties?: Record<string, JsonValue>;
    required?: string[];
  };
  /**
   * The response schemas.
   * @returns The response schemas.
   */
  responses?: Record<string, { description?: string; content?: JsonValue }>;
}

// TypedRequest/TypedResponse removed: use generic Request<TParams, TQuery, TBody> and Response<TRes> instead

/**
 * Strongly-typed route handler signature
 * @param TParams The type of the URL parameters
 * @param TQuery The type of the query parameters
 * @param TBody The type of the request body
 * @param TResponse The type of the response
 * @returns @type {RouteHandler}
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
 * Extract path parameter names into a record type
 * e.g. "/users/:id/books/:bookId" -> { id: string; bookId: string }
 * @param TPath The type of the path
 * @returns @type {ExtractPathParams}
 */
export type ExtractPathParams<TPath extends string> = TPath extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractPathParams<`/${Rest}`>
  : TPath extends `${infer _Start}:${infer Param}`
  ? { [K in Param]: string } // prettier-ignore
  : Record<string, never>; // prettier-ignore

/**
 * Strongly-typed handler inferred from the literal path
 * Accepts either a standard Handler or a typed RouteHandler with inferred params
 * @param TPath The type of the path
 * @param TResponse The type of the response
 * @returns @type {PathHandler}
 */
export type PathHandler<TPath extends string, TResponse extends JsonValue = JsonValue> =
  | Handler<ExtractPathParams<TPath>, Record<string, string>, JsonValue, TResponse>
  | RouteHandler<ExtractPathParams<TPath>, Record<string, string>, JsonValue, TResponse>;

/**
 * Options for creating a Router via factory.
 * Allows configuring a base prefix, pre-registered middlewares, and metadata.
 */
export interface RouterOptions {
  /** Optional path prefix applied when the router is mounted without an explicit path */
  prefix?: string;
  /** Middlewares to register on the router upon creation */
  middlewares?: Handler[];
  /** Human-friendly name for tooling */
  name?: string;
  /** Description for docs/printing */
  description?: string;
}
