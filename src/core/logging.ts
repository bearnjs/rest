import type { ListenInfo, Route } from '../types';

/**
 * Prints a friendly multi-line startup summary including listen URLs and routes.
 * @param info @type {ListenInfo} - The information about the server.
 * @param routes @type {Route[]} - The routes of the server.
 * @param options @type {{ host: string; disableLogging?: boolean; printRoutes?: boolean; logFn?: (message: string) => void; }} - The options for the logging.
 * @returns @type {void} - The underlying Node `Server` instance.
 */
export function printStartupLog(
  info: ListenInfo,
  routes: Route[],
  options: {
    host: string;
    disableLogging?: boolean;
    printRoutes?: boolean;
    logFn?: (message: string) => void;
  }
): void {
  if (options.disableLogging) return;

  const lines: string[] = [];
  lines.push('');
  lines.push(' Blaze is running');
  lines.push('');
  lines.push(' Listening:');
  const seen = new Set<string>();
  for (const addr of info.addresses) {
    const isIPv6 = addr.includes(':');
    const display = isIPv6 ? `[${addr}]` : addr;
    const isLocal = addr === '127.0.0.1' || addr === '::1' || addr === 'localhost';
    const hostShown = isLocal ? 'localhost' : display;
    const url = `http://${hostShown}:${info.port}`;
    if (!seen.has(url)) {
      seen.add(url);
      lines.push(`  • ${url}`);
    }
  }
  if (info.addresses.length === 0) {
    const hostForDisplay = options.host === '0.0.0.0' || options.host === '::' ? 'localhost' : options.host;
    const fallbackUrl = `http://${hostForDisplay}:${info.port}`;
    if (!seen.has(fallbackUrl)) {
      lines.push(`  • ${fallbackUrl}`);
    }
  }
  lines.push('');
  if (options.printRoutes ?? true) {
    lines.push(' Routes:');
    for (const r of routes) {
      lines.push(`  • ${r.method.padEnd(6)} ${r.path}`);
    }
    lines.push('');
  }
  lines.push(` Started at ${info.timestamp} | Node ${info.nodeVersion} | PID ${info.pid}`);
  const sink = options.logFn ?? ((msg: string) => process.stdout.write(msg));
  sink(`${lines.join('\n')}\n`);
}
