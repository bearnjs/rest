import { Blaze } from './blaze';

export { Blaze };
export { Router } from './router';
export * from './types';

export default function createApp(): Blaze {
    return new Blaze();
}