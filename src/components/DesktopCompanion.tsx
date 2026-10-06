import { Download } from 'lucide-react'
import { CompanionFilm } from './CompanionFilm'
import { SectionHeader } from './ui/Bits'

/** Desktop-companion concept: a separate extension, shown as a concept film. */
export function DesktopCompanion() {
  return (
    <section id="companion" aria-labelledby="companion-title" className="py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-wrap items-center gap-3">
          <span className="chip border border-teal/30 bg-teal-soft text-teal">Desktop companion concept</span>
          <span className="chip bg-ivory-deep text-muted">Separate extension · not one of the eight roadmap tracks</span>
        </div>
        <div className="mt-6">
          <SectionHeader
            id="companion-title"
            eyebrow="A small kindness"
            title="A little support, right when you need it."
            intro="A concept for a gentle desktop companion: Sudha walks onto your screen with a water reminder, and reacts to your answer."
          />
        </div>

        <CompanionFilm />

        <div className="mt-6 grid gap-6 text-sm leading-relaxed text-muted md:grid-cols-[1.4fr_1fr]">
          <p>
            <strong className="font-medium text-navy">How this would really work.</strong> Appearing above other applications on an employee’s computer needs a separately installed desktop app, approved by IT. This website cannot install anything or control your desktop. Reminders would respect quiet hours and could be switched off.
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
