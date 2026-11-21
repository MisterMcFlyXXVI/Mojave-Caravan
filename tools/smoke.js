#!/usr/bin/env node
// Browser smoke test: loads the real page in headless Chromium and exercises the game's features.
//   cd tools && npm install && npx playwright install chromium     (once)
//   node tools/smoke.js
const path = require('path');
const { chromium } = require('playwright');

let pass = 0, fail = 0;
const ok = (name, cond, extra) => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra !== undefined ? '  (' + extra + ')' : ''}`); };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
  const errors = [], missing = [];
  // The sandbox/CI may block fonts and the Firebase script; those aren't game errors.
  const noise = /ERR_FILE_NOT_FOUND|ERR_TUNNEL|ERR_NAME|ERR_INTERNET|ERR_CONNECTION|ERR_FAILED/;
  page.on('pageerror', (e) => errors.push('PAGEERR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !noise.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', (r) => { const u = r.url(); if (u.startsWith('file:') && /\.(js|css)$/.test(u)) missing.push(u); });
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await page.evaluate(() => { window.__noFlip = true; }); // most checks want to open the hand themselves; the cap flip has its own check below
  await page.waitForTimeout(1500);

  const boot = await page.evaluate(() => ({ scripts: document.querySelectorAll('script[src]').length, home: document.body.innerHTML.includes('CAR'), css: [...document.styleSheets].some((s) => /style\.css/.test(s.href || '')) }));
  ok('the page boots with its stylesheet and every script', boot.home && boot.css && boot.scripts >= 16 && !missing.length, `${boot.scripts} scripts`);

  // Everything below runs inside the page, against the real game code.
  const R = await page.evaluate(() => {
    const out = {};
    const realTimeout = window.setTimeout;
    window.setTimeout = () => 0;                                   // run dealer turns by hand, restored at the end
    const fresh = (o = {}) => { meta.run = null; meta.char = o.char || 'vladmira'; meta.decksUnlocked = 8; meta.deckTiers = { plain: 3, scorched: 3 }; meta.newRun = { deck: o.deck || 'plain', tier: o.tier || 'copper', token: null, seed: o.seed || 'smoke' }; startRun(); return run(); };

    // --- seeds ---
    const snap = (seed) => { fresh({ seed }); const r = run(); r.phase = 'shop'; openShop(); return JSON.stringify({ b: r.bosses, d: r.dealers.map((x) => x.map((y) => y.name)), ro: r.roster, sh: r.offers.perks, c: r.offers.cards.map((c) => c.rank + c.suit), bu: r.offers.bundles.map((x) => x.id) }); };
    out.seedSame = snap('hello') === snap('HELLO'); out.seedDiff = snap('hello') !== snap('world');
    out.randomNative = Math.random.toString().includes('[native code]');

    // --- daily ---
    meta.run = null; meta.char = 'nuke'; meta.dailyLog = {}; meta.dailyDone = null; meta.dailyStreak = 0; meta.scrip = 0;
    handleRunClick({ rundaily: '' }); const d = run();
    out.daily = d.daily && d.deck === 'plain' && d.tier === 'copper' && d.gear.length === 0 && ORIGINALS.includes(d.char);
    runLost(); out.dailyBonus = d.dailyBonus; handleRunClick({ runnew: '' }); out.charRestored = meta.char === 'nuke';
    handleRunClick({ rundaily: '' }); const d2 = run(); runLost(); out.dailyOnce = !d2.dailyBonus; handleRunClick({ runnew: '' });
    handleRunClick({ rundaily: '' }); const sc = meta.scrip; runLost(true); out.abandonPays = meta.scrip - sc; handleRunClick({ runnew: '' });

    // --- boss reward and perks ---
    let r = fresh(); r.phase = 'table'; r.stop = 1; r.table = 2; startRunTable(); finish('p', 'x');
    out.rewardOffered = (r.bossPick || []).length === 3 && r.phase === 'event';
    handleRunClick({ bosspick: r.bossPick[0] }); out.rewardTaken = r.bossPick === null && meta.perks.length === 1;
    r.bossPick = rollBossPerks(); meta.perks = ['wide', 'royal', 'steady']; r.bossCaps = 15; const c0 = meta.caps; handleRunClick({ bossskip: '' }); out.rewardCaps = meta.caps - c0;
    r = fresh(); meta.perks = ['courier', 'hazmat', 'cannon']; r.phase = 'table'; startRunTable();
    out.perkRules = G.rules.freeRank.p.includes('K') && G.rules.jokerproof.p && G.rules.glassMult.p === 3;
    r = fresh({ deck: 'scorched' }); out.scorched = meta.deck.length === 48 && meta.deck.filter((c) => !isNum(c)).length === 8;

    // --- every event, every character ---
    const bad = [];
    for (const ch of CHAR_ORDER) for (const key of Object.keys(EVENTS)) {
      if (EVENTS[key].wc) continue;
      EVENTS[key].choices.forEach((c, i) => { const rr = fresh({ char: ch }); rr.stop = 1; rr.phase = 'event'; rr.event = key; rr.eventResult = null; meta.caps = 40; try { eventChoose(i); screen = 'road'; render(); } catch (e) { bad.push(`${ch}/${key}/${i}: ${e.message}`); } });
    }
    out.eventErrors = bad.length; out.eventFirst = bad[0];
    r = fresh({ char: 'matt' }); r.stop = 1; r.phase = 'event'; r.event = 'safe'; r.eventResult = null; meta.caps = 0; eventChoose(0); out.lockedRejected = r.eventResult === null;

    // --- wagers ---
    r = fresh(); r.stop = 2; r.table = 1; r.phase = 'table'; meta.caps = 60; handleRunClick({ wager: '10' }); const w0 = meta.caps; startRunTable(); out.stake = w0 - meta.caps;
    const w1 = meta.caps; finish('p', 't'); out.wagerPaid = (G.over.extras || []).some((x) => /Wager paid: \+20/.test(x)); out.wagerGain = meta.caps - w1 > 20;
    r = fresh(); r.stop = 1; r.phase = 'table'; meta.caps = 40; r.wagerSel = 5; startRunTable(); const w2 = meta.caps; finish('a', 't'); out.wagerLost = meta.caps === w2;
    r = fresh(); r.stop = 1; r.phase = 'table'; meta.caps = 40; r.wagerSel = 5; startRunTable(); G.walked = true; const w3 = meta.caps; finish('a', 't'); out.wagerRefund = meta.caps - w3 === 5;
    r = fresh(); meta.caps = 3; r.wagerSel = 5; startRunTable(); out.wagerPoor = !G.wager;

    // --- boss rule swap ---
    r = fresh('x'); r.stop = 3; r.table = 2; r.phase = 'table'; meta.caps = 80; ensureStop(3);
    handleRunClick({ rulesw: '0' }); const pick = r.swapPick && r.swapPick.opts[0]; const cap0 = meta.caps; handleRunClick({ rulepick: pick });
    out.swap = meta.caps === cap0 - bossSwapCost(3) && r.bosses[3].includes(pick); handleRunClick({ rulesw: '0' }); out.swapOnce = !r.swapPick;
    let viol = 0; for (let k = 0; k < 60; k++) { const rr = fresh({ seed: 'p' + k, tier: ['copper', 'silver', 'gold'][k % 3] }); for (let st = 1; st < 6; st++) { ensureStop(st); rr.stop = st; for (let i = 0; i < rr.bosses[st].length; i++) { const others = rr.bosses[st].filter((_, j) => j !== i), bn = rr.bounties[st]; for (const id of swapOptions(st, i)) { if (rr.bosses[st].includes(id) || RULE_CLASH.some((g) => g.includes(id) && others.some((x) => g.includes(x))) || (id === 'tight' && bn === 'p26') || (id === 'noking' && bn === 'kings') || (id === 'drought' && bn === 'calm')) viol++; } } } }
    out.swapViolations = viol;

    // --- boss signatures ---
    const boss = (name, tier) => { const rr = fresh({ tier }); rr.phase = 'table'; rr.stop = 3; rr.table = 2; startRunTable(); G.dealer = { ...G.dealer, name }; delete G.sig; setupSig(rr); G.setupLeft = { p: 0, a: 0 }; G.log = []; busy = false; return rr; };
    const dealer = (n) => { for (let i = 0; i < n; i++) { const ms = legalMoves(G, 'a').filter((m) => m.t === 'num' || m.t === 'discard'); if (!ms.length) break; G.turn = 'a'; doMove('a', ms[0]); if (G.over) break; } };
    const E = (rank, suit) => ({ card: mk(rank, suit), faces: [] });
    const hand = (cards) => cards.map(([a, b]) => mk(a, b));
    boss('Velvet Moreno', 'copper'); G.p.cv = [[E('2', 'S')], [E('9', 'H'), E('10', 'S')], [E('4', 'D')]]; G.a.cv = [[], [], []];
    G.a.hand = hand([['A', 'S'], ['A', 'H'], ['A', 'D'], ['A', 'C'], ['2', 'C'], ['2', 'D'], ['2', 'H'], ['5', 'C']]); dealer(4); out.knifeEarly = !G.sig.fired && G.p.cv[1].length === 2; dealer(1); out.knife = G.sig.fired && G.p.cv[1].length === 1 && G.lastLost.lane === 1;
    boss('Greg', 'copper'); G.a.hand = hand([['A', 'S'], ['2', 'H'], ['3', 'D'], ['4', 'C'], ['5', 'S'], ['6', 'H'], ['7', 'D'], ['8', 'C']]); G.p.cv = [[E('9', 'S')], [E('9', 'H')], [E('9', 'D')]]; G.a.cv = [[], [], []]; dealer(7); out.hug = G.sig.fired && G.turn === 'a';
    boss('Benny', 'copper'); G.a.hand = hand([['A', 'S'], ['2', 'H'], ['3', 'D'], ['4', 'C'], ['5', 'S'], ['6', 'H'], ['7', 'D'], ['8', 'C'], ['9', 'S'], ['10', 'H']]); G.a.cv = [[], [], []]; const r0 = G.rules.range.a.slice(); dealer(G.sig.at - 1); const chipEarly = G.rules.range.a[0] === r0[0]; dealer(1); out.chip = chipEarly && G.rules.range.a[0] === Math.min(18, r0[0]) && G.rules.range.a[1] === Math.max(30, r0[1]);
    boss('Mama Tallow', 'copper'); G.a.hand = hand([['A', 'S'], ['2', 'H'], ['3', 'D'], ['4', 'C'], ['5', 'S']]); G.a.cv = [[], [], []]; G.a.deck = hand([['6', 'S'], ['7', 'S'], ['8', 'S'], ['9', 'S'], ['10', 'S'], ['6', 'H']]); dealer(2); const hb = G.a.hand.length; dealer(1); out.feast = G.sig.fired && G.a.hand.length >= hb + 1;
    out.sigTiers = ['copper', 'silver', 'gold'].map((t) => { boss('Greg', t); return G.sig.at; }).join(',') === '7,6,5';
    boss('Silver Lou', 'copper'); out.edge = G.rules.tieWin.a && laneWinner(24, 24, G.rules) === 'a';
    boss('Velvet Moreno', 'copper'); screen = 'match'; rulesOpen = false; render(); out.sigChip = document.body.innerHTML.includes('Signature: Knife Throw in 5 turns');
    let n1 = 0, n3 = 0; for (let i = 0; i < 300; i++) { const ro = runRoster('nuke', false); if (!ro[1]) n1++; if (!ro[3]) n3++; }
    out.rosterVariety = n1 > 60 && n1 < 160 && n3 > 60 && n3 < 160;

    // --- codex, run summary, old saves ---
    meta.codex = { perk: {}, boss: {}, event: {} };
    r = fresh(); r.phase = 'shop'; openShop(); const offered = r.offers.perks.slice(); out.codexSeen = offered.every((id) => (meta.codex.perk[id] || 0) & 1);
    r.phase = 'table'; r.stop = 1; r.table = 2; startRunTable(); const bn = G.dealer.name; finish('p', 'x'); out.codexBoss = !!meta.codex.boss[bn] && meta.codex.boss[bn].f === 1;
    let tabs = 0; for (const t of ['perks', 'legends', 'bosses', 'events', 'upgrades']) { codexTab = t; screen = 'codex'; try { render(); tabs++; } catch (e) {} } out.codexTabs = tabs === 5;
    r = fresh(); r.phase = 'table'; r.stop = 0; r.table = 0; startRunTable(); finish('p', 'x'); runLost(); screen = 'road'; render(); out.summary = document.body.innerHTML.includes('How it went');
    r = fresh(); delete r.seed; delete r.rs; delete meta.codex; r.phase = 'shop'; meta = migrate(JSON.parse(JSON.stringify(meta))); openShop(); rerollShop(); screen = 'road'; render();
    { const old = run(); old.phase = 'table'; old.stop = 1; old.table = 2; startRunTable(); finish('p', 'x'); out.oldSave = !!run().bossPick && !!meta.codex.boss; }
    window.setTimeout = realTimeout;
    return out;
  });

  const T = (name, v) => ok(name, !!v);
  // every perk in the game is either simulated by tools/perk-power.js or explicitly listed as not simulated
  const gamePerks = await page.evaluate(() => Object.keys(PERKS));
  const pp = require('./perk-power.js'), covered = new Set([...Object.keys(pp.PERKS), ...pp.NOT_SIMULATED]);
  const notCovered = gamePerks.filter((id) => !covered.has(id)), stale = [...covered].filter((id) => !gamePerks.includes(id));
  ok('tools/perk-power.js covers every perk in the game', !notCovered.length && !stale.length, `missing: ${notCovered.join(',') || 'none'}; stale: ${stale.join(',') || 'none'}`);
  T('same seed gives the same bosses, rivals and shops; a different seed differs', R.seedSame && R.seedDiff);
  T('seeded randomness is switched off again afterwards', R.randomNative);
  T('the daily run has its fixed setup', R.daily);
  ok('the daily pays a bonus once, restores your character, and abandoning pays nothing', R.dailyBonus === 5 && R.charRestored && R.dailyOnce && R.abandonPays === 0, `bonus ${R.dailyBonus}`);
  T('beating a boss offers three perks and one can be taken', R.rewardOffered && R.rewardTaken);
  ok('with full perk slots you can take caps instead', R.rewardCaps === 15, R.rewardCaps);
  T('new perk rules are wired up (free Kings, Joker-proof, Glass Cannon)', R.perkRules);
  T('the Scorched deck burns six face cards', R.scorched);
  ok('every event runs for every character', R.eventErrors === 0, R.eventFirst || '');
  T('a stat-locked event choice is rejected', R.lockedRejected);
  ok('wagers: stake taken, paid on a win, lost on a loss, refunded on a walk-away, ignored if you can’t afford it', R.stake === 10 && R.wagerPaid && R.wagerGain && R.wagerLost && R.wagerRefund && R.wagerPoor);
  ok('boss rule swap costs caps, replaces the rule, and works once per boss', R.swap && R.swapOnce);
  ok('swap options never clash or make the bounty impossible', R.swapViolations === 0, `${R.swapViolations} violations`);
  ok('signatures: knife, hug, platinum chip and extra cards fire on the right turn', R.knifeEarly && R.knife && R.hug && R.chip && R.feast);
  T('signatures fire earlier on Silver and Gold', R.sigTiers);
  T('House Edge gives the dealer ties', R.edge);
  T('the signature countdown shows at the table', R.sigChip);
  T('Mama Tallow and Sergeant Brick turn up on stops 2 and 4 now and then', R.rosterVariety);
  T('the Codex records perks and bosses, and all its tabs render', R.codexSeen && R.codexBoss && R.codexTabs);
  T('a run ends with a summary', R.summary);
  T('a save from before seeds and the Codex still loads and plays', R.oldSave);

  // ---- SPECIAL ----
  const SP = await page.evaluate(() => {
    const o = {}; const realTimeout = window.setTimeout; window.setTimeout = () => 0;
    const fresh = (ch, gear = []) => { meta.run = null; meta.char = ch; meta.decksUnlocked = 8; meta.gear = { owned: gear.slice(), on: {} }; for (const id of gear) meta.gear.on[GEAR[id].slot] = id; meta.newRun = { deck: 'plain', tier: 'copper', token: null, seed: 'sp-' + ch }; startRun(); return run(); };
    const rules = (r) => { r.phase = 'table'; return runRules(0, 0); };
    // data
    o.sevenEach = CHAR_ORDER.every((c) => CHAR_BIO[c].stats.length === 7 && CHAR_BIO[c].stats.every((v) => v >= 1 && v <= 10));
    o.names = STAT_NAMES.join(',');
    o.gearKeys = Object.values(GEAR).every((g) => g.sp && Object.keys(g.sp).every((k) => statIdx(k) >= 0));
    o.everySlotHasMods = GEAR_SLOTS.every((sl) => Object.values(GEAR).filter((g) => g.slot === sl.id).every((g) => g.sp));
    o.eventNames = Object.values(EVENTS).every((e) => e.choices.every((c) => !c.req || statIdx(c.req[0]) >= 0));
    // gear modifies stats, clamped to 1-10
    o.gearAdds = specialFor('matt', ['fawkes'])[0] === 7 && specialFor('vladmira', ['hat'])[3] === 10 && specialFor('vladmira', ['fawkes'])[0] === 10;
    o.gearTakes = specialFor('harold', ['sawedoff'])[1] === 5 && specialFor('greg', ['armor'])[5] === 3;
    o.floor = specialFor('matt', ['sawedoff', 'armor']).every((v) => v >= 1);
    o.effectsText = specialEffects(specialFor('vladmira', []), 'vladmira').map((f) => f.text).join(' | ');
    // Strength: chems and sell ceiling
    fresh('vladmira'); o.chemsVlad = chemMax(); o.ceilVlad = rules(run()).range.p[1];
    fresh('matt'); o.chemsMatt = chemMax(); o.ceilMatt = rules(run()).range.p[1];
    fresh('nuke'); o.chemsNuke = chemMax(); fresh('snipsnip'); o.chemsSnip = chemMax();
    fresh('matt', ['fawkes']); o.chemsFawkes = chemMax();
    { const bn = fresh('benny'); o.bennyDealerHand = rules(bn).hand.a; }    // Double-Crosser: dealers hold 1 extra card
    // Perception: bundle size, dealer's hand
    fresh('jeanita'); o.seeJeanita = bundleSee({ id: 'saddlebag' }); fresh('vladmira'); o.seeVlad = bundleSee({ id: 'saddlebag' }); fresh('matt'); o.seeMatt = bundleSee({ id: 'saddlebag' });
    fresh('jeanita'); let r = run(); r.phase = 'table'; startRunTable(); o.peekJeanita = !!G.peek; fresh('matt'); r = run(); r.phase = 'table'; startRunTable(); o.peekMatt = !!G.peek;
    // Endurance: starting Grit, Water Chip days
    o.grit = ['harold', 'benny', 'chevy', 'matt'].map((c) => fresh(c).grit).join(',') + '|' + fresh('chevy', ['armor']).grit + '|' + SPX.grit(3) + ',' + SPX.grit(9) + ',' + SPX.grit(10); fresh('harold'); o.wcHarold = wcCost(0); fresh('matt'); o.wcMatt = wcCost(0);
    // Charisma: prices
    o.disc = ['vladmira', 'ronald', 'snipsnip', 'matt'].map((c) => { fresh(c); return disc(100); }).join(',');
    // Intelligence: rerolls, bundle keep, bounties
    fresh('nuke'); o.rerollNuke = rerollCost(); fresh('matt'); o.rerollMatt = rerollCost();
    fresh('nuke'); openBundle0({ id: 'saddlebag' }, false); o.keepNuke = run().picker.keep; fresh('matt'); openBundle0({ id: 'saddlebag' }, false); o.keepMatt = run().picker.keep;
    fresh('vladmira'); const bv = bossBountyPay(2); fresh('matt'); o.bountyHalf = bv * 2 === bossBountyPay(2) || bv * 2 === bossBountyPay(2) + 1 || bv * 2 === bossBountyPay(2) - 1;
    // Agility: opening hand, quick hands
    o.deal = ['ronald', 'snipsnip', 'matt'].map((c) => { const rr = fresh(c); return rules(rr).deal.p; }).join(',');
    fresh('benny'); r = run(); r.phase = 'table'; startRunTable(); o.quickOn = !!G.quick; G.setupLeft = { p: 0, a: 0 }; G.turn = 'p'; G.p.hand = [mk('K', 'S'), mk('2', 'H'), mk('3', 'C')]; busy = false;
    doMove('p', { t: 'discard', ci: 0 }); o.quickFree = G.turn === 'p' && G.quickUsed; doMove('p', { t: 'discard', ci: 0 }); o.quickOnce = G.turn === 'a';
    // Luck
    fresh('matt'); const lm = rarityWeights(); fresh('benny'); const lb = rarityWeights(); fresh('snipsnip'); const ls = rarityWeights();
    o.luckSkews = lb.legendary > lm.legendary && lb.common < lm.common && ls.common > lm.common && Math.abs(Object.values(lm).reduce((a, b) => a + b, 0) - 100) < 0.01;
    fresh('benny', ['revolver']); o.luckyDraw = rules(run()).luckyDraw.p; fresh('matt'); o.luckyDrawMatt = rules(run()).luckyDraw.p;
    // stats gate events by effective value (gear counts)
    fresh('matt'); o.gateBase = statOf('Strength') >= 7; fresh('matt', ['fawkes']); o.gateGear = statOf('Strength') >= 7;
    // screens
    meta.run = null; meta.char = 'vladmira'; meta.gear = { owned: ['hat'], on: { head: 'hat' } }; screen = 'road'; render(); const setup = document.body.innerHTML;
    o.setupPanel = setup.includes('Your SPECIAL') && setup.includes('Barter') && setup.includes('class="stat"');
    charInfo = 'jeanita'; screen = 'pickchar'; render(); o.bio = document.querySelectorAll('.biocard .stat').length === 7 && document.body.innerHTML.includes('From SPECIAL'); charInfo = null;
    screen = 'office'; render(); o.office = document.body.innerHTML.includes('class="gsp"') && document.body.innerHTML.includes('’s SPECIAL');
    fresh('chevy', ['armor', 'combat']); kitOpen = 'special'; screen = 'road'; render(); o.kit = document.body.innerHTML.includes('What it does for you') && document.body.innerHTML.includes('Leather Armor'); kitOpen = null;
    window.setTimeout = realTimeout; return o;
  });
  ok('every character has seven stats from 1 to 10, named like SPECIAL', SP.sevenEach && SP.names === 'Strength,Perception,Endurance,Charisma,Intelligence,Agility,Luck');
  ok('every piece of gear carries stat modifiers and events use real stat names', SP.gearKeys && SP.everySlotHasMods && SP.eventNames);
  ok('gear adds to and takes from stats, clamped to 1-10', SP.gearAdds && SP.gearTakes && SP.floor);
  ok('Strength sets the chem pouch (Nuke and Snip Snip keep their own) and the sell ceiling at 9+', SP.chemsVlad === 5 && SP.ceilVlad === 27 && SP.chemsMatt === 3 && SP.ceilMatt === 26 && SP.chemsNuke === 5 && SP.chemsSnip === 0 && SP.chemsFawkes === 4, `${SP.chemsVlad}/${SP.ceilVlad}/${SP.chemsMatt}/${SP.chemsNuke}/${SP.chemsSnip}/${SP.chemsFawkes}`);
  ok('Perception changes bundle size, and 10 shows the dealer’s hand', SP.seeJeanita === 5 && SP.seeVlad === 2 && SP.seeMatt === 3 && SP.peekJeanita && !SP.peekMatt, `${SP.seeJeanita}/${SP.seeVlad}/${SP.seeMatt}`);
  ok('Endurance 10 adds a starting Grit (reachable with gear), 3 or less costs one, and Water Chip days shrink at 7+', SP.grit === '1,1,1,1|2|-1,0,1' && SP.wcHarold === 5 && SP.wcMatt === 6, `${SP.grit}`);
  ok('Charisma moves trading post prices', SP.disc === '85,80,110,100', SP.disc);
  ok('Intelligence cheapens rerolls, keeps more bundle cards and halves bounties when very low', SP.rerollNuke === 2 && SP.rerollMatt === 3 && SP.keepNuke === 2 && SP.keepMatt === 1 && SP.bountyHalf, `${SP.rerollNuke}/${SP.keepNuke}`);
  ok('Agility changes the opening hand and frees a discard once per hand', SP.deal === '7,9,8' && SP.quickOn && SP.quickFree && SP.quickOnce, SP.deal);
  ok('Luck tilts rarity weights (still summing to 100) and Lucky cards draw 2 at 9+', SP.luckSkews && SP.luckyDraw === 2 && SP.luckyDrawMatt === 1);
  ok('Benny’s Double-Crosser: every dealer holds an extra card', SP.bennyDealerHand === 6, SP.bennyDealerHand);
  ok('gear can lift a stat over an event threshold', !SP.gateBase && SP.gateGear);
  ok('SPECIAL shows on the setup screen, bio cards, the Mojave Express and the in-run kit', SP.setupPanel && SP.bio && SP.office && SP.kit);

  // A real click-through: story card, Deal in, wager button, confirm, play the opening with real clicks.
  await page.evaluate(() => { window.__noFlip = false; meta.opt.confirm = false; meta.char = 'chevy'; meta.run = null; meta.decksUnlocked = 8; meta.newRun = { deck: 'plain', tier: 'copper', token: null, seed: 'clicks' }; startRun(); meta.caps = 40; screen = 'road'; render(); });
  await page.click('[data-runstoryok]'); await page.click('[data-runplay]'); await page.waitForSelector('[data-wager="5"]'); await page.click('[data-wager="5"]'); await page.click('[data-runconfirm]'); await page.waitForSelector('.hand');
  ok('clicking through to a match takes the wager', await page.evaluate(() => screen === 'match' && meta.caps === 35 && document.body.innerHTML.includes('wager 5')));
  const flip = await page.evaluate(() => ({ shown: !!document.getElementById('capflip'), first: G.first, turn: G.turn, flipped: G.flipped }));
  ok('a cap flip decides who opens each hand (and the dealer plays first on tails)', flip.shown && flip.flipped && ['p', 'a'].includes(flip.first) && flip.turn === flip.first, JSON.stringify(flip));
  await page.click('#capflip'); await page.waitForFunction(() => !document.getElementById('capflip'));
  const tut = await page.evaluate(() => { const g = newTutorial('road'); return g.turn === 'p' && !g.flipped; });
  ok('tutorials never flip: you always go first', tut);
  for (let i = 0; i < 3; i++) {
    await page.waitForFunction(() => G && G.turn === 'p' && !busy);
    await page.click('.hand .card-btn:has(.card:not(.face):not(.joker):not(.legend))');
    await page.click('.lane.can[data-side="p"]');
    await page.waitForTimeout(1300);
  }
  ok('the opening can be played with real clicks', await page.evaluate(() => G.setupLeft.p === 0));

  // ---- achievements, rewards, props ----
  const AR = await page.evaluate(() => {
    const o = {};
    // every achievement pays something real: NCR dollars or a small voucher, and hard ones pay more
    o.unpaid = ACH.filter((a) => !achNCR(a) && !achCaps(a) && !backReward(a.id)).map((a) => a.id);
    o.ids = new Set(ACH.map((a) => a.id)).size === ACH.length;
    o.badPay = Object.keys(ACH_NCR).concat(Object.keys(ACH_VOUCH)).filter((id) => !ACH.some((a) => a.id === id));
    o.hardPays = achNCR('deck_gold3') >= 15 && achNCR('flawless') >= 8 && achNCR('exact26') <= 2;
    o.gnr = LOOKS.back.find((b) => b.id === 'gnr').unlock === 'threedog';
    // paying: NCR lands in the wallet once, with a toast-free unlock
    achSilent = true; meta.ach = {}; meta.scrip = 0;
    unlock('flawless'); unlock('flawless');
    o.paid = meta.scrip === achNCR('flawless');
    const before = meta.scrip; unlock('first_win'); o.tiny = meta.scrip === before && meta.capVouch.some((v) => v.id === 'first_win');
    // gated cosmetics: locked until the achievement, and a locked pick falls back to the default
    meta.ach = {}; meta.look.unlocked = []; meta.look.font = 'western'; applyLook(); o.fall = meta.look.font === 'deco';
    meta.ach.champ1 = 1; meta.look.font = 'western'; applyLook(); o.keep = meta.look.font === 'western';
    // the old-save grandfather: a save that was using a now-gated mat keeps it
    o.gated = ['font', 'face', 'mat'].every((k) => LOOKS[k].some((x) => x.unlock)) && LOOKS.face.find((x) => x.id === 'contrast').unlock === undefined;
    // progress UI
    meta.ach = {}; meta.st = Object.assign(meta.st || {}, { wins: 7 }); meta.stripBy = ['vladmira'];
    screen = 'ach'; render(); o.near = document.body.innerHTML.includes('Closest to unlocking');
    o.td = charProgress('threedog') && charProgress('threedog')[0] === 1;
    return o;
  });
  ok('every achievement pays NCR dollars or a tutorial voucher, and every reward id is real', AR.unpaid.length === 0 && AR.ids && AR.badPay.length === 0, AR.unpaid.concat(AR.badPay).join(','));
  ok('rewards scale with difficulty, and Galaxy News Radio comes from Three Dog', AR.hardPays && AR.gnr);
  ok('an achievement pays its NCR dollars exactly once; tutorial steps pay a voucher instead', AR.paid && AR.tiny);
  ok('fonts, card faces and mats are achievement rewards (High contrast stays free), and a locked pick falls back', AR.gated && AR.fall && AR.keep);
  ok('the achievements screen lists what is closest to unlocking, and Three Dog shows 1 / 3', AR.near && AR.td);
  const PR = await page.evaluate(async () => {
    meta.propsUnlocked = TABLE_PROPS.map((p) => p.id); meta.look.props = ['badge', 'dice', 'watch'];
    loadPropFiles();
    await new Promise((r) => setTimeout(r, 800));
    return { files: TABLE_PROPS.filter((p) => PROP_FILE[p.id]).length, total: TABLE_PROPS.length, on: PROPS_ON, html: (tablePropsHTML().match(/class="tprop/g) || []).length };
  });
  ok('all twelve table props load from props/<id>.webp and three sit on the table', PR.on && PR.files === PR.total && PR.html === 3, `${PR.files}/${PR.total}, ${PR.html} on table`);

  // ---- the simulation bot ----
  const botPage = await browser.newPage();
  await botPage.goto('file://' + path.resolve(__dirname, '..', 'index.html')); await botPage.waitForTimeout(1200);
  await botPage.addScriptTag({ path: path.join(__dirname, 'bot.js') });
  const bots = await botPage.evaluate(() => {
    const res = { ran: 0, bad: [], abil: {} };
    for (const ch of CHAR_ORDER) for (const skill of ['regular', 'expert']) for (let k = 0; k < 2; k++) {
      const r = BOT.runOne({ seed: `smoke-${ch}-${skill}-${k}`, char: ch, skill, learned: { perk: {}, rule: {} } });
      res.ran++; if (!['won', 'lost'].includes(r.result) || r.errors.length) res.bad.push(`${ch}/${skill}: ${r.result} ${r.errors[0] || ''}`.slice(0, 160));
      for (const [a, n] of Object.entries(r.abil)) { const key = ch + ':' + a; res.abil[key] = (res.abil[key] || 0) + n; }
    }
    return res;
  });
  ok('the bot finishes runs as every character at regular and expert skill, with no errors', bots.ran === 48 && bots.bad.length === 0, bots.bad[0] || `${bots.ran} runs`);
  ok('the bot really uses abilities (Greg’s hug, Chevy’s turret, chems)', (bots.abil['greg:hug'] || 0) > 0 && (bots.abil['chevy:turret'] || 0) > 0 && Object.keys(bots.abil).some((k) => k.endsWith(':chem')), JSON.stringify(Object.fromEntries(Object.entries(bots.abil).filter(([k]) => /greg:hug|chevy:turret/.test(k)))));
  ok('no script errors in the whole session', errors.length === 0, errors[0] || '');
  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
