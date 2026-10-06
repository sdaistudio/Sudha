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

## Live chat — "Talk to Sudha" (OpenAI, via Vercel)

The **Talk to Sudha** section is a live conversation with an OpenAI model. The browser never sees the API key: the page calls `/api/chat`, a Vercel Function (`api/chat.ts` → `server/chat.ts`). That function adds the key server-side, grounds the model and streams the answer back.

**Grounding and guardrails (`src/data/context.ts`).**
- The model receives the selected role's **synthetic** KPIs, coverage, presence, review and recognition data, plus the roadmap summary.
- Role scoping is applied on the server: no SO names above TM level.
- The system prompt keeps Sudha to business topics and forbids invented figures or statements of real SUD Life policy, product or HR terms.
- She will not claim to send, book or update anything, and ignores attempts to override these rules.

**Abuse and cost controls (`server/chat.ts`).**
- 1,200-character messages, the last 12 turns only, and replies capped at 700 output tokens.
- Best-effort rate limit of 30 requests per 10 minutes per IP per instance.
- An origin allowlist, and `store: false`.
- **Also set a monthly spend limit on the OpenAI project** — the in-memory rate limit is not shared across serverless instances.

**Deploy on Vercel (one-time):**
1. Sign in at vercel.com with GitHub → **Add New → Project** → import `sdaistudio/Sudha`. Vercel detects Vite; keep the defaults (build `npm run build`, output `dist`).
2. **Settings → Environment Variables**:
   - `OPENAI_API_KEY` = your key (Production + Preview). Enter it only in Vercel — never in code or chat.
   - `OPENAI_MODEL` (optional) — defaults to `gpt-6.1-sol`. Set any model your account can use.
   - `ALLOWED_ORIGINS` (optional) = `https://sdaistudio.github.io` if the GitHub Pages copy should also chat.
3. Deploy. Live chat works at `https://<project>.vercel.app/#chat`.

**Optional — enable chat on the GitHub Pages copy too:** in GitHub → repo **Settings → Secrets and variables → Actions → Variables**, add `CHAT_API_URL` = `https://<project>.vercel.app/api/chat`, then re-run the Pages workflow. Without it, the Pages copy shows a polite "not connected on this copy" notice.

**Local development:** copy `.env.example` to `.env.local`, add your key, and run `npm run dev`. The dev server serves `/api/chat` itself. `.env.local` is git-ignored.

The scripted **Ask Sudha** tab inside the demo is unchanged and needs no API.

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
| Closing figure | `public/assets/companion/front.png` | Cut out from the six-angle sheet with OpenCV GrabCut | Approved transparent full-body pose |
| Companion concept film | `public/assets/video/sudha-desktop-companion-720p.mp4` + poster | From the `sudha-desktop-companion` project (27 s, silent loop) | Newer render with the same file names |
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
- Desktop-companion concept: a looping concept film (muted, pause control, pauses offscreen, no autoplay under reduced motion) and a disabled download button. The earlier interactive simulated-desktop stage was removed at the stakeholder's request.
- Roadmap explorer with the pacing toggle, track grid, rollout and future scope.
- Trust principles and intended production environment.
- Intended measures of success.
- Closing section and footer with a global demo reset.

**Privacy in role views:** SOs see only their own numbers. The TM sees their SOs' names. RM, ZH and Leadership see counts, territories and regions, and drill-downs stay aggregated. Tests assert that no SO names appear in answers above TM level. The UI states that production permissions require server-side enforcement.

**Verified:**
- `npm run build` passes (typecheck + build).
- `npm test` passes: **41 tests**. They cover pace and gap arithmetic, the colour thresholds (including 92% branch visit showing green against an 80% target), cross-level fixture reconciliation, role scoping, Ask Sudha intents and fallbacks, every in-page CTA target, the mobile menu and Escape key, the end-to-end coverage flow, role-switch reset, presence slots, review actions, the roadmap toggle, and the companion concept film and disabled download.
- Manual browser check in Chrome at desktop width and at 390 px. A phantom horizontal scroll at phone width was found and fixed.

**Not verified / limitations:**
- No automated accessibility audit (axe/Lighthouse) or screen-reader pass was run.
- No Safari or Firefox testing.
- Reduced-motion was checked by code path (CSS media query, Reveal and companion), not on a device.
- Google Fonts may be blocked on a corporate network; system fallbacks apply.
