import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { asset } from '../../content/site'
import { boxOf, EYES, FACE, IMG, MAX_EYE, NECK, openingOf, placeIn, polygonIn, socketOf, type EyeGeom, type Pt } from './rig'
import { createWarp } from './warp'

/** Lets the page direct Sudha's attention through the same gaze system the pointer uses. */
export interface SudhaHandle {
  /** Hold her gaze on an element (e.g. a hovered CTA) until released. */
  lookAt(el: Element): void
  release(el?: Element): void
  /** Brief glance at an element, a natural blink, then back to the visitor. */
  glance(el: Element, ms?: number): void
}

const PORTRAIT = 'assets/sudha/sudha-portrait-upper.webp'
const LID_SKIN = ['#f4ba8f', '#eeaa80', '#e39a72'] as const
const LASH = '#2a1209'

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pct = (v: number, of: number) => `${(v / of) * 100}%`

interface Spring {
  x: number
  y: number
  vx: number
  vy: number
}
/** Critically damped spring: soft start, soft stop, no overshoot. */
function stepSpring(s: Spring, tx: number, ty: number, w: number, dt: number) {
  s.vx += (w * w * (tx - s.x) - 2 * w * s.vx) * dt
  s.vy += (w * w * (ty - s.y) - 2 * w * s.vy) * dt
  s.x += s.vx * dt
  s.y += s.vy * dt
}

