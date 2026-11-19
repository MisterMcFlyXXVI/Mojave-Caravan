// ---------- hub ----------
const ic=(r,su)=>`<span class="ic s-${su}">${r}${SUIT_CH[su]}</span>`;
const RULES_HTML=`
<h4>The goal</h4>
<p>You and the dealer each build three caravans: piles of cards that face each other in three matchups. A caravan <b>sells</b> when its total is between <b>21 and 26</b> and beats the caravan facing it. Sell two of the three matchups to win the hand.</p>
<p class="ex"><b>Example:</b> your caravan I totals 24 and theirs totals 22. Yours sells.</p>
<h4>Card values</h4>
<p>Aces count as 1, and 2 through 10 count as their number. Jacks, Queens, Kings and Jokers have no value of their own; they change the cards they’re played on.</p>
<h4>Starting a hand</h4>
<p>Each player is dealt 8 cards. For your first three turns you must put one number card (Ace through 10) on each of your three empty caravans. No face cards and no discarding during this opening. After that, you draw back up to 5 cards after every play.</p>
<h4>Your turn</h4>
<p>Do exactly one of these:</p>
<ul><li><b>Play a card,</b> then draw.</li><li><b>Discard a card</b> you can’t use, then draw.</li><li><b>Disband</b> one of your caravans: all its cards are removed and it starts empty. You don’t draw.</li></ul>
<h4>Direction: up or down</h4>
<p>The first card just starts a caravan. The <b>second card sets its direction</b>: higher than the first means it’s <b>climbing ▲</b>, lower means it’s <b>falling ▼</b>. Every card after that must keep going the same way, compared with the <b>top card</b> (the last one played).</p>
<p class="ex"><b>Climbing:</b> ${ic('7','H')} then ${ic('9','S')}. The next card must be higher than 9, so only a 10 fits.<br><b>Falling:</b> ${ic('7','H')} then ${ic('6','C')}. The next card must be lower than 6: a 5, 4, 3, 2 or Ace.<br><b>Keeps going:</b> ${ic('3','D')} → ${ic('5','C')} → ${ic('8','H')} → ${ic('10','S')} is fine, because each card is higher than the one before it.</p>
<p class="ex"><b>Watch out:</b> a climbing caravan topped by a 10 can’t take any more number cards, except by the suit rule below. A falling caravan topped by an Ace is stuck the same way.</p>
<h4>The suit rule</h4>
<p>You can always play a card of the <b>same suit as the top card</b>, even if it goes the wrong way. When you do, it sets a new direction.</p>
<p class="ex"><b>Example:</b> ${ic('4','H')} then ${ic('8','H')} is climbing. You can still play ${ic('2','H')}, because it’s a heart. Now the caravan is falling (8 → 2), so the next card must be lower than 2, or another heart.</p>
<h4>No repeats</h4>
<p>You can never play a card with the same value as the top card, whatever the suit.</p>
<p class="ex"><b>Example:</b> on a ${ic('9','C')} you can’t play ${ic('9','D')} or another ${ic('9','C')}.</p>
<h4>Face cards</h4>
<p>Face cards attach to a number card on <b>any</b> caravan, yours or the dealer’s.</p>
<ul>
<li><b>King:</b> adds the value of the card it sits on again. Kings stack. <span class="ex-in">${ic('6','S')} + King = 12. ${ic('6','S')} + two Kings = 24.</span></li>
<li><b>Jack:</b> removes the card it’s played on, plus any face cards attached to it. <span class="ex-in">A Jack on a ${ic('9','H')} with a King on it removes 18 points at once.</span></li>
<li><b>Queen:</b> only on the <b>top</b> card of a caravan. It flips the direction and makes the Queen’s suit the caravan’s suit. <span class="ex-in">${ic('3','D')} → ${ic('5','C')} → ${ic('8','H')} is climbing. Put a Queen of spades on the 8 and it’s now falling, and spades can be played against the direction.</span></li>
<li><b>Joker:</b> on a 2–10, it removes <b>every other card of that value</b> from the whole table, both sides. On an Ace, it removes every other number card of that Ace’s suit. The card the Joker sits on stays. <span class="ex-in">A Joker on ${ic('5','C')} removes every other 5 on the table, yours included.</span></li>
</ul>
<h4>Selling and winning</h4>
<p>A caravan sells when its total is 21–26 <b>and</b> it beats the caravan facing it. Over 26 is a <b>bust</b> and can’t sell.</p>
<p class="ex">Your 23 vs their 25: <b>theirs</b> sells.<br>Your 23 vs their 28: <b>yours</b> sells, because 28 is a bust.<br>Your 23 vs their 18: <b>yours</b> sells.<br>Your 24 vs their 24: a tie. Neither sells yet; keep playing.<br>Your 19 vs their 17: neither sells.</p>
<p>The hand ends the moment <b>all three matchups have a seller at the same time</b>. Whoever sold two or three wins. Until then, a selling caravan can still be outbid, busted or knocked down.</p>
<p class="ex"><b>Example:</b> you sell caravans I and III, the dealer sells II. All three are settled, so you win 2 to 1.</p>
<h4>Fixing a bust</h4>
<p>If a caravan goes over 26, play a Jack on one of its cards to bring it down, or disband it and start over. An empty caravan takes any number card.</p>
<h4>Fine print</h4>
<ul>
<li>If you have no cards left in your hand or deck, you lose the hand.</li>
<li>If a Jack or Joker leaves two cards of the same value side by side, the caravan keeps the direction it had.</li>
<li>Decks hold at least 30 cards. In Classic, a pack has only one of each card, so you can have as many copies of a card (like J♠) as you own packs: your starter deck plus each pack you’ve earned. Jokers come two per pack.</li>
</ul>`;
const RULES_LIST=RULES_HTML;
const QUICK_QA=[
  ['When does the hand end?','Only when all three matchups have a seller at the same moment. Being ahead on two isn’t enough; the third has to settle too. Then whoever sold two or three wins.'],
  ['What counts as “settled”?','One side is at 21–26 and beats the other. Both under 21, both bust, or an exact tie (24 vs 24) is not settled yet.'],
  ['Why can’t I play this number card here?','Three checks: it can’t match the top card’s value; it has to follow the caravan’s direction (higher if ▲, lower if ▼); unless it’s the same suit as the caravan, which is always allowed.'],
  ['Can I play on the dealer’s caravans?','Only face cards. Number cards go on your own caravans. A King on their big card is the main way to bust them.'],
  ['Where can a Queen go?','Only on the top card of a caravan. It flips the direction and changes the caravan’s suit to the Queen’s suit.'],
  ['What does a King do?','Adds the card’s value again. Kings stack: a 6 with one King is 12, with two Kings is 24.'],
  ['What does a Jack do?','Removes the card it’s on, plus any face cards attached to it.'],
  ['What does a Joker do?','On a 2–10: removes every other card of that value from the whole table, yours included. On an Ace: removes every other number card of that suit.'],
  ['What if my caravan goes over 26?','It’s a bust and can’t sell. Jack one of its cards to bring it down, or disband it and start over.'],
  ['When can I discard or disband?','Any turn after the opening. Discarding swaps a card for a new draw. Disbanding throws away a whole caravan of yours.'],
  ['What happens during the opening?','For your first three turns you must start each empty caravan with a number card. No face cards, discards or disbands yet.'],
  ['What if I run out of cards?','If your hand and deck are both empty, you lose the hand.'],
  ['What are HOLO, GOLD, NEON and GHOST cards?','Road-only special finishes. Holographic: the caravan it’s in sells 1 point higher. Golden: +3 caps each time you play it, paid when the table ends. Neon: if its caravan sells, the table pays 25% more. Ghost: doesn’t take a slot in your hand.'],
];
function tableRulesHTML(){
  if(!G)return '';
  const R=G.rules,o=OPP(),items=[];
  const rng=(a)=>`${a[0]}–${a[1]}`;
  items.push(`<li><b>Sell range:</b> ${rng(R.range.p)===rng(R.range.a)?`${rng(R.range.p)} for both of you`:`you ${rng(R.range.p)}, dealer ${rng(R.range.a)}`}.</li>`);
  if(R.hand.p!==5||R.hand.a!==5)items.push(`<li><b>Hand size:</b> you draw up to ${R.hand.p}, the dealer up to ${R.hand.a}.</li>`);
  if(G.run)for(const id of (G.ruleIds||[]).filter((x,i,a)=>a.indexOf(x)===i))items.push(`<li><b>${BOSS_RULES[id].name}:</b> ${esc(BOSS_RULES[id].desc)}</li>`);
  for(const h of (o.house||[]))items.push(`<li><b>${HOUSE[h].name}:</b> ${esc(HOUSE[h].desc)}</li>`);
  if(o.rival)items.push(`<li><b>Rival:</b> ${esc(RIVALS[o.rival].rule)}</li>`);
  if(G.sig)items.push(`<li><b>Signature · ${esc(BOSS_SIGS[G.sig.id].name)}:</b> ${esc(BOSS_SIGS[G.sig.id].desc(G.sig.at))}</li>`);
  if(G.mode==='road'&&G.char&&CHARS[G.char])for(const t of CHARS[G.char].traits)items.push(`<li><b>${esc(t[1])} (${esc(CHARS[G.char].name)}):</b> ${esc(t[2])}</li>`);
  if(G.run&&meta.run){const dk=DECKS[deckIdx(meta.run.deck)];if(dk&&dk.id!=='plain')items.push(`<li><b>${esc(dk.name)}:</b> ${esc(dk.twist)}</li>`);
    for(const pk of (G.perks||[]))if(PERKS[pk])items.push(`<li><b>${esc(PERKS[pk].name)} (perk):</b> ${esc(PERKS[pk].desc)}</li>`);}
  return `<h3 class="sub">This table</h3><ul class="steps">${items.join('')}</ul>`;
}
// Goals for the current hand: bounties, town challenges, champion purses, with live progress where it can be tracked.
function goalsList(){
  if(!G)return [];
  const st=G.stats||{},out=[];
  const lanes=lanesResult(G),soldP=lanes.filter(x=>x==='p').length;
  const prog=(id)=>{
    switch(id){
      case 'noface':case 'clean':return st.faces?{state:'failed',note:'You played a face card.'}:{state:'on',note:'No face cards played so far.'};
      case 'nodiscard':case 'calm':return (st.discards||st.disbands)?{state:'failed',note:'You discarded or disbanded.'}:{state:'on',note:'No discards or disbands so far.'};
      case 'kings':return {state:(st.kings||0)>=(G.mode==='road'?2:3)?'done':'on',note:`Kings played: ${st.kings||0}/${G.mode==='road'?2:3}`};
      case 'jacks':return {state:(st.jacks||0)>=2?'done':'on',note:`Jacks played: ${st.jacks||0}/2`};
      case 'joker':case 'wild':return {state:(st.jokers||0)>=1?'done':'on',note:(st.jokers||0)?'Joker played. Now win.':'No Joker played yet.'};
      case 'quick':return (st.turns||0)>12?{state:'failed',note:`${st.turns} turns taken.`}:{state:'on',note:`Turns taken: ${st.turns||0}/12`};
      case 'sweep':return {state:'on',note:`Caravans selling right now: ${soldP}/3`};
      case 'exact26':case 'p26':{const has26=[0,1,2].some(i=>cvValue(G.p.cv[i])===26);return {state:'on',note:has26?'You have a caravan at exactly 26. Keep it selling.':'No caravan at exactly 26 yet.'};}
      case 'streak':{const cp=CP(),T=TOWNS[G.cd.ti];return {state:'on',note:`Wins in a row here: ${cp.streak[T.id]||0}. This win would make ${(cp.streak[T.id]||0)+1}/3.`};}
      case 'bigbet':return G.stake>=G.cd.max?{state:'on',note:'You bet the table limit. Win this.'}:{state:'failed',note:`Not this game: you bet ${G.stake}, the limit is ${G.cd.max}.`};
    }
    return {state:'on',note:''};
  };
  if(G.bounty){const b=BOUNTIES[G.bounty];out.push({kind:'Bounty',name:b.name,desc:b.desc,reward:`+${G.bountyPay} caps`,...prog(G.bounty)});}
  if(G.mode==='campaign'&&G.cd){
    const cp=CP(),T=TOWNS[G.cd.ti],done=cp.chal[cp.plus||0]||{};
    if(G.cd.slot==='c'&&!beatNow(G.cd.id))out.push({kind:'Champion',name:'Beat '+G.cd.name,desc:'Opens the next town and earns a holotape and a trophy card.',reward:`+${T.purse*(1+(cp.plus||0))} caps purse`,state:'on',note:''});
    for(const c of T.challenges){const ok=done[`${T.id}:${c}`];out.push({kind:'Challenge',name:CHALLENGES[c].name,desc:CHALLENGES[c].desc,reward:`+${T.chal*(1+(cp.plus||0))} caps`,...(ok?{state:'done',note:'Already completed this circuit.'}:prog(c))});}
  }
  if(G.run&&meta.run){
    const r=meta.run;
    if(r.deck==='sarsaparilla')out.push({kind:'Deck twist',name:'Sticky Fingers',desc:'Every discard costs 1 cap when the hand ends.',reward:`So far: −${st.discards||0}`,state:'info',note:''});
    if(r.deck==='blood')out.push({kind:'Deck twist',name:'Blood Money',desc:'Every Jack you play costs 2 caps when the hand ends.',reward:`So far: −${(st.jacks||0)*2}`,state:'info',note:''});
    if(has('honest'))out.push({kind:'Perk',name:'Honest Work',desc:PERKS.honest.desc,reward:'+6 caps',...prog('noface')});
    if(has('nose'))out.push({kind:'Perk',name:'Bloodhound',desc:PERKS.nose.desc,reward:'+4 per caravan',...prog('p26')});
  }
  return out;
}
function goalsHTML(){
  const gs=goalsList();if(!gs.length)return '';
  const lbl={on:'In progress',done:'Done',failed:'Missed',info:''};
  const intro=G.mode==='campaign'?'Side challenges pay extra caps and reputation when you win a hand that meets them.':G.mode==='road'?'Bounties are bonus caps posted at the table. Meet the condition and win the hand to collect.':'';
  return `${intro?`<p class="note">${intro}</p>`:''}<div class="goals">${gs.map(g=>`<div class="goal ${g.state}"><div><small>${esc(g.kind)}</small><b>${esc(g.name)}</b><span>${esc(g.desc)}</span>${g.note?`<em>${esc(g.note)}</em>`:''}</div><div class="gr"><span class="pill num">${esc(g.reward)}</span>${lbl[g.state]?`<i>${lbl[g.state]}</i>`:''}</div></div>`).join('')}</div>
    <p class="note">Bounties and challenges only pay if you win the hand.</p>`;
}
function rulesPopHTML(){
  if(rulesOpen==='goals')return `<div class="overlay rulespop"><div class="panel result" role="dialog" aria-label="Goals" style="text-align:left"><div class="sect-h"><h2 style="font-size:26px;color:var(--neon)">Goals</h2><button class="btn" data-rulesclose>Close</button></div>${goalsHTML()||'<p class="note">No bounties or challenges at this table.</p>'}<p class="note">Tap <b>Rules</b> for this table’s rules and the full rulebook.</p><button class="btn hot" data-rulesclose style="margin-top:10px;width:100%">Back to the table</button></div></div>`;
  return `<div class="overlay rulespop"><div class="panel result" role="dialog" aria-label="Rules" style="text-align:left">
    <div class="sect-h"><h2 style="font-size:26px;color:var(--neon)">${rulesOpen==='goals'?'Goals':'Rules'}</h2><button class="btn" data-rulesclose>Close</button></div>
    ${tableRulesHTML()}
    <h3 class="sub">Quick answers</h3>
    <div class="qa">${QUICK_QA.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    <details class="rules"><summary>The full rules</summary><div class="rulebook">${RULES_HTML}</div></details>
    ${G&&G.mode==='road'?`<details class="rules"><summary>The Road</summary><ul>${ROAD_RULES}</ul></details>`:''}
    <button class="btn hot" data-rulesclose style="margin-top:14px;width:100%">Back to the table</button>
  </div></div>`;
}
const backBtn=(to,label)=>`<button class="btn" data-go="${to}">← ${label}</button>`;
function tutRow(id,o,done,hot,data){
  return `<div class="stop${done?' beat':''}">
    <div class="mile">${done?'✓':'★'}</div>
    <div><div class="place">${esc(o.place)}</div><div class="who">${esc(o.name)} · ${esc(o.blurb)}</div>${data.terms?`<div class="terms num">${data.terms}</div>`:''}</div>
    <button class="btn${hot?' hot':''}" ${data.attr}>${done?'Replay':'Learn'}</button>
  </div>`;
}

