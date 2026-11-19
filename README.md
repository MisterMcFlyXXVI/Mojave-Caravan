# Mojave Caravan

A Fallout: New Vegas tribute: the Caravan card game as a classic mode and campaign, plus **The Road**, a roguelite run
(perks, bosses, shops, daily seeds). A static site: no build step. Open `index.html`, or deploy the folder (Vercel
serves it as is; `vercel.json` only proxies the Firebase sign-in).

## Layout

```
index.html        markup, then the scripts below in order
style.css         all styles
js/               classic scripts that share one global scope, loaded in this order:
  engine.js         rules engine and dealer AI (pure: also loads under Node)
  data.js           houses, dealers, decks, cosmetics, perks, chems, characters
  special.js        SPECIAL stats: base values, gear modifiers, what each stat does (SPX), on-screen text
  tutorial.js       guided lessons
  state.js          save/load/migrate, small DOM helpers
  menus.js          rules text, home, Classic, deck builder, character picker
  match.js          the table screen and Legend cards
  flow.js           turn flow (doMove, AI turns) and input handling
  achievements.js   achievements
  shell.js          top bar, settings, help, sound, account sync
  art.js            procedural card backs, props, portraits, backdrop
  road-logic.js     The Road: route, gear, perks, shops, events, finishing a table
  bosses.js         boss play styles and signature moves
  road-screens.js   The Road screens, Codex, run summary
  effects.js        animation and visual effects
  campaign.js       Classic campaign
  rundown.js        illustrated rules rundown, table props
  boot.js           start-up
tools/            dev tools, not deployed (see below)
```

Because the scripts share one scope, a file may use anything declared in an earlier file at load time, and anything
at all inside functions that run later. Keep that order when adding files.

## Tools

```
cd tools && npm install && npx playwright install chromium     # once
node engine-tests.js            # rules + dealer AI, no browser (add --quick for small samples)
node smoke.js                   # drives the real page: seeds, daily, wagers, signatures, events, codex, clicks
node simulate-runs.js --runs 480 --workers 4 --out a.json       # bot plays whole runs, prints a balance report
node simulate-runs.js --compare a.json b.json                   # before/after boss win rates
```

The simulation bot uses the real game code with rendering and timers stubbed (about a second per run). It plays
hands with the dealer AI's move chooser and makes simple shop and event choices, but doesn't use chems, companions,
Legend targets, wagers or boss swaps. Treat its numbers as a baseline for comparing versions and spotting outliers,
not as human win rates. About 2 points per table is noise at typical sample sizes.
