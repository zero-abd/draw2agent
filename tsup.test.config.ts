import { defineConfig } from 'tsup';

// One-off config for building the manual test harness (test-ipad.ts).
export default defineConfig({
  entry: ['test-ipad.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist-test',
  clean: true,
  sourcemap: false,
  dts: false,
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
});
