import { describe, expect, it } from 'vitest'
import { KPIS, LEAD_ZONES, RM_TERRITORIES, ZH_REGIONS, RM_PRESENCE, ZH_PRESENCE, LEAD_PRESENCE } from '../src/data/fixtures'
import { computeMetric, daysRemaining, gapToPace, monthPace, statusFromAttainment } from '../src/data/kpi'
import { rollupTotals, rowPct, summariseTm } from '../src/data/scope'

describe('month pace uses the fixed demo date', () => {
  it('is 20 of 31 days on 20 Aug 2026, with 11 days remaining', () => {
    expect(monthPace()).toBeCloseTo(20 / 31, 10)
    expect(daysRemaining()).toBe(11)
  })
  it('does not depend on the viewer clock', () => {
    const real = Date.now
    Date.now = () => new Date('2030-01-15').getTime()
    expect(monthPace()).toBeCloseTo(20 / 31, 10)
    Date.now = real
  })
})

describe('colour key is applied to target attainment', () => {
  it('maps thresholds ≥100 green, 90–99 amber, <90 red', () => {
    expect(statusFromAttainment(1)).toBe('good')
    expect(statusFromAttainment(0.995)).toBe('warn')
    expect(statusFromAttainment(0.9)).toBe('warn')
    expect(statusFromAttainment(0.8999)).toBe('bad')
    expect(statusFromAttainment(null)).toBe('neutral')
  })
  it('colours a raw 92% branch visit green against an 80% target', () => {
    const bv = computeMetric('bv', KPIS.zh)
    expect(bv.value).toBeGreaterThan(90)
    expect(bv.status).toBe('good')
  })
  it('keeps monetary metrics without targets neutral', () => {
    for (const id of ['budget', 'collection', 'epis'] as const) expect(computeMetric(id, KPIS.tm).status).toBe('neutral')
  })
  it('scores leads/day against ≥3 and conversion against 10%', () => {
    expect(computeMetric('leads', KPIS.tm).attainment).toBeCloseTo(0.9)
    expect(computeMetric('conv', KPIS.tm).status).toBe('bad')
  })
})

describe('achievement and gap to pace arithmetic', () => {
  it('computes TM achievement and gap', () => {
    const ach = computeMetric('ach', KPIS.tm)
    expect(ach.value).toBeCloseTo((0.68 / 1.2) * 100, 6)
    expect(gapToPace(KPIS.tm.current)).toBeCloseTo(1.2 * (20 / 31) - 0.68, 6)
    expect(ach.status).toBe('bad') // 56.7 / 64.5 = 87.8%
  })
  it('reports leadership ahead of pace with a negative gap', () => {
    const gap = computeMetric('gap', KPIS.lead)
    expect(gap.value).toBeLessThan(0)
    expect(gap.comparison).toBe('Ahead of pace')
    expect(gap.status).toBe('good')
  })
})

describe('synthetic fixtures reconcile across levels', () => {
  it('RM territory coverage matches the RM branch-visit KPI', () => {
    const mapped = RM_TERRITORIES.reduce((n, r) => n + r.mapped, 0)
    const unvisited = RM_TERRITORIES.reduce((n, r) => n + r.unvisited, 0)
    expect((((mapped - unvisited) / mapped) * 100).toFixed(1)).toBe(KPIS.rm.current.bv!.toFixed(1))
  })
  it('Coastal region equals the RM span; zone total equals ZH KPI and Western Zone row', () => {
    const coastal = ZH_REGIONS.find((r) => r.name === 'Coastal')!
    expect(rowPct(coastal).toFixed(1)).toBe(KPIS.rm.current.bv!.toFixed(1))
    const zh = rollupTotals(ZH_REGIONS)
    expect(zh.pct.toFixed(1)).toBe(KPIS.zh.current.bv!.toFixed(1))
    const west = LEAD_ZONES.find((z) => z.name === 'Western Zone')!
    expect(west.bank.BOI.visited + west.bank.UBI.visited).toBe(zh.visited)
    expect(rollupTotals(LEAD_ZONES).pct.toFixed(1)).toBe(KPIS.lead.current.bv!.toFixed(1))
  })
  it('presence roll-ups sum up the hierarchy', () => {
    const sum = (rows: typeof RM_PRESENCE, slot: '10:00' | '11:00' | '12:00') => rows.reduce((n, r) => n + r.logged[slot], 0)
    for (const s of ['10:00', '11:00', '12:00'] as const) {
      expect(sum(RM_PRESENCE, s)).toBe(ZH_PRESENCE.find((r) => r.name === 'Coastal')!.logged[s])
      expect(sum(ZH_PRESENCE, s)).toBe(LEAD_PRESENCE.find((r) => r.name === 'Western Zone')!.logged[s])
    }
  })
  it('TM roster reproduces the deck pulse: 8→11→15 logged, 5→9→12 checked, 2→5→9 leads', () => {
    expect(['10:00', '11:00', '12:00'].map((s) => summariseTm(s as '10:00').logged)).toEqual([8, 11, 15])
    expect(['10:00', '11:00', '12:00'].map((s) => summariseTm(s as '10:00').checked)).toEqual([5, 9, 12])
    expect(['10:00', '11:00', '12:00'].map((s) => summariseTm(s as '10:00').leads)).toEqual([2, 5, 9])
    const noon = summariseTm('12:00')
    expect(noon.mapped).toBe(18)
    expect(noon.inactive).toHaveLength(2)
    expect(noon.leaveInactive.map((s) => s.name)).toEqual(['Kiran Joshi'])
  })
})
