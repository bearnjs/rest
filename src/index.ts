export type * from './types';
export * from './decorators';
export { Router } from './routing/router';
export { BearnApp as Bearn } from './core/app';
export { BearnApp } from './core/app';
export { createCorsMiddleware } from './core/middlewares/cors';
export * from './validation/zod';

import { BearnApp } from './core/app';
import { Router } from './routing/router';

import type { AppOptions, RouterOptions } from './types';

/**
 * Creates a new Bearn REST application instance. This is the preferred method to initialize a Bearn application instead of directly instantiating {@link BearnApp}.
 *
 * @example
 * ```ts
 * import createApp from '@bearn/rest';
 *
 * const app = createApp({
 *   port: 3000,
 *   host: 'localhost',
 *   cors: {
 *     origin: 'http://localhost:3000',
 *     methods: ['GET', 'POST'],
 *   }
 * });
 *
 * app.start();
 * ```
 *
 * @param {AppOptions} [options] - Configuration options for the Bearn application.
 * @returns {BearnApp} A new configured Bearn application instance.
 */
export default function createApp(options?: AppOptions): BearnApp {
  return new BearnApp(options);
}

/**
 *  Creates a new Bearn router instance. This function allows you to set up a router with optional configurations.
 *
 * @example
 * ```ts
 * import createRouter from '@bearn/rest';
 *
 * const router = createRouter();
 * ```
 *
 * @example
 * ```ts
 * import createRouter from '@bearn/rest';
 *
 * const router = createRouter({
 *   prefix: '/admin',
 * });
 * ```
 *
 * @example
 * ```ts
 * import createRouter from '@bearn/rest';
 *
 * const router = createRouter({
 *   middlewares: [
 *     (req, res, next) => {
 *       console.log('Hello, world!');
 *       next();
 *     },
 *   ],
 * });
 * ```
 *
 * @param {RouterOptions} [options] - Configuration options for the Bearn router.
 * @returns {Router} A new configured Bearn router instance.
 */
export function createRouter(options?: RouterOptions): Router {
  return new Router(options);
}