// ---------- customize ----------
function renderLook(){
  const L=meta.look;
  const sample=`<div class="lookprev table"><div class="lane"><div class="stack" style="height:calc(var(--ch) + var(--off) * 2)">
      <div class="entry" style="top:0">${cardHTML({rank:'7',suit:'H'})}<span class="chip s-D" style="left:calc(var(--cw) + 3px)">K♦</span></div>
      <div class="entry" style="top:calc(var(--off) * 1)">${cardHTML({rank:'9',suit:'C'})}</div>
      <div class="entry" style="top:calc(var(--off) * 2)">${cardHTML({rank:'10',suit:'D'})}</div></div></div>
    <div class="prevrow">${cardHTML({rank:'A',suit:'S'})}${cardHTML({rank:'Q',suit:'H'})}${cardHTML({rank:'JK',suit:null})}<div class="card back"></div></div></div>`;
  const opt=(kind,o,inner)=>{const ok=lookUnlocked(o),a=o.unlock&&ACH.find(x=>x.id===o.unlock);
    if(kind==='back'&&o.art)return `<div class="opt packopt${ok?' owned':' locked'}" data-back="${o.id}"><span class="optart">${inner}${ok?'':'<i class="lockbadge sm" aria-hidden="true">🔒︎</i>'}</span><span>${esc(o.name)}</span>${ok?'<small class="req">In your collection</small>':a?`<small class="req">${esc(a.name)}: ${esc(a.desc)}</small>`:''}</div>`;
    return `<button class="opt${ok?'':' locked'}" data-look="${kind}:${o.id}" data-${kind}="${o.id}" aria-pressed="${L[kind]===o.id}" ${ok?'':'disabled'}><span class="optart">${inner}${ok?'':'<i class="lockbadge sm" aria-hidden="true">🔒︎</i>'}</span><span>${esc(o.name)}</span>${!ok&&a?`<small class="req">${esc(a.name)}: ${esc(a.desc)}</small>`:''}</button>`;};
  app.innerHTML=`
  <div class="mbar">${backBtn(lookFrom,'Back')}</div>
  <section class="panel">
    <h2 style="font-size:28px">Customize your table</h2>
    <p class="note">Changes apply everywhere right away and save in this browser.</p>
    ${sample}
    <h3 class="sub">Card faces</h3>
    <div class="opts">${LOOKS.face.map(o=>opt('face',o,`<span class="duo">${cardHTML({rank:'7',suit:'H'})}${cardHTML({rank:'K',suit:'S'})}</span>`)).join('')}</div>
    <h3 class="sub">Card font</h3>
    <div class="opts">${LOOKS.font.map(o=>opt('font',o,`<span class="duo">${cardHTML({rank:'10',suit:'H'})}${cardHTML({rank:'Q',suit:'S'})}</span>`)).join('')}</div>
    <h3 class="sub">Classic Card Backs</h3>
    <p class="note">You start with one standard 54-card deck. Pick any of these backs for it, free. They’re different looks for that same deck, not extra cards.</p>
    <div class="opts">${LOOKS.back.filter(o=>!o.art).map(o=>opt('back',o,'<div class="card back"></div>')).join('')}</div>
    <h3 class="sub">Packs <span class="pill num" style="font-size:12px;vertical-align:middle">${LOOKS.back.filter(o=>o.art&&lookUnlocked(o)).length}/${LOOKS.back.filter(o=>o.art).length}</span></h3>
    <p class="note">Each pack is a full extra set of cards with its own back, earned through achievements. Every pack you own lets you hold one more copy of every card in Classic. Your deck is shuffled every hand, so the cards from all your packs mix together, and whichever card is on top shows its own pack’s back.</p>
    <div class="opts">${LOOKS.back.filter(o=>o.art).map(o=>opt('back',o,'<div class="card back"></div>')).join('')}</div>
    ${propsPickerHTML()}
    <h3 class="sub">Play mat</h3>
    <div class="opts">${LOOKS.mat.map(o=>opt('mat',o,'<div class="table swatch"></div>')).join('')}</div>
    <h3 class="sub">Suit colors</h3>
    <button class="prow toggle" data-togglepip aria-pressed="${!!L.pip}"><div><b>Pip-Boy terminal ${L.pip?'on':'off'}</b><span>Turns the whole game into a green Pip-Boy screen, with scanlines.</span></div><span class="sw" aria-hidden="true"></span></button>
    <button class="prow toggle" data-togglefour aria-pressed="${L.four}"><div><b>Four-color suits ${L.four?'on':'off'}</b><span>Diamonds turn blue and clubs turn green, so suits are easier to tell apart at a glance.</span></div><span class="sw" aria-hidden="true"></span></button>

  </section>`;
}

