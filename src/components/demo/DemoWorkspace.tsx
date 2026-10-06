import { BarChart3, BookOpen, MapPin, MessageCircle, RotateCcw, UsersRound, Building2 } from 'lucide-react'
import type { DemoTab } from '../../data/ask'
import { ROLES, roleById } from '../../data/fixtures'
import { DEMO_DATE_LABEL } from '../../data/kpi'
import type { RoleId } from '../../data/types'
import { useDemo } from '../DemoContext'
import { DemoBadge, SectionHeader } from '../ui/Bits'
import { TabPanel, Tabs } from '../ui/Tabs'
import { AskPanel } from './AskPanel'
import { AssistantPanel } from './AssistantPanel'
import { CoveragePanel } from './CoveragePanel'
import { DigestPanel } from './DigestPanel'
import { PresencePanel } from './PresencePanel'
import { ReviewPanel } from './ReviewPanel'

const TABS: { id: DemoTab; label: string; icon: typeof MapPin }[] = [
  { id: 'coverage', label: 'Branch coverage', icon: Building2 },
  { id: 'presence', label: 'Field presence', icon: MapPin },
  { id: 'digest', label: 'KPI digest', icon: BarChart3 },
  { id: 'ask', label: 'Ask Sudha', icon: MessageCircle },
  { id: 'review', label: 'Review companion', icon: UsersRound },
  { id: 'assistant', label: 'Employee assistant', icon: BookOpen },
]

export function DemoWorkspace() {
  const { role, setRole, tab, setTab, sessionKey, resetAll, announce, setAnnounce } = useDemo()
  const profile = roleById(role)

  const changeRole = (r: RoleId) => {
    setRole(r)
    setAnnounce(`Viewing as ${roleById(r).label}. Conversation reset and panels filtered to ${roleById(r).spanName}.`)
  }

  return (
    <section id="demo" aria-labelledby="demo-title" className="py-24 sm:py-32">
      <div className="container-x">
        <SectionHeader
          id="demo-title"
          eyebrow="Try Sudha"
          title={
            <>
              See your day the way <span className="italic">Sudha</span> would.
            </>
          }
          intro="Choose a role, then explore each scenario. Everything here runs in your browser on synthetic data — nothing is sent, booked or submitted."
        />

        <div id="demo-workspace" tabIndex={-1} className="mt-12 overflow-hidden rounded-[1.75rem] border border-line bg-paper shadow-[0_40px_80px_-50px_rgba(15,27,61,0.45)] focus:outline-none">
          {/* Workspace header */}
          <div className="border-b border-line bg-ivory/60 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <DemoBadge />
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="tabular">Demo date · {DEMO_DATE_LABEL}</span>
                <button type="button" onClick={resetAll} className="btn btn-ghost btn-sm">
                  <RotateCcw size={14} aria-hidden /> Reset demo
                </button>
              </div>
            </div>
            <fieldset className="mt-5">
              <legend className="text-sm font-medium text-navy">View as</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <label key={r.id} className={`btn btn-sm cursor-pointer select-none ${role === r.id ? 'bg-navy text-ivory' : 'border border-line text-navy hover:border-navy'} has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-indigo has-[:focus-visible]:outline-offset-2`}>
                    <input type="radio" name="demo-role" value={r.id} checked={role === r.id} onChange={() => changeRole(r.id)} className="sr-only" />
                    {r.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="mt-3 text-sm text-ink">
              <span className="font-medium">{profile.spanName}</span>
              <span className="text-muted"> · {profile.spanSummary}</span>
            </p>
          </div>

          {/* Scenario tabs */}
          <div className="border-b border-line px-4 pt-4 sm:px-6">
            <Tabs
              idBase="demo"
              label="Demo scenarios"
              items={TABS.map((t) => ({
                id: t.id,
                label: (
                  <span className="flex items-center gap-2">
                    <t.icon size={15} aria-hidden /> {t.label}
                  </span>
                ),
              }))}
              value={tab}
              onChange={setTab}
              className="-mb-px !flex-nowrap overflow-x-auto !gap-0 [scrollbar-width:none]"
              tabClassName={(a) =>
                `shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors sm:px-4 ${a ? 'border-indigo font-medium text-navy' : 'border-transparent text-muted hover:text-navy'}`
              }
            />
          </div>

          {/* All panels stay mounted (hidden when inactive) so simulated changes survive tab switches. */}
          {TABS.map((t) => (
            <TabPanel key={`${t.id}-${sessionKey}`} idBase="demo" id={t.id} hidden={tab !== t.id} className="p-4 sm:p-6 lg:p-8">
              {t.id === 'coverage' && <CoveragePanel />}
              {t.id === 'presence' && <PresencePanel />}
              {t.id === 'digest' && <DigestPanel />}
              {t.id === 'ask' && <AskPanel active={tab === 'ask'} />}
              {t.id === 'review' && <ReviewPanel />}
              {t.id === 'assistant' && <AssistantPanel />}
            </TabPanel>
          ))}

          <div className="border-t border-line bg-ivory/60 px-4 py-4 text-xs leading-relaxed text-muted sm:px-6">
            <strong className="font-medium text-navy">About role views.</strong> SOs see their own numbers; direct managers see their SOs’ names; higher levels see counts and territories, and drill-downs stay aggregated. This selector only demonstrates those rules — in production, permissions must be enforced server-side before any data is fetched.
          </div>
        </div>
        <p className="sr-only" aria-live="polite" role="status">
          {announce}
        </p>
      </div>
    </section>
  )
}
