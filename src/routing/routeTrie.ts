import type { HttpMethod, Route } from '../types';

/**
 * @interface
 * Represents a node in the Trie structure used for efficient route matching.
 */
export interface TrieNode {
  /**
   * @property {string} segment
   * The static part of the path at this node.
   */
  segment: string;

  /**
   * @property {Map<HttpMethod, Route>} handlers
   * A map of HTTP methods to their corresponding route handlers at this node.
   */
  handlers: Map<HttpMethod, Route>;

  /**
   * @property {Map<string, TrieNode>} children
   * A map of child nodes, keyed by their path segment.
   */
  children: Map<string, TrieNode>;

  /**
   * @property {TrieNode} [paramChild]
   * A child node that represents a parameterized path segment (e.g., :id).
   */
  paramChild?: TrieNode;

  /**
   * @property {TrieNode} [wildcardChild]
   * A child node that represents a wildcard path segment (e.g., *).
   */
  wildcardChild?: TrieNode;

  /**
   * @property {boolean} isParam
   * Indicates if this node represents a parameterized path segment.
   */
  isParam: boolean;

  /**
   * @property {string} [paramName]
   * The name of the parameter if this node is a parameter node.
   */
  paramName?: string | undefined;
}

/**
 * @interface
 * Represents the result of a search in the Trie, including the matched route and any parameters extracted from the path.
 */
export interface TrieSearchResult {
  /**
   * @property {Route} route
   * The route that was found in the Trie.
   */
  route: Route;

  /**
   * @property {Record<string, string>} params
   * A record of parameters extracted from the path, keyed by parameter name.
   */
  params: Record<string, string>;
}

/**
 * @class
 * A Trie-based structure for matching routes efficiently. It provides O(m) performance, where m is the number of segments in the URL.
 */
export class RouteTrie {
  /**
   * @private
   * @property {Map<HttpMethod, TrieNode>} methodTries
   * A map of HTTP methods to their root Trie nodes.
   */
  private methodTries = new Map<HttpMethod, TrieNode>();

  /**
   * Initializes the RouteTrie with root nodes for each HTTP method.
   */
  constructor() {
    const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    for (const method of methods) {
      this.methodTries.set(method, this.createTrieNode(''));
    }
  }

  /**
   * @private
   * @function
   * Creates a new Trie node.
   * @param {string} segment - The path segment for this node.
   * @param {boolean} [isParam=false] - Whether this node represents a parameterized segment.
   * @param {string} [paramName] - The name of the parameter if this is a parameter node.
   * @returns {TrieNode} A new TrieNode instance.
   */
  private createTrieNode(segment: string, isParam = false, paramName?: string): TrieNode {
    return {
      segment,
      handlers: new Map(),
      children: new Map(),
      isParam,
      paramName,
    };
  }

  /**
   * @private
   * @function
   * Splits a given path into its constituent segments for traversal in the Trie.
   * @param {string} path - The path to split.
   * @returns {string[]} An array of path segments.
   */
  private splitPath(path: string): string[] {
    if (path === '/') return [''];
    return path.split('/').filter(segment => segment !== '');
  }

  /**
   * @function
   * Inserts a new route into the Trie for a specified HTTP method.
   * @param {HttpMethod} method - The HTTP method for the route.
   * @param {Route} route - The route to insert.
   */
  insertRoute(method: HttpMethod, route: Route): void {
    const root = this.methodTries.get(method);
    if (!root) return;

    const segments = this.splitPath(route.path);
    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!segment) continue;

      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        current.paramChild ??= this.createTrieNode(segment, true, paramName);
        current = current.paramChild;
      } else if (segment === '*') {
        current.wildcardChild ??= this.createTrieNode(segment, true);
        current = current.wildcardChild;
        break;
      } else {
        if (!current.children.has(segment)) {
          current.children.set(segment, this.createTrieNode(segment));
        }
        const child = current.children.get(segment);
        if (child) {
          current = child;
        }
      }
    }

    current.handlers.set(method, route);
  }

  /**
   * @function
   * Searches for a route in the Trie based on the given HTTP method and path, returning the matched route and any extracted parameters.
   * @param {HttpMethod} method - The HTTP method to search for.
   * @param {string} path - The path to search for.
   * @returns {TrieSearchResult | null} A TrieSearchResult containing the matched route and parameters, or null if no match is found.
   */
  searchRoute(method: HttpMethod, path: string): TrieSearchResult | null {
    const root = this.methodTries.get(method);
    if (!root) return null;

    const segments = this.splitPath(path);
    const params: Record<string, string> = {};

    const search = (node: TrieNode, segmentIndex: number): Route | null => {
      if (segmentIndex >= segments.length) {
        return node.handlers.get(method) ?? null;
      }

      const segment = segments[segmentIndex];
      if (!segment) return null;

      const staticChild = node.children.get(segment);
      if (staticChild) {
        const result = search(staticChild, segmentIndex + 1);
        if (result) return result;
      }

      if (node.paramChild?.paramName) {
        params[node.paramChild.paramName] = segment;
        const result = search(node.paramChild, segmentIndex + 1);
        if (result) return result;
        delete params[node.paramChild.paramName];
      }

      // Try wildcard match
      if (node.wildcardChild) {
        const remainingSegments = segments.slice(segmentIndex);
        params['*'] = remainingSegments.join('/');
        return node.wildcardChild.handlers.get(method) ?? null;
      }

      return null;
    };

    const route = search(root, 0);
    return route ? { route, params } : null;
  }

  /**
   * @function
   * Retrieves all routes stored in the Trie. This can be useful for debugging or inspection purposes.
   * @returns {Route[]} An array of all routes in the Trie.
   */
  getAllRoutes(): Route[] {
    const routes: Route[] = [];

    const traverse = (node: TrieNode) => {
      for (const route of node.handlers.values()) {
        routes.push(route);
      }
      for (const child of node.children.values()) {
        traverse(child);
      }
      if (node.paramChild) traverse(node.paramChild);
      if (node.wildcardChild) traverse(node.wildcardChild);
    };

    for (const root of this.methodTries.values()) {
      traverse(root);
    }

    return routes;
  }
}
