/* eslint-disable prettier/prettier */
import { STATUS_CODES, type ServerResponse } from 'http';

import type { Response, CookieOptions, JsonValue } from '../types';

/**
 * A map that associates file extensions with their corresponding MIME types.
 * @constant
 * @type {Map<string, string>}
 */
const mimeMap = new Map<string, string>([
  // Text
  ['html', 'text/html'],
  ['json', 'application/json'],
  ['txt', 'text/plain'],
  ['text', 'text/plain'],
  ['css', 'text/css'],
  ['js', 'text/javascript'],
  ['mjs', 'text/javascript'],
  ['csv', 'text/csv'],
  ['xml', 'text/xml'],
  ['ics', 'text/calendar'],
  // Images
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['gif', 'image/gif'],
  ['webp', 'image/webp'],
  ['svg', 'image/svg+xml'],
  ['ico', 'image/x-icon'],
  ['tiff', 'image/tiff'],
  ['avif', 'image/avif'],
  ['bmp', 'image/bmp'],
  // Application
  ['pdf', 'application/pdf'],
  ['zip', 'application/zip'],
  ['gz', 'application/gzip'],
  ['wasm', 'application/wasm'],
  ['rtf', 'application/rtf'],
  ['epub', 'application/epub+zip'],
  ['ogg', 'application/ogg'],
  ['jsonld', 'application/ld+json'],
  ['xhtml', 'application/xhtml+xml'],
  ['bin', 'application/octet-stream'],
  ['eot', 'application/vnd.ms-fontobject'],
  // Audio
  ['aac', 'audio/aac'],
  ['midi', 'audio/x-midi'],
  ['mp3', 'audio/mpeg'],
  ['oga', 'audio/ogg'],
  ['opus', 'audio/opus'],
  ['weba', 'audio/webm'],
  // Video
  ['avi', 'video/x-msvideo'],
  ['mov', 'video/quicktime'],
  ['wmv', 'video/x-ms-wmv'],
  ['flv', 'video/x-flv'],
  ['av1', 'video/av1'],
  ['mp4', 'video/mp4'],
  ['mpeg', 'video/mpeg'],
  ['ogv', 'video/ogg'],
  ['ts', 'video/mp2t'],
  ['webm', 'video/webm'],
  ['3gp', 'video/3gpp'],
  ['3g2', 'video/3gpp2'],
  // Fonts & Models
  ['otf', 'font/otf'],
  ['ttf', 'font/ttf'],
  ['woff', 'font/woff'],
  ['woff2', 'font/woff2'],
  ['gltf', 'model/gltf+json'],
  ['glb', 'model/gltf-binary'],
]);

/**
 * Resolves the MIME type for a given file extension or MIME type string.
 * @function
 * @param {string} input - The file extension or MIME type string.
 * @returns {string} - The resolved MIME type.
 */
function resolveMime(input: string): string {
  if (input.includes('/')) return input;
  const key = input.startsWith('.') ? input.slice(1) : input;
  return mimeMap.get(key.toLowerCase()) ?? 'application/octet-stream';
}

/**
 * Enhances a Node.js ServerResponse object with additional helper methods.
 * @function
 * @param {ServerResponse} res - The server response to enhance.
 * @returns {Response} - The enhanced server response.
 */
