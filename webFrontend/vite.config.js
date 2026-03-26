import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Forces Vite to use IPv4
    port: 5173,
    strictPort: true,   // Prevents Vite from switching to 5174 if 5173 is busy
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})