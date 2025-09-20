import type { BlazeRequest, HttpMethod, JsonValue } from '../types';
import type { IncomingMessage } from 'http';

/** Enhances a Node IncomingMessage with Blaze conveniences.
 * @param req @type {IncomingMessage} - The incoming message to enhance.
 * @returns @type {BlazeRequest} - The enhanced incoming message.
 */
export function enhanceRequest(req: IncomingMessage): BlazeRequest {
  const blazeReq = req as BlazeRequest;

  // Header accessors
  function getHeader(this: BlazeRequest, name: 'set-cookie'): string[] | undefined;
  function getHeader(this: BlazeRequest, name: string): string | undefined;
  function getHeader(this: BlazeRequest, name: string): string | string[] | undefined {
    const key = name.toLowerCase();
    if (key === 'set-cookie') {
      const val = this.headers['set-cookie'];
      return Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined;
    }
    const value = this.headers[key];
    if (Array.isArray(value)) return value.join(', ');
    return typeof value === 'string' ? value : undefined;
  }
  blazeReq.get = getHeader;
  blazeReq.header = getHeader;

  // URL properties
  if (typeof req.url === 'string') {
    blazeReq.originalUrl = req.url;
    blazeReq.path = req.url.split('?')[0] ?? '';
  }

  // Protocol & security
  blazeReq.protocol = (req.socket as unknown as { encrypted?: boolean }).encrypted ? 'https' : 'http';
  blazeReq.secure = blazeReq.protocol === 'https';

  // IP addresses
  if (typeof req.socket.remoteAddress === 'string') {
    blazeReq.ip = req.socket.remoteAddress;
  }
  const forwardedFor = req.headers['x-forwarded-for'];
  blazeReq.ips = Array.isArray(forwardedFor)
    ? forwardedFor.flatMap(s => s.split(',').map(ip => ip.trim()))
    : typeof forwardedFor === 'string'
      ? forwardedFor.split(',').map(ip => ip.trim())
      : [];

  // Host information
  const rawHost = req.headers['host'];
  const hostValues: string[] = Array.isArray(rawHost)
    ? rawHost.filter((v): v is string => typeof v === 'string')
    : typeof rawHost === 'string'
      ? [rawHost]
      : [];
  if (hostValues.length > 0) {
    const firstValue = hostValues[0] as string;
    blazeReq.hostname = firstValue.split(':')[0] ?? '';
    blazeReq.host = firstValue;
    const portMatch = firstValue.match(/:(\d+)/) ?? [];
    blazeReq.port = parseInt(portMatch[1] ?? '0', 10);
  }

  // Request properties
  blazeReq.xhr = (req.headers['x-requested-with'] ?? '').toString().toLowerCase() === 'xmlhttprequest';
  blazeReq.fresh = false; // TODO: Implement ETag/Last-Modified checking
  blazeReq.stale = true;
  blazeReq.method = (req.method ?? 'GET').toUpperCase() as HttpMethod;
  blazeReq.subdomains = blazeReq.hostname ? blazeReq.hostname.split('.').slice(0, -2) : [];

  // Accept headers parsing (cached)
  const acceptsHeaderRaw = Array.isArray(req.headers.accept)
    ? req.headers.accept.join(',')
    : (req.headers.accept ?? '');
  const acceptsList = acceptsHeaderRaw ? acceptsHeaderRaw.split(',').map(t => t.trim()) : [];
  blazeReq.accepts = function (): string[] {
    return acceptsList;
  };

  const acceptsCharsetRaw = Array.isArray(req.headers['accept-charset'])
    ? req.headers['accept-charset'][0]
    : req.headers['accept-charset'];
  const acceptsCharsetList = acceptsCharsetRaw ? acceptsCharsetRaw.split(',').map(c => c.trim()) : [];
  blazeReq.acceptsCharsets = function (): string[] {
    return acceptsCharsetList;
  };

  const acceptsEncodingRaw = Array.isArray(req.headers['accept-encoding'])
    ? req.headers['accept-encoding'].join(',')
    : (req.headers['accept-encoding'] ?? '');
  const acceptsEncodingList = acceptsEncodingRaw ? acceptsEncodingRaw.split(',').map(e => e.trim()) : [];
  blazeReq.acceptsEncodings = function (): string[] {
    return acceptsEncodingList;
  };

  const acceptsLanguageRaw = Array.isArray(req.headers['accept-language'])
    ? req.headers['accept-language'].join(',')
    : (req.headers['accept-language'] ?? '');
  const acceptsLanguageList = acceptsLanguageRaw ? acceptsLanguageRaw.split(',').map(l => l.trim()) : [];
  blazeReq.acceptsLanguages = function (): string[] {
    return acceptsLanguageList;
  };

  return blazeReq;
}

/** Parses request body based on Content-Type with simple safeguards.
 * @param req @type {BlazeRequest} - The request to parse the body of.
 * @returns @type {Promise<void>} - A promise that resolves when the body is parsed.
 */
export async function parseBody(req: BlazeRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    let body = '';
    const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);

    if (contentLength > 1024 * 1024) {
      reject(new Error('Request entity too large'));
      return;
    }

    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();

      if (body.length > 1024 * 1024) {
        reject(new Error('Request entity too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const contentType = req.headers['content-type'];

        if (contentType?.includes('application/json')) {
          req.body = JSON.parse(body || '{}') as JsonValue;
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
  body.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value ?? '');
    }
  });
  return params;
}
