/* eslint-disable prettier/prettier */
import type { Request, HttpMethod, JsonValue } from '../types';
import type { IncomingMessage } from 'http';

/**
 * Enhances a Node.js IncomingMessage with additional properties and methods for easier handling.
 *
 * @function
 * @param {IncomingMessage} req - The incoming HTTP request message to enhance.
 * @returns {Request} The enhanced request object with additional properties and methods.
 */
export function enhanceRequest(req: IncomingMessage): Request {
  const BearnReq = req as Request;

  /**
   * Retrieves a specific header from the request.
   *
   * @function
   * @param {string} name - The name of the header to retrieve.
   * @returns {string|string[]|undefined} The value of the header, or undefined if not found.
   */
  function getHeader(this: Request, name: 'set-cookie'): string[] | undefined;
  function getHeader(this: Request, name: string): string | undefined;
  function getHeader(this: Request, name: string): string | string[] | undefined {
    const key = name.toLowerCase();
    if (key === 'set-cookie') {
      const val = this.headers['set-cookie'];
      return Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined;
    }
    const value = this.headers[key];
    if (Array.isArray(value)) return value.join(', ');
    return typeof value === 'string' ? value : undefined;
  }

  BearnReq.get = getHeader;
  BearnReq.header = getHeader;

  // Optimize: avoid repeated property access and unnecessary checks
  const url = req.url;
  if (typeof url === 'string') {
    BearnReq.originalUrl = url;
    const qIdx = url.indexOf('?');
    BearnReq.path = qIdx === -1 ? url : url.slice(0, qIdx);
  }

  const socket = req.socket as { encrypted?: boolean; remoteAddress?: string };
  BearnReq.protocol = socket.encrypted ? 'https' : 'http';
  BearnReq.secure = !!socket.encrypted;

  if (typeof socket.remoteAddress === 'string') {
    BearnReq.ip = socket.remoteAddress;
  }

  // Optimize: flatten and trim forwarded-for in one go
  const forwardedFor = req.headers['x-forwarded-for'];
  let ips: string[] = [];
  if (Array.isArray(forwardedFor)) {
    for (const s of forwardedFor) {
      if (typeof s === 'string') {
        ips.push(
          ...s
            .split(',')
            .map(ip => ip.trim())
            .filter(Boolean)
        );
      }
    }
  } else if (typeof forwardedFor === 'string') {
    ips = forwardedFor
      .split(',')
      .map(ip => ip.trim())
      .filter(Boolean);
  }
  BearnReq.ips = ips;

  // Optimize: host/hostname/port extraction
  const rawHost = req.headers['host'];
  let host: string | undefined;
  if (Array.isArray(rawHost)) {
    host = rawHost.find((v): v is string => typeof v === 'string');
  } else if (typeof rawHost === 'string') {
    host = rawHost;
  }
  if (host) {
    BearnReq.host = host;
    const colonIdx = host.indexOf(':');
    BearnReq.hostname = colonIdx === -1 ? host : host.slice(0, colonIdx);
    BearnReq.port = colonIdx !== -1 ? parseInt(host.slice(colonIdx + 1), 10) : 0;
  }

  // Optimize: direct header access and normalization
  const xrw = req.headers['x-requested-with'];
  BearnReq.xhr = typeof xrw === 'string' && xrw.toLowerCase() === 'xmlhttprequest';
  BearnReq.fresh = false; // TODO: Implement ETag/Last-Modified checking
  BearnReq.stale = true;
  BearnReq.method = (req.method ?? 'GET').toUpperCase() as HttpMethod;
  BearnReq.subdomains = BearnReq.hostname ? BearnReq.hostname.split('.').slice(0, -2) : [];

  // Accepts
  function parseAccept(header: string | string[] | undefined): string[] {
    if (!header) return [];
    if (Array.isArray(header)) header = header.join(',');
    return header
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
  }
  BearnReq.accepts = function (): string[] {
    return parseAccept(req.headers.accept);
  };
  BearnReq.acceptsCharsets = function (): string[] {
    // Accept-Charset: only first value if array, else string
    const ac = req.headers['accept-charset'];
    let val: string | undefined;
    if (Array.isArray(ac)) val = ac[0];
    else val = ac;
    return val
      ? val
          .split(',')
          .map(c => c.trim())
          .filter(Boolean)
      : [];
  };
  BearnReq.acceptsEncodings = function (): string[] {
    return parseAccept(req.headers['accept-encoding']);
  };
  BearnReq.acceptsLanguages = function (): string[] {
    return parseAccept(req.headers['accept-language']);
  };

  // Cookies
  const cookieHeaderRaw = Array.isArray(req.headers.cookie) ? req.headers.cookie.join('; ') : req.headers.cookie;
  if (cookieHeaderRaw) {
    const cookies: Record<string, string> = {};
    for (const part of cookieHeaderRaw.split(';')) {
      if (!part) continue;
      const idx = part.indexOf('=');
      if (idx === -1) continue;
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (key) cookies[decodeURIComponent(key)] = decodeURIComponent(val);
    }
    BearnReq.cookies = cookies;
  } else {
    BearnReq.cookies = {};
  }

  return BearnReq;
}

/**
 * Parses the body of a request based on its Content-Type header.
 *
 * @function
 * @param {Request} req - The request object whose body needs to be parsed.
 * @returns {Promise<void>} A promise that resolves when the body is successfully parsed.
 * @throws Will throw an error if the request body is too large or if parsing fails.
 */
export async function parseBody(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    const MAX_SIZE = 1024 * 1024;
    const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);

    if (contentLength > MAX_SIZE) {
      reject(new Error('Request entity too large'));
      return;
    }

    const chunks: Buffer[] = [];
    let totalLength = 0;

    req.on('data', (chunk: Buffer) => {
      totalLength += chunk.length;
      if (totalLength > MAX_SIZE) {
        reject(new Error('Request entity too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString();
        const contentType = req.headers['content-type'];
        const setBody = (val: unknown) => {
          Reflect.set(req as object, 'body', val);
        };

        if (contentType?.includes('application/json')) {
          setBody(body ? (JSON.parse(body) as JsonValue) : {});
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          setBody(parseUrlEncoded(body));
        } else {
          // For multipart/form-data and others, just set as string
          setBody(body);
        }
        req.rawBody = body;
        resolve();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });

    req.on('error', e => reject(e instanceof Error ? e : new Error(String(e))));
  });
}

/**
 * Parses a URL-encoded string into an object.
 *
 * @function
 * @param {string} body - The URL-encoded string to parse.
 * @returns {Record<string, string>} An object representing the parsed key-value pairs.
 */
function parseUrlEncoded(body: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!body) return params;

  for (const part of body.split('&')) {
    if (!part) continue;
    const equalIndex = part.indexOf('=');
    if (equalIndex === -1) {
      params[decodeURIComponent(part)] = '';
    } else {
      const key = part.slice(0, equalIndex);
      const value = part.slice(equalIndex + 1);
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }

  return params;
}
