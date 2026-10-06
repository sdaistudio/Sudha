import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { asset } from '../content/site'
import { useReducedMotion } from '../hooks/useMotion'

/** Looping concept film of the desktop companion. Muted; pauses offscreen; never autoplays under reduced motion. */
export function CompanionFilm() {
  const ref = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const userPaused = useRef(false)

  useEffect(() => {
    const v = ref.current
    if (!v || reduced) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused.current) void Promise.resolve(v.play()).catch(() => {})
      else if (!e.isIntersecting) v.pause()
    })
    io.observe(v)
    return () => io.disconnect()
  }, [reduced])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      userPaused.current = false
      void Promise.resolve(v.play()).catch(() => {})
    } else {
      userPaused.current = true
      v.pause()
    }
  }

  return (
    <figure className="relative mt-10 overflow-hidden rounded-[1.5rem] border border-line bg-ivory-deep">
      <video
        ref={ref}
        src={asset('assets/video/sudha-desktop-companion-720p.mp4')}
        poster={asset('assets/video/sudha-desktop-companion-poster.jpg')}
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="metadata"
        width={1280}
        height={720}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="block aspect-video h-auto w-full"
        aria-label="Sudha walks onto a desktop, offers water, and reacts to Yes and Remind me later"
      />
      <button type="button" onClick={toggle} className="btn btn-light btn-sm absolute bottom-4 right-4 shadow-lg" aria-label={playing ? 'Pause concept film' : 'Play concept film'}>
        {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />} {playing ? 'Pause' : 'Play'}
      </button>
      <figcaption className="sr-only">Concept film of the desktop companion. Silent.</figcaption>
    </figure>
  )
}
