import { ArrowDown, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type FocusEvent, type PointerEvent } from 'react'
import { HERO } from '../content/site'
import { SudhaAvatar, type SudhaHandle } from './sudha/SudhaAvatar'

export function Hero() {
  const sudha = useRef<SudhaHandle>(null)
  const noteRef = useRef<HTMLDivElement>(null)
  const [noteShown, setNoteShown] = useState(false)

  // The 09:00 note arrives shortly after load; Sudha glances at it, blinks, and returns.
  useEffect(() => {
    const show = setTimeout(() => setNoteShown(true), 1600)
    const look = setTimeout(() => noteRef.current && sudha.current?.glance(noteRef.current, 1150), 1750)
    return () => {
      clearTimeout(show)
      clearTimeout(look)
    }
  }, [])

  // CTAs attract her gaze through the same system as the pointer.
  const attend = {
    onPointerEnter: (e: PointerEvent<HTMLElement>) => sudha.current?.lookAt(e.currentTarget),
    onPointerLeave: (e: PointerEvent<HTMLElement>) => sudha.current?.release(e.currentTarget),
    onFocus: (e: FocusEvent<HTMLElement>) => sudha.current?.lookAt(e.currentTarget),
    onBlur: (e: FocusEvent<HTMLElement>) => sudha.current?.release(e.currentTarget),
  }

  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-20">
      {/* Soft editorial wash behind the portrait */}
      <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(closest-side,rgba(63,69,168,0.10),transparent)]" />
      <div className="container-x grid items-center gap-10 lg:min-h-[calc(100svh-1rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-6">
        <div className="relative z-10 max-w-2xl py-4 lg:py-20">
          <p className="eyebrow animate-fade-in">{HERO.eyebrow}</p>
          <h1 id="hero-title" className="display mt-6 text-[2.9rem] text-navy sm:text-6xl lg:text-[5.2rem]">
            <span className="block animate-fade-in" style={{ animationDelay: '80ms' }}>
              {HERO.heading[0]}
            </span>
            <span className="block text-navy/70 italic animate-fade-in" style={{ animationDelay: '200ms' }}>
              {HERO.heading[1]}
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted animate-fade-in" style={{ animationDelay: '320ms' }}>
            {HERO.copy}
          </p>
          <div className="mt-10 flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '420ms' }}>
            <a href="#demo" className="btn btn-primary" {...attend}>
              Experience Sudha <ArrowRight size={16} aria-hidden />
            </a>
            <a href="#roadmap" className="btn btn-ghost" {...attend}>
              See What’s Coming
            </a>
          </div>
          <p className="mt-12 max-w-md border-l-2 border-teal pl-4 text-sm leading-relaxed text-navy/80">{HERO.core}</p>
        </div>

        <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-stage lg:aspect-[5/6]">
            <SudhaAvatar
              ref={sudha}
              alt="Sudha, an illustrated companion with chestnut wavy hair, wearing a navy blazer over an ivory top, smiling with hands lightly clasped."
            />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ivory/70 to-transparent" />
          </div>
          {/* Small floating note — positioned away from her face */}
          <div
            ref={noteRef}
            className={`absolute -bottom-6 left-4 right-4 rounded-2xl bg-paper/95 p-4 shadow-[0_20px_50px_-20px_rgba(15,27,61,0.35)] ring-1 ring-line backdrop-blur sm:left-auto sm:right-[-1rem] sm:w-72 lg:bottom-16 lg:left-[-3rem] lg:right-auto transition-[opacity,translate] duration-700 ease-[var(--ease-calm)] ${noteShown ? 'opacity-100' : 'translate-y-2 opacity-0'}`}
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-teal">09:00 · Sudha</p>
            <p className="mt-1.5 text-sm leading-snug text-ink">Good morning. Six branches need a visit this week — the longest gap is nine days.</p>
            <p className="mt-2 text-[0.68rem] text-muted">Illustrative · synthetic data</p>
          </div>
        </div>
      </div>
      <div className="container-x mt-16 hidden lg:block">
        <a href="#meet" className="inline-flex items-center gap-2 text-sm text-muted hover:text-navy">
          <ArrowDown size={14} aria-hidden /> Scroll to meet her
        </a>
      </div>
    </section>
  )
}
