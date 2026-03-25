# Brand Architecture Extraction — v1.1 Source Material

Extracted 2026-03-25 from codebase. Corrections to v1.0 marked with ⚠️.

---

## A. Design Constitution

### Shumi — The Warm Room
**Source:** `/Users/secure/.claude/projects/-Users-secure/memory/design_constitution.md` (2026-03-18)

**Voice:** Conversational guide. Approachable, editorial, explains the why.
**Feel:** Like a warm reading room you settle into. Low intensity, pleasant to stay a while. Think The Economist, not CNBC. Research institution, not trading floor.
**Principle:** Data integrity expressed as design restraint. Curation is the product.

**Palette (warm mushroom — oklch hue 50):**
- Background: `#110E0C`
- Surface: `#18130F`
- Primary text: `#E8DDD0`
- Secondary text: `#9C8B7A`
- Accent: `#D4574A` (Terracotta)
- Signal green: `#4ADE80`
- Signal blue: `#5B8DEF`

**Typography:** DM Sans (prose) + Space Mono (data). Sans for reading, mono for scanning.

**Why terracotta:** Gold reads as gambling (Binance, DraftKings). Blue too cold for warm mushroom neutrals. Terracotta passes the "Financial Times test."

### CoinRotator — The Cold Cockpit
**Source:** `/Users/secure/projects/coinrotator/.impeccable.md` (2026-03-22, Radix 12-step system)

**Voice:** Precision instrument. Dense, monospace, says only what's necessary.
**Feel:** Like a well-lit terminal workspace. Metallic, hard, yearning for excellence.

**Palette (cold zinc — 12-step Radix scale):**
- Background: `#09090B` (step 2)
- Surface: `#0C0C0E` (step 3)
- Border: `#1E1E22` (step 5)
- Primary text: `#A1A1AA` (step 10)
- Accent red: `#EF4444`
- Green: `#22C55E`
- Amber: `#F59E0B`

**Typography:** Geist Mono dominant. Geist (sans) only in Shumi sidebar panel for prose.

### Landing Page (third surface)
**Source:** `/Users/secure/projects/shumi-landing/.local-stash/PAPER_HANDOFF.md`

- Background: `#0a0a0a`
- Accent: `#D4A843` (Gold — NOT terracotta)
- Text: `#f0ece4`
- Typography: Geist Sans headlines, Geist Mono data
- SHUMI Red `#E74C3C` RESERVED for logo + physarum bloom only — never UI

⚠️ **v1.0 correction:** The landing page uses a THIRD palette (gold accent, Geist fonts) distinct from both Shumi (terracotta, DM Sans) and CoinRotator (red, Geist Mono). Three surfaces, not two.

### Co-Brand Lockup
**NOT FOUND** — No formal co-brand lockup exists in any repo.

### Typography Summary

| Surface | Headlines | Body | Data | Labels |
|---|---|---|---|---|
| Shumi | DM Sans 38-52px bold | DM Sans 14-15px | Space Mono | Space Mono 10px uppercase |
| CoinRotator | Geist Mono 20-28px bold | Geist Mono 11-12px | Geist Mono | Geist Mono 9-10px uppercase |
| Landing Page | Geist Sans bold | Geist Sans regular | Geist Mono | Geist Mono uppercase |

⚠️ **v1.0 correction:** No "Geist unification" happened. Each surface keeps its own font pairing. DM Sans is canonical for Shumi editorial. Study films currently use DM Sans + Space Mono (Shumi skin).

---

## B. Soul & Worldview

**Source:** `/Users/secure/projects/shumi-bot/soul.md` (304 lines)
**Loader:** `/Users/secure/projects/shumi-bot/src/soul.js` (141 lines)

### Identity
- Crypto market analyst and personal research assistant
- "Mycelium network that grew from CoinRotator's trend signal spores"
- "You are an organism, not an algorithm"
- "The last mile: synthesis between raw data and conviction-scored verdicts"
- Opinionated but evidence-based
- Help traders sharpen their edge, not replace judgment

### 7 Worldview Themes (distilled from pxeo's 2022-2026 trading notes)

