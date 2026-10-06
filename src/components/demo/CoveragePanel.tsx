import { Check, ChevronRight, MessageCircle, Send, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { roleById } from '../../data/fixtures'
import { fmtPct, statusFromAttainment } from '../../data/kpi'
import { coverageView, rollupTotals, rowPct, type CoverageView } from '../../data/scope'
import type { CoverageRollupRow, TerritoryCoverage } from '../../data/types'
import { useDemo } from '../DemoContext'
import { StatusChip, SudhaSays } from '../ui/Bits'

export const REASONS = ['On leave', 'Training', 'Branch closed', 'Bank holiday'] as const
export type Reason = (typeof REASONS)[number]

const COVERAGE_TS = 'Branch-visit log · as of 09:00, Thu 20 Aug 2026 (synthetic)'

interface BranchRow {
  id: string
  name: string
  bank: string
  daysSince: number
  so?: string
}

export function CoveragePanel() {
  const { role } = useDemo()
  const view = useMemo(() => coverageView(role), [role])
  return (
    <div>
      <CardHeader time="09:00" title="Branch coverage alert" />
      {view.kind === 'names' && <ManagerCoverage view={view} />}
      {view.kind === 'own' && <OwnCoverage view={view} />}
      {view.kind === 'territories' && <TerritoryCoverageView rows={view.rows} />}
      {view.kind === 'rollup' && <RollupCoverage view={view} />}
      <p className="mt-6 text-xs text-muted">{COVERAGE_TS}. A branch is listed when no mapped SO has checked in there this week (since Mon 17 Aug).</p>
    </div>
  )
}

export function CardHeader({ time, title, right }: { time: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="flex items-baseline gap-3 text-navy">
        <span className="tabular text-xs font-semibold uppercase tracking-[0.14em] text-teal">{time}</span>
        <span className="display text-2xl sm:text-3xl">{title}</span>
      </h3>
      {right}
    </div>
  )
}

function DaysBar({ days, max = 10 }: { days: number; max?: number }) {
  const w = Math.min(100, (days / max) * 100)
  const tone = days >= 7 ? 'bg-bad' : days >= 5 ? 'bg-warn' : 'bg-indigo/60'
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ivory-deep sm:w-28">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${w}%` }} />
      </div>
    </div>
  )
}

/* ------------------------- Territory Manager (names) ------------------------- */

function ManagerCoverage({ view }: { view: Extract<CoverageView, { kind: 'names' }> }) {
  const { askAbout, setAnnounce } = useDemo()
  const [reasons, setReasons] = useState<Record<string, Reason>>({})
  const [bySo, setBySo] = useState(false)
  const [mode, setMode] = useState<'none' | 'reason' | 'nudge'>('none')

  const open = view.unvisited.filter((b) => !reasons[b.id])
  const explained = view.unvisited.length - open.length
  const top = view.unvisited[0]

  const saveReason = (id: string, r: Reason) => {
    setReasons((s) => ({ ...s, [id]: r }))
    const b = view.unvisited.find((x) => x.id === id)!
    setAnnounce(`Reason recorded for ${b.bank} ${b.name}: ${r}. ${open.length - 1} branches still need attention.`)
    setMode('none')
  }

  return (
    <>
      <SudhaSays live>
        <p>
          Good morning, {roleById('tm').person}. <strong className="font-semibold">{view.unvisited.length} of your {view.mapped} mapped branches</strong> have no SO visit this week — longest gap first.
          {explained > 0 && (
            <>
              {' '}
              <span className="text-teal">
                {open.length} still need attention · {explained} explained
              </span>
            </>
          )}
        </p>
        <p className="mt-1 text-sm text-muted">
          Yesterday: {view.yesterday} unvisited · {view.yesterday > view.unvisited.length ? `${view.yesterday - view.unvisited.length} fewer today` : 'no change'}
        </p>
      </SudhaSays>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line">
        {bySo ? <SoWise rows={view.unvisited} reasons={reasons} /> : <BranchList rows={view.unvisited} reasons={reasons} showSo />}
      </div>

      <p className="mt-4 text-sm text-ink">
        <span className="text-teal">Sudha’s note · </span>
        {top.so} has the longest gap ({top.bank} {top.name}, {top.daysSince} days) — worth a call before the 10:00 start.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className={`btn btn-sm ${bySo ? 'bg-navy text-ivory' : 'btn-ghost'}`} aria-pressed={bySo} onClick={() => setBySo((v) => !v)}>
          <Users size={14} aria-hidden /> Show SO-wise
        </button>
        <button type="button" className={`btn btn-sm ${mode === 'reason' ? 'bg-navy text-ivory' : 'btn-ghost'}`} aria-expanded={mode === 'reason'} aria-controls="mark-reason" onClick={() => setMode(mode === 'reason' ? 'none' : 'reason')}>
          <Check size={14} aria-hidden /> Mark reason
        </button>
        <button type="button" className={`btn btn-sm ${mode === 'nudge' ? 'bg-navy text-ivory' : 'btn-ghost'}`} aria-expanded={mode === 'nudge'} aria-controls="nudge-preview" onClick={() => setMode(mode === 'nudge' ? 'none' : 'nudge')}>
          <Send size={14} aria-hidden /> Preview nudge
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => askAbout('Which branches need attention?')}>
          <MessageCircle size={14} aria-hidden /> Ask Sudha
        </button>
      </div>

      {mode === 'reason' && <MarkReason id="mark-reason" rows={open} onSave={saveReason} onCancel={() => setMode('none')} />}
      {mode === 'nudge' && <NudgePreview rows={open} sender={roleById('tm').person} />}
    </>
  )
}

