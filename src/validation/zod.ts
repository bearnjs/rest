import type {
  ExtractPathParams,
  Handler,
  JsonValue,
  NextFunction,
  RouteHandler,
  TypedRequest,
  TypedResponse,
} from '../types';

// Minimal runtime contract for schema objects (Zod or compatible)
type AnyZod = { parse: (input: unknown) => unknown };

/** Schema bag for validating different request parts */
export type SchemaSet<TBody = JsonValue, TQuery = Record<string, string>, TParams = Record<string, string>> = {
  body?: AnyZod;
  query?: AnyZod;
  params?: AnyZod;
  // Phantom type holders for inference through helpers
  __types__?: { body: TBody; query: TQuery; params: TParams };
};

export type InferBody<S extends SchemaSet> = S extends SchemaSet<infer TB, unknown, unknown> ? TB : JsonValue;
export type InferQuery<S extends SchemaSet> =
  S extends SchemaSet<unknown, infer TQ, unknown> ? TQ : Record<string, string>;
export type InferParams<S extends SchemaSet> =
  S extends SchemaSet<unknown, unknown, infer TP> ? TP : Record<string, string>;

/**
 * Create a validation middleware for the given schemas.
 * Validates cookie-safe, fast-fail with 400 and a structured error payload.
 */
export function validate(schemas: SchemaSet): Handler {
  return (req, res, next) => {
    try {
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params ?? {});
        req.params = parsed as Record<string, string>;
      }
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query ?? {});
        req.query = parsed as Record<string, string>;
      }
      if (schemas.body) {
        const parsed = schemas.body.parse(req.body ?? {});
        req.body = parsed as JsonValue;
      }
      next();
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

/**
 * Wrap a route handler with Zod validation and strong typing.
 * Returns a typed RouteHandler compatible with Router methods.
 */
export function withValidation<TPath extends string, S extends SchemaSet, TResponse extends JsonValue = JsonValue>(
  schemas: S,
  handler: (
    req: TypedRequest<InferParams<S> & ExtractPathParams<TPath>, InferQuery<S>, InferBody<S>>,
    res: TypedResponse<TResponse>,
    next: NextFunction
  ) => void | Promise<void>
): RouteHandler<InferParams<S> & ExtractPathParams<TPath>, InferQuery<S>, InferBody<S>, TResponse> {
  const mw = validate(schemas);
  return (req, res, next) => {
    void mw(req as unknown as never, res as unknown as never, (err?: Error) => {
      if (err) {
        next(err);
        return;
      }
      const maybe = handler(
        req as unknown as TypedRequest<InferParams<S> & ExtractPathParams<TPath>, InferQuery<S>, InferBody<S>>,
        res as unknown as TypedResponse<TResponse>,
        next
      );
      if (maybe instanceof Promise) void maybe.catch(e => next(e instanceof Error ? e : new Error(String(e))));
    });
  };
}
