import { Handler, ControllerClass } from './types';

import type { RouteDefinition, RouteSchema } from './types';

interface ControllerRegistryItem {
  basePath: string;
  instance: any;
  routes: RouteDefinition[];
}

const controllers: ControllerRegistryItem[] = [];
const controllerMeta = new WeakMap<Function, { basePath: string }>();
const routesMeta = new WeakMap<Function, RouteDefinition[]>();
const controllerCtors: Function[] = [];

export function Controller(basePath: string = ''): ClassDecorator {
  return (target) => {
    controllerMeta.set(target, { basePath });
    controllerCtors.push(target);
  };
}

type RouteOptions = string | { path?: string; schema?: RouteSchema };
function createMethodDecorator(method: string) {
  return function (options: RouteOptions = ''): MethodDecorator {
    return (target, propertyKey) => {
      const path = typeof options === 'string' ? options : options.path || '';
      const schema = typeof options === 'string' ? undefined : options.schema;
      const ctor = target.constructor as Function;
      const existing = routesMeta.get(ctor) || [];
      existing.push({
        method,
        path,
        propertyKey: propertyKey as string,
        schema: schema as RouteSchema,
      });
      routesMeta.set(ctor, existing);
    };
  };
}

export const Get = createMethodDecorator('GET');
export const Post = createMethodDecorator('POST');
export const Put = createMethodDecorator('PUT');
export const Patch = createMethodDecorator('PATCH');
export const Delete = createMethodDecorator('DELETE');
export function Custom(method: string) {
  return createMethodDecorator(method);
}

export function getRegisteredControllers() {
  // Build registry once
  if (controllers.length > 0) return controllers;

  // materialize from metadata maps
  for (const ctor of controllerCtors) {
    const meta = controllerMeta.get(ctor) || { basePath: '' };
    const instance = new (ctor as any)();
    const routes = routesMeta.get(ctor) || [];
    controllers.push({ basePath: meta.basePath || '', instance, routes });
  }
  return controllers;
}
