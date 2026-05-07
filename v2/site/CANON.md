# Study-film visual canon

This is the source of truth for the Shumi study-film visual system.
Films inherit from this document, not from the previous film's
stylesheet. If a rule below conflicts with what's in `ep1/`, `ep2/`,
or `ep3/`, this document wins and the film is wrong.

The executable form of this canon is
`~/projects/studies/scripts/film-palette-scan.sh`. The script's
`CANON_COLORS` and `CANON_FONTS` constants must stay in sync with
the tables below.

Last edited: 2026-05-06.

---

## Palette

| Token | Hex | Use | Where it may appear |
|---|---|---|---|
| terracotta | `#D4574A` | primary editorial accent | titles, kickers, key stat highlight |
| failure red | `#EF4444` | failure / fail-state semantic | gate cells, fail dots, fail-panel wash |
| warning gold | `#D4A843` | warning / open-issue semantic | warn dots, in-progress states |
| success green | `#4ADE80` | success / pass-state semantic | pass dots, survival cards |
| axis gray | `#999999` | axes, captions, metadata | chart axes, kicker labels, timestamps |
| text on dark | `#E0E0E0` | body text | narration overlays, panel titles |
| surface | `#0A0A0A` | page background | film canvas |
| logo red | `#E74C3C` | bloom + wordmark only | end card, mascot, never UI |

**Hard rule on red:** logo red and failure red *never share a frame*.
Logo red is allowed only on the end card and physarum bloom. Every
other red in the system is failure red.

**Surface ladder (allowed by exception):** the films use a neutral
gray ladder for surface stepping. Collapse to three steps — anything
finer is invisible at YouTube compression:

- `#0A0A0A` page background
- `#141414` panel
- `#1E1E22` nested element

### Quoted UI (allowed by exception)

When the films reproduce real third-party UI as a citation (a
terminal window, a chart from a paper, a screenshot of an external
tool), the foreign palette is allowed *inside the quoted region* and
flagged as quoted-UI rather than drift. Current quoted-UI tokens:

- `#FF5F57` `#FEBC2E` `#28C840` — macOS traffic-light dots in
  terminal-window title bars.

The quoted region must be visually contained (a window chrome, a
captioned figure) so the foreign palette doesn't leak into the
canonical surface.

---

## Typography

- **DM Sans** — editorial text, headers, narration overlays, panel
  titles, body copy.
- **Geist Mono** — all monospaced use: data, terminals, axes, kickers,
  code, labels, timestamps, ticker text.

Nothing else. No Space Mono. No system mono fallbacks. No JetBrains.

---

## Depth

- Surface steps only — different background tones to indicate hierarchy.
- **No** elevation shadows on content (`box-shadow` for "this card sits
  above that card" is forbidden).
- **No** borders on content panels for depth (`1px solid #222` to lift
  a panel is forbidden — use a surface step instead).
- **Glow is allowed** as semantic emphasis on small marks (signal
  dots, gate cells), not on panels. A glow says "this dot is alive,"
  not "this card is elevated." Cap at `0 0 12px` and keep opacity ≤ 0.3.
- **Background gradients on the surface itself** are allowed at low
  opacity. A radial wash that tints a panel is surface variation, not
  depth-against-content. Keep opacity ≤ 0.15.
- Edge-feathering via `mask-image: radial-gradient` is not a depth
  signal and is unrestricted.

**Net rule:** depth means surface steps only. Surface tints are
surface variation, not depth. Glows on small marks are semantic, not
depth. Shadows or borders that lift a panel relative to the page are
forbidden.

---

## Motion

- Linear or ease-out only. No springs, no bounces, no parallax.
- Reveal durations 150–450ms. Transitions for opacity / transform / glow.
- **Character-stepped (typewriter) reveals are allowed, with constraints.**
  They are valid only as terminal output: Geist Mono on dark surface,
  terracotta cursor, no UI chrome. Use them where the visual asserts
  "this is a process emitting text" — verdict panels, sensitivity
  terminals, trade ledger streams. Step cadence 30–80ms per character;
  full-line cursor blink at 600ms.
- **Character-stepping is not a general reveal idiom.** Do not type
  out narration overlays, panel titles, or quoted text in DM Sans.
  Quoted text (tweets, paper excerpts, external copy) uses full-quote
  fade-in only — character-stepping there imports a foreign register.
- Glow-in transitions for state changes (gate cells turning green/red,
  signal dots flashing) follow the depth rule's glow cap: `0 0 12px`,
  opacity ≤ 0.3.

---

## Scene-type vocabulary (canonical)

These are the load-bearing scene types. New scene types may be added
only after explicit canon update.

- Title cards
- Equity curves with stat-block overlay
- **Dot grid** — confidence ballot, 10-column grid of binary state
  squares. This is the canonical confidence visual. There is no
  histogram; runs are counted, not bucketed.
- Sensitivity terminal — Geist Mono terminal aesthetic, character-stepped
  output allowed.
- Gate strip — 21-cell, 7×3, structural bookend.
- Survival board — 3-up cards.
- Verdict panel — terminal aesthetic, character-stepped output allowed.
- End card — physarum bloom + mascot + wordmark. Only place logo red
  appears.
- Tweet render — Geist Mono quote on canonical surface, terracotta
  attribution glyph, full fade-in. No avatar circles, no Twitter blue,
  no UI chrome, no character-stepping.
- Trade ledger — Geist Mono terminal. Monochrome rows. Terracotta
  only on summary statistics.
- Live portfolio snapshot — static cross-section labeled with absolute
  date ("Position state, [date]"). No pulsing dots, no refresh ticks,
  no liveness affordances.

There is no parameter heatmap. Sensitivity arguments use the
sensitivity terminal. Continuous-color encodings are not in the
system.

---

## Open scene types to add (not yet built)

These are sanctioned for future films but not yet in the canon:

- Drawdown stress visual — equity curve with downward shaded region,
  terracotta marking longest underwater stretch, Geist Mono day count.
- Cost-erosion wedge — gross and net equity curves with the gap shaded
  gold, labeled fees / slippage / funding.
- Benchmark overlay — strategy in terracotta, BTC buy-and-hold in axis
  gray as reference line, never as competitor.
- Regime strip — thin band beneath equity curve showing risk-on /
  risk-off / chop in three muted tones.

---

## Pre-publish gate

Before a new film ships:

1. Run `scripts/film-palette-scan.sh report` against the film source.
2. DRIFT count must be zero.
3. QUOTED-UI hits must each be visually contained inside a citation
   region.
4. Every scene type must be on the canonical list above, or this
   document must be updated first with an explicit canon edit.
