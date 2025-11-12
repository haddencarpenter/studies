# OHLC Timeframe Analysis

## 📊 What Data Is Available

### From `scripts/daily.js`:

**Line 153:**
```javascript
await getOhlc(coinId, quoteSymbol, '4h', fetchOhlcDays * 6)
```

**Translation:**
- **Candle Interval:** 4 hours
- **Number of Candles:** 30 days × 6 (candles per day) = **180 candles**
- **Historical Coverage:** ~30 days

---

## ⏱️ Possible Timeframes

### ✅ SUPPORTED (with existing data):

| Timeframe | Candles Back | Calculation | Example |
|-----------|--------------|-------------|---------|
| **4 hours** | 1 | Current vs 1 candle back | ✅ Most recent change |
| **8 hours** | 2 | Current vs 2 candles back | ✅ Possible |
| **12 hours** | 3 | Current vs 3 candles back | ✅ Possible |
| **24 hours** | 6 | Current vs 6 candles back | ✅ **YES - Easy!** |
| **7 days** | 42 | Current vs 42 candles back | ✅ **YES - Implemented!** |
| **14 days** | 84 | Current vs 84 candles back | ✅ Possible |
| **30 days** | 180 | Current vs 180 candles back | ✅ Possible |

---

## ❌ NOT SUPPORTED:

| Timeframe | Why Not? |
|-----------|----------|
| **1 hour** | Would need 1-hour candles (we have 4-hour) |
| **2 hours** | Would need 2-hour candles (we have 4-hour) |
| **3 hours** | Would need 3-hour candles (we have 4-hour) |
| **Real-time** | OHLC candles close every 4 hours |

**Minimum Granularity:** 4 hours (the candle interval)

---

## 🎯 Recommended Timeframes for UI

### Option 1: **24-Hour Change** (Most Common)
**Pros:**
- ✅ Industry standard (every exchange shows this)
- ✅ Users expect it
- ✅ Easy to calculate (current vs 6 candles back)
- ✅ Accurate with 4-hour candles
- ✅ Fast to compute

**Example:**
```javascript
// Get 24h change
const candles = await getLastNCandles(coinId, 7) // Need 7 to ensure 24h coverage
const current = candles[0].close
const twentyFourHoursAgo = candles[6].close
const change24h = ((current - twentyFourHoursAgo) / twentyFourHoursAgo) * 100
```

**Display:**
```
Bitcoin  BTC  [+2.3%↑24h]  [DOWN] 5  $106,329  1.7T  #1
              ^^^^^^^^ 24-hour change (standard)
```

---

### Option 2: **7-Day Change** (More Context)
**Pros:**
- ✅ Shows bigger trends
- ✅ Less noisy than 24h
- ✅ Good for swing traders
- ✅ Already implemented!

**Cons:**
- ⚠️ Less familiar to day traders
- ⚠️ Slower-moving metric

**Display:**
```
Bitcoin  BTC  [+8.5%↑7d]  [+0.3%Δ]  [HODL] 10  $106,329  1.7T  #1
              ^^^^^^^   ^^^^^^
              7-day     vs BTC
```

---

### Option 3: **Both 24h AND 7d** (Maximum Info)
**Pros:**
- ✅ Best of both worlds
- ✅ Day traders see 24h
- ✅ Swing traders see 7d
- ✅ Shows both short and long-term movement

**Cons:**
- ⚠️ More visual clutter
- ⚠️ Might be too much data

**Display:**
```
Bitcoin  BTC  [+2.3%↑24h]  [+8.5%↑7d]  [HODL] 10  $106,329  1.7T  #1
              ^^^^^^^^^   ^^^^^^^^
              short-term  long-term
```

---

## 📊 Accuracy Analysis

### 24-Hour with 4-Hour Candles:

**Scenario:**
- Current time: 10:00 AM
- Current candle close: 8:00 AM (2 hours ago)
- 24h ago candle close: 8:00 AM yesterday

**Accuracy:** ✅ **±2 hours** (acceptable for most use cases)

**Example:**
```
Real 24h change: +2.35%
Our calculation: +2.40%
Error: 0.05% (negligible)
```

---

### 7-Day with 4-Hour Candles:

**Scenario:**
- 7 days = 168 hours
- 42 candles × 4 hours = 168 hours

**Accuracy:** ✅ **Exact** (no approximation needed)

---

## 🔥 Real-World Comparison

### What Major Exchanges Show:

| Exchange | Default | Options |
|----------|---------|---------|
| Binance | 24h | 1h, 24h, 7d, 30d |
| Coinbase | 24h | 1h, 24h, 7d, 30d, 1y |
| Kraken | 24h | 24h, 7d, 30d |
| Bybit | 24h | 24h, 7d |

**Industry Standard:** 24h is primary, 7d is secondary

---

## 💡 My Recommendation

### **Implement 24-Hour Change** as default:

**Why:**
1. ✅ Industry standard
2. ✅ Users expect it
3. ✅ Easy to implement (6 candles back)
4. ✅ Good accuracy with 4-hour candles
5. ✅ Most actionable for traders

**Code Example:**
```javascript
// In /api/coin-ohlc.js
const oneDayAgo = new Date()
oneDayAgo.setDate(oneDayAgo.getDate() - 1)

const ohlcData = await sql`
  SELECT "coinId", close, "closeTime"
  FROM "Ohlc"
  WHERE "coinId" IN ${sql(coinIds)}
    AND "quoteSymbol" = 'usd'
    AND "closeTime" >= ${oneDayAgo}
  ORDER BY "coinId", "closeTime" DESC
`

// Calculate 24h change
const current = coinOhlc[0].close
const oldest = coinOhlc[coinOhlc.length - 1].close
const daysDiff = (currentDate - oldestDate) / (1000 * 60 * 60 * 24)

if (daysDiff >= 0.9 && daysDiff <= 1.1) {  // Allow ±10% tolerance
  coin.change24h = ((current - oldest) / oldest) * 100
}
```

---

## 🎯 Quick Summary

| Timeframe | Supported? | Accuracy | Recommendation |
|-----------|-----------|----------|----------------|
| **1 hour** | ❌ No | N/A | Not possible with 4h candles |
| **4 hours** | ✅ Yes | Perfect | Possible but too granular |
| **24 hours** | ✅ Yes | ±2 hours | **⭐ BEST CHOICE** |
| **7 days** | ✅ Yes | Perfect | Good secondary metric |
| **30 days** | ✅ Yes | Perfect | Good for macro view |

---

## 🚀 Implementation Priority

### Phase 1: 24-Hour Change (Quick Win)
- Most expected by users
- Easy to implement
- Industry standard

### Phase 2: Add 7-Day (Optional)
- Provides more context
- Good for identifying trends
- Can show alongside 24h

### Phase 3: User Preference (Future)
- Let users choose timeframe
- Toggle between 24h / 7d / 30d
- Save preference in localStorage

---

**Bottom Line:** With 4-hour OHLC candles, the **smallest meaningful timeframe is 24 hours**, and that's what most users expect anyway!

