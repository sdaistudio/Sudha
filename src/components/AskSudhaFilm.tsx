import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { asset } from '../content/site'
import { useReducedMotion } from '../hooks/useMotion'

/**
 * Sudha inviting questions. Loops silently while on screen (never autoplays under reduced
 * motion); "Hear Sudha" restarts it with sound and stops looping, so she speaks once.
 */
export function AskSudhaFilm() {
  const ref = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
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

  const play = (v: HTMLVideoElement) => {
    userPaused.current = false
    void Promise.resolve(v.play()).catch(() => {})
  }

  const toggleSound = () => {
    const v = ref.current
    if (!v) return
    if (muted) {
      v.muted = false
      v.loop = false
      v.currentTime = 0
      play(v)
    } else {
      v.muted = true
      v.loop = true
    }
    setMuted(!muted)
  }

  const togglePlay = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) play(v)
    else {
      userPaused.current = true
      v.pause()
    }
  }

  // After speaking once with sound, settle back into the silent loop.
  const onEnded = () => {
    const v = ref.current
    if (!v) return
    v.muted = true
    v.loop = true
    setMuted(true)
    if (!reduced) play(v)
  }

  return (
    <figure className="relative overflow-hidden rounded-[1.75rem] border border-line bg-stage">
      <video
        ref={ref}
        src={asset('assets/video/sudha-ask-me.mp4')}
        poster={asset('assets/video/sudha-ask-me-poster.jpg')}
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="metadata"
        width={1280}
        height={720}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={onEnded}
        className="block aspect-video h-auto w-full"
        aria-label="Sudha speaks to camera, inviting you to ask her about your business"
      />
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button type="button" onClick={togglePlay} className="btn btn-light btn-sm shadow-lg" aria-label={playing ? 'Pause video' : 'Play video'}>
          {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
        </button>
        <button type="button" onClick={toggleSound} className="btn btn-light btn-sm shadow-lg" aria-pressed={!muted}>
          {muted ? <Volume2 size={14} aria-hidden /> : <VolumeX size={14} aria-hidden />} {muted ? 'Hear Sudha' : 'Mute'}
        </button>
      </div>
      <figcaption className="sr-only">Short video of Sudha introducing the Ask Sudha conversation. Plays silently; use “Hear Sudha” for sound.</figcaption>
    </figure>
  )
}
