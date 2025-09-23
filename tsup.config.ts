import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/decorators.ts',
    'src/routing/router.ts',
    'src/core/app.ts',
    'src/core/logging.ts',
    'src/http/request.ts',
    'src/http/response.ts',
    'src/core/middlewares/requestLogeer.ts',
    'src/types.ts',
    'src/exceptions.ts',
    'src/core/middlewares/cors.ts',
    'src/validation/zod.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  minify: false,
  target: 'es2020',
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
  tsconfig: './tsconfig.json',
});
