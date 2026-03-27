import * as esbuild from 'esbuild';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [join(__dirname, 'src/ui/webview/app/index.tsx')],
  bundle: true,
  outfile: 'dist/webview/index.js',
  platform: 'browser',
  target: 'es2022',
  sourcemap: true,
  format: 'iife',
  jsx: 'automatic',
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
});
