# Hyperliquid API - Whale Tracking Assessment

**API Base:** `https://api.hyperliquid.xyz/info`
**Rate Limits:** Unknown (needs testing)
**Cost:** Free (public API)

---

## ✅ What's Available

### 1. Market Data (Tested & Working)

**Endpoint:** `POST /info` with `{"type": "metaAndAssetCtxs"}`

**SOL, BONK, GRASS, DOOD - All Available!**

| Coin | Open Interest | 24h Volume | Funding Rate | Price | Max Leverage |
|------|---------------|------------|--------------|-------|--------------|
| SOL | 4.42M tokens | $392M | 0.0000000158 | $135.64 | 20x |
| kBONK | 550M tokens | $9.1M | 0.0000125 | $0.011 | 10x |
| GRASS | 3.01M tokens | $400K | 0.0000125 | $0.33 | 3x |
| DOOD | 75.9M tokens | $79K | 0.0000125 | $0.0057 | 3x |
| BTC | 28.2K tokens | $3.7B | 0.0000125 | $90,480 | 40x |
| ETH | 898K tokens | $1.3B | 0.0000125 | $3,128 | 25x |

### 2. Funding History

**Endpoint:** `POST /info` with `{"type": "fundingHistory", "coin": "SOL", "startTime": <unix_ms>}`

**Sample Response:**
```json
[
  {
    "coin": "SOL",
    "fundingRate": "0.0000125",
    "premium": "-0.0001077362",
    "time": 1736208000104
  }
]
```

**What Funding Tells Us:**
- **Positive funding** = Longs paying shorts = Bullish sentiment
- **Negative funding** = Shorts paying longs = Bearish sentiment
- **High funding** = Crowded trade (potential reversal)

### 3. User Position Data

**Endpoint:** `POST /info` with `{"type": "clearinghouseState", "user": "<address>"}`

**Returns (per user):**
- Open positions (coin, size, entry price, side)
- Margin used
- Unrealized PnL
- Liquidation price