function Eye({ eye, irisRef, lidRef }: { eye: EyeGeom; irisRef: (el: HTMLImageElement | null) => void; lidRef: (el: SVGSVGElement | null) => void }) {
  const b = boxOf(eye)
  const vb = `${b.x} ${b.y} ${b.w} ${b.h}`
  const { cx, cy, half } = eye.iris
  const line = (pts: readonly Pt[]) => pts.map((p) => p.join(',')).join(' ')
  // Closed-lid lash line sits just above the lower lid.
  const closed: Pt[] = eye.bottom.map(([x, y]) => [x, y - 1.1])
  const lidPath = `M${b.x - 1},${b.y - 2} H${b.x + b.w + 1} V${eye.outer[1]} L${eye.outer.join(',')} ${[...closed]
    .reverse()
    .map((p) => `L${p.join(',')}`)
    .join(' ')} L${eye.inner.join(',')} H${b.x - 1} Z`
  const gid = `sudha-lid-${eye.iris.cx}`
  const fid = `sudha-soft-${eye.iris.cx}`
  return (
    <div className="absolute" style={placeIn(b)}>
      {/* Eyeball: sclera + moving iris + static lid shadow, clipped to the eye opening */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: polygonIn(openingOf(eye), b),
          background: 'radial-gradient(ellipse 62% 85% at 50% 64%, #f1ebee 0%, #e6dcdc 55%, #cfbfbc 100%)',
        }}
      >
        <img
          ref={irisRef}
          src={asset(eye.iris.src)}
          alt=""
          draggable={false}
          className="absolute max-w-none select-none"
          style={{ left: pct(cx - half - b.x, b.w), top: pct(cy - half - b.y, b.h), width: pct(2 * half, b.w), height: pct(2 * half, b.h), willChange: 'transform' }}
        />
        <svg className="absolute inset-0 h-full w-full" viewBox={vb} preserveAspectRatio="none">
          <defs>
            <filter id={fid} x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="0.55" />
            </filter>
          </defs>
          <g filter={`url(#${fid})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polygon points={line(openingOf(eye))} stroke={LASH} strokeOpacity="0.28" strokeWidth="1.3" />
            <polyline points={line([eye.inner, ...eye.top, eye.outer])} stroke={LASH} strokeOpacity="0.5" strokeWidth="2.6" />
          </g>
        </svg>
      </div>
      {/* Upper lid for blinking, clipped to the lash band + opening */}
      <div className="absolute inset-0" style={{ clipPath: polygonIn(socketOf(eye), b) }}>
        <svg
          ref={lidRef}
          className="absolute inset-0 h-full w-full"
          viewBox={vb}
          preserveAspectRatio="none"
          style={{ transform: 'translate3d(0,-100%,0)', willChange: 'transform' }}
        >
          <defs>
            <linearGradient id={gid} x1="0" y1={b.y} x2="0" y2={b.y + b.h} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={LID_SKIN[0]} />
              <stop offset="0.7" stopColor={LID_SKIN[1]} />
              <stop offset="1" stopColor={LID_SKIN[2]} />
            </linearGradient>
          </defs>
          <path d={lidPath} fill={`url(#${gid})`} />
          <polyline points={line([eye.inner, ...closed, eye.outer])} fill="none" stroke={LASH} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

/**
 * Sudha as a layered 2D rig over the original illustration: breathing body, a WebGL
 * head/face warp (turn, nod, tilt) and independent irises and lids that ride on it. All motion runs in one rAF loop writing transforms directly —
 * pointer data lives in refs, so nothing re-renders while she looks around.
 */
export function SudhaAvatar({ ref, alt }: { ref?: Ref<SudhaHandle>; alt: string }) {
  const [failed, setFailed] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const baseRef = useRef<HTMLImageElement>(null)
  const irisRefs = useRef<(HTMLImageElement | null)[]>([])
  const lidRefs = useRef<(SVGSVGElement | null)[]>([])
  const attn = useRef({ cta: null as Element | null, note: null as Element | null, noteUntil: 0, blinkAt: 0 })

  useImperativeHandle(ref, () => ({
    lookAt(el) {
      attn.current.cta = el
    },
    release(el) {
      if (!el || attn.current.cta === el) attn.current.cta = null
    },
    glance(el, ms = 1100) {
      const now = performance.now()
      attn.current.note = el
      attn.current.noteUntil = now + ms
      attn.current.blinkAt = now + rand(320, 420)
    },
  }))

  useEffect(() => {
    const root = rootRef.current, body = bodyRef.current, head = headRef.current
    if (failed || !root || !body || !head || typeof requestAnimationFrame !== 'function') return
    const mq = (q: string) => (window.matchMedia ? window.matchMedia(q) : ({ matches: false } as MediaQueryList))
    const reduced = mq('(prefers-reduced-motion: reduce)')
    const finePointer = mq('(hover: hover) and (pointer: fine)')

    const pointer = { x: 0, y: 0, has: false, moved: 0 }
    const eye: Spring = { x: 0, y: 0, vx: 0, vy: 0 }
    const hd: Spring = { x: 0, y: 0, vx: 0, vy: 0 }
    let soft = 1
    let glanceUntil = 0, nextGlance = 0
    let wander = { x: 0, y: 0, until: 0 }
    let idleLook = { x: 0, y: 0, k: 1 }
    let micro = { x: 0, y: 0, next: 0 }
    let blink = { t0: -1, close: 0, hold: 0, open: 0 }
    let pendingDouble = 0
    let nextBlink = performance.now() + rand(1200, 3000)
    let breath = Math.random() * Math.PI * 2
    let raf = 0, last = 0, visible = true, onScreen = true

    // Head/face warp on WebGL; without it the eyes still work over the plain image.
    const canvas = canvasRef.current, base = baseRef.current
    let warp: ReturnType<typeof createWarp> = null
    const texture = new Image()
    texture.onload = () => {
      if (!canvas || !base) return
      warp = createWarp(canvas, texture)
      if (!warp) return
      warp.resize()
      warp.draw({ hx: 0, hy: 0, fx: 0, fy: 0, roll: 0 })
      canvas.style.opacity = '1'
      base.style.opacity = '0'
    }
    texture.src = asset(PORTRAIT)
    const ro = new ResizeObserver(() => warp?.resize())
    if (canvas) ro.observe(canvas)
    const onLost = (e: Event) => {
      e.preventDefault()
      warp = null
      if (canvas) canvas.style.opacity = '0'
      if (base) base.style.opacity = '1'
    }
    canvas?.addEventListener('webglcontextlost', onLost)

    const startBlink = (now: number) => {
      blink = { t0: now, close: rand(55, 75), hold: rand(15, 35), open: rand(80, 110) }
      const end = blink.close + blink.hold + blink.open
      if (!pendingDouble && Math.random() < 0.07) pendingDouble = now + end + rand(90, 140)
      // Mostly 2.5–6.5 s apart, now and then a longer pause.
      nextBlink = now + end + (Math.random() < 0.14 ? rand(6500, 9500) : rand(2500, 6500))
    }
    const closure = (now: number) => {
      if (blink.t0 < 0) return 0
      const t = now - blink.t0
      if (t < blink.close) return (t / blink.close) ** 2
      if (t < blink.close + blink.hold) return 1
      const e = (t - blink.close - blink.hold) / blink.open
      if (e >= 1) {
        blink.t0 = -1
        return 0
      }
      return (1 - e) ** 2
    }
    const centerOf = (el: Element) => {
      const r = el.getBoundingClientRect()
      return [r.left + r.width / 2, r.top + r.height / 2] as const
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60)
      last = now
      const t = now / 1000
      const calm = reduced.matches

      // Reads first (one rect per frame), writes at the end.
      const rect = body.getBoundingClientRect()
      const s = rect.width / IMG.w
      const fx = rect.left + FACE[0] * s, fy = rect.top + FACE[1] * s

      // 1. Choose what she is attending to.
      const a = attn.current
      let point: readonly [number, number] | null = null
      let fromPointer = false
      if (a.note && now < a.noteUntil) point = centerOf(a.note)
      else if (a.cta) point = centerOf(a.cta)
      else if (finePointer.matches && pointer.has) {
        point = [pointer.x, pointer.y]
        fromPointer = true
      }

      // 2. cursor → normalised gaze. Soft saturation: responsive near her, restrained far away.
      let gx = 0, gy = 0
      if (point) {
        const dx = point[0] - fx, dy = point[1] - fy
        const L = Math.hypot(dx, dy)
        if (L > 0.5) {
          const R = Math.min(420, Math.max(220, window.innerWidth * 0.3))
          const m = L / Math.sqrt(L * L + R * R)
          gx = (dx / L) * m
          gy = (dy / L) * m * 1.1
          const n = Math.hypot(gx, gy)
          if (n > 1) (gx /= n), (gy /= n)
        }
      }

      // 3. Attention softens when the cursor rests; now and then she drifts back towards the visitor.
      if (fromPointer) {
        const idle = now - pointer.moved
        soft += ((idle > 1400 ? 0.72 : 1) - soft) * (1 - Math.exp(-dt / (idle > 1400 ? 0.9 : 0.12)))
        if (idle > 3000 && now > nextGlance) {
          // Resting cursor: sometimes back to the visitor, sometimes a thoughtful look aside.
          glanceUntil = now + rand(900, 1900)
          nextGlance = glanceUntil + rand(2500, 6000)
          idleLook = Math.random() < 0.55 ? { x: 0, y: 0, k: 0.15 } : { x: rand(-0.55, 0.55), y: rand(-0.3, 0.15), k: 0 }
        }
        if (idle < 3000) nextGlance = Math.max(nextGlance, now + rand(500, 1500))
        const k = now < glanceUntil ? idleLook.k : 1
        gx = gx * soft * k + (now < glanceUntil ? idleLook.x : 0)
        gy = gy * soft * k + (now < glanceUntil ? idleLook.y : 0)
      } else {
        soft = 1
        glanceUntil = 0
        if (!point) {
          // No pointer (touch, or the cursor left the window): rest on the visitor, with the odd look around.
          if (now > wander.until) {
            const away = Math.random() < (finePointer.matches ? 0.3 : 0.45)
            wander = away ? { x: rand(-0.6, 0.6), y: rand(-0.3, 0.2), until: now + rand(900, 2000) } : { x: 0, y: 0, until: now + rand(2000, 5000) }
          }
          gx = wander.x
          gy = wander.y
        }
      }

      // 4. Fixational micro-movements.
      if (now > micro.next) micro = { x: rand(-0.09, 0.09), y: rand(-0.07, 0.07), next: now + rand(600, 2200) }
      gx += micro.x
      gy += micro.y

      // 5. Eyes lead — quick, saccade-like for big shifts, smooth pursuit for small ones;
      //    the head follows behind them.
      const far = Math.hypot(gx - eye.x, gy - eye.y) > 0.3
      for (let left = dt; left > 0; left -= 1 / 120) {
        const h = Math.min(left, 1 / 120)
        stepSpring(eye, gx, gy, far ? 40 : 26, h)
        stepSpring(hd, eye.x, eye.y, 4.2, h)
      }

      // 6. Blinks run on their own irregular clock (plus the one after a glance).
      if (a.blinkAt && now >= a.blinkAt) {
        a.blinkAt = 0
        if (blink.t0 < 0) startBlink(now)
      }
      if (pendingDouble && now >= pendingDouble && blink.t0 < 0) {
        pendingDouble = 0
        startBlink(now)
      } else if (now >= nextBlink && blink.t0 < 0) startBlink(now)
      const c = Math.max(closure(now), calm ? 0 : Math.max(0, eye.y) * 0.3)

      // Writes.
      const ex = eye.x * MAX_EYE.x * s, ey = eye.y * MAX_EYE.y * s
      for (const img of irisRefs.current) if (img) img.style.transform = `translate3d(${ex.toFixed(3)}px,${ey.toFixed(3)}px,0)`
      for (const lid of lidRefs.current) if (lid) lid.style.transform = `translate3d(0,${((c - 1) * 100).toFixed(2)}%,0)`

      if (calm) {
        head.style.transform = ''
        body.style.transform = ''
        warp?.draw({ hx: 0, hy: 0, fx: 0, fy: 0, roll: 0 })
        return
      }
      // Breathing: chest and shoulders rise (body scales up from the waist), plus a slow sway.
      breath += (dt * Math.PI * 2) / (4.4 + 0.6 * Math.sin(t * 0.11))
      const br = (1 - Math.cos(breath)) / 2
      const sway = (0.9 * Math.sin(t * 0.21) + 0.5 * Math.sin(t * 0.47 + 1.3)) * s
      body.style.transform = `translate3d(${sway.toFixed(3)}px,0,0) scale(${1 + 0.0016 * br},${1 + 0.0055 * br})`

      // Head: turn/nod follows the eyes; tilt leans into the gaze; a little idle drift on top.
      const drift = { x: 1.2 * Math.sin(t * 0.31 + 0.7), y: 0.9 * Math.sin(t * 0.43 + 2) - br * 0.8 }
      const pose = {
        hx: hd.x * 4.5 + drift.x,
        hy: hd.y * 3 + drift.y,
        fx: hd.x * 3.2,
        fy: hd.y * 1.8,
        roll: ((hd.x * 1.4 + 0.5 * Math.sin(t * 0.27) + 0.25 * Math.sin(t * 0.71 + 1)) * Math.PI) / 180,
      }
      if (warp && !warp.lost()) {
        warp.draw(pose)
        head.style.transform = `translate3d(${((pose.hx + pose.fx) * s).toFixed(3)}px,${((pose.hy + pose.fy) * s).toFixed(3)}px,0) rotate(${pose.roll.toFixed(5)}rad)`
      } else head.style.transform = ''
    }

    const run = () => {
      cancelAnimationFrame(raf)
      raf = 0
      if (visible && onScreen) {
        last = 0
        raf = requestAnimationFrame(frame)
      }
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.has = true
      pointer.moved = performance.now()
    }
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) pointer.has = false
    }
    const onBlur = () => (pointer.has = false)
    const onVis = () => {
      visible = document.visibilityState !== 'hidden'
      run()
    }
    const io = new IntersectionObserver(([en]) => {
      onScreen = en.isIntersecting
      run()
    })
    io.observe(root)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseout', onOut)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVis)
    run()
    return () => {
      cancelAnimationFrame(raf)
      texture.onload = null
      ro.disconnect()
      canvas?.removeEventListener('webglcontextlost', onLost)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseout', onOut)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [failed])

  if (failed)
    return <div className="flex h-full items-center justify-center p-10 text-center text-muted">Sudha portrait unavailable. Replace {PORTRAIT}.</div>

  return (
    <div ref={rootRef} className="absolute inset-0">
      {/* Canvas in image coordinates (object-cover / top), slightly oversized so breathing never shows an edge */}
      <div
        ref={bodyRef}
        className="absolute left-1/2 top-[-0.6%] h-[101.2%]"
        style={{ aspectRatio: `${IMG.w} / ${IMG.h}`, translate: '-50% 0', transformOrigin: '50% 100%', willChange: 'transform' }}
      >
        <img
          ref={baseRef}
          src={asset(PORTRAIT)}
          alt={alt}
          width={IMG.w}
          height={IMG.h}
          fetchPriority="high"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full select-none"
          draggable={false}
        />
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full opacity-0" />
        {/* Eye layers ride the same rigid head motion as the warp's core */}
        <div
          ref={headRef}
          aria-hidden
          className="absolute inset-0"
          style={{ transformOrigin: `${pct(NECK[0], IMG.w)} ${pct(NECK[1], IMG.h)}`, willChange: 'transform' }}
        >
          {EYES.map((e, i) => (
            <Eye key={i} eye={e} irisRef={(el) => void (irisRefs.current[i] = el)} lidRef={(el) => void (lidRefs.current[i] = el)} />
          ))}
        </div>
      </div>
    </div>
  )
}