function BranchList({ rows, reasons, showSo }: { rows: BranchRow[]; reasons: Record<string, Reason>; showSo: boolean }) {
  return (
    <table className="w-full text-left text-sm">
      <caption className="sr-only">Unvisited branches, longest gap first</caption>
      <thead className="bg-ivory/70 text-xs text-muted">
        <tr>
          <th scope="col" className="px-4 py-2.5 font-medium">Branch</th>
          <th scope="col" className="px-4 py-2.5 font-medium">Days since visit</th>
          {showSo && <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">Mapped SO</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((b) => (
          <tr key={b.id} className={`border-t border-line ${reasons[b.id] ? 'bg-teal-soft/40' : ''}`}>
            <th scope="row" className="px-4 py-3 font-normal">
              <span className="font-medium text-navy">
                {b.bank} {b.name}
              </span>
              {showSo && b.so && <span className="block text-xs text-muted sm:hidden">{b.so}</span>}
              {reasons[b.id] && <span className="chip mt-1 block w-fit bg-teal-soft text-teal">Reason: {reasons[b.id]}</span>}
            </th>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="tabular w-14 font-medium text-navy">{b.daysSince} days</span>
                <DaysBar days={b.daysSince} />
              </div>
            </td>
            {showSo && <td className="hidden px-4 py-3 text-ink sm:table-cell">{b.so}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function SoWise({ rows, reasons }: { rows: BranchRow[]; reasons: Record<string, Reason> }) {
  const groups = rows.reduce<Record<string, BranchRow[]>>((acc, b) => {
    ;(acc[b.so!] ??= []).push(b)
    return acc
  }, {})
  const sorted = Object.entries(groups).sort((a, b) => Math.max(...b[1].map((x) => x.daysSince)) - Math.max(...a[1].map((x) => x.daysSince)))
  return (
    <ul>
      {sorted.map(([so, bs]) => (
        <li key={so} className="border-t border-line px-4 py-3 first:border-0">
          <p className="flex items-baseline justify-between gap-2">
            <span className="font-medium text-navy">{so}</span>
            <span className="text-xs text-muted">
              {bs.length} branch{bs.length > 1 ? 'es' : ''}
            </span>
          </p>
          <ul className="mt-1.5 space-y-1 text-sm text-ink">
            {bs.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-2">
                {b.bank} {b.name} · <span className="tabular">{b.daysSince} days</span>
                {reasons[b.id] && <span className="chip bg-teal-soft text-teal">{reasons[b.id]}</span>}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

function MarkReason({ id, rows, onSave, onCancel }: { id: string; rows: BranchRow[]; onSave: (id: string, r: Reason) => void; onCancel: () => void }) {
  const [branch, setBranch] = useState(rows[0]?.id ?? '')
  const [reason, setReason] = useState<Reason | ''>('')
  if (rows.length === 0)
    return (
      <div id={id} className="mt-4 rounded-2xl bg-teal-soft/50 p-4 text-sm text-teal">
        Every listed branch has a reason recorded.
      </div>
    )
  return (
    <form
      id={id}
      className="mt-4 rounded-2xl border border-line bg-ivory/60 p-4 sm:p-5 animate-fade-in"
      onSubmit={(e) => {
        e.preventDefault()
        if (branch && reason) onSave(branch, reason)
      }}
    >
      <p className="text-sm font-medium text-navy">Mark a reason</p>
      <p className="mt-1 text-xs text-muted">One tap keeps the data fair and lets the SO be heard. Recorded locally in this demo only.</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">Branch</span>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="mt-1 block w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-ink">
            {rows.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bank} {b.name} · {b.daysSince} days
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="text-sm text-muted">Reason</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <label key={r} className={`btn btn-sm cursor-pointer ${reason === r ? 'bg-navy text-ivory' : 'border border-line bg-paper text-navy'} has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-indigo`}>
                <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="sr-only" />
                {r}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={!reason} className="btn btn-primary btn-sm disabled:opacity-40">
          Save reason
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
          Cancel
        </button>
      </div>
    </form>
  )
}

function NudgePreview({ rows, sender }: { rows: BranchRow[]; sender: string }) {
  const sos = Array.from(new Set(rows.map((r) => r.so!)))
  const [so, setSo] = useState(sos[0] ?? '')
  const draftFor = (name: string) => {
    const bs = rows.filter((r) => r.so === name)
    const list = bs.map((b) => `${b.bank} ${b.name} (${b.daysSince} days)`).join(' and ')
    return `Hi ${name.split(' ')[0]}, ${list} ${bs.length > 1 ? 'have' : 'has'} not had a visit this week. Could you plan a visit today? If something is in the way, just mark a reason. — ${sender}, via Sudha`
  }
  const [text, setText] = useState(() => draftFor(sos[0] ?? ''))
  const [log, setLog] = useState<string[]>([])

  if (sos.length === 0) return <div className="mt-4 rounded-2xl bg-teal-soft/50 p-4 text-sm text-teal">No open branches to nudge about.</div>

  return (
    <div id="nudge-preview" className="mt-4 rounded-2xl border border-line bg-ivory/60 p-4 sm:p-5 animate-fade-in">
      <p className="text-sm font-medium text-navy">Preview nudge</p>
      <p className="mt-1 text-xs text-muted">Edit the draft, then simulate. Nothing leaves this page — no Teams or app message is sent.</p>
      <label className="mt-4 block text-sm">
        <span className="text-muted">To</span>
        <select
          value={so}
          onChange={(e) => {
            setSo(e.target.value)
            setText(draftFor(e.target.value))
          }}
          className="mt-1 block w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-ink sm:w-72"
        >
          {sos.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="mt-4 block text-sm">
        <span className="text-muted">Message draft</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="mt-1 block w-full rounded-lg border border-line bg-paper px-3 py-2.5 leading-relaxed text-ink" />
      </label>
      <button type="button" className="btn btn-primary btn-sm mt-4" disabled={!text.trim()} onClick={() => setLog((l) => [`Simulated nudge to ${so} — shown here only, nothing was sent.`, ...l])}>
        <Send size={14} aria-hidden /> Simulate nudge
      </button>
      <ul aria-live="polite" className="mt-3 space-y-1 text-sm text-teal">
        {log.map((l, i) => (
          <li key={i} className="flex items-center gap-2">
            <Check size={14} aria-hidden /> {l}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------ Sales Officer ------------------------------ */

function OwnCoverage({ view }: { view: Extract<CoverageView, { kind: 'own' }> }) {
  const { askAbout, setAnnounce } = useDemo()
  const [reasons, setReasons] = useState<Record<string, Reason>>({})
  const [marking, setMarking] = useState(false)
  const open = view.unvisited.filter((b) => !reasons[b.id])
  return (
    <>
      <SudhaSays live>
        Good morning, {roleById('so').person}. {view.unvisited.length} of your {view.mapped} mapped branches have no visit this week.
        {open.length < view.unvisited.length && <span className="text-teal"> {view.unvisited.length - open.length} explained.</span>}
      </SudhaSays>
      <div className="mt-5 overflow-hidden rounded-2xl border border-line">
        <BranchList rows={[...view.branches].sort((a, b) => b.daysSince - a.daysSince)} reasons={reasons} showSo={false} />
      </div>
      <p className="mt-3 text-xs text-muted">You see only your own branches. Colleagues’ branches and exceptions are never shown to you.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className={`btn btn-sm ${marking ? 'bg-navy text-ivory' : 'btn-ghost'}`} aria-expanded={marking} aria-controls="so-reason" onClick={() => setMarking((m) => !m)}>
          <Check size={14} aria-hidden /> Mark reason
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => askAbout('Which branches need attention?')}>
          <MessageCircle size={14} aria-hidden /> Ask Sudha
        </button>
      </div>
      {marking && (
        <MarkReason
          id="so-reason"
          rows={open}
          onSave={(id, r) => {
            setReasons((s) => ({ ...s, [id]: r }))
            setAnnounce(`Reason recorded: ${r}.`)
            setMarking(false)
          }}
          onCancel={() => setMarking(false)}
        />
      )}
    </>
  )
}

/* ---------------------------- Regional Manager ---------------------------- */

function TerritoryCoverageView({ rows }: { rows: TerritoryCoverage[] }) {
  const { askAbout } = useDemo()
  const [drill, setDrill] = useState<string | null>(null)
  const total = rows.reduce((n, r) => n + r.unvisited, 0)
  const mapped = rows.reduce((n, r) => n + r.mapped, 0)
  const lw = rows.reduce((n, r) => n + r.lastWeekUnvisited, 0)
  const sel = rows.find((r) => r.name === drill)
  return (
    <>
      <SudhaSays live>
        Good morning, {roleById('rm').person}. <strong className="font-semibold">{total} of {mapped}</strong> mapped branches across your territories have no visit this week ({lw} at this point last week). The three territories with most: {rows.slice(0, 3).map((r) => r.name).join(', ')}.
      </SudhaSays>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Unvisited branches by territory</caption>
            <thead className="bg-ivory/70 text-xs text-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Territory</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Unvisited</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Week on week</th>
                <th scope="col" className="px-2 py-2.5"><span className="sr-only">Drill down</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const d = r.unvisited - r.lastWeekUnvisited
                return (
                  <tr key={r.name} className={`border-t border-line ${drill === r.name ? 'bg-indigo-soft/60' : ''}`}>
                    <th scope="row" className="px-4 py-3 font-medium text-navy">
                      {r.name}
                      {i < 3 && <span className="chip ml-2 bg-warn-soft text-warn">Top 3</span>}
                    </th>
                    <td className="tabular px-4 py-3">
                      {r.unvisited} <span className="text-muted">/ {r.mapped}</span>
                    </td>
                    <td className={`tabular px-4 py-3 ${d > 0 ? 'text-bad' : d < 0 ? 'text-good' : 'text-muted'}`}>{d === 0 ? 'No change' : `${d > 0 ? '+' : '−'}${Math.abs(d)}`}</td>
                    <td className="px-2 py-3">
                      <button type="button" className="btn btn-ghost btn-sm !px-2.5" aria-label={`Open ${r.name} one level down`} aria-pressed={drill === r.name} onClick={() => setDrill(drill === r.name ? null : r.name)}>
                        <ChevronRight size={14} aria-hidden />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-line bg-ivory/50 p-5" aria-live="polite">
          {sel ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{sel.name} · one level down</p>
              <p className="display mt-2 text-3xl text-navy">{sel.unvisited} unvisited branches</p>
              <dl className="mt-4 space-y-2 text-sm">
                {sel.buckets.map((b) => (
                  <div key={b.label} className="flex justify-between border-t border-line pt-2">
                    <dt className="text-muted">{b.label}</dt>
                    <dd className="tabular text-navy">{b.count}</dd>
                  </div>
                ))}
                <div className="flex justify-between border-t border-line pt-2">
                  <dt className="text-muted">By bank</dt>
                  <dd className="tabular text-navy">
                    BOI {sel.byBank.BOI} · UBI {sel.byBank.UBI}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-muted">Drill-down stays aggregated. Branch-level SO names go to this territory’s TM, who owns the action.</p>
            </>
          ) : (
            <p className="text-sm text-muted">Select a territory to open it one level down. You will see counts and age buckets — not SO names.</p>
          )}
        </div>
      </div>
      <div className="mt-5">
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => askAbout('Which branches need attention?')}>
          <MessageCircle size={14} aria-hidden /> Ask Sudha
        </button>
      </div>
    </>
  )
}

/* -------------------------- Zonal Head / Leadership -------------------------- */

function RollupCoverage({ view }: { view: Extract<CoverageView, { kind: 'rollup' }> }) {
  const { role, askAbout } = useDemo()
  const [drill, setDrill] = useState<string | null>(null)
  const t = rollupTotals(view.rows)
  const sel = view.rows.find((r) => r.name === drill)
  const pctCell = (v: number) => (
    <span className="flex items-center gap-2">
      <span className="tabular">{fmtPct(v)}</span>
      <span className="hidden sm:inline">
        <StatusChip status={statusFromAttainment(v / 80)} />
      </span>
    </span>
  )
  return (
    <>
      <SudhaSays live>
        Good morning, {roleById(role).person}. Branch visit across your span is <strong className="font-semibold">{fmtPct(t.pct)}</strong> against an 80% target — BOI {fmtPct((t.bank.BOI.visited / t.bank.BOI.mapped) * 100)}, UBI{' '}
        {fmtPct((t.bank.UBI.visited / t.bank.UBI.mapped) * 100)}.
      </SudhaSays>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Branch visit percentage by {view.level} and bank</caption>
          <thead className="bg-ivory/70 text-xs text-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium capitalize">{view.level}</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Branch visit</th>
              <th scope="col" className="px-4 py-2.5 font-medium">BOI</th>
              <th scope="col" className="px-4 py-2.5 font-medium">UBI</th>
              <th scope="col" className="px-2 py-2.5"><span className="sr-only">Drill down</span></th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((r: CoverageRollupRow) => (
              <tr key={r.name} className={`border-t border-line ${drill === r.name ? 'bg-indigo-soft/60' : ''}`}>
                <th scope="row" className="px-4 py-3 font-medium text-navy">{r.name}</th>
                <td className="px-4 py-3">{pctCell(rowPct(r))}</td>
                <td className="tabular px-4 py-3 text-ink">{fmtPct(rowPct(r, 'BOI'))}</td>
                <td className="tabular px-4 py-3 text-ink">{fmtPct(rowPct(r, 'UBI'))}</td>
                <td className="px-2 py-3">
                  <button type="button" className="btn btn-ghost btn-sm !px-2.5" aria-label={`Open ${r.name} one level down`} aria-pressed={drill === r.name} onClick={() => setDrill(drill === r.name ? null : r.name)}>
                    <ChevronRight size={14} aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sel && (
        <div className="mt-4 rounded-2xl border border-line bg-ivory/50 p-5 animate-fade-in" aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{sel.name} · one level down</p>
          <p className="mt-2 text-sm text-ink">
            {(sel.bank.BOI.mapped - sel.bank.BOI.visited + sel.bank.UBI.mapped - sel.bank.UBI.visited).toLocaleString('en-IN')} unvisited of {(sel.bank.BOI.mapped + sel.bank.UBI.mapped).toLocaleString('en-IN')} mapped — BOI{' '}
            {(sel.bank.BOI.mapped - sel.bank.BOI.visited).toLocaleString('en-IN')}, UBI {(sel.bank.UBI.mapped - sel.bank.UBI.visited).toLocaleString('en-IN')}.
          </p>
          <p className="mt-2 text-xs text-muted">Counts only. Names stay with each direct manager.</p>
        </div>
      )}
      {view.longest && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-navy">Top 10 longest-unvisited branches</h4>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {view.longest.map((b, i) => (
              <li key={b.name} className="flex items-baseline justify-between gap-3 border-t border-line pt-1.5">
                <span>
                  <span className="tabular mr-2 text-xs text-muted">{i + 1}</span>
                  {b.bank} {b.name} <span className="text-muted">· {b.unit}</span>
                </span>
                <span className="tabular text-navy">{b.daysSince} d</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-muted">Branches and regions only — no SO names at this level.</p>
        </div>
      )}
      <div className="mt-5">
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => askAbout('Which branches need attention?')}>
          <MessageCircle size={14} aria-hidden /> Ask Sudha
        </button>
      </div>
    </>
  )
}
