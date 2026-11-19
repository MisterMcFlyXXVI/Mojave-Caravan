// ---------- flow ----------
function enterMatch(){rulesOpen=false;G.intro=true;undoStack=[];turretMode=false;legendTarget=null;booneMode=false;batMode=false;G.stats=Object.assign({faces:0,jokers:0,kings:0,discards:0,disbands:0,turns:0},G.stats||{});sel=null;disbandMode=false;busy=false;armedFold=false;screen='match';save();render();window.scrollTo(0,0);}
function startMatch(i,skipRundown){
  if(i===-1&&!skipRundown){openRundown('road');return;}
  if(i===-2)G=newRoadTutorial();
  else if(i===-1)G=newTutorial('road');
  else return;
  G.stake=0;enterMatch();
}
function startClassic(i,skipRundown){
  if(i<0&&!skipRundown){openRundown('classic');return;}
  if(i<0){G=newTutorial('classic');G.stake=0;enterMatch();return;}
  const d=CLASSIC_DEALERS[i]; if(!d||!meta.classic.deck)return;
  G=newMatch(withPacks(meta.classic.deck.map(c=>({rank:c.rank,suit:c.suit})),packList()),addFaces(baseNumbers(),d.extra),i,baseRules());
  G.mode='classic';G.stake=0;
  enterMatch();
}
function describe(side,m){
  const who=side==='p'?'You':OPP().name.split(' ').slice(-1)[0];
  const whose=s=>s==='p'?'your':'their';
  if(m.t==='turret')return `${side==='p'?'Your turret':'A turret'} shot the top card off their caravan ${ROMAN[m.lane]}.`;
  if(m.t==='boone')return `Boone shot a face card off their caravan ${ROMAN[m.lane]}.`;
  if(m.t==='disband')return `${who} disbanded ${side==='p'?'your':'their'} caravan ${ROMAN[m.lane]}.`;
  const c=G[side].hand[m.ci];
  if(m.t==='discard')return `${who} discarded ${side==='p'?cardName(c):'a card'}.`;
  if(m.t==='num')return `${who} played ${cardName(c)} on caravan ${ROMAN[m.lane]}.`;
  const t=G[m.side].cv[m.lane][m.idx].card;
  return `${who} played ${cardName(c)} on ${whose(m.side)} ${G.rules.hideOpp&&m.side==='a'&&side==='a'?'caravan':cardName(t)}.`;
}
function bountyMet(id,lanes){
  const s=G.stats;
  if(id==='p26')return [0,1,2].some(l=>lanes[l]==='p'&&cvValue(G.p.cv[l])===26);
  if(id==='clean')return s.faces===0;
  if(id==='sweep')return lanes.every(x=>x==='p');
  if(id==='wild')return s.jokers>0;
  if(id==='calm')return s.discards===0&&s.disbands===0;
  if(id==='kings')return s.kings>=2;
  return false;
}
function finish(winner,reason){finishCore(winner,reason);try{if(winner==='p'){sfx('win');setTimeout(()=>sfx('clink'),520);buzz([20,60,20]);}else{sfx('lose');buzz(40);}}catch(e){}try{achOnFinish();}catch(e){}}
function finishCore(winner,reason){
  const o=OPP(), tutorial=G.opp<0, stake=G.stake||0;
  const ov={winner,reason,stake,win:0,bonus:0,tutorial,bounty:G.bounty||null,bountyWon:0,refund:0,scav:0,delta:0,mode:G.mode||'road'};
  if(G.mode==='campaign'&&G.rita){
    const cp=meta.classic.camp;cp.rita=cp.rita||{w:0,l:0};
    const pity=cp.caps<RITA.under;
    if(winner==='p'){cp.rita.w++;if(pity){cp.caps+=RITA.pay;ov.delta=RITA.pay;}}else{cp.rita.l++;ov.delta=0;}
    if(winner==='p'&&pity&&cp.tab){ov.tabPaid=payTab(cp,Math.ceil(RITA.pay/2));}
    cp.stocks={};
    G.over=ov;save();return;
  }
  if(G.mode==='campaign'&&G.cd){
    careerFinish(winner,ov,stake);
    G.over=ov;save();return;
  }
  if(G.mode==='campaign'){ // a match saved before the career update
    const cp=meta.classic.camp;winner==='p'?(cp.wins++,cp.caps+=stake*2):cp.losses++;ov.delta=winner==='p'?stake:-stake;
    G.over=ov; save(); return;
  }
  if(G.mode==='classic'){
    if(winner==='p')meta.classic.wins++;else meta.classic.losses++;
    if(G.opp>=0){const r=meta.classic.rec[G.opp]||{w:0,l:0};winner==='p'?r.w++:r.l++;meta.classic.rec[G.opp]=r;}
    if(tutorial)meta.tutorialDone=true;
    G.over=ov; save(); return;
  }
  if(G.run){
    winner==='p'?meta.wins++:meta.losses++;
    const r=meta.run,s=G.stats||{},costs=[];
    if(r.deck==='sarsaparilla'&&s.discards){const c=Math.min(meta.caps,s.discards);meta.caps-=c;if(c)costs.push(`−${c} for sticky discards`);}
    if(r.deck==='blood'&&s.jacks){const c=Math.min(meta.caps,s.jacks*2);meta.caps-=c;if(c)costs.push(`−${c} blood money for Jacks`);}
    r.kings=(r.kings||0)+(s.kings||0);
    runFinish(winner,ov);ov.extras=costs.concat(ov.extras||[]);
    G.over=ov;save();return;
  }
  if(tutorial&&G.mode==='road'){
    const k=G.opp===-1?'tutorialDone':'roadTutDone';meta[k]=true;ov.tutorial=true;ov.delta=0;
    G.over=ov;save();return;
  }
  G.over=ov;save();
}
function doMove(side,m){
  const d=describe(side,m);
  if(side==='p'&&G.stats){
    G.stats.turns=(G.stats.turns||0)+1;
    if(m.t==='discard')G.stats.discards++;
    else if(m.t==='disband')G.stats.disbands++;
    else if(m.t==='face'){const c=G.p.hand[m.ci];G.stats.faces++;if(c.rank==='JK')G.stats.jokers++;if(c.rank==='K')G.stats.kings++;if(c.rank==='J'){G.stats.jacks=(G.stats.jacks||0)+1;if(m.side==='a')G.stats.jackHits=(G.stats.jackHits||0)+1;}}
    else if(m.t==='num'){const c=G.p.hand[m.ci];if(c.mod==='glass'&&c.si!=null)(G.glass=G.glass||[]).push(c.si);}
  }
  if(side==='p'&&m.t==='face')m._card=G.p.hand[m.ci];
  const pc=m.ci!=null?G[side].hand[m.ci]:null;
  const handIds=side==='p'?new Set(G.p.hand.map(c=>c.id)):null;
  const beforeA=G.a.cv.reduce((n,cv)=>n+cv.length,0),sigWasSetup=G.setupLeft.a>0;
  applyMove(G,side,m,false);
  try{achOnMove(side,m,beforeA);}catch(e){}
  if(G.comp==='ian'&&!G.ianDone&&G.setupLeft.p===0&&G.setupLeft.a===0){G.ianDone=true;
    const mine=Math.random()<0.25,sd=mine?'p':'a',lanes=[0,1,2].filter(l=>G[sd].cv[l].length);
    if(lanes.length){const l=pick(lanes);G[sd].cv[l].pop();G.log.unshift(mine?`Ian opens fire… and clips your own caravan ${ROMAN[l]}. “Sorry!”`:`Ian opens fire and shoots the top card off their caravan ${ROMAN[l]}.`);}}
  if(G.master&&side==='p'){G.masterN=(G.masterN||0)+1;if(G.masterN%3===0)masterShift();}
  G.log.unshift(d);
  if(side==='a')sigAfterDealerMove(sigWasSetup);
  G.fx={side:m.t==='face'?m.side:side,lane:m.t==='discard'?-1:m.lane,kind:m.t,rank:pc&&pc.rank,card:pc?{rank:pc.rank,suit:pc.suit,pack:pc.pack}:null,idx:m.idx,by:side,done:false};
  if(side==='p'){G.dealt=G.p.hand.filter(c=>!handIds.has(c.id)).map(c=>c.id);G.dealtDone=false;}
  sfx(m.t==='face'?(pc.rank==='J'?'jack':'face'):m.t==='discard'?'swish':(m.t==='disband'||m.t==='turret'||m.t==='boone')?'jack':'snap',side);
  if(m.t==='turret'){G.turretUsed=true;meta.st.turrets=(meta.st.turrets||0)+1;G.fx={side:'a',lane:m.lane,kind:'turret',by:'p',done:false};}
  if(m.t==='boone'){G.booneUsed=true;G.fx={side:'a',lane:m.lane,kind:'turret',by:'p',done:false};}
  const w=winnerOf(G);
  if(w){
    const r=lanesResult(G),n=r.filter(x=>x==='p').length;
    finish(w,w==='p'?`You sold ${n} of 3 caravans against ${OPP().name}.`:`${OPP().name} sold ${3-n} of 3 caravans.`);
    render(); return;
  }
  // free actions keep the turn
  let keep=false;
  if(side==='p'&&m.t==='disband'&&G.rules.freeDisband.p)keep=true;
  else if(side==='p'&&G.extra&&m.t!=='disband'){G.extra=false;keep=true;}
  else if(side==='p'&&m.t==='face'&&m._card&&m._card.rank==='J'&&G.sawedoff){keep=true;G.log.unshift('Sawed-Off: your Jack didn’t use your turn.');}
  else if(side==='p'&&m.t==='discard'&&G.codsworth&&!G.tidyUsed){G.tidyUsed=true;keep=true;G.log.unshift('Codsworth tidies up. That discard was on the house.');}
  else if(side==='p'&&m.t==='discard'&&G.quick&&!G.quickUsed){G.quickUsed=true;keep=true;G.log.unshift('Quick hands: that discard didn’t use your turn.');}
  if(!keep&&side==='p'&&G.hugPending){G.hugPending=false;keep=true;G.log.unshift(`${OPP().name.split(' ').slice(-1)[0]} is still recovering from Greg’s hug. Your turn again.`);}
  if(!keep){G.turn=other(side);if(G.turn==='p'&&side==='a'&&G.sigSkip){G.sigSkip=false;G.turn='a';G.log.unshift('You skip a turn.');}if(G.turn==='p'){G.chemTurn=false;if(side==='a'){setTimeout(()=>sfx('turn'),180);buzz(12);}}}
  if(!G[G.turn].hand.length){
    finish(other(G.turn),G.turn==='p'?'You ran out of cards.':`${OPP().name} ran out of cards.`);
    render(); return;
  }
  save();
  if(G.turn==='a'){busy=true;render();setTimeout(aiTurn,tutActive()?1100:({slow:1200,normal:750,fast:320})[meta.opt.speed]||750);}
  else render();
}
function freeWinCheck(){
  const w=winnerOf(G);if(!w)return false;
  const r=lanesResult(G),n=r.filter(x=>x==='p').length;
  finish(w,w==='p'?`You sold ${n} of 3 caravans against ${OPP().name}.`:`${OPP().name} sold ${3-n} of 3 caravans.`);return true;
}
function aiTurn(){
  if(!G||G.over||screen!=='match'){busy=false;return;}
  let m=null;
  if(tutActive()){
    const step=tutSteps()[G.tut.step];
    if(step&&step.ai){m=resolveSpec(step.ai,'a');G.tut.step++;}
  }
  if(!m&&G.duster&&!G.dustUsed&&G.setupLeft.a===0){const ms=legalMoves(G,'a').filter(x=>x.t!=='disband');if(ms.length){m=pick(ms);G.dustUsed=true;G.log.unshift('Dust in their eyes: the dealer’s play is a wild guess.');}}
  if(!m)m=chooseAIMove(G,'a',OPP().noise,aiProfile());
  busy=false;
  if(!m){finish('p',`${OPP().name} has no move left.`);render();return;}
  doMove('a',m);
}
const chemPouch=()=>G&&G.localChems?G.localChems:meta.chems;
let undoStack=[];
const undoable=()=>G&&G.mode==='classic'&&G.opp>=0&&!G.over;
function playerMove(m){if(undoable()||(G.mode==='road'&&G.char==='snipsnip'&&!G.repairUsed)){undoStack.push(JSON.stringify(G));if(undoStack.length>8)undoStack.shift();}doMove('p',m);}
let bustArm=null;
function bustCheck(m){
  if(!meta.opt.confirm||tutActive()||m.side==='a')return false;
  const g2=clone(G);applyMove(g2,'p',m,true);
  const l=m.lane,hi=laneRange(g2,'p',l)[1],before=cvValue(G.p.cv[l]),after=cvValue(g2.p.cv[l]);
  if(after>hi&&before<=hi){const key=JSON.stringify(m);if(bustArm===key){bustArm=null;return false;}
    bustArm=key;G.log.unshift(`That would bust caravan ${ROMAN[l]} at ${after}. Tap it again to play anyway.`);render();return true;}
  bustArm=null;return false;
}
function useChem(id){
  const pouch=chemPouch();
  if(!pouch[id]||G.chemTurn||G.setupLeft.p>0||G.turn!=='p'||busy||G.over)return;
  if(G.run&&run())run().usedChem=true;
  const me=G.p;
  if(id==='spy'){if(G.peek)return;G.peek=true;G.log.unshift('You popped Mentats. You can see the dealer’s hand.');}
  else if(id==='coffee'){if(G.extra)return;G.extra=true;G.log.unshift('You hit the Jet: two plays this turn.');}
  else if(id==='fresh'){const n=me.hand.length;me.deck.push(...me.hand);me.hand=[];shuffle(me.deck);while(me.hand.length<n&&me.deck.length)me.hand.push(me.deck.pop());G.log.unshift('RadAway flushed your hand. Fresh cards.');}
  else if(id==='shoe'){if(!me.deck.length)return;for(let i=0;i<2&&me.deck.length;i++)me.hand.push(me.deck.pop());G.log.unshift('Stimpak: you drew 2 cards.');}
  else if(id==='buff'){if(G.buffed)return;G.buffed=true;G.rules.kingMult.p+=1;G.log.unshift(`Buffout: your Kings now multiply ×${G.rules.kingMult.p} this hand.`);}
  else if(id==='medx'){if(G.rules.jackproof.p)return;G.rules.jackproof.p=true;G.log.unshift('Med-X: the dealer’s Jacks can’t touch your caravans this hand.');}
  if(G.mode==='road'&&runLive()&&runV('pouch')&&Math.random()<1/3)G.log.unshift('Chem Set: that one didn’t get used up.');else pouch[id]--;
  if(G.mode==='road'&&gear('labcoat')&&me.deck.length){me.hand.push(me.deck.pop());G.log.unshift('Lab Coat: you drew a card.');}
  G.chemTurn=true; sel=null; sfx('clink'); if(!G.localChems)meta.st.chems++; checkState();
  if(tutActive()){const st=tutSteps()[G.tut.step];if(st.move&&st.move.t==='chem')G.tut.step++;}
  save(); render();
}

