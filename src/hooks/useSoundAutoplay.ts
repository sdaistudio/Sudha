import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Autoplay-with-sound for videos as they scroll into view.
 *
 * Browsers only allow unmuted playback after the visitor has interacted with the page
 * (click, tap or key — scrolling does not count). Until then the video plays muted, and
 * the first interaction anywhere on the page switches sound on for the video in view.
 * Only one video is audible at a time.
 */
const visible = new Set<HTMLVideoElement>()
const wantsSound = new Set<HTMLVideoElement>()
let gestureArmed = false

const tryPlay = (v: HTMLVideoElement) => {
  try {
    return Promise.resolve(v.play())
  } catch {
    return Promise.reject(new Error('play unavailable'))
  }
}

function soloSound(v: HTMLVideoElement) {
  for (const o of visible) if (o !== v) o.muted = true
}

function playWithSound(v: HTMLVideoElement, fromStart: boolean) {
  if (fromStart) v.currentTime = 0
  soloSound(v)
  v.loop = false // speech plays once; never loop with sound
  v.muted = false
  return tryPlay(v)
}

function armGesture() {
  if (gestureArmed) return
  gestureArmed = true
  const events = ['pointerdown', 'keydown', 'touchend'] as const
  const onGesture = (e: Event) => {
    // The video's own controls handle sound themselves.
    if ((e.target as Element | null)?.closest?.('video, [data-sound-control]')) return
    events.forEach((e) => window.removeEventListener(e, onGesture, true))
    gestureArmed = false
    const v = [...wantsSound].find((x) => visible.has(x))
    if (v) {
      wantsSound.delete(v)
      void playWithSound(v, true).catch(() => (v.muted = true))
    }
  }
  events.forEach((e) => window.addEventListener(e, onGesture, true))
}

export function useSoundAutoplay(ref: RefObject<HTMLVideoElement | null>, { enabled = true, restartOnEnter = false, threshold = 0.5 } = {}) {
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const userPaused = useRef(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const sync = () => {
      setMuted(v.muted)
      setPlaying(!v.paused)
    }
    const evs = ['volumechange', 'play', 'pause', 'ended'] as const
    evs.forEach((e) => v.addEventListener(e, sync))
    if (!enabled) return () => evs.forEach((e) => v.removeEventListener(e, sync))

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          visible.add(v)
          if (userPaused.current || (!v.paused && !v.muted)) return
          playWithSound(v, restartOnEnter || v.ended)
            .then(() => wantsSound.delete(v))
            .catch(() => {
              // Sound blocked until the visitor interacts: play muted meanwhile.
              v.muted = true
              void tryPlay(v).catch(() => {})
              wantsSound.add(v)
              armGesture()
            })
        } else {
          visible.delete(v)
          wantsSound.delete(v)
          userPaused.current = false
          if (!v.paused) v.pause()
        }
      },
      { threshold },
    )
    io.observe(v)
    return () => {
      io.disconnect()
      visible.delete(v)
      wantsSound.delete(v)
      evs.forEach((e) => v.removeEventListener(e, sync))
    }
  }, [ref, enabled, restartOnEnter, threshold])

  const toggleSound = useCallback(() => {
    const v = ref.current
    if (!v) return
    if (v.muted) {
      wantsSound.delete(v)
      userPaused.current = false
      void playWithSound(v, true).catch(() => {})
    } else v.muted = true
  }, [ref])

  const togglePlay = useCallback(() => {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      userPaused.current = false
      if (!v.muted) soloSound(v)
      void tryPlay(v).catch(() => {})
    } else {
      userPaused.current = true
      v.pause()
    }
  }, [ref])

  return { muted, playing, toggleSound, togglePlay }
}
