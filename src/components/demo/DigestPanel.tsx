import { Award, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { KPIS, RECOGNITION, roleById } from '../../data/fixtures'
import { computeMetric, daysRemaining, fmtDelta, fmtMetric, fmtPct, KPI_REFRESH_LABEL, METRICS, monthPace, type ComputedMetric } from '../../data/kpi'
import { useDemo } from '../DemoContext'
import { StatusChip, SudhaSays } from '../ui/Bits'
import { Tabs } from '../ui/Tabs'
import { CardHeader } from './CoveragePanel'

const BORDER: Record<string, string> = { good: 'border-l-good', warn: 'border-l-warn', bad: 'border-l-bad', neutral: 'border-l-line' }

export function DigestPanel() {
  const { role } = useDemo()
  const [mode, setMode] = useState<'daily' | 'weekly'>('daily')
  const fx = KPIS[role]
  const pace = monthPace()
  const metrics = METRICS.map((m) => computeMetric(m.id, fx, pace))
  const visible = metrics.filter((m) => !(role === 'so' && m.def.spanOnly))
  const hidden = metrics.filter((m) => role === 'so' && m.def.spanOnly)
  const ach = metrics.find((m) => m.def.id === 'ach')!
  const gap = metrics.find((m) => m.def.id === 'gap')!
  const gaps = visible.filter((m) => m.status === 'bad' && m.def.id !== 'gap').slice(0, 3)

  return (
    <div>
      <CardHeader
        time={mode === 'daily' ? '09:00' : 'Monday'}
        title={mode === 'daily' ? 'Business KPI digest' : 'Weekly KPI summary'}
        right={<Tabs idBase="digest-mode" label="Digest view" items={[{ id: 'daily', label: 'Daily card' }, { id: 'weekly', label: 'Weekly summary' }]} value={mode} onChange={setMode} />}
      />
      <SudhaSays live>
        {roleById(role).person}, your span is at <strong className="font-semibold">{fmtMetric(ach)}</strong> achievement against <strong className="font-semibold">{fmtPct(pace * 100)}</strong> month pace (20 of 31 days) —{' '}
        {(gap.value ?? 0) > 0 ? `${fmtMetric(gap)} behind pace` : `${fmtMetric({ ...gap, value: Math.abs(gap.value ?? 0) })} ahead of pace`}, {daysRemaining()} days to go.
        {mode === 'weekly' && <span className="text-muted"> Week-on-week changes are shown on each measure.</span>}
      </SudhaSays>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-good/25 bg-good-soft/40 p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-good">
            <Award size={16} aria-hidden /> Recognition
          </p>
          <ul className="mt-3 space-y-2.5 text-sm">
            {RECOGNITION[role].map((r, i) => (
              <li key={i}>
                <span className="font-medium text-navy">{r.who}</span> <span className="text-ink">— {r.why}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-navy">
            <TrendingDown size={16} aria-hidden /> Where to look
          </p>
          <ul className="mt-3 space-y-2.5 text-sm text-ink">
            {gaps.length === 0 && <li>No measure is more than 10% below target.</li>}
            {gaps.map((m) => (
              <li key={m.def.id}>
                <span className="font-medium text-navy">{m.def.label}</span> — {fmtMetric(m)}, {m.comparison}.
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Measures">
        {visible.map((m) => (
          <MetricTile key={m.def.id} m={m} weekly={mode === 'weekly'} />
        ))}
      </ul>
      {hidden.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          {hidden.map((m) => m.def.label).join(', ')} are measured for a team of SOs, so they are not shown at SO level.
        </p>
      )}

      <div className="mt-6 grid gap-2 text-xs leading-relaxed text-muted sm:grid-cols-2">
        <p>
          Colour key from the roadmap, applied to <em>target attainment</em> (value ÷ target): <span className="text-good">≥100% green</span> · <span className="text-warn">90–99% amber</span> · <span className="text-bad">below 90% red</span>. Monetary measures without a target stay neutral.
        </p>
        <p>
          {KPI_REFRESH_LABEL}. Month pace and gap to pace are recomputed daily from a fixed demo date (20 Aug 2026), not today’s date. All values are synthetic.
        </p>
      </div>
    </div>
  )
}

function MetricTile({ m, weekly }: { m: ComputedMetric; weekly: boolean }) {
  const delta = fmtDelta(m)
  return (
    <li className={`rounded-xl border border-line border-l-4 bg-paper p-4 ${BORDER[m.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-navy">{m.def.label}</p>
        <StatusChip status={m.status} />
      </div>
      <p className="display tabular mt-2 text-3xl text-navy">
        {fmtMetric(m)}
        {m.def.unit === 'per day' && <span className="ml-1 font-sans text-sm text-muted">per day</span>}
      </p>
      <p className="mt-1 text-xs text-ink">
        {m.def.targetLabel}
        {m.attainment !== null && m.def.id !== 'ach' && m.def.id !== 'gap' && <span className="text-muted"> · {m.comparison}</span>}
        {(m.def.id === 'ach' || m.def.id === 'gap') && <span className="text-muted"> · {m.comparison}</span>}
      </p>
      {weekly && delta && <p className="mt-1 text-xs font-medium text-indigo">{delta}</p>}
      <details className="mt-2 text-xs text-muted">
        <summary className="cursor-pointer select-none hover:text-navy">Definition</summary>
        <p className="mt-1 leading-relaxed">
          {m.def.formula}. Unit: {m.def.unit}. Refresh: {m.def.refresh.toLowerCase()}.
        </p>
      </details>
    </li>
  )
}
