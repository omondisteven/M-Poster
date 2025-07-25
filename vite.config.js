// vite.config.js
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { resolve } from "node:path";
import path from 'path';
// import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite({ autoCodeSplitting: true }), viteReact(), tailwindcss()],
  server: {
    historyApiFallback: true, // 👈 for dev server fallback
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
  resolve: {
    alias: {
      // '@': resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      '@tanstack/react-router-devtools'
    ],
  },
})


