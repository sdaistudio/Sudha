import { ArrowRight, RotateCcw } from 'lucide-react'
import { asset } from '../content/site'
import { useDemo } from './DemoContext'

export function Closing() {
  return (
    <section aria-labelledby="closing-title" className="pb-24 sm:pb-32">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-navy px-6 py-16 text-ivory sm:px-12 lg:py-24 on-dark">
          <img src={asset('assets/companion/front.png')} alt="" aria-hidden loading="lazy" className="pointer-events-none absolute bottom-0 right-6 hidden h-[90%] opacity-95 md:block lg:right-16" />
          <div className="relative max-w-2xl">
            <h2 id="closing-title" className="display text-4xl sm:text-6xl">
              Start your day with clarity. <span className="italic text-ivory/75">Move forward with Sudha.</span>
            </h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#demo" className="btn btn-light">
                Try Sudha <ArrowRight size={16} aria-hidden />
              </a>
              <a href="#roadmap" className="btn btn-ghost-light">
                Explore the Roadmap
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const { resetAll } = useDemo()
  return (
    <footer className="border-t border-line py-10">
      <div className="container-x flex flex-col gap-6 text-sm text-muted md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-navy">SUD Life · Sudha Business Companion · Illustrative product experience</p>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed">
            Capabilities and dates shown are planned, from the supplied roadmap, and are not verified as available. All names, branches and figures in the demonstration are synthetic. Nothing on this site sends messages, submits requests, books events or accesses corporate systems.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetAll()
            document.getElementById('demo')?.scrollIntoView()
          }}
          className="btn btn-ghost btn-sm shrink-0"
        >
          <RotateCcw size={14} aria-hidden /> Reset all demos
        </button>
      </div>
    </footer>
  )
}
