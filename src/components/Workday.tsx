import { useState } from 'react'
import { WORKDAY } from '../content/site'
import { SectionHeader, SudhaSays } from './ui/Bits'
import { TabPanel, Tabs } from './ui/Tabs'

export function Workday() {
  const [id, setId] = useState(WORKDAY[0].id)
  const m = WORKDAY.find((x) => x.id === id)!
  return (
    <section id="workday" aria-labelledby="workday-title" className="bg-paper py-24 sm:py-32">
      <div className="container-x">
        <SectionHeader id="workday-title" eyebrow="Your workday" title="A day with Sudha." intro="Select a moment to see what Sudha could bring you. Examples are illustrative and use synthetic data." />
        <div className="mt-14 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="relative">
            <span aria-hidden className="absolute bottom-6 left-[0.6rem] top-6 w-px bg-line" />
            <Tabs
              idBase="workday"
              label="Moments in the day"
              items={WORKDAY.map((w) => ({
                id: w.id,
                label: (
                  <span className="flex items-start gap-5 text-left">
                    <span aria-hidden className={`relative z-10 mt-1.5 h-[1.2rem] w-[1.2rem] shrink-0 rounded-full border-2 transition-colors ${w.id === id ? 'border-indigo bg-indigo' : 'border-line bg-paper'}`} />
                    <span>
                      <span className="tabular block text-xs font-semibold uppercase tracking-[0.14em] text-teal">{w.time}</span>
                      <span className="display mt-1 block text-2xl sm:text-[1.7rem]">{w.title}</span>
                      <span className="mt-1 block text-sm font-normal text-muted">{w.detail}</span>
                    </span>
                  </span>
                ),
              }))}
              value={id}
              onChange={setId}
              className="!flex-col !gap-1"
              tabClassName={(a) => `w-full rounded-2xl py-4 pr-4 text-left transition-colors ${a ? 'text-navy' : 'text-navy/50 hover:text-navy/80'}`}
            />
          </div>
          <TabPanel idBase="workday" id={id} className="lg:sticky lg:top-28 lg:self-start">
            <div key={m.id} className="animate-fade-in rounded-[1.75rem] border border-line bg-ivory p-6 sm:p-8">
              <p className="tabular text-xs font-semibold uppercase tracking-[0.14em] text-muted">{m.time}</p>
              <SudhaSays className="mt-4" live>
                {m.message}
              </SudhaSays>
              <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
                <span className="font-medium text-navy">Refresh · </span>
                {m.refresh}
              </p>
            </div>
            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rule pt-4">
                <p className="font-medium text-navy">Nightly business KPIs</p>
                <p className="mt-1 leading-relaxed text-muted">Achievement, conversion, branch visit and other KPIs are planned to refresh overnight, with pace recomputed daily.</p>
              </div>
              <div className="rule pt-4">
                <p className="font-medium text-navy">Intraday activity snapshots</p>
                <p className="mt-1 leading-relaxed text-muted">Logins and branch check-ins are snapshotted at 10:00, 11:00 and 12:00. Not every metric is real-time.</p>
              </div>
            </div>
          </TabPanel>
        </div>
      </div>
    </section>
  )
}
