# Balance notes

How to measure, what the numbers were last time, and what's still open. All numbers are "reached Vegas" (won the run)
for the simulation bot, 480 runs per cell unless noted (about +-4 points). See the README for how to run it.

```
node simulate-runs.js --runs 480 --workers 4 --skill regular --tier gold --out gold.json
node simulate-runs.js --compare before.json after.json
```

## Skill levels (no gear)

|         | Copper | Silver | Gold |
|---------|-------:|-------:|-----:|
| novice  |    39% |    33% |  17% |
| regular |    59% |    54% |  39% |
| expert  |    78% |    71% |  58% |

With a full random loadout on Gold: regular 64%, expert 76%.

## Characters (regular bot, Copper, 100 runs each)

All twelve land between 57% and 69%. The spread was 44-82% before abilities were taught to the bot and Greg, Harold
and Benny were retuned. Re-check this table after any change to stats, abilities or gear.

## What the bot taught us

- **Starting Grit is worth about 30 points.** One Grit is the difference between 42% and 73% for the same character,
  and it swamps every other stat. That's why Endurance only adds Grit at 10, and why Benny's drawback is "dealers hold
  an extra card" instead of a lost Grit.
- **Abilities are worth +20 points.** The same bot goes 42% to 62% when it uses abilities, so any ability change shows
  up much more strongly than a stat change. Greg's Bear Hug alone put him at 82% until his Endurance came down.
- **Perks barely move table win rates.** The best perk adds about 2.5 points a table and nothing is outside +-2.5.
  The power curve comes almost entirely from Grit, abilities and boss rules, not perks.
- **Boss rules (measured twice, stable):** No Kings is brutal (-9.6 points), Iron House (-3.9), No Backing Out (-2.7)
  and No Jacks (-2.6) hurt. Six rules meant as handicaps actually help the player: Short Deal (+4.1), Royal Court
  (+3.7), Crooked Crown (+3.3), No Queens (+2.9), Drought (+2.3), Heavy Hitter (+1.3).
- **Silver is barely harder than Copper** for strong players (78% to 71%), and Gold is only 58% for an expert, 76%
  with a full wardrobe.

## Open questions

- Rework the six rules that help the player, and soften No Kings.
- Make perks matter more (the best is +2.5 points a table).
- Give Silver and Gold more teeth, or add a harder tier.
- The Water Chip run isn't simulated yet.
