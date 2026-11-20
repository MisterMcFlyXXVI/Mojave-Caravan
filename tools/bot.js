// A bot that plays whole Road runs using the real game code. simulate-runs.js injects this into the page.
//
// Three skill levels, so balance can be judged for different players:
//   novice   plays hands with the dealer AI's move chooser and shops at random. No abilities, chems, wagers or swaps.
//   regular  also uses character abilities, companions, gear actives, chems and Legend cards, takes small wagers,
//            and buys perks by rarity.
//   scout    regular play with random perk choices; used by --learn so perk values aren't biased by the bot's own picks.
//   noperk   regular play that never takes a perk or boss reward perk (compare with regular to measure perk dependence).
//   expert   sharper play (holds Kings), buys perks from measured value (tools/data/learned.json), swaps dangerous
//            boss rules, skips dangerous tables, sells weak perks, rerolls, and sizes wagers to the risk.
//
// Everything goes through the game's own functions or synthetic clicks on its own handlers, so the bot can't
// drift away from the real rules. Results are for comparing versions and spotting outliers, not for predicting
// human win rates.
(function () {
  const queue = [];
  // The game schedules dealer turns and toasts with setTimeout. Run them in order, instantly.
  window.setTimeout = (f) => { queue.push(f); return queue.length; };
  const pump = () => {
    let n = 0;
    while (queue.length && n++ < 20000) {
      const f = queue.shift();
      try { f(); } catch (e) { BOT.errors.push(String((e && e.stack) || e)); }
    }
  };
  // Silence everything visual or networked.
  for (const n of ['render', 'sfx', 'buzz', 'toast', 'legendFlash', 'sigFlash', 'flyToDeck', 'save', 'afterRender', 'schedulePush'])
    if (typeof window[n] === 'function') window[n] = () => {};

  const BOT = (window.BOT = { errors: [] });
  const app = document.querySelector('#app');

  // Click the game's own handlers: a button with data attributes, or a lane/entry element.
  function fire(attr) {
    const b = document.createElement('button');
    for (const [k, v] of Object.entries(attr)) b.dataset[k] = v;
    app.appendChild(b); b.dispatchEvent(new MouseEvent('click', { bubbles: true })); b.remove();
  }
  function fireOn(cls, data) {
    const d = document.createElement('div'); d.className = cls;
    for (const [k, v] of Object.entries(data)) d.dataset[k] = v;
    app.appendChild(d); d.dispatchEvent(new MouseEvent('click', { bubbles: true })); d.remove();
  }

  const SKILLS = {
    novice:  { noise: 5, abilities: false, chems: false, perks: 'random', wager: 'none',  swap: false, skip: false, style: null,                  smartShop: false },
    regular: { noise: 4, abilities: true,  chems: true,  perks: 'rarity', wager: 'small', swap: false, skip: false, style: { king: 3 },            smartShop: true },
    scout:   { noise: 4, abilities: true,  chems: true,  perks: 'random', wager: 'none',  swap: false, skip: false, style: { king: 3 },            smartShop: true },   // regular play, random perks: for measuring
    noperk:  { noise: 4, abilities: true,  chems: true,  perks: 'none',   wager: 'small', swap: false, skip: false, style: { king: 3 },            smartShop: true },   // regular play that never takes a perk: measures how much perks matter
    expert:  { noise: 2, abilities: true,  chems: true,  perks: 'learned', wager: 'smart', swap: true,  skip: true,  style: { king: 6, jack: 2 }, smartShop: true },
  };
  const RAR = { common: 1, uncommon: 2, rare: 3, legendary: 4 };

  const cardScore = (c) =>
    (c.rank === 'K' ? 8 : c.rank === 'JK' ? 6 : c.rank === 'J' ? 5 : c.rank === 'Q' ? 3 : 0.5 * val(c)) +
    (c.mod ? 2 : 0) + (c.ed ? 2 : 0);

  function resolvePickers(r) {
    let guard = 0;
    while (r.picker && guard++ < 10) {
      const pk = r.picker;
      if (pk.kind === 'bundle') {
        const ranked = pk.options.map((c, i) => ({ i, s: cardScore(c) })).sort((a, b) => b.s - a.s);
        pk.sel = ranked.filter((x) => x.s >= 3.5).slice(0, pk.keep).map((x) => x.i);
      } else {
        const room = Math.min(pk.keep, burnRoom());
        const ranked = meta.deck.map((c, i) => ({ i, s: cardScore(c) })).sort((a, b) => a.s - b.s);
        pk.sel = ranked.filter((x) => x.s < 2.3).slice(0, room).map((x) => x.i);
      }
      pickerDone();
    }
  }

  BOT.runOne = function (o) {
    if (o.nosp) for (const g of Object.values(GEAR)) g.sp = {};     // experiment: gear without its stat modifiers
    const S = SKILLS[o.skill || 'novice'];
    const noise = o.noise != null ? o.noise : S.noise;
    const learned = o.learned || { perk: {}, rule: {} };
    meta = migrate(freshMeta());
    meta.decksUnlocked = DECKS.length;
    meta.deckTiers = {};
    DECKS.forEach((d) => (meta.deckTiers[d.id] = 3));
    meta.charFlags = { noChem: 1, silver: 1, vault: 1, harold: 1 };
    meta.stripBy = CHAR_ORDER.slice();
    meta.tokens = [];
    meta.char = o.char;
    meta.gear = { owned: [], on: {} };
    if (o.gear === 'random') {                                   // each slot: 70% chance of a random piece
      const G0 = mulberry32(hashStr(o.seed + '|gear')), owned = Object.keys(GEAR).filter((id) => !GEAR[id].wc);
      meta.gear.owned = owned;
      for (const sl of GEAR_SLOTS) { const items = owned.filter((id) => GEAR[id].slot === sl.id); if (G0() < 0.7) meta.gear.on[sl.id] = items[Math.floor(G0() * items.length)]; }
    }
    meta.newRun = { deck: o.deck || 'plain', tier: o.tier || 'copper', token: null, seed: o.seed };
    G = null; screen = 'road';
    queue.length = 0;
    startRun();

    const B = mulberry32(hashStr(o.seed + '|bot'));            // the bot's own decisions
    const pickPerk = o.perkChance == null ? 0.85 : o.perkChance;
    const out = { seed: o.seed, char: o.char, skill: o.skill || 'novice', deck: meta.run.deck, tier: meta.run.tier, tables: [], result: null, abil: {}, skips: 0, swaps: 0 };
    const shuffled = (a) => a.map((x) => [B(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
    const bump = (k, n = 1) => { out.abil[k] = (out.abil[k] || 0) + n; };

    // ---- what a perk or rule is worth, from measured data where we have it ----
    const perkValue = (id) => {
      if (S.perks === 'learned' && learned.perk[id] != null) return learned.perk[id];
      return RAR[PERK_RARITY[id] || 'common'] * 2 - 4;           // rarity fallback, roughly -2..+4 points
    };
    const danger = (ids) => (ids || []).reduce((a, id) => a + Math.max(0, -(learned.rule[id] || 0)), 0) / 100;

    function claimBossReward(r) {
      if (!r.bossPick || !r.bossPick.length) return;
      if (S.perks !== 'none' && meta.perks.length < perkSlots()) {
        const id = S.perks === 'random' ? r.bossPick[Math.floor(B() * r.bossPick.length)] : r.bossPick.slice().sort((a, b) => perkValue(b) - perkValue(a))[0];
        handleRunClick({ bosspick: id });
      } else handleRunClick({ bossskip: '' });
    }

    // ---------- the trading post ----------
    function buyPerks(r, of) {
      if (S.perks === 'none') return;
      const slots = () => perkSlots() - meta.perks.length;
      const idx = of.perks.map((_, i) => i).filter((i) => !of.sold['perk' + i]);
      if (S.perks === 'random') {
        for (const i of shuffled(idx)) {
          if (slots() <= 0) break;
          if (meta.caps < perkRunPrice(of.perks[i]) || B() > pickPerk) continue;
          runShopBuy('perk' + i);
        }
        return;
      }
      const ranked = idx.sort((a, b) => perkValue(of.perks[b]) - perkValue(of.perks[a]));
      for (const i of ranked) {
        const id = of.perks[i], price = perkRunPrice(id);
        if (slots() <= 0 && S.perks === 'learned' && meta.perks.length) {       // swap a weak perk for a clearly better one
          const worst = meta.perks.slice().sort((a, b) => perkValue(a) - perkValue(b))[0];
          if (perkValue(id) >= perkValue(worst) + 2 && meta.caps + perkSellPrice(worst) >= price) {
            handleRunClick({ rsellperk: worst }); handleRunClick({ rsellperk: worst });
          }
        }
        if (slots() <= 0 || meta.caps < price) continue;
        if (S.perks === 'learned' && perkValue(id) < -2 && B() < 0.8) continue;  // don't buy perks that measure as bad
        runShopBuy('perk' + i);
      }
    }

    function doShop(r) {
      resolvePickers(r);
      const of = r.offers;
      if (of) {
        buyPerks(r, of);
        if (S.smartShop) {
          // free and paid workbench upgrades go on a high plain number card
          let guard = 0;
          while (guard++ < 3 && (r.freeUpgrade > 0 || (S.perks === 'learned' && meta.caps >= disc(6) + 20 && !of.sold.upgrade))) {
            runShopBuy('upgrade');
            if (!r.workbench) break;
            const plain = meta.deck.map((c, i) => ({ c, i })).filter((x) => isNum(x.c) && !x.c.mod).sort((a, b) => val(b.c) - val(a.c));
            if (plain.length) handleRunClick({ wbpick: plain[Math.floor(B() * Math.min(4, plain.length))].i }); else { r.workbench = null; break; }
          }
          // chems worth carrying
          if (S.chems) for (let i = 0; i < of.chems.length; i++) {
            const id = of.chems[i];
            if (['coffee', 'buff', 'shoe', 'fresh', 'medx'].includes(id) && chemTotal() < chemMax() && meta.caps >= chemRunPrice(id) + 8 && !of.sold['chem' + i]) runShopBuy('chem' + i);
          }
          // Legend cards are strong; buy one when it's offered and affordable
          if (of.legend && LEGENDS[of.legend] && meta.caps >= disc(LEGEND_PRICE[LEGENDS[of.legend].rar].caps) + 10 && !of.sold.legend) runShopBuy('legend');
        }
        for (let i = 0; i < of.bundles.length; i++) {
          const price = disc(BUNDLES[of.bundles[i].id].price);
          if (of.sold['bundle' + i] || meta.caps < price + 5 || B() > 0.7) continue;
          runShopBuy('bundle' + i); resolvePickers(r);
        }
        if (meta.deck.length > 38 && meta.caps >= disc(3) && !r.burnUsed && burnRoom()) { runShopBuy('burn'); resolvePickers(r); }
        // expert: if nothing good turned up, one reroll
        if (S.perks === 'learned' && meta.perks.length < perkSlots() && !r.rerolled && meta.caps >= rerollCost() + 25 && of.perks.every((id) => perkValue(id) < 0 || of.sold['perk' + of.perks.indexOf(id)])) {
          r.rerolled = true; handleRunClick({ rreroll: '' }); if (r.offers) buyPerks(r, r.offers);
        }
      }
      r.rerolled = false; r.phase = 'table'; r.halfShop = false;
    }

    function doEvent(r) {
      const ev = EVENTS[r.event];
      if (ev) {
        const ok = ev.choices.map((c, i) => ({ c, i }))
          .filter(({ c }) => (!c.cost || meta.caps >= c.cost) && (!c.req || statOf(c.req[0]) >= c.req[1]));
        if (ok.length) {
          const gated = ok.filter((x) => x.c.req);
          const pick = gated.length && B() < 0.6 ? gated[Math.floor(B() * gated.length)] : ok[Math.floor(B() * ok.length)];
          eventChoose(pick.i);
          resolvePickers(r);
        }
      }
      eventDone();
    }

    // ---------- inside a hand ----------
    const handCan = (ci) => legalMoves(G, 'p').some((m) => m.ci === ci && m.t !== 'discard' && m.t !== 'disband');
    const evalNow = () => evalState(G, 'p');
    const ready = () => G && !G.over && G.turn === 'p' && !busy && G.setupLeft.p === 0;
    const dealerFaces = () => G.a.cv.reduce((n, cv) => n + cv.reduce((m, e) => m + e.faces.length, 0), 0);
    const inRangeLanes = () => [0, 1, 2].filter((l) => inR(cvValue(G.p.cv[l]), G.rules.range.p)).length;

    function legendOk(id) {
      switch (id) {
        case 'prime': return dealerFaces() >= 2;
        case 'redryder': return dealerFaces() >= 1;
        case 'stranger': return G.a.cv.filter((cv) => cv.length).length >= 2;
        case 'house': case 'mesmetron': return G.a.hand.length >= 3;
        case 'quantum': return G.p.hand.length <= 4;
        case 'stealth': return inRangeLanes() >= 1;
        case 'platinum': return [0, 1, 2].some((l) => cvValue(G.p.cv[l]) >= 16);
        case 'plasma': return Math.max(...G.a.cv.map((cv) => cvValue(cv))) >= 15;
        case 'bobble': return G.p.cv.some((cv) => cv.some((e) => e.faces.some((f) => f.rank === 'K')));
        default: return true;
      }
    }
    function legendTarget(id) {   // best lane/index for a Legend that needs a target, scored with the dealer AI's evaluation
      const base = evalNow(); let best = null;
      for (let l = 0; l < 3; l++) {
        const cv = G.a.cv[l]; if (!cv.length) continue;
        const tries = id === 'fatman' || id === 'yesman' ? [null] : cv.map((_, i) => i);
        for (const idx of tries) {
          const g2 = clone(G);
          if (id === 'fatman') g2.a.cv[l] = [];
          else if (id === 'repeater') g2.a.cv[l].splice(idx, 1);
          else if (id === 'alienblaster') { const v = val(cv[idx].card); for (let k = 0; k < 3; k++) g2.a.cv[k] = g2.a.cv[k].filter((x) => val(x.card) !== v); }
          else if (id === 'yesman') { const t = g2.p.cv[l]; g2.p.cv[l] = g2.a.cv[l]; g2.a.cv[l] = t; }
          const gain = evalState(g2, 'p') - base;
          if (!best || gain > best.gain) best = { lane: l, idx, gain };
        }
      }
      return best;
    }
    function useChems() {
      if (!S.chems || G.chemTurn) return false;
      const have = (id) => (meta.chems[id] || 0) > 0;
      const dead = G.p.hand.filter((c, i) => !c.legend && !handCan(i)).length;
      const hasKing = G.p.hand.some((c) => c.rank === 'K');
      let id = null;
      if (have('medx') && G.runTable === 2 && !G.rules.jackproof.p) id = 'medx';
      else if (have('buff') && hasKing && !G.buffed) id = 'buff';
      else if (have('fresh') && dead >= 3 && G.p.deck.length > 8) id = 'fresh';
      else if (have('shoe') && G.p.hand.length <= 3 && G.p.deck.length) id = 'shoe';
      else if (have('coffee') && !G.extra && G.p.hand.some((c) => !isNum(c) && !c.legend)) id = 'coffee';
      if (!id) return false;
      useChem(id); bump('chem'); return true;
    }
    function freeActions() {
      let n = 0;
      while (n++ < 14 && ready()) {
        if (G.char === 'greg' && !G.hugUsed) { fire({ hug: '' }); bump('hug'); continue; }
        if (G.ede && !G.zapUsed && G.a.hand.length) { fire({ zap: '' }); bump('zap'); continue; }
        if (G.char === 'harold' && !G.regrowUsed && G.lastLost) {
          const g2 = clone(G); g2.p.cv[G.lastLost.lane].push(clone(G.lastLost.e));
          if (evalState(g2, 'p') - evalNow() > 8) { fire({ regrow: '' }); bump('regrow'); continue; }
        }
        if (G.bat && !G.batUsed) {
          const base = evalNow(); let bl = -1, bg = 12;
          for (let l = 0; l < 3; l++) if (G.p.cv[l].length) { const g2 = clone(G); g2.p.cv[l].pop(); const gain = evalState(g2, 'p') - base; if (gain > bg) { bg = gain; bl = l; } }
          if (bl >= 0) { fire({ bat: '' }); fireOn('lane', { side: 'p', lane: String(bl) }); bump('bat'); continue; }
        }
        if (G.char === 'threedog' && !G.requestUsed && G.p.deck.length) {
          const dead = G.p.hand.findIndex((c, i) => !c.legend && !handCan(i));
          if (dead >= 0) { sel = dead; fire({ request: '' }); sel = null; bump('request'); continue; }
        }
        // Legend cards
        const li = G.p.hand.findIndex((c) => {
          if (!c.legend || !LEGENDS[c.legend]) return false;
          if (!LEGENDS[c.legend].target) return legendOk(c.legend);
          const t = legendTarget(c.legend); return t && t.gain > 15;
        });
        if (li >= 0) {
          const id = G.p.hand[li].legend;
          if (LEGENDS[id].target) { const t = legendTarget(id); playLegend(li, t.lane, t.idx == null ? null : t.idx); } else playLegend(li, null);
          bump('legend'); continue;
        }
        if (useChems()) continue;
        break;
      }
    }
    function chooseMain(noise, P) {
      const extra = [];
      if (S.abilities && G.setupLeft.p === 0) {
        if (G.char === 'chevy' && !G.turretUsed) for (let l = 0; l < 3; l++) if (G.a.cv[l].length) extra.push({ t: 'turret', lane: l });
        if (G.comp === 'boone' && !G.booneUsed) for (let l = 0; l < 3; l++) if (G.a.cv[l].some((e) => e.faces.some((f) => f.rank === 'K' || f.rank === 'Q'))) extra.push({ t: 'boone', lane: l });
      }
      let best = null, bs = -Infinity;
      for (const m of legalMoves(G, 'p').concat(extra)) {
        const g2 = clone(G); applyMove(g2, 'p', m, true);
        const cost = m.t === 'turret' || m.t === 'boone' ? 0 : moveCost(G, 'p', m, P);
        const sc = evalState(g2, 'p', P) - cost + Math.random() * noise;
        if (sc > bs) { bs = sc; best = m; }
      }
      return best;
    }

    function playMatch(r) {
      const P = S.style;
      let plies = 0, lastPre = null;
      withSeedStr(r.seed + '|play|' + r.hands, () => {          // AI noise and draws repeat for the same seed and path
        while (G && !G.over && plies++ < 700) {
          pump();
          if (!G || G.over) break;
          if (G.turn !== 'p') { busy = false; aiTurn(); continue; }
          if (S.abilities && G.setupLeft.p === 0) {
            // Snip Snip: if the dealer's reply hurt a lot, take the last turn back
            if (G.char === 'snipsnip' && !G.repairUsed && undoStack.length && lastPre != null && evalNow() < lastPre - 35) {
              busy = false; fire({ repair: '' }); bump('repair'); lastPre = null; continue;
            }
            // walk away from a lost table (Pre-War Sneakers): no Grit lost
            if (G.canWalk && plies > 12 && evalNow() < -140) { busy = false; fire({ walk: '' }); bump('walk'); break; }
            freeActions();
            if (G.over) break;
            if (!ready()) continue;
          } else if (G.setupLeft.p === 0) {                       // novice: only the Legends that need no target
            const ci = G.p.hand.findIndex((c) => c.legend && LEGENDS[c.legend] && !LEGENDS[c.legend].target);
            if (ci >= 0) { busy = false; playLegend(ci, null); if (G.over) break; continue; }
          }
          const m = chooseMain(noise, P);
          if (!m) { finish('a', 'bot has no move'); break; }
          lastPre = G.setupLeft.p === 0 ? evalNow() : null;
          busy = false;
          if (m.t === 'turret') bump('turret'); else if (m.t === 'boone') bump('boone');
          playerMove(m);
        }
        pump();
      });
      return plies;
    }

    // wagers, swaps, skips
    function planTable(r) {
      const s = r.stop, t = r.table, rules = tableRuleIds(s, t), d = danger(rules);
      // swap the nastiest boss rule for a better one
      if (S.swap && t === 2 && !(r.swapUsed || {})[s] && Object.keys(learned.rule).length) {
        const own = r.bosses[s] || []; let wi = -1, wd = 0.04;
        own.forEach((id, i) => { const dd = Math.max(0, -(learned.rule[id] || 0)) / 100; if (dd > wd) { wd = dd; wi = i; } });
        if (wi >= 0 && meta.caps >= bossSwapCost(s) + 15) {
          handleRunClick({ rulesw: String(wi) });
          if (r.swapPick) {
            const opts = r.swapPick.opts.slice().sort((a, b) => Math.max(0, -(learned.rule[a] || 0)) - Math.max(0, -(learned.rule[b] || 0)));
            if (opts.length && Math.max(0, -(learned.rule[opts[0]] || 0)) / 100 < wd - 0.02) { handleRunClick({ rulepick: opts[0] }); out.swaps++; } else handleRunClick({ rulekeep: '' });
          }
        }
      }
      // skip a dangerous Saloon/High Stakes table (also when out of Grit)
      if (S.skip && t < 2 && Object.keys(learned.rule).length && (d > 0.2 || ((r.grit || 0) === 0 && d > 0.12))) { skipTable(); out.skips++; return false; }
      // wager
      r.wagerSel = 0;
      if (S.wager !== 'none') {
        const mx = wagerMax(s);
        if (S.wager === 'small') { if (meta.caps >= 30) r.wagerSel = Math.min(5, mx); }
        else if (d < 0.12 && (t < 2 || meta.caps >= 60)) { const opts = [5, 10, 20, 40].filter((x) => x <= mx && x <= Math.floor(meta.caps * 0.25)); r.wagerSel = opts.length ? opts[opts.length - 1] : 0; }
      }
      return true;
    }

    function doTable(r) {
      const s = r.stop, t = r.table;
      const perksAtDeal = [...meta.perks];
      if (!planTable(r)) return;
      const rules = tableRuleIds(s, t);
      const capsBefore = meta.caps;
      startRunTable();
      const boss = G.dealer && G.dealer.name;
      const sig = G.sig ? G.sig.id : null;
      const wager = G.wager || 0;
      const plies = playMatch(r);
      const won = !!(G && G.over && G.over.winner === 'p');
      const used = G ? ['turretUsed', 'hugUsed', 'regrowUsed', 'zapUsed', 'booneUsed', 'batUsed', 'repairUsed', 'requestUsed', 'quickUsed'].filter((k) => G[k]) : [];
      out.tables.push({ s, t, won, reason: G && G.over ? String(G.over.reason).replace(/\d+/g, 'N').slice(0, 40) : null, boss: t === 2 ? boss : null, plies, sig, sigFired: G && G.sig ? !!G.sig.fired : null, perks: perksAtDeal, rules, wager, used, dCaps: meta.caps - capsBefore });
      G = null; screen = 'road';
    }

    let guard = 0;
    while (meta.run && meta.run.phase !== 'over' && guard++ < 600) {
      const r = run();
      r.story = [];
      claimBossReward(r);
      if (r.phase === 'event') doEvent(r);
      else if (r.phase === 'shop') doShop(r);
      else if (r.phase === 'table') doTable(r);
      else break;
    }
    const r = run();
    out.result = r.result || 'stuck';
    out.stop = r.stop; out.table = r.table; out.tablesWon = r.won; out.hands = r.hands;
    out.caps = meta.caps; out.deckSize = meta.deck.length; out.perks = [...meta.perks]; out.gear = [...(r.gear || [])];
    out.errors = BOT.errors.splice(0);
    return out;
  };
})();
