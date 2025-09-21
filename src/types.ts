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

/**
 * Augmented Node IncomingMessage with framework conveniences.
 * Extends the base Node IncomingMessage with additional properties and methods.
 * @returns AerixRequest
 */
export interface AerixRequest extends IncomingMessage {
  /** URL parameters parsed from route pattern
   * @returns URL parameters parsed from route pattern
   */
  params?: Record<string, string>;

  /** Query string parameters
   * @returns Query string parameters
   */
  query?: Record<string, string>;

  /** HTTP method
   * @returns HTTP method
   */
  method?: HttpMethod;

  /** Parsed request body
   * @returns Parsed request body
   */
  body?: JsonValue | string | Buffer | Record<string, string>;

  /** Request URL path
   * @returns Request URL path
   */
  path?: string;

  /** Raw unparsed request body
   * @returns Raw unparsed request body
   */
  rawBody?: string;

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
 * @returns AerixResponse
 */
export interface AerixResponse extends ServerResponse {
  /**
   * Send a JSON response
   * @param data Data to send as JSON
   * @returns AerixResponse
   */
  json(data: JsonValue): AerixResponse;

  /**
   * Send a response
   * @param data Data to send
   * @returns AerixResponse
   */
  send(data: string | Buffer): AerixResponse;

  /**
   * Set response status code
   * @param code HTTP status code
   * @returns AerixResponse
   */
  status(code: number): AerixResponse;

  /**
   * Send status code as response
   * @param code HTTP status code
   * @returns AerixResponse
   */
  sendStatus(code: number): AerixResponse;

  /**
   * Set Content-Type header
   * @param type MIME type
   * @returns AerixResponse
   */
  type(type: string): AerixResponse;

  /**
   * Set Content-Type header
   * @param type MIME type
   * @returns AerixResponse
   */
  contentType(type: string): AerixResponse;

  /**
   * Redirect to URL
   * @param url Redirect target URL
   * @param status HTTP status code
   * @returns AerixResponse
   */
  redirect(url: string, status?: number): AerixResponse;

  /**
   * Set response header
   * @param field Header name or object
   * @param value Header value
   * @returns AerixResponse
   */
  set(field: string | Record<string, string | string[]>, value?: string | string[]): AerixResponse;

  /**
   * Set response header (alias for set())
   * @param field Header name or object
   * @param value Header value
   * @returns AerixResponse
   */
  header(field: string | Record<string, string | string[]>, value?: string | string[]): AerixResponse;

  /**
   * Get response header
   * @param field Header name
   * @returns AerixResponse
   */
  get(field: string): string | undefined;

  /**
   * Append to response header
   * @param field Header name
   * @param value Value to append
   * @returns AerixResponse
   */
  append(field: string, value?: string[] | string): AerixResponse;

  /**
   * Set Link headers
   * @param links Object of link relations
   * @returns AerixResponse
   */
  links(links: Record<string, string>): AerixResponse;

  /**
   * Set Location header
   * @param url URL to set in Location header
   * @returns AerixResponse
   */
  location(url: string): AerixResponse;

  /**
   * Add field to Vary header
   * @param field Header to vary on
   * @returns AerixResponse
   */
  vary(field: string): AerixResponse;

  /**
   * Send JSONP response
   * @param data Data to send as JSONP
   * @returns AerixResponse
   */
  jsonp(data: JsonValue): AerixResponse;

  /**
   * Set cookie
   * @param name Cookie name
   * @param value Cookie value
   * @param options Cookie options
   * @returns AerixResponse
   */
  cookie(name: string, value: string, options?: CookieOptions): AerixResponse;

  /**
   * Clear cookie
   * @param name Cookie name
   * @param options Cookie options
   * @returns AerixResponse
   */
  clearCookie(name: string, options?: CookieOptions): AerixResponse;
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
export type Handler = (req: AerixRequest, res: AerixResponse, next: NextFunction) => void | Promise<void>;

/**
 * Global error handler signature.
 * @param err Error being handled
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns ErrorHandler
 */
export type ErrorHandler = (err: Error, req: AerixRequest, res: AerixResponse, next: NextFunction) => void;

/** HTTP method type */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

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
  methods?: string[];
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

/** Top-level application options */
/**
 * Top-level application options
 * @returns @type {AppOptions}
 */
export interface AppOptions {
  /**
   * The CORS configuration.
   * @returns The CORS configuration.
   */
  cors?: CorsOptions | false;
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
}

/**
 * Minimal schema structure usable for OpenAPI generation
 * @returns @type {RouteSchema}
 */
/**
 * Minimal schema structure usable for OpenAPI generation
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

/**
 * Strongly-typed request convenience for route authors
 * @returns @type {TypedRequest}
 */
export type TypedRequest<
  TParams extends Record<string, string> = Record<string, string>,
  TQuery extends Record<string, string> = Record<string, string>,
  TBody extends JsonValue = JsonValue,
> = Omit<AerixRequest, 'params' | 'query' | 'body' | 'method'> & {
  /**
   * Typed URL parameters
   * @returns The typed URL parameters.
   */
  params: TParams;
  /**
   * Typed query parameters
   * @returns The typed query parameters.
   */
  query: TQuery;
  /**
   * HTTP method
   * @returns The HTTP method.
   */
  method: HttpMethod | undefined;
  /**
   * Typed request body
   * @returns The typed request body.
   */
  body: TBody;
};

/**
 * Strongly-typed response convenience for route authors
 * @returns @type {TypedResponse}
 */
export type TypedResponse<TResponse extends JsonValue = JsonValue> = Omit<AerixResponse, 'json'> & {
  /**
   * Send typed JSON response
   * @param data Response data
   * @returns AerixResponse
   */
  json(data: TResponse): AerixResponse;
};

/**
 * Strongly-typed route handler signature
 * @param TParams The type of the URL parameters
 * @param TQuery The type of the query parameters
 * @param TBody The type of the request body
 * @param TResponse The type of the response
 * @returns RouteHandler
 */
export type RouteHandler<
  TParams extends Record<string, string> = Record<string, string>,
  TQuery extends Record<string, string> = Record<string, string>,
  TBody extends JsonValue = JsonValue,
  TResponse extends JsonValue = JsonValue,
> = (
  req: TypedRequest<TParams, TQuery, TBody>,
  res: TypedResponse<TResponse>,
  next: NextFunction
) => void | Promise<void>;
