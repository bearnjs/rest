import type { Request, HttpMethod, JsonValue } from '../types';
import type { IncomingMessage } from 'http';

/** Enhances a Node IncomingMessage with Bearn conveniences.
 * @param req @type {IncomingMessage} - The incoming message to enhance.
 * @returns @type {Request} - The enhanced incoming message.
 */
export function enhanceRequest(req: IncomingMessage): Request {
  const BearnReq = req as Request;

  // Header accessors - optimized
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

  if (typeof req.url === 'string') {
    BearnReq.originalUrl = req.url;
    BearnReq.path = req.url.split('?')[0] ?? '';
  }

  BearnReq.protocol = (req.socket as unknown as { encrypted?: boolean }).encrypted ? 'https' : 'http';
  BearnReq.secure = BearnReq.protocol === 'https';

  if (typeof req.socket.remoteAddress === 'string') {
    BearnReq.ip = req.socket.remoteAddress;
  }
  const forwardedFor = req.headers['x-forwarded-for'];
  BearnReq.ips = Array.isArray(forwardedFor)
    ? forwardedFor.flatMap(s => s.split(',').map(ip => ip.trim()))
    : typeof forwardedFor === 'string'
      ? forwardedFor.split(',').map(ip => ip.trim())
      : [];

  const rawHost = req.headers['host'];
  const hostValues: string[] = Array.isArray(rawHost)
    ? rawHost.filter((v): v is string => typeof v === 'string')
    : typeof rawHost === 'string'
      ? [rawHost]
      : [];
  if (hostValues.length > 0) {
    const firstValue = hostValues[0] as string;
    BearnReq.hostname = firstValue.split(':')[0] ?? '';
    BearnReq.host = firstValue;
    const portMatch = firstValue.match(/:(\d+)/) ?? [];
    BearnReq.port = parseInt(portMatch[1] ?? '0', 10);
  }

  BearnReq.xhr = (req.headers['x-requested-with'] ?? '').toString().toLowerCase() === 'xmlhttprequest';
  BearnReq.fresh = false; // TODO: Implement ETag/Last-Modified checking
  BearnReq.stale = true;
  BearnReq.method = (req.method ?? 'GET').toUpperCase() as HttpMethod;
  BearnReq.subdomains = BearnReq.hostname ? BearnReq.hostname.split('.').slice(0, -2) : [];

  const acceptsHeaderRaw = Array.isArray(req.headers.accept)
    ? req.headers.accept.join(',')
    : (req.headers.accept ?? '');
  const acceptsList = acceptsHeaderRaw ? acceptsHeaderRaw.split(',').map(t => t.trim()) : [];
  BearnReq.accepts = function (): string[] {
    return acceptsList;
  };

  const acceptsCharsetRaw = Array.isArray(req.headers['accept-charset'])
    ? req.headers['accept-charset'][0]
    : req.headers['accept-charset'];
  const acceptsCharsetList = acceptsCharsetRaw ? acceptsCharsetRaw.split(',').map(c => c.trim()) : [];
  BearnReq.acceptsCharsets = function (): string[] {
    return acceptsCharsetList;
  };

  const acceptsEncodingRaw = Array.isArray(req.headers['accept-encoding'])
    ? req.headers['accept-encoding'].join(',')
    : (req.headers['accept-encoding'] ?? '');
  const acceptsEncodingList = acceptsEncodingRaw ? acceptsEncodingRaw.split(',').map(e => e.trim()) : [];
  BearnReq.acceptsEncodings = function (): string[] {
    return acceptsEncodingList;
  };

  const acceptsLanguageRaw = Array.isArray(req.headers['accept-language'])
    ? req.headers['accept-language'].join(',')
    : (req.headers['accept-language'] ?? '');
  const acceptsLanguageList = acceptsLanguageRaw ? acceptsLanguageRaw.split(',').map(l => l.trim()) : [];
  BearnReq.acceptsLanguages = function (): string[] {
    return acceptsLanguageList;
  };

  const cookieHeaderRaw = Array.isArray(req.headers.cookie) ? req.headers.cookie.join('; ') : req.headers.cookie;
  if (cookieHeaderRaw) {
    const pairs = cookieHeaderRaw.split(';');
    const cookies: Record<string, string> = {};
    for (let i = 0; i < pairs.length; i++) {
      const part = pairs[i];
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

/** Parses request body based on Content-Type with simple safeguards.
 * @param req @type {Request} - The request to parse the body of.
 * @returns @type {Promise<void>} - A promise that resolves when the body is parsed.
 */
export async function parseBody(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);

    if (contentLength > 1024 * 1024) {
      reject(new Error('Request entity too large'));
      return;
    }

    const chunks: Buffer[] = [];
    let totalLength = 0;

    req.on('data', (chunk: Buffer) => {
      totalLength += chunk.length;

      if (totalLength > 1024 * 1024) {
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

        if (contentType?.includes('application/json')) {
          req.body = body ? (JSON.parse(body) as JsonValue) : {};
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          req.body = parseUrlEncoded(body);
        } else if (contentType?.includes('multipart/form-data')) {
          req.body = body;
        } else {
          req.body = body;
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

function parseUrlEncoded(body: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!body) return params;

  const parts = body.split('&');
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
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
