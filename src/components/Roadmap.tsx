import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { FUTURE_SCOPE, PACING, ROADMAP_A, ROADMAP_B, TRACK_GRID } from '../content/site'
import { SectionHeader } from './ui/Bits'
import { TabPanel, Tabs } from './ui/Tabs'

type Pace = 'a' | 'b'

const CELL: Record<string, string> = {
  release: 'bg-navy text-ivory',
  build: 'bg-indigo-soft text-indigo',
  enhance: 'border border-indigo/40 text-indigo',
  '': '',
}

export function Roadmap() {
  const [pace, setPace] = useState<Pace>('a')
  const [month, setMonth] = useState('oct')
  const months = pace === 'a' ? ROADMAP_A.map((m) => ({ key: m.key, month: m.month, release: m.release })) : ROADMAP_B
  const selA = ROADMAP_A.find((m) => m.key === month)
  const selB = ROADMAP_B.find((m) => m.key === month)
  const changePace = (p: Pace) => {
    setPace(p)
    if (p === 'a' && !ROADMAP_A.some((m) => m.key === month)) setMonth(month === 'sep' ? 'oct' : 'mar')
  }

  return (
    <section id="roadmap" aria-labelledby="roadmap-title" className="bg-paper py-24 sm:py-32">
      <div className="container-x">
        <SectionHeader id="roadmap-title" eyebrow="Roadmap" title="The planned journey, one release a month." intro="A proposed rollout from the supplied roadmap — not a record of completed releases." />
        <p className="mt-8 inline-flex items-start gap-2 rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
          <AlertCircle size={16} aria-hidden className="mt-0.5 shrink-0" />
          Planned schedule from the supplied roadmap; delivery status not verified.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-navy">Pacing</span>
          <Tabs
            idBase="pace"
            label="Pacing option"
            items={[
              { id: 'a', label: PACING.a.label },
              { id: 'b', label: PACING.b.label },
            ]}
            value={pace}
            onChange={changePace}
          />
        </div>
        <TabPanel idBase="pace" id={pace} className="mt-4">
          <ul className="grid gap-x-8 gap-y-2 text-sm text-muted md:grid-cols-2">
            {PACING[pace].lines.map((l) => (
              <li key={l} className="rule pt-2">
                {l}
              </li>
            ))}
          </ul>

          <div className="mt-10 grid gap-8 lg:grid-cols-[18rem_1fr]">
            <Tabs
              idBase="month"
              label="Planned months"
              items={months.map((m) => ({
                id: m.key,
                label: (
                  <span className="block text-left">
                    <span className="tabular block text-xs text-teal">{m.month}</span>
                    <span className="block text-[0.95rem]">{m.release}</span>
                  </span>
                ),
              }))}
              value={month}
              onChange={setMonth}
              className="!flex-col !gap-0"
              tabClassName={(a) => `w-full border-l-2 px-4 py-3 text-left transition-colors ${a ? 'border-indigo bg-ivory text-navy' : 'border-line text-navy/60 hover:text-navy'}`}
            />
            <TabPanel idBase="month" id={month}>
              <div key={`${pace}-${month}`} className="animate-fade-in rounded-[1.5rem] bg-navy p-6 text-ivory sm:p-8 on-dark">
                {pace === 'a' && selA ? (
                  <>
                    <p className="tabular text-xs uppercase tracking-[0.16em] text-[#7fd1c9]">{selA.month} · planned</p>
                    <h3 className="display mt-2 text-3xl sm:text-4xl">{selA.release}</h3>
                    <dl className="mt-8 grid gap-6 md:grid-cols-3">
                      <Item k="What ships" v={selA.ships} />
                      <Item k="What is built" v={selA.built + (selA.inBuild ? ` In build next: ${selA.inBuild}.` : '')} />
                      <Item k="Decision required" v={selA.decision} />
                    </dl>
                  </>
                ) : selB ? (
                  <>
                    <p className="tabular text-xs uppercase tracking-[0.16em] text-[#7fd1c9]">{selB.month} · planned</p>
                    <h3 className="display mt-2 text-3xl sm:text-4xl">{selB.release}</h3>
                    <dl className="mt-8 grid gap-6 md:grid-cols-3">
                      <Item k="What ships" v={`${selB.release.split(' · ')[1]}, released in the same order as the six-month plan.`} />
                      <Item k="What is built" v="One track in build at a time, by a single pod of four." />
                      <Item k="Decision required" v="The roadmap details month-by-month decisions for the six-month option only; this option’s decisions would follow the same sequence." />
                    </dl>
                  </>
                ) : null}
              </div>
            </TabPanel>
          </div>
        </TabPanel>

        {pace === 'a' && (
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[44rem] border-separate border-spacing-1 text-left text-xs">
              <caption className="mb-3 text-left text-sm font-medium text-navy">Track plan · six-month option</caption>
              <thead>
                <tr className="text-muted">
                  <th scope="col" className="w-56 font-medium">Track</th>
                  {ROADMAP_A.map((m) => (
                    <th key={m.key} scope="col" className="font-medium">
                      {m.month.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRACK_GRID.map((r) => (
                  <tr key={r.track}>
                    <th scope="row" className="py-1 pr-2 font-normal text-ink">{r.track}</th>
                    {r.cells.map((c, i) => (
                      <td key={i} className={`h-8 rounded-md px-2 text-center capitalize ${CELL[c]}`}>
                        {c ? c : <span className="sr-only">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="display text-3xl text-navy">Rollout intention</h3>
            <p className="mt-4 leading-relaxed text-muted">
              Each release is planned to start in a pilot — one BOI and one UBI zone — in its release month, then extend to all bancassurance zones the following month.
            </p>
          </div>
          <div>
            <h3 className="display text-3xl text-navy">Beyond the initial rollout</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {FUTURE_SCOPE.map((f) => (
                <li key={f} className="chip border border-line bg-ivory py-1.5 text-sm text-navy">
                  <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-teal">Future scope</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-white/15 pt-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7fd1c9]">{k}</dt>
      <dd className="mt-2 text-[0.95rem] leading-relaxed text-ivory/85">{v}</dd>
    </div>
  )
}
