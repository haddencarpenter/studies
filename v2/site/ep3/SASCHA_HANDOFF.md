# Ep3 production handoff — for Sascha

You are joining mid-production on **Episode 3** of the Shumi study film series. The film is shipped (commit `3eebdec` on `pxeodev/studies` main) but lives on a data freshness treadmill — every published view will go stale within days unless we keep the numbers current. This document briefs you on the workflow.

## Current state (2026-05-11)

- **Film source:** `studies/v2/site/ep3/index.html`
- **Audio script:** `studies/v2/site/ep3/audio/generate_narration.py` (Jordan voice via ElevenLabs `eleven_v3`)
- **Render script:** `studies/v2/site/ep3/record.js` (Playwright at 1920×1080, 180s buffer)
- **Output mp4:** `studies/v2/site/ep3/episode3.mp4` (regenerate after HTML/audio changes via `node record.js` then ffmpeg mux)

**Last data refresh:** 2026-05-09 — rally window stats, BTC chart endpoint, ZEC mark, S07 carry positions, S08 April entries all refreshed against live data through 2026-05-09.

**Pending audio re-render:** voice script has new content for 9 scenes (S02, S04, S05b, S5c, S06, S08, S09, S10, S11) but `narration.mp3` is from 2026-05-08. Needs re-render before next mp4 capture.

## Data freshness map — what goes stale, where

This is the most important section. Every numeric claim in the film traces to one of these sources. Stale data here = wrong numbers in the published film.

| Scene | Element | Source | Refresh trigger |
|---|---|---|---|
| **S03** | BTC chart line + endpoint marker (currently MAY 9 · $80,844) | `simulation-engine/data/ohlcv/btc.json` (last close) | Whenever > 2 days behind today |
| **S03** | Voice "Back to eighty-one" | Same | Same |
| **S04** | Stats hero (26 trades / 65.4% / +5.5% mean) + "17 winners of 26. Sum: +142%." | `simulation-engine/results/rally-window-2026-04-03_2026-05-07/prod-longs-current-trades.json` | Re-run when extending window past current endDate |
| **S04** | Voice + narr | Same | Same |
| **S05b** | ZEC chart endpoint (currently 05-09 · $602.92, −143%) + polyline final point | `simulation-engine/results/rally-window-2026-04-03_2026-05-07/audit-current-trades.json` (ZEC short trade) | Same as S04 (audit script re-run) |
| **S05b** | Voice "Currently six-oh-three. Down one-forty-three percent. Forty-six other shorts in the same state." | Audit JSON open-shorts count + ZEC trade | Same |
| **S5c** | Dual 4×5 grid cells + worst-cell stats | `simulation-engine/results/rally-window-2026-04-03_2026-05-07/h2b/{config1-prod-longs,config2-uniform-both}.json` | Snapshot artifact — refresh only if H2b methodology changes |
| **S06** | Engineering layer terminal (30%/60d/30d/longs-only) | `shumi-bot/src/modules/signals.js` (DEFAULT_CATASTROPHIC_STOP_PCT=30, TIME_STOP_BARS=60, REGIME_REENTRY_COOLDOWN_HOURS=720) | Only if deployed code changes the values |
| **S07** | 6 carry position rows with P&L marks | DB query: `SELECT * FROM regime_positions ORDER BY entry_date` on `SHUMIBOT_DATABASE_URL` | Daily (positions update hourly via :05 cron) |
| **S08** | 2 April entries (AAVE +10.4%, WLD +1.9%) + color classes | Same DB | Same — also flag color flip if WLD/AAVE go negative |
| **S09** | 9-row deployed validation gate suite (6 PASS · 3 FINDING · 0 BLOCKER, dated 2026-04-08) | `simulation-engine/results/validation/validate_all_report.json` | Re-run `npm run validate:standard` to refresh; visible date will update |

## Refresh workflow (the one we just executed for the 2026-05-09 pass)

When you notice numbers going stale (or want to refresh proactively before publishing):

