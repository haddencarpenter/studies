# PAIR TRADING ARCHETYPE: Testing Protocol

## 1. Quick Validation Workflow (The "Happy Path")
Run this checklist for every signal candidate returned by the API.

- [ ] **Signal Age**: Is it fresh? (Prefer < 10 days; > 30 days is stale/exhausted).
- [ ] **Tier Check**: Is the backtest tier `STRONG` or `MODERATE`? (If `UNVALIDATED`, treat with caution).
- [ ] **Ratio Logic**:
    - If `LONG_RATIO`: Has the Base coin been underperforming recently? (Room to catch up?)
    - If `SHORT_RATIO`: Has the Quote coin been underperforming?
- [ ] **Liquidity/Exchange**: Are both assets available on primary exchanges (Binance/Bybit)?
- [ ] **Event Risk**: Any immediate unlocks/airdrops for either coin?

## 2. Edge Case Validations
Check these specific failure modes:

- [ ] **Null Trends**: Does the API handle missing OHLC data gracefully (e.g., `ratioTrend: null`)?
- [ ] **Category Mismatch**: Are we seeing weird pairs like "DeFi vs Meme"? (Should prefer "DeFi vs DeFi").
- [ ] **Stale Data**: Are we filtering out signals where `last_updated` is > 24h ago?

## 3. Dev MVP Sanity Tests (2026-02-09)

### Input Validation — PASS
| Input | Response | Status |
|:---|:---|:---|
| `limit=0` | 400 "must be >= 1" | Clean |
| `limit=-1` | 400 "must be >= 1" | Clean |
| `limit=999` | 400 "must be <= 50" | Clean |
| `limit=abc` | 400 "must be integer" | Clean |
| No params | Default (10 results) | Clean |

### Exchange Filter — PASS
- `exchange=Hyperliquid` returns valid pairs with both sides confirmed on HL
- `exchange=FakeExchange` returns 0 results (no crash)

### Category Filter — FIXED
- **Bug found:** Exact match meant `"DeFi"` failed to match `"Decentralized Finance (DeFi)"`. Same for `"AI"`, `"Privacy"`, etc.
- **Fix applied:** Changed to case-insensitive substring matching in `pairTradingAdapter.js:473-479`
- 30/50 common categories worked before fix, all high-priority ones work after fix

### Response Contract — PASS
All 10 suggestions validated: every required field present, correct types, no unexpected nulls.

### Performance
| Request | Time | Verdict |
|:---|:---|:---|
| limit=10 | ~2.7s | Borderline OK for MVP |
| limit=50 | ~20s | Too slow — cap or cache later |
| exchange filter | ~1.6s | Good (reduces coin universe) |

## 4. Session Test Log

| Date | Pair | Tier | Age | Verdict | Notes |
|:---|:---|:---|:---|:---|:---|
| 2026-02-09 | Long INJ / Short NEAR | MODERATE | 0d | Pass (with caveats) | Sharpe 0.477, winRate 33%. Both on Binance/Bybit/HL. L1/PoS match. Spread only 1.17%. |

## 5. Open Questions / Bugs
- [ ] All top-5 by score were UNVALIDATED — 62-coin backtest set misses most mid/small caps. Only 1 MODERATE found in top 50.
- [ ] Top signals dominated by stale signalAge (24-34d). Deprioritize exhausted signals?
- [ ] MELANIA/PIPPIN scored 79 purely on 54% spread — meme-vs-meme with 34d stale signal. Spread-heavy weighting (70%) may over-rank noise.
- [ ] No STRONG tier pairs in top 50. Market conditions or data gap?
- [ ] `limit=50` takes ~20s. Needs caching or pre-computation (snapshot branch) for production.
- [ ] Daily snapshot persistence (`feat/pair-trading-snapshots`) not merged — no signal history tracking yet.

## 6. Go-Live Readiness

| Area | Status | Blocker? |
|:---|:---|:---|
| Error handling | PASS | No |
| Response schema | PASS | No |
| Exchange filter | PASS | No |
| Category filter | FIXED (pending deploy) | Was blocker, now resolved |
| Perf (limit=10) | ~3s | Acceptable for MVP |
| Perf (limit=50) | ~20s | Not a blocker if default limit=10 |
| Daily snapshots | Not deployed | Not MVP blocker, but needed soon |
| Backtest coverage | 62 tokens only | Awareness item, not blocker |
