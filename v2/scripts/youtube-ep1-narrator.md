# Episode 1 — "400 Experiments. 3 Survived."

## Production Notes
- Voice: Jordan (ElevenLabs), model: eleven_v3, speed 1.1x, stability 0.5, similarity 0.6
- EQ: sox treble -2 6000
- ONE generation only. Preview with Edge Andrew first.
- Strategy: sell the PROCESS not the PRODUCT. Hold back exact parameters.

---

## NARRATOR SCRIPT (v3 — final polish)

[COLD OPEN]
We found a signal with a seventy-four percent win rate... and it loses money. Another one works... but half the profit comes from a single trade. We ran four hundred experiments. Three survived. And we're not sure about any of them.

[ACT 1 — THE WRECKAGE]
Karpathy calls it auto-research. The idea is simple... humans get attached to their hypotheses. Machines don't. We built it for trading. A system that generates hypotheses, tests them, and kills them... without us in the loop.

It started with a bug. We asked the system to analyze Bitcoin... it came back with a report on a coin called Batcat. That was the easy one.

The real problem was deeper. Four broken layers. The metadata was wrong. The cache was stale. The search matched the wrong coin... And the AI treated Bloomberg as a random blog. Forty-six hours. Every layer rebuilt.

Three API endpoints were serving data from a table that never existed... The endpoints worked. The table didn't. Five months of analysis... built on air. This is why most people skip the testing part. Testing means finding out your foundation doesn't exist.

[ACT 2 — WHAT WE KILLED]
Most of what looked promising... we had to kill.

That seventy-four percent win rate? Funding rates as a trading signal. Forty-three trades over eighteen months... thirty-two winners. That looks like an edge. But the average return per trade was NEGATIVE eight percent. Winning most of your trades... and still going broke. The wins were small. The losses were catastrophic. High win rate means nothing without expectancy.

We tested squeeze persistence across twenty-two assets. At the portfolio level, it looked statistically significant. Then we pulled one coin out of the dataset... and the entire edge disappeared. Two assets were carrying the whole thing. That's not a signal. That's an accident.

A hundred and sixty-five thousand news headlines over six months. We tested whether sentiment predicts crypto prices. It doesn't. But when we asked a different question... not what was said, but who said it... something showed up. When institutional sources and social media disagree, prices move. Thirty-eight events. Statistically significant. But we haven't forward-tested it yet... so we're not trading it. We're watching it.

That's the difference between finding something... and trusting it.

[ACT 3 — WHAT SURVIVED]
Out of four hundred experiments... three strategies made it through walk-forward validation. The specific parameters don't matter... they'll be different next quarter anyway. What matters is the structure that found them. The engine is deterministic. It doesn't guess. It runs every configuration and shows you which ones break.

One exploits a behavioral bias in how traders pick assets after a trend reversal. Everyone chases the leaders. The edge is in doing the opposite. Nearly every parameter configuration held up across five validation folds... and for a moment, we thought we had something clean.

But the 2022 bear market was in the training data. And the real out-of-sample window? Sixteen percent over the final validation period. It survived... but it's not proven.

Another combines two signals that are each worthless alone. Below coin-flip accuracy. But when they agree within a short window... the win rate jumps. That moment... when you see two broken things work together... that's why you do this.

Then our own audit brought us back to earth. Fifty-seven percent of total profit depends on a single trade. One trade. Remove it... and the system looks completely different. We published that audit. It's still a concentration risk we haven't solved.

The third is barely a signal. Five observations on one asset. One fired the day before an all-time high. The other four didn't tell us enough. It's a hypothesis. Not a strategy.

[CLOSING]
Four hundred experiments. Three survivors. One has a concentration problem. One hasn't been forward-tested. One is five data points from being real.

That sentiment divergence... thirty-eight events, statistically significant, untested in real time. We're forward-testing it now. Next episode... we show you whether it held up or joined the kill list.

This is what the process looks like. Not three magic indicators. A system that kills bad ideas faster than you can fall in love with them. We'll be back with the results.
