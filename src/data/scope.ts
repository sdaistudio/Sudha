/**
 * Role scoping for the demo. This mirrors the roadmap's employee-experience rules:
 *  - an SO sees only their own numbers;
 *  - the direct manager (TM) sees their SOs' names;
 *  - every level above sees counts and territories — drill-downs stay aggregated.
 *
 * IMPORTANT: this runs in the browser and is a demonstration only. In production
 * these rules must be enforced server-side, before any data is fetched.
 */
import {
  LEAD_PRESENCE,
  LEAD_ZONES,
  RM_PRESENCE,
  RM_TERRITORIES,
  SO_BRANCHES,
  TM_MAPPED_BRANCHES,
  TM_PRESENCE,
  TM_UNVISITED,
  TM_UNVISITED_YESTERDAY,
  ZH_LONGEST,
  ZH_PRESENCE,
  ZH_REGIONS,
} from './fixtures'
import type {
  CoverageBranch,
  CoverageRollupRow,
  LongGapBranch,
  PresenceRollupRow,
  PresenceSo,
  RoleId,
  Slot,
  TerritoryCoverage,
} from './types'

export type CoverageView =
  | { kind: 'own'; branches: typeof SO_BRANCHES; unvisited: typeof SO_BRANCHES; mapped: number }
  | { kind: 'names'; unvisited: CoverageBranch[]; mapped: number; yesterday: number }
  | { kind: 'territories'; rows: TerritoryCoverage[] }
  | { kind: 'rollup'; level: 'region' | 'zone group'; rows: CoverageRollupRow[]; longest?: LongGapBranch[] }

export const UNVISITED_THRESHOLD_DAYS = 4

export function coverageView(role: RoleId): CoverageView {
  switch (role) {
    case 'so':
      return {
        kind: 'own',
        branches: SO_BRANCHES,
        unvisited: SO_BRANCHES.filter((b) => b.daysSince >= UNVISITED_THRESHOLD_DAYS),
        mapped: SO_BRANCHES.length,
      }
    case 'tm':
      return { kind: 'names', unvisited: [...TM_UNVISITED].sort((a, b) => b.daysSince - a.daysSince), mapped: TM_MAPPED_BRANCHES, yesterday: TM_UNVISITED_YESTERDAY }
    case 'rm':
      return { kind: 'territories', rows: [...RM_TERRITORIES].sort((a, b) => b.unvisited - a.unvisited) }
    case 'zh':
      return { kind: 'rollup', level: 'region', rows: ZH_REGIONS, longest: ZH_LONGEST }
    case 'lead':
      return { kind: 'rollup', level: 'zone group', rows: LEAD_ZONES }
  }
}

export function rollupTotals(rows: CoverageRollupRow[]) {
  let visited = 0
  let mapped = 0
  const bank = { BOI: { visited: 0, mapped: 0 }, UBI: { visited: 0, mapped: 0 } }
  for (const r of rows) {
    for (const b of ['BOI', 'UBI'] as const) {
      visited += r.bank[b].visited
      mapped += r.bank[b].mapped
      bank[b].visited += r.bank[b].visited
      bank[b].mapped += r.bank[b].mapped
    }
  }
  return { visited, mapped, pct: (visited / mapped) * 100, bank }
}

export const rowPct = (r: CoverageRollupRow, b?: 'BOI' | 'UBI') => {
  if (b) return (r.bank[b].visited / r.bank[b].mapped) * 100
  return ((r.bank.BOI.visited + r.bank.UBI.visited) / (r.bank.BOI.mapped + r.bank.UBI.mapped)) * 100
}

/* ------------------------------ Presence ------------------------------ */

const atOrBefore = (t: string | null, slot: Slot) => t !== null && t <= slot

export interface PresenceSummary {
  mapped: number
  logged: number
  checked: number
  leads: number
  onLeave: number
}

export function summariseTm(slot: Slot, roster: PresenceSo[] = TM_PRESENCE): PresenceSummary & { inactive: PresenceSo[]; leaveInactive: PresenceSo[] } {
  const logged = roster.filter((s) => atOrBefore(s.loginAt, slot))
  const checked = roster.filter((s) => atOrBefore(s.checkinAt, slot))
  const notLogged = roster.filter((s) => !atOrBefore(s.loginAt, slot))
  return {
    mapped: roster.length,
    logged: logged.length,
    checked: checked.length,
    leads: roster.reduce((n, s) => n + s.leads[slot], 0),
    onLeave: roster.filter((s) => s.onLeave).length,
    // Approved leave is excluded from follow-up suggestions.
    inactive: notLogged.filter((s) => !s.onLeave),
    leaveInactive: notLogged.filter((s) => s.onLeave),
  }
}

export type PresenceView =
  | { kind: 'own'; so: PresenceSo }
  | { kind: 'names'; roster: PresenceSo[] }
  | { kind: 'rollup'; level: string; rows: PresenceRollupRow[] }

export function presenceView(role: RoleId): PresenceView {
  switch (role) {
    case 'so':
      return { kind: 'own', so: TM_PRESENCE[0] }
    case 'tm':
      return { kind: 'names', roster: TM_PRESENCE }
    case 'rm':
      return { kind: 'rollup', level: 'territory', rows: RM_PRESENCE }
    case 'zh':
      return { kind: 'rollup', level: 'region', rows: ZH_PRESENCE }
    case 'lead':
      return { kind: 'rollup', level: 'zone group', rows: LEAD_PRESENCE }
  }
}

export const SLOTS: Slot[] = ['10:00', '11:00', '12:00']
