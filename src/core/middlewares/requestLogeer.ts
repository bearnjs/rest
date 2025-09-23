import type { Request, Response, NextFunction } from '../../types';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  const methodColors = {
    GET: '\x1b[32m',
    POST: '\x1b[33m',
    PUT: '\x1b[34m',
    DELETE: '\x1b[31m',
    PATCH: '\x1b[35m',
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method?.toUpperCase() ?? 'GET';
    const methodColor = methodColors[method as keyof typeof methodColors] || '\x1b[37m';
    const status = res.statusCode;
    const statusColor =
      status >= 500
        ? '\x1b[31m'
        : status >= 400
          ? '\x1b[33m'
          : status >= 300
            ? '\x1b[36m'
            : status >= 200
              ? '\x1b[32m'
              : '\x1b[37m';
    const timestamp = new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    // eslint-disable-next-line no-console
    console.log(
      `[${timestamp}] ` +
        `${methodColor}${method.padEnd(6)}${reset}` + // eslint-disable-line
        `${bold}${req.path ?? ''}${reset}  ` +
        `${statusColor}${status}${reset} ` + // eslint-disable-line
        `${bold}${duration}ms${reset}`
    );
  });

  next();
}

export default requestLogger;
