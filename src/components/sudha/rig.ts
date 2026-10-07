/**
 * Geometry of the layered Sudha rig, in source-image pixels of
 * assets/sudha/sudha-portrait-upper.webp (1024 × 1100).
 *
 * The eye shapes were traced against the illustration, and the iris layers
 * (assets/sudha/rig/iris-*.png) were cut from it with the lid-hidden top completed,
 * so the portrait keeps its exact look while the eyes move independently.
 */
export type Pt = readonly [number, number]

export const IMG = { w: 1024, h: 1100 } as const

/** Midpoint between the eyes — the origin for gaze maths. */
export const FACE: Pt = [489, 158]
/** Neck pivot for head tilt. */
export const NECK: Pt = [489, 285]
/**
 * Warp fields. HEAD: whole head + hair move rigidly inside `core`, fading out through
 * neck and hair ends. FACE: features shift a little further than the head outline —
 * the parallax that reads as a head turn on a flat illustration.
 */
export const HEAD_WARP = { cx: 489, cy: 150, rx: 210, ry: 200, core: 0.6 } as const
export const FACE_WARP = { cx: 489, cy: 180, rx: 110, ry: 120, core: 0.5 } as const

export interface EyeGeom {
  /** Screen-left / screen-right eye corners. */
  inner: Pt
  outer: Pt
  /** Inner edge of the upper lash line, left → right (excluding corners). */
  top: Pt[]
  /** Inner edge of the lower lid, left → right (excluding corners). */
  bottom: Pt[]
  /** Upper edge of the lash band — the blink lid sweeps down from here. */
  socketTop: Pt[]
  iris: { cx: number; cy: number; half: number; src: string }
}

export const EYES: EyeGeom[] = [
  {
    inner: [437.5, 162.6],
    outer: [473.6, 163.4],
    top: [[441, 159.2], [445, 157.2], [450, 156], [457, 155.4], [463, 155.8], [467.5, 157.2], [471, 159.6]],
    bottom: [[440, 164.4], [444, 166.2], [450, 167.4], [457, 167.8], [464, 167.2], [470, 165.8]],
    socketTop: [[439, 157], [444, 152], [451, 149], [458, 148], [465, 149], [470, 152.5]],
    iris: { cx: 457, cy: 159.9, half: 8.5, src: 'assets/sudha/rig/iris-l.png' },
  },
  {
    inner: [505.5, 160.6],
    outer: [537.6, 154.6],
    top: [[507.5, 157.6], [510, 155], [514, 152], [520, 150.5], [526, 150.2], [530, 150.6], [534, 152]],
    bottom: [[507.5, 161.4], [511, 161.8], [518, 162], [525, 161.8], [531, 160.6], [535.5, 157.8]],
    socketTop: [[508, 154.5], [512, 148.5], [519, 145.5], [526, 145], [533, 147], [537, 151]],
    iris: { cx: 520.4, cy: 154.1, half: 8.5, src: 'assets/sudha/rig/iris-r.png' },
  },
]

/** Pupil travel limits in image px — kept well inside the eye opening. */
export const MAX_EYE = { x: 4.4, y: 2.3 } as const

/** Closed Catmull-Rom spline through the points, so traced shapes have soft corners. */
export function smoothClosed(pts: readonly Pt[], steps = 6): Pt[] {
  const out: Pt[] = []
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t
      const f = (k: 0 | 1) =>
        0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)
      out.push([f(0), f(1)])
    }
  }
  return out
}

export const openingOf = (e: EyeGeom): Pt[] => [e.inner, ...e.top, e.outer, ...[...e.bottom].reverse()]
export const socketOf = (e: EyeGeom): Pt[] => [e.inner, ...e.socketTop, e.outer, ...[...e.bottom].reverse().map(([x, y]) => [x, y + 0.6] as Pt)]

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export function boxOf(e: EyeGeom): Box {
  const pts = socketOf(e)
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
  const x = Math.min(...xs) - 1, y = Math.min(...ys) - 1
  return { x, y, w: Math.max(...xs) + 1 - x, h: Math.max(...ys) + 1.5 - y }
}

/** CSS polygon() for a shape, relative to the eye box. */
export const polygonIn = (pts: readonly Pt[], b: Box) =>
  `polygon(${smoothClosed(pts)
    .map(([x, y]) => `${(((x - b.x) / b.w) * 100).toFixed(2)}% ${(((y - b.y) / b.h) * 100).toFixed(2)}%`)
    .join(',')})`

/** Absolute position of an image-space box as % of the canvas. */
export const placeIn = (b: Box) => ({
  left: `${(b.x / IMG.w) * 100}%`,
  top: `${(b.y / IMG.h) * 100}%`,
  width: `${(b.w / IMG.w) * 100}%`,
  height: `${(b.h / IMG.h) * 100}%`,
})
