---
description: WiseCompare daily review: profit, stop-loss, negatives, GCLID upload (dry runs first)
argument-hint: path to today's BeMob conversions CSV (e.g. automation/data/bemob-2026-11-21.csv)
---
You are helping me run my affiliate campaigns safely. My BeMob export is: $ARGUMENTS

Work in the `automation/` folder. Steps:
1. `python -m ops csvcheck $ARGUMENTS`. If columns are NOT FOUND, stop and tell me what to fix in config.yaml.
2. `python -m ops profit --bemob-csv $ARGUMENTS --days 7`. Summarise per offer in plain words: making or losing money?
3. `python -m ops stoploss --bemob-csv $ARGUMENTS` (dry run). List what it would pause.
4. `python -m ops negatives` (dry run). Show the junk terms and the "review yourself" list.
5. `python -m ops upload --bemob-csv $ARGUMENTS` (validate only).
6. Apply the Step 6 rules from my plan to each offer (5-7 days in, 2-3x payout spent with 0 leads = kill; rejection >30-40% = kill; accepted cost < payout = keep and scale +20-30% max).

Then give me ONE short decision list. Ask me before running anything with `--apply`.
Never suggest raising a budget by more than 30%, and never raise one yourself.
