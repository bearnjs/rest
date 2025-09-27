/* eslint-disable prettier/prettier */
import type { ControllerClass, RouteDefinition, RouteSchema, HttpMethod, Handler } from './types';

/**
 * @interface
 * Represents an item in the controller registry.
 * @private
 */
interface ControllerRegistryItem {
  /** @type {string} The base path for the controller. */
  basePath: string;
  /** @type {object} The instance of the controller. */
  instance: object;
  /** @type {RouteDefinition[]} The routes associated with the controller. */
  routes: RouteDefinition[];
}

/** @type {ControllerRegistryItem[]} The list of registered controllers. */
const controllers: ControllerRegistryItem[] = [];
/** @type {WeakMap<ControllerClass, { basePath: string }>} Metadata for controllers. */
const controllerMeta = new WeakMap<ControllerClass, { basePath: string }>();
/** @type {WeakMap<ControllerClass, RouteDefinition[]>} Metadata for routes. */
const routesMeta = new WeakMap<ControllerClass, RouteDefinition[]>();
/** @type {ControllerClass[]} List of controller constructors. */
const controllerCtors: ControllerClass[] = [];

/**
 * Decorator to mark a class as a controller and set a base path.
 * @param {string} [basePath=''] - The base path for the controller.
 * @returns {ClassDecorator} The decorator for the controller.
 */
export function Controller(basePath: string = ''): ClassDecorator {
  return target => {
    controllerMeta.set(target as unknown as ControllerClass, { basePath });
    controllerCtors.push(target as unknown as ControllerClass);
  };
}

/**
 * @typedef {string | Object} RouteOptions
 * @property {string} [path] - The path for the route.
 * @property {RouteSchema} [schema] - The route schema metadata.
 * @property {Handler | Handler[]} [middlewares] - Middleware(s) to run before the route handler.
 * @private
 */
type RouteOptions =
  | string
  | {
      path?: string;
      schema?: RouteSchema;
      middlewares?: Handler | Handler[];
    };

/**
 * Creates a method decorator for a given HTTP method.
 * @param {HttpMethod} method - The HTTP method to create a decorator for.
 * @returns {MethodDecorator} The decorator for the HTTP method.
 */
function createMethodDecorator(method: HttpMethod) {
  return function (options: RouteOptions = ''): MethodDecorator {
    return (target, propertyKey) => {
      const path = typeof options === 'string' ? options : (options.path ?? '');
      const schema = typeof options === 'string' ? undefined : options.schema;
      const middlewares = typeof options === 'string' ? undefined : options.middlewares;
      const ctor = target.constructor as ControllerClass;
      const existing = routesMeta.get(ctor) ?? [];
      existing.push({
        method,
        path,
        propertyKey: propertyKey as string,
        ...(schema ? { schema } : {}),
        ...(middlewares ? { middlewares: Array.isArray(middlewares) ? middlewares : [middlewares] } : {}),
      });
      routesMeta.set(ctor, existing);
    };
  };
}

/**
 * Decorator for GET requests.
 * @param {RouteOptions} options - The options for the GET request.
 * @returns {MethodDecorator} The decorator for the GET request.
 */
export const Get = createMethodDecorator('GET');

/**
 * Decorator for POST requests.
 * @param {RouteOptions} options - The options for the POST request.
 * @returns {MethodDecorator} The decorator for the POST request.
 */
export const Post = createMethodDecorator('POST');

/**
 * Decorator for PUT requests.
 * @param {RouteOptions} options - The options for the PUT request.
 * @returns {MethodDecorator} The decorator for the PUT request.
 */
export const Put = createMethodDecorator('PUT');

/**
 * Decorator for PATCH requests.
 * @param {RouteOptions} options - The options for the PATCH request.
 * @returns {MethodDecorator} The decorator for the PATCH request.
 */
export const Patch = createMethodDecorator('PATCH');

/**
 * Decorator for DELETE requests.
 * @param {RouteOptions} options - The options for the DELETE request.
 * @returns {MethodDecorator} The decorator for the DELETE request.
 */
export const Delete = createMethodDecorator('DELETE');

/**
 * Decorator factory for custom HTTP methods.
 * @param {HttpMethod} method - The HTTP method to create a decorator for.
 * @returns {MethodDecorator} The decorator for the custom HTTP method.
 */
export function Custom(method: HttpMethod) {
  return createMethodDecorator(method);
}

/**
 * Returns the list of controllers materialized from decorator metadata.
 * This is built only once and cached.
 * @returns {ControllerRegistryItem[]} The list of controllers.
 */
export function getRegisteredControllers(): ControllerRegistryItem[] {
  // Build registry once
  if (controllers.length > 0) return controllers;

  // Materialize from metadata maps - optimized
  const length = controllerCtors.length;
  for (let i = 0; i < length; i++) {
    const ctor = controllerCtors[i];
    if (!ctor) continue;

    const meta = controllerMeta.get(ctor) ?? { basePath: '' };
    const instance = new ctor();
    const routes = routesMeta.get(ctor) ?? [];
    controllers.push({ basePath: meta.basePath, instance, routes });
  }
  return controllers;
}
