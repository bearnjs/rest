import { STATUS_CODES, type ServerResponse } from 'http';

import type { AerixResponse, CookieOptions, JsonValue } from '../types';

/** Enhances a Node ServerResponse with Aerix helpers.
 * @param res @type {ServerResponse} - The server response to enhance.
 * @returns @type {AerixResponse} - The enhanced server response.
 */
export function enhanceResponse(res: ServerResponse): AerixResponse {
  const AerixRes = res as AerixResponse;

  AerixRes.json = function (data: JsonValue): AerixResponse {
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'application/json');
    // Use direct JSON.stringify for better performance
    this.end(JSON.stringify(data));
    return this;
  };

  AerixRes.send = function (data: string | Buffer): AerixResponse {
    if (typeof data === 'string' && !this.hasHeader('Content-Type')) {
      this.setHeader('Content-Type', 'text/html');
    }
    this.end(data);
    return this;
  };

  AerixRes.status = function (code: number): AerixResponse {
    this.statusCode = code;
    return this;
  };

  AerixRes.sendStatus = function (code: number): AerixResponse {
    this.statusCode = code;
    const message = STATUS_CODES[code] ?? String(code);
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'text/plain');
    this.end(message);
    return this;
  };

  // content-type helpers - optimized with Map
  const mimeMap = new Map([
    ['html', 'text/html'],
    ['json', 'application/json'],
    ['txt', 'text/plain'],
    ['text', 'text/plain'],
    ['css', 'text/css'],
    ['js', 'application/javascript'],
    ['mjs', 'application/javascript'],
    ['png', 'image/png'],
    ['jpg', 'image/jpeg'],
    ['jpeg', 'image/jpeg'],
    ['svg', 'image/svg+xml'],
  ]);

  function resolveMime(input: string): string {
    if (input.includes('/')) return input;
    const key = input.startsWith('.') ? input.slice(1) : input;
    return mimeMap.get(key.toLowerCase()) ?? 'application/octet-stream';
  }

  AerixRes.type = function (type: string): AerixResponse {
    this.setHeader('Content-Type', resolveMime(type));
    return this;
  };

  AerixRes.contentType = function (type: string): AerixResponse {
    this.setHeader('Content-Type', resolveMime(type));
    return this;
  };

  AerixRes.redirect = function (url: string, status = 302): AerixResponse {
    this.statusCode = status;
    this.setHeader('Location', url);
    this.end();
    return this;
  };

  const originalRedirect = AerixRes.redirect.bind(AerixRes);

  AerixRes.redirect = function (this: AerixResponse, a: unknown, b?: unknown): AerixResponse {
    if (typeof a === 'number' && typeof b === 'string') {
      return originalRedirect(b, a);
    }
    return originalRedirect(String(a), 302);
  } as AerixResponse['redirect'];

  AerixRes.cookie = function (name: string, value: string, options?: CookieOptions): AerixResponse {
    const parts: string[] = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
    if (options?.httpOnly) parts.push('HttpOnly');
    if (options?.secure) parts.push('Secure');
    if (typeof options?.maxAge === 'number') parts.push(`Max-Age=${Math.floor(options.maxAge)}`);

    const existing = this.getHeader('Set-Cookie');
    const cookieString = parts.join('; ');

    if (Array.isArray(existing)) {
      existing.push(cookieString);
      this.setHeader('Set-Cookie', existing);
    } else if (typeof existing === 'string') {
      this.setHeader('Set-Cookie', [existing, cookieString]);
    } else {
      this.setHeader('Set-Cookie', cookieString);
    }
    return this;
  };

  AerixRes.clearCookie = function (name: string, _options?: CookieOptions): AerixResponse {
    const expires = new Date(1).toUTCString();
    const cookieString = `${encodeURIComponent(name)}=; Expires=${expires}; Max-Age=0`;
    const existing = this.getHeader('Set-Cookie');

    if (Array.isArray(existing)) {
      existing.push(cookieString);
      this.setHeader('Set-Cookie', existing);
    } else if (typeof existing === 'string') {
      this.setHeader('Set-Cookie', [existing, cookieString]);
    } else {
      this.setHeader('Set-Cookie', cookieString);
    }
    return this;
  };

  // Header helpers: set/header/get/append/links/location/vary
  AerixRes.set = function (
    this: AerixResponse,
    field: string | Record<string, string | string[]>,
    value?: string | string[]
  ): AerixResponse {
    if (typeof field === 'string') {
      this.setHeader(field, value ?? '');
      return this;
    }
    for (const [k, v] of Object.entries(field)) {
      this.setHeader(k, v);
    }
    return this;
  } as AerixResponse['set'];

  AerixRes.header = function (
    this: AerixResponse,
    field: string | Record<string, string | string[]>,
    value?: string | string[]
  ): AerixResponse {
    return AerixRes.set.call(this, field as never, value as never);
  } as AerixResponse['header'];

  AerixRes.get = function (this: AerixResponse, field: string): string | undefined {
    const val = this.getHeader(field);
    if (Array.isArray(val)) return val.join(', ');
    return typeof val === 'string' ? val : undefined;
  } as AerixResponse['get'];

  AerixRes.append = function (this: AerixResponse, field: string, value?: string[] | string): AerixResponse {
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

  AerixRes.links = function (this: AerixResponse, links: Record<string, string>): AerixResponse {
    const segments = Object.entries(links).map(([rel, url]) => `<${url}>; rel="${rel}"`);
    this.setHeader('Link', segments.join(', '));
    return this;
  };

  AerixRes.location = function (this: AerixResponse, url: string): AerixResponse {
    this.setHeader('Location', url);
    return this;
  };

  AerixRes.vary = function (this: AerixResponse, field: string): AerixResponse {
    const current = this.getHeader('Vary');
    const existing = typeof current === 'string' ? current.split(',') : Array.isArray(current) ? current : [];
    const set = new Set<string>();

    // Add existing values
    for (let i = 0; i < existing.length; i++) {
      const item = existing[i];
      if (item) {
        const trimmed = item.trim();
        if (trimmed) set.add(trimmed);
      }
    }

    // Add new fields
    const fields = field.split(',');
    for (let i = 0; i < fields.length; i++) {
      const item = fields[i];
      if (item) {
        const trimmed = item.trim();
        if (trimmed) set.add(trimmed);
      }
    }

    this.setHeader('Vary', Array.from(set).join(', '));
    return this;
  };

  AerixRes.jsonp = function (this: AerixResponse, data: JsonValue): AerixResponse {
    const payload = JSON.stringify(data);
    const body = `callback(${payload});`;
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'application/javascript');
    this.end(body);
    return this;
  };

  return AerixRes;
}
