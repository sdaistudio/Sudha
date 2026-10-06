import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NAV } from '../content/site'
import { useScrolled } from '../hooks/useMotion'

export function Nav() {
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const first = panelRef.current?.querySelector<HTMLElement>('a,button')
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
      if (e.key === 'Tab' && panelRef.current) {
        const f = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a,button'))
        const [a, z] = [f[0], f[f.length - 1]]
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault()
          z.focus()
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault()
          a.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? 'border-b border-line bg-ivory/90 backdrop-blur-md' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <a href="#main" className="sr-only-focusable absolute left-4 top-3 z-10 rounded bg-navy px-3 py-2 text-ivory">
        Skip to content
      </a>
      <nav aria-label="Primary" className="container-x flex h-16 items-center justify-between gap-6">
        <a href="#top" className="flex items-baseline gap-2 text-navy">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em]">SUD Life</span>
          <span aria-hidden className="text-line">/</span>
          <span className="display text-xl">Sudha</span>
        </a>
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} className="rounded-full px-3 py-2 text-sm text-navy/80 transition-colors hover:text-navy hover:bg-ivory-deep">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a href="#demo" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Experience Sudha
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="btn btn-ghost btn-sm lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            <span>Menu</span>
          </button>
        </div>
      </nav>
      {open && (
        <div
          id="mobile-nav"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-ivory lg:hidden animate-fade-in"
        >
          <ul className="container-x divide-y divide-line py-4">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={() => setOpen(false)} className="display block py-4 text-3xl text-navy">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="container-x flex flex-col gap-3 pb-10">
            <a href="#demo" onClick={() => setOpen(false)} className="btn btn-primary">
              Experience Sudha
            </a>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
              Close menu
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
