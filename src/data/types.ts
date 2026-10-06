export type RoleId = 'so' | 'tm' | 'rm' | 'zh' | 'lead'

export interface RoleProfile {
  id: RoleId
  label: string
  /** Fictional first name used in greetings. */
  person: string
  spanName: string
  spanSummary: string
  /** Whether this role sees individual SO names (direct manager / own record only). */
  seesSoNames: boolean
  /** Name of the unit one level down, used in roll-ups. */
  childUnit: string
}

export type Bank = 'BOI' | 'UBI'

export type Status = 'good' | 'warn' | 'bad' | 'neutral'

export type MetricId =
  | 'budget'
  | 'collection'
  | 'epis'
  | 'ach'
  | 'gap'
  | 'bv'
  | 'ba'
  | 'leads'
  | 'conv'
  | 'soActive'
  | 'sp'
  | 'manning'

export interface MetricDef {
  id: MetricId
  label: string
  unit: '₹ Cr' | '%' | 'per day'
  formula: string
  /** Target from the roadmap; null for monetary metrics without a target. */
  target: number | null
  targetLabel: string
  /** Metrics that only make sense for a span of SOs are hidden at SO level. */
  spanOnly?: boolean
  refresh: 'Nightly' | 'Computed daily'
}

export type MetricValues = Partial<Record<Exclude<MetricId, 'ach' | 'gap'>, number>>

export interface KpiFixture {
  current: MetricValues
  lastWeek: MetricValues
}

export interface RecognitionItem {
  who: string
  why: string
}

export interface CoverageBranch {
  id: string
  name: string
  bank: Bank
  daysSince: number
  so: string
}

export interface TerritoryCoverage {
  name: string
  unvisited: number
  mapped: number
  lastWeekUnvisited: number
  /** Aggregated buckets for drill-down; no names. */
  buckets: { label: string; count: number }[]
  byBank: Record<Bank, number>
}

export interface CoverageRollupRow {
  name: string
  bank: Record<Bank, { visited: number; mapped: number }>
}

export interface LongGapBranch {
  name: string
  bank: Bank
  unit: string
  daysSince: number
}

export type Slot = '10:00' | '11:00' | '12:00'

export interface PresenceSo {
  name: string
  onLeave?: boolean
  /** First Digipro login time, HH:MM, or null. */
  loginAt: string | null
  /** First branch check-in time, HH:MM, or null. */
  checkinAt: string | null
  leads: Record<Slot, number>
}

export interface PresenceRollupRow {
  name: string
  mapped: number
  onLeave: number
  logged: Record<Slot, number>
  checked: Record<Slot, number>
}

export interface ReviewUnit {
  name: string
  bv: number
  leads: number
  conv: number
  /** Aggregated drill-down detail. For TM these are SO names; above TM, counts only. */
  detail: string[]
}

export interface ReviewFixture {
  title: string
  strengths: string[]
  gaps: string[]
  commitments: { owner: string; text: string; status: ActionStatus }[]
  units: ReviewUnit[]
  owners: string[]
}

export type ActionStatus = 'Open' | 'Moving' | 'Closed' | 'Stuck'

export interface ReviewAction {
  id: string
  owner: string
  metric: string
  target: string
  due: string
  status: ActionStatus
}
