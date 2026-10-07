import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/3d-facility/',
  build: {
    outDir: '../public/3d-facility',
    emptyOutDir: true,
  },
});
