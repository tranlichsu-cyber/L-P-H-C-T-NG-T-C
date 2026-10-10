import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const target = new URL('dist/pdfjs/', root);
await mkdir(target, { recursive: true });
for (const directory of ['cmaps', 'standard_fonts', 'wasm']) {
  await cp(fileURLToPath(new URL(`node_modules/pdfjs-dist/${directory}`, root)), fileURLToPath(new URL(directory, target)), { recursive: true });
}