// ---------- home: pick a mode ----------
function renderHome(){
  app.innerHTML=`
  <section class="hero">
    <div class="neon" aria-label="Caravan">CAR<span class="dim">A</span>VAN</div>
    <p class="tagline">The Mojave’s card game. Pick how you want to play.</p>
  </section>
  <div class="modes">
    <button class="mode" data-go="classic">
      <span class="mk">Classic</span>
      <span class="mt">Caravan never changes</span>
      <span class="md">Straight Caravan, the way it’s dealt in the Mojave. Play a single game, or work a whole campaign from Goodsprings to the Strip. No perks, no tricks.</span>
      <span class="ms num">Record ${meta.classic.wins}W · ${meta.classic.losses}L${meta.classic.deck?` · deck ${meta.classic.deck.length}`:' · no deck yet'}</span>
    </button>
    <button class="mode" data-go="road">
      <span class="mk">Roguelite</span>
      <span class="mt">The Road</span>
      <span class="md">A roguelite run from Goodsprings to the Strip. Start with a plain deck, build it up between tables, and survive the bosses. A little Grit gets you past a bad table or two, but run out and the run is over.</span>
      <span class="ms num">${runLive()&&!isWC()?`Run in progress · ${meta.run.stop>=RUN_STOPS.length?`mile ${meta.run.stop-RUN_STOPS.length+1} beyond the Strip`:`stop ${meta.run.stop+1} of ${RUN_STOPS.length}`} · ${meta.caps} caps`:`Runs won: ${meta.runsWon||0}`}</span>
    </button>
    <button class="mode wcmode" data-wcgo>
      <span class="mk">Special run · Fallout 1</span>
      <span class="mt">The Water Chip</span>
      <span class="md">Vault 13’s water chip is broken. Play your way from Vault 15 to the Cathedral before 150 days of water run out. Fallout 1 bosses, companions and secrets.</span>
      <span class="ms num">${isWC()?`Run in progress · ${placeOf(meta.run.stop)} · ${meta.run.days} days left`:meta.charFlags&&meta.charFlags.vault?'Vault 13 saved':'Not saved yet'}</span>
    </button>
  </div>
  ${resumeHTML()}${installHTML()}`;
}