```bash
# 1. Backfill OHLCV through today (Hyperliquid, free, takes ~30s)
cd ~/projects/simulation-engine
node scripts/backfill_all_data.js

# 2. Edit endDate in both rally scripts to today's date
# (rally_prod_longs_current.js + rally_audit_current.js both have `endDate:` constant)

# 3. Re-run rally simulations
node scripts/rally_prod_longs_current.js
node scripts/rally_audit_current.js

# 4. Compute new aggregates from the JSON outputs (use the helper script
#    pattern from this session's commits — closed-in-window n, WR, sum returnPct)

# 5. Query live regime_positions for S07/S08
cd ~/projects/shumi-bot
npx varlock run -- bash -c 'psql "$SHUMIBOT_DATABASE_URL" -c "
  SELECT symbol, direction, entry_date::date, ROUND(unrealized_pnl::numeric, 2) AS pnl_pct
  FROM regime_positions ORDER BY entry_date;
"'

# 6. Update HTML hardcoded values:
#    - S03 polyline endpoint + m3 marker text
#    - S04 stat-num + stat-sub + kicker date
#    - S05b polyline endpoint + zecCurrent text
#    - S07 .pr-pnl values (6 rows)
#    - S08 .led-green / .led-red values (with class flip if sign changed)

# 7. Update generate_narration.py SCENES tuple voice lines that reference
#    specific numbers (S03 BTC price, S04 trade counts, S05b ZEC price)

# 8. Re-run audio (requires ELEVENLABS_API_KEY — pxeo has it)
cd ~/projects/studies/v2/site/ep3/audio
ELEVENLABS_API_KEY='...' python3 generate_narration.py

# 9. Verify in browser
cd ~/projects/studies/v2/site
python3 -m http.server 8901 &
open "http://localhost:8901/ep3/index.html?autoplay"

# 10. Re-record + mux
cd ../v2/site/ep3
node record.js  # produces video/*.webm
ffmpeg -i video/*.webm -i audio/narration.mp3 -map 0:v -map 1:a \
       -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -shortest \
       episode3.mp4
```

## Things to NOT touch without explicit alignment

These are settled and were extensively debated in this session — changing them risks reopening closed decisions:

1. **S04 cannot use `R3 OOS` / `Sharpe 1.86` / `+828%` / `249 trades`.** These are unsourceable per the data-provenance reconciliation bus message (`~/.claude/bus/20260508-193514-ep3-data-provenance-reconciliation.md`). Re-anchored to rally-window numbers from re-runnable sim scripts.
2. **HTF_CONFIG / LTF_CONFIG values redacted from S6 terminal.** The engineering layer (stop / hold / cooldown / longs-only) is the disclosure; the strategy params (bb_mult, htf_long, htf_short, lookback, KAMA, ATR, HMA) stay private.
3. **S9 uses deployed validation suite, NOT audit-suite.** R3 is PENDING in every source except a contested canonical-memory line — audit-suite display would require asserting R3 PASS which contradicts the deployed report.
4. **Pronunciation overrides for Jordan TTS:** ZEC → "Zcash", AAVE → "aahveigh", WLD → "Worldcoin". Keep these in `generate_narration.py` SCENES tuple even when refreshing voice lines for new numbers. Documented in `~/.claude/bus/20260508-003345-ep3-voice-script-final.md` pronunciation guide.
5. **S5b "Forty-six other shorts in the same state" line.** This is the count of LOSING open shorts excluding ZEC. Refresh by querying `audit-current-trades.json` for `type=='short' && exitReason=='end_of_data' && returnPct < 0`, then subtract 1 for ZEC. If count changes substantially, voice line needs the number updated.
6. **Narration strip philosophy:** complementary, not duplicative. Editorial-heavy scenes (S2, S10, S11) carry their message in the centered visual; narr should add a *different* layer (archetype framing, arc callback, actionable URL). Don't echo the editorial in the strip.

## Pending post-ship work (queued bus drafts)

There are 6 canonical-memory promotion drafts staged in `~/.claude/bus/`:

1. `20260508-canonical-memory-draft-1-artifact-persistence.md` — in-session computation must persist to named artifacts before being treated as evidence
2. `20260508-canonical-memory-draft-2-param-drift-detection.md` — sim scripts can drift from deployed code params; verify before citing
3. `20260508-canonical-memory-draft-3-brand-spine-check.md` — search prior sessions for resolved explanations before drafting voice
4. `20260508-canonical-memory-draft-4-render-audit-data-provenance.md` — promote existing memory; render-audit must verify upstream data provenance
5. `20260508-canonical-memory-draft-5-spec-verification-drift.md` — promote existing memory; verification greps must use target file's actual conventions
6. `20260509-scanner-silent-17-days-pre-ep4.md` — regime scanner emitted 0 signals in last 17 days; needs disposition before ep4 publishing time

These are READ-ONLY drafts for now — promote into `pxeodev/docs/canonical-memory.mdx` post-ship in a focused triage pass.

## Ideas you have for the production

You mentioned wanting to contribute ideas so we don't keep using stale data. Concrete ways to plug in:

