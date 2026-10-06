import type { KpiFixture, MetricDef, MetricId, Status } from './types'

/**
 * Fixed demo clock. The site never reads the viewer's current date for business
 * maths — pace and timestamps are always computed from this synthetic date,
 * which mirrors the 20-Aug-2026 Activity Dashboard cut cited in the roadmap.
 */
export const DEMO_DATE = { year: 2026, month: 8, day: 20 } as const
export const DEMO_DATE_LABEL = 'Thu 20 Aug 2026'
export const KPI_REFRESH_LABEL = 'KPI data refreshed nightly · 06:00, 20 Aug 2026 (synthetic)'

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** Elapsed share of the month: days elapsed ÷ days in month. */
export function monthPace(date: { year: number; month: number; day: number } = DEMO_DATE): number {
  return date.day / daysInMonth(date.year, date.month)
}

export function daysRemaining(date: { year: number; month: number; day: number } = DEMO_DATE): number {
  return daysInMonth(date.year, date.month) - date.day
}

export const METRICS: MetricDef[] = [
  { id: 'budget', label: 'Budget (EPI_S)', unit: '₹ Cr', formula: 'Monthly EPI_S budget for the span', target: null, targetLabel: 'No target · reference value', refresh: 'Nightly' },
  { id: 'collection', label: 'Collection', unit: '₹ Cr', formula: 'Month-to-date collection', target: null, targetLabel: 'No target · reference value', refresh: 'Nightly' },
  { id: 'epis', label: 'EPI_S', unit: '₹ Cr', formula: 'Month-to-date EPI_S', target: null, targetLabel: 'No target · reference value', refresh: 'Nightly' },
  { id: 'ach', label: 'Achievement vs pace', unit: '%', formula: 'Ach% = EPI_S ÷ Budget; compared with month pace = days elapsed ÷ days in month', target: null, targetLabel: 'Target: month pace', refresh: 'Computed daily' },
  { id: 'gap', label: 'Gap to pace', unit: '₹ Cr', formula: 'Budget × month pace − EPI_S (negative = ahead of pace)', target: 0, targetLabel: 'Target: close to 0', refresh: 'Computed daily' },
  { id: 'bv', label: 'Branch visit', unit: '%', formula: 'Mapped branches visited in the week ÷ mapped branches', target: 80, targetLabel: 'Target 80%', refresh: 'Nightly' },
  { id: 'ba', label: 'Branch active', unit: '%', formula: 'Branches with business ÷ mapped branches', target: 51, targetLabel: 'Target 51%', refresh: 'Nightly' },
  { id: 'leads', label: 'Leads / day / SO', unit: 'per day', formula: 'Leads created ÷ working days ÷ active SOs', target: 3, targetLabel: 'Target ≥ 3', refresh: 'Nightly' },
  { id: 'conv', label: 'Lead conversion', unit: '%', formula: 'Logins ÷ leads', target: 10, targetLabel: 'Target 10%', refresh: 'Nightly' },
  { id: 'soActive', label: 'Weekly SO active', unit: '%', formula: 'SOs active in the week ÷ mapped SOs', target: 85, targetLabel: 'Target 85%', spanOnly: true, refresh: 'Nightly' },
  { id: 'sp', label: 'SP penetration', unit: '%', formula: 'Bank Specified Persons covered ÷ SPs mapped', target: 100, targetLabel: 'Target 100%', spanOnly: true, refresh: 'Nightly' },
  { id: 'manning', label: 'SO manning', unit: '%', formula: 'SOs in position ÷ sanctioned SO positions', target: 100, targetLabel: 'Target 100%', spanOnly: true, refresh: 'Nightly' },
]

export const metricById = (id: MetricId): MetricDef => {
  const m = METRICS.find((x) => x.id === id)
  if (!m) throw new Error(`Unknown metric ${id}`)
  return m
}

/** Colour key from the roadmap: ≥100% green · 90–99% amber · <90% red, applied to target attainment. */
export function statusFromAttainment(attainment: number | null): Status {
  if (attainment === null || Number.isNaN(attainment)) return 'neutral'
  if (attainment >= 1) return 'good'
  if (attainment >= 0.9) return 'warn'
  return 'bad'
}

export const STATUS_LABEL: Record<Status, string> = {
  good: 'On or above target',
  warn: 'Within 10% of target',
  bad: 'More than 10% below target',
  neutral: 'No target',
}

export interface ComputedMetric {
  def: MetricDef
  value: number | null
  lastWeek: number | null
  attainment: number | null
  status: Status
  /** Display string for the comparison, e.g. "92% of target". */
  comparison: string
}

export function achievement(values: { epis?: number; budget?: number }): number | null {
  if (values.epis === undefined || !values.budget) return null
  return (values.epis / values.budget) * 100
}

export function gapToPace(values: { epis?: number; budget?: number }, pace = monthPace()): number | null {
  if (values.epis === undefined || values.budget === undefined) return null
  return values.budget * pace - values.epis
}

export function computeMetric(id: MetricId, fx: KpiFixture, pace = monthPace()): ComputedMetric {
  const def = metricById(id)
  if (id === 'ach') {
    const value = achievement(fx.current)
    const lastWeek = achievement(fx.lastWeek)
    const attainment = value === null ? null : value / (pace * 100)
    return {
      def,
      value,
      lastWeek,
      attainment,
      status: statusFromAttainment(attainment),
      comparison: `vs ${fmtPct(pace * 100)} month pace`,
    }
  }
  if (id === 'gap') {
    const value = gapToPace(fx.current, pace)
    const ach = achievement(fx.current)
    // Gap shares the achievement-vs-pace status: it is the same comparison expressed in ₹ Cr.
    const attainment = ach === null ? null : ach / (pace * 100)
    return {
      def,
      value,
      lastWeek: null,
      attainment,
      status: statusFromAttainment(attainment),
      comparison: value !== null && value <= 0 ? 'Ahead of pace' : 'Behind pace',
    }
  }
  const value = fx.current[id] ?? null
  const lastWeek = fx.lastWeek[id] ?? null
  const attainment = def.target && value !== null ? value / def.target : null
  return {
    def,
    value,
    lastWeek,
    attainment,
    status: statusFromAttainment(attainment),
    comparison: attainment === null ? def.targetLabel : `${Math.round(attainment * 100)}% of target`,
  }
}

export function fmtPct(v: number, digits = 1): string {
  return `${v.toFixed(digits).replace(/\.0$/, '')}%`
}

export function fmtCr(v: number): string {
  const abs = Math.abs(v)
  const digits = abs >= 100 ? 1 : 2
  return `₹${abs.toFixed(digits)} Cr`
}

export function fmtMetric(m: ComputedMetric): string {
  if (m.value === null) return '—'
  if (m.def.unit === '₹ Cr') return (m.value < 0 ? '−' : '') + fmtCr(m.value)
  if (m.def.unit === 'per day') return m.value.toFixed(1)
  return fmtPct(m.value)
}

export function fmtDelta(m: ComputedMetric): string | null {
  if (m.value === null || m.lastWeek === null) return null
  const d = m.value - m.lastWeek
  if (Math.abs(d) < 0.05) return 'No change vs last week'
  const sign = d > 0 ? '+' : '−'
  const abs = Math.abs(d)
  const unit = m.def.unit === '%' ? ' pts' : m.def.unit === '₹ Cr' ? ' Cr' : ''
  const digits = m.def.unit === '₹ Cr' ? 2 : 1
  return `${sign}${abs.toFixed(digits)}${unit} vs last week`
}
