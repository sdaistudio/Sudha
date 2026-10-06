/**
 * Editorial content and configuration. Business content is traced to the
 * "Sudha Business Companion Roadmap v2" deck (Sep 2026) and the companion BRD.
 * Anything not in those sources is labelled illustrative in the UI.
 */
import type { DemoTab } from '../data/ask'

export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export const NAV = [
  { id: 'meet', label: 'Meet Sudha' },
  { id: 'capabilities', label: 'What I Do' },
  { id: 'demo', label: 'Try Sudha' },
  { id: 'chat', label: 'Talk to Sudha' },
  { id: 'workday', label: 'Your Workday' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'trust', label: 'Trust' },
] as const

export const HERO = {
  eyebrow: 'SUD Life · Your AI business companion',
  heading: ['Meet Sudha.', 'A smarter start to every workday.'],
  copy: 'Timely insights. Clear answers. Thoughtful assistance—bringing your business and everyday work into one companion.',
  core: 'Sudha helps you see what needs attention, understand your business, and act with confidence.',
}

export interface Horizon {
  id: 'notify' | 'converse' | 'assist'
  label: string
  months: string
  summary: string
  example: { title: string; lines: string[] }
  sudha: string
}

export const HORIZONS: Horizon[] = [
  {
    id: 'notify',
    label: 'Notify',
    months: 'Planned months 1–2',
    summary: 'Sudha brings branch coverage, field presence, and business updates to your attention.',
    example: {
      title: '09:00 · Branch coverage',
      lines: ['6 of 23 mapped branches have no SO visit this week.', 'Longest gap: BOI Riverside Main · 9 days', 'Show SO-wise · Mark reason · Preview nudge'],
    },
    sudha: 'Good morning, Kavya. Here is what needs attention before your day begins.',
  },
  {
    id: 'converse',
    label: 'Converse',
    months: 'Planned months 3–4',
    summary: 'Ask questions in plain language and explore the detail behind an alert.',
    example: {
      title: 'You asked · How are we doing against pace?',
      lines: ['56.7% achievement against 64.5% month pace.', '₹0.09 Cr behind pace with 11 days to go.', 'Conversion 8.4% is the largest gap to target.'],
    },
    sudha: 'Ask me “why?” or “show SO-wise” on any card and I will take you one level deeper.',
  },
  {
    id: 'assist',
    label: 'Assist',
    months: 'Planned months 5–6',
    summary: 'Prepare for reviews, follow up on actions, find HR and product answers, and keep learning.',
    example: {
      title: 'Tomorrow · Weekly review pack',
      lines: ['Strengths, gaps and open commitments — ready 24 h before.', '2 actions from last week: 1 moving, 1 open.', 'Your learning module is due Friday.'],
    },
    sudha: 'Your review pack is ready. Shall I start with last week’s commitments?',
  },
]

export interface Capability {
  n: number
  title: string
  cadence: string
  summary: string
  audience: string
  data: string
  benefit: string
  example: string[]
  demoTab?: DemoTab
  enabling?: boolean
}

