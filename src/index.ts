/**
 * Re-exports core types and interfaces used throughout Blaze.
 */
export * from './types';

/**
 * Re-exports decorators for defining controllers and routes.
 * Includes {@link Controller}, {@link Get}, {@link Post}, {@link Put}, {@link Patch}, {@link Delete} and {@link Custom}.
 */
export * from './decorators';

/**
 * Exports the Router class for manual route definition.
 */
export { Router } from './routing/router';

/**
 * Exports the main application class as both BlazeApp and Blaze.
 */
export { BlazeApp as Blaze } from './core/app';
export { BlazeApp } from './core/app';

/**
 * Exports NetworkType enum for configuring IP address types (IPv4/IPv6).
 */
export { NetworkType } from './types';

/**
 * Exports middleware factory for CORS (Cross-Origin Resource Sharing) support.
 */
export { createCorsMiddleware } from './core/cors';

import { BlazeApp } from './core/app';

import type { AppOptions } from './types';

/**
 * Creates a new Blaze application instance.
 *
 * This is the recommended way to create a new Blaze application rather than
 * instantiating {@link BlazeApp} directly.
 *
 * @example
 * ```ts
 * import createApp from 'blaze';
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
 * @param options - Configuration options for the Blaze application
 * @returns A new configured Blaze application instance
 */
export default function createApp(options?: AppOptions): BlazeApp {
  return new BlazeApp(options);
}
