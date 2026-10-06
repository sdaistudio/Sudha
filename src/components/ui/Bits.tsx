import type { ReactNode } from 'react'
import { STATUS_LABEL } from '../../data/kpi'
import type { Status } from '../../data/types'
import { asset } from '../../content/site'
import { Reveal } from './Reveal'

export function SectionHeader({ eyebrow, title, intro, dark = false, id }: { eyebrow: string; title: ReactNode; intro?: ReactNode; dark?: boolean; id?: string }) {
  return (
    <Reveal className="max-w-3xl">
      <p className={`eyebrow ${dark ? '!text-[#7fd1c9]' : ''}`}>{eyebrow}</p>
      <h2 id={id} className={`display mt-4 text-[2.4rem] sm:text-5xl lg:text-[3.6rem] ${dark ? 'text-ivory' : 'text-navy'}`}>
        {title}
      </h2>
      {intro && <p className={`mt-6 max-w-2xl text-lg leading-relaxed ${dark ? 'text-ivory/75' : 'text-muted'}`}>{intro}</p>}
    </Reveal>
  )
}

const STATUS_STYLE: Record<Status, string> = {
  good: 'bg-good-soft text-good',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  neutral: 'bg-ivory-deep text-muted',
}
const STATUS_WORD: Record<Status, string> = { good: 'On target', warn: 'Near target', bad: 'Below target', neutral: 'No target' }
const STATUS_DOT: Record<Status, string> = { good: 'bg-good', warn: 'bg-warn', bad: 'bg-bad', neutral: 'bg-muted/50' }

export function StatusChip({ status }: { status: Status }) {
  return (
    <span className={`chip ${STATUS_STYLE[status]}`} title={STATUS_LABEL[status]}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_WORD[status]}
    </span>
  )
}

export function DemoBadge({ className = '' }: { className?: string }) {
  return <span className={`chip border border-indigo/30 bg-indigo-soft text-indigo ${className}`}>Illustrative demo · Synthetic data</span>
}

export function SampleBadge() {
  return <span className="chip border border-warn/30 bg-warn-soft text-warn">Sample content</span>
}

/** Sudha speaking: small portrait + message bubble. */
export function SudhaSays({ children, label = 'Sudha', live = false, className = '' }: { children: ReactNode; label?: string; live?: boolean; className?: string }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <img src={asset('assets/sudha/sudha-avatar.webp')} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full bg-stage object-cover ring-1 ring-line" />
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-paper px-4 py-3 ring-1 ring-line" aria-live={live ? 'polite' : undefined}>
        <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-teal">{label}</p>
        <div className="text-[0.95rem] leading-relaxed text-ink">{children}</div>
      </div>
    </div>
  )
}