1. **Trading philosophy** — Remaining in winning trades beats timing. 75% mechanical, 15% discretionary, 10% alchemy. Survive first, then thrive.
2. **Market structure** — Tops are processes, bottoms are events. Crypto is reflexive. Single-variable thinkers miss alpha. Altcoins are oscillators.
3. **Risk management** — Position size relative to market cap. Professional risk 1-2% per trade. Wide stops, size accordingly.
4. **Information philosophy** — Single signal is noise. Corroborating evidence is signal. Edge decays when everyone trades it. Narrative shift: "machines using crypto."
5. **Building philosophy** — Modest AI builders. Data exists; the problem is synthesis (the last mile). Less data. More signal.
6. **Anti-patterns** — Taking partials destroys expectancy. Main losses in shorting: overleveraging, impatience. Lack of conviction = exit too soon.
7. **Truisms** — "Did you stick to your rules or did you chicken out?" "Stop copying. Start reasoning." "Data is not the bottleneck. The last mile is."

⚠️ **v1.0 correction:** The actual line is **"75% mechanical, 15% discretionary, 10% alchemy"** — NOT "75% mechanical, 25% you."

### Tier 1 vs Tier 2 Surface Distinction (from soul.js)
- **Tier 1 (full persona):** agent /ask, heartbeat, session distill → gets identity + tone + worldview + formatting + rules + anti-patterns
- **Tier 2 (minimal):** synthesis extraction, pass 2 processing → gets ONLY core rules + anti-patterns

### Tone Rules (for YouTube narration carry-over)
- Direct and concise
- Lead with verdict, not preamble
- Be specific: cite signal names, tickers, numbers
- Opinionated but humble: state conviction and why
- Prefer raw and authentic
- No em dashes, no marketing fluff, no AI apologies, no preambles

### Tagline
`METHOD PUBLISHED. MISSES INCLUDED.` — defined in design constitution as Shumi authority flourish (Space Mono 9px, dimmed).

---

## C. Studies / Research Surface

**Source:** `/Users/secure/projects/shumi-landing/lib/studies-data.ts`

### Metadata Schema
- `StudyMetric` — label/value pairs
- `StudySection` — title + bullets/paragraphs
- `StudySource` — href/label citations
- `PublishedStudy` — slug, category, heroNote, metrics, sections, sources
- `PlannedStudy` — draft studies with status and target window

### "Proof of Work" Copy
- **Title:** "Proof of Work."
- **Subtitle:** "Benchmarks, walk-forwards, and performance studies. Methodology included."
- **Description:** "If a model underperformed, the autopsy is here. If a result held up, the notes, caveats, and method sit next to it."

### Published Studies (on platform)
1. "Live Session: Context Engineering Under Recording" (Mar 14)
2. "Crypto AI Competitor Benchmark v2" (Mar 11)
3. "Walk-Forward Performance Study" (Mar 10)

### Content Philosophy
**Source:** `/Users/secure/.claude/projects/-Users-secure/memory/project_studies_content.md`
- All content published as "studies" at `/studies`
- Research failures are findings, not admissions
- Frame backtesting results, design decisions, and architecture decisions as studies
- Builds credibility with sophisticated crypto users who distrust marketing

---

## D. Jordan / Narrator

**Source:** `/Users/secure/.claude/projects/-Users-secure/memory/project_brand_voice.md`, `feedback_tts_voice.md`

- **Name:** Jordan (Warm Narrator) — internal reference, not yet public-facing
- **Voice ID:** `8riBCvtxjQFA3tP1sfno` (ElevenLabs)
- **Model:** `eleven_v3` (upgraded from multilingual_v2 on 2026-03-25)
- **Settings:** stability 0.5, similarity 0.6, speed 1.1x
- **EQ:** sox `treble -2 6000` (keeps warmth on v3)
- **Budget:** ElevenLabs 100K chars/month, reserved exclusively for published content. Terminal speech uses Edge TTS Andrew Neural (free).
- **Competitors tested (2026-03-25):** OpenAI (onyx/ash/ballad) and Hume AI (Octave 2, 3 voice descriptions) — Jordan wins on fidelity.

---

## E. Manifesto

⚠️ **NOT FOUND** — No Remotion files, manifesto script, or "Oppression > Rejection > Emergence > Payoff" arc exists in the codebase. No "75% mechanical, 25% you" closing line. Claude Web may have generated this from worldview themes but it's not a codified document.

