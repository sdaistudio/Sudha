# Sudha Business Companion — interactive product site

An editorial, interactive website introducing **Sudha**, SUD Life's proposed AI business companion. It is a product showcase with a working, role-based demonstration on **synthetic data**. It is not a production employee portal: no backend, no AI API, no corporate data, nothing is sent, booked or submitted.

## Commands

```bash
npm install          # first time
npm run dev          # local dev server (http://localhost:5173)
npm test             # unit + interaction tests (Vitest, Testing Library, jsdom)
npm run build        # typecheck + production build → dist/
npm run preview      # serve the production build locally
```

Hosting is configurable: `dist/` is a static site. To host under a sub-path, build with `SUDHA_BASE=/your/path/ npm run build`.

### GitHub Pages

`.github/workflows/deploy.yml` tests, builds and deploys to GitHub Pages on every push to `main`. Live URL: **https://sdaistudio.github.io/Sudha/**. Pages must be set to **Settings → Pages → Source: GitHub Actions**.

> **iCloud note.** This folder lives in iCloud Drive. Dependencies are installed into `node_modules.nosync` (with a `node_modules` symlink) so iCloud does not sync them. The Vite watcher and Tailwind scanner both ignore that folder and `dist/`. If `npm install` replaces the symlink with a real folder, run: `rm -rf node_modules.nosync && mv node_modules node_modules.nosync && ln -s node_modules.nosync node_modules`.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · lucide-react. Motion is CSS transitions plus small hooks; GSAP and Lenis were not needed, and native scrolling is preserved. Fonts are Fraunces and Inter from Google Fonts, with system fallbacks.

## Structure

```
src/
  content/site.ts        Editorial copy & configuration (nav, horizons, capabilities, workday, roadmap, trust, scorecard, assistant samples)
  data/types.ts          Typed data model
  data/fixtures.ts       SYNTHETIC data for each role (fictional names, branches, zones, numbers)
  data/kpi.ts            Metric definitions, targets, colour key, pace / gap-to-pace maths, fixed demo date
  data/scope.ts          Role scoping (privacy rules) and presence summaries
  data/ask.ts            Deterministic "Ask Sudha" intent matching and answers
  components/            Page sections (Hero, Meet, Horizons, Capabilities, Workday, DesktopCompanion, Roadmap, Trust, Closing)
  components/demo/       Demo workspace and the six scenario panels
  components/ui/         Tabs, Reveal, badges, Sudha message bubble
tests/                   kpi.test.ts, ask.test.ts, app.test.tsx
public/assets/           sudha/ (portrait, avatar) · companion/ (cut-out poses) · video/ (intro clip + poster)
```

## Sources and assumptions

