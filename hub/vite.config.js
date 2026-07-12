import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Served under /hub/ on the same domain as the main static site (see
   ../vercel.json rewrites) — base must match so built asset URLs
   resolve correctly. Output lands in ../hub-dist, a sibling of the
   repo root's other static assets, not inside hub/ itself. */
export default defineConfig({
  base: '/hub/',
  plugins: [react()],
  build: {
    outDir: '../hub-dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