// ---------- classic: single game + campaign ----------
// Dusty Rita: a free table that's always open, for getting back on your feet.
const RITA={name:'Dusty Rita',place:'Rita’s Porch, Goodsprings',blurb:'Plays for fun, pays for pity. Never takes a cap off anybody.',noise:40,extra:{J:1,Q:1,K:1},pay:5,under:25};
// Velma's tab: borrow caps against a flat fee. One loan at a time; half of every win pays it down.
const TAB={lender:'Velma',bar:'the Prospector Saloon',options:[25,50],fee:0.2};
const tabOwe=amt=>Math.ceil(amt*(1+TAB.fee));
const CAMP_START=100, SET_PRICE=150, BET_STEPS=[0,10,25,50,75,100,150,200,300,500];
const singlePrice=k=>clPrice(fromKeyC(k).rank)*2;
let campPick=null, buildMode='quick', buildFrom='classic';
function freshCamp(){
  const coll=fullSetCounts();
  return {started:true,caps:CAMP_START,coll,deck:{...coll},beaten:[],wins:0,losses:0,rec:{},done:false,lastBet:{}};
}
function renderClassic(){
  const C=meta.classic, d=C.deck, cp=C.camp;
  app.innerHTML=`
  <div class="mbar">${backBtn('home','Modes')}<span class="pill num">${C.wins}W · ${C.losses}L</span></div>
  <section class="hero small">
    <div class="neon sm">Caravan never changes</div>
    <p class="tagline">New Vegas rules, nothing added. Play one hand, or work the whole circuit.</p>
  </section>
  <section class="panel">
    <div class="road">
      ${tutRow(-1,TUTOR,meta.tutorialDone,!meta.tutorialDone,{attr:'data-cplay="-1"',terms:'Guided hand · about 5 minutes'})}
    </div>
  </section>
  <section class="panel" style="margin-top:14px">
    <div class="sect-h"><h2>Classic campaign</h2>${cp?`<span class="pill num">${capN(cp.caps)}</span>`:''}</div>
    <p class="note">A long road from Goodsprings to the High Table on the Strip, with a story to follow. Six towns, each with regulars, a champion, a high roller, a card vendor and side challenges. Start with one 54-card deck and ${CAMP_START} caps, bet on every game, grow your collection, and find the Old Man. Then run it again, meaner.</p>
    <div class="road"><div class="stop${cp&&cp.done?' beat':''}">
      <div class="mile">${cp?(cp.done?'✓':`${Math.min(cp.towns||1,6)}/6`):'★'}</div>
      <div><div class="place">${cp?(cp.career?`${cp.plus?`Circuit ${cp.plus+1} · `:''}${TOWNS[Math.min(cp.towns||1,6)-1].name}`:'Continue your circuit'):'Not started'}</div>
        <div class="who">${cp?`${cp.wins}W · ${cp.losses}L · ${(cp.trophies||[]).length} trophies · ${(cp.tapes||[]).length}/6 holotapes`:'Six towns, from Goodsprings to the High Table.'}</div></div>
      <button class="btn hot" data-go="campaign">${cp?'Continue':'Start'}</button>
    </div></div>
  </section>
  <section class="panel" style="margin-top:14px">
    <div class="sect-h"><h2>Single game</h2></div>
    <p class="note">One hand, no stakes. ${d?`Your deck: ${d.length} cards. Change it with the pencil at the top.`:'First, buy a deck with a fixed budget.'}</p>
    ${d?'':`<button class="btn${meta.tutorialDone?' hot':''}" data-build="quick" style="margin-bottom:10px">Buy a deck</button>`}
    <div class="road">
      ${CLASSIC_DEALERS.map((o,i)=>{const r=C.rec[i]||{w:0,l:0};return `<div class="stop">
        <div class="mile lvl">${['I','II','III','IV'][i]}</div>
        <div><div class="place">${esc(o.level)}</div><div class="who">${esc(o.name)} · ${esc(o.blurb)}</div><div class="terms num">Your record ${r.w}W · ${r.l}L</div></div>
        ${d?`<button class="btn" data-cplay="${i}">Deal</button>`:`<button class="btn" data-build="quick">Need a deck</button>`}
      </div>`;}).join('')}
    </div>
  </section>`;
}



