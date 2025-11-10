# 7-Day Price Performance Implementation

## ✅ What Was Implemented

### 1. Backend Enhancement: `/pages/api/search.js`

**Added:**
- OHLC data query for all coins (optimized single query with window functions)
- 7-day percentage change calculation
- BTC delta calculation (coin performance relative to Bitcoin)

**How it works:**
```javascript
// Get last 43 candles (~7 days of 4-hourly data)
// Calculate: ((current - 7daysAgo) / 7daysAgo) * 100

// For BTC Delta:
// btcDelta = coin.change7d - btc.change7d
```

**Performance:**
- Single optimized query for all coins
- Uses PostgreSQL window functions (ROW_NUMBER)
- No N+1 query problem
- Cached for 1 hour (`s-maxage=3600`)

### 2. Frontend Enhancement: `/components/Search.js`

**Added:**
- Display 7d % change with color coding (green=up, red=down)
- Display BTC delta when significant (>0.5% difference)
- Graceful handling when OHLC data unavailable

**Visual Display:**
```
BTC [+5.2%] [+2.1%Δ] [HODL] 10 $106,329 1.7T #1
     ^^^^^^  ^^^^^^
     7d change  vs BTC
```

### 3. Styling: `/styles/search.module.less`

**Added:**
- `.change7d` - Bold, color-coded percentage
- `.btcDelta` - Subtle delta indicator
- `.positive` - Green (#52c41a) with light background
- `.negative` - Red (#ff4d4f) with light background

## 📊 Data Display Logic

### 7-Day Change
- **Always shows** if OHLC data available
- **Green** if positive (+)
- **Red** if negative (-)
- **Format:** `+5.2%` or `-3.1%`

### BTC Delta
- **Only shows** if `|delta| > 0.5%`
- Shows how coin performs relative to BTC
- **Positive delta:** Outperforming BTC (green)
- **Negative delta:** Underperforming BTC (red)
- **Format:** `+2.1%Δ` or `-1.3%Δ`

## 🎯 Examples

### Outperforming BTC:
```
SOL [+12.5%] [+7.3%Δ] [UP] 5
    ^^^^^^   ^^^^^^
    Up 12.5%  7.3% better than BTC
```

### Underperforming BTC:
```
ETH [+3.2%] [-2.0%Δ] [HODL] 8
    ^^^^^^  ^^^^^^
    Up 3.2%  2% worse than BTC
```

### No OHLC Data:
```
NEW_COIN [UP] 1 $0.01 #5000
(No 7d data - graceful omission)
```

## 🔧 Technical Details

### Database Query
```sql
-- Get last 43 candles per coin
SELECT * FROM (
  SELECT 
    "coinId",
    close,
    "closeTime",
    ROW_NUMBER() OVER (PARTITION BY "coinId" ORDER BY "closeTime" DESC) as rn
  FROM "Ohlc"
  WHERE "coinId" IN (...)
    AND "quoteSymbol" = 'usd'
) ranked
WHERE rn <= 43
```

### Why 43 Candles?
- 4-hourly candles = 6 per day
- 7 days × 6 = 42 candles
- +1 for current = 43 total
- Compares current vs 7 days ago

## ⚠️ Edge Cases Handled

1. **Missing OHLC data:** Gracefully omitted (no error)
2. **Insufficient data:** Only shows if ≥43 candles available
3. **BTC unavailable:** Delta not calculated
4. **Small deltas:** Only shows if `|delta| > 0.5%`

## 📈 Performance Considerations

### Query Optimization:
- ✅ Single query for all coins (no N+1)
- ✅ Window functions (efficient)
- ✅ Limited to 43 rows per coin
- ✅ 1-hour cache

### Expected Load:
- ~1000 coins in DB
- ~43,000 rows queried
- Fast with proper indexes
- Cached response for 1 hour

## 🚀 Deployment

**Branch:** `sandbox`  
**Commit:** `b6e181a`  
**Files Changed:**
- `pages/api/search.js` (+68 lines)
- `components/Search.js` (+15 lines)
- `styles/search.module.less` (+38 lines)

**Deployment URL:** `https://coinrotator-git-sandbox-teamxx.vercel.app`

## ✅ Testing Checklist

1. [ ] Search for major coins (BTC, ETH, SOL) - should show 7d change
2. [ ] Search for obscure coins - should gracefully omit if no data
3. [ ] Check BTC delta appears only when significant
4. [ ] Verify color coding (green=up, red=down)
5. [ ] Test performance (search should be <500ms)
6. [ ] Mobile responsiveness

## 🎯 Success Metrics

**What We Added:**
- ✅ Real price performance data (7-day)
- ✅ BTC comparison (delta)
- ✅ Clean visual presentation
- ✅ Optimized performance
- ✅ Graceful handling of missing data

**What We Skipped:**
- ❌ Sparkline charts (complexity vs value)
- ❌ Multiple timeframes (7d is sufficient)
- ❌ Historical trend start price (requires more complex logic)

## 📝 Notes

- **No new API endpoints** - enhanced existing `/api/search`
- **No schema changes** - uses existing `Ohlc` table
- **No new dependencies** - pure calculation
- **Low conflict risk** - single file enhancement
- **Fast implementation** - ~45 minutes total

---

**Implementation Date:** 2025-11-10  
**Status:** ✅ Deployed to Sandbox  
**Next:** Verify deployment and test performance