**Limitation:** Requires knowing specific wallet addresses (can't query "all whales")

---

## ⚠️ What's Missing (For Whale Tracking)

### No Leaderboard Endpoint
- Can't get "top 100 traders" automatically
- Can't discover new whales programmatically
- Must maintain manual whale watchlist

### No Aggregated Long/Short Ratio
- Can't see "60% of traders are long SOL"
- Can't see "whales accumulated $50M SOL longs today"
- Only individual user positions (if we know address)

### No Large Position Alerts
- Can't query "all positions >$1M"
- Can't filter "show only 10x+ leverage trades"
- Must track each whale address individually

---

## 🎯 What We CAN Build

### Option 1: Funding Rate Signal

**Hypothesis:** Funding rate divergence predicts trend flips

**Logic:**
1. SOL in HODL trend + low band position
2. Funding rate goes **negative** (shorts paying longs)
3. = Market is bearish BUT price consolidating
4. Contrarian signal: Shorts will get squeezed

**SQL Query:**
```sql
-- Find coins where funding flipped negative during HODL
SELECT
  f.coin,
  t.trend,
  t.band_position,
  f.funding_rate,
  f.premium
FROM hyperliquid_funding f
JOIN shumi_trends t ON t.coin_symbol = f.coin
WHERE
  t.trend = 'HODL'
  AND t.band_position < 0.3
  AND f.funding_rate < -0.0001  -- Negative funding
  AND f.timestamp > NOW() - INTERVAL '24 hours'
ORDER BY f.funding_rate ASC;
```

**Backtest Strategy:**
1. Get funding history for SOL, BONK, GRASS, DOOD for past 30 days
2. Find dates when funding went negative during HODL
3. Check if price pumped 3-7 days later
4. Measure correlation

---

### Option 2: Open Interest Spikes

**Hypothesis:** Rapid OI increase = smart money positioning

**Logic:**
1. SOL OI jumps from 3M → 5M tokens in 24h (+67%)
2. = New positions opened (not just price appreciation)
3. Combined with positive funding = bullish
4. If in HODL + low band = accumulation signal

**Data Collection:**
- Poll `metaAndAssetCtxs` every hour
- Store OI for top 60 coins
- Calculate % change: `(current_oi - 24h_ago_oi) / 24h_ago_oi`
- Alert when >20% increase

**SQL Query:**
```sql
-- Detect OI spikes
WITH oi_changes AS (
  SELECT
    coin,
    open_interest,
    LAG(open_interest) OVER (PARTITION BY coin ORDER BY timestamp) as prev_oi,
    timestamp
  FROM hyperliquid_oi
  WHERE timestamp > NOW() - INTERVAL '48 hours'
)
SELECT
  c.coin,
  t.trend,
  ((c.open_interest - c.prev_oi) / c.prev_oi * 100) as oi_change_pct,
  c.open_interest as current_oi
FROM oi_changes c
JOIN shumi_trends t ON t.coin_symbol = c.coin
WHERE
  t.trend = 'HODL'
  AND t.band_position < 0.3
  AND ((c.open_interest - c.prev_oi) / c.prev_oi) > 0.20  -- 20%+ spike
ORDER BY oi_change_pct DESC;
```

---

### Option 3: Whale Watchlist (Manual)

**If we have known whale addresses:**

**Step 1:** Build Whale Database
```sql
CREATE TABLE hyperliquid_whales (
  address VARCHAR(42) PRIMARY KEY,
  name VARCHAR(255),
  avg_position_size DECIMAL(20, 2),
  win_rate DECIMAL(5, 2),
  discovered_at TIMESTAMP DEFAULT NOW()
);
```

**Step 2:** Poll Each Whale
```bash
# Every 15 minutes
for whale in $(cat whale_addresses.txt); do
  curl -X POST https://api.hyperliquid.xyz/info \
    -d "{\"type\": \"clearinghouseState\", \"user\": \"$whale\"}" \
    > whale_${whale}_$(date +%s).json
  sleep 1
done
```

**Step 3:** Detect Accumulation
```sql
SELECT
  w.name,
  p.coin,
  p.position_size_usd,
  p.entry_price,
  p.side,
  t.trend,
  t.band_position
FROM whale_positions p
JOIN hyperliquid_whales w ON w.address = p.wallet_address
JOIN shumi_trends t ON t.coin_symbol = p.coin
WHERE
  p.side = 'long'
  AND p.position_size_usd > 100000
  AND t.trend = 'HODL'
  AND t.band_position < 0.3
  AND p.opened_at > NOW() - INTERVAL '7 days'
ORDER BY p.position_size_usd DESC;
```

---

## 📊 Comparison: Hyperliquid vs Alternatives

| Data Source | Coverage | Position Data | Cost | Whale Discovery |
|-------------|----------|---------------|------|----------------|
| **Hyperliquid API** | ✅ Solana coins | ⚠️ Individual only | Free | ❌ Manual |
| **Arkham** | ❌ EVM only | ❌ Deposits only | Free | ✅ Auto-labeled |
| **GMX Subgraph** | ❌ EVM only | ✅ Full | Free | ⚠️ Some |
| **Coinglass** | ✅ Multi-exchange | ✅ Aggregated | Paid | ✅ Auto |

---

## 🚀 Recommended Approach

### Phase 1: Funding Rate Signal (1 week)

**Pros:**
- ✅ Easy to implement (no whale discovery needed)
- ✅ Works for all Hyperliquid coins
- ✅ Clear signal (negative funding = short squeeze setup)
- ✅ Can backtest immediately

**Cons:**
- ⚠️ Not directly tracking "whales"
- ⚠️ Market-wide sentiment (not smart money specific)

**Implementation:**
1. Poll funding rate every hour for 60 coins
2. Store in PostgreSQL
3. Alert when funding goes negative + HODL trend
4. Backtest against recent trend flips

**API Calls:** 60 coins × 24 polls/day = 1,440 req/day ✅

---

### Phase 2: Open Interest Tracking (2 weeks)

**Pros:**
- ✅ Detects new position opens (not just sentiment)
- ✅ OI spike = real capital deployment
- ✅ Works without whale addresses

**Cons:**
- ⚠️ Can't distinguish longs vs shorts from OI alone
- ⚠️ Needs baseline to detect "spikes"

**Implementation:**
1. Poll `metaAndAssetCtxs` hourly
2. Calculate 24h OI % change
3. Alert when >20% spike + HODL trend + positive funding
4. Backtest correlation with trend flips

**API Calls:** 1 req/hour × 24 = 24 req/day ✅ (gets all coins in single call)

---

### Phase 3: Whale Watchlist (if Phase 1+2 validate)

**Only if funding + OI signals show promise:**

1. **Discover Whales:**
   - Monitor Hyperliquid Twitter/Discord for mentions
   - Track top accounts on Hyperliquid leaderboard (manual check)
   - Cross-reference with known DeFi whales from Arkham

2. **Track Positions:**
   - Poll 50 whale addresses every 15 min
   - Store position changes
   - Alert when whale opens >$500K position during HODL

**API Calls:** 50 whales × 96 polls/day = 4,800 req/day ⚠️ (need rate limit test)

---

## 🧪 Immediate Next Steps

### 1. Backtest Funding Rate Signal (4 hours)

```bash
# Get 30 days of SOL funding history
curl -X POST https://api.hyperliquid.xyz/info \
  -d '{"type": "fundingHistory", "coin": "SOL", "startTime": 1733616000000}' \
  > sol_funding_30d.json

# Analysis:
# - Find dates when funding went negative
# - Check SOL price 7 days later
# - Calculate if negative funding = buy signal
```

### 2. Test Rate Limits (30 min)

```bash
# Burst test
for i in {1..100}; do
  curl -s -X POST https://api.hyperliquid.xyz/info \
    -d '{"type": "allMids"}' > /dev/null
  echo "Request $i: $(date +%s)"
done

# Sustained test
# 1 request per second for 5 minutes
# Check if any 429 errors
```

### 3. Get Historical OI Data (2 hours)

**Problem:** API doesn't provide historical OI (only current)

**Solution:** Start collecting NOW for future backtests
- Store OI snapshots every hour
- After 7 days, can backtest OI spike correlation
- After 30 days, have baseline for "normal" OI ranges

---

## 💡 Key Insight

**Hyperliquid gives us Solana coin data that Arkham can't!**

But we trade whale-specific signals for market-wide signals:
- ❌ Can't see "Jump Trading opened $10M SOL long"
- ✅ CAN see "SOL funding went negative" (shorts are crowded)
- ✅ CAN see "SOL OI spiked 50%" (new positions opened)

**This might be better:**
- Market sentiment (funding) is harder to fake than individual addresses
- OI spikes show REAL capital, not just transfers
- No need to maintain whale watchlist
- Works for all coins, not just ones with labeled whales

---

## 📝 API Endpoints Summary

| Endpoint | Purpose | Rate Limit | Cost |
|----------|---------|------------|------|
| `metaAndAssetCtxs` | OI, volume, funding | Unknown | Free |
| `fundingHistory` | Historical funding rates | Unknown | Free |
| `allMids` | Current prices | Unknown | Free |
| `clearinghouseState` | User positions | Unknown | Free |
| `userFills` | User trade history | Unknown | Free |

**Documentation:** https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api

**Python SDK:** https://github.com/hyperliquid-dex/hyperliquid-python-sdk

---

## 🎯 Decision Point

**Should we proceed with Hyperliquid?**

**✅ YES if:**
- Funding rate backtest shows >60% correlation with trend flips
- We accept market-wide signals instead of whale-specific
- Solana coin coverage is critical (SOL, BONK, GRASS)

**❌ NO if:**
- We specifically need individual whale tracking
- EVM-only coverage is acceptable (use GMX Subgraph instead)
- We want labeled entities like Arkham provides

**Next command:** Run funding rate backtest for SOL/BONK/GRASS/DOOD to validate signal quality.
