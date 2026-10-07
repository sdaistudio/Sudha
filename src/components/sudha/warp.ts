import { FACE_WARP, HEAD_WARP, IMG, NECK } from './rig'

export interface WarpPose {
  /** Head translation, image px. */
  hx: number
  hy: number
  /** Extra feature shift (head-turn parallax), image px. */
  fx: number
  fy: number
  /** Head tilt, radians. */
  roll: number
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2((aPos.x + 1.0) * 0.5, (1.0 - aPos.y) * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

// Inverse warp: for each output pixel, find where it came from. Inside the head core the
// motion is rigid (so the HTML eye layers can follow it exactly); it fades smoothly to
// zero through neck and hair, so nothing tears or doubles.
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uSize, uPivot, uHeadC, uHeadR, uFaceC, uFaceR, uHeadT, uFaceT;
uniform float uHeadCore, uFaceCore, uRoll;
void main() {
  vec2 p = vUv * uSize;
  float wh = 1.0 - smoothstep(uHeadCore, 1.0, length((p - uHeadC) / uHeadR));
  float wf = 1.0 - smoothstep(uFaceCore, 1.0, length((p - uFaceC) / uFaceR));
  vec2 r = p - uPivot - uHeadT - wf * uFaceT;
  float c = cos(uRoll), s = sin(uRoll);
  vec2 back = vec2(c * r.x + s * r.y, -s * r.x + c * r.y) + uPivot;
  gl_FragColor = texture2D(uTex, mix(p, back, wh) / uSize);
}`

/** Head/face warp of the portrait on a WebGL canvas. Returns null when WebGL is unavailable. */
export function createWarp(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  let gl: WebGLRenderingContext | null = null
  try {
    gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false })
  } catch {
    return null
  }
  if (!gl) return null
  const g = gl
  const shader = (type: number, src: string) => {
    const sh = g.createShader(type)!
    g.shaderSource(sh, src)
    g.compileShader(sh)
    return sh
  }
  const prog = g.createProgram()!
  g.attachShader(prog, shader(g.VERTEX_SHADER, VERT))
  g.attachShader(prog, shader(g.FRAGMENT_SHADER, FRAG))
  g.linkProgram(prog)
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) return null
  g.useProgram(prog)

  const buf = g.createBuffer()
  g.bindBuffer(g.ARRAY_BUFFER, buf)
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW)
  const aPos = g.getAttribLocation(prog, 'aPos')
  g.enableVertexAttribArray(aPos)
  g.vertexAttribPointer(aPos, 2, g.FLOAT, false, 0, 0)

  const tex = g.createTexture()
  g.bindTexture(g.TEXTURE_2D, tex)
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR)
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR)
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
  g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, image)

  const u = (n: string) => g.getUniformLocation(prog, n)
  g.uniform2f(u('uSize'), IMG.w, IMG.h)
  g.uniform2f(u('uPivot'), NECK[0], NECK[1])
  g.uniform2f(u('uHeadC'), HEAD_WARP.cx, HEAD_WARP.cy)
  g.uniform2f(u('uHeadR'), HEAD_WARP.rx, HEAD_WARP.ry)
  g.uniform1f(u('uHeadCore'), HEAD_WARP.core)
  g.uniform2f(u('uFaceC'), FACE_WARP.cx, FACE_WARP.cy)
  g.uniform2f(u('uFaceR'), FACE_WARP.rx, FACE_WARP.ry)
  g.uniform1f(u('uFaceCore'), FACE_WARP.core)
  const uHeadT = u('uHeadT'), uFaceT = u('uFaceT'), uRoll = u('uRoll')

  return {
    /** Match the drawing buffer to the canvas' CSS size (capped at 2× DPR). */
    resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr)
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w
        canvas.height = h
      }
      g.viewport(0, 0, canvas.width, canvas.height)
    },
    draw(p: WarpPose) {
      g.uniform2f(uHeadT, p.hx, p.hy)
      g.uniform2f(uFaceT, p.fx, p.fy)
      g.uniform1f(uRoll, p.roll)
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4)
    },
    lost: () => g.isContextLost(),
  }
}
