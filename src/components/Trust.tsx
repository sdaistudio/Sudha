import { SCORECARD, TRUST_PRINCIPLES } from '../content/site'
import { SectionHeader } from './ui/Bits'
import { Reveal } from './ui/Reveal'

export function Trust() {
  return (
    <section id="trust" aria-labelledby="trust-title" className="bg-navy py-24 text-ivory sm:py-32 on-dark">
      <div className="container-x">
        <SectionHeader dark id="trust-title" eyebrow="Trust & employee experience" title="Helpful by design. Governed from the start." intro="The guardrails are what keep a notification engine feeling like a companion rather than a monitor." />
        <ul className="mt-14 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_PRINCIPLES.map((p, i) => (
            <Reveal as="li" key={p.title} delay={(i % 4) * 60} className="border-t border-white/15 py-6">
              <p className="tabular text-xs text-[#7fd1c9]">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="display mt-2 text-xl">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/70">{p.body}</p>
            </Reveal>
          ))}
        </ul>
        <div className="mt-14 grid gap-8 rounded-[1.5rem] border border-white/15 p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <h3 className="display text-2xl">Intended production environment</h3>
            <p className="mt-3 text-sm leading-relaxed text-ivory/75">
              As described in the roadmap, corporate data would remain inside the corporate environment, using the governed Azure, Copilot Studio and Microsoft Teams estate. Numbers would be computed by a governed query layer; the language model would only articulate them, and would not have access to the whole dataset.
            </p>
          </div>
          <div>
            <h3 className="display text-2xl">What this demo is not</h3>
            <p className="mt-3 text-sm leading-relaxed text-ivory/75">
              This website runs on synthetic data in your browser. It does not prove those production controls, is not security certified, and is not connected to any SUD Life, bank or employee system.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Scorecard() {
  return (
    <section id="value" aria-labelledby="value-title" className="py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <SectionHeader id="value-title" eyebrow="Value" title="Intended measures of success." intro="Reviewed monthly against a pre-Sudha baseline in the same zones. No results are claimed here — these are the measures the roadmap proposes." />
            <Reveal className="mt-12 border-t border-line pt-6">
              <p className="text-sm text-muted">Planned employee reach</p>
              <p className="display mt-1 text-7xl text-navy">~6,000</p>
              <p className="mt-2 max-w-xs text-sm text-muted">Employees in the roadmap’s planned reach for the everyday assistant — intended reach, not active users.</p>
            </Reveal>
          </div>
          <ul className="self-end border-b border-line">
            {SCORECARD.map((s, i) => (
              <Reveal as="li" key={s.area} delay={i * 40} className="grid gap-1 border-t border-line py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <h3 className="display text-xl text-navy">{s.area}</h3>
                <p className="text-sm leading-relaxed text-muted">{s.measure}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
