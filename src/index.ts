export type * from './types';
export * from './decorators';
export { Router } from './routing/router';
export { AerixApp as Aerix } from './core/app';
export { AerixApp } from './core/app';
export { createCorsMiddleware } from './core/middlewares/cors';

import { AerixApp } from './core/app';

import type { AppOptions } from './types';

/**
 * Creates a new Aerix REST application instance.
 *
 * This is the recommended way to create a new Aerix application rather than
 * instantiating {@link AerixApp} directly.
 *
 * @example
 * ```ts
 * import createApp from '@aerix/rest';
 *
 * const app = createApp({
 *   port: 3000,
 *   cors: {
 *     origin: 'http://localhost:3000',
 *     methods: ['GET', 'POST'],
 *   }
 * });
 *
 * app.start();
 * ```
 *
 * @param options - Configuration options for the Aerix application
 * @returns A new configured Aerix application instance
 */
export default function createApp(options?: AppOptions): AerixApp {
  return new AerixApp(options);
}
