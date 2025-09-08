import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [vue()],
  base: './',
  css: {
    postcss: {
      plugins: [
        autoprefixer(), // Ajouter des options si nécessaire
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: /^~(.*)$/,
        replacement: '$1',
      },
      {
        find: '@/',
        replacement: `${path.resolve(__dirname, 'src')}/`,
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.scss'],
  },
  server: {
    port: 5173,
    proxy: {
      // Ajouter ici les configurations de proxy si nécessaire
    },
  },
  optimizeDeps: {
    include: ['tinymce/tinymce'], // Résolution pour TinyMCE
  },
});
