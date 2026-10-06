/**
 * Live "Talk to Sudha" handler. Runs server-side only (Vercel function or the
 * Vite dev middleware). The OpenAI key is read from the environment and never
 * reaches the browser.
 */
import { ROLE_IDS, systemPrompt } from '../src/data/context'
import type { RoleId } from '../src/data/types'

export interface ChatEnv {
  OPENAI_API_KEY?: string
  OPENAI_MODEL?: string
  /** Comma-separated list of browser origins allowed to call the API (e.g. the GitHub Pages site). */
  ALLOWED_ORIGINS?: string
}

export const LIMITS = {
  maxMessageChars: 1200,
  maxHistory: 12,
  maxOutputTokens: 700,
  rateWindowMs: 10 * 60 * 1000,
  rateMax: 30,
}

export const DEFAULT_MODEL = 'gpt-6.1-sol'

type Msg = { role: 'user' | 'assistant'; content: string }

// Best-effort per-instance rate limit. Serverless instances do not share memory;
// set an OpenAI project spend limit as the real backstop.
const hits = new Map<string, number[]>()
export function rateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < LIMITS.rateWindowMs)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > LIMITS.rateMax
}

function corsHeaders(request: Request, env: ChatEnv): Record<string, string> {
  const origin = request.headers.get('origin')
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  if (origin && allowed.includes(origin)) {
    return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' }
  }
  return {}
}

function originAllowed(request: Request, env: ChatEnv): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // same-origin requests from some browsers / server tools
  const self = new URL(request.url).origin
  if (origin === self) return true
  return (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).includes(origin)
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } })

export function validate(body: unknown): { role: RoleId; messages: Msg[] } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request.' }
  const { role, messages } = body as { role?: unknown; messages?: unknown }
  if (typeof role !== 'string' || !ROLE_IDS.includes(role as RoleId)) return { error: 'Unknown role.' }
  if (!Array.isArray(messages) || messages.length === 0) return { error: 'No messages.' }
  const clean: Msg[] = []
  for (const m of messages.slice(-LIMITS.maxHistory)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') return { error: 'Invalid message.' }
    const content = m.content.trim()
    if (!content) continue
    if (m.role === 'user' && content.length > LIMITS.maxMessageChars) return { error: `Please keep messages under ${LIMITS.maxMessageChars} characters.` }
    clean.push({ role: m.role, content: content.slice(0, 4000) })
  }
  if (clean.length === 0 || clean[clean.length - 1].role !== 'user') return { error: 'The last message must be from the user.' }
  return { role: role as RoleId, messages: clean }
}

/** Converts OpenAI's SSE stream into a plain UTF-8 text stream of answer deltas. */
export function toTextStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''
  return upstream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''
        for (const ev of events) {
          for (const line of ev.split('\n')) {
            if (!line.startsWith('data:')) continue
            const data = line.slice(5).trim()
            if (!data || data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data) as { type?: string; delta?: string; message?: string }
              if (parsed.type === 'response.output_text.delta' && parsed.delta) controller.enqueue(encoder.encode(parsed.delta))
              if (parsed.type === 'error') controller.enqueue(encoder.encode('\n\n[Sudha could not finish this answer. Please try again.]'))
            } catch {
              /* ignore keep-alives and partial lines */
            }
          }
        }
      },
    }),
  )
}

export async function handleChat(request: Request, env: ChatEnv, fetchImpl: typeof fetch = fetch): Promise<Response> {
  const cors = corsHeaders(request, env)
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' }, cors)
  if (!originAllowed(request, env)) return json(403, { error: 'Origin not allowed.' }, cors)
  if (!env.OPENAI_API_KEY) return json(503, { error: 'Live chat is not configured yet. Add OPENAI_API_KEY in the hosting settings.' }, cors)

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) return json(429, { error: 'You have sent a lot of messages. Please wait a few minutes.' }, cors)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'Invalid JSON.' }, cors)
  }
  const v = validate(body)
  if ('error' in v) return json(400, { error: v.error }, cors)

  const upstream = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || DEFAULT_MODEL,
      instructions: systemPrompt(v.role),
      input: v.messages.map((m) => ({ role: m.role, content: m.content })),
      max_output_tokens: LIMITS.maxOutputTokens,
      stream: true,
      store: false,
    }),
  })
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    console.error('OpenAI error', upstream.status, detail.slice(0, 500))
    return json(502, { error: 'Sudha is unavailable right now. Please try again shortly.' }, cors)
  }
  return new Response(toTextStream(upstream.body), {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...cors },
  })
}
