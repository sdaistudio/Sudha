import { useState } from 'react'
import { HORIZONS, type Horizon } from '../content/site'
import { SectionHeader, SudhaSays } from './ui/Bits'
import { TabPanel, Tabs } from './ui/Tabs'

export function Horizons() {
  const [id, setId] = useState<Horizon['id']>('notify')
  const h = HORIZONS.find((x) => x.id === id)!
  return (
    <section id="horizons" aria-labelledby="horizons-title" className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeader id="horizons-title" eyebrow="Three horizons" title="From a timely nudge to a trusted work companion." intro="Proposed roadmap capabilities, planned in monthly releases. Select a horizon to see an example." />
        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Tabs
            idBase="horizon"
            label="Horizons"
            items={HORIZONS.map((x, i) => ({
              id: x.id,
              label: (
                <span className="flex w-full items-baseline gap-5 text-left">
                  <span className="tabular text-xs text-teal">0{i + 1}</span>
                  <span className="flex-1">
                    <span className="display block text-4xl sm:text-5xl">{x.label}</span>
                    <span className="mt-2 block text-sm font-normal leading-relaxed text-muted">{x.summary}</span>
                  </span>
                </span>
              ),
            }))}
            value={id}
            onChange={setId}
            className="!flex-col !gap-0"
            tabClassName={(active) =>
              `w-full border-t border-line py-7 text-left transition-colors last:border-b ${active ? 'text-navy' : 'text-navy/40 hover:text-navy/70'}`
            }
          />
          <TabPanel idBase="horizon" id={id} className="lg:sticky lg:top-28 lg:self-start">
            <div key={h.id} className="animate-fade-in rounded-[1.75rem] bg-navy p-6 text-ivory sm:p-10 on-dark">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow !text-[#7fd1c9]">{h.label}</p>
                <span className="chip bg-white/10 text-ivory/80">{h.months} · proposed</span>
              </div>
              <div className="mt-8 rounded-2xl bg-ivory p-5 text-ink">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{h.example.title}</p>
                <ul className="mt-3 space-y-2">
                  {h.example.lines.map((l) => (
                    <li key={l} className="border-t border-line pt-2 text-[0.95rem] first:border-0 first:pt-0">
                      {l}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[0.7rem] text-muted">Illustrative example · synthetic data</p>
              </div>
              <SudhaSays className="mt-6" live>
                {h.sudha}
              </SudhaSays>
            </div>
          </TabPanel>
        </div>
      </div>
    </section>
  )
}
