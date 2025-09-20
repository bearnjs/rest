import type { Handler, CorsOptions } from '../types';

/**
 * Creates a CORS middleware using the provided options.
 * The middleware sets standard CORS headers and handles preflight requests.
 * @param options @type {CorsOptions} - The options for the CORS middleware.
 * @returns @type {Handler} - The CORS middleware.
 */
export function createCorsMiddleware(options: CorsOptions): Handler {
  const cors = options;

  return (req, res, next) => {
    const origin = req.headers['origin'];
    const originHeader: string | undefined = Array.isArray(origin) ? origin[0] : origin; // eslint-disable-line @typescript-eslint/no-unsafe-assignment

    let allowOrigin = '*';
    if (typeof cors.origin === 'string') allowOrigin = cors.origin;
    else if (cors.origin instanceof RegExp)
      allowOrigin = originHeader && cors.origin.test(originHeader) ? originHeader : 'null';
    else if (Array.isArray(cors.origin)) {
      const list = cors.origin;
      const matched = list.some(o =>
        typeof o === 'string' ? o === originHeader : originHeader ? o.test(originHeader) : false
      );
      allowOrigin = matched && originHeader ? originHeader : 'null';
    }

    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    if (cors.methods) res.setHeader('Access-Control-Allow-Methods', cors.methods.join(','));
    if (cors.headers) res.setHeader('Access-Control-Allow-Headers', cors.headers.join(','));
    if (cors.exposeHeaders) res.setHeader('Access-Control-Expose-Headers', cors.exposeHeaders.join(','));
    if (cors.credentials) res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (typeof cors.maxAgeSeconds === 'number')
      res.setHeader('Access-Control-Max-Age', String(Math.max(0, Math.floor(cors.maxAgeSeconds))));
    if (allowOrigin !== '*') res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    next();
  };
}
