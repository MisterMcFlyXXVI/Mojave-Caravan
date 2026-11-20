# Balance notes

How to measure, what the numbers were last time, and what's still open. "Reached Vegas" is the run win rate for the
simulation bot, 480 runs per cell unless noted (about +-4 points). See the README for how to run it.

```
node simulate-runs.js --runs 480 --workers 4 --skill regular --tier gold --out gold.json
node simulate-runs.js --compare before.json after.json
node perk-power.js                       # perks, in isolation
```

## Skill levels and difficulty (no gear)

|         | Copper | Gold |
|---------|-------:|-----:|
| novice  |    41% |  17% |
| regular |    62% |  34% |
| expert  |    74% |  47% |

With a full random loadout on Gold: regular 61%, expert 75%. (Silver sits between Copper and Gold.)

## Characters (regular bot, Copper, 100 runs each)

All twelve land between 50% and 70% (Vladmira, Snip Snip and Three Dog about 70%, Harold lowest at 50%, Greg 54%).
Re-check this table after any change to stats, abilities or gear.

## Do perks matter?

Perk dependence = Vegas rate with perk shopping minus the same bot taking no perks at all (`--skill noperk`).
It was +9 on Copper and +15 on Gold before the perk rework, and is **+25 on Copper and +17 on Gold** now (Gold
is much harder overall: 33% with perks, 16% without).

`perk-power.js` isolates a perk: the dealer AI plays itself on identical decks and one side gets the perk (800+
hands, about +-3 points). Power by rarity is meant to climb, and now roughly does:

| rarity | perks (edge over a plain opponent, points) |
|---|---|
| common | Bloodhound +3, Ironclad +5, Heist +5, Trickster +6, Royal Blood +6 |
| uncommon | Showcase +6, Card Shark +10, Honest Work +10, Collector +12, Two-Tone +12, High Roller +13 |
| rare | Wide Margin +7 to +10, Kingpin +9, Momentum +10, Hazmat +11, Royal Courier +12, Jackrabbit +13, Steady Hands +13, Glass Cannon +6 |
| legendary | Lead Lined +14 (Guardian Angel isn't a per-hand perk) |

What changed: "draw a card when you play X" perks measured as *negative* (an extra draw just dilutes your deck), so
Jackrabbit, Royal Courier, Steady Hands and Scrapper (now Trickster) became "playing that card doesn't use your turn".
The economy perks (Bloodhound, Honest Work, Heist, Ironclad, Showcase, Collector, High Roller, Bounty Hunter) did
nothing, because caps are never scarce, so they became real power. Not simulated (they don't change a single hand):
Guardian Angel, Prospector, Scavenger, Bounty Hunter, Cool Head.

## Boss rules

Measured per table played under each rule (2,000 runs, stable across repeats). Before the rework, six rules meant as
handicaps helped the player. Now:

- Hostile: Iron House -7.7, Home Kings -3.6 (was No Kings, -9.6, which banned Kings for both sides), Loaded Deck -2.3
  (new: the dealer's deck has extra Jacks, Kings and a Joker), No Jacks -1.2, Light Pockets -0.9, No Backing Out -0.8.
- Neutral (within noise): Crooked Crown, Drought (now also bans disbanding), Tight, Greedy House (now +2), No Jokers,
  Stacked House, High Floor, Long Haul, Heavy Hitter (now +4 cards).
- Sandstorm reads as helpful only because the bot ignores hidden totals; it isn't measurable this way.
- Retired (still defined for old saves, no longer dealt): Royal Court and Short Deal (helped the player), No Queens
  (the bot plays Queens badly, so banning them helped it), Quick Draw and Pickpocket (inert against this AI).

Late-game escalation makes Boss tables harder in ways shown on the pre-hand screen: from stop 3 the dealer holds an
extra card, from stop 4 sells a point higher, from stop 5 triples its Kings, from stop 6 holds another card and opens
with 2 extra. Late bosses are also savvier with their Kings.

## What the bot taught us

- **Starting Grit is worth about 30 points.** One Grit is the difference between 42% and 73% for the same character,
  and it swamps every other stat. That's why Endurance only adds Grit at 10, and why Benny's drawback is "dealers
  hold an extra card" instead of a lost Grit.
- **Abilities are worth +20 points.** The same bot goes 42% to 62% when it uses abilities.
- **Giving the dealer AI extra cards makes it play worse, not better** (Heavy Hitter, Quick Draw). Hostile rules
  should restrict the player or change the deck, not just add cards.
- **A per-table number hides perk power.** Most tables are easy and win rates saturate near 90%, so a perk that
  clearly helps shows as +1 or +2. Use `perk-power.js` for power and the no-perk comparison for dependence.

## Open questions

- Several uncommon perks (Two-Tone, High Roller, Collector, Showcase) sit at +12 and could move up a rarity or lose
  a little power; Glass Cannon, Heist and Ironclad depend on having special cards.
- Harold is at the bottom of the cast (50%).
- Silver and Gold are still gentler than they could be for strong players with a full wardrobe (75% on Gold).
- The Water Chip run isn't simulated yet.
