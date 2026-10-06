import { Plus } from 'lucide-react'
import { useState } from 'react'
import { KPIS, REVIEWS, roleById, SO_COMMITMENTS } from '../../data/fixtures'
import { computeMetric, fmtMetric, fmtPct, monthPace, statusFromAttainment } from '../../data/kpi'
import type { ActionStatus, ReviewAction, ReviewFixture } from '../../data/types'
import { useDemo } from '../DemoContext'
import { StatusChip, SudhaSays } from '../ui/Bits'
import { TabPanel, Tabs } from '../ui/Tabs'

const STATUSES: ActionStatus[] = ['Open', 'Moving', 'Closed', 'Stuck']
const STATUS_TONE: Record<ActionStatus, string> = { Open: 'bg-ivory-deep text-ink', Moving: 'bg-indigo-soft text-indigo', Closed: 'bg-good-soft text-good', Stuck: 'bg-bad-soft text-bad' }

export function ReviewPanel() {
  const { role } = useDemo()
  if (role === 'so') return <SoReview />
  return <ReviewerView fx={REVIEWS[role]} />
}

function SoReview() {
  return (
    <div>
      <SudhaSays>
        {roleById('so').person}, review packs and live review mode are for reviewers — Territory, Area, Regional and Zonal heads. You see the commitments that involve you, with their status.
      </SudhaSays>
      <ul className="mt-5 space-y-2">
        {SO_COMMITMENTS.map((c) => (
          <li key={c.text} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-paper px-4 py-3 text-sm">
            <span>
              <span className="text-navy">{c.text}</span>
              <span className="block text-xs text-muted">From: {c.from}</span>
            </span>
            <span className={`chip ${STATUS_TONE[c.status]}`}>{c.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ReviewerView({ fx }: { fx: ReviewFixture }) {
  const { role, setAnnounce } = useDemo()
  const [phase, setPhase] = useState<'before' | 'during' | 'after'>('before')
  const [unit, setUnit] = useState<string | null>(null)
  const [actions, setActions] = useState<ReviewAction[]>(() =>
    fx.commitments.map((c, i) => ({ id: `c${i}`, owner: c.owner, metric: c.text, target: '—', due: 'Fri 21 Aug 2026', status: c.status })),
  )
  const kpi = KPIS[role]
  const ach = computeMetric('ach', kpi)
  const gap = computeMetric('gap', kpi)
  const pace = monthPace()

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="display text-2xl text-navy sm:text-3xl">{fx.title}</h3>
        <Tabs
          idBase="review"
          label="Review phase"
          items={[
            { id: 'before', label: 'Before' },
            { id: 'during', label: 'During' },
            { id: 'after', label: 'After' },
          ]}
          value={phase}
          onChange={setPhase}
        />
      </div>

      <TabPanel idBase="review" id={phase}>
        {phase === 'before' && (
          <div className="animate-fade-in">
            <SudhaSays>
              Your pre-read is ready, 24 hours ahead. Span achievement {fmtMetric(ach)} against {fmtPct(pace * 100)} pace; gap to pace {(gap.value ?? 0) > 0 ? fmtMetric(gap) : 'closed'}.
            </SudhaSays>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Card title="Strengths" tone="good" items={fx.strengths} />
              <Card title="Gaps" tone="bad" items={fx.gaps} />
              <div className="rounded-2xl border border-line bg-paper p-5">
                <p className="text-sm font-medium text-navy">Open commitments</p>
                <ul className="mt-3 space-y-2.5 text-sm">
                  {actions.map((a) => (
                    <li key={a.id}>
                      <span className="text-ink">{a.metric}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                        {a.owner} <span className={`chip ${STATUS_TONE[a.status]}`}>{a.status}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {phase === 'during' && (
          <div className="animate-fade-in">
            <SudhaSays>Conversion versus activity, by {role === 'tm' ? 'SO' : roleById(role).childUnit}. Select a row to drill in.</SudhaSays>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[30rem] text-left text-sm">
                  <caption className="sr-only">Activity and conversion by unit</caption>
                  <thead className="bg-ivory/70 text-xs text-muted">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-medium">{role === 'tm' ? 'SO' : roleById(role).childUnit}</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Branch visit</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Leads/day</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fx.units.map((u) => (
                      <tr key={u.name} className={`border-t border-line ${unit === u.name ? 'bg-indigo-soft/60' : ''}`}>
                        <th scope="row" className="px-4 py-2.5 font-normal">
                          <button type="button" aria-pressed={unit === u.name} onClick={() => setUnit(u.name)} className="text-left font-medium text-navy underline decoration-line underline-offset-4 hover:decoration-navy">
                            {u.name}
                          </button>
                        </th>
                        <td className="tabular px-4 py-2.5">{fmtPct(u.bv)}</td>
                        <td className="tabular px-4 py-2.5">{u.leads.toFixed(1)}</td>
                        <td className="px-4 py-2.5">
                          <span className="tabular mr-2">{fmtPct(u.conv)}</span>
                          <StatusChip status={statusFromAttainment(u.conv / 10)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-2xl border border-line bg-ivory/50 p-5" aria-live="polite">
                {unit ? <Diagnosis u={fx.units.find((x) => x.name === unit)!} namesVisible={role === 'tm'} /> : <p className="text-sm text-muted">Select a row to see Sudha’s read — whether the gap is coverage or closing.</p>}
              </div>
            </div>
          </div>
        )}

        {phase === 'after' && (
          <div className="animate-fade-in">
            <SudhaSays>Capture commitments with an owner, target and date. In production I would confirm each to its owner and follow up mid-week — here it is a local simulation only.</SudhaSays>
            <AddAction
              owners={fx.owners}
              onAdd={(a) => {
                setActions((s) => [...s, a])
                setAnnounce(`Action added for ${a.owner}. Simulated only — nothing was sent or booked.`)
              }}
            />
            <ul className="mt-5 space-y-2" aria-label="Action log">
              {actions.map((a) => (
                <li key={a.id} className="grid gap-3 rounded-xl border border-line bg-paper p-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-navy">{a.metric}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {a.owner} · target {a.target} · due {a.due}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    Status
                    <select
                      value={a.status}
                      onChange={(e) => {
                        const st = e.target.value as ActionStatus
                        setActions((s) => s.map((x) => (x.id === a.id ? { ...x, status: st } : x)))
                        setAnnounce(`Status changed to ${st}.`)
                      }}
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium ${STATUS_TONE[a.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">No Teams message is sent and no calendar event is created.</p>
          </div>
        )}
      </TabPanel>
    </div>
  )
}

function Card({ title, items, tone }: { title: string; items: string[]; tone: 'good' | 'bad' }) {
  return (
    <div className={`rounded-2xl border p-5 ${tone === 'good' ? 'border-good/25 bg-good-soft/40' : 'border-line bg-paper'}`}>
      <p className={`text-sm font-medium ${tone === 'good' ? 'text-good' : 'text-navy'}`}>{title}</p>
      <ul className="mt-3 space-y-2.5 text-sm text-ink">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  )
}

function Diagnosis({ u, namesVisible }: { u: ReviewFixture['units'][number]; namesVisible: boolean }) {
  const bvOk = u.bv >= 80
  const convOk = u.conv >= 9
  const read = bvOk && !convOk ? 'Activity is fine; closing is the gap.' : !bvOk && convOk ? 'Conversion is near target; coverage is the gap.' : !bvOk && !convOk ? 'Both coverage and conversion need attention.' : 'On track — a recognition candidate.'
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{u.name}</p>
      <p className="display mt-2 text-2xl text-navy">{read}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-ink">
        {u.detail.map((d) => (
          <li key={d}>· {d}</li>
        ))}
      </ul>
      {!namesVisible && <p className="mt-3 text-xs text-muted">Drill-down at this level stays aggregated — individual SO names go to their direct manager.</p>}
    </>
  )
}

function AddAction({ owners, onAdd }: { owners: string[]; onAdd: (a: ReviewAction) => void }) {
  const [owner, setOwner] = useState(owners[0])
  const [metric, setMetric] = useState('')
  const [target, setTarget] = useState('')
  const [due, setDue] = useState('2026-08-28')
  return (
    <form
      className="mt-5 grid gap-3 rounded-2xl border border-line bg-ivory/60 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_1fr_1fr_auto] lg:items-end"
      onSubmit={(e) => {
        e.preventDefault()
        if (!metric.trim()) return
        const d = new Date(`${due}T00:00:00`)
        onAdd({ id: `a${Date.now()}`, owner, metric: metric.trim(), target: target.trim() || '—', due: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }), status: 'Open' })
        setMetric('')
        setTarget('')
      }}
    >
      <label className="text-xs text-muted">
        Owner
        <select value={owner} onChange={(e) => setOwner(e.target.value)} className="mt-1 block w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink">
          {owners.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="text-xs text-muted">
        Action / metric
        <input required value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="e.g. Clear leads older than 10 days" className="mt-1 block w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink" />
      </label>
      <label className="text-xs text-muted">
        Target
        <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 0 open > 10 days" className="mt-1 block w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink" />
      </label>
      <label className="text-xs text-muted">
        Due date
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="mt-1 block w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink" />
      </label>
      <button type="submit" className="btn btn-primary btn-sm h-11" disabled={!metric.trim()}>
        <Plus size={14} aria-hidden /> Add action
      </button>
    </form>
  )
}
