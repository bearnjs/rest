import type { AerixRequest, HttpMethod, JsonValue } from '../types';
import type { IncomingMessage } from 'http';

/** Enhances a Node IncomingMessage with Aerix conveniences.
 * @param req @type {IncomingMessage} - The incoming message to enhance.
 * @returns @type {AerixRequest} - The enhanced incoming message.
 */
export function enhanceRequest(req: IncomingMessage): AerixRequest {
  const AerixReq = req as AerixRequest;

  // Header accessors - optimized
  function getHeader(this: AerixRequest, name: 'set-cookie'): string[] | undefined;
  function getHeader(this: AerixRequest, name: string): string | undefined;
  function getHeader(this: AerixRequest, name: string): string | string[] | undefined {
    const key = name.toLowerCase();
    if (key === 'set-cookie') {
      const val = this.headers['set-cookie'];
      return Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined;
    }
    const value = this.headers[key];
    if (Array.isArray(value)) return value.join(', ');
    return typeof value === 'string' ? value : undefined;
  }

  AerixReq.get = getHeader;
  AerixReq.header = getHeader;

  // URL properties
  if (typeof req.url === 'string') {
    AerixReq.originalUrl = req.url;
    AerixReq.path = req.url.split('?')[0] ?? '';
  }

  // Protocol & security
  AerixReq.protocol = (req.socket as unknown as { encrypted?: boolean }).encrypted ? 'https' : 'http';
  AerixReq.secure = AerixReq.protocol === 'https';

  // IP addresses
  if (typeof req.socket.remoteAddress === 'string') {
    AerixReq.ip = req.socket.remoteAddress;
  }
  const forwardedFor = req.headers['x-forwarded-for'];
  AerixReq.ips = Array.isArray(forwardedFor)
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
    AerixReq.hostname = firstValue.split(':')[0] ?? '';
    AerixReq.host = firstValue;
    const portMatch = firstValue.match(/:(\d+)/) ?? [];
    AerixReq.port = parseInt(portMatch[1] ?? '0', 10);
  }

  // Request properties
  AerixReq.xhr = (req.headers['x-requested-with'] ?? '').toString().toLowerCase() === 'xmlhttprequest';
  AerixReq.fresh = false; // TODO: Implement ETag/Last-Modified checking
  AerixReq.stale = true;
  AerixReq.method = (req.method ?? 'GET').toUpperCase() as HttpMethod;
  AerixReq.subdomains = AerixReq.hostname ? AerixReq.hostname.split('.').slice(0, -2) : [];

  // Accept headers parsing (cached and optimized)
  const acceptsHeaderRaw = Array.isArray(req.headers.accept)
    ? req.headers.accept.join(',')
    : (req.headers.accept ?? '');
  const acceptsList = acceptsHeaderRaw ? acceptsHeaderRaw.split(',').map(t => t.trim()) : [];
  AerixReq.accepts = function (): string[] {
    return acceptsList;
  };

  const acceptsCharsetRaw = Array.isArray(req.headers['accept-charset'])
    ? req.headers['accept-charset'][0]
    : req.headers['accept-charset'];
  const acceptsCharsetList = acceptsCharsetRaw ? acceptsCharsetRaw.split(',').map(c => c.trim()) : [];
  AerixReq.acceptsCharsets = function (): string[] {
    return acceptsCharsetList;
  };

  const acceptsEncodingRaw = Array.isArray(req.headers['accept-encoding'])
    ? req.headers['accept-encoding'].join(',')
    : (req.headers['accept-encoding'] ?? '');
  const acceptsEncodingList = acceptsEncodingRaw ? acceptsEncodingRaw.split(',').map(e => e.trim()) : [];
  AerixReq.acceptsEncodings = function (): string[] {
    return acceptsEncodingList;
  };

  const acceptsLanguageRaw = Array.isArray(req.headers['accept-language'])
    ? req.headers['accept-language'].join(',')
    : (req.headers['accept-language'] ?? '');
  const acceptsLanguageList = acceptsLanguageRaw ? acceptsLanguageRaw.split(',').map(l => l.trim()) : [];
  AerixReq.acceptsLanguages = function (): string[] {
    return acceptsLanguageList;
  };

  return AerixReq;
}

/** Parses request body based on Content-Type with simple safeguards.
 * @param req @type {AerixRequest} - The request to parse the body of.
 * @returns @type {Promise<void>} - A promise that resolves when the body is parsed.
 */
export async function parseBody(req: AerixRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);

    if (contentLength > 1024 * 1024) {
      reject(new Error('Request entity too large'));
      return;
    }

    // Use Buffer for better performance than string concatenation
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
