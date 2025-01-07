import { defineConfig } from 'vite'
import checker from "vite-plugin-checker"
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    checker({
      // e.g. use TypeScript check
      typescript: true,
    }),
  ],
})
