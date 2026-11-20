#!/usr/bin/env node
// Rules-engine and dealer-AI tests. No dependencies: it loads js/engine.js straight into Node.
//   node tools/engine-tests.js           full run (about a minute)
//   node tools/engine-tests.js --quick   smaller samples
const E = require('../js/engine.js');
const quick = process.argv.includes('--quick');
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`); };
const ent = (r, s, faces = []) => ({ card: E.mk(r, s), faces: faces.map(([fr, fs]) => E.mk(fr, fs)) });
const board = (p, a, rules) => ({ p: { deck: [], hand: [], cv: p }, a: { deck: [], hand: a, cv: [[], [], []] }, turn: 'a', setupLeft: { p: 0, a: 0 }, rules: rules || E.baseRules() });

// ---- values and direction ----
ok('Ace is worth 1', E.val(E.mk('A', 'S')) === 1);
ok('a King doubles the card it sits on; two Kings make ×4', E.cvValue([ent('6', 'S', [['K', 'H'], ['K', 'D']])]) === 24);
const climbing = [ent('4', 'S'), ent('7', 'H')];
ok('climbing: a higher card plays', E.canPlayNum(climbing, E.mk('9', 'C'), false));
ok('climbing: a lower card is blocked', !E.canPlayNum(climbing, E.mk('5', 'C'), false));
ok('the suit of the top card plays against the direction', E.canPlayNum(climbing, E.mk('2', 'H'), false));
ok('the same value as the top card never plays', !E.canPlayNum(climbing, E.mk('7', 'D'), false));
ok('a Queen flips direction and sets the suit', E.cvState([ent('4', 'S'), ent('7', 'H', [['Q', 'C']])]).dir === -1 && E.cvState([ent('4', 'S'), ent('7', 'H', [['Q', 'C']])]).suit === 'C');
ok('Two-Tone: same colour counts as the suit', E.canPlayNum(climbing, E.mk('2', 'D'), true));

// ---- Jack and Joker ----
{
  const g = board([[ent('9', 'H', [['K', 'S']]), ent('3', 'C')], [], []], [E.mk('J', 'S')]);
  E.applyMove(g, 'a', { t: 'face', ci: 0, side: 'p', lane: 0, idx: 0 }, false);
  ok('a Jack removes its card and everything stacked on it', g.p.cv[0].length === 1 && g.p.cv[0][0].card.rank === '3');
}
{
  const g = board([[ent('5', 'S'), ent('5', 'H')], [ent('5', 'D')], [ent('7', 'C')]], [E.mk('JK', null)]);
  g.a.cv[0] = [ent('5', 'C')];
  E.applyMove(g, 'a', { t: 'face', ci: 0, side: 'a', lane: 0, idx: 0 }, false);
  ok('a Joker removes every other card of that value, from both sides', g.p.cv[0].length === 0 && g.p.cv[1].length === 0 && g.p.cv[2].length === 1 && g.a.cv[0].length === 1);
}
{
  const R = E.baseRules(); R.jokerproof.p = true;
  const g = board([[ent('5', 'S')], [], []], [E.mk('JK', null)], R); g.a.cv[0] = [ent('5', 'C')];
  E.applyMove(g, 'a', { t: 'face', ci: 0, side: 'a', lane: 0, idx: 0 }, false);
  ok('a Joker-proof side keeps its cards', g.p.cv[0].length === 1);
}

// ---- rules and perks added for boss difficulty and build depth ----
{
  const R = E.baseRules(); R.kingOwn = true;
  const g = board([[ent('9', 'H')], [], []], [E.mk('K', 'S')], R); g.a.cv[0] = [ent('4', 'C')];
  const mv = E.legalMoves(g, 'a').filter((m) => m.t === 'face');
  ok('Home Kings: Kings only go on your own caravans', mv.length > 0 && mv.every((m) => m.side === 'a'));
}
{
  const R = E.baseRules(); R.banP.push('Q');
  const gp = board([[], [], []], [], R); gp.p.hand = [E.mk('Q', 'S')]; gp.p.cv[0] = [ent('4', 'C')]; gp.turn = 'p';
  const ga = board([[ent('4', 'C')], [], []], [E.mk('Q', 'S')], R);
  ok('No Queens bans Queens for the player only', E.legalMoves(gp, 'p').every((m) => m.t !== 'face') && E.legalMoves(ga, 'a').some((m) => m.t === 'face'));
}
{
  const R = E.baseRules(); R.numProof.p = true;
  const g = board([[ent('9', 'H'), ent('5', 'S', [['K', 'D']])], [], []], [E.mk('J', 'S')], R);
  const targets = E.legalMoves(g, 'a').filter((m) => m.t === 'face').map((m) => m.idx);
  ok('Honest Work: Jacks can only hit number cards that carry a face card', targets.length === 1 && targets[0] === 1, targets.join(','));
}
{
  const R = E.baseRules(); R.heist.a = true;
  const g = board([[ent('9', 'H'), ent('3', 'C')], [], []], [E.mk('J', 'S')], R);
  E.applyMove(g, 'a', { t: 'face', ci: 0, side: 'p', lane: 0, idx: 0 }, false);
  ok('Heist: a Jack takes the number card it removes into your hand', g.a.hand.some((c) => c.rank === '9' && c.suit === 'H'));
}
{
  const R = E.baseRules(); R.exact26.p = true;
  const deck = ['2', '3', '4', '5', '6', '7', '8', '9'].map((r) => E.mk(r, 'S'));
  const g = { p: { deck, hand: [E.mk('K', 'D'), E.mk('Q', 'H')], cv: [[ent('4', 'C'), ent('9', 'S', [['K', 'H']])], [], []] }, a: { deck: [], hand: [], cv: [[], [], []] }, turn: 'p', setupLeft: { p: 0, a: 0 }, rules: R };
  // 4 + 9*2 = 22; a King on the 4 makes 8 + 18 = 26
  E.applyMove(g, 'p', { t: 'face', ci: 0, side: 'p', lane: 0, idx: 0 }, false);
  const drew = g.p.hand.length;                                           // refilled to 5, then 2 more for the 26
  E.applyMove(g, 'p', { t: 'face', ci: 0, side: 'p', lane: 0, idx: 1 }, false);   // a Queen: lane stays at 26, so no second trigger
  ok('Bloodhound: reaching exactly 26 draws 2 cards, once', E.cvValue(g.p.cv[0]) === 26 && drew === 7 && g.p.hand.length === 6 && g.p.h26[0] === true, `hand ${drew} then ${g.p.hand.length}`);
}
{
  const R = E.baseRules(); R.steelPlus.p = 2; R.edPlus.p = 1;
  const g = board([[], [], []], [], R); g.turn = 'p';
  const steel = E.mk('5', 'S'); steel.mod = 'steel'; const holo = E.mk('4', 'H'); holo.ed = 'holo';
  g.p.hand = [steel, holo];
  E.applyMove(g, 'p', { t: 'num', ci: 0, lane: 0 }, false); E.applyMove(g, 'p', { t: 'num', ci: 0, lane: 1 }, false);
  ok('Ironclad and Showcase: Steel is worth 2 more, finished cards 1 more', E.cvValue(g.p.cv[0]) === 7 && E.cvValue(g.p.cv[1]) === 5);
}

{
  const R = E.baseRules(); R.freeRank.p.push('J');
  const g = board([[], [], []], [], R);
  ok('free plays: only the listed ranks skip the turn, and only for that side', E.freeFace(g, 'p', E.mk('J', 'S')) && !E.freeFace(g, 'p', E.mk('K', 'S')) && !E.freeFace(g, 'a', E.mk('J', 'S')));
}

// ---- who wins a lane ----
const R0 = E.baseRules();
ok('21-26 beats a lower caravan', E.laneWinner(23, 18, R0) === 'p' && E.laneWinner(18, 23, R0) === 'a');
ok('a bust loses to anything in range', E.laneWinner(28, 21, R0) === 'a');
ok('under 21 on both sides: unsettled', E.laneWinner(19, 17, R0) === null);
ok('an exact tie is unsettled', E.laneWinner(24, 24, R0) === null);
const Rp = E.baseRules(); Rp.tieWin.p = true;
const Ra = E.baseRules(); Ra.tieWin.a = true;
const Rb = E.baseRules(); Rb.tieWin.p = true; Rb.tieWin.a = true;
ok('ties go to whoever has the tie rule (Benny, House Edge)', E.laneWinner(24, 24, Rp) === 'p' && E.laneWinner(24, 24, Ra) === 'a');
ok('if both sides have it, ties stay unsettled', E.laneWinner(24, 24, Rb) === null);

// ---- no dead ends ----
function game(rules, P1, P2, noise) {
  const spec = E.addFaces(E.baseNumbers(), { J: 4, Q: 4, K: 4, JK: 2 });
  const g = { p: { deck: E.buildDeck(spec), hand: [], cv: [[], [], []] }, a: { deck: E.buildDeck(spec), hand: [], cv: [[], [], []] }, turn: 'p', setupLeft: { p: 3, a: 3 }, rules };
  for (const s of ['p', 'a']) for (let i = 0; i < 8; i++) g[s].hand.push(g[s].deck.pop());
  const P = { p: P1, a: P2 }; let t = 0, zero = false;
  while (t < 500) {
    const s = g.turn;
    if (!g[s].hand.length) return { w: s === 'p' ? 'a' : 'p', t, zero };
    if (!E.legalMoves(g, s).length) { zero = true; break; }
    const m = E.chooseAIMove(g, s, noise, P[s]); if (!m) { zero = true; break; }
    E.applyMove(g, s, m, false); t++;
    const w = E.winnerOf(g); if (w) return { w, t, zero };
    g.turn = s === 'p' ? 'a' : 'p';
  }
  return { w: null, t, zero };
}
{
  const N = quick ? 80 : 400; let dead = 0;
  for (let i = 0; i < N; i++) { const R = E.baseRules(); R.noDiscard.p = true; R.noDisband = { p: true, a: true }; R.dead.p = ['2', '3']; if (game(R, null, null, 10).zero) dead++; }
  ok(`no hand ever has zero legal moves, even with Drought + No Backing Out + Dead Hand`, dead === 0, `${dead}/${N}`);
}
{
  const N = quick ? 100 : 300; let done = 0, plies = 0;
  for (let i = 0; i < N; i++) { const r = game(E.baseRules(), null, null, 10); if (r.w) done++; plies += r.t; }
  ok('AI vs AI hands all finish', done === N, `${done}/${N}, avg ${(plies / N).toFixed(0)} plies`);
  ok('hands last a sensible number of plies', plies / N > 25 && plies / N < 70);
}

// ---- dealer styles are worth having ----
{
  const N = quick ? 80 : 240; let w = 0, g = 0;
  for (let i = 0; i < N; i++) { const flip = i % 2, r = flip ? game(E.baseRules(), null, { king: 6 }, 3) : game(E.baseRules(), { king: 6 }, null, 3); if (!r.w) continue; g++; if ((r.w === 'p') !== !!flip) w++; }
  const rate = (100 * w / g);
  ok('a King-savvy dealer beats the stock AI', rate > (quick ? 50 : 54), `${rate.toFixed(0)}% over ${g} hands`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
