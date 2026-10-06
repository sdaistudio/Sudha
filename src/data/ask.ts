/**
 * Deterministic "Ask Sudha" for the demo. There is no language model here:
 * questions are matched to a small set of scripted intents and the answers are
 * computed from the synthetic fixtures for the selected role.
 */
import { KPIS, RECOGNITION, roleById } from './fixtures'
import { computeMetric, daysRemaining, DEMO_DATE_LABEL, fmtCr, fmtDelta, fmtMetric, fmtPct, METRICS, monthPace } from './kpi'
import { coverageView, rollupTotals, rowPct, summariseTm } from './scope'
import type { MetricId, RoleId } from './types'

export type DemoTab = 'coverage' | 'presence' | 'digest' | 'ask' | 'review' | 'assistant'

export interface SudhaAnswer {
  supported: boolean
  lines: string[]
  definition?: string
  scope: string
  timestamp: string
  drill?: { label: string; tab: DemoTab }[]
  suggestions?: string[]
}

export const SUGGESTED_QUESTIONS = [
  'Which branches need attention?',
  'How are we doing against pace?',
  'What changed since last week?',
  'What should I focus on today?',
]

const KPI_TS = 'Nightly KPI refresh · 06:00, 20 Aug 2026 (synthetic)'
const COVERAGE_TS = 'Branch-visit log as of 09:00, 20 Aug 2026 (synthetic)'

type Intent = 'attention' | 'pace' | 'changed' | 'focus' | 'define' | 'outOfSpan' | 'unsupported'

const METRIC_WORDS: [RegExp, MetricId][] = [
  [/branch visit|\bbv\b/, 'bv'],
  [/branch active|\bba\b/, 'ba'],
  [/conversion|conv/, 'conv'],
  [/leads? ?(per|\/) ?day|lead creation/, 'leads'],
  [/so active|weekly active/, 'soActive'],
  [/\bsp\b|penetration/, 'sp'],
  [/manning/, 'manning'],
  [/gap to pace|gap-to-pace/, 'gap'],
  [/ach(ievement)?\b|ach%/, 'ach'],
  [/epi_?s/, 'epis'],
  [/collection/, 'collection'],
]

