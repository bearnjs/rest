/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  entryPoints: ['./src/index.ts'],
  out: 'docs',
  exclude: ['dist', 'node_modules', 'examples'],
  tsconfig: 'tsconfig.json',
};

export default config;
