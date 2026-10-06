import { Droplet, Download, Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { asset } from '../content/site'
import { useInView, useReducedMotion } from '../hooks/useMotion'
import { SectionHeader } from './ui/Bits'

/**
 * Desktop-companion concept. Everything happens inside a simulated desktop on this
 * page. Uses static poses cut from the supplied angle sheet with subtle movement;
 * replace POSES with real walk-cycle / expression assets when available.
 */
const POSES = {
  front: 'assets/companion/front.png',
  walkLeft: 'assets/companion/leftprofile.png',
  walkRight: 'assets/companion/rightprofile.png',
  happy: 'assets/companion/happy.png',
}

export type CompanionPhase = 'resting' | 'entering' | 'asking' | 'happy' | 'sad' | 'leaving' | 'snoozed' | 'dismissing'

/** Durations in ms. SNOOZE is an accelerated demo timer standing in for ~30 minutes. */
export const DURATIONS = { entering: 1800, asking: 9000, happy: 2600, sad: 2800, leaving: 1600, snoozed: 10000, dismissing: 1600 }

const TICK = 100

export function DesktopCompanion() {
  const reduced = useReducedMotion()
  const [stageRef, onScreen] = useInView<HTMLDivElement>('100px')
  const [phase, setPhase] = useState<CompanionPhase>('resting')
  const [remaining, setRemaining] = useState(0)
  const [paused, setPaused] = useState(false)
  const [sound, setSound] = useState(false)
  const [note, setNote] = useState('Sudha is resting at the edge of the desktop.')
  const afterLeave = useRef<CompanionPhase>('resting')
  const audioRef = useRef<AudioContext | null>(null)

  const go = useCallback((p: CompanionPhase, msg?: string) => {
    setPhase(p)
    setRemaining(p === 'resting' ? 0 : DURATIONS[p as keyof typeof DURATIONS])
    if (msg) setNote(msg)
  }, [])

  const chime = useCallback(() => {
    if (!sound) return
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = (audioRef.current ??= new Ctx())
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = 880
      g.gain.setValueAtTime(0.0001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)
      o.connect(g).connect(ctx.destination)
      o.start()
      o.stop(ctx.currentTime + 0.55)
    } catch {
      /* audio is optional */
    }
  }, [sound])

  // Single pausable countdown drives every transition. Timers also pause offscreen.
  const running = phase !== 'resting' && !paused && (onScreen || phase === 'snoozed')
  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => setRemaining((r) => Math.max(0, r - TICK)), TICK)
    return () => window.clearInterval(t)
  }, [running])

  useEffect(() => {
    if (phase === 'resting' || remaining > 0) return
    switch (phase) {
      case 'entering':
        chime()
        go('asking', 'Sudha asks: Have you had your water?')
        break
      case 'asking':
        go('dismissing', 'No response — Sudha quietly steps away.')
        break
      case 'happy':
      case 'sad':
        afterLeave.current = 'resting'
        go('leaving')
        break
      case 'leaving':
      case 'dismissing':
        if (afterLeave.current === 'snoozed') {
          afterLeave.current = 'resting'
          go('snoozed', 'Reminder snoozed. Demo timer running.')
        } else go('resting', 'Sudha is back at the edge of the desktop.')
        break
      case 'snoozed':
        go('entering', 'Snooze over — Sudha returns.')
        break
    }
  }, [phase, remaining, go, chime])

  const start = () => {
    setPaused(false)
    afterLeave.current = 'resting'
    go('entering', 'Sudha walks in.')
  }
  const answer = (a: 'yes' | 'no' | 'later') => {
    if (a === 'yes') go('happy', 'Sudha: Wonderful! Keep yourself refreshed.')
    if (a === 'no') go('sad', 'Sudha: A little water break?')
    if (a === 'later') {
      afterLeave.current = 'snoozed'
      go('leaving', 'Sudha will remind you later.')
    }
  }
  const reset = () => {
    setPaused(false)
    afterLeave.current = 'resting'
    go('resting', 'Demo reset. Sudha is resting at the edge.')
  }

  const out = phase === 'resting' || phase === 'snoozed'
  const walking = phase === 'entering' || phase === 'leaving' || phase === 'dismissing'
  const pose = phase === 'entering' ? POSES.walkLeft : phase === 'leaving' || phase === 'dismissing' ? POSES.walkRight : phase === 'happy' ? POSES.happy : POSES.front
  // Horizontal position (% of stage width, right edge of figure)
  const x = out ? 104 : 74
  const moveMs = reduced ? 0 : phase === 'entering' ? DURATIONS.entering : walking ? DURATIONS.leaving : 400

  return (
    <section id="companion" aria-labelledby="companion-title" className="py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-wrap items-center gap-3">
          <span className="chip border border-teal/30 bg-teal-soft text-teal">Desktop companion concept</span>
          <span className="chip bg-ivory-deep text-muted">Separate extension · not one of the eight roadmap tracks</span>
        </div>
        <div className="mt-6">
          <SectionHeader id="companion-title" eyebrow="A small kindness" title="A little support, right when you need it." intro="A concept for a gentle desktop companion. Try a water reminder below — everything happens inside this simulated desktop." />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary" onClick={start} disabled={!out}>
            <Droplet size={16} aria-hidden /> Try a water reminder
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPaused((p) => !p)} aria-pressed={paused} disabled={phase === 'resting'}>
            {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />} {paused ? 'Resume' : 'Pause'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSound((s) => !s)} aria-pressed={sound}>
            {sound ? <Volume2 size={14} aria-hidden /> : <VolumeX size={14} aria-hidden />} Sound {sound ? 'on' : 'off'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
            <RotateCcw size={14} aria-hidden /> Reset
          </button>
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {note}
        </p>

        {/* Simulated desktop */}
        <div ref={stageRef} className={`relative mt-5 aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] border border-line bg-gradient-to-br from-[#dfe4ef] via-[#e9e6f2] to-[#efe6dc] sm:aspect-[16/10] ${paused ? 'paused' : ''}`} role="region" aria-label="Simulated desktop">
          <FakeWindows />
          {/* taskbar */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 flex h-[7%] min-h-8 items-center justify-center gap-2 bg-navy/85">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="h-[55%] w-[3.5%] min-w-5 rounded-md bg-white/25" />
            ))}
          </div>

          {/* Sudha */}
          <div
            className="absolute bottom-[7%] h-[58%] sm:h-[62%]"
            style={{ left: `${x}%`, transform: 'translateX(-100%)', transition: `left ${moveMs}ms linear` }}
          >
            <img src={asset(pose)} alt="" className={`h-full w-auto max-w-none drop-shadow-[0_10px_14px_rgba(15,27,61,0.25)] ${walking && !reduced ? 'animate-walk' : 'animate-breathe'}`} draggable={false} />
            {phase === 'happy' && (
              <span aria-hidden className="absolute -top-2 left-1/2 flex -translate-x-1/2 gap-1 text-warn animate-float-up">
                <Sparkles size={22} />
                <Sparkles size={16} className="mt-3" />
              </span>
            )}
            {phase === 'sad' && (
              <span aria-hidden className="absolute -top-1 right-0 text-indigo animate-float-up">
                <Droplet size={20} />
              </span>
            )}
          </div>
          {phase === 'resting' && (
            <span aria-hidden className="absolute bottom-[9%] right-3 rounded-full bg-paper/80 px-2.5 py-1 text-[0.65rem] text-muted">
              Resting
            </span>
          )}

          {/* Speech bubble */}
          {(phase === 'asking' || phase === 'happy' || phase === 'sad') && (
            <div className="absolute left-3 right-3 top-3 z-10 animate-float-up sm:left-auto sm:right-[30%] sm:top-auto sm:bottom-[44%] sm:w-[19rem]" role="group" aria-label="Sudha’s message">
              <div className="rounded-2xl rounded-br-sm bg-paper p-4 shadow-[0_20px_40px_-20px_rgba(15,27,61,0.45)] ring-1 ring-line">
                {phase === 'asking' && (
                  <>
                    <p className="display text-xl text-navy">Have you had your water?</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => answer('yes')}>
                        Yes
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => answer('no')}>
                        Not yet
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => answer('later')}>
                        Remind me later
                      </button>
                    </div>
                    <p className="mt-2 text-[0.68rem] text-muted">No answer? She’ll step away quietly in {Math.ceil(remaining / 1000)} s.</p>
                  </>
                )}
                {phase === 'happy' && <p className="display text-xl text-navy">Wonderful! Keep yourself refreshed.</p>}
                {phase === 'sad' && <p className="display text-xl text-navy">A little water break?</p>}
                {phase !== 'asking' && <p className="mt-1 text-[0.68rem] text-muted">Reaction shown with a static pose and an indicator — expression assets pending.</p>}
              </div>
            </div>
          )}
          {phase === 'snoozed' && (
            <div className="absolute right-3 top-3 z-10 rounded-xl bg-paper/95 px-3 py-2 text-xs text-navy ring-1 ring-line">
              <p className="font-medium">Snoozed</p>
              <p className="tabular text-muted">Back in {Math.ceil(remaining / 1000)} s · accelerated demo timer (represents ~30 min)</p>
            </div>
          )}
          {paused && (
            <div className="absolute left-3 top-3 z-20 rounded-full bg-navy px-3 py-1 text-xs text-ivory">Paused</div>
          )}
        </div>

        <div className="mt-6 grid gap-6 text-sm leading-relaxed text-muted md:grid-cols-[1.4fr_1fr]">
          <p>
            <strong className="font-medium text-navy">How this would really work.</strong> Appearing above other applications on an employee’s computer needs a separately installed desktop app, approved by IT. This website cannot install anything or control your desktop — the companion only moves inside the stage above. Reminders would respect quiet hours and could be switched off.
          </p>
          <div>
            <button type="button" disabled className="btn btn-ghost w-full justify-between opacity-60 sm:w-auto" aria-describedby="dl-note">
              <Download size={16} aria-hidden /> Download desktop app
            </button>
            <p id="dl-note" className="mt-2 text-xs">Unavailable — no installer exists yet.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function FakeWindows() {
  return (
    <div aria-hidden>
      <div className="absolute left-[5%] top-[6%] h-[48%] w-[62%] overflow-hidden rounded-xl bg-paper/90 shadow-lg ring-1 ring-line sm:w-[52%]">
        <div className="flex h-7 items-center gap-1.5 border-b border-line px-3">
          <span className="h-2 w-2 rounded-full bg-bad/50" />
          <span className="h-2 w-2 rounded-full bg-warn/50" />
          <span className="h-2 w-2 rounded-full bg-good/50" />
          <span className="ml-3 text-[0.6rem] text-muted">Territory dashboard</span>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {[64, 42, 80, 55, 30, 70].map((h, i) => (
            <div key={i} className="flex h-12 items-end rounded-md bg-ivory p-1.5 sm:h-16">
              <div className="w-full rounded-sm bg-indigo/30" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute left-[18%] top-[40%] hidden h-[34%] w-[38%] overflow-hidden rounded-xl bg-paper/95 shadow-lg ring-1 ring-line sm:block">
        <div className="flex h-7 items-center border-b border-line px-3 text-[0.6rem] text-muted">Mail</div>
        <div className="space-y-2 p-3">
          {[90, 70, 80, 60].map((w, i) => (
            <div key={i} className="h-2 rounded bg-ivory-deep" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