export const CAPABILITIES: Capability[] = [
  {
    n: 1,
    title: 'Branch Coverage Alert',
    cadence: '09:00 daily',
    summary: 'Unvisited mapped branches, sorted by days since last visit. Direct managers see detail; higher levels see summaries.',
    audience: 'Territory Managers with SO names; Regional, Zonal and national leaders as roll-up counts.',
    data: 'Branch check-ins already logged in the activity system, mapped SO → branch → TM → RM → ZM.',
    benefit: 'The action lands with the right manager before the day starts.',
    example: ['6 of 23 branches unvisited this week', 'BOI Riverside Main · 9 days · Rohan Mehta', 'UBI Lakeview · 7 days · Meera Iyer'],
    demoTab: 'coverage',
  },
  {
    n: 2,
    title: 'Field Presence Pulse',
    cadence: '10:00 · 11:00 · 12:00',
    summary: 'Snapshots of mapped, logged-in and checked-in SOs, accounting for approved leave.',
    audience: 'Territory Managers; a 12:00 roll-up for levels above.',
    data: 'Intraday activity-system logins and branch check-ins; leave and holiday data.',
    benefit: 'Managers can step in during the day rather than the next morning.',
    example: ['18 mapped · 15 logged in · 12 checked in', '9 leads logged so far today', '1 SO on approved leave — excluded'],
    demoTab: 'presence',
  },
  {
    n: 3,
    title: 'Business KPI Digest',
    cadence: 'Daily 09:00 · weekly Monday',
    summary: 'Achievement, activity, conversion, staffing and recognition for your span.',
    audience: 'Every level, from SO (own numbers) to leadership.',
    data: 'Governed KPI data: budget and EPI_S MIS, collection, leads, branch visits, SP coverage, SO mapping.',
    benefit: 'The same metric set and colour key, refreshed nightly, for everyone’s own span.',
    example: ['Achievement vs month pace', 'Gap to pace in ₹ Cr', 'Top performers alongside gaps'],
    demoTab: 'digest',
  },
  {
    n: 4,
    title: 'Ask Sudha',
    cadence: 'On demand · envisioned in Teams',
    summary: 'Plain-language questions and one-tap drill-downs on governed business data.',
    audience: 'All field roles and leadership.',
    data: 'Governed, read-only KPI data with role-based access.',
    benefit: 'Questions get answered without waiting on an MIS request.',
    example: ['“Which branches need attention?”', '“How are we doing against pace?”', '“Show SO-wise”'],
    demoTab: 'ask',
  },
  {
    n: 5,
    title: 'Intelligent Alerts',
    cadence: 'Exception-based · role-specific',
    summary: 'Prioritised pending requirements, activity drops and campaign deadlines; later persistency risk and anomalies.',
    audience: 'SOs and TMs, with escalation to RMs.',
    data: 'Proposal status, activity history, campaign calendar, renewal due list.',
    benefit: 'Fewer, better alerts — prioritised rather than broadcast.',
    example: ['2 proposals with pending documents', 'Activity below your 4-week baseline', 'Campaign closes Friday'],
    demoTab: 'ask',
  },
  {
    n: 6,
    title: 'Team & Review Companion',
    cadence: 'Weekly review + on demand',
    summary: 'Review packs, meeting drill-down, commitments, follow-up and recognition.',
    audience: 'Area, Regional and Zonal heads and their TMs.',
    data: 'All of the above, plus review calendar, action log and learning completion.',
    benefit: 'Reviews move from “what are the numbers?” to “what do we do about them?”',
    example: ['Pre-read 24 h before', 'Live drill-down in the room', 'Actions captured and followed up'],
    demoTab: 'review',
  },
  {
    n: 7,
    title: 'Everyday Employee Assistant',
    cadence: 'On demand · every employee',
    summary: 'HR policy, leave, employee claims and FBP FAQs, learning, product Q&A, objection handling and a unified morning brief.',
    audience: 'Every employee — planned reach of about 6,000.',
    data: 'Policy repository, HRMS, LMS, product repository and calendar.',
    benefit: 'One place for everyday questions, alongside the business view.',
    example: ['“How many leave days can I carry forward?”', '“Which module is due this week?”', '“How do I answer a premium-affordability concern?”'],
    demoTab: 'assistant',
  },
  {
    n: 8,
    title: 'Foundation & Adoption',
    cadence: 'Continuous · enabling layer',
    summary: 'Governed KPI data, hierarchy mapping, role-based access, freshness, audit trails, adoption and expansion.',
    audience: 'Not an employee-facing skill — the layer every track depends on.',
    data: 'Source-system access, identity, the corporate Azure / Copilot Studio estate.',
    benefit: 'Every answer is span-scoped, fresh and auditable.',
    example: ['Hierarchy & branch mapping', 'Role-based access before any query', 'Data freshness and adoption dashboard'],
    enabling: true,
  },
]

