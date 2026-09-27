import alias from '@rollup/plugin-alias';
import { baseConfig } from '@nativescript/vite/base';
import solid from '@solidjs/vite-plugin';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { defineConfig, mergeConfig } from 'vite';

const require = createRequire(import.meta.url);
const packageDir = (spec: string) => dirname(require.resolve(`${spec}/package.json`));

// Solid 2's exports map resolves `node` to the SSR build, which renders once and
// never updates. Every entry point is pinned to an explicit browser bundle so the
// app and the renderer also share a single reactive core.
const solidAliases = (prod: boolean) => ({
  'solid-js': join(packageDir('solid-js'), 'dist', prod ? 'solid.js' : 'dev.js'),
  '@solidjs/signals': join(packageDir('@solidjs/signals'), 'dist', prod ? 'prod/index.js' : 'dev.js'),
  '@solidjs/universal': join(
    dirname(require.resolve('@solidjs/universal')),
    prod ? 'universal.js' : 'dev.js'
  ),
});

export default defineConfig(({ mode }) => {
  const prod = mode !== 'development';

  return mergeConfig(baseConfig({ mode, flavor: 'solid' }), {
    plugins: [
      { ...alias({ entries: solidAliases(prod) }), enforce: 'pre' },
      solid({
        dev: !prod,
        // NativeScript's dev-server runtime drives module replacement itself.
        refresh: { disabled: true },
        solid: {
          generate: 'universal',
          hydratable: false,
          moduleName: '@nativescript-community/solid-js',
        },
      }),
    ],
    optimizeDeps: {
      // `solid-navigation` ships .jsx in its published dist; pre-bundling it
      // concatenates the JSX into a .js the Solid plugin never sees, and
      // import analysis then aborts the dev server.
      exclude: ['module', 'node:module', '@nativescript/vite/solid-bootstrap', 'solid-navigation'],
    },
  });
});
