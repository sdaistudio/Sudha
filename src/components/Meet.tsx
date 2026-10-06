import { Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { asset } from '../content/site'

/**
 * Meet Sudha — the introduction video, placed directly below the hero.
 * Autoplays with sound when scrolled into view. Browsers block unmuted autoplay
 * until the visitor has interacted with the page; in that case it falls back to
 * muted playback and offers an "Unmute" button.
 */
export function Meet() {
  const ref = useRef<HTMLVideoElement>(null)
  const [blockedSound, setBlockedSound] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const play = (muted: boolean) => {
      v.muted = muted
      try {
        return Promise.resolve(v.play())
      } catch {
        return Promise.reject(new Error('play unavailable'))
      }
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.paused || v.ended) return
          play(false)
            .then(() => setBlockedSound(false))
            .catch(() =>
              play(true)
                .then(() => setBlockedSound(true))
                .catch(() => setBlockedSound(true)),
            )
        } else if (!v.paused) {
          v.pause()
        }
      },
      { threshold: 0.5 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const unmute = () => {
    const v = ref.current
    if (!v) return
    v.muted = false
    if (v.ended) v.currentTime = 0
    void Promise.resolve(v.play()).catch(() => {})
    setBlockedSound(false)
  }

  return (
    <section id="meet" aria-labelledby="meet-title" className="pt-20 pb-8 lg:pt-12">
      <div className="container-x">
        <div className="grid items-center gap-8 rounded-[2rem] bg-navy p-5 text-ivory sm:p-8 lg:grid-cols-[1fr_1.5fr] lg:p-12 on-dark">
          <div>
            <p className="eyebrow !text-[#7fd1c9]">Meet Sudha</p>
            <h2 id="meet-title" className="display mt-3 text-3xl sm:text-5xl">
              A colleague who already knows your numbers.
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-ivory/70">
              Sudha is SUD Life’s proposed AI business companion for the sales hierarchy — from Sales Officers to leadership. She works only from data that is already logged.
            </p>
            <p className="mt-6 text-xs text-ivory/50">Concept animation · plays with sound when in view; use the controls to pause or mute.</p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy-soft">
            <video
              ref={ref}
              className="h-full w-full object-cover"
              src={asset('assets/video/sudha-intro.mp4')}
              poster={asset('assets/video/sudha-intro-poster.jpg')}
              preload="auto"
              playsInline
              controls
              aria-label="Concept animation: Sudha walks into an office and introduces herself"
            />
            {blockedSound && (
              <button type="button" onClick={unmute} className="btn btn-light btn-sm absolute left-4 top-4 shadow-lg">
                <Volume2 size={15} aria-hidden /> Unmute
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
