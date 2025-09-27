/**
 * @class PathUtils
 * @classdesc Utility class for handling and manipulating URL paths and query strings.
 */
export class PathUtils {
  /**
   * Normalize a given path by ensuring it starts with a leading slash and
   * removing any trailing slash, except for the root path.
   *
   * @static
   * @param {string} input - The path string to normalize.
   * @returns {string} The normalized path.
   * @example
   * // returns '/example/path'
   * PathUtils.normalizePath('example/path/');
   */
  static normalizePath(input: string): string {
    const raw = input || '/';
    let path = raw.startsWith('/') ? raw : `/${raw}`;
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path;
  }

  /**
   * Parse a query string from a URL into a record of key-value pairs.
   *
   * @static
   * @param {string} [url] - The URL containing the query string.
   * @returns {Record<string, string>} An object representing the parsed query parameters.
   * @example
   * // returns { key1: 'value1', key2: 'value2' }
   * PathUtils.parseQuery('http://example.com?key1=value1&key2=value2');
   */
  static parseQuery(url?: string): Record<string, string> {
    if (!url) return {};
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) return {};

    const queryString = url.slice(queryIndex + 1);
    if (!queryString) return {};

    const params: Record<string, string> = {};
    const parts = queryString.split('&');

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

  /**
   * Determine if a request should be handled by a mounted router based on the given path.
   *
   * @static
   * @param {Object} mounted - An object representing the mounted router with an optional path.
   * @param {string} [mounted.path] - The base path of the mounted router.
   * @param {string} pathname - The path of the incoming request.
   * @returns {boolean} True if the request should be handled by the mounted router, otherwise false.
   * @example
   * // returns true
   * PathUtils.shouldHandleWithMountedRouter({ path: '/api' }, '/api/users');
   */
  static shouldHandleWithMountedRouter(mounted: { path?: string }, pathname: string): boolean {
    if (!mounted.path) return true;
    if (mounted.path === '/') return true;
    if (pathname === mounted.path) return true;
    if (pathname.startsWith(`${mounted.path}/`)) return true;
    return false;
  }
}
