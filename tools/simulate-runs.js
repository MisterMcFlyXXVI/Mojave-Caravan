#!/usr/bin/env node
// Plays many whole Road runs with the bot in tools/bot.js and prints a balance report.
//
//   node tools/simulate-runs.js --runs 120 --workers 4
//   node tools/simulate-runs.js --runs 200 --tier silver --out silver.json
//   node tools/simulate-runs.js --compare before.json after.json
//
// Options: --runs N  --workers N  --tier copper|silver|gold  --deck plain|...  --char <id>|all
//          --gear random (random loadouts)  --noise N (bot sloppiness, default 5)  --prefix TEXT (seed prefix)  --out FILE  --min N (min sample)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(0) + '%' : '-');
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function bossTable(runs, min) {
  const m = {};
  for (const r of runs) for (const t of r.tables) {
    if (t.boss == null) continue;
    const b = (m[t.boss] = m[t.boss] || { faced: 0, won: 0, sig: t.sig });
    b.faced++; if (t.won) b.won++;
  }
  return Object.entries(m).filter(([, b]) => b.faced >= min).sort((a, b) => a[1].won / a[1].faced - b[1].won / b[1].faced);
}

function report(runs, min) {
  const won = runs.filter((r) => r.result === 'won');
  const lines = [];
  lines.push(`Runs: ${runs.length}   reached Vegas: ${pct(won.length, runs.length)}   avg stop reached: ${avg(runs.map((r) => r.stop + (r.result === 'won' ? 1 : 0))).toFixed(2)}   avg hands: ${avg(runs.map((r) => r.hands)).toFixed(1)}   avg caps left: ${avg(runs.map((r) => r.caps)).toFixed(0)}`);
  const stuck = runs.filter((r) => r.result === 'stuck').length, errs = runs.reduce((n, r) => n + r.errors.length, 0);
  if (stuck || errs) lines.push(`!! ${stuck} stuck runs, ${errs} script errors`);
  const death = {};
  for (const r of runs) if (r.result === 'lost') { const k = `stop ${r.stop + 1}, ${['Saloon', 'High Stakes', 'Boss'][r.table]}`; death[k] = (death[k] || 0) + 1; }
  lines.push('\nWhere runs end (losses):');
  for (const [k, v] of Object.entries(death).sort((a, b) => b[1] - a[1])) lines.push(`  ${k.padEnd(24)} ${String(v).padStart(4)}  ${pct(v, runs.length)}`);
  lines.push('\nBoss tables (hardest first):');
  for (const [name, b] of bossTable(runs, min)) lines.push(`  ${name.padEnd(28)} faced ${String(b.faced).padStart(3)}   won ${pct(b.won, b.faced).padStart(4)}${b.sig ? '   sig: ' + b.sig : ''}`);
  // Perk effect, controlled for difficulty: at every table, compare the actual result with the win rate
  // everyone had at that same stop and table type. "lift" is how many points per table that perk adds.
  const cell = {};
  for (const r of runs) for (const t of r.tables) { const c = (cell[t.s + ':' + t.t] = cell[t.s + ':' + t.t] || { n: 0, w: 0 }); c.n++; if (t.won) c.w++; }
  const perks = {};
  for (const r of runs) for (const t of r.tables) { const c = cell[t.s + ':' + t.t]; for (const p of t.perks || []) { const x = (perks[p] = perks[p] || { n: 0, w: 0, e: 0, runs: new Set() }); x.n++; x.e += c.w / c.n; if (t.won) x.w++; x.runs.add(r.seed); } }
  lines.push(`\nPerks, per table played with them (min ${min * 4} tables). lift = win rate minus what that stop/table normally gives:`);
  for (const [id, x] of Object.entries(perks).filter(([, x]) => x.n >= min * 4).sort((a, b) => (b[1].w - b[1].e) / b[1].n - (a[1].w - a[1].e) / a[1].n)) {
    const lift = (100 * (x.w - x.e)) / x.n;
    lines.push(`  ${id.padEnd(12)} tables ${String(x.n).padStart(4)}  runs ${String(x.runs.size).padStart(3)}   won ${pct(x.w, x.n).padStart(4)}   lift ${(lift >= 0 ? '+' : '') + lift.toFixed(1)} pts`);
  }
  if (runs.some((r) => r.gear && r.gear.length)) {
    // Gear is handed out at random, so with-vs-without is a fair comparison (unlike perks, which you choose).
    const vegas = (r) => (r.result === 'won' ? 1 : 0), byGear = {};
    for (const r of runs) for (const id of r.gear || []) (byGear[id] = byGear[id] || []).push(r);
    const rows = Object.entries(byGear).filter(([, rs]) => rs.length >= min * 4).map(([id, rs]) => {
      const without = runs.filter((r) => !(r.gear || []).includes(id));
      const w = rs.filter(vegas).length / rs.length, wo = without.filter(vegas).length / without.length;
      return { id, n: rs.length, w, lift: 100 * (w - wo) };
    }).sort((a, b) => b.lift - a.lift);
    lines.push(`\nGear (random loadouts, min ${min * 4} runs). lift = Vegas rate with it minus without; noise is about +-5 points:`);
    for (const x of rows) lines.push(`  ${x.id.padEnd(12)} runs ${String(x.n).padStart(4)}   vegas ${pct(Math.round(x.w * x.n), x.n).padStart(4)}   lift ${(x.lift >= 0 ? '+' : '') + x.lift.toFixed(1)} pts`);
  }
  const chars = {};
  for (const r of runs) { const x = (chars[r.char] = chars[r.char] || { n: 0, won: 0, stop: [] }); x.n++; if (r.result === 'won') x.won++; x.stop.push(r.stop + (r.result === 'won' ? 1 : 0)); }
  if (Object.keys(chars).length > 1) {
    lines.push('\nBy character:');
    for (const [id, x] of Object.entries(chars).sort((a, b) => avg(b[1].stop) - avg(a[1].stop))) lines.push(`  ${id.padEnd(14)} runs ${String(x.n).padStart(3)}   vegas ${pct(x.won, x.n).padStart(4)}   avg stop ${avg(x.stop).toFixed(2)}`);
  }
  return lines.join('\n');
}

