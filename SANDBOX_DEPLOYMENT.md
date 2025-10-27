# Variational Integration - Sandbox Deployment Guide

## Status
✅ Code pushed to GitHub sandbox branch
⚠️ Database needs to be updated in sandbox environment

## What Was Pushed
- `scripts/add_variational_exchange.mjs` - Database integration script
- `variational_tickers_1761546640165.json` - Full ticker data (492 tickers)
- `variational_tickers_list.txt` - Simple ticker list
- `VARIATIONAL_INTEGRATION_SUMMARY.md` - Documentation

## GitHub Branches
- **Branch**: `coinrotator/sandbox` 
- **Commit**: `6153839` - "Add Variational Omni exchange integration"

## Deployment Steps

### 1. SSH into Sandbox Server
Connect to your sandbox/staging environment

### 2. Pull the Latest Code
```bash
cd /path/to/coinrotator-ai
git fetch coinrotator
git checkout sandbox
git pull origin sandbox
# OR if using the coinrotator remote:
git pull coinrotator sandbox
```

### 3. Run Database Migration
Execute the integration script to add Variational exchange:

```bash
node scripts/add_variational_exchange.mjs
```

This will:
- ✅ Add "Variational" exchange to the Exchange table
- ⚠️ Map tickers to existing coins in database (currently skips unmatched coins)

**Note**: The script currently skips coins that don't exist in the database. You may see warnings like "Coin not found in database: XXX" - this is expected for Variational-specific tokens.

### 4. Verify Database Entry
Check that Variational exchange was added:

```sql
SELECT * FROM "Exchange" WHERE name = 'Variational';
```

Should return:
- id: `variational`
- name: `Variational`
- url: `https://omni.variational.io`

### 5. (Optional) Restart Application
If your deployment requires it:
```bash
pm2 restart all
# or
npm run restart
```

## Frontend Integration

No frontend code changes are required! The UI already supports derivatives exchanges automatically.

### How It Works:
1. The frontend reads `coin.derivatives` array from each coin object
2. These exchange names populate the "Derivative markets" dropdown filter
3. When Variational tickers are mapped to coins, "Variational" will automatically appear in the dropdown
4. Users can filter by "Variational" to see only coins with derivatives on that exchange

### Expected Behavior:
Once database is updated, users can:
- ✅ Filter coins by "Variational" exchange in the derivatives dropdown
- ✅ See which coins have derivatives on Variational
- ✅ View Variational as an available derivatives market option

## Troubleshooting

### No Coins Showing for Variational
- The ticker symbols from Variational are matched case-insensitively with database symbols
- 79.3% (390/492) of Variational tickers are found in the database
- The script uses `LOWER(symbol)` matching to handle case differences
- Check results with: `SELECT id, symbol FROM "Coin" WHERE LOWER(symbol) = LOWER('BTC')`

### "Coin not found" Warnings
- Expected for Variational-specific tokens that don't exist elsewhere
- Only coins that exist in both systems will be mapped
- This is normal and doesn't affect functionality for major coins

### Script Fails with SSL Error
Make sure your sandbox environment has SSL enabled for database connections. The script uses:
```javascript
const dbConfig = {
  ssl: { rejectUnauthorized: false }
};
```

## Next Steps (Optional)

### Automatic Ticker Mapping
If you want to map more tickers automatically, you can:
1. Create a CoinGecko API key
2. Enhance `add_variational_exchange.mjs` to query CoinGecko for coin IDs
3. Map ticker symbols to coin IDs automatically

### Add Custom Tickers
For Variational-specific tokens not in CoinGecko:
1. Manually add them to the Coin table
2. Then run the mapping script again

## Files Reference

**Integration Script:**
- Location: `scripts/add_variational_exchange.mjs`
- Purpose: Add Variational exchange and map tickers

**Data Files:**
- `variational_tickers_1761546640165.json` - Full data with prices/volumes
- `variational_tickers_list.txt` - Simple ticker list (492 symbols)

**Documentation:**
- `VARIATIONAL_INTEGRATION_SUMMARY.md` - Full integration details
- `SANDBOX_DEPLOYMENT.md` - This file

## Verification Checklist

- [ ] Code pulled to sandbox server
- [ ] Database script executed successfully
- [ ] Variational exchange exists in database
- [ ] Frontend shows "Variational" in derivatives dropdown
- [ ] Can filter by Variational exchange
- [ ] Coins appear when filtering by Variational

## Support

If you encounter issues:
1. Check database logs for errors
2. Verify database connection credentials
3. Ensure SSL is properly configured
4. Check that the Exchange table has required columns