- **Business source:** `Sudha_Business_Companion_Roadmap_v2 (1).pptx`, the authoritative source, plus `BRD_Sudha_Business_Companion (1).docx` for metric definitions, the 7-day threshold, quiet hours and the T1–T8 requirements.
- **Design inspiration:** the original portfolio PDF was **not supplied**, so the design follows the master prompt's written direction.
- **Desktop-companion reference:** `WhatsApp Video …mp4` (behaviour only).
- **Intro clip:** `Woman_introducing_AI_business_co…mp4` plays directly below the hero. It autoplays with sound when scrolled into view (at the stakeholder's request); browsers that block unmuted autoplay fall back to muted playback with an Unmute button.
- **Demo date** is fixed at **Thu 20 Aug 2026** to mirror the deck's 20-Aug Activity Dashboard cut. Month pace = 20 ÷ 31 = 64.5%, with 11 days remaining. The viewer's clock is never used for business maths.
- **"This week"** in branch coverage means since Mon 17 Aug. The illustrative list shows gaps of 9/7/6/5/5/4 days, as in the deck. The BRD's production default threshold is N = 7, and it is configurable.
- **Gap-to-pace colour** shares the achievement-vs-pace status, because it is the same comparison in ₹ Cr. Monetary metrics without targets stay neutral.
- The deck labels "11 metrics" but also lists gap to pace. All 12 named measures are shown, and the site does not quote a count.
- **Branch and person names are fictional.** The deck's example names and real place names were replaced.
- Synthetic fixtures **reconcile across levels**: territory → region → zone → all-India branch-visit %, and the presence roll-ups. Tests check this.
- **Option B (8 months)** month details: the deck gives month-by-month ships/built/decision only for Option A. Option B shows the release order and says so plainly.

## Assets and replacement contract

| Asset | Path | Status | Replace with |
|---|---|---|---|
| Hero portrait | `public/assets/sudha/sudha-portrait-upper.webp` (+ `.jpg`) | Upper-body crop of the supplied portrait, **original studio backdrop kept**. A cut-out left a grey halo in the hair. | Approved transparent or backdrop portrait, ≥1600 px tall, same framing |
| Chat avatar | `public/assets/sudha/sudha-avatar.webp` | 160 px face crop of the portrait | Approved square avatar |
| Companion poses | `public/assets/companion/{front,leftprofile,rightprofile,back,left34,right34,happy}.png` | Cut out from the six-angle sheet with OpenCV GrabCut. Small, so edges are acceptable; `happy.png` (from the hero portrait) has a faint halo. | Transparent walk-cycle frames and expression sprites (happy, gentle/disappointed, idle). Keep names, or update `POSES` in `DesktopCompanion.tsx`. |
| Intro video | `public/assets/video/sudha-intro.mp4` + poster | Supplied clip (10 s, carries a generator watermark) | Approved final clip with captions |

**Turntable:** an earlier stepped six-angle "turntable" section was **removed at the stakeholder's request**. The six-angle sheet cannot support true 360° rotation. If a dense, coherent frame sequence or a 3D model becomes available, a scroll-scrubbed section can be reinstated.

## Implementation report

**Built:**
- Sticky navigation that blends into the hero, plus an accessible mobile dialog menu.
- Editorial hero.
- Meet Sudha intro video, user-started and muted.
- Three horizons.
- Eight capability rows, with Foundation marked as an enabling layer.
- The role-based demo workspace: five roles and six scenarios:
  - **Coverage:** Mark reason, SO-wise view, editable nudge preview with a simulated send, Ask Sudha.
  - **Field presence:** 10:00 / 11:00 / 12:00 snapshots with trend, leave exclusion and an accurate check-in label.
  - **KPI digest:** daily and weekly views, all named measures, formulas, attainment colours and recognition alongside gaps.
  - **Ask Sudha:** deterministic answers with definition, scope, timestamp, drill-downs and honest limitations.
  - **Review companion:** Before / During / After, with drill-down and action capture with status.
  - **Employee assistant:** labelled sample content.
- Workday timeline with the refresh model.
- Desktop-companion concept: enter, ask, Yes / Not yet / Later, accelerated snooze, quiet timeout, pause, sound toggle (off by default), reset and a disabled download button.
- Roadmap explorer with the pacing toggle, track grid, rollout and future scope.
- Trust principles and intended production environment.
- Intended measures of success.
- Closing section and footer with a global demo reset.

**Privacy in role views:** SOs see only their own numbers. The TM sees their SOs' names. RM, ZH and Leadership see counts, territories and regions, and drill-downs stay aggregated. Tests assert that no SO names appear in answers above TM level. The UI states that production permissions require server-side enforcement.

**Verified:**
- `npm run build` passes (typecheck + build).
- `npm test` passes: **34 tests**. They cover pace and gap arithmetic, the colour thresholds (including 92% branch visit showing green against an 80% target), cross-level fixture reconciliation, role scoping, Ask Sudha intents and fallbacks, every in-page CTA target, the mobile menu and Escape key, the end-to-end coverage flow, role-switch reset, presence slots, review actions, the roadmap toggle, and the companion timeout, snooze, pause and reset.
- Manual browser check in Chrome at desktop width and at 390 px. A phantom horizontal scroll at phone width was found and fixed.

**Not verified / limitations:**
- No automated accessibility audit (axe/Lighthouse) or screen-reader pass was run.
- No Safari or Firefox testing.
- Reduced-motion was checked by code path (CSS media query, Reveal and companion), not on a device.
- In the browser checks, Chrome throttled timers because the window was in the background, so companion timing was verified by tests rather than by eye.
- Google Fonts may be blocked on a corporate network; system fallbacks apply.
