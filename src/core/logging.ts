import type { ListenInfo, Route } from '../types';

/**
 * @function printStartupLog
 * Logs a startup summary for the server, including listen URLs and routes, in a human-readable format.
 * @param {ListenInfo} info - Contains server information such as addresses and port.
 * @param {Route[]} routes - An array of route objects, each containing a method and path.
 * @param {Object} options - Configuration options for logging.
 * @param {string} options.host - The host address of the server.
 * @param {boolean} [options.disableLogging=false] - If true, logging is disabled.
 * @param {boolean} [options.printRoutes=true] - If true, routes will be printed.
 * @param {string} options.appName - The name of the application.
 * @param {string} options.appVersion - The version of the application.
 * @returns {void} This function does not return a value.
 * @example
 * printStartupLog(info, routes, { host: 'localhost', appName: 'MyApp', appVersion: '1.0.0' });
 */
export function printStartupLog(
  info: ListenInfo,
  routes: Route[],
  options: {
    host: string;
    disableLogging?: boolean;
    printRoutes?: boolean;
    appName: string;
    appVersion: string;
  }
): void {
  if (options.disableLogging) return;

  const lines: string[] = [];
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  const gray = '\x1b[90m';
  const green = '\x1b[32m';

  lines.push('');
  lines.push(`${bold}${options.appName} v${options.appVersion} is running${reset}`);
  lines.push('');

  // Endpoints
  lines.push(`${bold}Endpoints:${reset}`);

  const seen = new Set<string>();
  for (const addr of info.addresses) {
    const isIPv6 = addr.includes(':');
    const display = isIPv6 ? `[${addr}]` : addr;
    const hostShown = addr === '127.0.0.1' ? 'localhost' : display;
    const url = `http://${hostShown}:${info.port}`;
    if (!seen.has(url)) {
      seen.add(url);
      lines.push(`${green}➜${reset}  ${url}`);
    }
  }

  if (info.addresses.length === 0) {
    const isPublicHost = options.host === '0.0.0.0' || options.host === '::' || options.host === '[::]';
    const isPrivateHost =
      options.host === 'localhost' ||
      options.host === '127.0.0.1' ||
      options.host === '::1' ||
      options.host === '[::1]';

    let hostForDisplay = options.host;
    if (isPublicHost) {
      hostForDisplay = 'localhost';
    } else if (isPrivateHost) {
      hostForDisplay = options.host === '127.0.0.1' ? 'localhost' : options.host;
    }

    const fallbackUrl = `http://${hostForDisplay}:${info.port}`;
    if (!seen.has(fallbackUrl)) {
      lines.push(`${green}➜${reset}  ${fallbackUrl}`);
    }
  }

  if (options.printRoutes ?? true) {
    lines.push('');
    lines.push(`${bold}Routes:${reset}`);

    const methodColors = {
      GET: '\x1b[32m',
      POST: '\x1b[33m',
      PUT: '\x1b[34m',
      DELETE: '\x1b[31m',
      PATCH: '\x1b[35m',
    };

    for (const r of routes) {
      const method = r.method.toUpperCase();
      const methodColor = methodColors[method as keyof typeof methodColors] || '\x1b[37m';
      lines.push(`  ${methodColor}${method.padEnd(6)}${reset} ${r.path}`);
    }
  }

  lines.push('');
  lines.push(`${gray}Node ${info.nodeVersion} | PID ${info.pid}${reset}`);
  lines.push('');

  const sink = (msg: string) => process.stdout.write(msg);
  sink(`${lines.join('\n')}\n`);
}