function compare(a, b, min) {
  const A = Object.fromEntries(bossTable(a, min)), Bt = Object.fromEntries(bossTable(b, min));
  const rate = (x) => x.won / x.faced;
  console.log(`Overall Vegas rate: ${pct(a.filter((r) => r.result === 'won').length, a.length)} -> ${pct(b.filter((r) => r.result === 'won').length, b.length)}`);
  console.log(`Avg stop reached:   ${avg(a.map((r) => r.stop + (r.result === 'won' ? 1 : 0))).toFixed(2)} -> ${avg(b.map((r) => r.stop + (r.result === 'won' ? 1 : 0))).toFixed(2)}\n`);
  console.log('Boss win rate (player), before -> after:');
  for (const name of new Set([...Object.keys(A), ...Object.keys(Bt)])) {
    const x = A[name], y = Bt[name];
    console.log(`  ${name.padEnd(28)} ${x ? pct(x.won, x.faced) + ` (n=${x.faced})` : '-'}  ->  ${y ? pct(y.won, y.faced) + ` (n=${y.faced})` : '-'}${y && y.sig ? '   sig: ' + y.sig : ''}`);
  }
}

(async () => {
  const min = +opt('min', 5);
  const cmp = args.indexOf('--compare');
  if (cmp >= 0) return compare(JSON.parse(fs.readFileSync(args[cmp + 1])), JSON.parse(fs.readFileSync(args[cmp + 2])), min);

  const runsN = +opt('runs', 60), workers = Math.max(1, +opt('workers', 4)), tier = opt('tier', 'copper'), deck = opt('deck', 'plain');
  const charOpt = opt('char', 'all'), noise = +opt('noise', 5), prefix = opt('prefix', 'SIM'), gearOpt = opt('gear', 'none'), nosp = args.includes('--nosp');
  const browser = await chromium.launch();
  const url = 'file://' + path.resolve(__dirname, '..', 'index.html');
  const results = [], t0 = Date.now();
  let next = 0;
  const jobs = Array.from({ length: runsN }, (_, i) => i);
  await Promise.all(Array.from({ length: workers }, async () => {
    const page = await browser.newPage();
    page.setDefaultTimeout(0);
    await page.goto(url);
    await page.addScriptTag({ path: path.join(__dirname, 'bot.js') });
    const order = await page.evaluate(() => CHAR_ORDER);
    while (next < jobs.length) {
      const i = jobs[next++];
      const char = charOpt === 'all' ? order[i % order.length] : charOpt;
      const r = await page.evaluate((o) => BOT.runOne(o), { seed: `${prefix}${i}`, char, tier, deck, noise, gear: gearOpt, nosp });
      results.push(r);
      if (results.length % 10 === 0) process.stderr.write(`  ${results.length}/${runsN} runs (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
    }
    await page.close();
  }));
  await browser.close();
  results.sort((a, b) => (a.seed < b.seed ? -1 : 1));
  const o = opt('out', null);
  if (o) fs.writeFileSync(o, JSON.stringify(results));
  console.log(`${tier} road, ${deck} deck, bot noise ${noise}, ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
  console.log(report(results, min));
})();
