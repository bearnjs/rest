import { STATUS_CODES, type ServerResponse } from 'http';

import type { Response, CookieOptions, JsonValue } from '../types';

/** Enhances a Node ServerResponse with Bearn helpers.
 * @param res @type {ServerResponse} - The server response to enhance.
 * @returns @type {Response} - The enhanced server response.
 */
const mimeMap = new Map([
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
  ['aac', 'audio/aac'],
  ['midi', 'audio/x-midi'],
  ['mp3', 'audio/mpeg'],
  ['oga', 'audio/ogg'],
  ['opus', 'audio/opus'],
  ['weba', 'audio/webm'],
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
  ['otf', 'font/otf'],
  ['ttf', 'font/ttf'],
  ['woff', 'font/woff'],
  ['woff2', 'font/woff2'],
  ['gltf', 'model/gltf+json'],
  ['glb', 'model/gltf-binary'],
]);

function resolveMime(input: string): string {
  if (input.includes('/')) return input;
  const key = input.startsWith('.') ? input.slice(1) : input;
  return mimeMap.get(key.toLowerCase()) ?? 'application/octet-stream';
}

export function enhanceResponse(res: ServerResponse): Response {
  const BearnRes = res as Response;

  BearnRes.json = function (data: JsonValue): Response {
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'application/json');
    // Use direct JSON.stringify for better performance
    this.end(JSON.stringify(data));
    return this;
  };

  BearnRes.send = function (data: string | Buffer): Response {
    if (typeof data === 'string' && !this.hasHeader('Content-Type')) {
      this.setHeader('Content-Type', 'text/html');
    }
    this.end(data);
    return this;
  };

  BearnRes.status = function (code: number): Response {
    this.statusCode = code;
    return this;
  };

  BearnRes.sendStatus = function (code: number): Response {
    this.statusCode = code;
    const message = STATUS_CODES[code] ?? String(code);
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'text/plain');
    this.end(message);
    return this;
  };

  const setType = function (this: Response, type: Parameters<Response['type']>[0]): Response {
    this.setHeader('Content-Type', resolveMime(String(type)));
    return this;
  } as Response['type'];
  BearnRes.type = setType;
  BearnRes.contentType = setType as Response['contentType'];

  BearnRes.redirect = function (this: Response, a: string | number, b?: string | number): Response {
    const isNumberFirst = typeof a === 'number';
    const status = isNumberFirst ? a : typeof b === 'number' ? b : 302;
    const url = isNumberFirst ? String(b ?? '') : String(a);
    this.statusCode = status;
    this.setHeader('Location', url);
    this.end();
    return this;
  } as Response['redirect'];

  BearnRes.cookie = function (name: string, value: string, options?: CookieOptions): Response {
    const parts: string[] = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
    if (options?.httpOnly) parts.push('HttpOnly');
    if (options?.secure) parts.push('Secure');
    if (typeof options?.maxAge === 'number') parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
    if (options?.path) parts.push(`Path=${options.path}`);
    if (options?.domain) parts.push(`Domain=${options.domain}`);
    if (options?.sameSite) {
      const s = options.sameSite;
      const formatted = s === 'none' ? 'None' : s === 'lax' ? 'Lax' : 'Strict';
      parts.push(`SameSite=${formatted}`);
    }

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

  BearnRes.clearCookie = function (name: string, _options?: CookieOptions): Response {
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
  BearnRes.set = function (
    this: Response,
    field: Parameters<Response['set']>[0],
    value?: Parameters<Response['set']>[1]
  ): Response {
    if (typeof field === 'string') {
      const v = (value ?? '') as string | string[] | number;
      this.setHeader(field, v);
      return this;
    }
    const obj = field as Record<string, string | number | string[]>;
    for (const k in obj) this.setHeader(k, obj[k] ?? '');
    return this;
  } as Response['set'];

  BearnRes.header = function (
    this: Response,
    field: Parameters<Response['header']>[0],
    value?: Parameters<Response['header']>[1]
  ): Response {
    return BearnRes.set.call(this, field, value ?? '');
  } as Response['header'];

  BearnRes.get = function (this: Response, field: string): string | number | string[] | undefined {
    const val = this.getHeader(field);
    if (Array.isArray(val)) return val as unknown as string[];
    if (typeof val === 'number') return val;
    return typeof val === 'string' ? val : undefined;
  } as Response['get'];

  BearnRes.append = function (this: Response, field: string, value?: string[] | string | number): Response {
    const current = this.getHeader(field);
    const normalizedNext = Array.isArray(value)
      ? value.map(v => String(v))
      : value !== undefined
        ? [String(value)]
        : [];
    if (Array.isArray(current)) {
      this.setHeader(field, [...current, ...normalizedNext]);
    } else if (typeof current === 'string') {
      this.setHeader(field, [current, ...normalizedNext]);
    } else {
      this.setHeader(field, normalizedNext);
    }
    return this;
  };

  BearnRes.links = function (this: Response, links: Record<string, string>): Response {
    const segments = Object.entries(links).map(([rel, url]) => `<${url}>; rel="${rel}"`);
    this.setHeader('Link', segments.join(', '));
    return this;
  };

  BearnRes.location = function (this: Response, url: string): Response {
    this.setHeader('Location', url);
    return this;
  };

  BearnRes.vary = function (this: Response, field: string): Response {
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

  BearnRes.jsonp = function (this: Response, data: JsonValue): Response {
    const payload = JSON.stringify(data);
    const body = `callback(${payload});`;
    if (!this.hasHeader('Content-Type')) this.setHeader('Content-Type', 'application/javascript');
    this.end(body);
    return this;
  };

  return BearnRes;
}
