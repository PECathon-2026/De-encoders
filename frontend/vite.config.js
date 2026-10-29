import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [ react(), tailwindcss() ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      // Stabilise HMR — prevents reloads triggered by unrelated socket errors.
      clientPort: 5173,
    },
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
      "/list-files": {
        target: process.env.VITE_BACKEND_URL || "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
      "/read-files": {
        target: process.env.VITE_BACKEND_URL || "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
      "/update-files": {
        target: process.env.VITE_BACKEND_URL || "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
      "/run-command": {
        target: process.env.VITE_BACKEND_URL || "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
      "/git-diff": {
        target: process.env.VITE_BACKEND_URL || "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
