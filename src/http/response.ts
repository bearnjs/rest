import type { BlazeResponse, CookieOptions } from '../types';
import type { ServerResponse } from 'http';

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

  blazeRes.cookie = function (name: string, value: string, options?: CookieOptions): void {
    const parts: string[] = [];
    parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
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
  };

  return blazeRes;
}
