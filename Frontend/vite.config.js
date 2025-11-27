import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",   // <-- ADD THIS
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Add this server block for dev, and Vercel will respect it
  server: {
    historyApiFallback: true
  }
})
