import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 10000,
    host: true,
    allowedHosts: ['glowreaderfrontend.onrender.com'], // 👈 Add this line
  },
});
