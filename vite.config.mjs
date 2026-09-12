import { defineConfig } from 'vite';
import istanbul from 'vite-plugin-istanbul';

const instrumentForCoverage = process.env.NODE_ENV === 'test';

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    instrumentForCoverage &&
      istanbul({
        include: 'src/*',
        exclude: ['node_modules', 'tests'],
        extension: ['.js'],
        requireEnv: false,
        forceBuildInstrument: true,
      }),
  ].filter(Boolean),
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});