// ---------- input ----------
app.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-lane]');
  if(!t)return;
  const d=t.dataset;
  if('propsel' in d){const id=d.propsel;if(propUnlocked(id)){const eq=meta.look.props=meta.look.props||[];const k=eq.indexOf(id);if(k>=0)eq.splice(k,1);else if(eq.length<PROP_SLOTS)eq.push(id);else{eq.shift();eq.push(id);}save();}render();return;}
  if(handleRundownClick(d))return;
  if(handleCareerClick(d))return;
  if('rulesopen' in d){rulesOpen=true;render();return;}
  if('goalsopen' in d){rulesOpen='goals';render();return;}
  if('rulesclose' in d){rulesOpen=false;render();return;}
  if(!('fold' in d)&&screen==='match')armedFold=false;
  if('installtab' in d){installOpen=d.installtab;render();return;}
  if('installopen' in d){installOpen='pick';render();return;}
  if('installclose' in d){installOpen=false;meta.installSeen=1;save();render();return;}
  if(handleOfficeClick(d))return;
  if(handleRunClick(d))return;
  if('auth' in d){doAuth(d.auth);return;}
  if('choose' in d){const pc=pendingChoice;pendingChoice=null;if(!pc)return;
    if(d.choose==='cloud'){adoptCloud(pc.cloud);render();}else{save();pushNow();render();}return;}
  if('look' in d){const [k,v]=d.look.split(':');const item=LOOKS[k]&&LOOKS[k].find(o=>o.id===v);if(item&&lookUnlocked(item)&&!(k==='back'&&item.art)){meta.look[k]=v;if(k==='back'&&!item.art)meta.look.starter=v;applyLook();if(k!=='face')unlock('style');save();}render();return;}
  if('togglepip' in d){meta.look.pip=!meta.look.pip;applyLook();save();render();return;}
  if('togglefour' in d){meta.look.four=!meta.look.four;applyLook();if(meta.look.four)unlock('four');save();render();return;}
  if('go' in d){
    if(d.go==='look'&&screen!=='look')lookFrom=screen;
    if(d.go==='ach'&&screen!=='ach')achFrom=TOP_SCREENS.includes(screen)?navFrom:screen;
    if(TOP_SCREENS.includes(d.go)&&!TOP_SCREENS.includes(screen)&&screen!=='look')navFrom=screen;
    if(d.go==='ach')meta.achSeen=ACH.filter(a=>meta.ach[a.id]).length;
    if(['road','classic','campaign'].includes(d.go))meta.lastMode=d.go;
    if(screen==='shop'||screen==='vendor')checkState();
    screen=d.go;sel=null;armedCut=null;armedFold=false;if(G&&G.over)G=null;
    if(screen==='road'&&(!meta.char||!charUnlocked(meta.char)))screen='pickchar';
    if(['campaign','town','journal','vendor'].includes(screen)){if(!meta.classic.camp)meta.classic.camp=freshCamp();careerInit(meta.classic.camp);save();}
    if(screen!=='campaign')campPick=null;
    render();window.scrollTo(0,0);return;
  }
  if('play' in d){startMatch(+d.play);return;}
  if('cplay' in d){startClassic(+d.cplay);return;}
  if('charinfo' in d){charInfo=d.charinfo;render();return;}
  if('closeinfo' in d){charInfo=null;render();return;}
  if('pickchar' in d){charInfo=null;const id=d.pickchar;if(runLive()){screen='road';render();return;}if(CHARS[id]&&charUnlocked(id)){meta.char=id;meta.path[id]=meta.path[id]||[];if(meta.equipped.length>perkSlots())meta.equipped=meta.equipped.slice(0,perkSlots());
      const cap=chemMax();let tot=chemTotal();for(const k of Object.keys(meta.chems))while(tot>cap&&meta.chems[k]>0){meta.chems[k]--;tot--;}
      checkState();save();screen='road';render();window.scrollTo(0,0);}return;}
  if('build' in d){buildMode=d.build;buildFrom=screen==='custom'?'custom':screen==='vendor'?'vendor':(d.build==='camp'?'campaign':'classic');buildDraft=null;screen='build';render();window.scrollTo(0,0);return;}
  if('opt' in d){const [k,v]=d.opt.split(':');meta.opt[k]=v==='true'?true:v==='false'?false:v;save();render();return;}
  if('preset' in d){buildDraft=d.preset==='clear'?{}:d.preset==='all'?{...meta.classic.camp.coll}:specToCounts(STARTERS[d.preset].build());render();return;}
  if('inc' in d){const k=d.inc,n=buildDraft[k]||0;
    if(buildMode==='camp'){if(n<(meta.classic.camp.coll[k]||0))buildDraft[k]=n+1;}
    else if(n<capFor(k)&&countsCost(buildDraft)+clPrice(fromKeyC(k).rank)<=CL_BUDGET)buildDraft[k]=n+1;
    render();return;}
  if('ritaplay' in d){G=null;startRita();return;}
  if('borrow' in d){const cp=meta.classic.camp,a=+d.borrow;if(!cp.tab&&TAB.options.includes(a)){cp.caps+=a;cp.tab=tabOwe(a);save();}render();return;}
  if('paytab' in d){payTab(meta.classic.camp,meta.classic.camp.tab);save();render();return;}
  if('buyset' in d){const cp=CP(),T=TOWNS[Math.min(vendorTown??cp.towns-1,cp.towns-1)],pr=Math.round(SET_PRICE*repDiscount(cp.rep[T.id]||0));if(cp.caps>=pr){cp.caps-=pr;for(const k of ALL_KEYS)cp.coll[k]=Math.min(capFor(k),(cp.coll[k]||0)+(k==='JK'?2:1));save();}render();return;}
  if('cbuy' in d){const cp=CP(),T=TOWNS[Math.min(vendorTown??cp.towns-1,cp.towns-1)],o=townStock(T)[+d.cbuy],pr=townPrice(T,o.k);if(!o.sold&&cp.caps>=pr&&(cp.coll[o.k]||0)<capFor(o.k)){cp.caps-=pr;cp.coll[o.k]=(cp.coll[o.k]||0)+1;o.sold=true;save();}render();return;}
  if('csell' in d){const cp=meta.classic.camp,k=d.csell;if(armedCut===k){if((cp.coll[k]||0)>(cp.deck[k]||0)){cp.coll[k]--;if(!cp.coll[k])delete cp.coll[k];cp.caps+=Math.floor(singlePrice(k)/2);save();}armedCut=null;}else armedCut=k;render();return;}
  if('dec' in d){const k=d.dec;if(buildDraft[k]){buildDraft[k]--;if(!buildDraft[k])delete buildDraft[k];}render();return;}
  if('savedeck' in d){const m=buildDraft;
    if(buildMode==='camp'){if(countsSize(m)+meta.classic.camp.trophies.filter(t=>t.inDeck).length>=MIN_DECK&&numCount(m)>=MIN_NUMS){meta.classic.camp.deck={...m};buildDraft=null;save();screen=buildFrom;render();window.scrollTo(0,0);}return;}
    if(countsSize(m)>=MIN_DECK&&numCount(m)>=MIN_NUMS&&countsCost(m)<=CL_BUDGET){meta.classic.deck=countsToSpec(m);buildDraft=null;save();screen=buildFrom;render();window.scrollTo(0,0);}return;}
  if('reset' in d){if(armedFold){freshMeta();save();armedFold=false;}else armedFold=true;render();return;}
  if(screen!=='match'||!G)return;
  if('tutnext' in d){if(G.tut&&tutSteps()[G.tut.step]&&tutSteps()[G.tut.step].info){G.tut.step++;save();render();}return;}
  if('skiptut' in d){if(G.tut){G.tut.done=true;sel=null;save();render();}return;}
  if('fold' in d){
    if(G.over)return;
    if(armedFold){finish('a','You folded the hand.');armedFold=false;render();}
    else{armedFold=true;render();}
    return;
  }
  if(G.over||G.turn!=='p'||busy)return;
  if('chem' in d){useChem(d.chem);return;}
  if('turret' in d){turretMode=!turretMode&&!G.turretUsed;sel=null;disbandMode=false;render();return;}
  if('hug' in d){if(!G.hugUsed&&G.setupLeft.p===0){G.hugUsed=true;meta.st.hugs=(meta.st.hugs||0)+1;G.hugPending=true;G.log.unshift(`Greg gives ${OPP().name.split(' ').slice(-1)[0]} a big hug. Alex approves.`);sfx('clink');save();}render();return;}
  if('regrow' in d){if(G.char==='harold'&&!G.regrowUsed&&G.lastLost){const L=G.lastLost;G.p.cv[L.lane].push(L.e);G.lastLost=null;G.regrowUsed=true;G.log.unshift(`Bob rustles. Your ${cardName(L.e.card)} grows back on caravan ${ROMAN[L.lane]}.`);sfx('snap');if(!freeWinCheck())save();}render();return;}
  if('boone' in d){booneMode=!booneMode&&!G.booneUsed;batMode=false;turretMode=false;legendTarget=null;sel=null;render();return;}
  if('bat' in d){batMode=!batMode&&!G.batUsed;booneMode=false;turretMode=false;legendTarget=null;sel=null;render();return;}
  if('zap' in d){if(G.ede&&!G.zapUsed&&G.a.hand.length){const k=Math.floor(Math.random()*G.a.hand.length);G.a.hand.splice(k,1);G.zapUsed=true;G.log.unshift('ED-E zaps a card out of the dealer’s hand.');sfx('jack');save();}render();return;}
  if('walk' in d){if(G.canWalk&&!G.over&&G.setupLeft.p===0){G.walked=true;unlock('walk');G.canWalk=false;finish('a','You walked away from the table.');render();}return;}
  if('repair' in d){if(G.char==='snipsnip'&&!G.repairUsed&&undoStack.length){G=JSON.parse(undoStack.pop());undoStack=[];G.repairUsed=true;meta.st.repairs=(meta.st.repairs||0)+1;G.fx=null;G.dealt=null;sel=null;disbandMode=false;turretMode=false;legendTarget=null;G.log.unshift('Snip Snip whirs backward. Your last turn never happened.');sfx('clink');save();render();}return;}
  if('request' in d){if(G.char==='threedog'&&!G.requestUsed&&sel!=null&&G.p.hand[sel]&&G.p.deck.length){const c=G.p.hand.splice(sel,1)[0];G.p.deck.unshift(c);G.p.hand.push(G.p.deck.pop());G.requestUsed=true;meta.st.requests=(meta.st.requests||0)+1;sel=null;G.log.unshift(`Three Dog takes a request: ${cardName(c)} goes back in the deck.`);sfx('swish');save();}render();return;}
  if('legend' in d){if(G.setupLeft.p===0&&sel!=null&&G.p.hand[sel]&&G.p.hand[sel].legend){if(LEGENDS[G.p.hand[sel].legend].target){legendTarget=legendTarget===sel?null:sel;render();}else playLegend(sel,null);}return;}
  if('legendcancel' in d){legendTarget=null;render();return;}
  if('undo' in d){if(undoStack.length){G=JSON.parse(undoStack.pop());G.fx=null;G.dealt=null;sel=null;disbandMode=false;G.log.unshift('You took back your last move.');save();render();}return;}
  const legal=playerLegal();
  if('hand' in d){const i=+d.hand;sel=sel===i?null:i;disbandMode=false;legendTarget=null;render();return;}
  if('discard' in d){const m=legal.find(x=>x.t==='discard'&&x.ci===sel);if(m){sel=null;playerMove(m);}return;}
  if('disband' in d){disbandMode=!disbandMode;sel=null;render();return;}
  const entry=e.target.closest('.entry'), lane=e.target.closest('.lane');
  if(booneMode){const L=entry||lane;if(L&&L.dataset.side==='a'){const l=+L.dataset.lane;if(G.a.cv[l].some(e=>e.faces.some(f=>f.rank==='K'||f.rank==='Q'))){booneMode=false;playerMove({t:'boone',lane:l});}}return;}
  if(batMode){const L=entry||lane;if(L&&L.dataset.side==='p'){const l=+L.dataset.lane;if(G.p.cv[l].length){G.p.cv[l].pop();G.batUsed=true;batMode=false;G.log.unshift(`Louisville Slugger: you knocked the top card off your caravan ${ROMAN[l]}.`);sfx('jack');if(!freeWinCheck())save();render();}}return;}
  if(legendTarget!=null){const L=entry||lane;if(L&&L.dataset.side==='a'&&G.a.cv[+L.dataset.lane].length)playLegend(legendTarget,+L.dataset.lane,entry&&entry.dataset.side==='a'?+entry.dataset.idx:null);return;}
  if(turretMode){if(entry&&entry.dataset.side==='a'&&+entry.dataset.idx===G.a.cv[+entry.dataset.lane].length-1&&!G.turretUsed){turretMode=false;playerMove({t:'turret',lane:+entry.dataset.lane});}return;}
  if(disbandMode&&lane&&lane.dataset.side==='p'){
    const m=legal.find(x=>x.t==='disband'&&x.lane===+lane.dataset.lane);
    if(m){disbandMode=false;playerMove(m);}return;
  }
  if(sel==null)return;
  if(entry){
    const m=legal.find(x=>x.t==='face'&&x.ci===sel&&x.side===entry.dataset.side&&x.lane===+entry.dataset.lane&&x.idx===+entry.dataset.idx);
    if(m&&!bustCheck(m)){sel=null;playerMove(m);return;}
  }
  if(lane&&lane.dataset.side==='p'){
    const m=legal.find(x=>x.t==='num'&&x.ci===sel&&x.lane===+lane.dataset.lane);
    if(m&&!bustCheck(m)){sel=null;playerMove(m);}
  }
});
app.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('.lane[role="button"]')){e.preventDefault();e.target.click();}
});

app.addEventListener('input',e=>{if(e.target.id==='seed-input'&&meta&&meta.newRun)meta.newRun.seed=e.target.value;if(e.target.id==='auth-email')authForm.email=e.target.value;if(e.target.id==='auth-pass')authForm.pass=e.target.value;});
app.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.target.id==='auth-pass'||e.target.id==='auth-email')){e.preventDefault();doAuth('login');}});