export interface Moment {
  id: string
  time: string
  title: string
  detail: string
  message: string
  refresh: string
}

export const WORKDAY: Moment[] = [
  {
    id: 'm0900',
    time: '09:00',
    title: 'Branch coverage and business brief',
    detail: 'The day starts with what needs attention and where you stand against pace.',
    message: 'Good morning, Kavya. 6 of your 23 branches have no visit this week, and the territory is ₹0.09 Cr behind pace. Rohan has the longest gap — worth a call before 10:00.',
    refresh: 'Nightly KPI refresh · branch-visit log to end of previous day',
  },
  {
    id: 'm1000',
    time: '10:00 · 11:00 · 12:00',
    title: 'Field presence pulse',
    detail: 'Three snapshots, same shape every day — readable in five seconds.',
    message: 'Midday pulse: 15 of 18 SOs logged in, 12 checked in at a branch, 9 leads so far. Arjun and Farhan have no activity yet; Kiran is on approved leave.',
    refresh: 'Intraday activity snapshot · no older than 30 minutes at send time (planned)',
  },
  {
    id: 'mdemand',
    time: 'On demand',
    title: 'Questions, product guidance and learning',
    detail: 'Ask in plain language, whenever you need it.',
    message: 'You asked how to explain a long-term savings plan simply. Here is a sample structure you can adapt — check it against the approved product material before using it.',
    refresh: 'Answers drawn from governed data and approved content repositories',
  },
  {
    id: 'mmonday',
    time: 'Weekly · Monday',
    title: 'KPI summary and recognition',
    detail: 'The weekly scorecard for your span, with recognition given equal space.',
    message: 'Your week in one card: branch active up to 52%, SO active up 5.5 pts. Recognition: Meera converted 14% of her leads — the best in the territory.',
    refresh: 'Weekly summary built from the nightly KPI refresh',
  },
  {
    id: 'mreview',
    time: 'Before · during · after reviews',
    title: 'Preparation, diagnosis and follow-up',
    detail: 'The numbers are already in the room, and commitments do not get lost.',
    message: 'Your review pack is ready: strengths, gaps and two open commitments from last week. In the room, ask me to drill from territory to SO; afterwards I will follow up each action.',
    refresh: 'Review pack prepared 24 h before from the nightly refresh',
  },
]

export interface RoadmapMonth {
  key: string
  month: string
  release: string
  ships: string
  built: string
  inBuild?: string
  decision: string
}

/** Option A — 6 months, two pods. Month-by-month slide of the roadmap deck. */
export const ROADMAP_A: RoadmapMonth[] = [
  { key: 'sep', month: 'Sep 2026', release: 'R1 · Branch Coverage Alert', ships: '09:00 branch-coverage card to TMs in the pilot zone; roll-up counts to RM / ZM.', built: 'SO–branch–hierarchy mapping, nightly activity feed, Teams bot, role-based access (Track 8).', inBuild: 'Field Presence Pulse', decision: 'Pilot zones, and sign-off on the “names only at TM level” rule.' },
  { key: 'oct', month: 'Oct 2026', release: 'R2 · Field Presence Pulse', ships: '10:00 / 11:00 / 12:00 pulse to TMs; R1 to all zones with “mark reason” and “nudge SO”.', built: 'Intraday refresh, leave and holiday awareness, trend vs yesterday.', inBuild: 'KPI Digest (data mart for proposals, issuance, APE)', decision: 'KPI definitions and targets frozen with Sales MIS.' },
  { key: 'nov', month: 'Nov 2026', release: 'R3 · Business KPI Digest', ships: 'The Activity Dashboard metric set at every level; daily card, weekly summary, top performers.', built: 'Governed KPI mart, hierarchy roll-ups, recognition logic.', inBuild: 'Ask Sudha v1 (fixed intents + drill-down buttons)', decision: 'Which MIS emails Sudha replaces.' },
  { key: 'dec', month: 'Dec 2026', release: 'R4 · Ask Sudha', ships: 'Plain-language questions on any KPI for my span; drill-down from every card.', built: 'Text-to-query with guardrails, accuracy test set, audit log.', inBuild: 'Intelligent Alerts v1; Team Companion', decision: 'Alert catalogue and escalation rules.' },
  { key: 'jan', month: 'Jan 2027', release: 'R5 · Intelligent Alerts + Review Companion', ships: 'Pending-requirement and activity-drop alerts; weekly review pack and live review mode for area / regional heads.', built: 'Baseline models per SO, recognition suggestions.', inBuild: 'Everyday Assistant (policy, HRMS, LMS, product repository)', decision: 'HR content owners and answer approval process.' },
  { key: 'feb', month: 'Feb 2027', release: 'R6 · Everyday Employee Assistant', ships: 'HR and leave answers, learning nudges, product Q&A, unified morning brief — to every employee.', built: 'Adoption dashboard, BAU handover to BSG, guardrail review.', inBuild: 'Months 7–8 backlog', decision: 'Expansion to Agency / Broker / RRB and first department sub-agent.' },
]

