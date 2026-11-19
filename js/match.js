// ---------- match ----------
function laneHTML(side,l,lanes,selMoves,proj){
  proj=proj||{};
  const R=G.rules, cv=G[side].cv[l], v=cvValue(cv), st=cvState(cv), w=lanes[l], r=laneRange(G,side,l);
  const hide=R.hideOpp&&side==='a'&&!G.over;
  const vcls=hide?'':v>r[1]?'bust':inR(v,r)?'ok':'';
  const arrow=cv.length<2&&!cv.some(e=>e.faces.some(f=>f.rank==='Q'))?'':st.dir>0?'▲':st.dir<0?'▼':'•';
  let tag='';
  if(!R.hideOpp||G.over)tag=w?(w===side?`<span class="tag">${G.over?'SOLD':'AHEAD'}</span>`:`<span class="tag lose">${G.over?'OUTBID':'BEHIND'}</span>`):(v>r[1]?'<span class="tag lose">BUST</span>':'');
  else if(side==='p')tag=v>r[1]?'<span class="tag lose">BUST</span>':inR(v,r)?'<span class="tag">IN RANGE</span>':'';
  let can=false;
  if(side==='a'&&legendTarget!=null&&cv.length)can=true;
  if(side==='a'&&booneMode&&cv.some(e=>e.faces.some(f=>f.rank==='K'||f.rank==='Q')))can=true;
  if(side==='p'&&batMode&&cv.length)can=true;
  if(side==='p'){
    if(disbandMode&&cv.length)can=true;
    if(selMoves.some(m=>m.t==='num'&&m.lane===l))can=true;
  }
  const fx=G.fx&&!G.fx.done&&G.fx.side===side&&G.fx.lane===l?G.fx:null;
  const flash=fx&&!motionOn()?(fx.rank==='J'?' shake':fx.by==='a'?' flash':''):'';
  const pcls=v2=>v2>r[1]?'bust':inR(v2,r)?'ok':'';
  const entries=cv.map((e,i)=>{
    const ce=selMoves.some(m=>m.t==='face'&&m.side===side&&m.lane===l&&m.idx===i)||(turretMode&&side==='a'&&i===cv.length-1);
    const ek=`E${side}${l}${i}`, anim=fx?(fx.kind==='num'&&i===cv.length-1&&!motionOn()?' land-'+fx.by:(fx.kind==='face'&&fx.rank!=='J'&&i===fx.idx?' pop'+(fx.rank==='K'&&motionOn()?' kingflash':''):'')):'';
    return `<div class="entry${ce?' can':''}${anim}" data-side="${side}" data-lane="${l}" data-idx="${i}" data-cid="${e.card.id}" data-zone="cv" style="top:calc(var(--off) * ${i});--tilt:${tiltOf(e.card.id)}">${cardHTML(e.card)}${
      e.faces.map((f,k)=>`<span class="chip${f.rank==='JK'?' jk':' s-'+f.suit}" style="left:calc(var(--cw) + 2px + ${(k%3)*17}px);top:${2+Math.floor(k/3)*21}px">${f.rank==='JK'?'★':f.rank+SUIT_CH[f.suit]}</span>`).join('')}${proj[ek]!=null?`<span class="ebadge ${pcls(proj[ek])}">=${proj[ek]}</span>`:''}</div>`;
  }).join('');
  const h=Math.max(0,cv.length-1);
  const isBust=!hide&&v>r[1];
  return `<div class="lane${can?' can':''}${flash}${isBust?' isbust':''}" data-side="${side}" data-lane="${l}" ${can?'role="button" tabindex="0"':''} aria-label="${side==='p'?'Your':'Their'} caravan ${ROMAN[l]}${hide?'':`, value ${v}`}">
    <div class="lhead"><b class="v num ${vcls}" data-lv="${side}${l}" data-val="${hide?-1:v}">${hide&&cv.length?'??':v}</b><span class="dir">${arrow}${st.suit&&cv.length?SUIT_CH[st.suit]:''}</span>${tag}${proj['L'+l]!=null&&side==='p'?`<span class="proj ${pcls(proj['L'+l])}">→ ${proj['L'+l]}</span>`:''}</div>
    <div class="stack" style="height:calc(var(--ch) + var(--off) * ${h})">${cv.length?entries:`<div class="slot">${ROMAN[l]}</div>`}${w===side&&G.over?`<div class="stampmark" data-k="${side}${l}">SOLD</div>`:''}</div>
  </div>`;
}
// If a number card can go on a caravan only because of the suit rule (not its direction), say why.
function suitOnly(cv,c){
  if(cv.length<2||c.mod==='wild'||!canPlayNum(cv,c,G.rules.color.p))return null;
  const top=cv[cv.length-1].card,{dir,suit,wild}=cvState(cv);
  if(dir===0||(dir>0?val(c)>val(top):val(c)<val(top)))return null;
  if(wild)return 'the top card is Wild';
  if(c.suit===suit)return `${SUIT_CH[suit]} matches`;
  return `same color as ${SUIT_CH[suit]}, Two-Tone`;
}
function whyNot(cv,c){
  if(!cv.length)return null;
  if(canPlayNum(cv,c,G.rules.color.p))return null;
  const top=cv[cv.length-1].card,{dir,suit}=cvState(cv);
  if(val(c)===val(top))return `can’t repeat a ${top.rank}`;
  if(dir>0)return `climbing from ${top.rank}, so it needs higher than ${top.rank} or a ${SUIT_CH[suit]}`;
  if(dir<0)return `falling from ${top.rank}, so it needs lower than ${top.rank} or a ${SUIT_CH[suit]}`;
  return 'not allowed';
}
// When the selected hand card is upgraded or has a special finish, spell out what that does under the tip.
function selPerkTip(){
  if(G.over||sel==null)return '';
  const c=G.p.hand[sel];if(!c)return '';
  if(c.legend&&typeof LEGENDS!=='undefined'&&LEGENDS[c.legend])return legendTipHTML(c);
  const rows=[];
  if(c.mod&&typeof MODS!=='undefined'&&MODS[c.mod])rows.push(`<li><span class="ptag mod">${MODS[c.mod].tag}</span><b>${esc(MODS[c.mod].name)} upgrade:</b> ${esc(MODS[c.mod].desc)}</li>`);
  if(c.ed&&typeof EDITIONS!=='undefined'&&EDITIONS[c.ed])rows.push(`<li><span class="ptag ed ed-${c.ed}">${EDITIONS[c.ed].tag}</span><b>${esc(EDITIONS[c.ed].name)} finish:</b> ${esc(EDITIONS[c.ed].desc)}</li>`);
  if(!rows.length)return '';
  return `<ul class="seltip" aria-live="polite">${rows.join('')}</ul>`;
}
function hintText(selMoves){
  if(G.over)return '';
  if(G.turn!=='p')return `${OPP().name.split(' ').slice(-1)[0]} is thinking…`;
  const setup=G.setupLeft.p>0;
  if(disbandMode)return 'Tap one of your caravans to disband it. Tap Disband again to cancel.';
  if(booneMode)return 'Boone’s aiming. Tap a dealer caravan with a King or Queen on it.';
  if(batMode)return 'Tap one of your caravans to knock its top card off.';
  if(sel!=null&&G.p.hand[sel]&&G.p.hand[sel].legend)return legendTarget!=null?'Tap one of the dealer’s caravans to aim it.':'A Legend card. Play it with the button below, or discard it.';
  if(sel==null){
    if(setup)return `Opening: put a number card on each empty caravan (${3-G.setupLeft.p}/3).`;
    return G.extra?'Jet: you get another play after this one.':'Pick a card from your hand.';
  }
  const c=G.p.hand[sel];
  const plays=selMoves.filter(m=>m.t!=='discard');
  if(G.rules.banned.includes(c.rank))return `${FACE_NAME[c.rank]}s are banned at this table. Discard it, or pick another card.`;
  if(isNum(c)&&!setup){
    const blocked=[0,1,2].map(l=>{const r=whyNot(G.p.cv[l],c);return r?`${ROMAN[l]}: ${r}`:null;}).filter(Boolean);
    if(!plays.length){const dead=G.rules.dead&&G.rules.dead.p&&G.rules.dead.p.includes(c.rank);return dead?`${cardName(c)} is dead at this table. Discard it, or pick another card.`:`${cardName(c)} can’t go anywhere${blocked.length?`. ${blocked.join('. ')}`:''}. Discard it, or pick another card.`;}
    const bySuit=[0,1,2].map(l=>{const r=suitOnly(G.p.cv[l],c);return r?`${ROMAN[l]} works by the suit rule (${r})`:null;}).filter(Boolean);
    return `Tap a glowing caravan to play it.${bySuit.length?` ${bySuit.join('. ')}.`:''}${blocked.length?` Not ${blocked.join('. Not ')}.`:''}`;
  }
  if(!plays.length)return setup?(isNum(c)?`${cardName(c)} is dead at this table. Pick another number card.`:'Openings take number cards only. Pick a number card.'):`${cardName(c)} has nowhere legal to go. Discard it, or pick another.`;
  if(isNum(c))return 'Tap a glowing caravan to play it.';
  return {J:'Tap a card to knock it out, with anything stacked on it.',Q:'Tap the top card of a caravan to flip its direction and change its suit to the Queen’s.',K:`Tap a card to multiply it by ${G.rules.kingMult.p}.`,JK:`Tap a card. On an Ace, it clears every other card of that suit; on a 2–10, every other card of that value. The card it’s on stays${G.rules.jokerproof&&G.rules.jokerproof.p?' (yours are safe).':'. Hits both sides.'}`}[c.rank];
}
function coachHTML(){
  const S=tutSteps(), n=G.tut.step, step=S[n];
  const waiting=G.turn!=='p';
  return `<div class="coach" aria-live="polite">
    <div class="k"><span>Lesson ${Math.min(n+1,S.length)} of ${S.length} · ${esc(step.title)}</span><button class="btn ghost" data-skiptut>Skip lessons</button></div>
    <div>${waiting?`${esc(OPP().name)} is making a move…`:esc(step.say)}</div>
    ${!waiting&&step.why?`<p class="why"><b>${step.move?'Why':'Tip'}:</b> ${esc(step.why)}</p>`:''}
    ${step.info&&!waiting?'<button class="btn hot go" data-tutnext>Next</button>':!step.move&&!waiting?'<button class="btn hot go" data-skiptut>Play out the hand</button>':''}
  </div>`;
}
function rulesBar(){
  if(isClassicish()||G.opp===-1)return '';
  const o=OPP(), R=G.rules, bits=[];
  const rp=rangeTxt(R.range.p), ra=rangeTxt(R.range.a);
  bits.push(`<span class="rb">Sell ${rp===ra?rp:`you ${rp} · them ${ra}`}</span>`);
  for(const h of o.house)bits.push(`<span class="rb house-chip">${HOUSE[h].name}</span>`);
  if(G.run)for(const id of (G.ruleIds||[]).filter((x,i,a)=>a.indexOf(x)===i))bits.push(`<span class="rb house-chip" title="${esc(BOSS_RULES[id].desc)}">${BOSS_RULES[id].name}</span>`);
  if(G.char&&CHARS[G.char])bits.push(`<span class="rb char-chip">${CHARS[G.char].name}</span>`);
  if(o.rival)bits.push(`<span class="rb house-chip">Rival: ${RIVALS[o.rival].rule}</span>`);
  if(G.sig)bits.push(`<span class="rb house-chip" title="${esc(BOSS_SIGS[G.sig.id].desc(G.sig.at))}">${esc(sigLabel())}</span>`);
  for(const p of (G.perks||[]))bits.push(`<span class="rb perk-chip">${PERKS[p].name}</span>`);
  if(G.bounty){const b=BOUNTIES[G.bounty];bits.push(`<button class="rb bounty-chip" data-goalsopen>Bounty: ${b.name} +${G.bountyPay}</button>`);}
  return `<div class="rulesbar">${bits.join('')}</div>`;
}
function chemBar(myTurn){
  if(isClassicish()||G.opp===-1)return '';
  const pouch=chemPouch();
  let owned=Object.keys(CHEMS).filter(id=>pouch[id]>0);
  if(tutActive()){const st=tutSteps()[G.tut.step];if(!st||!st.move||st.move.t!=='chem')return '';owned=[st.move.id];}
  if(!owned.length)return '';
  const ok=myTurn&&G.setupLeft.p===0&&!G.chemTurn;
  return `<div class="chems">${owned.map(id=>{
    const off=!ok||(id==='spy'&&G.peek)||(id==='coffee'&&G.extra)||((id==='shoe'||id==='fresh')&&!G.p.deck.length)||(id==='buff'&&G.buffed)||(id==='medx'&&G.rules.jackproof.p);
    return `<button class="btn chem" data-chem="${id}" ${off?'disabled':''} title="${esc(CHEMS[id].desc)}">${CHEMS[id].name} ×${pouch[id]}</button>`;}).join('')}
    <span class="chem-note">${G.setupLeft.p>0?'Chems unlock after the opening.':G.chemTurn?'One chem per turn.':''}</span></div>`;
}
let turretMode=false,legendTarget=null,booneMode=false,batMode=false;
// ---- Legend cards: Road-only cards with one-off powers. Playing one doesn't use your turn; you draw a replacement. ----
const LEGENDS={
  repeater:{name:'Lincoln’s Repeater',rar:'rare',desc:'Shoot any one card out of a dealer caravan, along with everything attached to it.',target:true},
  stealth:{name:'Stealth Boy',rar:'rare',desc:'For the rest of this hand, the dealer can’t play anything on your caravans.'},
  house:{name:'Mr. House',rar:'rare',desc:'The House always wins: take 2 random cards from the dealer’s hand.'},
  quantum:{name:'Nuka-Cola Quantum',rar:'rare',desc:'Your hand fills up to 8 cards.'},
  pipboy:{name:'Pip-Boy 3000',rar:'rare',desc:'V.A.T.S. targeting: your deck is stacked so your next 3 draws are your strongest cards left.'},
  mesmetron:{name:'Mesmetron',rar:'rare',desc:'The dealer is mesmerized: they throw away their whole hand and draw just 3.'},
  starcap:{name:'Star Bottle Cap',rar:'rare',once:true,desc:'A rare Sunset Sarsaparilla star cap. Pocket 25 caps. One use: it leaves your deck once played.'},
  bobble:{name:'Strength Bobblehead',rar:'rare',desc:'Every King already on your caravans multiplies one more time.'},
  platinum:{name:'Platinum Chip',rar:'legendary',desc:'For the rest of this hand, your caravans sell anywhere from 18 to 30.'},
  fatman:{name:'Fat Man',rar:'legendary',desc:'Wipe out one of the dealer’s caravans completely.',target:true},
  stranger:{name:'Mysterious Stranger',rar:'legendary',desc:'Shoots the top card off every one of the dealer’s caravans.'},
  prime:{name:'Liberty Prime',rar:'legendary',desc:'Strips every face card off the dealer’s caravans.'},
  yesman:{name:'Yes Man',rar:'legendary',desc:'“Of course!” Swap one of your caravans with the dealer’s caravan across from it.',target:true},
  redryder:{name:'Red Ryder LE BB Gun',rar:'rare',found:'Beat Garl at Vault 15 on the Water Chip run.',desc:'Ping! The newest face card on every dealer caravan falls off.'},
  plasma:{name:'Turbo Plasma Rifle',rar:'rare',found:'Beat Decker at the Hub on the Water Chip run.',desc:'Melts the top half of the dealer’s biggest caravan.'},
  powerarmor:{name:'Power Armor',rar:'legendary',found:'Beat the Lieutenant at Mariposa on the Water Chip run.',desc:'For the rest of this hand, your caravans ignore the rules for card order and suit.'},
  alienblaster:{name:'Alien Blaster',rar:'legendary',found:'Search a crashed flying saucer on the Water Chip run.',desc:'Tap a dealer card: every card of that value disappears from their caravans.',target:true},
  waterchip:{name:'Water Chip',rar:'legendary',found:'Save Vault 13 on the Water Chip run.',once:true,desc:'On the Water Chip run: +30 days of water. Anywhere else: +1 Grit (up to 2). One use: it leaves your deck once played.'},
};
const LEGEND_PRICE={common:{ncr:20,caps:8},rare:{ncr:40,caps:18},legendary:{ncr:75,caps:30}};

