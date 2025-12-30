
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/LabelGenerator/', // Matches your repo name: danielsrepa.github.io/LabelGenerator/
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
