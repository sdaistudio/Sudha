// Vercel Function: POST /api/chat — proxies "Talk to Sudha" to OpenAI.
// Set OPENAI_API_KEY (and optionally OPENAI_MODEL, ALLOWED_ORIGINS) in Vercel → Project → Settings → Environment Variables.
import { handleChat } from '../server/chat'

export default {
  fetch(request: Request) {
    return handleChat(request, process.env)
  },
}
