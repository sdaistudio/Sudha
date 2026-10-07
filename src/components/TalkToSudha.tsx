import { Info, RotateCcw, SendHorizontal, Square } from 'lucide-react'
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { ROLES, roleById } from '../data/fixtures'
import type { RoleId } from '../data/types'
import { AskSudhaFilm } from './AskSudhaFilm'
import { useDemo } from './DemoContext'
import { SectionHeader, SudhaSays } from './ui/Bits'

const API_URL: string = import.meta.env.VITE_CHAT_API_URL || '/api/chat'
const MAX_CHARS = 1200

const STARTERS: Record<RoleId, string[]> = {
  so: ['How am I doing this month?', 'Which of my branches should I visit first?', 'How can I improve my lead conversion?'],
  tm: ['Summarise my territory for today.', 'How should I coach Rohan on branch coverage?', 'Why is conversion below target and what can I do?'],
  rm: ['Which territories need my attention this week?', 'Draft an agenda for my weekly review.', 'How do I lift conversion without hurting activity?'],
  zh: ['Branch visit is high but conversion is low — why?', 'What should I raise in the zonal review?', 'Give me three priorities for the rest of the month.'],
  lead: ['How is the channel tracking against pace?', 'Where are the biggest gaps to target?', 'What does the Sudha roadmap deliver by March 2027?'],
}

type Msg = { role: 'user' | 'assistant'; content: string; error?: boolean }

