/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleChat } from './server/chat'

/** Serves POST /api/chat during `npm run dev`, reading OPENAI_API_KEY from .env.local. */
function devChatApi(env: Record<string, string>): Plugin {
  return {
    name: 'sudha-dev-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const c of req) chunks.push(c as Buffer)
        const request = new Request(`http://${req.headers.host}${req.originalUrl ?? '/api/chat'}`, {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        })
        const response = await handleChat(request, env)
        res.statusCode = response.status
        response.headers.forEach((v, k) => res.setHeader(k, v))
        if (!response.body) return res.end()
        const reader = response.body.getReader()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(value)
        }
        res.end()
      })
    },
  }
}

// `base` is configurable so the site can be hosted under any sub-path:
//   SUDHA_BASE=/sudha/ npm run build
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: process.env.SUDHA_BASE ?? '/',
    plugins: [react(), tailwindcss(), devChatApi(env)],
    server: {
      // The project lives in iCloud Drive; keep the watcher away from synced build/dependency folders.
      watch: { ignored: ['**/node_modules.nosync/**', '**/dist/**'] },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      css: false,
      include: ['tests/**/*.test.{ts,tsx}'],
    },
  }
})
