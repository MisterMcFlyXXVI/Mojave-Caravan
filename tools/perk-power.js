#!/usr/bin/env node
// How much does each perk help? The dealer AI plays itself on identical decks; one side gets the perk.
// The result is the win-rate edge over a plain opponent (50% = no help). No browser, no run luck, so it isolates
// the perk. Sides alternate so the first-move advantage cancels out.
//
//   node tools/perk-power.js                 all perks, 800 hands each
//   node tools/perk-power.js --hands 2000    more hands (about +-2 points at 800, +-1.3 at 2000)
//   node tools/perk-power.js --perk wide,kingpin
//
// Perk effects here mirror runRules() in js/road-logic.js. If you change a perk there, change it here too (the smoke
// test checks that every perk is covered, so one can't be forgotten). Perks that don't touch a single hand (Guardian
// Angel, Prospector, Scavenger, Bounty Hunter, Cool Head) are listed as not simulated.
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');
const E = require('../js/engine.js');

// Each perk: (R, side, spec) => void. `side` is the holder; `spec` is that side's deck spec (to add upgraded cards).
const other = (s) => (s === 'p' ? 'a' : 'p');
const addCards = (spec, n, extra) => { let k = 0; for (let i = 0; i < spec.length && k < n; i++) if (E.isNum(spec[i]) && !spec[i].mod && !spec[i].ed) { Object.assign(spec[i], extra); k++; } };
const PERKS = {
  wide:       (R, s) => { R.range[s] = [R.range[s][0] - 2, R.range[s][1]]; },
  royal:      (R, s) => { R.kingMult[s] += 1; },
  steady:     (R, s) => { R.freeRank[s].push('Q'); },
  shark:      (R, s) => { R.hand[s] += 1; },
  lead:       (R, s) => { R.jackproof[s] = true; },
  twotone:    (R, s) => { R.color[s] = true; },
  jackrabbit: (R, s) => { R.freeRank[s].push('J'); },
  scrapper:   (R, s) => { R.freeRank[s].push('JK'); },                                  // Trickster
  kingpin:    (R, s) => { R.range[s] = [R.range[s][0], R.range[s][1] + 3]; },          // about 6 Kings played by mid-run
  momentum:   (R, s) => { R.hand[s] += 1; },                                            // about 4-8 tables won
  hazmat:     (R, s) => { R.jokerproof[s] = true; },
  courier:    (R, s) => { R.freeRank[s].push('K'); },
  cannon:     (R, s, spec) => { R.glassMult[s] = 3; addCards(spec, 3, { mod: 'glass' }); },
  collector:  (R, s) => { R.range[s] = [R.range[s][0], R.range[s][1] + 2]; },          // a 4th perk
  roller:     (R, s) => { R.hand[s] += 1; },                                            // Boss tables
  nose:       (R, s) => { R.exact26[s] = true; },
  honest:     (R, s) => { R.numProof[s] = true; },
  heist:      (R, s) => { R.heist[s] = true; },
  ironclad:   (R, s, spec) => { R.steelPlus[s] = 2; addCards(spec, 3, { mod: 'steel' }); },
  showcase:   (R, s, spec) => { R.edPlus[s] = 2; addCards(spec, 3, { ed: 'holo' }); },
};
const NOT_SIMULATED = ['insure', 'prospector', 'scav', 'hunter', 'cool'];

function hand(R, specP, specA, perkSide, noise) {
  const g = { p: { deck: E.buildDeck(specP), hand: [], cv: [[], [], []] }, a: { deck: E.buildDeck(specA), hand: [], cv: [[], [], []] }, turn: 'p', setupLeft: { p: 3, a: 3 }, rules: R };
  for (const s of ['p', 'a']) for (let i = 0; i < R.deal[s]; i++) g[s].hand.push(g[s].deck.pop());
  let t = 0;
  while (t < 500) {
    const s = g.turn;
    if (!g[s].hand.length) return other(s);
    const m = E.chooseAIMove(g, s, noise, null);
    if (!m) return other(s);
    const card = m.ci != null ? g[s].hand[m.ci] : null, free = m.t === 'face' && E.freeFace(g, s, card);
    E.applyMove(g, s, m, false); t++;
    const w = E.winnerOf(g); if (w) return w;
    if (!free) g.turn = other(s);
  }
  return null;
}
function edge(id, hands) {
  let wins = 0, played = 0;
  for (let i = 0; i < hands; i++) {
    const holder = i % 2 ? 'a' : 'p';                         // the perk holder alternates sides
    const R = E.baseRules(), spec = { p: E.addFaces(E.baseNumbers(), { J: 4, Q: 4, K: 4, JK: 2 }), a: E.addFaces(E.baseNumbers(), { J: 4, Q: 4, K: 4, JK: 2 }) };
    if (id) PERKS[id](R, holder, spec[holder]);
    const w = hand(R, spec.p, spec.a, holder, 3);
    if (!w) continue; played++; if (w === holder) wins++;
  }
  return { rate: (100 * wins) / played, n: played };
}

if (require.main === module && isMainThread) {
  const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
  const hands = +opt('hands', 800), ids = opt('perk', null) ? opt('perk').split(',') : Object.keys(PERKS);
  const workers = Math.min(4, ids.length), out = {};
  let done = 0;
  const base = edge(null, Math.max(400, hands));
  const chunks = Array.from({ length: workers }, (_, w) => ids.filter((_, i) => i % workers === w));
  chunks.forEach((chunk) => {
    const w = new Worker(__filename, { workerData: { chunk, hands } });
    w.on('message', (m) => { out[m.id] = m.res; });
    w.on('exit', () => {
      if (++done < workers) return;
      const sd = Math.sqrt(0.25 / hands) * 100;
      console.log(`Perk power: win rate of a side holding the perk vs a plain opponent, ${hands} hands each (+-${(2 * sd).toFixed(1)} points). A plain side wins ${base.rate.toFixed(1)}%.\n`);
      for (const [id, r] of Object.entries(out).sort((a, b) => b[1].rate - a[1].rate)) {
        const e = r.rate - base.rate;
        console.log(`  ${id.padEnd(11)} ${r.rate.toFixed(1).padStart(5)}%   edge ${(e >= 0 ? '+' : '') + e.toFixed(1)}   ${'#'.repeat(Math.max(0, Math.round(e / 2)))}`);
      }
      console.log(`\nNot simulated (they don't change a single hand): ${NOT_SIMULATED.join(', ')}`);
    });
  });
} else if (!isMainThread) {
  for (const id of workerData.chunk) parentPort.postMessage({ id, res: edge(id, workerData.hands) });
}
module.exports = { PERKS, NOT_SIMULATED };
