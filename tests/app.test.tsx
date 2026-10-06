import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../src/App'
import { DURATIONS } from '../src/components/DesktopCompanion'

const demo = () => document.getElementById('demo')!
const panel = (id: string) => document.getElementById(`demo-panel-${id}`)!

describe('navigation and CTAs', () => {
  it('every in-page link points at an existing section', () => {
    render(<App />)
    const hrefs = Array.from(document.querySelectorAll('a[href^="#"]')).map((a) => a.getAttribute('href')!)
    expect(hrefs.length).toBeGreaterThan(10)
    for (const h of hrefs) expect(document.getElementById(h.slice(1)), h).not.toBeNull()
    for (const label of ['Experience Sudha', 'See What’s Coming', 'Try Sudha', 'Explore the Roadmap']) expect(screen.getAllByText(label).length).toBeGreaterThan(0)
  })
  it('mobile menu opens as a dialog and closes with Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /menu/i }))
    expect(screen.getByRole('dialog', { name: /site navigation/i })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: /site navigation/i })).toBeNull()
  })
})

describe('branch coverage — end to end', () => {
  it('marks a reason, groups SO-wise and simulates a nudge', async () => {
    const user = userEvent.setup()
    render(<App />)
    const p = within(panel('coverage'))
    expect(p.getByText(/6 of your 23 mapped branches/)).toBeInTheDocument()
    await user.click(p.getByRole('button', { name: 'Mark reason' }))
    await user.click(p.getByLabelText('Bank holiday'))
    await user.click(p.getByRole('button', { name: 'Save reason' }))
    expect(p.getByText(/5 still need attention · 1 explained/)).toBeInTheDocument()
    expect(p.getByText('Reason: Bank holiday')).toBeInTheDocument()

    await user.click(p.getByRole('button', { name: /Show SO-wise/ }))
    expect(p.getByText('Rohan Mehta')).toBeInTheDocument()

    await user.click(p.getByRole('button', { name: /Preview nudge/ }))
    const draft = p.getByLabelText('Message draft') as HTMLTextAreaElement
    await user.clear(draft)
    await user.type(draft, 'Edited draft')
    await user.click(p.getByRole('button', { name: /Simulate nudge/ }))
    expect(p.getByText(/nothing was sent/)).toBeInTheDocument()
  })

  it('switching role resets state and hides SO names above TM', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(panel('coverage')).getByRole('button', { name: 'Mark reason' }))
    await user.click(within(demo()).getByLabelText('Regional Manager'))
    const p = within(panel('coverage'))
    expect(p.getByText(/across your territories/)).toBeInTheDocument()
    expect(p.queryByText(/Rohan Mehta/)).toBeNull()
    await user.click(p.getByRole('button', { name: /Open Hill Road one level down/ }))
    expect(p.getByText(/Drill-down stays aggregated/)).toBeInTheDocument()
  })
})

describe('other scenarios', () => {
  it('field presence slot selector updates counts and excludes leave', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(demo()).getByRole('tab', { name: /Field presence/ }))
    const p = within(panel('presence'))
    expect(p.getByText(/15 of 18/)).toBeInTheDocument()
    expect(p.getByText(/Kiran Joshi · approved leave/)).toBeInTheDocument()
    expect(p.getByRole('button', { name: /Nudge the 2/ })).toBeInTheDocument()
    await user.click(p.getByRole('tab', { name: '10:00' }))
    expect(p.getByText(/8 of 18/)).toBeInTheDocument()
    expect(p.getByText(/does not use GPS/)).toBeInTheDocument()
  })

  it('Ask Sudha answers suggested questions and resets on role change', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(demo()).getByRole('tab', { name: /Ask Sudha/ }))
    let p = within(panel('ask'))
    await user.click(p.getAllByRole('button', { name: 'How are we doing against pace?' })[0])
    expect(p.getByText(/56.7% achievement against 64.5% month pace/)).toBeInTheDocument()
    await user.type(p.getByLabelText('Ask Sudha a question'), 'Tell me a joke{Enter}')
    expect(p.getByText(/not connected to a live AI model/)).toBeInTheDocument()
    await user.click(within(demo()).getByLabelText('Sales Officer'))
    p = within(panel('ask'))
    expect(p.queryByText(/56.7%/)).toBeNull()
    expect(p.getByText(/Hello Rohan/)).toBeInTheDocument()
  })

  it('“Ask Sudha” on the coverage card opens the chat with the question answered', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(panel('coverage')).getByRole('button', { name: /Ask Sudha/ }))
    expect(panel('ask')).toBeVisible()
    expect(within(panel('ask')).getByText(/Riverside Main · 9 days · Rohan Mehta/)).toBeInTheDocument()
  })

  it('review companion adds an action and changes its status', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(demo()).getByRole('tab', { name: /Review companion/ }))
    const p = within(panel('review'))
    await user.click(p.getByRole('tab', { name: 'After' }))
    await user.type(p.getByLabelText('Action / metric'), 'Clear aged leads')
    await user.type(p.getByLabelText('Target'), '0 over 10 days')
    await user.click(p.getByRole('button', { name: /Add action/ }))
    const log = within(p.getByRole('list', { name: 'Action log' }))
    const item = log.getByText('Clear aged leads').closest('li')!
    await user.selectOptions(within(item).getByLabelText('Status'), 'Closed')
    expect((within(item).getByLabelText('Status') as HTMLSelectElement).value).toBe('Closed')
  })

  it('digest shows all named measures with targets and a fixed demo date', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(demo()).getByRole('tab', { name: /KPI digest/ }))
    const p = within(panel('digest'))
    for (const l of ['Budget (EPI_S)', 'Collection', 'EPI_S', 'Achievement vs pace', 'Gap to pace', 'Branch visit', 'Branch active', 'Leads / day / SO', 'Lead conversion', 'Weekly SO active', 'SP penetration', 'SO manning'])
      expect(p.getAllByText(l).length).toBeGreaterThan(0)
    expect(p.getByText(/fixed demo date/)).toBeInTheDocument()
  })

  it('assistant answers are labelled sample content', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(demo()).getByRole('tab', { name: /Employee assistant/ }))
    const p = within(panel('assistant'))
    await user.click(p.getByRole('button', { name: /carry forward/ }))
    expect(p.getByText('Sudha · sample content')).toBeInTheDocument()
    expect(p.getByText(/does not state any real policy/)).toBeInTheDocument()
  })
})

