import { useRef, type KeyboardEvent, type ReactNode } from 'react'

export interface TabItem<T extends string> {
  id: T
  label: ReactNode
}

/**
 * Accessible tablist with roving focus (arrow keys, Home, End).
 * Panels are rendered by the caller using `panelId(id)` / `tabId(id)`.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  className = '',
  tabClassName,
  dark = false,
  idBase,
}: {
  items: TabItem<T>[]
  value: T
  onChange: (v: T) => void
  label: string
  className?: string
  tabClassName?: (active: boolean) => string
  dark?: boolean
  /** Shared with <TabPanel idBase> so tabs and panels reference each other. */
  idBase: string
}) {
  const base = idBase
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent, i: number) => {
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % items.length
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + items.length) % items.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = items.length - 1
    if (next >= 0) {
      e.preventDefault()
      onChange(items[next].id)
      refs.current[next]?.focus()
    }
  }
  const defaultCls = (active: boolean) =>
    dark
      ? `btn btn-sm ${active ? 'bg-ivory text-navy' : 'text-ivory/80 hover:text-ivory border border-white/20'}`
      : `btn btn-sm ${active ? 'bg-navy text-ivory' : 'text-navy border border-line hover:border-navy'}`
  return (
    <div role="tablist" aria-label={label} className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((t, i) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            role="tab"
            type="button"
            id={`${base}-tab-${t.id}`}
            aria-selected={active}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={(tabClassName ?? defaultCls)(active)}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({ children, idBase, id, className = '', hidden }: { children: ReactNode; idBase: string; id: string; className?: string; hidden?: boolean }) {
  return (
    <div role="tabpanel" hidden={hidden} id={`${idBase}-panel-${id}`} aria-labelledby={`${idBase}-tab-${id}`} tabIndex={0} className={`focus-visible:outline-offset-4 ${className}`}>
      {children}
    </div>
  )
}
