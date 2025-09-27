import type { Handler, JsonValue, NextFunction, Request, Response } from '../types';

// Minimal runtime contract for schema objects (Zod or compatible)
type AnyZod = { parse: (input: unknown) => unknown };

/**
 * @typedef {Object} SchemaSet
 * @description Schema bag for validating different request parts.
 * @template TBody
 * @template TQuery
 * @template TParams
 * @property {AnyZod} [body] - Schema for request body validation.
 * @property {AnyZod} [query] - Schema for query parameters validation.
 * @property {AnyZod} [params] - Schema for URL parameters validation.
 * @property {Object} [__types__] - Phantom type holders for inference through helpers.
 * @property {TBody} [__types__.body] - Type for request body.
 * @property {TQuery} [__types__.query] - Type for query parameters.
 * @property {TParams} [__types__.params] - Type for URL parameters.
 */
export type SchemaSet<TBody = JsonValue, TQuery = Record<string, string>, TParams = Record<string, string>> = {
  body?: AnyZod;
  query?: AnyZod;
  params?: AnyZod;
  __types__?: { body: TBody; query: TQuery; params: TParams };
};

/**
 * @typedef {JsonValue} InferBody
 * @description Infers the type of the request body from the schema set.
 * @template S
 * @param {SchemaSet} S - The schema set to infer from.
 * @returns {JsonValue} The inferred type of the request body.
 */
export type InferBody<S extends SchemaSet> = S extends SchemaSet<infer TB, unknown, unknown> ? TB : JsonValue;

/**
 * @typedef {Record<string, string>} InferQuery
 * @description Infers the type of the query parameters from the schema set.
 * @template S
 * @param {SchemaSet} S - The schema set to infer from.
 * @returns {Record<string, string>} The inferred type of the query parameters.
 */
export type InferQuery<S extends SchemaSet> =
  S extends SchemaSet<unknown, infer TQ, unknown> ? TQ : Record<string, string>;

/**
 * @typedef {Record<string, string>} InferParams
 * @description Infers the type of the URL parameters from the schema set.
 * @template S
 * @param {SchemaSet} S - The schema set to infer from.
 * @returns {Record<string, string>} The inferred type of the URL parameters.
 */
export type InferParams<S extends SchemaSet> =
  S extends SchemaSet<unknown, unknown, infer TP> ? TP : Record<string, string>;

/**
 * @function validate
 * @description Create a validation middleware for the given schemas. Validates cookie-safe, fast-fail with 400 and a structured error payload.
 * @param {SchemaSet} schemas - The set of schemas to validate against.
 * @returns {Handler} The middleware handler function.
 */
