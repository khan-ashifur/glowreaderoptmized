// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,           // <-- This allows Render to bind to 0.0.0.0
    port: 10000           // Optional: Render scans common ports, this helps
  }
})
