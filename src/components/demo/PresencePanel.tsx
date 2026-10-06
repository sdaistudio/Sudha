import { Check, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { roleById, SO_PRESENCE_BRANCH, TM_PRESENCE_YESTERDAY_12 } from '../../data/fixtures'
import { fmtPct } from '../../data/kpi'
import { presenceView, SLOTS, summariseTm, type PresenceView } from '../../data/scope'
import type { PresenceRollupRow, PresenceSo, Slot } from '../../data/types'
import { useDemo } from '../DemoContext'
import { SudhaSays } from '../ui/Bits'
import { Tabs } from '../ui/Tabs'
import { CardHeader } from './CoveragePanel'

const CHECKIN_NOTE =
  '“Checked in” means the SO recorded a branch check-in in the activity app. Sudha reads that logged event only — it does not use GPS or track anyone’s physical location.'

export function PresencePanel() {
  const { role } = useDemo()
  const [slot, setSlot] = useState<Slot>('12:00')
  const view = useMemo(() => presenceView(role), [role])
  return (
    <div>
      <CardHeader
        time={slot}
        title="Field presence pulse"
        right={<Tabs idBase="slot" label="Snapshot time" items={SLOTS.map((s) => ({ id: s, label: <span className="tabular">{s}</span> }))} value={slot} onChange={setSlot} />}
      />
      {view.kind === 'names' && <TmPresence roster={view.roster} slot={slot} />}
      {view.kind === 'own' && <OwnPresence so={view.so} slot={slot} />}
      {view.kind === 'rollup' && <RollupPresence view={view} slot={slot} />}
      <p className="mt-6 text-xs leading-relaxed text-muted">
        Intraday activity snapshot at {slot}, Thu 20 Aug 2026 (synthetic). {CHECKIN_NOTE}
      </p>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="display tabular mt-1 text-4xl text-navy">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  )
}

/** Small accessible trend chart: logged-in count at each snapshot up to the selected one. */
function Trend({ values, slot, max, yesterday }: { values: Record<Slot, number>; slot: Slot; max: number; yesterday?: number }) {
  const shown = SLOTS.filter((s) => s <= slot)
  const desc = shown.map((s) => `${s}: ${values[s]}`).join(', ')
  return (
    <figure className="rounded-2xl border border-line bg-paper p-4">
      <figcaption className="text-xs text-muted">Logged in · 10:00 → 12:00</figcaption>
      <svg viewBox="0 0 240 96" className="mt-3 h-24 w-full" role="img" aria-label={`Logged-in trend. ${desc}${yesterday !== undefined ? `. Yesterday at 12:00: ${yesterday}` : ''}`}>
        {yesterday !== undefined && (
          <>
            <line x1="0" x2="240" y1={86 - (yesterday / max) * 70} y2={86 - (yesterday / max) * 70} stroke="var(--color-muted)" strokeDasharray="3 4" strokeWidth="1" />
            <text x="236" y={80 - (yesterday / max) * 70} textAnchor="end" fontSize="9" fill="var(--color-muted)">
              Yesterday 12:00 · {yesterday}
            </text>
          </>
        )}
        {SLOTS.map((s, i) => {
          const h = (values[s] / max) * 70
          const on = s <= slot
          return (
            <g key={s}>
              <rect x={20 + i * 76} y={86 - h} width="44" height={h} rx="4" fill={on ? 'var(--color-indigo)' : 'var(--color-line)'} opacity={on ? (s === slot ? 1 : 0.55) : 0.6} />
              <text x={42 + i * 76} y={82 - h} textAnchor="middle" fontSize="10" fill="var(--color-navy)">
                {on ? values[s] : ''}
              </text>
              <text x={42 + i * 76} y="96" textAnchor="middle" fontSize="9" fill="var(--color-muted)">
                {s}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

function TmPresence({ roster, slot }: { roster: PresenceSo[]; slot: Slot }) {
  const { setAnnounce } = useDemo()
  const s = summariseTm(slot, roster)
  const trend = { '10:00': summariseTm('10:00', roster).logged, '11:00': summariseTm('11:00', roster).logged, '12:00': summariseTm('12:00', roster).logged }
  const [nudged, setNudged] = useState<string[]>([])
  return (
    <>
      <SudhaSays live>
        {slot === '12:00' ? 'Midday' : slot === '11:00' ? 'Late-morning' : 'Morning'} pulse for your territory: <strong className="font-semibold">{s.logged} of {s.mapped}</strong> SOs logged in, {s.checked} checked in at a branch, {s.leads} leads logged so far.
        {slot === '12:00' && <> Yesterday at 12:00 you were at {TM_PRESENCE_YESTERDAY_12}.</>}
      </SudhaSays>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="SOs mapped" value={s.mapped} sub={`${s.onLeave} on approved leave`} />
        <Stat label="Logged in" value={s.logged} sub={fmtPct((s.logged / s.mapped) * 100, 0) + ' of mapped'} />
        <Stat label="Checked in at a branch" value={s.checked} />
        <Stat label="Leads logged today" value={s.leads} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Trend values={trend} slot={slot} max={roster.length} yesterday={slot === '12:00' ? TM_PRESENCE_YESTERDAY_12 : undefined} />
        <div className="rounded-2xl border border-line bg-paper p-4">
          <p className="text-xs text-muted">No activity yet at {slot}</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {s.inactive.map((so) => (
              <li key={so.name} className="chip bg-ivory-deep text-ink">
                {so.name}
                {nudged.includes(so.name) && <Check size={12} aria-label="simulated nudge" className="text-teal" />}
              </li>
            ))}
            {s.leaveInactive.map((so) => (
              <li key={so.name} className="chip bg-teal-soft text-teal">
                {so.name} · approved leave
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">SOs on approved leave are excluded from follow-up suggestions.</p>
          {s.inactive.length > 0 && (
            <button
              type="button"
              className="btn btn-primary btn-sm mt-4"
              onClick={() => {
                setNudged(s.inactive.map((x) => x.name))
                setAnnounce(`Simulated nudge to ${s.inactive.length} SOs. Nothing was sent.`)
              }}
            >
              <Send size={14} aria-hidden /> Nudge the {s.inactive.length} (simulated)
            </button>
          )}
          {nudged.length > 0 && <p className="mt-2 text-xs text-teal" role="status">Simulated only — no message was sent.</p>}
        </div>
      </div>
    </>
  )
}

function OwnPresence({ so, slot }: { so: PresenceSo; slot: Slot }) {
  const logged = so.loginAt !== null && so.loginAt <= slot
  const checked = so.checkinAt !== null && so.checkinAt <= slot
  return (
    <>
      <SudhaSays live>
        {roleById('so').person}, here is your own activity at {slot}. {checked ? `You checked in at ${SO_PRESENCE_BRANCH} at ${so.checkinAt}.` : logged ? 'You are logged in; no branch check-in yet.' : 'No login yet today.'}
      </SudhaSays>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Logged in" value={logged ? so.loginAt! : '—'} />
        <Stat label="Branch check-in" value={checked ? so.checkinAt! : '—'} sub={checked ? SO_PRESENCE_BRANCH : undefined} />
        <Stat label="Leads logged today" value={so.leads[slot]} />
      </div>
      <p className="mt-3 text-xs text-muted">You see only your own activity. Team-level presence goes to your Territory Manager.</p>
    </>
  )
}

function RollupPresence({ view, slot }: { view: Extract<PresenceView, { kind: 'rollup' }>; slot: Slot }) {
  const { role } = useDemo()
  const rows = view.rows
  const tot = rows.reduce(
    (a, r: PresenceRollupRow) => ({ mapped: a.mapped + r.mapped, leave: a.leave + r.onLeave, logged: a.logged + r.logged[slot], checked: a.checked + r.checked[slot] }),
    { mapped: 0, leave: 0, logged: 0, checked: 0 },
  )
  const avail = (r: { mapped: number; onLeave: number }) => r.mapped - r.onLeave
  return (
    <>
      <SudhaSays live>
        {roleById(role).person}, at {slot} {fmtPct((tot.logged / (tot.mapped - tot.leave)) * 100)} of available SOs across your span are logged in and {fmtPct((tot.checked / (tot.mapped - tot.leave)) * 100)} have checked in at a branch.
        {slot !== '12:00' && <span className="text-muted"> (The planned roll-up to your level is sent at 12:00 only; earlier snapshots are shown here for the demo.)</span>}
      </SudhaSays>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <caption className="sr-only">Field presence by {view.level} at {slot}</caption>
          <thead className="bg-ivory/70 text-xs text-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium capitalize">{view.level}</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Available SOs</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Logged in</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Checked in</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-line">
                <th scope="row" className="px-4 py-3 font-medium text-navy">{r.name}</th>
                <td className="tabular px-4 py-3">
                  {avail(r).toLocaleString('en-IN')} <span className="text-xs text-muted">({r.onLeave} on leave)</span>
                </td>
                <td className="tabular px-4 py-3">{fmtPct((r.logged[slot] / avail(r)) * 100)}</td>
                <td className="tabular px-4 py-3">{fmtPct((r.checked[slot] / avail(r)) * 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Percentages of available SOs (mapped minus approved leave). Counts only — no names above the Territory Manager.</p>
    </>
  )
}