function renderBuild(){
  const camp=buildMode==='camp', cp=meta.classic.camp;
  if(!buildDraft)buildDraft=camp?{...cp.deck}:specToCounts(meta.classic.deck||[]);
  const tIn=camp&&cp.trophies?cp.trophies.filter(t=>t.inDeck).length:0;
  const m=buildDraft, cost=countsCost(m), size=countsSize(m)+tIn, left=CL_BUDGET-cost;
  const nNums=numCount(m);
  const limit=k=>camp?(cp.coll[k]||0):capFor(k);
  const problem=size<MIN_DECK?`Add ${MIN_DECK-size} more card${MIN_DECK-size>1?'s':''} (30 minimum).`:(!camp&&left<0)?`Over budget by ${-left}.`:nNums<MIN_NUMS?`Add ${MIN_NUMS-nNums} more number card${MIN_NUMS-nNums>1?'s':''} (${MIN_NUMS} minimum, so you can always open).`:'';
  const tile=k=>{const c=fromKeyC(k),n=m[k]||0,pr=clPrice(c.rank),lim=limit(k);
    if(camp&&!lim)return '';
    const canAdd=n<lim&&(camp||pr<=left);
    return `<div class="btile${n?' have':''}">
      <div class="bcard">${cardHTML(c)}${n?`<span class="cnt">×${n}</span>`:''}</div>
      ${packDots(k,n)}<div class="pr num">${camp?`${n} of ${lim} owned`:`${pr}c · ${n}/${lim}`}</div>
      <div class="pm"><button class="btn" data-dec="${k}" ${n?'':'disabled'} aria-label="Remove one ${cardName(c)}">−</button><button class="btn" data-inc="${k}" ${canAdd?'':'disabled'} aria-label="Add one ${cardName(c)}">+</button></div>
    </div>`;};
  const ranks=[...NUM_RANKS,'J','Q','K'];
  const groups=SUITS.map(su=>{const tiles=ranks.map(r=>tile(r+su)).join('');return tiles?`<h3 class="sub">${SUIT_CH[su]} ${({S:'Spades',H:'Hearts',D:'Diamonds',C:'Clubs'})[su]}</h3><div class="bgrid">${tiles}</div>`:'';}).join('');
  const jt=tile('JK');
  app.innerHTML=`
  <div class="mbar">${backBtn(buildFrom,'Back')}${camp?`<span class="pill num">${size} in deck</span>`:`<span class="pill num"><span class="cap"></span> ${left} of ${CL_BUDGET} left</span>`}</div>
  <section class="panel">
    <h2 style="font-size:28px">${camp?'Build your deck':'Card buy'}</h2>
    ${camp?`<p class="note">Choose cards from your collection: at least ${MIN_DECK}, with at least ${MIN_NUMS} number cards. Changes are free, just like the original. You can only use cards you own; the number under each card is how many you have. Buy more from the vendor.</p>
      ${deckLimitHTML()}
      <div class="presets"><button class="btn ghost" data-preset="all">Use every card I own</button><button class="btn ghost" data-preset="clear">Clear all</button></div>`
    :`<ul class="steps">
      <li>You have <b>${CL_BUDGET} caps</b> to spend. Each card shows its price.</li>
      <li>Your deck needs <b>at least ${MIN_DECK} cards</b>, ${MIN_NUMS} of them numbers. There’s no maximum, but bigger decks draw your best cards less often.</li>
      <li>Tap <b>+</b> and <b>−</b> to add and remove cards, or start from a ready-made deck below and tweak it.</li>
      <li>This budget only applies to Classic. The Road has its own caps.</li>
    </ul>
    ${deckLimitHTML()}
    <h3 class="sub">Ready-made decks</h3>
    <div class="presets">${Object.entries(STARTERS).map(([id,s])=>{const sp=s.build();return `<button class="spoil" data-preset="${id}"><b>${s.name}</b><span>${s.desc}</span><span>${deckSummary(sp)} Costs ${countsCost(specToCounts(sp))} caps.</span></button>`;}).join('')}
      <button class="btn ghost" data-preset="clear">Clear all</button></div>`}
    ${groups}
    ${jt?`<h3 class="sub">Jokers</h3><div class="bgrid">${jt}</div>`:''}
  </section>
  <div class="buildbar">
    <span class="num"><b>${size}</b> cards${tIn?` (incl. ${tIn} troph${tIn===1?'y':'ies'})`:''} · ${nNums} numbers${camp?'':` · ${left} caps left`}</span>
    <span class="why">${esc(problem)}</span>
    <button class="btn hot" data-savedeck ${problem?'disabled':''}>Save deck</button>
  </div>`;
}
function startRita(){
  const cp=CP();if(campDeckSize(cp)<MIN_DECK)return;
  campPick=null;
  G=newMatch(campDeckSpec(),addFaces(baseNumbers(),RITA.extra),0,baseRules());
  G.mode='campaign';G.rita=true;G.stake=0;G.noise=RITA.noise;
  enterMatch();
}
function payTab(cp,amount){const n=Math.min(amount,cp.tab||0,cp.caps);if(n>0){cp.caps-=n;cp.tab-=n;}return n;}

