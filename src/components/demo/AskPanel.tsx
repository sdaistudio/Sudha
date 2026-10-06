import { ArrowRight, Info, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { askSudha, SUGGESTED_QUESTIONS, type DemoTab, type SudhaAnswer } from '../../data/ask'
import { roleById } from '../../data/fixtures'
import { useDemo } from '../DemoContext'
import { SudhaSays } from '../ui/Bits'

type Msg = { from: 'you'; text: string } | { from: 'sudha'; answer: SudhaAnswer }

export function AskPanel({ active }: { active: boolean }) {
  const { role, askSeed, setTab } = useDemo()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [q, setQ] = useState('')
  const logRef = useRef<HTMLDivElement>(null)
  const seenSeed = useRef<number | null>(null)

  const ask = (text: string) => {
    const t = text.trim()
    if (!t) return
    setMsgs((m) => [...m, { from: 'you', text: t }, { from: 'sudha', answer: askSudha(t, role) }])
    setQ('')
  }

  // A question sent from another panel ("Ask Sudha" buttons).
  useEffect(() => {
    if (askSeed && active && seenSeed.current !== askSeed.n) {
      seenSeed.current = askSeed.n
      ask(askSeed.q)
    }
  }, [askSeed, active])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs])

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
      <div>
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-indigo-soft/70 px-4 py-3 text-xs leading-relaxed text-indigo">
          <Info size={14} aria-hidden className="mt-0.5 shrink-0" />
          <p>Scripted answers computed from synthetic data — not a live AI model and not connected to any SUD Life system. The planned service is envisioned in Microsoft Teams.</p>
        </div>
        <div ref={logRef} className="max-h-[32rem] min-h-[16rem] space-y-4 overflow-y-auto rounded-2xl border border-line bg-ivory/40 p-4" role="log" aria-live="polite" aria-label="Conversation with Sudha">
          <SudhaSays>
            Hello {roleById(role).person}. Ask me about your span — {roleById(role).spanName}. I answer within your authorised view only.
          </SudhaSays>
          {msgs.map((m, i) =>
            m.from === 'you' ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-navy px-4 py-2.5 text-[0.95rem] text-ivory">
                  <span className="sr-only">You asked: </span>
                  {m.text}
                </p>
              </div>
            ) : (
              <AnswerView key={i} a={m.answer} onDrill={setTab} onSuggest={ask} />
            ),
          )}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            ask(q)
          }}
        >
          <label htmlFor="ask-input" className="sr-only">
            Ask Sudha a question
          </label>
          <input
            id="ask-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask about your branches, pace or priorities…"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-muted/70"
          />
          <button type="submit" className="btn btn-primary" disabled={!q.trim()} aria-label="Send question">
            <SendHorizontal size={16} aria-hidden />
          </button>
        </form>
      </div>
      <aside aria-labelledby="suggested-q">
        <p id="suggested-q" className="text-sm font-medium text-navy">
          Suggested questions
        </p>
        <ul className="mt-3 space-y-2">
          {SUGGESTED_QUESTIONS.map((s) => (
            <li key={s}>
              <button type="button" onClick={() => ask(s)} className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-left text-sm text-navy transition-colors hover:border-navy">
                {s}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted">Also try “What is branch active?” or a question outside your span to see how Sudha declines.</p>
      </aside>
    </div>
  )
}

function AnswerView({ a, onDrill, onSuggest }: { a: SudhaAnswer; onDrill: (t: DemoTab) => void; onSuggest: (q: string) => void }) {
  return (
    <SudhaSays label={a.supported ? 'Sudha' : 'Sudha · demo limitation'}>
      <div className="space-y-1.5">
        {a.lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
      {a.definition && (
        <p className="mt-3 border-t border-line pt-2 text-xs leading-relaxed text-muted">
          <span className="font-medium text-navy">Definition · </span>
          {a.definition}
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        <span className="font-medium text-navy">Scope · </span>
        {a.scope}
        <br />
        <span className="font-medium text-navy">As of · </span>
        {a.timestamp}
      </p>
      {a.drill && (
        <div className="mt-3 flex flex-wrap gap-2">
          {a.drill.map((d) => (
            <button key={d.label} type="button" onClick={() => onDrill(d.tab)} className="btn btn-ghost btn-sm">
              {d.label} <ArrowRight size={13} aria-hidden />
            </button>
          ))}
        </div>
      )}
      {a.suggestions && (
        <div className="mt-3 flex flex-wrap gap-2">
          {a.suggestions.map((s) => (
            <button key={s} type="button" onClick={() => onSuggest(s)} className="btn btn-ghost btn-sm">
              {s}
            </button>
          ))}
        </div>
      )}
    </SudhaSays>
  )
}