/** Option B — 8 months, one pod. Same order, one track in build at a time. */
export const ROADMAP_B: { key: string; month: string; release: string }[] = [
  { key: 'sep', month: 'Sep 2026', release: 'M1 · Branch Coverage' },
  { key: 'oct', month: 'Oct 2026', release: 'M2 · Field Pulse' },
  { key: 'nov', month: 'Nov 2026', release: 'M3 · KPI Digest' },
  { key: 'dec', month: 'Dec 2026', release: 'M4 · Ask Sudha' },
  { key: 'jan', month: 'Jan 2027', release: 'M5 · Intelligent Alerts' },
  { key: 'feb', month: 'Feb 2027', release: 'M6 · Team & Review Companion' },
  { key: 'mar', month: 'Mar 2027', release: 'M7 · Everyday Employee Assistant' },
  { key: 'apr', month: 'Apr 2027', release: 'M8 · Foundation hardening + channel expansion' },
]

export const PACING = {
  a: {
    label: '6 months · two pods',
    lines: [
      'Two tracks in build at any time; one release a month.',
      'Pod 1 (field signals): Tracks 1, 2, 5, 6. Pod 2 (knowledge & conversation): Tracks 3, 4, 7. Track 8 shared.',
      'All eight tracks planned live by Feb 2027; every-employee reach (Track 7) in month 6.',
      'Best when leadership wants visible momentum and the 15-day daily-notification proof of concept has landed.',
    ],
  },
  b: {
    label: '8 months · one pod',
    lines: [
      'One track in build at a time; still one release a month, in the same order.',
      'One pod of four: product owner, AI / low-code builder, data engineer, BSG lead — plus IT and content owners on call.',
      'All eight tracks planned live by Apr 2027; every-employee reach arrives in month 7 instead of month 6.',
      'Best when source-system data access is still being negotiated, or one team also carries other Sudha agents.',
    ],
  },
}

/** Track × month grid for Option A (slide "The 6-month plan"). */
export const TRACK_GRID: { track: string; cells: ('' | 'build' | 'release' | 'enhance')[] }[] = [
  { track: '1 Branch Coverage Alert', cells: ['release', 'enhance', 'enhance', '', '', ''] },
  { track: '2 Field Presence Pulse', cells: ['build', 'release', 'enhance', 'enhance', '', ''] },
  { track: '3 Business KPI Digest', cells: ['', 'build', 'release', 'enhance', 'enhance', ''] },
  { track: '4 Ask Sudha', cells: ['', '', 'build', 'release', 'enhance', 'enhance'] },
  { track: '5 Intelligent Alerts', cells: ['', '', '', 'build', 'release', 'enhance'] },
  { track: '6 Team & Review Companion', cells: ['', '', '', '', 'release', 'enhance'] },
  { track: '7 Everyday Employee Assistant', cells: ['', '', '', '', 'build', 'release'] },
  { track: '8 Foundation & Adoption', cells: ['release', 'enhance', 'enhance', 'enhance', 'enhance', 'release'] },
]

