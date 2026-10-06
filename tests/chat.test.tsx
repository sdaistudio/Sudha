import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleChat, LIMITS, validate } from '../server/chat'
import { buildContext, systemPrompt } from '../src/data/context'
import App from '../src/App'

const sse = (events: object[]) => {
  const enc = new TextEncoder()
  const body = events.map((e) => `event: x\ndata: ${JSON.stringify(e)}\n\n`).join('')
  return new ReadableStream<Uint8Array>({
    start(c) {
      // split mid-event to exercise buffering
      const bytes = enc.encode(body)
      c.enqueue(bytes.slice(0, 25))
      c.enqueue(bytes.slice(25))
      c.close()
    },
  })
}
const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://sudha.example/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) })
const ENV = { OPENAI_API_KEY: 'test-key' }
const ok = { role: 'tm', messages: [{ role: 'user', content: 'How are we doing?' }] }

describe('chat server', () => {
  it('streams text deltas from the Responses API and keeps the key server-side', async () => {
    const fetchMock = vi.fn(async () => new Response(sse([{ type: 'response.created' }, { type: 'response.output_text.delta', delta: 'Hello ' }, { type: 'response.output_text.delta', delta: 'Kavya.' }, { type: 'response.completed' }])))
    const res = await handleChat(req(ok), ENV, fetchMock as unknown as typeof fetch)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello Kavya.')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.openai.com/v1/responses')
    const sent = JSON.parse(init.body as string)
    expect(sent.stream).toBe(true)
    expect(sent.max_output_tokens).toBe(LIMITS.maxOutputTokens)
    expect(sent.instructions).toContain('SYNTHETIC')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-key')
  })
  it('returns 503 when no key is configured', async () => {
    expect((await handleChat(req(ok), {})).status).toBe(503)
  })
  it('rejects foreign origins unless allow-listed, and answers CORS preflight', async () => {
    const foreign = { origin: 'https://evil.example' }
    expect((await handleChat(req(ok, foreign), ENV)).status).toBe(403)
    const pre = await handleChat(new Request('https://sudha.example/api/chat', { method: 'OPTIONS', headers: { origin: 'https://sdaistudio.github.io' } }), { ...ENV, ALLOWED_ORIGINS: 'https://sdaistudio.github.io' })
    expect(pre.headers.get('Access-Control-Allow-Origin')).toBe('https://sdaistudio.github.io')
  })
  it('validates role, message shape and length', () => {
    expect(validate({ role: 'ceo', messages: ok.messages })).toHaveProperty('error')
    expect(validate({ role: 'tm', messages: [] })).toHaveProperty('error')
    expect(validate({ role: 'tm', messages: [{ role: 'system', content: 'x' }] })).toHaveProperty('error')
    expect(validate({ role: 'tm', messages: [{ role: 'user', content: 'x'.repeat(LIMITS.maxMessageChars + 1) }] })).toHaveProperty('error')
    const many = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }))
    many.push({ role: 'user', content: 'last' })
    const v = validate({ role: 'tm', messages: many })
    expect('messages' in v && v.messages.length).toBe(LIMITS.maxHistory)
  })
  it('returns a friendly 502 when OpenAI fails', async () => {
    const res = await handleChat(req(ok), ENV, (async () => new Response('nope', { status: 500 })) as unknown as typeof fetch)
    expect(res.status).toBe(502)
  })
})

describe('chat grounding context', () => {
  it('scopes SO names to the TM and SO views only', () => {
    expect(buildContext('tm')).toContain('Rohan Mehta')
    for (const role of ['rm', 'zh', 'lead'] as const) {
      const ctx = buildContext(role)
      for (const n of ['Rohan', 'Meera', 'Arjun', 'Farhan', 'Kiran']) expect(ctx, `${role} leaks ${n}`).not.toContain(n)
      expect(systemPrompt(role)).toContain('Do NOT name individual Sales Officers')
    }
  })
  it('includes computed KPIs, the roadmap and the guardrails', () => {
    const p = systemPrompt('tm')
    expect(p).toContain('Achievement vs pace: 56.7%')
    expect(p).toContain('Dec 2026 R4 Ask Sudha')
    expect(p).toMatch(/Never state real SUD Life policies/)
  })
})

describe('Talk to Sudha UI', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('sends the conversation and renders the streamed answer', async () => {
    const fetchMock = vi.fn(async () => new Response(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('**Pace:** 56.7%\n- Call Rohan')); c.close() } })))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<App />)
    const chat = within(document.getElementById('chat')!)
    await user.type(chat.getByLabelText('Message Sudha'), 'How are we doing?{Enter}')
    expect(await chat.findByText('Call Rohan')).toBeInTheDocument()
    expect(chat.getByText('Pace:').tagName).toBe('STRONG')
    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(body).toEqual({ role: 'tm', messages: [{ role: 'user', content: 'How are we doing?' }] })
  })
  it('explains when the live service is not connected on this host', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))
    const user = userEvent.setup()
    render(<App />)
    const chat = within(document.getElementById('chat')!)
    await user.click(chat.getByRole('button', { name: 'Summarise my territory for today.' }))
    expect(await chat.findByText(/not connected on this copy of the site/)).toBeInTheDocument()
  })
})
