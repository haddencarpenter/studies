# Sascha Handoff — Narrator Script

## Production Notes
- Voice: Jordan (ElevenLabs), model: eleven_v3, speed 1.1x, stability 0.5, similarity 0.6
- EQ: sox treble -2 6000
- Preview with Edge Andrew first. ONE Jordan generation.
- Tone: co-founder catching up a co-founder. Peer update, not a task assignment.

---

## NARRATOR SCRIPT (v2 — peer tone)

[COLD OPEN]
So remember the out-of-sample test that kept failing? Zero out of five... even after we fixed the threshold? Turns out the test was actually telling us something useful. The strategy doesn't work on mid-caps. But... and this is the interesting part... it works on way more coins than we realized.

[WHAT WE FOUND]
We ran every coin in the engine. Sixty-three of them with enough data. Tested three consensus thresholds... whether all three pairs need to agree, or just two, or just one. The assumption going in was that the unanimous requirement was too strict. That it was blocking good signals on smaller coins.

Wrong. Unanimous wins. Nineteen coins pass the quality gate at full consensus. Drop to majority vote... eight. Drop to any single pair... also eight. The strict filter is actually doing its job. It's keeping the noise out.

But here's where it got interesting. Those nineteen were all tested long-only. And alts have been in a downtrend for... what, three years now? A long-only system during a bleed... it either stops trading or it picks the wrong entries. The 2025 out-of-sample killed almost everything. Only Ethereum survived.

So we added shorts. Six coins now survive the 2025 window. KAS, PEPE, FLOKI, GALA, BONK, AAVE. But... shorts break Bitcoin and Ethereum. Sharpe drops from one point two to zero point three. Those are structurally long assets. You can't short them over multi-year windows and expect it to work.

So the real answer is per-coin direction settings. Not a global toggle. That's a bigger research project... but now we know where the edge actually is.

[WHAT WE SHIPPED]
We didn't want to wait on the research to ship something useful. So we built a confidence map. Sixty-three coins... four tiers. Six validated through out-of-sample. Fourteen pass the full-period gate. Twenty-three are positive but not strong enough yet. Twenty... no edge detected.

That's now an endpoint on the backend. When someone asks Shumi about a coin... the confidence tier comes back automatically. Not a guess. An actual backtest result. Sharpe ratio, trade count, which direction works.

Two PRs are up. One on the backend, one on utils. No schema changes, nothing breaking. Pretty clean.

[CLOSING]
The bigger thing we still need to figure out is that per-coin direction problem. And honestly... the engine has enough hidden config interactions now that guessing which combination works is getting unreliable. Probably needs an exhaustive sweep across all the axes at once. But the confidence map is ready to go. Sixty-three coins with honest quality tiers... which is a lot better than five.
