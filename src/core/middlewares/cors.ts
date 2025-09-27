import type { Handler, CorsOptions, Request, Response, NextFunction } from '../../types';

/**
 * @function createCorsMiddleware
 * This function generates a middleware for handling Cross-Origin Resource Sharing (CORS) requests.
 * It sets the necessary CORS headers and manages preflight requests.
 *
 * @param {CorsOptions} options - Configuration options for the CORS middleware, including allowed methods, headers, and origins.
 *
 * @returns {Handler} A middleware function that processes incoming requests and applies CORS headers.
 *
 * @example
 * const corsOptions = {
 *   origin: ['https://example.com'],
 *   methods: ['GET', 'POST'],
 *   headers: ['Content-Type'],
 *   exposeHeaders: ['Authorization'],
 *   credentials: true,
 *   maxAgeSeconds: 600
 * };
 *
 * const corsMiddleware = createCorsMiddleware(corsOptions);
 * app.use(corsMiddleware);
 */
export function createCorsMiddleware(options: CorsOptions): Handler {
  const cors = options;

  const staticHeaders: Record<string, string> = {};
  if (cors.methods) staticHeaders['Access-Control-Allow-Methods'] = cors.methods.join(',');
  if (cors.headers) staticHeaders['Access-Control-Allow-Headers'] = cors.headers.join(',');
  if (cors.exposeHeaders) staticHeaders['Access-Control-Expose-Headers'] = cors.exposeHeaders.join(',');
  if (cors.credentials) staticHeaders['Access-Control-Allow-Credentials'] = 'true';
  if (typeof cors.maxAgeSeconds === 'number') {
    staticHeaders['Access-Control-Max-Age'] = String(Math.max(0, Math.floor(cors.maxAgeSeconds)));
  }

  return (req: Request, res: Response, next?: NextFunction) => {
    const origin = req.headers['origin'];
    const originHeader: string | undefined = Array.isArray(origin)
      ? (origin[0] as string)
      : typeof origin === 'string'
        ? origin
        : undefined;

    let allowOrigin = '*';
    if (typeof cors.origin === 'string') {
      allowOrigin = cors.origin;
    } else if (cors.origin instanceof RegExp) {
      allowOrigin = originHeader && cors.origin.test(originHeader) ? originHeader : 'null';
    } else if (Array.isArray(cors.origin)) {
      const list = cors.origin;
      const matched = list.some(o =>
        typeof o === 'string' ? o === originHeader : originHeader ? o.test(originHeader) : false
      );
      allowOrigin = matched && originHeader ? originHeader : 'null';
    }

    res.setHeader('Access-Control-Allow-Origin', allowOrigin);

    for (const [key, value] of Object.entries(staticHeaders)) {
      res.setHeader(key, value);
    }

    if (allowOrigin !== '*') res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    next?.();
  };
}