function masterShift(){
  const base=JSON.parse(G.masterBase),keep=G.rules,id=pick(MASTER_POOL.filter(x=>x!==G.masterRule));
  BOSS_RULES[id].apply(base);
  for(const k of ['allproof','jackproof','jokerproof','anyOrder'])if(keep[k]&&keep[k].p)base[k].p=true;
  base.kingMult.p=Math.max(base.kingMult.p,keep.kingMult.p);if(G.platinum)base.range.p=[Math.min(18,base.range.p[0]),Math.max(30,base.range.p[1])];
  G.rules=base;G.masterRule=id;G.ruleIds=(G.ruleIds||[]).filter(x=>!MASTER_POOL.includes(x)).concat(id);
  G.log.unshift(`The Master’s voices shift. New rule: ${BOSS_RULES[id].name} (${BOSS_RULES[id].desc})`);
}
function playLegend(ci,lane,idx){
  if(!G||G.over||G.turn!=='p'||busy||G.setupLeft.p>0)return;
  const c=G.p.hand[ci];if(!c||!c.legend)return;const L=LEGENDS[c.legend];if(!L)return;
  if(L.target&&(lane==null||!G.a.cv[lane].length))return;
  if(undoable()||(G.mode==='road'&&G.char==='snipsnip'&&!G.repairUsed)){undoStack.push(JSON.stringify(G));if(undoStack.length>8)undoStack.shift();}
  G.p.hand.splice(ci,1);
  const who=OPP().name.split(' ').slice(-1)[0];let msg='',snd='clink',primeN=0;
  switch(c.legend){
    case 'repeater':{const cv=G.a.cv[lane],k=idx!=null&&idx<cv.length?idx:cv.length-1;cv.splice(k,1);snd='jack';msg=`Lincoln’s Repeater: one clean shot into their caravan ${ROMAN[lane]}.`;break;}
    case 'stealth':G.rules.allproof.p=true;G.rules.jackproof.p=true;G.rules.jokerproof.p=true;msg='Stealth Boy on. The dealer can’t find your caravans for the rest of the hand.';break;
    case 'house':{const n=Math.min(2,G.a.hand.length);for(let i=0;i<n;i++){const k=Math.floor(Math.random()*G.a.hand.length);G.p.hand.push(G.a.hand.splice(k,1)[0]);}msg=`Mr. House takes ${n} card${n===1?'':'s'} from ${who}’s hand.`;break;}
    case 'quantum':while(G.p.hand.length<8&&G.p.deck.length)G.p.hand.push(G.p.deck.pop());msg='Nuka-Cola Quantum! Your hand fills up.';break;
    case 'pipboy':{const d=G.p.deck,score=c2=>c2.rank==='K'?20:c2.rank==='JK'?19:c2.rank==='J'?16:c2.rank==='Q'?12:isNum(c2)?val(c2):0;
      const top=[...d].sort((a,b)=>score(b)-score(a)).slice(0,3);for(const t of top)d.splice(d.indexOf(t),1);d.push(...top.reverse());msg='V.A.T.S. locked on: your next 3 draws are your best cards.';break;}
    case 'mesmetron':{G.a.deck.unshift(...G.a.hand);G.a.hand=[];for(let i=0;i<3&&G.a.deck.length;i++)G.a.hand.push(G.a.deck.pop());msg=`${who} stares into the Mesmetron and drops their hand. They hold 3 cards now.`;break;}
    case 'starcap':meta.caps+=25;msg='A Sunset Sarsaparilla star cap! +25 caps.';break;
    case 'bobble':{let n=0;for(const cv of G.p.cv)for(const e of cv)for(const f of e.faces)if(f.rank==='K'){f.m=(f.m||2)*2;n++;}msg=n?`Strength Bobblehead: ${n} King${n>1?'s':''} on your caravans just got stronger.`:'Strength Bobblehead: no Kings on your caravans yet. Nothing to pump up.';break;}
    case 'platinum':G.platinum=true;G.rules.range.p=[Math.min(18,G.rules.range.p[0]),Math.max(30,G.rules.range.p[1])];msg='The Platinum Chip: your caravans sell from 18 to 30 this hand.';break;
    case 'fatman':G.a.cv[lane]=[];snd='jack';msg=`Fat Man! Their caravan ${ROMAN[lane]} is gone.`;break;
    case 'stranger':for(const cv of G.a.cv)if(cv.length)cv.pop();snd='jack';msg='The Mysterious Stranger fires three shots. Each of their caravans loses its top card.';break;
    case 'prime':primeN=G.a.cv.reduce((n,cv)=>n+cv.reduce((m,e)=>m+e.faces.length,0),0);for(const cv of G.a.cv)for(const e of cv)e.faces=[];snd='jack';msg='Liberty Prime: “Democracy is non-negotiable.” Every face card on their caravans is gone.';break;
    case 'redryder':{let n=0;for(const cv of G.a.cv){for(let i=cv.length-1;i>=0;i--){if(cv[i].faces.length){cv[i].faces.pop();n++;break;}}}snd='jack';msg=n?`Ping! ${n} face card${n>1?'s':''} knocked off.`:'Ping! Nothing to hit.';break;}
    case 'plasma':{let best=-1,bv=-1;G.a.cv.forEach((cv,l)=>{if(cv.length&&cvValue(cv)>bv){bv=cvValue(cv);best=l;}});if(best>=0){const n=Math.ceil(G.a.cv[best].length/2);G.a.cv[best].splice(G.a.cv[best].length-n,n);msg=`The Turbo Plasma Rifle melts ${n} card${n>1?'s':''} off their caravan ${ROMAN[best]}.`;}else msg='Nothing to melt.';snd='jack';break;}
    case 'powerarmor':G.rules.anyOrder.p=true;msg='Power Armor on. Your caravans take any card, in any order, this hand.';break;
    case 'alienblaster':{const cv=G.a.cv[lane],e=cv[idx!=null&&idx<cv.length?idx:cv.length-1],v=val(e.card);let n=0;for(let l=0;l<3;l++){const before=G.a.cv[l].length;G.a.cv[l]=G.a.cv[l].filter(x=>val(x.card)!==v);n+=before-G.a.cv[l].length;}snd='jack';msg=`The Alien Blaster disintegrates every ${e.card.rank==='A'?'Ace':v} on their side: ${n} card${n>1?'s':''} gone.`;break;}
    case 'waterchip':{const r=run();if(r&&r.special==='waterchip'){r.days=(r.days||0)+30;msg='The Water Chip! 30 more days of water.';}else{r.grit=Math.min(2,(r.grit||0)+1);msg='The Water Chip: you feel refreshed. +1 Grit.';}break;}
    case 'yesman':{const t=G.p.cv[lane];G.p.cv[lane]=G.a.cv[lane];G.a.cv[lane]=t;msg=`Yes Man swaps your caravan ${ROMAN[lane]} with theirs. Of course!`;break;}
  }

  if(L.once){G.spent=G.spent||[];if(c.si!=null)G.spent.push(c.si);undoStack=[];}
  drawTo(G,'p',RULES(G).hand.p);
  meta.legendPlays=(meta.legendPlays||0)+1;
  G.usedLegends=G.usedLegends||[];G.usedLegends.push(c.legend);if(G.usedLegends.length>=2)unlock('leg_two');
  if(c.legend==='prime'&&primeN>=4)unlock('leg_prime');
  G.log.unshift(msg);sel=null;legendTarget=null;sfx(snd,'p');legendFlash(L);
  const w=winnerOf(G);
  if(w){const r=lanesResult(G),n=r.filter(x=>x==='p').length;finish(w,w==='p'?`You sold ${n} of 3 caravans against ${OPP().name}.`:`${OPP().name} sold ${3-n} of 3 caravans.`);render();return;}
  save();render();
}
function legendFlash(L){try{const el=document.createElement('div');el.className='legendflash lg-'+L.rar;el.innerHTML=`<small>Legend · ${L.rar}</small><b>${esc(L.name)}</b>`;document.body.appendChild(el);setTimeout(()=>el.remove(),1900);buzz&&buzz([30,40,60]);}catch(e){}}
function legendTipHTML(c){
  const L=LEGENDS[c.legend],my=G.turn==='p'&&!G.over&&!busy,setup=G.setupLeft.p>0;
  return `<div class="seltip lgtip"><p><b class="lg-${L.rar}">${esc(L.name)}</b> <span class="ptag lgt-${L.rar}">${L.rar}</span></p><p>${esc(L.desc)} Doesn’t use your turn; you draw a replacement.</p>
    ${legendTarget!=null?`<p class="note">${c.legend==='repeater'||c.legend==='alienblaster'?'Tap the card you want gone in a dealer caravan.':c.legend==='yesman'?'Tap the dealer caravan to swap with yours across from it.':'Tap one of the dealer’s caravans.'}</p><button class="btn" data-legendcancel>Cancel</button>`:`<button class="btn hot" data-legend ${my&&!setup?'':'disabled'}>${setup?'Play it after the opening':'Play '+esc(L.name)}</button>`}</div>`;
}
function abilityBar(myTurn){
  if(G.mode!=='road'||G.opp<0||!G.char)return '';
  const ready=myTurn&&G.setupLeft.p===0,out=[];
  const row=(btn,note)=>`<div class="chems">${btn}<span class="chem-note">${note}</span></div>`;
  if(G.char==='chevy')out.push(row(`<button class="btn ability${turretMode?' armed':''}" data-turret ${(!G.turretUsed&&ready)||turretMode?'':'disabled'}>${G.turretUsed?'Turret spent':turretMode?'Cancel':'Fire turret'}</button>`,turretMode?'Tap the top card of a dealer caravan.':G.turretUsed?'':'Once per hand. Uses your turn.'));
  if(G.char==='snipsnip')out.push(row(`<button class="btn ability" data-repair ${myTurn&&!G.repairUsed&&undoStack.length?'':'disabled'}>${G.repairUsed?'Repairs used':'Self-repair'}</button>`,G.repairUsed?'':undoStack.length?'Once per hand. Takes back your last turn and the dealer’s reply.':'Once per hand, after you’ve made a play.'));
  if(G.char==='threedog'){const c=sel!=null&&G.p.hand[sel];out.push(row(`<button class="btn ability" data-request ${myTurn&&!G.requestUsed&&c&&G.p.deck.length?'':'disabled'}>${G.requestUsed?'Request played':'Request line'}</button>`,G.requestUsed?'':c?`Swap ${esc(cardName(c))} for the top card of your deck. Doesn’t use your turn.`:'Once per hand. Select a card in your hand to swap it.'));}
  if(G.char==='greg')out.push(row(`<button class="btn ability" data-hug ${!G.hugUsed&&ready?'':'disabled'}>${G.hugUsed?(G.hugPending?'Hug coming…':'Hug given'):'Bear hug'}</button>`,G.hugPending?'The dealer skips their next turn.':G.hugUsed?'':'Once per hand. Doesn’t use your turn.'));
  if(G.char==='harold')out.push(row(`<button class="btn ability" data-regrow ${myTurn&&!G.regrowUsed&&G.lastLost?'':'disabled'}>${G.regrowUsed?'Bob is resting':'Bob: regrow'}</button>`,G.regrowUsed?'':G.lastLost?`Put back your ${esc(cardName(G.lastLost.e.card))}. Once per hand, doesn’t use your turn.`:'Once per hand, after the dealer knocks one of your cards off.'));
  if(G.bat)out.push(row(`<button class="btn ability${batMode?' armed':''}" data-bat ${(!G.batUsed&&ready)||batMode?'':'disabled'}>${G.batUsed?'Slugger swung':batMode?'Cancel':'Louisville Slugger'}</button>`,batMode?'Tap one of your caravans.':G.batUsed?'':'Once per hand: knock the top card off one of your caravans. Doesn’t use your turn.'));
  if(G.quick&&!G.over)out.push(`<div class="chems"><span class="chem-note">${G.quickUsed?'Quick hands used this hand.':'Quick hands: your first discard this hand doesn’t use your turn.'}</span></div>`);
  if(G.canWalk&&!G.over)out.push(row(`<button class="btn ability" data-walk ${ready?'':'disabled'}>Walk away</button>`,'Pre-War Sneakers: lose this table without losing Grit. Once per stop.'));
  // companion chip
  if(G.comp&&GEAR[G.comp]){const id=G.comp,x=GEAR[id];let btn='',note='';
    if(id==='boone'){btn=`<button class="btn ability${booneMode?' armed':''}" data-boone ${(!G.booneUsed&&ready)||booneMode?'':'disabled'}>${G.booneUsed?'Reloading':booneMode?'Cancel':'Take the shot'}</button>`;note=booneMode?'Tap a dealer caravan with a King or Queen on it.':G.booneUsed?'':'Once per hand. Uses your turn.';}
    else if(id==='ede'){btn=`<button class="btn ability" data-zap ${myTurn&&!G.zapUsed&&G.a.hand.length?'':'disabled'}>${G.zapUsed?'Recharging':'Zap'}</button>`;note=G.zapUsed?'':'Once per hand: a random card leaves the dealer’s hand.';}
    else if(id==='nick'){const nx=G.a.deck[G.a.deck.length-1];note=nx?`Dealer draws next: <b>${esc(cardName(nx))}</b>`:'The dealer’s deck is empty.';}
    else if(id==='codsworth')note=G.tidyUsed?'Tidied up this hand.':'Your next discard doesn’t use your turn.';
    else note=esc(x.desc);
    out.push(`<div class="compchip">${ART.comp[id]?`<img src="${ART.comp[id]}" alt="">`:`<span class="compdot">${esc(x.name[0])}</span>`}<div><b>${esc(x.name)}</b><span class="chem-note">${note}</span></div>${btn}</div>`);}
  return out.join('');
}
const packAttr=c=>c&&c.pack?` data-back="${c.pack}"`:'';
function pileHTML(n,label,cls,deck){
  const layers=Math.min(4,Math.max(1,Math.ceil(n/10)));
  return `<div class="deckpile ${cls}" role="img" aria-label="${label}: ${n} cards">${n?Array.from({length:layers},(_,i)=>`<div class="card back"${deck?packAttr(deck[deck.length-layers+i]):''} style="--o:${i}"></div>`).join(''):'<div class="emptypile">empty</div>'}<span class="pilecount num">${n}</span></div>`;
}
function renderMatch(){
  const o=OPP(), lanes=lanesResult(G), tut=tutActive();
  const myTurn=G.turn==='p'&&!G.over&&!busy;
  const legal=playerLegal();
  const selMoves=sel==null?[]:legal.filter(m=>m.ci===sel);
  const canDiscard=selMoves.some(m=>m.t==='discard');
  const canDisband=legal.some(m=>m.t==='disband');
  const backs=Math.min(G.a.hand.length,8);
  const handOK=i=>myTurn&&(!tut||legal.some(m=>m.ci===i));
  const proj={};
  if(sel!=null)for(const m of selMoves){
    if(m.t==='num')proj['L'+m.lane]=cvValue(G.p.cv[m.lane])+val(G.p.hand[sel])*(G.p.hand[sel].mod==='glass'?((G.rules.glassMult&&G.rules.glassMult.p)||2):1);
    else if(m.t==='face'&&!(G.rules.hideOpp&&m.side==='a')){const g2=clone(G);applyMove(g2,'p',m,true);proj[`E${m.side}${m.lane}${m.idx}`]=cvValue(g2[m.side].cv[m.lane]);}
  }
  const dealt=new Set(G.dealtDone?[]:(G.dealt||[]));
  app.innerHTML=`
  <div class="mbar">
    <div class="opp">${o.rival||(o.art&&G.runTable===2)?bossPic(o,'rivalimg big'):''}<h2>${esc(o.name)}</h2><small>${esc(o.place)}${G.stake?` · ${G.mode==='campaign'?'bet':G.run?'wager':'buy-in'} ${G.stake}`:''}</small></div>
    <div class="mbtns">${goalsList().length?`<button class="btn ghost" data-goalsopen aria-label="Goals">Goals${goalsList().filter(g=>g.state!=='failed'&&g.state!=='done').length?` <span class="gcount">${goalsList().filter(g=>g.state!=='failed'&&g.state!=='done').length}</span>`:''}</button>`:''}<button class="btn ghost" data-rulesopen aria-label="Rules">Rules</button><button class="btn ghost${armedFold?' armed':''}" data-fold>${armedFold?(G.stake?`Fold, lose ${G.stake}`:'Tap to fold'):'Fold'}</button></div>
  </div>
  ${rulesBar()}
  ${G.peek&&!G.over?`<div class="peek"><span>Their hand</span><div class="deckgrid">${G.a.hand.map(cardHTML).join('')}</div></div>`:''}
  <div class="mgrid"><div class="mg-table">
  <div class="table">
    ${tablePropsHTML()}
    <div class="deckrow top">
      <div class="fan" aria-label="Dealer holds ${G.a.hand.length} cards">${G.a.hand.map((c,i,a)=>`<div class="card back"${packAttr(c)} data-cid="${c.id}" data-zone="fan" style="--r:${(i-(a.length-1)/2)*6}deg"></div>`).join('')}</div>
      ${pileHTML(G.a.deck.length,'Dealer’s deck','small',G.a.deck)}
    </div>
    <div class="side">${[0,1,2].map(l=>laneHTML('a',l,lanes,selMoves,proj)).join('')}</div>
    <div class="mid"><span class="turn${G.turn==='p'?' mine':''}">${G.over?'Hand over':G.turn==='p'?'Your move':'Their move'}</span><span class="log">${esc(G.log[0]||'Sell two caravans in range to win.')}</span></div>
    <div class="side">${[0,1,2].map(l=>laneHTML('p',l,lanes,selMoves,proj)).join('')}</div>
    <div class="deckrow bottom">
      <span class="decklabel">${G.char==='nuke'&&G.mode==='road'&&G.p.deck.length?`Next draw ${cardHTML(G.p.deck[G.p.deck.length-1])}`:'Your deck'}</span>
      ${capStackHTML()}
      ${pileHTML(G.p.deck.length,'Your deck','mine',G.p.deck)}
    </div>
  </div>
  </div><div class="mg-side">
  <div class="hand${tut?' tut':''}">${G.p.hand.map((c,i)=>`<button class="card-btn${sel===i?' sel':''}${dealt.has(c.id)&&!motionOn()?' dealt':''}" data-hand="${i}" data-cid="${c.id}" data-zone="hand" ${handOK(i)?'':'disabled'} aria-label="${cardName(c)}" aria-pressed="${sel===i}">${cardHTML(c)}</button>`).join('')}</div>
  ${chemBar(myTurn)}
  ${abilityBar(myTurn)}
  <div class="actions">
    <button class="btn" data-discard ${canDiscard?'':'disabled'}>Discard</button>
    <button class="btn${disbandMode?' armed':''}" data-disband ${canDisband||disbandMode?'':'disabled'}>Disband${G.rules.freeDisband.p?' (free)':''}</button>
    ${undoable()?`<button class="btn" data-undo ${myTurn&&undoStack.length?'':'disabled'}>Undo</button>`:''}
  </div>
  ${tut?coachHTML():`<p class="hint" aria-live="polite">${esc(hintText(selMoves))}</p>`}
  ${selPerkTip()}
  </div></div>
  ${propsHTML()}
  ${G.over?resultHTML():''}
  ${rulesOpen?rulesPopHTML():''}`;
  if(G.fx)G.fx.done=true;
  if(G.dealt)G.dealtDone=true;
}
function capStackHTML(){
  const n=G.run?meta.caps:G.mode==='campaign'&&meta.classic.camp?meta.classic.camp.caps:null;if(n==null)return '';
  const discs=Math.min(14,Math.ceil(n/4));
  return `<div class="capstack" aria-label="${n} caps">${Array.from({length:discs},(_,i)=>`<span class="capdisc" style="--i:${i};--j:${(hashStr('c'+i)%7)-3}px"></span>`).join('')}<b class="num">${n}</b></div>`;
}
function resultHTML(){
  const ov=G.over, won=ov.winner==='p';
  if(ov.run)return runResultHTML(ov);
  const lines=[];
  if(won){
    if(ov.stake)lines.push(`${ov.stake} buy-in back`);
    lines.push(`${ov.win} winnings`);
    if(ov.bonus)lines.push(`${ov.bonus} first-win bonus`);
  }else if(ov.stake)lines.push(`lost the ${ov.stake}-cap buy-in`);
  if(ov.bountyWon)lines.push(`${ov.bountyWon} bounty (${BOUNTIES[ov.bounty].name})`);
  if(ov.brewed)lines.push(`Nuke brewed a ${CHEMS[ov.brewed].name}`);
  for(const id of (ov.newChars||(ov.newChar?[ov.newChar]:[])))lines.push(`${CHARS[id].name} unlocked`);
  const delta=ov.delta;
  const missed=ov.bounty&&won&&!ov.bountyWon?`<p>Bounty missed: ${BOUNTIES[ov.bounty].desc}</p>`:'';
  return `<div class="overlay"><div class="panel result">
    <h2 class="${won?'':'lost'}">${won?'Caravans sold':'Outbid'}</h2>
    <p>${esc(ov.reason)}</p>
    ${ov.mode==='campaign'?`<div class="gain num" data-delta="${ov.delta}">${ov.delta>0?`+<span class="cap"></span> <span class="cn">${ov.delta}</span>`:ov.delta<0?`−${capN(-ov.delta)}`:G.rita?'No caps lost':'Friendly game'}</div>
      ${G.rita&&ov.winner==='p'?(ov.delta>0?`<p>Rita slides you ${RITA.pay} caps. “Don’t spend it all in one place, hon.”</p>`:`<p>Rita grins. “You’re doing fine, hon. Keep your caps.”</p>`):''}
      ${ov.tabPaid?`<p>${ov.tabPaid} caps went to ${TAB.lender}’s tab. ${meta.classic.camp.tab?`You still owe ${meta.classic.camp.tab}.`:'Your tab is paid off.'}</p>`:''}
      ${(ov.lines||[]).length?`<ul class="steps resl">${ov.lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`:''}
      <p>You have ${meta.classic.camp.caps} caps.${ov.firstBeat&&G.cd?` ${esc(G.cd.name)} is beaten.`:''}${ov.campDone?' You beat the Old Man. The circuit is yours.':''}</p>
      ${!G.rita&&meta.classic.camp.caps<10?`<p class="note">Short on caps? Dusty Rita’s table is always open${meta.classic.camp.tab?'':`, and ${TAB.lender} will run you a tab`}.</p>`:''}`
    :ov.mode==='classic'?`<p>Classic record: ${meta.classic.wins}W · ${meta.classic.losses}L</p>`:`<div class="gain num" data-delta="${delta}">${delta>0?`+<span class="cap"></span> <span class="cn">${delta}</span>`:delta<0?`−${capN(-delta)}`:'No caps lost'}</div>`}
    ${ov.mode==='road'&&lines.length?`<p style="margin-top:-8px">${esc(lines.join(' · '))}</p>`:''}
    ${missed}
    ${ov.mode==='road'?`<p>You have ${meta.caps} caps.</p>`:''}
    ${ov.tutorial?`<p>${ov.mode==='classic'?'Lessons done. Build a deck and pick a dealer when you’re ready.':'Lessons done. Head for Goodsprings when you’re ready.'}</p>`:''}
    ${ov.mode==='campaign'
      ?G.rita?`<button class="btn hot" data-ritaplay>Play Rita again</button> <button class="btn" data-go="campaign" style="margin-left:6px">Back to the circuit</button>`
      :G.cd?`<button class="btn hot" data-crebet="${G.cd.id}">Play again (${ov.stake?ov.stake+' caps':'friendly'})</button> <button class="btn" data-town="${G.cd.ti}" style="margin-left:6px">Back to ${esc(TOWNS[G.cd.ti].name)}</button>`
      :`<button class="btn hot" data-go="campaign">Back to the circuit</button>`
      :ov.mode==='classic'
      ?(G.opp>=0?`<button class="btn hot" data-cplay="${G.opp}">Deal again</button> <button class="btn" data-go="classic" style="margin-left:6px">Back to the table</button>`
        :`<button class="btn hot" data-go="classic">Back to the table</button>`)
      :`<button class="btn hot" data-go="road">Back to the road</button>`}
  </div></div>`;
}

function render(){
  const wasMatch=document.body.dataset.screen==='match', prevSnap=wasMatch&&screen==='match'?snapMatch():null;
  const fxNow=G&&G.fx&&!G.fx.done?{...G.fx}:null, prevScreen=document.body.dataset.screen;
  document.getElementById('sky').style.display=screen==='match'?'none':'block';
  document.body.dataset.screen=screen;
  const R={help:renderHelp,settings:renderSettings,custom:renderCustom,home:renderHome,road:renderRoadRun,shop:renderRoadRun,classic:renderClassic,build:renderBuild,match:renderMatch,campaign:renderCampaign,rundown:renderRundown,town:renderTown,journal:renderJournal,vendor:renderVendor,look:renderLook,ach:renderAch,pickchar:renderPickChar,office:renderOffice,codex:renderCodex};
  (R[screen]||renderHome)();
  if(screen!=='match')app.insertAdjacentHTML('afterbegin',topbarHTML());
  if(typeof setDeckAttr==='function')setDeckAttr();
  try{afterRender(prevScreen,prevSnap,fxNow);}catch(e){console.warn(e);}
  if(pendingChoice)app.insertAdjacentHTML('beforeend',choiceHTML());
}

