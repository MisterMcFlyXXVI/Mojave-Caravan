// A bot that plays whole Road runs using the real game code. simulate-runs.js injects this into the page.
//
// What it does: deals in, plays every hand with the dealer AI's own move chooser (as the player), buys perks and
// bundles at the trading post, makes event choices, and claims boss rewards. What it doesn't do: use chems,
// companions, Legend targets, wagers or boss swaps. Treat its results as a baseline for "a competent but
// unimaginative player", good for comparing versions and spotting outliers, not for predicting human win rates.
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
    meta = migrate(freshMeta());
    meta.decksUnlocked = DECKS.length;
    meta.deckTiers = {};
    DECKS.forEach((d) => (meta.deckTiers[d.id] = 3));
    meta.charFlags = { noChem: 1, silver: 1, vault: 1, harold: 1 };
    meta.stripBy = CHAR_ORDER.slice();
    meta.tokens = [];
    meta.char = o.char;
    meta.gear = { owned: [], on: {} };
    meta.newRun = { deck: o.deck || 'plain', tier: o.tier || 'copper', token: null, seed: o.seed };
    G = null; screen = 'road';
    queue.length = 0;
    startRun();

    const B = mulberry32(hashStr(o.seed + '|bot'));            // the bot's own decisions
    const pickPerk = o.perkChance == null ? 0.85 : o.perkChance;
    const noise = o.noise == null ? 5 : o.noise;
    const out = { seed: o.seed, char: o.char, deck: meta.run.deck, tier: meta.run.tier, tables: [], result: null };
    const shuffled = (a) => a.map((x) => [B(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

    function claimBossReward(r) {
      if (!r.bossPick || !r.bossPick.length) return;
      if (meta.perks.length < perkSlots()) handleRunClick({ bosspick: r.bossPick[Math.floor(B() * r.bossPick.length)] });
      else handleRunClick({ bossskip: '' });
    }

    function doShop(r) {
      resolvePickers(r);
      const of = r.offers;
      if (of) {
        for (const i of shuffled(of.perks.map((_, i) => i))) {
          if (meta.perks.length >= perkSlots()) break;
          const id = of.perks[i];
          if (of.sold['perk' + i] || meta.caps < perkRunPrice(id) || B() > pickPerk) continue;
          runShopBuy('perk' + i);
        }
        for (let i = 0; i < of.bundles.length; i++) {
          const price = disc(BUNDLES[of.bundles[i].id].price);
          if (of.sold['bundle' + i] || meta.caps < price + 5 || B() > 0.7) continue;
          runShopBuy('bundle' + i); resolvePickers(r);
        }
        if (meta.deck.length > 38 && meta.caps >= disc(3) && !r.burnUsed && burnRoom()) { runShopBuy('burn'); resolvePickers(r); }
      }
      r.phase = 'table'; r.halfShop = false;
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

    function playMatch(r) {
      const P = o.style || null;
      let plies = 0;
      withSeedStr(r.seed + '|play|' + r.hands, () => {          // AI noise and draws repeat for the same seed and path
        while (G && !G.over && plies++ < 600) {
          pump();
          if (!G || G.over) break;
          if (G.turn !== 'p') { busy = false; aiTurn(); continue; }
          if (G.setupLeft.p === 0) {                           // play any Legend that needs no target
            const ci = G.p.hand.findIndex((c) => c.legend && LEGENDS[c.legend] && !LEGENDS[c.legend].target);
            if (ci >= 0) { busy = false; playLegend(ci, null); if (G.over) break; continue; }
          }
          const m = chooseAIMove(G, 'p', noise, P);
          if (!m) { finish('a', 'bot has no move'); break; }
          busy = false; playerMove(m);
        }
        pump();
      });
      return plies;
    }

    function doTable(r) {
      const s = r.stop, t = r.table;
      const perksAtDeal = [...meta.perks];
      startRunTable();
      const boss = G.dealer && G.dealer.name;
      const sig = G.sig ? G.sig.id : null;
      const plies = playMatch(r);
      const won = !!(G && G.over && G.over.winner === 'p');
      out.tables.push({ s, t, won, boss: t === 2 ? boss : null, plies, sig, sigFired: G && G.sig ? !!G.sig.fired : null, perks: perksAtDeal });
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
    out.caps = meta.caps; out.deckSize = meta.deck.length; out.perks = [...meta.perks];
    out.errors = BOT.errors.splice(0);
    return out;
  };
})();
