import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // <-- Change 3000 to whatever port your backend app uses!
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