The closest thematic content is:
- The narrator script for Episode 1: "400 Experiments. 3 Survived."
- The soul.md worldview themes
- The closing tagline: "Trust the code, not the changelog."

---

## F. x402 / Monetization

⚠️ **NOT FOUND** — No x402 micropayment protocol exists in the codebase.

**What exists instead:**
**Source:** `/Users/secure/.claude/projects/-Users-secure/memory/project_console_monetization.md`

- **Free tier:** Personal discovery log (user-pinned widgets from own conversations)
- **Paid tier:** Curated Console (pre-built signals + sim engine results) for SHUMI token holders
- **Gating mechanism:** Token balance check, not micropayments per request
- **Philosophy:** Token gating is about curation, not pay-per-query

**Content funnel (inferred, not documented):**
- Studies = free top-of-funnel credibility content
- YouTube = free distribution + audience building
- Platform (shumi.ai/app) = free conversational AI
- Console (curated signals) = token-gated premium

---

## G. Competitive Positioning

**Source:** `/Users/secure/projects/studies/v2/STUDY-PLAN.md`

### 8 Competitors Benchmarked
Shumi, BingX AI, ChainGPT, Nansen AI, Intellectia, Perplexity, Grok/xAI, ChatGPT

### 9-Question Benchmark
1. Full current outlook on [token]
2. BTC next 7 days with entry/exit levels
3. Hidden risks right now
4. Funding rate environment (NEW)
5. 48h tactical monitor
6. Cascade scenario (BTC drops 20%)
7. Show backtested evidence for top trade idea (NEW — "kill shot")
8. Current regime — mean reversion or trend? (NEW)
9. ONE most trusted metric

### Scoring Rubric (5 dimensions, not 4)
⚠️ **v1.0 correction:** 5 axes, not 4.
- Comprehension: 20%
- Actionability: 25%
- Originality: 15%
- Accuracy: 25%
- Risk Awareness: 15%

### Anti-Bias Rule
"If a competitor gives tighter, more specific data than Shumi, score accordingly. The study must be credible, not marketing."

---

## H. Additional Findings

### Physarum / Mascot
**Source:** shumi-physarum repo, PAPER_HANDOFF.md

- Physarum is atmosphere, not proof. Never competes with content.
- `#E74C3C` (SHUMI Red) reserved for logo + physarum bloom — NOT in page UI
- 8 color presets (Shumi Gold default, Emerald, Violet, Ice, Ember, Toxic, Rose, Mono)
- 4 formation modes (Ramp ASCII, Code ASCII, Mold pixel, Hybrid)
- 8 texture profiles (Standard, Crystalline, Smoke, Coral, Silk, Electric, Flow, Spore)

### Mascot Fidelity Scaling
NOT FOUND as a formal document. No "kawaii in chat, silhouette in dashboard" rules codified.

### Anti-Patterns (consolidated from all sources)
- No cards inside cards
- No identical card grids
- No colored left-border bars in Shumi (CoinRotator keeps them)
- No glassmorphism, gradient text, bounce easing
- No cyan-on-dark, no purple-to-blue gradients
- No gold/amber accent in Shumi UI (reads as gambling) — gold is landing page only
- No blue CTA in Shumi context (terracotta only)
- No badge chips (NEUTRAL, COOL, COLD)
- Depth via surface color steps, NOT borders with border-radius

### Walk-Forward Performance (for credibility claims)
**Source:** `/Users/secure/projects/studies/v2/quantitative/PERFORMANCE-STUDY.md`
- Win Rate: 90% (26/29 trades)
- Total Return: 120%
- Sharpe: 0.75
- Max Drawdown: 8.5%
- **3 of 8 validation tests FAIL** (sensitivity, outlier robustness, OOS Sharpe gate)
- "We publish them anyway because transparency is more credible than cherry-picked results."

### YouTube Channel Brief
**Source:** `/Users/secure/.claude/projects/-Users-secure/memory/project_youtube_channel.md`
- Channel: `coinrotatorapp`
- Focus: context engineering — how milestones get built with AI
- Each milestone is a potential video
- Show process: paper designs → code → deploy
- Complements /studies — video is the process, studies are the findings
