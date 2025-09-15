export * from './types';
export * from './decorators';
export { Router } from './routing/router';
export { BlazeApp as Blaze } from './core/app';

export default function createApp(): import('./core/app').BlazeApp {
  return new (require('./core/app').BlazeApp)();
}