export function TalkToSudha() {
  const { role, setRole } = useDemo()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  // A different role means a different span: start a fresh conversation.
  useEffect(() => {
    abortRef.current?.abort()
    setMsgs([])
    setBusy(false)
  }, [role])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs])

  const send = async (text: string) => {
    const t = text.trim()
    if (!t || busy || t.length > MAX_CHARS) return
    const history: Msg[] = [...msgs.filter((m) => !m.error), { role: 'user', content: t }]
    setMsgs([...history, { role: 'assistant', content: '' }])
    setInput('')
    setBusy(true)
    const ctrl = new AbortController()
    abortRef.current = ctrl
    const update = (content: string, error = false) =>
      setMsgs((m) => {
        const next = m.slice()
        next[next.length - 1] = { role: 'assistant', content, error }
        return next
      })
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, messages: history.map(({ role: r, content }) => ({ role: r, content })) }),
        signal: ctrl.signal,
      })
      if (!res.ok || !res.body) {
        let msg = 'Sudha is unavailable right now. Please try again shortly.'
        if (res.status === 404 || res.status === 405) msg = 'Live chat is not connected on this copy of the site. It runs on the Vercel deployment, where the secure chat service is hosted.'
        else {
          try {
            msg = ((await res.json()) as { error?: string }).error ?? msg
          } catch {
            /* keep default */
          }
        }
        update(msg, true)
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        update(acc)
      }
      if (!acc.trim()) update('Sudha did not return an answer. Please try rephrasing.', true)
    } catch (e) {
      if ((e as Error).name === 'AbortError') update('(Stopped.)', true)
      else update('Could not reach Sudha. Check your connection and try again.', true)
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  return (
    <section id="chat" aria-labelledby="chat-title" className="bg-paper py-24 sm:py-32">
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <SectionHeader
            id="chat-title"
            eyebrow="Talk to Sudha"
            title={
              <>
                Ask Sudha <span className="italic">anything</span> about your business.
              </>
            }
            intro="A live conversation powered by an AI model. Sudha answers from your role’s synthetic demo data and the planned roadmap, and can discuss sales management, coaching and reviews."
          />
          <AskSudhaFilm />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="flex min-h-[34rem] flex-col overflow-hidden rounded-[1.75rem] border border-line bg-ivory/50">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
              <label className="flex items-center gap-2 text-sm text-navy">
                Speaking as
                <select value={role} onChange={(e) => setRole(e.target.value as RoleId)} className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm">
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMsgs([])} disabled={busy || msgs.length === 0}>
                <RotateCcw size={14} aria-hidden /> New conversation
              </button>
            </div>

            <div ref={logRef} role="log" aria-live="polite" aria-label="Conversation with Sudha" className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5" style={{ maxHeight: '32rem' }}>
              <SudhaSays label="Sudha · live">
                Hello {roleById(role).person}. I’m looking at {roleById(role).spanName}. What would you like to talk through?
              </SudhaSays>
              {msgs.map((m, i) =>
                m.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-navy px-4 py-2.5 text-[0.95rem] text-ivory">
                      <span className="sr-only">You: </span>
                      {m.content}
                    </p>
                  </div>
                ) : (
                  <SudhaSays key={i} label={m.error ? 'Sudha · notice' : 'Sudha · live'}>
                    {m.content ? <RichText text={m.content} /> : <TypingDots />}
                  </SudhaSays>
                ),
              )}
            </div>

            <form
              className="border-t border-line p-3 sm:p-4"
              onSubmit={(e) => {
                e.preventDefault()
                void send(input)
              }}
            >
              <div className="flex items-end gap-2">
                <label htmlFor="chat-input" className="sr-only">
                  Message Sudha
                </label>
                <textarea
                  id="chat-input"
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void send(input)
                    }
                  }}
                  placeholder="Ask about your span, coaching, reviews or the roadmap…"
                  className="max-h-40 min-h-[2.75rem] flex-1 resize-y rounded-2xl border border-line bg-paper px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-muted/70"
                />
                {busy ? (
                  <button type="button" className="btn btn-ghost" onClick={() => abortRef.current?.abort()} aria-label="Stop answer">
                    <Square size={14} aria-hidden />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" disabled={!input.trim() || input.length > MAX_CHARS} aria-label="Send message">
                    <SendHorizontal size={16} aria-hidden />
                  </button>
                )}
              </div>
              <p className={`mt-1.5 text-right text-[0.7rem] ${input.length > MAX_CHARS ? 'text-bad' : 'text-muted'}`}>
                {input.length}/{MAX_CHARS} · Enter to send, Shift+Enter for a new line
              </p>
            </form>
          </div>

          <aside className="space-y-5">
            <div>
              <p className="text-sm font-medium text-navy">Try asking</p>
              <ul className="mt-3 space-y-2">
                {STARTERS[role].map((s) => (
                  <li key={s}>
                    <button type="button" disabled={busy} onClick={() => void send(s)} className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-left text-sm text-navy transition-colors hover:border-navy disabled:opacity-50">
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 rounded-xl bg-indigo-soft/70 p-4 text-xs leading-relaxed text-indigo">
              <Info size={14} aria-hidden className="mt-0.5 shrink-0" />
              <p>
                Live AI responses can be wrong. Business figures are synthetic demo data, not SUD Life results. Don’t enter personal, customer or confidential information. Sudha won’t state SUD Life policy or product terms as fact.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1" aria-label="Sudha is typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </span>
  )
}

/** Minimal, safe renderer for model text: paragraphs, bullet/numbered lists, **bold**. No HTML injection. */
export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  const flush = () => {
    if (!list) return
    const Tag = list.ordered ? 'ol' : 'ul'
    blocks.push(
      <Tag key={blocks.length} className={`my-1.5 space-y-1 pl-5 ${list.ordered ? 'list-decimal' : 'list-disc'}`}>
        {list.items.map((it, i) => (
          <li key={i}>{bold(it)}</li>
        ))}
      </Tag>,
    )
    list = null
  }
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd()
    const ul = line.match(/^\s*[-*•]\s+(.*)$/)
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/)
    if (ul || ol) {
      const ordered = !!ol
      if (!list || list.ordered !== ordered) {
        flush()
        list = { ordered, items: [] }
      }
      list.items.push((ul ?? ol)![1])
      continue
    }
    flush()
    if (!line.trim()) continue
    const h = line.match(/^#{1,4}\s+(.*)$/)
    blocks.push(
      <p key={blocks.length} className={h ? 'mt-2 font-semibold text-navy' : 'my-1'}>
        {bold(h ? h[1] : line)}
      </p>,
    )
  }
  flush()
  return <div>{blocks}</div>
}

function bold(s: string): ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>))
}
