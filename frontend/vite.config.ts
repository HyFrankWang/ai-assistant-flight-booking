import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = Number(env.VITE_PORT || '3000')
  const API_TARGET = env.VITE_API_TARGET || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      port: PORT,
      proxy: {
        '/api': {
          target: API_TARGET,
          changeOrigin: true
        }
      }
    }
  }
})