export function classify(q: string): { intent: Intent; metric?: MetricId } {
  const s = q.toLowerCase().trim()
  if (/(peer|colleague|other (so|territory|territories|region|zone)|someone else|salary|salaries|home address|phone number|personal)/.test(s))
    return { intent: 'outOfSpan' }
  const metric = METRIC_WORDS.find(([re]) => re.test(s))?.[1]
  if (metric && /(what is|what's|define|definition|meaning|how is|calculated|formula)/.test(s)) return { intent: 'define', metric }
  if (/(attention|unvisited|not visited|coverage|which branches|branches need)/.test(s)) return { intent: 'attention' }
  if (/(pace|against target|on track|achievement|how are we doing|how am i doing)/.test(s)) return { intent: 'pace' }
  if (/(changed|last week|since|moved|trend|week on week)/.test(s)) return { intent: 'changed' }
  if (/(focus|today|priorit|should i|what next|where do i start)/.test(s)) return { intent: 'focus' }
  if (metric) return { intent: 'define', metric }
  return { intent: 'unsupported' }
}

function scopeLine(role: RoleId) {
  const r = roleById(role)
  return `${r.label} · ${r.spanName}`
}

export function askSudha(question: string, role: RoleId): SudhaAnswer {
  const { intent, metric } = classify(question)
  const fx = KPIS[role]
  const pace = monthPace()
  const scope = scopeLine(role)

  switch (intent) {
    case 'attention':
      return attention(role, scope)
    case 'pace': {
      const ach = computeMetric('ach', fx, pace)
      const gap = computeMetric('gap', fx, pace)
      const budget = fx.current.budget ?? 0
      const epis = fx.current.epis ?? 0
      const behind = (gap.value ?? 0) > 0
      return {
        supported: true,
        lines: [
          `${fmtMetric(ach)} achievement against ${fmtPct(pace * 100)} month pace — ${fmtCr(epis)} EPI_S on a ${fmtCr(budget)} budget, with ${daysRemaining()} days to go.`,
          behind
            ? `That is ${fmtCr(gap.value ?? 0)} behind pace and ${fmtCr(budget - epis)} to budget.`
            : `That is ${fmtCr(Math.abs(gap.value ?? 0))} ahead of pace; ${fmtCr(budget - epis)} remains to budget.`,
          activityVsOutcome(role),
        ],
        definition: 'Ach% = EPI_S ÷ Budget. Month pace = days elapsed ÷ days in month (20 ÷ 31 on the demo date). Gap to pace = Budget × pace − EPI_S.',
        scope,
        timestamp: KPI_TS,
        drill: [{ label: 'Open the KPI digest', tab: 'digest' }],
      }
    }
    case 'changed': {
      const moved = METRICS.filter((m) => !['budget', 'ach', 'gap'].includes(m.id))
        .map((m) => computeMetric(m.id, fx, pace))
        .filter((m) => m.value !== null && m.lastWeek !== null && m.def.unit !== '₹ Cr')
        .map((m) => ({ m, rel: Math.abs((m.value! - m.lastWeek!) / (m.def.target ?? m.lastWeek!)) }))
        .sort((a, b) => b.rel - a.rel)
        .slice(0, 3)
      return {
        supported: true,
        lines: [
          'The three measures that moved most since the same day last week:',
          ...moved.map(({ m }) => `${m.def.label}: ${fmtMetric(m)} (${fmtDelta(m)}).`),
          `Recognition this week: ${RECOGNITION[role][0].who} — ${RECOGNITION[role][0].why}`,
        ],
        definition: 'Week-on-week compares today’s month-to-date figure with the same weekday last week, using unchanged metric definitions.',
        scope,
        timestamp: KPI_TS,
        drill: [{ label: 'See all measures', tab: 'digest' }],
      }
    }
    case 'focus':
      return focus(role, scope)
    case 'define': {
      const def = METRICS.find((m) => m.id === metric)!
      const cm = computeMetric(def.id, fx, pace)
      if (role === 'so' && def.spanOnly)
        return {
          supported: true,
          lines: [`${def.label} is measured for a team of SOs, so it is not shown for an individual SO.`],
          definition: `${def.label}: ${def.formula}. ${def.targetLabel}.`,
          scope,
          timestamp: KPI_TS,
        }
      return {
        supported: true,
        lines: [`${def.label} for your span is ${fmtMetric(cm)} — ${cm.comparison}.`],
        definition: `${def.label}: ${def.formula}. ${def.targetLabel}. Refresh: ${def.refresh.toLowerCase()}.`,
        scope,
        timestamp: KPI_TS,
        drill: [{ label: 'Open the KPI digest', tab: 'digest' }],
      }
    }
    case 'outOfSpan':
      return {
        supported: false,
        lines: [
          'I can only answer within your authorised span, and I don’t share colleagues’ or peers’ individual records or personal details.',
          'Try one of the questions below about your own span.',
        ],
        scope,
        timestamp: DEMO_DATE_LABEL,
        suggestions: SUGGESTED_QUESTIONS,
      }
    default:
      return {
        supported: false,
        lines: [
          'This demo only answers a small set of scripted questions using synthetic data. It is not connected to a live AI model or to SUD Life systems.',
          'Try one of these instead:',
        ],
        scope,
        timestamp: DEMO_DATE_LABEL,
        suggestions: SUGGESTED_QUESTIONS,
      }
  }
}

function activityVsOutcome(role: RoleId): string {
  const fx = KPIS[role]
  const bv = computeMetric('bv', fx)
  const conv = computeMetric('conv', fx)
  if (bv.status === 'good' && conv.status === 'bad')
    return `Activity is not the issue — branch visit is ${fmtMetric(bv)} against 80%. Conversion is: ${fmtMetric(conv)} against 10%.`
  if (bv.status !== 'good' && conv.status === 'bad')
    return `Both coverage (${fmtMetric(bv)} branch visit) and conversion (${fmtMetric(conv)}) are below target.`
  if (bv.status !== 'good') return `Coverage is the main gap: branch visit ${fmtMetric(bv)} against 80%.`
  return `Activity and conversion are close to target: branch visit ${fmtMetric(bv)}, conversion ${fmtMetric(conv)}.`
}

function attention(role: RoleId, scope: string): SudhaAnswer {
  const v = coverageView(role)
  const def = 'A branch needs attention when no mapped SO has checked in there this week (since Mon 17 Aug). Days are calendar days since the last recorded check-in.'
  if (v.kind === 'own')
    return {
      supported: true,
      lines: [
        `${v.unvisited.length} of your ${v.mapped} mapped branches have no visit this week:`,
        ...v.unvisited.map((b) => `${b.bank} ${b.name} · ${b.daysSince} days`),
      ],
      definition: def,
      scope,
      timestamp: COVERAGE_TS,
      drill: [{ label: 'Open branch coverage', tab: 'coverage' }],
    }
  if (v.kind === 'names') {
    const top = v.unvisited[0]
    return {
      supported: true,
      lines: [
        `${v.unvisited.length} of your ${v.mapped} mapped branches have no SO visit this week — longest gap first:`,
        ...v.unvisited.map((b) => `${b.bank} ${b.name} · ${b.daysSince} days · ${b.so}`),
        `${top.so} has the longest gap — worth a call before the 10:00 start.`,
      ],
      definition: def,
      scope,
      timestamp: COVERAGE_TS,
      drill: [
        { label: 'Open branch coverage', tab: 'coverage' },
        { label: 'Check field presence', tab: 'presence' },
      ],
    }
  }
  if (v.kind === 'territories') {
    const total = v.rows.reduce((n, r) => n + r.unvisited, 0)
    const mapped = v.rows.reduce((n, r) => n + r.mapped, 0)
    const lw = v.rows.reduce((n, r) => n + r.lastWeekUnvisited, 0)
    return {
      supported: true,
      lines: [
        `${total} of ${mapped} mapped branches across your ${v.rows.length} territories have no visit this week (${lw} at this point last week).`,
        `Most in: ${v.rows.slice(0, 3).map((r) => `${r.name} (${r.unvisited})`).join(', ')}.`,
        'Branch and SO detail goes to each Territory Manager; you see counts by territory.',
      ],
      definition: def,
      scope,
      timestamp: COVERAGE_TS,
      drill: [{ label: 'Open territory roll-up', tab: 'coverage' }],
    }
  }
  const t = rollupTotals(v.rows)
  const worst = [...v.rows].sort((a, b) => rowPct(a) - rowPct(b)).slice(0, 2)
  return {
    supported: true,
    lines: [
      `Branch visit across your span is ${fmtPct(t.pct)} — BOI ${fmtPct((t.bank.BOI.visited / t.bank.BOI.mapped) * 100)}, UBI ${fmtPct((t.bank.UBI.visited / t.bank.UBI.mapped) * 100)}.`,
      `Lowest coverage: ${worst.map((r) => `${r.name} ${fmtPct(rowPct(r))}`).join(' and ')}.`,
      `${(t.mapped - t.visited).toLocaleString('en-IN')} branches are unvisited this week; the action sits with each ${v.level === 'region' ? 'region' : 'zone'}’s managers.`,
    ],
    definition: def,
    scope,
    timestamp: COVERAGE_TS,
    drill: [{ label: `Open ${v.level} roll-up`, tab: 'coverage' }],
  }
}

function focus(role: RoleId, scope: string): SudhaAnswer {
  const fx = KPIS[role]
  const conv = computeMetric('conv', fx)
  const gap = computeMetric('gap', fx)
  const lines: string[] = ['Three things for today:']
  if (role === 'so') {
    lines.push('1. Visit Riverside Main (9 days) — it is the longest gap in your span.')
    lines.push(`2. Your conversion is ${fmtMetric(conv)} against 10%: follow up the leads older than 10 days.`)
    lines.push('3. Two proposals have pending documents — clear them to protect this month’s issuance.')
  } else if (role === 'tm') {
    const p = summariseTm('12:00')
    lines.push('1. Call Rohan Mehta about Riverside Main (9 days) and Hillcrest (6 days).')
    lines.push(`2. Watch the field pulse: by 12:00, ${p.inactive.map((s) => s.name).join(' and ')} had no activity (${p.leaveInactive.map((s) => s.name).join(', ')} is on approved leave and excluded).`)
    lines.push(`3. Conversion is ${fmtMetric(conv)}: lead-ageing calls with Arjun Desai.`)
  } else {
    lines.push(`1. Gap to pace is ${(gap.value ?? 0) > 0 ? fmtCr(gap.value ?? 0) + ' behind' : 'closed — you are ahead'}; review the ${roleById(role).childUnit}s furthest from pace.`)
    lines.push(`2. Conversion at ${fmtMetric(conv)} is the largest gap to target in your span.`)
    lines.push(`3. Recognise ${RECOGNITION[role][0].who}: ${RECOGNITION[role][0].why}`)
  }
  return {
    supported: true,
    lines,
    definition: 'Priorities are ranked by distance from target and by age of the open item. Ranking rules are illustrative.',
    scope,
    timestamp: KPI_TS,
    drill: [
      { label: 'Branch coverage', tab: 'coverage' },
      { label: 'KPI digest', tab: 'digest' },
    ],
  }
}
