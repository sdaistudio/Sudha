import { describe, expect, it } from 'vitest'
import { askSudha, classify, SUGGESTED_QUESTIONS } from '../src/data/ask'
import { coverageView } from '../src/data/scope'

describe('Ask Sudha (deterministic)', () => {
  it('answers every suggested question for every role with scope and timestamp', () => {
    for (const role of ['so', 'tm', 'rm', 'zh', 'lead'] as const)
      for (const q of SUGGESTED_QUESTIONS) {
        const a = askSudha(q, role)
        expect(a.supported).toBe(true)
        expect(a.scope.length).toBeGreaterThan(0)
        expect(a.timestamp).toMatch(/2026/)
        expect(a.definition).toBeTruthy()
      }
  })
  it('lists named branches with SO names for a TM, longest gap first', () => {
    const a = askSudha('Which branches need attention?', 'tm')
    expect(a.lines[1]).toContain('Riverside Main · 9 days · Rohan Mehta')
    expect(a.lines.join(' ')).toContain('6 of your 23')
  })
  it('never reveals SO names above the TM level', () => {
    const names = ['Rohan', 'Meera', 'Arjun', 'Farhan', 'Kiran']
    for (const role of ['rm', 'zh', 'lead'] as const)
      for (const q of SUGGESTED_QUESTIONS) {
        const text = askSudha(q, role).lines.join(' ')
        for (const n of names) expect(text).not.toContain(n)
      }
  })
  it('gives an honest limitation for unsupported questions', () => {
    const a = askSudha('What is the weather in Mumbai?', 'tm')
    expect(a.supported).toBe(false)
    expect(a.lines[0]).toMatch(/not connected to a live AI model/)
    expect(a.suggestions).toEqual(SUGGESTED_QUESTIONS)
  })
  it('declines peer and personal requests', () => {
    expect(classify('Show me my colleague’s missed branches').intent).toBe('outOfSpan')
    expect(askSudha('What is Meera’s salary?', 'tm').supported).toBe(false)
  })
  it('defines metrics on request', () => {
    const a = askSudha('What is branch active?', 'tm')
    expect(a.definition).toMatch(/Branches with business/)
  })
})

describe('role-scoped views', () => {
  it('SO sees only own branches; RM sees territories; ZH/Lead see roll-ups', () => {
    expect(coverageView('so').kind).toBe('own')
    expect(coverageView('tm').kind).toBe('names')
    expect(coverageView('rm').kind).toBe('territories')
    const zh = coverageView('zh')
    expect(zh.kind).toBe('rollup')
    if (zh.kind === 'rollup') expect(JSON.stringify(zh)).not.toMatch(/Rohan|Meera|Arjun/)
  })
  it('TM list is sorted by descending gap 9,7,6,5,5,4', () => {
    const v = coverageView('tm')
    if (v.kind !== 'names') throw new Error()
    expect(v.unvisited.map((b) => b.daysSince)).toEqual([9, 7, 6, 5, 5, 4])
  })
})