export const FUTURE_SCOPE = [
  'Agency, Broker and RRB hierarchies',
  'Sales role-play coach with scored feedback',
  'Department assistants (e.g. finance reconciliation MIS)',
  'WhatsApp and voice delivery for SOs without Teams on mobile',
  'Copilot work assistance — emails, decks, summaries',
]

export const TRUST_PRINCIPLES = [
  { title: 'Answers within your authorised span', body: 'Every request is resolved to your place in the hierarchy before any data is fetched. Sudha never shows a number outside your span.' },
  { title: 'Names go to the direct manager', body: 'A Territory Manager sees their SOs’ names. Every level above sees counts and territories. No one sees a peer’s exception list.' },
  { title: 'Existing logged data only', body: 'No new forms, portals or reports. If a metric would need new data entry, it waits.' },
  { title: 'Employee context and reasons', body: 'One-tap reasons — leave, training, branch closed, bank holiday — keep the data fair and let the SO be heard.' },
  { title: 'Quiet hours and notification caps', body: 'No pushes outside working hours, and a daily cap. Anything beyond the cap becomes an on-demand answer, not an alert.' },
  { title: 'Recognition alongside exceptions', body: 'Top performers ship in the same release, with the same prominence, as the gaps.' },
  { title: 'Governed definitions and freshness', body: 'One metric definition and colour key, owned by the business, with a visible refresh time on every card.' },
  { title: 'Audited business answers', body: 'Every question, query and answer on business data is logged for audit and accuracy review.' },
]

export const SCORECARD = [
  { area: 'Branch coverage', measure: '% of mapped branches visited in the week; count unvisited for more than 7 days' },
  { area: 'Field activity', measure: '% of SOs with a branch check-in by 12:00; leads per active SO' },
  { area: 'Alert-to-action rate', measure: '% of coverage alerts acted on within 24 hours — nudge, call or reason' },
  { area: 'Weekly adoption', measure: '% of target users opening Sudha weekly; Ask Sudha questions per user' },
  { area: 'Review action closure', measure: 'Actions captured in reviews and closed by the next review' },
  { area: 'MIS emails retired', measure: 'MIS emails and manual trackers replaced by Sudha cards' },
  { area: 'HR ticket deflection', measure: 'Everyday HR questions answered without a ticket' },
  { area: 'Proposals & issuance per SO', measure: 'Against the pre-Sudha baseline, in the same zones' },
]

export const ASSISTANT_QA: { category: 'Policy' | 'Learning' | 'Product'; q: string; a: string[] }[] = [
  {
    category: 'Policy',
    q: 'How many leave days can I carry forward?',
    a: ['Answer structure: the rule, your current balance, and the policy section it comes from.', 'Example: “Under the leave policy (section X.Y), up to N days may be carried forward. Your balance is shown from HRMS.”', 'In production this answer would cite the approved SUD Life policy document. This demo does not state any real policy.'],
  },
  {
    category: 'Policy',
    q: 'How do I submit an FBP claim?',
    a: ['Answer structure: eligibility, steps, documents, and the deadline — each linked to its source.', 'This is about employee flexible-benefit claims, not insurance claims.', 'Steps and limits shown in production would come from the approved HR repository.'],
  },
  {
    category: 'Learning',
    q: 'Which learning module is due this week?',
    a: ['Example: “Product refresher — Module 3 is due on Friday 21 Aug. It takes about 20 minutes.”', 'In production this would come from the LMS, with a link to start the module.'],
  },
  {
    category: 'Product',
    q: 'How do I respond when a customer says the premium feels high?',
    a: ['Answer structure: acknowledge the concern, ask about goals and budget, then explain options using approved product material.', 'Sudha would draw only on the approved product repository and would not invent benefits, returns or promises.', 'Always check wording against the current approved sales material.'],
  },
]
