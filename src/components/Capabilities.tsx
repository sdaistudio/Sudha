import { ArrowRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { CAPABILITIES } from '../content/site'
import { useDemo } from './DemoContext'
import { SectionHeader } from './ui/Bits'

export function Capabilities() {
  const [open, setOpen] = useState<number>(1)
  const { setTab } = useDemo()
  const tryIt = (tab: NonNullable<(typeof CAPABILITIES)[number]['demoTab']>) => {
    setTab(tab)
    document.getElementById('demo')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    window.setTimeout(() => document.getElementById('demo-workspace')?.focus({ preventScroll: true }), 500)
  }
  return (
    <section id="capabilities" aria-labelledby="cap-title" className="bg-paper py-24 sm:py-32">
      <div className="container-x">
        <SectionHeader id="cap-title" eyebrow="What I do" title="One companion, eight capabilities." intro="Each track is planned as an independently shippable capability with its own data feed and success measure. Select one to see who it is for and how it could help." />
        <ul className="mt-14 border-b border-line">
          {CAPABILITIES.map((c) => {
            const isOpen = open === c.n
            const panelId = `cap-panel-${c.n}`
            return (
              <li key={c.n} className="border-t border-line">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? 0 : c.n)}
                    className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-3 py-6 text-left sm:grid-cols-[3.5rem_1fr_14rem_auto] sm:gap-6 sm:py-8"
                  >
                    <span className="tabular text-sm text-teal">{String(c.n).padStart(2, '0')}</span>
                    <span className={`display text-2xl transition-colors sm:text-[2.1rem] ${isOpen ? 'text-navy' : 'text-navy/75 group-hover:text-navy'}`}>
                      {c.title}
                      {c.enabling && <span className="chip ml-3 align-middle bg-teal-soft font-sans text-teal">Enabling layer</span>}
                    </span>
                    <span className="hidden text-sm text-muted sm:block">{c.cadence}</span>
                    <Plus size={20} aria-hidden className={`text-navy transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
                  </button>
                </h3>
                <div id={panelId} hidden={!isOpen} className="pb-10 sm:pl-[5rem]">
                  <div className="grid gap-8 animate-fade-in lg:grid-cols-[1.2fr_1fr]">
                    <div>
                      <p className="text-lg leading-relaxed text-ink">{c.summary}</p>
                      <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="eyebrow !text-[0.65rem]">Audience</dt>
                          <dd className="mt-2 leading-relaxed text-muted">{c.audience}</dd>
                        </div>
                        <div>
                          <dt className="eyebrow !text-[0.65rem]">Data source</dt>
                          <dd className="mt-2 leading-relaxed text-muted">{c.data}</dd>
                        </div>
                        <div>
                          <dt className="eyebrow !text-[0.65rem]">Intended benefit</dt>
                          <dd className="mt-2 leading-relaxed text-muted">{c.benefit}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="panel p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal sm:hidden">{c.cadence}</p>
                      <ul className="space-y-2.5 text-sm">
                        {c.example.map((e) => (
                          <li key={e} className="flex gap-2">
                            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-indigo" />
                            {e}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-[0.7rem] text-muted">Illustrative example · proposed capability</p>
                      {c.demoTab ? (
                        <button type="button" onClick={() => tryIt(c.demoTab!)} className="btn btn-primary btn-sm mt-5">
                          Try it in the demo <ArrowRight size={14} aria-hidden />
                        </button>
                      ) : (
                        <a href="#trust" className="btn btn-ghost btn-sm mt-5">
                          How it is governed <ArrowRight size={14} aria-hidden />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
