// ---- screens ----
const ruleChip=id=>`<span class="rb house-chip" title="${esc(BOSS_RULES[id].desc)}">${BOSS_RULES[id].name}</span>`;
function runHeaderHTML(){
  const r=run(),slots=perkSlots();
  return `<div class="charstrip"><img src="${portrait(r.char)}" alt=""><div><small>${esc(TIERS[tierIdx(r.tier)].name)} · ${esc(DECKS[deckIdx(r.deck)].name)}</small><b>${esc(CHARS[r.char].name)}</b>
      <span>${isWC()?`The Water Chip · ${r.days} days left · `:''}${inBeyond(r.stop)?`Beyond the Strip · mile ${mileOf(r.stop)}`:`Stop ${r.stop+1} of ${RUN_STOPS.length}`} · ${r.won} table${r.won===1?'':'s'} won · Grit ${'●'.repeat(r.grit||0)||'none'}${r.seed?(r.daily?' · Daily run':` · Seed ${esc(r.seed)}`):''}</span></div></div>
    <div class="hubbar">${capsHTML(meta.caps)}<button class="pill num kitpill" data-kitopen="deck">Deck ${meta.deck.length}${modCount()?` · ${modCount()} upgraded`:''}</button><button class="pill num kitpill" data-kitopen="perks">Perks ${meta.perks.length}/${slots}</button><button class="pill num kitpill" data-kitopen="chems">Chems ${chemTotal()}/${chemMax()}</button></div>
    ${meta.perks.length?`<div class="rulesbar" style="justify-content:center">${meta.perks.map(p=>`<span class="rb perk-chip rar-${PERK_RARITY[p]}" title="${esc(PERKS[p].desc)}">${PERKS[p].name}</span>`).join('')}${r.vouchers.map(v=>`<span class="rb char-chip" title="${esc(VOUCHERS[v].desc)}">${VOUCHERS[v].name}</span>`).join('')}</div>`:''}`;
}
let runArmed=false, runPre=false;
function bossPickHTML(){
  const r=run();if(!r||!r.bossPick||!r.bossPick.length)return '';
  const full=meta.perks.length>=perkSlots();
  return `<section class="panel bossreward"><h3 class="sub" style="margin-top:0">Boss reward: pick a free perk</h3>
    ${full?'<p class="note">Your perk slots are full. Sell a perk in the trading post to make room, or take the caps instead.</p>':'<p class="note">Choose one. These are uncommon or better.</p>'}
    <div class="plist">${r.bossPick.map(id=>`<button class="prow" data-bosspick="${id}" ${full?'disabled':''}><div><b>${esc(PERKS[id].name)} <i class="rar rar-${PERK_RARITY[id]}">${PERK_RARITY[id]}</i></b><span>${esc(PERKS[id].desc)}</span></div></button>`).join('')}</div>
    <button class="btn" data-bossskip>Take ${r.bossCaps||bossPerkCaps(0)} caps instead</button></section>`;
}
function renderRunMap(){
  const r=run();
  const idxs=inBeyond(r.stop)?[r.stop-1,r.stop,r.stop+1]:RUN_STOPS.map((_,i)=>i);
  if(inBeyond(r.stop))ensureStop(r.stop+1);
  const rows=idxs.map(s=>{
    const place=placeOf(s), cur=s===r.stop, done=s<r.stop, boss=bossDealer(s);
    if(!cur)return `<div class="stopmini${done?' done':''}"><span class="mile">${done?'✓':inBeyond(s)?'+'+mileOf(s):s+1}</span><div><b>${esc(place)}</b><span>Boss: ${esc(boss.name)}${boss.rival?` <i class="tag rival">${s===RUN_STOPS.length-1?'FINAL RIVAL':'RIVAL'}</i>`:''}</span></div></div>`;
    const tables=[0,1,2].map(t=>{
      const st=t<r.table?'done':t===r.table?'now':'next';
      const d=t===2?boss:r.dealers[s][t], ids=tableRuleIds(s,t).filter((x,i,a)=>a.indexOf(x)===i);
      const tag=t<2?TAGS[r.skipTags[s][t]]:null;
      return `<div class="rtable ${st}${t===2?' boss':''}">
        <div class="rt-head">${t===2?bossPic(d,'rivalimg'):''}<div><small>${TABLE_KIND[t]}${isWC()?` · ${WC_COST[t]} days`:''}</small><b>${esc(d.name)}</b><span>${esc(d.blurb)}</span></div></div>
        ${t===2&&d.wcRule?`<div class="rulesbar"><span class="rb house-chip">Boss: ${esc(d.wcRule)}</span></div>`:''}
        ${ids.length?`<div class="rulesbar">${ids.map(ruleChip).join('')}${t===2&&d.rival?`<span class="rb house-chip">Rival: ${esc(RIVALS[d.rival].rule)}</span>`:''}</div>`:(t===2&&d.rival?`<div class="rulesbar"><span class="rb house-chip">Rival: ${esc(RIVALS[d.rival].rule)}</span></div>`:'')}
        ${ids.length?`<div class="ruledescs">${ids.map(id=>`<span><b>${BOSS_RULES[id].name}:</b> ${esc(BOSS_RULES[id].desc)}</span>`).join('')}</div>`:''}
        ${st==='now'&&tag?`<div class="boon"><b>Or skip it:</b> give up this table’s winnings to earn a boon. <span><b>${esc(tag.name)}:</b> ${esc(tag.desc)}</span></div>`:st==='next'&&tag?`<div class="boon dim">Skip boon: <b>${esc(tag.name)}</b>. ${esc(tag.desc)}</div>`:''}
        <div class="rt-foot"><span class="num">Win +${Math.round(tableReward(s,t)*(has('roller')?1.5:1)*winMult())} · Sell all 3: +${sweepBonus(s,t)} more${t===2?` · Bounty: ${BOUNTIES[r.bounties[s]].name} +${bossBountyPay(s)}`:''}</span>
          ${st==='now'?`<span class="rt-btns">${tag?`<button class="btn" data-runskip>Skip for ${esc(tag.name)}</button>`:''}${t===2&&gear('tycho')&&!r.tychoUsed&&s<RUN_STOPS.length-1?`<button class="btn" data-tychoskip>Tycho: sneak past</button>`:''}<button class="btn hot" data-runplay>Deal in</button></span>`:st==='done'?'<span class="tag">DONE</span>':''}</div>
      </div>`;}).join('');
    return `<div class="stopcur"><h3>${inBeyond(s)?`Mile ${mileOf(s)}`:s+1}. ${esc(place)}</h3>${tables}</div>`;
  }).join('');
  app.innerHTML=`
  <div class="mbar">${backBtn('home','Modes')}<button class="btn ghost${runArmed?' armed':''}" data-runabandon>${runArmed?'Tap again to abandon':'Abandon run'}</button></div>
  <section class="hero small"><div class="neon sm">The Road</div></section>
  ${runHeaderHTML()}
  <div class="hubbtns kitbtns"><button class="btn" data-kitopen="deck">Your deck, perks & chems</button>${r.offers?`<button class="btn" data-runshopback>← Back to the trading post</button>`:''}</div>
  ${r.tagPick?`<section class="panel"><h3 class="sub" style="margin-top:0">Tag Skills: pick a free perk</h3><div class="plist">${r.tagPick.map(id=>`<button class="prow" data-tagpick="${id}"><div><b>${esc(PERKS[id].name)}</b><span>${esc(PERKS[id].desc)}</span></div></button>`).join('')}</div></section>`:''}
  ${isWC()?`<div class="wcclock"><b class="num">${r.days}</b> days of water left<span>Saloon ${WC_COST[0]} · High Stakes ${WC_COST[1]} · Boss ${WC_COST[2]} · Skip ${WC_SKIP}</span></div>`:''}
  ${bossPickHTML()}
  <section class="panel trailmap"><div class="maplabel">${isWC()?'Vault 13 → The Cathedral':'Goodsprings → The Strip'}</div>${rows}</section>
  ${runPre?runPreHandHTML():''}
  ${kitOpen?kitHTML():''}
  ${r.reveal?revealHTML():''}
  ${runStoryHTML()}`;
}
function runPreHandHTML(){
  const r=run(),s=r.stop,t=r.table,d=t===2?bossDealer(s):r.dealers[s][t],R=runRules(s,t),ids=tableRuleIds(s,t);
  const chems=Object.entries(meta.chems).filter(([,n])=>n>0);
  return `<div class="overlay"><div class="panel result prehand" role="dialog" aria-label="Before you deal in">
    ${t===2?bossPic(d,'rivalhero'):''}
    <h2>${esc(placeOf(s))}</h2><p class="who">${TABLE_KIND[t]} · ${esc(d.name)} · ${esc(d.blurb)}</p>
    <dl>
      <dt>Character</dt><dd>${esc(CHARS[r.char].name)}</dd>
      <dt>Reward</dt><dd>+${Math.round(tableReward(s,t)*(has('roller')?1.5:1)*winMult())} caps, plus interest (1 per 5 caps you hold, up to ${interestCap()})</dd>
      ${wagerRowHTML(r,s,t)}
      <dt>Sell range</dt><dd>${rangeTxt(R.range.p)===rangeTxt(R.range.a)?rangeTxt(R.range.p):`You ${rangeTxt(R.range.p)} · dealer ${rangeTxt(R.range.a)}`}</dd>
      <dt>Rules</dt><dd>${rulesWithSwapHTML(r,s,t,ids)}</dd>
      ${d.rival?`<dt>Rival</dt><dd>${esc(RIVALS[d.rival].rule)}${s===RUN_STOPS.length-1&&d.rival==='greg'&&!charUnlocked('greg')?' Beat him to unlock Greg.':''}${s===RUN_STOPS.length-1&&d.rival==='jeanita'&&!charUnlocked('jeanita')?' Beat her to unlock Jeanita.':''}</dd>`:''}
      ${t===2?`<dt>Bounty</dt><dd>${BOUNTIES[r.bounties[s]].name}: ${esc(BOUNTIES[r.bounties[s]].desc)} +${bossBountyPay(s)}</dd>`:''}
      ${t===2&&AI_STYLES[d.name]&&AI_STYLES[d.name].tell?`<dt>Style</dt><dd>${esc(AI_STYLES[d.name].tell)}</dd>`:''}
      <dt>Deck twist</dt><dd>${esc(DECKS[deckIdx(r.deck)].twist)}</dd>
      <dt>Chems</dt><dd>${chems.length?chems.map(([id,n])=>`${CHEMS[id].name} ×${n}`).join(' · '):'None'}</dd>
      <dt>Loadout</dt><dd>${(r.gear||[]).length?r.gear.map(id=>`<b>${esc(GEAR[id].name)}:</b> ${esc(GEAR[id].desc)}`).join('<br>'):'Nothing equipped'}</dd>
    </dl>
    <p class="note" style="text-align:center">${(r.grit||0)>0?(t<2?`Lose this table and you spend 1 Grit (you have ${r.grit}) and move on without the reward.`:`Lose this boss and you spend 1 Grit (you have ${r.grit}) to try again.`):has('insure')?'No Grit left, but your Guardian Angel will save the run from one loss.':'No Grit left: lose this table and the run ends.'}</p>
    <div class="hubbtns" style="justify-content:center"><button class="btn hot" data-runconfirm>Deal in</button><button class="btn" data-runcancel>Cancel</button></div>
  </div></div>`;
}
function renderRunSetup(){
  const nr=meta.newRun=meta.newRun||{deck:'plain',tier:'copper',token:null};
  if(!deckUnlocked(nr.deck))nr.deck='plain';if(!tierUnlocked(nr.tier,nr.deck))nr.tier='copper';if(nr.token&&!meta.tokens.includes(nr.token))nr.token=null;
  const T2=TUTORS['-2'];
  app.innerHTML=`
  <div class="mbar">${backBtn('home','Modes')}</div>
  <section class="hero small"><div class="neon sm">${nr.special==='waterchip'?'The Water Chip':'The Road'}</div><p class="tagline">${nr.special==='waterchip'?'Seven stops to save Vault 13, and 150 days of water to do it. You start with 1 Grit; run out and one more loss ends the run.':'Six stops to the Strip. You start with 1 Grit; run out and one more loss ends the run.'}</p></section>
  ${meta.char?`<div class="charstrip"><img src="${portrait(meta.char)}" alt=""><div><small>Character</small><b>${esc(CHARS[meta.char].name)}</b><span>${CHARS[meta.char].traits.map(t=>t[1]).join(' · ')}</span></div><button class="btn" data-go="pickchar">Change</button></div>`:''}
  <section class="panel dailybox">
    <h2 style="font-size:22px">Daily run</h2>
    ${(()=>{const day=dailySeed().slice(6),dl=(meta.dailyLog||{})[day],c=CHARS[dailyChar()];return `<p class="note">Same road for everyone today: ${esc(c.name)}, Plain deck, Copper Road, no gear. ${dl?`Your best today: ${dl.won?'reached Vegas':`stop ${dl.stop+1}`}. Streak: ${meta.dailyStreak||0} day${(meta.dailyStreak||0)===1?'':'s'}. Replay it for practice.`:'You haven’t played it yet. Your first finish pays NCR dollars.'}</p><button class="btn hot" data-rundaily>Play today’s daily</button>`;})()}
  </section>
  <section class="panel">
    <h2 style="font-size:24px">New run</h2>
    <div class="runpick" role="radiogroup" aria-label="Which run">
      <button class="rp${nr.special?'':' on'}" role="radio" aria-checked="${!nr.special}" data-runspecial="">${!nr.special?'<i class="rpcheck">✓</i>':''}<small>Regular run</small><b>The Road</b><span>Goodsprings to the Strip. Six stops.</span></button>
      <button class="rp wc${nr.special==='waterchip'?' on':''}" role="radio" aria-checked="${nr.special==='waterchip'}" data-runspecial="waterchip">${nr.special==='waterchip'?'<i class="rpcheck">✓</i>':''}<small>Special run · Fallout 1</small><b>The Water Chip</b><span>Vault 15 to the Cathedral. Seven stops, 150 days of water.</span></button>
    </div>
    <h3 class="sub">Deck</h3>
    <div class="decklist">${DECKS.map((d,i)=>{const ok=deckUnlocked(d.id),on=nr.deck===d.id;return `<button class="deckopt${on?' on':''}${ok?'':' locked'}" data-rundeck="${d.id}" ${ok?'':'disabled'} aria-pressed="${on}">
      <span class="deckprev" data-deck="${d.id}"><div class="card back"></div>${cardHTML({rank:'K',suit:'H'})}${ok?'':'<i class="lockbadge sm" aria-hidden="true">🔒︎</i>'}</span>
      <span class="dtxt"><b>${i+1}. ${esc(d.name)}${ok?tierPips(d.id):''}</b><span>${ok?esc(d.twist):`Win a run with the ${esc(DECKS[i-1].name)}${/deck/i.test(DECKS[i-1].name)?'':' deck'} to unlock.`}</span></span></button>`;}).join('')}</div>
    <h3 class="sub">Difficulty</h3>
    <div class="hubbtns" style="margin-top:0">${TIERS.map(t=>{const ok=tierUnlocked(t.id,nr.deck);return `<button class="btn${nr.tier===t.id?' hot':''}" data-runtier="${t.id}" ${ok?'':'disabled'} title="${esc(t.desc)}">${ok?'':'🔒︎ '}${esc(t.name)}</button>`;}).join('')}</div>
    <p class="note">${esc(TIERS[tierIdx(nr.tier)].desc)}${(()=>{const n=deckTierCount(nr.deck);return n<TIERS.length?` Win with this deck on the ${TIERS[n-1].name} to unlock the ${TIERS[n].name} for it.`:'';})()}</p>
    <h3 class="sub">Token</h3>
    ${meta.tokens.length?`<div class="hubbtns" style="margin-top:0"><button class="btn${!nr.token?' hot':''}" data-runtoken="">None</button>${meta.tokens.map(tk=>`<button class="btn${nr.token===tk?' hot':''}" data-runtoken="${tk}" title="${esc(TOKENS[tk].desc)}">${esc(TOKENS[tk].name)}</button>`).join('')}</div><p class="note">${nr.token?esc(TOKENS[nr.token].desc):'Bring one token into the run.'}</p>`:'<p class="note">Win runs to unlock tokens: small boosts you can bring into a run.</p>'}
    <h3 class="sub">Seed</h3>
    <input id="seed-input" type="text" maxlength="24" placeholder="Random" value="${esc(nr.seed||'')}" autocomplete="off" autocapitalize="characters" spellcheck="false" style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.3);color:inherit;font:inherit">
    <p class="note">Leave it blank for a random road. The same seed gives the same bosses, shops and events, so you can share one with a friend.</p>
    <h3 class="sub">Loadout</h3>
    <div class="loadline"><p class="note" style="margin:0">${loadoutLine()}</p><button class="btn" data-go="office">Mojave Express ${scripHTML(meta.scrip||0)}</button></div>
    <button class="btn hot" data-runstart style="width:100%;margin-top:10px;font-size:16px;padding:12px">${nr.special==='waterchip'?'Leave Vault 13':'Start the run'}</button>
  </section>
  <section class="panel" style="margin-top:14px">
    <h2 style="font-size:22px">Learn</h2>
    <div class="road">
      ${tutRow(-2,T2,meta.roadTutDone,!meta.roadTutDone,{attr:'data-play="-2"',terms:'House rules, perks, chems and bounties'})}
      ${tutRow(-1,{...TUTOR,place:'Rules refresher'},meta.tutorialDone,false,{attr:'data-play="-1"',terms:'New to Caravan? Start here.'})}
    </div>
  </section>
  <section class="panel" style="margin-top:14px">
    <div class="sect-h"><h2 style="font-size:22px">Your record</h2><button class="btn" data-go="codex">Codex</button></div>
    <p class="note">Runs won: ${meta.runsWon||0} · Best: ${meta.bestStop>=RUN_STOPS.length?'Reached Vegas':meta.bestStop?`stop ${meta.bestStop+1}`:'none yet'}${meta.endlessBest?` · Beyond the Strip: ${TIERS.map(t=>meta.endlessBest[t.id]?`${t.name.split(' ')[0]} ${meta.endlessBest[t.id]}`:null).filter(Boolean).join(', ')}`:''}</p>
    ${(meta.runHist||[]).length?`<div class="hist">${meta.runHist.slice(0,6).map(h=>`<div class="${h.result}"><b>${h.result==='won'?'Won':'Lost'}</b> ${esc(CHARS[h.char]?CHARS[h.char].name:'?')} · ${esc(DECKS[deckIdx(h.deck)].name)} · ${esc(TIERS[tierIdx(h.tier)].name)}${h.result==='lost'?` · stop ${h.stop+1}`:''}${h.beyond?` · +${h.beyond-1} beyond`:''} · ${h.won} tables</div>`).join('')}</div>`:''}
  </section>`;
}
function runStatsHTML(r){
  if(!r.hands)return '';
  const rs=r.rs||{},mins=Math.max(1,Math.round(((r.endedAt||Date.now())-(r.started||Date.now()))/60000));
  const rows=[['hands',r.hands],['tables won',r.won],['skipped',r.skips||0],['caps earned',rs.caps||0],['best payout',rs.best||0],['triple sales',rs.sweeps||0],['bounties',rs.bounties||0],['Kings played',rs.kings||0],['Jacks played',rs.jacks||0],['Jokers played',rs.jokers||0],['turns',rs.turns||0],['discards',rs.discards||0],['minutes',mins]];
  return `<h3 class="sub">How it went</h3><div class="hubbtns" style="justify-content:center">${rows.map(([l,v])=>`<span class="pill num"><b>${v}</b>&nbsp;${l}</span>`).join('')}</div>
    ${meta.perks.length?`<p class="note" style="text-align:center"><b>Perks:</b> ${meta.perks.map(id=>esc(PERKS[id].name)).join(' · ')}</p>`:''}
    <p class="note" style="text-align:center"><b>Deck:</b> ${esc(deckSummary(meta.deck))}${modCount()?` ${modCount()} upgraded.`:''}</p>`;
}
let codexTab='perks';
const codexBosses=()=>[...new Set([...NV_STOPS.map(i=>ROAD[i].name),...Object.values(CHARS).map(c=>c.name),...BEYOND.map(b=>b.name),...WC_ROUTE.filter(x=>x.name).map(x=>x.name),...Object.values(WC_JUNK).map(x=>x.name)])];
function renderCodex(){
  const c=cdx(),tabs=[['perks','Perks'],['legends','Legends'],['bosses','Bosses'],['events','Events'],['upgrades','Upgrades']],rk={common:0,uncommon:1,rare:2,legendary:3};
  let body='',count='';
  if(codexTab==='perks'){
    const ids=Object.keys(PERKS).sort((a,b)=>(rk[PERK_RARITY[a]]||0)-(rk[PERK_RARITY[b]]||0)||PERKS[a].name.localeCompare(PERKS[b].name));
    count=`${ids.filter(id=>c.perk[id]).length}/${ids.length}`;
    body=`<div class="plist">${ids.map(id=>{const st=c.perk[id]||0;return st?`<div class="prow"><div><b>${esc(PERKS[id].name)} <i class="rar rar-${PERK_RARITY[id]}">${PERK_RARITY[id]}</i></b><span>${esc(PERKS[id].desc)}</span></div><span class="pill num">${st&4?'Won with':st&2?'Owned':'Seen'}</span></div>`:`<div class="prow"><div><b>???</b><span>Not seen yet. Perks turn up in shops, crates and boss rewards.</span></div></div>`;}).join('')}</div>`;
  }else if(codexTab==='legends'){
    const ids=Object.keys(LEGENDS),own=id=>(meta.legends||[]).includes(id);count=`${ids.filter(own).length}/${ids.length}`;
    body=`<div class="plist">${ids.map(id=>{const L=LEGENDS[id];return own(id)?`<div class="prow lgrow">${cardHTML({legend:id})}<div><b class="lg-${L.rar}">${esc(L.name)} <i class="rar lgt-${L.rar}">${L.rar}</i></b><span>${esc(L.desc)}</span></div></div>`:`<div class="prow"><div><b>???</b><span>${L.found?esc(L.found):'Buy it at the Mojave Express to add it to the trading posts.'}</span></div></div>`;}).join('')}</div>`;
  }else if(codexTab==='bosses'){
    const names=codexBosses();count=`${names.filter(n=>c.boss[n]).length}/${names.length}`;
    body=`<div class="plist">${names.map(n=>{const b=c.boss[n];if(!b)return `<div class="prow"><div><b>???</b><span>You haven’t faced this boss yet.</span></div></div>`;const st=AI_STYLES[n];
      return `<div class="prow">${bossPic({rival:b.rv,art:b.art},'rivalimg')}<div><b>${esc(n)}</b><span>Faced ${b.f} · beaten ${b.w}${st&&st.tell?` · ${esc(st.tell)}`:''}</span></div></div>`;}).join('')}</div>`;
  }else if(codexTab==='events'){
    const ks=Object.keys(EVENTS);count=`${ks.filter(k=>c.event[k]).length}/${ks.length}`;
    body=`<div class="plist">${ks.map(k=>{const e=EVENTS[k],n=c.event[k];return n?`<div class="prow"><div><b>${esc(e.title)}</b><span>${esc(e.text)} · met ${n} time${n>1?'s':''}</span></div></div>`:`<div class="prow"><div><b>???</b><span>Something you haven’t met on the road yet.</span></div></div>`;}).join('')}</div>`;
  }else{
    body=`<h3 class="sub">Card upgrades</h3><div class="plist">${Object.values(MODS).map(m=>`<div class="prow"><div><b>${esc(m.name)}</b><span>${esc(m.desc)}</span></div></div>`).join('')}</div>
      <h3 class="sub">Special finishes</h3><div class="plist">${Object.values(EDITIONS).map(e=>`<div class="prow"><div><b>${esc(e.name)}</b><span>${esc(e.desc)}</span></div></div>`).join('')}</div>
      <h3 class="sub">Chems</h3><div class="plist">${Object.values(CHEMS).map(e=>`<div class="prow"><div><b>${esc(e.name)}</b><span>${esc(e.desc)}</span></div></div>`).join('')}</div>`;
  }
  app.innerHTML=`
  <div class="mbar">${backBtn('road','The Road')}${count?`<span class="pill num">${count}</span>`:''}</div>
  <section class="panel">
    <h2 style="font-size:28px">Codex</h2>
    <p class="note">Everything you’ve met on the Road. Unseen entries stay hidden until you find them.</p>
    <div class="tabs" role="group" aria-label="Codex section">${tabs.map(([k,l])=>`<button class="btn" data-cxtab="${k}" aria-pressed="${codexTab===k}">${l}</button>`).join('')}</div>
    ${body}
  </section>`;
}
function renderRunOver(){
  const r=run(),won=r.result==='won';
  app.innerHTML=`
  <div class="mbar">${backBtn('home','Modes')}</div>
  <section class="panel result runover" style="margin:24px auto">
    <img class="rivalhero" src="${portrait(r.char)}" alt="">
    <h2 class="${won?'':'lost'}">${r.special==='waterchip'?(won?'Vault 13 is saved':r.dry?'The water ran dry':'Run over'):r.fellBeyond?`Mile ${mileOf(r.stop)} beyond the Strip`:won?'You made it to Vegas':'Run over'}</h2>
    ${r.special==='waterchip'?`<p>${won?`You brought the water chip home with ${r.days} days to spare. The Overseer thanked you, then exiled you.`:r.dry?`The vault’s water ran out while you were at ${esc(placeOf(r.stop))}.`:`You fell at ${esc(placeOf(r.stop))} with ${r.days} days of water left.`}</p>`:''}
    <p style="${r.special?'display:none':''}">${r.fellBeyond?`${esc(CHARS[r.char].name)} beat the Strip, then made it ${mileOf(r.stop)-1} stop${mileOf(r.stop)-1===1?'':'s'} past it before falling at ${esc(placeOf(r.stop))}. Best on the ${esc(TIERS[tierIdx(r.tier)].name)}: ${(meta.endlessBest||{})[r.tier]||0}.`:won?`${esc(CHARS[r.char].name)} beat the Strip on the ${esc(TIERS[tierIdx(r.tier)].name)} with the ${esc(DECKS[deckIdx(r.deck)].name)}.`:`${esc(CHARS[r.char].name)} fell at ${esc(placeOf(r.stop))}, ${TABLE_KIND[r.table].toLowerCase()}.`}</p>
    <p class="num">${r.won} tables won · ${r.skips} skipped · ${meta.caps} caps left</p>
    ${r.seed?`<p class="note">${r.daily?'Daily run':'Seed'}: ${esc(r.seed)}${r.daily?'':' · share it to replay the same road'}</p>`:''}
    ${r.dailyBonus?`<p class="num" style="color:var(--neon)">Daily bonus: +${r.dailyBonus} NCR dollars · streak ${meta.dailyStreak||1}</p>`:''}
    ${r.scrip?`<p class="num" style="color:var(--neon)">+${r.scrip} NCR dollars this run${r.scripMiles?` (${r.scripMiles} of it for the miles)`:''} · ${meta.scrip} to spend at the Mojave Express</p>`:''}
    ${runStatsHTML(r)}
    ${won&&r.unlocked&&r.unlocked.length?`<h3 class="sub">Unlocked</h3><ul class="traits">${r.unlocked.map(u=>`<li class="pro"><b>+ ${esc(u)}</b></li>`).join('')}</ul>`:''}
    ${won&&!r.endless?`<div class="explain" style="text-align:left"><p><b>Beyond the Strip.</b> Keep this run going into endless stops past Vegas: more boss rules every stop, sharper dealers, bigger rewards. See how far you get. Your unlocks are already saved.</p></div>
      ${r.special?'':'<button class="btn hot" data-runbeyond>Keep going</button>'} <button class="btn" data-runnew>New run</button>`:`<button class="btn hot" data-runnew>New run</button>`} <button class="btn" data-runoffice style="margin-left:6px">Mojave Express</button> <button class="btn" data-go="codex" style="margin-left:6px">Codex</button>
  </section>
  ${runStoryHTML()}`;
}
function renderEvent(){
  const r=run(),ev=EVENTS[r.event];
  if(!ev){eventDone();return renderRunShop();}
  app.innerHTML=`
  <div class="mbar">${backBtn('home','Modes')}${capsHTML(meta.caps)}</div>
  <section class="hero small"><div class="neon sm" style="font-size:clamp(24px,7vw,40px)">On the road</div><p class="tagline">Between ${esc(placeOf(r.stop-1))} and ${esc(placeOf(r.stop))}</p></section>
  <div class="radio"><span class="rlbl">◉ WRAY 98.7</span><p>${esc(radioLine(r.stop))}</p></div>
  <section class="panel eventcard">
    <h2 style="font-size:26px;color:var(--neon)">${esc(ev.title)}</h2>
    <p class="story">${esc(ev.text)}</p>
    ${r.eventResult?`<p class="ex">${esc(r.eventResult)}</p><button class="btn hot" data-eventdone>Continue to the shop</button>`:
      `<div class="spoils">${ev.choices.map((c,i)=>{const low=c.req&&statOf(c.req[0])<c.req[1],poor=c.cost&&meta.caps<c.cost;return `<button class="spoil" data-eventpick="${i}" ${low||poor?'disabled':''}><b>${c.req?`[${c.req[0]} ${c.req[1]}] `:''}${esc(c.label)}</b>${low?`<span>Needs ${c.req[0]} ${c.req[1]}. You have ${statOf(c.req[0])}.</span>`:poor?'<span>Not enough caps.</span>':''}</button>`;}).join('')}</div><p class="note" style="margin-top:10px">${STAT_NAMES.map(n=>`${n} ${statOf(n)}`).join(' · ')}</p>`}
  </section>
  ${bossPickHTML()}
  <div class="hubbtns kitbtns"><button class="btn" data-kitopen="deck">Your deck, perks & chems</button></div>
  ${r.picker?pickerHTML():''}
  ${kitOpen?kitHTML():''}
  ${r.reveal?revealHTML():''}
  ${runStoryHTML()}`;
}
let runShopTab='shop', armedSell=null, kitOpen=null;
// "Your kit": everything you're carrying on this run, viewable from the map between tables.
function kitHTML(){
  const r=run(),tab=kitOpen,slots=perkSlots(),back=r.offers&&r.phase==='table';
  const deck=meta.deck.map((c,i)=>({...c,i})).sort(sortSpec);
  const chems=Object.entries(meta.chems).filter(([,n])=>n>0);
  const extras=[
    `Grit: ${r.grit||0}${(r.grit||0)?' (lose a table and you spend 1 instead of ending the run)':' (no safety net left)'}`,
    r.freeRerolls?`${r.freeRerolls} free shop reroll${r.freeRerolls>1?'s':''} saved up`:null,
    r.freeUpgrade?`${r.freeUpgrade>1?r.freeUpgrade+' free card upgrades':'A free card upgrade'} at your next shop`:null,
    (r.freeBundles||[]).length?`${r.freeBundles.length>1?r.freeBundles.length+' free bundles':`A free ${r.freeBundles[0]==='collector'?'Collector’s':'Supply'} bundle`} at your next shop`:null,
    r.freeCrate?`A free ${r.freeCrate==='collector'?'Collector’s':'Supply'} bundle at your next shop`:null,
    r.halfShop&&!r.offers?'Your next shop is half price':null,
    r.bossPick?'A free boss perk is waiting for you to pick it':null,
    (r.nextRules||[]).length?`Next table: ${r.nextRules.map(id=>`${BOSS_RULES[id].name} (${BOSS_RULES[id].desc})`).join(', ')}`:null,
  ].filter(Boolean);
  const tabBtn=(k,l)=>`<button class="btn" data-kitopen="${k}" aria-pressed="${tab===k}">${l}</button>`;
  return `<div class="overlay"><div class="panel result kitpop" role="dialog" aria-label="Your kit" style="text-align:left">
    <div class="sect-h"><h2 style="font-size:24px;margin:0">Your kit</h2><button class="btn" data-kitclose>Close</button></div>
    <div class="tabs" role="group" aria-label="Kit section">${tabBtn('deck',`Deck (${meta.deck.length})`)}${tabBtn('perks',`Perks (${meta.perks.length}/${slots})`)}${tabBtn('chems',`Chems & more`)}</div>
    ${tab==='deck'?`
      <p class="note">${deckSummary(meta.deck)} ${modCount()?`${modCount()} upgraded.`:''} ${meta.deck.filter(c=>c.ed).length?`${meta.deck.filter(c=>c.ed).length} with a special finish.`:''}</p>
      <p class="note">On the Road your deck changes at the trading post: add cards from bundles and singles, upgrade them at the workbench, and thin it out with the Burn pile.${back?' You can still go back to this stop’s trading post.':''}</p>
      <div class="deckgrid">${deck.map(c=>`<div class="card-btn" aria-label="${cardName(c)}${c.mod?' '+MODS[c.mod].name:''}${c.ed?' '+EDITIONS[c.ed].name:''}">${cardHTML(c)}</div>`).join('')}</div>`
    :tab==='perks'?`
      ${meta.perks.length?`<div class="plist">${meta.perks.map(id=>`<div class="prow"><div><b>${PERKS[id].name} <i class="rar rar-${PERK_RARITY[id]}">${PERK_RARITY[id]}</i></b><span>${esc(PERKS[id].desc)}</span></div></div>`).join('')}</div>`:'<p class="note">No perks yet. Buy them at the trading post.</p>'}
      <p class="note">${slots-meta.perks.length>0?`${slots-meta.perks.length} empty slot${slots-meta.perks.length>1?'s':''}.`:'All slots full. Sell one at the trading post to make room.'}</p>
      ${r.vouchers.length?`<h3 class="sub">Vouchers</h3><div class="plist">${r.vouchers.map(v=>`<div class="prow"><div><b>${VOUCHERS[v].name}</b><span>${esc(VOUCHERS[v].desc)}</span></div></div>`).join('')}</div>`:''}
      <h3 class="sub">${esc(CHARS[r.char].name)}</h3>
      <ul class="traits">${CHARS[r.char].traits.map(([k,n,dsc])=>`<li class="${k==='+'?'pro':k==='='?'meh':'con'}"><b>${k} ${esc(n)}</b> ${esc(dsc)}</li>`).join('')}</ul>
      <p class="note"><b>Deck twist:</b> ${esc(DECKS[deckIdx(r.deck)].twist)}</p>`
    :`
      <h3 class="sub" style="margin-top:0">Chems <span class="note">${chemTotal()}/${chemMax()}</span></h3>
      ${chems.length?`<div class="plist">${chems.map(([id,n])=>`<div class="prow"><div><b>${CHEMS[id].name} ×${n}</b><span>${esc(CHEMS[id].desc)}</span></div></div>`).join('')}</div><p class="note">Use them during a hand, one per turn, after the opening.</p>`:'<p class="note">No chems. Buy them at the trading post.</p>'}
      <h3 class="sub">Run status</h3>
      <ul class="steps">${extras.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`}
    <div class="hubbtns" style="justify-content:center">${back?`<button class="btn hot" data-runshopback>← Back to the trading post</button>`:''}<button class="btn" data-kitclose>Close</button></div>
  </div></div>`;
}
function renderRunShop(){
  const r=run(),o=r.offers;if(!o)openShop();
  const of=r.offers,slots=perkSlots(),full=meta.perks.length>=slots;
  const sold=k=>of.sold[k];
  const buyBtn=(key,price,dis)=>`<button class="btn${!dis&&meta.caps>=price?' hot':''}" data-rbuy="${key}" ${dis||meta.caps<price||sold(key)?'disabled':''}>${sold(key)?'Sold':capN(price)}</button>`;
  const perkRow=(id,i)=>`<div class="prow"><div><b>${PERKS[id].name} <i class="rar rar-${PERK_RARITY[id]}">${PERK_RARITY[id]}</i></b><span>${esc(PERKS[id].desc)}</span></div>${buyBtn('perk'+i,perkRunPrice(id),full)}</div>`;
  const deck=meta.deck.map((c,i)=>({...c,i})).sort(sortSpec);
  app.innerHTML=`
  <div class="mbar"><span class="pill">${esc(placeOf(r.stop))} · next: ${TABLE_KIND[r.table]}</span>${capsHTML(meta.caps)}</div>
  ${runHeaderHTML()}
  ${bossPickHTML()}
  <section class="panel">
    <div class="sect-h"><h2 style="font-size:26px">Trading post</h2><button class="btn hot" data-runnext>Next table →</button></div>
    ${r.halfShop?'<p class="note" style="color:var(--sage)">Clearance Sale: everything is half price this visit.</p>':''}
    <div class="tabs" role="group" aria-label="Shop section"><button class="btn" data-rtab="shop" aria-pressed="${runShopTab==='shop'}">Shop</button><button class="btn" data-rtab="deck" aria-pressed="${runShopTab==='deck'}">Your deck (${meta.deck.length})</button><button class="btn" data-rtab="perks" aria-pressed="${runShopTab==='perks'}">Your perks (${meta.perks.length}/${slots})</button></div>
    ${runShopTab==='shop'?`
      <h3 class="sub">Perks ${full?'<span class="note">· slots full, sell one first</span>':''}</h3>
      <div class="plist">${of.perks.map(perkRow).join('')||'<p class="note">No perks left to offer.</p>'}</div>
      <h3 class="sub">Card bundles</h3>
      <div class="plist">${of.bundles.map((b,i)=>`<div class="prow"><div><b>${esc(bundleName(b))}</b><span>${esc(bundleDesc(b))}</span></div>${buyBtn('bundle'+i,disc(BUNDLES[b.id].price))}</div>`).join('')}</div>
      <h3 class="sub">Burn pile</h3>
      <div class="prow"><div><b>Toss cards in the fire</b><span>Throw up to 2 cards from your deck into the fire. A thinner deck draws your best cards more often. Once per visit; your deck can’t go below ${MIN_DECK}.${runV('haggle')?' <b>Haggler: free, and pays 2 caps per card burned.</b>':''}</span></div>${runV('haggle')?`<button class="btn${r.burnUsed||!burnRoom()?'':' hot'}" data-rbuy="burn" ${r.burnUsed||!burnRoom()||sold('burn')?'disabled':''}>${sold('burn')?'Sold':'Free'}</button>`:buyBtn('burn',disc(3),r.burnUsed||!burnRoom())}</div>
      <h3 class="sub">Crates</h3>
      <div class="plist">${Object.entries(CRATES).map(([k,c])=>`<div class="prow"><div><b>${c.name}</b><span>${c.desc}</span></div>${buyBtn('crate-'+k,disc(c.price),(k==='perk'&&full)||(k==='chem'&&chemTotal()>=chemMax()))}</div>`).join('')}</div>
      <h3 class="sub">Cards</h3>
      <div class="offers">${of.cards.map((c,i)=>`<div class="offer${sold('card'+i)?' sold':''}">${cardHTML(c)}<div class="what">${c.rank==='JK'?'Joker':isNum(c)?cardName(c):FACE_NAME[c.rank]+' '+SUIT_CH[c.suit]}${c.mod?`<br><b>${MODS[c.mod].name}:</b> ${esc(MODS[c.mod].desc)}`:''}${c.ed?`<br><b>${EDITIONS[c.ed].name}:</b> ${esc(EDITIONS[c.ed].desc)}`:''}</div>${buyBtn('card'+i,runCardPrice(c))}</div>`).join('')}</div>
      ${(meta.capVouch||[]).length?(()=>{const v=[...meta.capVouch].sort((a,b)=>b.caps-a.caps)[0],tot=meta.capVouch.reduce((n,x)=>n+x.caps,0),a=ACH.find(x=>x.id===v.id);return `<h3 class="sub">Cap vouchers</h3><div class="prow vouchrow"><div><b>${meta.capVouch.length} voucher${meta.capVouch.length>1?'s':''} · ${tot} caps in all</b><span>Earned from achievements. Cash in one per trading post, on any run. Next up: ${esc(a?a.name:'Achievement')} (${v.caps} caps).</span></div><button class="btn hot" data-cashin ${r.vouchUsed?'disabled':''}>${r.vouchUsed?'Cashed in here':`+${v.caps} caps`}</button></div>`;})():''}
      ${of.legend&&LEGENDS[of.legend]?`<h3 class="sub">Legend card</h3><div class="prow lgrow">${cardHTML({legend:of.legend})}<div><b>${esc(LEGENDS[of.legend].name)} <i class="rar lgt-${LEGENDS[of.legend].rar}">${LEGENDS[of.legend].rar}</i></b><span>${esc(LEGENDS[of.legend].desc)} Goes in your deck for the rest of the run.</span></div>${buyBtn('legend',disc(LEGEND_PRICE[LEGENDS[of.legend].rar].caps))}</div>`:''}
      <h3 class="sub">Workbench</h3>
      <div class="prow"><div><b>${MODS[of.upgrade].name} upgrade</b><span>${esc(MODS[of.upgrade].desc)} Pick a number card from your deck to apply it.</span></div>${r.freeUpgrade?`<button class="btn hot" data-rbuy="upgrade">Free${r.freeUpgrade>1?` ×${r.freeUpgrade}`:''}</button>`:buyBtn('upgrade',disc(6))}</div>
      <h3 class="sub">Chems${isChar('snipsnip')?' <span class="note">· Snip Snip can’t use chems</span>':''}</h3>
      <div class="plist">${of.chems.map((id,i)=>`<div class="prow"><div><b>${CHEMS[id].name}${meta.chems[id]?` ×${meta.chems[id]}`:''}</b><span>${esc(CHEMS[id].desc)}</span></div>${buyBtn('chem'+i,chemRunPrice(id),chemTotal()>=chemMax())}</div>`).join('')}</div>
      ${of.voucher?`<h3 class="sub">Voucher <span class="note">· one per stop, lasts the whole run</span></h3><div class="prow"><div><b>${VOUCHERS[of.voucher].name}</b><span>${esc(VOUCHERS[of.voucher].desc)}</span></div>${buyBtn('voucher',VOUCHER_PRICE(of.voucher))}</div>`:''}
      <div class="hubbtns"><button class="btn" data-rreroll ${r.sponsor||r.freeRerolls||meta.caps>=rerollCost()?'':'disabled'}>Reroll shop (${r.sponsor?'free, sponsored':r.freeRerolls?'free':capN(rerollCost())})</button></div>`
    :runShopTab==='deck'?`
      <p class="note">${deckSummary(meta.deck)} ${modCount()?`${modCount()} upgraded.`:''} To remove cards, use the Burn pile in the shop.</p>
      <div class="deckgrid">${deck.map(c=>`<div class="card-btn" aria-label="${cardName(c)}${c.mod?' '+MODS[c.mod].name:''}${c.ed?' '+EDITIONS[c.ed].name:''}">${cardHTML(c)}</div>`).join('')}</div>`
    :`
      <p class="note">You can run ${slots} perks. Sell one for half its price to make room.</p>
      <div class="plist">${meta.perks.map(id=>`<div class="prow"><div><b>${PERKS[id].name} <i class="rar rar-${PERK_RARITY[id]}">${PERK_RARITY[id]}</i></b><span>${esc(PERKS[id].desc)}</span></div><button class="btn${armedSell==='p:'+id?' armed':''}" data-rsellperk="${id}">${armedSell==='p:'+id?'Tap to sell':'Sell '+capN(perkSellPrice(id))}</button></div>`).join('')||'<p class="note">No perks yet.</p>'}</div>`}
  </section>
  ${r.crate?crateHTML():''}${r.workbench?workbenchHTML():''}${r.picker?pickerHTML():''}${kitOpen?kitHTML():''}${r.reveal?revealHTML():''}${runStoryHTML()}`;
}
function pickerHTML(){
  const pk=run().picker,burn=pk.kind==='burn';
  const items=burn?meta.deck.map((c,i)=>({c,i})).sort((a,b)=>sortSpec(a.c,b.c)):pk.options.map((c,i)=>({c,i}));
  const cap=burn?Math.min(pk.keep,burnRoom()):pk.keep;
  return `<div class="overlay"><div class="panel result picker" style="text-align:left"><h2 style="font-size:26px;color:var(--neon)">${esc(pk.title)}</h2><p>${esc(pk.note)}</p>
    <div class="pickgrid${burn?' burn':''}">${items.map(({c,i})=>{const on=pk.sel.includes(i);return `<button class="pickcard${on?' on':''}" data-pickc="${i}" aria-pressed="${on}" ${!on&&pk.sel.length>=cap?'disabled':''}>${cardHTML(c)}<small>${c.mod?MODS[c.mod].name:'&nbsp;'}</small></button>`;}).join('')}</div>
    ${!burn&&pk.options.some(c=>c.mod)?`<p class="note">${[...new Set(pk.options.filter(c=>c.mod).map(c=>c.mod))].map(m=>`<b>${MODS[m].name}:</b> ${esc(MODS[m].desc)}`).join(' ')}</p>`:''}
    <div class="hubbtns"><button class="btn hot" data-pickdone ${pk.sel.length?'':'disabled'}>${burn?`Burn ${pk.sel.length}`:`Keep ${pk.sel.length} of ${cap}`}</button><button class="btn ghost" data-pickskip>${burn?'Burn nothing':'Take nothing'}</button></div>
  </div></div>`;
}
function pickerDone(){
  const r=run(),pk=r.picker;if(!pk)return;
  if(pk.kind==='burn'){const set=new Set(pk.sel.slice(0,burnRoom()));meta.deck=meta.deck.filter((c,i)=>!set.has(i));let paid=0;if(runV('haggle')&&set.size){paid=2*set.size;meta.caps+=paid;if(typeof sfx==='function')sfx('clink');if(typeof toast==='function')toast({name:'Haggler',desc:`You burned ${set.size} card${set.size===1?'':'s'} and pocketed ${paid} caps.`});}if(r.phase==='event')r.eventResult=`You burned ${set.size} card${set.size===1?'':'s'}${paid?` and pocketed ${paid} caps`:''}.`;}
  else for(const i of pk.sel.slice(0,pk.keep))runAddCard(pk.options[i]);
  r.picker=null;if(r.phase==='shop')nextFreeBundle();if(modCount()>=5)unlock('tinker');save();
}
function crateHTML(){
  const c=run().crate;
  const lab=o=>c.kind==='card'?{t:`${o.rank==='JK'?'Joker':cardName(o)}${o.mod?` · ${MODS[o.mod].name}`:''}${o.ed?` · ${EDITIONS[o.ed].name}`:''}`,d:[o.mod?MODS[o.mod].desc:'',edLine(o)].filter(Boolean).join(' ')||'Goes into your deck.',card:o}:c.kind==='perk'?{t:PERKS[o].name,d:PERKS[o].desc}:{t:CHEMS[o].name,d:CHEMS[o].desc};
  return `<div class="overlay"><div class="panel result picker" style="text-align:left"><h2 style="font-size:26px;color:var(--neon)">${CRATES[c.kind].name}${c.free?' (free)':''}</h2><p>Pick one.</p>
    <div class="spoils">${c.options.map((o,i)=>{const l=lab(o);return `<button class="spoil crateopt" data-cratepick="${i}">${l.card?cardHTML(l.card):''}<span><b>${esc(l.t)}</b><span>${esc(l.d)}</span></span></button>`;}).join('')}</div>
    <button class="btn ghost" data-crateskip style="margin-top:10px">Take nothing</button></div></div>`;
}
function workbenchHTML(){
  const w=run().workbench,deck=meta.deck.map((c,i)=>({...c,i})).filter(c=>isNum(c)&&c.mod!==w.mod).sort(sortSpec);
  return `<div class="overlay"><div class="panel result" style="text-align:left"><h2 style="font-size:24px;color:var(--neon)">${MODS[w.mod].name} upgrade</h2><p>${esc(MODS[w.mod].desc)} Tap a card to upgrade it.</p>
    <div class="deckgrid">${deck.map(c=>`<button class="card-btn" data-wbpick="${c.i}">${cardHTML(c)}</button>`).join('')}</div>
    <button class="btn ghost" data-wbcancel style="margin-top:10px">Cancel</button></div></div>`;
}
function runShopBuy(key){
  const r=run(),of=r.offers;if(of.sold[key])return;
  const pay=n=>{if(meta.caps<n)return false;meta.caps-=n;return true;};
  if(key.startsWith('perk')){const id=of.perks[+key.slice(4)];if(meta.perks.length>=perkSlots())return;if(!pay(perkRunPrice(id)))return;meta.perks.push(id);meta.equipped=meta.perks;of.sold[key]=1;if(meta.perks.length>=5)unlock('loaded');}
  else if(key.startsWith('bundle')){const b=of.bundles[+key.slice(6)];if(!pay(disc(BUNDLES[b.id].price)))return;of.sold[key]=1;openBundle(b,false);}
  else if(key==='burn'){if(r.burnUsed||!burnRoom())return;if(!runV('haggle')&&!pay(disc(3)))return;r.burnUsed=true;of.sold[key]=1;openBurn(2,'Burn pile','Pick up to 2 cards to burn. They’re gone for the rest of the run.');}
  else if(key.startsWith('crate-')){const k=key.slice(6);if((k==='perk'&&meta.perks.length>=perkSlots())||(k==='chem'&&chemTotal()>=chemMax()))return;if(!pay(disc(CRATES[k].price)))return;openCrate(k);}
  else if(key.startsWith('card')){const c=of.cards[+key.slice(4)];if(gear('katja')&&!r.katjaUsed)r.katjaUsed=true;else if(!pay(runCardPrice(c)))return;runAddCard(c);of.sold[key]=1;}
  else if(key.startsWith('chem')){const id=of.chems[+key.slice(4)];if(chemTotal()>=chemMax())return;if(!pay(chemRunPrice(id)))return;meta.chems[id]=(meta.chems[id]||0)+1;}
  else if(key==='upgrade'){if(!r.freeUpgrade&&meta.caps<disc(6))return;r.workbench={mod:of.upgrade};}
  else if(key==='legend'){const id=of.legend;if(!id||meta.deck.some(c=>c.legend===id))return;if(!pay(disc(LEGEND_PRICE[LEGENDS[id].rar].caps)))return;meta.deck.push({rank:'LG',suit:null,legend:id});of.sold[key]=1;}
  else if(key==='voucher'){if(!pay(VOUCHER_PRICE(of.voucher)))return;r.vouchers.push(of.voucher);r.voucherStop=r.stop;of.sold[key]=1;}
  save();
}
function renderRoadRun(){
  const r=run();
  if(r&&r.phase!=='over'&&meta.char!==r.char)meta.char=r.char;
  if(!r||r.phase==='none')return renderRunSetup();
  if(r.phase==='over')return renderRunOver();
  if(r.phase==='event')return renderEvent();
  if(r.phase==='shop')return renderRunShop();
  return renderRunMap();
}
function runResultHTML(ov){
  const won=ov.winner==='p',r=run();
  const lines=[];
  if(won){lines.push(`${ov.win} for the win`);if(ov.bountyWon)lines.push(`${ov.bountyWon} bounty`);}
  for(const x of (ov.extras||[]))lines.push(x);
  if(ov.brewed)lines.push(`Nuke brewed a ${CHEMS[ov.brewed].name}`);
  for(const id of (ov.newChars||(ov.newChar?[ov.newChar]:[])))lines.push(`${CHARS[id].name} unlocked`);
  if(ov.scrip)lines.push(`+${ov.scrip} NCR ${ov.scrip===1?'dollar':'dollars'}`);
  const title=won?(r.phase==='over'?'You made it to Vegas!':'Table won'):ov.saved?'Saved!':'Run over';
  return `<div class="overlay"><div class="panel result">
    <h2 class="${won||ov.saved?'':'lost'}">${title}</h2>
    <p>${esc(ov.reason)}</p>
    ${ov.delta?`<div class="gain num" data-delta="${ov.delta}">${ov.delta>0?`+<span class="cap"></span> <span class="cn">${ov.delta}</span>`:`−${capN(-ov.delta)}`}</div>`:''}
    ${lines.length?`<p style="margin-top:-8px">${esc(lines.join(' · '))}</p>`:''}
    ${ov.saved?(ov.grit?(ov.movedOn?`<p>You spent 1 Grit. No reward, but the run goes on. Grit left: ${run().grit}.</p>`:`<p>You spent 1 Grit. Catch your breath and take another shot at the boss. Grit left: ${run().grit}.</p>`):'<p>Your Guardian Angel stepped in. You get another shot at this table.</p>'):''}
    ${ov.unlocked&&ov.unlocked.length?`<p>Unlocked: ${esc(ov.unlocked.join(', '))}</p>`:''}
    <p>You have ${meta.caps} caps.</p>
    <button class="btn hot" data-runcontinue>${ov.runOver?'See how it went':r&&r.phase==='over'?'Celebrate':r&&r.phase==='event'?'Hit the road':r&&r.phase==='shop'?'To the trading post':'Back to the table'}</button>
  </div></div>`;
}
function handleRunClick(d){
  const r=run();
  if('wcgo' in d){meta.newRun=meta.newRun||{deck:'plain',tier:'copper',token:null};if(!runLive())meta.newRun.special='waterchip';screen='road';save();render();window.scrollTo(0,0);return true;}
  if('runspecial' in d){meta.newRun.special=d.runspecial||null;render();return true;}
  if('rundeck' in d){meta.newRun.deck=d.rundeck;if(!tierUnlocked(meta.newRun.tier,d.rundeck))meta.newRun.tier='copper';render();return true;}
  if('cashin' in d){if(r&&r.phase==='shop'&&!r.vouchUsed&&(meta.capVouch||[]).length){meta.capVouch.sort((a,b)=>b.caps-a.caps);const v=meta.capVouch.shift();meta.caps+=v.caps;r.vouchUsed=true;sfx('clink');checkState();save();}render();return true;}
  if('cxtab' in d){codexTab=d.cxtab;render();window.scrollTo(0,0);return true;}
  if('bosspick' in d){if(r&&r.bossPick&&r.bossPick.includes(d.bosspick)&&meta.perks.length<perkSlots()){meta.perks.push(d.bosspick);meta.equipped=meta.perks;r.bossPick=null;if(meta.perks.length>=5)unlock('loaded');if(typeof sfx==='function')sfx('clink');save();}render();return true;}
  if('bossskip' in d){if(r&&r.bossPick){meta.caps+=r.bossCaps||bossPerkCaps(0);r.bossPick=null;if(typeof sfx==='function')sfx('clink');save();}render();return true;}
  if('tagpick' in d){if(r&&r.tagPick&&r.tagPick.includes(d.tagpick)){meta.perks.push(d.tagpick);meta.equipped=meta.perks;r.tagPick=null;save();}render();return true;}
  if('runoffice' in d){if(meta.run&&meta.run.daily&&meta.run.prevChar!==undefined)meta.char=meta.run.prevChar;meta.run=null;screen='office';save();render();window.scrollTo(0,0);return true;}
  if('runtier' in d){meta.newRun.tier=d.runtier;render();return true;}
  if('runtoken' in d){meta.newRun.token=d.runtoken||null;render();return true;}
  if('rundaily' in d){if(runLive())return true;const old=meta.newRun;meta.newRun={deck:'plain',tier:'copper',token:null,special:null,daily:true};startRun();meta.newRun=old||{deck:'plain',tier:'copper',token:null};runPre=false;runArmed=false;render();window.scrollTo(0,0);return true;}
  if('runstart' in d){if(!meta.char){screen='pickchar';render();return true;}startRun();runPre=false;runArmed=false;render();window.scrollTo(0,0);return true;}
  if('runstoryok' in d){r.story.shift();save();render();return true;}
  if('runbeyond' in d){if(r&&r.result==='won'&&!r.endless){r.endless=true;r.phase='event';r.result=null;r.stop=RUN_STOPS.length;r.table=0;ensureStop(r.stop);r.event=pickEvent();r.eventResult=null;r.story=[{title:'Beyond the Strip',text:BEYOND_INTRO}];save();}render();window.scrollTo(0,0);return true;}
  if('runnew' in d){if(meta.run&&meta.run.daily&&meta.run.prevChar!==undefined)meta.char=meta.run.prevChar;meta.run=null;save();render();window.scrollTo(0,0);return true;}
  if('runabandon' in d){if(runArmed){runArmed=false;runLost(true);save();}else runArmed=true;render();return true;}
  if('runplay' in d){runPre=true;render();return true;}
  if('runcancel' in d){runPre=false;if(r){r.swapPick=null;r.wagerSel=0;}render();return true;}
  if('wager' in d){if(r){const v=Math.max(0,+d.wager||0);r.wagerSel=(v<=meta.caps&&v<=wagerMax(r.stop))?v:0;}render();return true;}
  if('rulesw' in d){const s2=r.stop,i=+d.rulesw;if(r.phase==='table'&&r.table===2&&!(r.swapUsed||{})[s2]&&meta.caps>=bossSwapCost(s2)){const opts=swapOptions(s2,i);if(opts.length)r.swapPick={s:s2,i,opts};}render();return true;}
  if('rulepick' in d){const pk=r.swapPick;if(pk&&pk.opts.includes(d.rulepick)&&meta.caps>=bossSwapCost(pk.s)){meta.caps-=bossSwapCost(pk.s);r.bosses[pk.s][pk.i]=d.rulepick;r.bosses[pk.s].sort((a,b)=>(RANGE_RULES.includes(b)?1:0)-(RANGE_RULES.includes(a)?1:0));(r.swapUsed=r.swapUsed||{})[pk.s]=1;r.swapPick=null;save();}render();return true;}
  if('rulekeep' in d){r.swapPick=null;render();return true;}
  if('runconfirm' in d){runPre=false;if(r.table===2){render();wantedPoster(()=>startRunTable());}else startRunTable();return true;}
  if('runskip' in d){skipTable();render();return true;}
  if('tychoskip' in d){if(r&&r.phase==='table'&&r.table===2&&gear('tycho')&&!r.tychoUsed&&r.stop<RUN_STOPS.length-1){r.tychoUsed=true;r.skips++;if(isWC()){r.days-=WC_SKIP;}r.stop++;r.table=0;r.phase='event';r.event=pickEvent();save();}render();return true;}
  if('runcontinue' in d){G=null;screen='road';render();window.scrollTo(0,0);return true;}
  if('eventpick' in d){eventChoose(+d.eventpick);render();return true;}
  if('eventdone' in d){eventDone();render();return true;}
  if('runnext' in d){r.phase='table';r.halfShop=false;armedSell=null;runShopTab='shop';save();render();window.scrollTo(0,0);return true;}
  if('runshopback' in d){if(r.offers&&r.phase==='table'){r.phase='shop';runPre=false;kitOpen=null;save();render();window.scrollTo(0,0);}return true;}
  if('kitopen' in d){kitOpen=d.kitopen||'deck';render();return true;}
  if('kitclose' in d){kitOpen=null;render();return true;}
  if('revealok' in d){closeReveal();return true;}
  if('rtab' in d){runShopTab=d.rtab;armedSell=null;render();return true;}
  if('rbuy' in d){const k=d.rbuy,el=k.startsWith('card')?document.querySelector(`[data-rbuy="${k}"]`)?.closest('.offer')?.querySelector('.card'):null,before=meta.deck.length;runShopBuy(k);if(el&&meta.deck.length>before)flyToDeck([el]);render();return true;}
  if('rreroll' in d){if(r.sponsor){r.sponsor=0;}else if(r.freeRerolls){r.freeRerolls--;}else{const c=rerollCost();if(meta.caps<c)return true;meta.caps-=c;r.rerolls=(r.rerolls||0)+1;}rerollShop();save();render();return true;}
  if('cratepick' in d){takeCrate(+d.cratepick);render();return true;}
  if('crateskip' in d){r.crate=null;save();render();return true;}
  if('pickc' in d){const pk=r.picker;if(pk){const i=+d.pickc,k=pk.sel.indexOf(i);if(k>=0)pk.sel.splice(k,1);else if(pk.sel.length<(pk.kind==='burn'?Math.min(pk.keep,burnRoom()):pk.keep))pk.sel.push(i);}render();return true;}
  if('pickdone' in d){const pk=r.picker;if(pk&&pk.kind==='burn'){const els=[...document.querySelectorAll('#app .pickcard.on')];burnCards(els,()=>{pickerDone();render();});}else{const els=[...document.querySelectorAll('#app .pickcard.on .card')];pickerDone();flyToDeck(els);render();}return true;}
  if('pickskip' in d){if(r.picker&&r.picker.kind==='burn'&&r.phase==='event')r.eventResult='You leave the fire burning and move on.';r.picker=null;if(r.phase==='shop')nextFreeBundle();save();render();return true;}
  if('wbpick' in d){const c=meta.deck[+d.wbpick],of=r.offers;if(c&&r.workbench){const fr=r.freeUpgrade>0;if(fr)r.freeUpgrade--;else if(meta.caps>=disc(6))meta.caps-=disc(6);else{r.workbench=null;save();render();return true;}c.mod=r.workbench.mod;r.workbench=null;if(of&&(!fr||!r.freeUpgrade))of.sold.upgrade=1;if(modCount()>=5)unlock('tinker');save();}render();return true;}
  if('wbcancel' in d){r.workbench=null;save();render();return true;}
  if('rsellperk' in d){const id=d.rsellperk,k='p:'+id;if(armedSell===k){meta.perks=meta.perks.filter(p=>p!==id);meta.equipped=meta.perks;meta.caps+=perkSellPrice(id);armedSell=null;save();}else armedSell=k;render();return true;}
  return false;
}