export function enhanceResponse(res: ServerResponse): Response {
  const BearnRes = res as Response;

  /**
   * Sends a JSON response.
   * @param {JsonValue} data - The data to send as JSON.
   * @returns {Response} - The response object.
   */
  BearnRes.json = function (data: JsonValue): Response {
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(data));
    return this;
  };

  /**
   * Sends a response with the given data.
   * @param {string|Buffer} data - The data to send.
   * @returns {Response} - The response object.
   */
  BearnRes.send = function (data: string | Buffer): Response {
    if (typeof data === 'string' && !this.hasHeader('Content-Type')) {
      this.setHeader('Content-Type', 'text/html');
    }
    this.end(data);
    return this;
  };

  /**
   * Sets the HTTP status code for the response.
   * @param {number} code - The status code to set.
   * @returns {Response} - The response object.
   */
  BearnRes.status = function (code: number): Response {
    this.statusCode = code;
    return this;
  };

  /**
   * Sends a response with the given status code and its corresponding message.
   * @param {number} code - The status code to send.
   * @returns {Response} - The response object.
   */
  BearnRes.sendStatus = function (code: number): Response {
    this.statusCode = code;
    const message = STATUS_CODES[code] ?? String(code);
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'text/plain');
    this.end(message);
    return this;
  };

  /**
   * Sets the Content-Type of the response.
   * @param {string} type - The MIME type or file extension.
   * @returns {Response} - The response object.
   */
  const setType = function (this: Response, type: Parameters<Response['type']>[0]): Response {
    this.setHeader('Content-Type', resolveMime(String(type)));
    return this;
  } as Response['type'];
  BearnRes.type = setType;
  BearnRes.contentType = setType as Response['contentType'];

  /**
   * Redirects the response to a specified URL.
   * @param {string|number} a - The URL or status code.
   * @param {string|number} [b] - The URL if the first parameter is a status code.
   * @returns {Response} - The response object.
   */
  BearnRes.redirect = function (this: Response, a: string | number, b?: string | number): Response {
    const isNumberFirst = typeof a === 'number';
    const status = isNumberFirst ? a : typeof b === 'number' ? b : 302;
    const url = isNumberFirst ? String(b ?? '') : String(a);
    this.statusCode = status;
    this.setHeader('Location', url);
    this.end();
    return this;
  } as Response['redirect'];

  /**
   * Sets a cookie on the response.
   * @param {string} name - The name of the cookie.
   * @param {string} value - The value of the cookie.
   * @param {CookieOptions} [options] - Additional cookie options.
   * @returns {Response} - The response object.
   */
  BearnRes.cookie = function (name: string, value: string, options?: CookieOptions): Response {
    const parts: string[] = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
    if (options) {
      if (options.httpOnly) parts.push('HttpOnly');
      if (options.secure) parts.push('Secure');
      if (typeof options.maxAge === 'number') parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
      if (options.path) parts.push(`Path=${options.path}`);
      if (options.domain) parts.push(`Domain=${options.domain}`);
      if (options.sameSite) {
        const s = options.sameSite;
        parts.push(`SameSite=${s === 'none' ? 'None' : s === 'lax' ? 'Lax' : 'Strict'}`);
      }
    }
    const cookieString = parts.join('; ');
    const existing = this.getHeader('Set-Cookie');
    if (Array.isArray(existing)) {
      this.setHeader('Set-Cookie', [...existing, cookieString]);
    } else if (typeof existing === 'string') {
      this.setHeader('Set-Cookie', [existing, cookieString]);
    } else {
      this.setHeader('Set-Cookie', cookieString);
    }
    return this;
  };

  /**
   * Clears a cookie by setting its expiration date to the past.
   * @param {string} name - The name of the cookie to clear.
   * @param {CookieOptions} [_options] - Additional options (not used).
   * @returns {Response} - The response object.
   */
  BearnRes.clearCookie = function (name: string, _options?: CookieOptions): Response {
    const expires = new Date(1).toUTCString();
    const cookieString = `${encodeURIComponent(name)}=; Expires=${expires}; Max-Age=0`;
    const existing = this.getHeader('Set-Cookie');
    if (Array.isArray(existing)) {
      this.setHeader('Set-Cookie', [...existing, cookieString]);
    } else if (typeof existing === 'string') {
      this.setHeader('Set-Cookie', [existing, cookieString]);
    } else {
      this.setHeader('Set-Cookie', cookieString);
    }
    return this;
  };

  // Header helpers: set/header/get/append/links/location/vary

  /**
   * Sets a header field to a specified value.
   * @param {string|Object} field - The header field name or an object of key-value pairs.
   * @param {string|number|string[]} [value] - The value to set for the header field.
   * @returns {Response} - The response object.
   */
  BearnRes.set = function (
    this: Response,
    field: Parameters<Response['set']>[0],
    value?: Parameters<Response['set']>[1]
  ): Response {
    if (typeof field === 'string') {
      this.setHeader(field, value ?? '');
    } else if (typeof field === 'object') {
      for (const k of Object.keys(field)) {
        this.setHeader(k, (field as Record<string, string | number | string[]>)[k] ?? '');
      }
    }
    return this;
  } as Response['set'];

  /**
   * Alias for the set method to set a header field.
   * @param {string|Object} field - The header field name or an object of key-value pairs.
   * @param {string|number|string[]} [value] - The value to set for the header field.
   * @returns {Response} - The response object.
   */
  BearnRes.header = function (
    this: Response,
    field: Parameters<Response['header']>[0],
    value?: Parameters<Response['header']>[1]
  ): Response {
    return BearnRes.set.call(this, field, value ?? '');
  } as Response['header'];

  /**
   * Retrieves the value of a specified header field.
   * @param {string} field - The header field name.
   * @returns {string|number|string[]|undefined} - The value of the header field.
   */
  BearnRes.get = function (this: Response, field: string): string | number | string[] | undefined {
    const val = this.getHeader(field);
    if (Array.isArray(val)) return val;
    if (typeof val === 'number') return val;
    return typeof val === 'string' ? val : undefined;
  } as Response['get'];

  /**
   * Appends a value to a specified header field.
   * @param {string} field - The header field name.
   * @param {string|number|string[]} [value] - The value to append.
   * @returns {Response} - The response object.
   */
  BearnRes.append = function (this: Response, field: string, value?: string[] | string | number): Response {
    const current = this.getHeader(field);
    const normalizedNext = Array.isArray(value) ? value.map(String) : value !== undefined ? [String(value)] : [];
    if (Array.isArray(current)) {
      this.setHeader(field, [...current, ...normalizedNext]);
    } else if (typeof current === 'string') {
      this.setHeader(field, [current, ...normalizedNext]);
    } else {
      this.setHeader(field, normalizedNext);
    }
    return this;
  };

  /**
   * Sets the Link header field with the given links.
   * @param {Object} links - An object containing link relations and URLs.
   * @returns {Response} - The response object.
   */
  BearnRes.links = function (this: Response, links: Record<string, string>): Response {
    const segments = Object.entries(links).map(([rel, url]) => `<${url}>; rel="${rel}"`);
    this.setHeader('Link', segments.join(', '));
    return this;
  };

  /**
   * Sets the Location header field with the given URL.
   * @param {string} url - The URL to set in the Location header.
   * @returns {Response} - The response object.
   */
  BearnRes.location = function (this: Response, url: string): Response {
    this.setHeader('Location', url);
    return this;
  };

  /**
   * Modifies the Vary header field to include the given field.
   * @param {string} field - The field to add to the Vary header.
   * @returns {Response} - The response object.
   */
  BearnRes.vary = function (this: Response, field: string): Response {
    const current = this.getHeader('Vary');
    const existing =
      typeof current === 'string'
        ? current
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : Array.isArray(current)
          ? current.map(s => String(s).trim()).filter(Boolean)
          : [];
    const fields = field
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const set = new Set([...existing, ...fields]);
    this.setHeader('Vary', Array.from(set).join(', '));
    return this;
  };

  /**
   * Sends a JSONP response with the given data.
   * @param {JsonValue} data - The data to send as JSONP.
   * @returns {Response} - The response object.
   */
  BearnRes.jsonp = function (this: Response, data: JsonValue): Response {
    const payload = JSON.stringify(data);
    const body = `callback(${payload});`;
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'application/javascript');
    this.end(body);
    return this;
  };

  return BearnRes;
}
