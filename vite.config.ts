import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      // backend/ is a separate app (its dev server rewrites backend/.next constantly); the frontend never imports it.
      watch: process.env.DISABLE_HMR === 'true' ? null : { ignored: ['**/backend/**'] },
      // Forward API calls to the Next.js backend (backend/, `npm run dev:backend`).
      proxy: {
        '/api': { target: process.env.BACKEND_URL ?? 'http://localhost:4000', changeOrigin: true },
      },
    },
    preview: {
      proxy: {
        '/api': { target: process.env.BACKEND_URL ?? 'http://localhost:4000', changeOrigin: true },
      },
    },
  };
});
