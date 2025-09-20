import { STATUS_CODES, type ServerResponse } from 'http';

import type { BlazeResponse, CookieOptions, JsonValue } from '../types';

/** Enhances a Node ServerResponse with Blaze helpers.
 * @param res @type {ServerResponse} - The server response to enhance.
 * @returns @type {BlazeResponse} - The enhanced server response.
 */
export function enhanceResponse(res: ServerResponse): BlazeResponse {
  const blazeRes = res as BlazeResponse;

  blazeRes.json = function (data: JsonValue): BlazeResponse {
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'application/json');
    // JSON.stringify is fast for primitives/objects; avoid extra buffers
    this.end(JSON.stringify(data));
    return this;
  };

  blazeRes.send = function (data: string | Buffer): BlazeResponse {
    if (typeof data === 'string' && !this.hasHeader('Content-Type')) {
      this.setHeader('Content-Type', 'text/html');
    }
    this.end(data);
    return this;
  };

  blazeRes.status = function (code: number): BlazeResponse {
    this.statusCode = code;
    return this;
  };

  blazeRes.sendStatus = function (code: number): BlazeResponse {
    this.statusCode = code;
    const message = STATUS_CODES[code] ?? String(code);
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'text/plain');
    this.end(message);
    return this;
  };

  // content-type helpers
  const mimeMap: Record<string, string> = {
    html: 'text/html',
    json: 'application/json',
    txt: 'text/plain',
    text: 'text/plain',
    css: 'text/css',
    js: 'application/javascript',
    mjs: 'application/javascript',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml',
  };

  function resolveMime(input: string): string {
    if (input.includes('/')) return input;
    const key = input.startsWith('.') ? input.slice(1) : input;
    return mimeMap[key.toLowerCase()] ?? 'application/octet-stream';
  }

  blazeRes.type = function (type: string): BlazeResponse {
    this.setHeader('Content-Type', resolveMime(type));
    return this;
  };

  blazeRes.contentType = function (type: string): BlazeResponse {
    this.setHeader('Content-Type', resolveMime(type));
    return this;
  };

  blazeRes.redirect = function (url: string, status = 302): BlazeResponse {
    this.statusCode = status;
    this.setHeader('Location', url);
    this.end();
    return this;
  };

  const originalRedirect = blazeRes.redirect.bind(blazeRes);

  blazeRes.redirect = function (this: BlazeResponse, a: unknown, b?: unknown): BlazeResponse {
    if (typeof a === 'number' && typeof b === 'string') {
      return originalRedirect(b, a);
    }
    return originalRedirect(String(a), 302);
  } as BlazeResponse['redirect'];

  blazeRes.cookie = function (name: string, value: string, options?: CookieOptions): BlazeResponse {
    const parts: string[] = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
    if (options?.httpOnly) parts.push('HttpOnly');
    if (options?.secure) parts.push('Secure');
    if (typeof options?.maxAge === 'number') parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
    const existing = this.getHeader('Set-Cookie');
    const cookieString = parts.join('; ');
    if (Array.isArray(existing)) {
      this.setHeader('Set-Cookie', [...existing, cookieString]);
    } else if (typeof existing === 'string') {
      this.setHeader('Set-Cookie', [existing, cookieString]);
    } else {
      this.setHeader('Set-Cookie', cookieString);
    }
    return this;
  };

  blazeRes.clearCookie = function (name: string, _options?: CookieOptions): BlazeResponse {
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
  blazeRes.set = function (
    this: BlazeResponse,
    field: string | Record<string, string | string[]>,
    value?: string | string[]
  ): BlazeResponse {
    if (typeof field === 'string') {
      this.setHeader(field, value ?? '');
      return this;
    }
    for (const [k, v] of Object.entries(field)) {
      this.setHeader(k, v);
    }
    return this;
  } as BlazeResponse['set'];

  blazeRes.header = function (
    this: BlazeResponse,
    field: string | Record<string, string | string[]>,
    value?: string | string[]
  ): BlazeResponse {
    return blazeRes.set.call(this, field as never, value as never);
  } as BlazeResponse['header'];

  blazeRes.get = function (this: BlazeResponse, field: string): string | undefined {
    const val = this.getHeader(field);
    if (Array.isArray(val)) return val.join(', ');
    return typeof val === 'string' ? val : undefined;
  } as BlazeResponse['get'];

  blazeRes.append = function (this: BlazeResponse, field: string, value?: string[] | string): BlazeResponse {
    const current = this.getHeader(field);
    const next = Array.isArray(value) ? value : value !== undefined ? [value] : [];
    if (Array.isArray(current)) {
      this.setHeader(field, [...current, ...next]);
    } else if (typeof current === 'string') {
      this.setHeader(field, [current, ...next]);
    } else {
      this.setHeader(field, next);
    }
    return this;
  };

  blazeRes.links = function (this: BlazeResponse, links: Record<string, string>): BlazeResponse {
    const segments = Object.entries(links).map(([rel, url]) => `<${url}>; rel="${rel}"`);
    this.setHeader('Link', segments.join(', '));
    return this;
  };

  blazeRes.location = function (this: BlazeResponse, url: string): BlazeResponse {
    this.setHeader('Location', url);
    return this;
  };

  blazeRes.vary = function (this: BlazeResponse, field: string): BlazeResponse {
    const current = this.getHeader('Vary');
    const set = new Set<string>(
      (typeof current === 'string' ? current.split(',') : Array.isArray(current) ? current : [])
        .map(s => s.trim())
        .filter(Boolean)
    );
    field.split(',').forEach(f => set.add(f.trim()));
    this.setHeader('Vary', Array.from(set).join(', '));
    return this;
  };

  blazeRes.jsonp = function (this: BlazeResponse, data: JsonValue): BlazeResponse {
    const payload = JSON.stringify(data);
    const body = `callback(${payload});`;
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'application/javascript');
    this.end(body);
    return this;
  };

  return blazeRes;
}