- **Live data refresh trigger:** can we automate the freshness pipeline? A script that runs the 10-step workflow on a cron, pushes a draft branch with refreshed numbers, opens a PR for review.
- **Staleness gate in CI:** before any push to main can land, a check verifies the displayed numbers in `index.html` match a fresh re-query of the source artifacts. Stale film = blocked merge.
- **Per-scene "freshness as-of" timestamp:** small `data-freshness="2026-05-09"` attribute on each scene, automatically generated by the refresh script, visible to viewers in a hover or footer.
- **Decoupled data layer:** instead of hardcoded numbers in `index.html`, pull from a JSON manifest that gets refreshed independently. Film code stays static; data file is the only thing changing on refresh.
- **Production checklist post-refresh:** a markdown file that lists every numeric claim in the film with its current value + source path, so a reviewer can spot-check 12 lines instead of squinting at the rendered film.

Pick whichever resonates. Or bring your own — I'd rather hear your framing than impose one.

## What I'd want from your first session

A short briefing on:

1. Which of the freshness ideas above (or alternative) you want to prototype first
2. Whether the 10-step refresh workflow above maps to your mental model of how this should work, or you'd structure it differently
3. Any data sources I missed in the freshness map (the live `regime_outcomes` table for closed trades, walkforward signals, dislocation activity — none of these are surfaced in ep3 yet but ep4 will likely need them)
4. Whether ep3's freshness model should also drive ep4's design (e.g., bake in the data layer from day one rather than retrofitting)

## Key file inventory

```
studies/v2/site/ep3/
├── index.html                    # Film source (committed)
├── SCRIPT.md                     # Stale — HTML is source of truth
├── SASCHA_HANDOFF.md             # This file
├── audio/
│   ├── generate_narration.py     # Voice script (untracked locally)
│   ├── narration.mp3             # Latest render (stale, 2026-05-08)
│   └── clips/                    # Per-scene audio clips
├── record.js                     # Playwright recorder (untracked locally)
├── episode3.mp4                  # Final mux (regenerate after audio re-render)
└── video/                        # Playwright output (gitignored)

simulation-engine/
├── scripts/
│   ├── rally_prod_longs_current.js     # Production-config rally sim
│   ├── rally_audit_current.js          # No-stop/both-directions audit sim
│   ├── h2b_engine_a_config1_prod.js    # H2b sweep, deployed protection layer
│   ├── h2b_engine_a_config2_uniform.js # H2b sweep, no protection layer
│   └── backfill_all_data.js            # OHLCV backfill via Hyperliquid
├── results/
│   ├── rally-window-2026-04-03_2026-05-07/   # Rally sim outputs (4 files)
│   │   ├── prod-longs-current-trades.json
│   │   ├── audit-current-trades.json
│   │   ├── h2b/
│   │   ├── rally-comparison-current.md       # Human-readable summary
│   │   └── rally-comparison-historical.md    # Pre-revert evidence
│   └── validation/validate_all_report.json   # S9 gate suite source
└── data/ohlcv/                                # OHLCV per-coin daily

shumi-bot/src/modules/
├── signals.js                    # DEFAULT_CATASTROPHIC_STOP_PCT, TIME_STOP_BARS, REGIME_REENTRY_COOLDOWN_HOURS
└── signals-regime.js             # HTF_CONFIG / LTF_CONFIG / REGIME_ASSETS

pxeodev/docs/
├── canonical-memory.mdx          # Promotion target for the 5 staged drafts
└── research/
    └── live-shipment-verification-2026-05-07.md   # DB query snapshot

~/.claude/bus/
└── 20260508-003345-ep3-voice-script-final.md     # Voice script source of truth
```

## Quick-start: paste this into a fresh Claude Code session

> I'm working on the Shumi study film series, ep3 specifically. Read `~/projects/studies/v2/site/ep3/SASCHA_HANDOFF.md` first for full context on the production state and data freshness workflow. Then read `~/projects/docs/canonical-memory.mdx` for the project-level reliability layer. The film source is `~/projects/studies/v2/site/ep3/index.html` — committed at `3eebdec` on main. Last data refresh was 2026-05-09. I want to [your specific ask here].

Replace the `[your specific ask here]` with what you want to do. Examples:
- "...refresh the numbers against today's live data"
- "...prototype the staleness-gate-in-CI idea"
- "...start scoping ep4"
- "...review the 6 canonical-memory drafts and decide which ship into canonical-memory.mdx first"

Welcome to ep3.
