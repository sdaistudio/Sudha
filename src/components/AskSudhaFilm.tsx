import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useRef } from 'react'
import { asset } from '../content/site'
import { useReducedMotion } from '../hooks/useMotion'
import { useSoundAutoplay } from '../hooks/useSoundAutoplay'

/**
 * Sudha inviting questions. Plays with sound from the start each time it scrolls into view
 * (muted until the visitor's first click or tap, as browsers require), then keeps looping
 * silently. Never autoplays under reduced motion.
 */
export function AskSudhaFilm() {
  const ref = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  const { muted, playing, toggleSound, togglePlay } = useSoundAutoplay(ref, { enabled: !reduced, restartOnEnter: true })

  // After she has spoken (or a silent pass ends), carry on as a quiet loop.
  const onEnded = () => {
    const v = ref.current
    if (!v || reduced) return
    v.muted = true
    void Promise.resolve(v.play()).catch(() => {})
  }

  return (
    <figure className="relative overflow-hidden rounded-[1.75rem] border border-line bg-stage">
      <video
        ref={ref}
        src={asset('assets/video/sudha-ask-me.mp4')}
        poster={asset('assets/video/sudha-ask-me-poster.jpg')}
        muted
        playsInline
        preload="auto"
        width={1280}
        height={720}
        onEnded={onEnded}
        className="block aspect-video h-auto w-full"
        aria-label="Sudha speaks to camera, inviting you to ask her about your business"
      />
      <div data-sound-control className="absolute bottom-3 right-3 flex gap-2">
        <button type="button" onClick={togglePlay} className="btn btn-light btn-sm shadow-lg" aria-label={playing ? 'Pause video' : 'Play video'}>
          {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
        </button>
        <button type="button" onClick={toggleSound} className="btn btn-light btn-sm shadow-lg" aria-pressed={!muted}>
          {muted ? <Volume2 size={14} aria-hidden /> : <VolumeX size={14} aria-hidden />} {muted ? 'Hear Sudha' : 'Mute'}
        </button>
      </div>
      <figcaption className="sr-only">Short video of Sudha introducing the Ask Sudha conversation, with sound.</figcaption>
    </figure>
  )
}