// ---------- road ----------
let charInfo=null;
function charBioHTML(id){
  const c=CHARS[id],bio=CHAR_BIO[id],ok=charUnlocked(id),on=meta.char===id,path=(meta.path[id]||[]).length;
  return `<div class="overlay" data-closeinfo-bg><div class="panel result biocard" role="dialog" aria-label="${esc(c.name)} bio">
    <div class="biohead"><div class="bioimg${ok?'':' shade'}"><img src="${portrait(id)}" alt="${esc(c.name)}">${ok?'':'<span class="lockbadge" aria-hidden="true">🔒︎</span>'}</div>
      <div><h2>${esc(c.name)}</h2><div class="ctag">${esc(c.tag)}</div><blockquote>“${esc(bio.quote)}”</blockquote></div></div>
    <p class="story">${esc(bio.story)}</p>
    <div class="stats">${STAT_NAMES.map((n,i)=>`<div class="stat"><span>${n}</span><i>${Array.from({length:10},(_,k)=>`<b class="${k<bio.stats[i]?'on':''}"></b>`).join('')}</i><em>${bio.stats[i]}</em></div>`).join('')}</div>
    <h3 class="sub">Abilities</h3>
    <ul class="traits">${c.traits.map(([k,n,dsc])=>`<li class="${k==='+'?'pro':k==='='?'meh':'con'}"><b>${k} ${esc(n)}</b> ${esc(dsc)}</li>`).join('')}</ul>
    <h3 class="sub">On the Road</h3>
    <p class="route">${ORIGINALS.includes(id)||NEWCOMERS.includes(id)?'Meets rivals from the cast along the way. Final table: Greg.':id==='greg'?'Meets three rivals from the cast each run. Final table: Jeanita.':'Meets three rivals from the cast and Greg each run. Final table: Silver Lou.'}</p>
    ${ok?'':`<p class="locknote">Locked. ${esc(c.unlock)}</p>`}
    <div class="hubbtns" style="justify-content:center">${ok?`<button class="btn${on?'':' hot'}" data-pickchar="${id}" ${on?'disabled':''}>${on?'Playing':'Play as '+esc(c.name.split(' ')[0])}</button>`:''}<button class="btn" data-closeinfo>Close</button></div>
  </div></div>`;
}
function renderPickChar(){
  app.innerHTML=`
  <div class="mbar">${backBtn('home','Modes')}${capsHTML(meta.caps)}</div>
  <section class="panel">
    <h2 style="font-size:28px">Who’s playing?</h2>
    <p class="note">Each character changes the rules a little and meets their own rivals on the Road. Tap a portrait for the full bio. You can switch characters before each run.</p>
    <div class="chars">${CHAR_ORDER.map(id=>{const c=CHARS[id],ok=charUnlocked(id),on=meta.char===id;
      return `<div class="charcard${ok?'':' locked'}${on?' on':''}">
        <button class="cimg${ok?'':' shade'}" data-charinfo="${id}" aria-label="${esc(c.name)} bio"><img src="${portrait(id)}" alt="">${ok?'':'<span class="lockbadge" aria-hidden="true">🔒︎</span>'}</button>
        <div class="cbody"><h3>${esc(c.name)}${ok?'':' <span class="tag lose">LOCKED</span>'}</h3><div class="ctag">${esc(c.tag)}</div>
        <p class="cbio">${esc(c.bio)}</p>
        <ul class="traits">${c.traits.map(([k,n,dsc])=>`<li class="${k==='+'?'pro':k==='='?'meh':'con'}"><b>${k} ${esc(n)}</b> ${esc(dsc)}</li>`).join('')}</ul>
        ${ok?'':`<p class="locknote">${esc(c.unlock)}</p>`}
        <div class="hubbtns" style="margin-top:0">${ok?`<button class="btn${on?'':' hot'}" data-pickchar="${id}" ${on?'disabled':''}>${on?'Playing':'Play as '+esc(c.name.split(' ')[0])}</button>`:`<button class="btn" disabled>Locked</button>`}<button class="btn ghost" data-charinfo="${id}">Bio</button></div></div></div>`;}).join('')}</div>
  </section>
  ${charInfo?charBioHTML(charInfo):''}`;
}


// ---------- shop ----------
function sortSpec(a,b){
  const order=r=>r==='A'?1:r==='J'?11:r==='Q'?12:r==='K'?13:r==='JK'?14:r==='LG'?20:parseInt(r,10);
  return order(a.rank)-order(b.rank)||String(a.legend||'').localeCompare(String(b.legend||''))||String(a.suit).localeCompare(String(b.suit));
}