describe('roadmap', () => {
  it('toggles pacing and shows month details', async () => {
    const user = userEvent.setup()
    render(<App />)
    const r = within(document.getElementById('roadmap')!)
    expect(r.getByText('Planned schedule from the supplied roadmap; delivery status not verified.')).toBeInTheDocument()
    await user.click(r.getByRole('tab', { name: /Dec 2026/ }))
    expect(r.getByText(/Text-to-query with guardrails/)).toBeInTheDocument()
    await user.click(r.getByRole('tab', { name: /8 months · one pod/ }))
    expect(r.getByRole('tab', { name: /Apr 2027/ })).toBeInTheDocument()
    await user.click(r.getByRole('tab', { name: /Apr 2027/ }))
    expect(r.getAllByText(/Foundation hardening/).length).toBeGreaterThan(0)
    await user.click(r.getByRole('tab', { name: /6 months · two pods/ }))
    expect(r.queryByRole('tab', { name: /Apr 2027/ })).toBeNull()
  })
})

describe('desktop companion', () => {
  const stage = () => within(document.getElementById('companion')!)
  // One phase per call: React flushes the phase-transition effect when each act() completes.
  const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms))

  it('enters, asks, and dismisses quietly with no response', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(stage().getByRole('button', { name: /Try a water reminder/ }))
    advance(DURATIONS.entering + 200)
    expect(stage().getByText('Have you had your water?')).toBeInTheDocument()
    advance(DURATIONS.asking + 200)
    expect(stage().queryByText('Have you had your water?')).toBeNull()
    advance(DURATIONS.dismissing + 200)
    expect(stage().getByRole('button', { name: /Try a water reminder/ })).toBeEnabled()
    vi.useRealTimers()
  })

  it('responds to Yes and Not yet', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(stage().getByRole('button', { name: /Try a water reminder/ }))
    advance(DURATIONS.entering + 200)
    fireEvent.click(stage().getByRole('button', { name: 'Yes' }))
    expect(stage().getByText('Wonderful! Keep yourself refreshed.')).toBeInTheDocument()
    advance(DURATIONS.happy + 200)
    advance(DURATIONS.leaving + 200)
    fireEvent.click(stage().getByRole('button', { name: /Try a water reminder/ }))
    advance(DURATIONS.entering + 200)
    fireEvent.click(stage().getByRole('button', { name: 'Not yet' }))
    expect(stage().getByText('A little water break?')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('snoozes on Later, pauses, and resets', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(stage().getByRole('button', { name: /Try a water reminder/ }))
    advance(DURATIONS.entering + 200)
    fireEvent.click(stage().getByRole('button', { name: 'Remind me later' }))
    advance(DURATIONS.leaving + 200)
    expect(stage().getByText('Snoozed')).toBeInTheDocument()
    expect(stage().getByText(/accelerated demo timer/)).toBeInTheDocument()
    fireEvent.click(stage().getByRole('button', { name: /Pause/ }))
    advance(DURATIONS.snoozed + 1000)
    expect(stage().getByText('Snoozed')).toBeInTheDocument() // paused: still snoozed
    fireEvent.click(stage().getByRole('button', { name: /Resume/ }))
    advance(DURATIONS.snoozed + 200)
    advance(DURATIONS.entering + 200)
    expect(stage().getByText('Have you had your water?')).toBeInTheDocument()
    fireEvent.click(stage().getByRole('button', { name: /^Reset$/ }))
    expect(stage().queryByText('Have you had your water?')).toBeNull()
    expect(stage().getByRole('button', { name: /Download desktop app/ })).toBeDisabled()
    vi.useRealTimers()
  })
})