export function validate(schemas: SchemaSet): Handler {
  /**
   * @function tryCoerceByIssues
   * @description Attempts to coerce input values based on validation issues.
   * @param {unknown} input - The input data to be coerced.
   * @param {Array<Object>} issues - The list of issues encountered during validation.
   * @returns {unknown} The coerced input data.
   */
  const tryCoerceByIssues = (
    input: unknown,
    issues: Array<{
      path: (string | number)[];
      code?: string;
      expected?: unknown;
      received?: unknown;
    }>
  ): unknown => {
    /**
     * @function setDeep
     * @description Helper to set a value at a deep path on a cloned structure.
     * @param {unknown} obj - The object to set the value on.
     * @param {Array<string|number>} path - The path to set the value at.
     * @param {unknown} value - The value to set.
     * @returns {unknown} The updated object.
     */
    const setDeep = (obj: unknown, path: (string | number)[], value: unknown): unknown => {
      if (path.length === 0) return value;
      if (obj === null || typeof obj !== 'object') return obj;
      const cloned = Array.isArray(obj) ? obj.slice() : { ...(obj as Record<string, unknown>) };
      const [head, ...tail] = path;
      const key = head as keyof typeof cloned;
      const current = (cloned as Record<string | number, unknown>)[key as string | number];
      (cloned as Record<string | number, unknown>)[key as string | number] = setDeep(current, tail, value);
      return cloned;
    };

    /**
     * @function coercePrimitive
     * @description Coerces a primitive value to the expected type.
     * @param {unknown} val - The value to coerce.
     * @param {unknown} expected - The expected type.
     * @returns {unknown} The coerced value.
     */
    const coercePrimitive = (val: unknown, expected: unknown): unknown => {
      if (typeof val === 'string') {
        const exp = String(expected);
        if (exp === 'number') {
          if (val.trim() === '') return val;
          const n = Number(val);
          return Number.isFinite(n) ? n : val;
        }
        if (exp === 'boolean') {
          const low = val.trim().toLowerCase();
          if (low === 'true') return true;
          if (low === 'false') return false;
          return val;
        }
      }
      return val;
    };

    let output = input;
    for (const issue of issues) {
      if (issue.code !== 'invalid_type') continue;
      // Attempt value coercion
      if (issue.path.length === 0) {
        output = coercePrimitive(output, issue.expected);
        continue;
      }
      /**
       * @function getDeep
       * @description Retrieves the current value at a specified path.
       * @param {unknown} obj - The object to retrieve the value from.
       * @param {Array<string|number>} path - The path to retrieve the value from.
       * @returns {unknown} The value at the specified path.
       */
      const getDeep = (obj: unknown, path: (string | number)[]): unknown => {
        let cur: unknown = obj;
        for (let j = 0; j < path.length; j++) {
          const key = path[j] as never;
          if (cur === null || typeof cur !== 'object') return undefined;
          cur = (cur as Record<string | number, unknown>)[key as string | number];
        }
        return cur;
      };
      const currentVal = getDeep(output, issue.path);
      const coerced = coercePrimitive(currentVal, issue.expected);
      if (coerced !== currentVal) {
        output = setDeep(output, issue.path, coerced);
      }
    }
    return output;
  };

  return (req: Request, res: Response, next?: NextFunction) => {
    try {
      if (schemas.params) {
        try {
          const parsed = schemas.params.parse(req.params);
          req.params = parsed as Record<string, string>;
        } catch (err) {
          const ze = err as {
            issues?: Array<{
              path: (string | number)[];
              message: string;
              code?: string;
              expected?: unknown;
              received?: unknown;
            }>;
          };
          const issues = Array.isArray(ze.issues) ? ze.issues : [];
          if (issues.length > 0) {
            const coerced = tryCoerceByIssues(req.params, issues);
            const parsed = schemas.params.parse(coerced);
            req.params = parsed as Record<string, string>;
          } else {
            throw err;
          }
        }
      }
      if (schemas.query) {
        try {
          const parsed = schemas.query.parse(req.query);
          req.query = parsed as Record<string, string>;
        } catch (err) {
          const ze = err as {
            issues?: Array<{
              path: (string | number)[];
              message: string;
              code?: string;
              expected?: unknown;
              received?: unknown;
            }>;
          };
          const issues = Array.isArray(ze.issues) ? ze.issues : [];
          if (issues.length > 0) {
            const coerced = tryCoerceByIssues(req.query, issues);
            const parsed = schemas.query.parse(coerced);
            req.query = parsed as Record<string, string>;
          } else {
            throw err;
          }
        }
      }
      if (schemas.body) {
        try {
          const parsed = schemas.body.parse(req.body ?? {});
          Reflect.set(req as object, 'body', parsed);
        } catch (err) {
          const ze = err as {
            issues?: Array<{
              path: (string | number)[];
              message: string;
              code?: string;
              expected?: unknown;
              received?: unknown;
            }>;
          };
          const issues = Array.isArray(ze.issues) ? ze.issues : [];
          if (issues.length > 0) {
            const coerced = tryCoerceByIssues(req.body ?? {}, issues);
            const parsed = schemas.body.parse(coerced);
            Reflect.set(req as object, 'body', parsed);
          } else {
            throw err;
          }
        }
      }
      next?.();
    } catch (err) {
      if (err && typeof err === 'object' && 'issues' in (err as Record<string, unknown>)) {
        const ze = err as {
          issues: Array<{ path: (string | number)[]; message: string; code?: string }>;
          name?: string;
        };
        const issues = Array.isArray(ze.issues) ? ze.issues : [];
        res.status(400).json({
          error: 'ValidationError',
          issues: issues.map(i => ({ path: i.path.join('.'), message: i.message, code: i.code ?? null })),
        } as unknown as JsonValue);
        return;
      }
      res.status(400).json({ error: 'ValidationError', message: (err as Error).message } as unknown as JsonValue);
    }
  };
}
