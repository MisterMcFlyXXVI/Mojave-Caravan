// =====================================================================
// CLASSIC CAMPAIGN: the career. Six towns, a story, reputation, trophies,
// town vendors, challenges, a journal, and Circuit+ once you beat the Old Man.
// Rules stay pure New Vegas Caravan; the dealers just get better.
// =====================================================================
const OPENING_TAPE='A holotape turns up in your pack. No label. A gravelly voice crackles: “Heard you can play. Heard wrong, probably. Prove it. Start where everybody starts, Goodsprings, and work your way to the High Table on the Strip. I’ll be there. Bring a deck worth looking at.” The tape ends with the sound of a one-handed shuffle. Signed: the Old Man.';
const TOWNS=[
 {id:'goodsprings',name:'Goodsprings',venue:'The Prospector Saloon',back:'star',lean:{low:2,num:1.5},purse:30,chal:20,
  intro:'A water tower, a general store and the Prospector Saloon, where the card table wobbles and nobody fixes it, on purpose. Sheriff Amos Dunn keeps the game honest. Beat a couple of regulars and he’ll take you seriously.',
  dealers:[
   {name:'Wes Harlan',blurb:'Truckers’ game. Friendly, mostly.',max:25,noise:36,extra:{J:1,Q:1,K:1}},
   {name:'Cora Bell',blurb:'Runs the back room of the general store. Bets in canned beans when she’s short.',max:25,noise:32,extra:{J:2,Q:1,K:1}},
   {name:'Lefty Morrow',blurb:'Deals left-handed and swears it’s lucky. It isn’t.',max:30,noise:29,extra:{J:2,Q:1,K:2}}],
  champ:{name:'Sheriff Amos Dunn',blurb:'Retired lawman. Thirty years with a badge, forty with a deck.',max:40,noise:24,extra:{J:2,Q:2,K:2},trophy:'KS',
   pre:'“Wore a badge for thirty years. Never once saw a cheat win at this table. Let’s keep that streak going.”',
   post:'Dunn tips his hat and slides something across the felt. “The Old Man came through here once, back before my hair went white. Took my King of Spades and told me to earn it back. Never did. Reckon you just did. Keep it.” Under the King: a holotape.',
   tape:'“Goodsprings. Taught a sheriff to count to twenty-six. He’ll make a fine card player, once he stops arresting people for winning.”'},
  high:{name:'Gold Tooth Gus',blurb:'Only plays the big pots. Smiles a lot. You can see why.',max:90,noise:20,extra:{J:2,Q:2,K:3,JK:1}},
  challenges:['noface','nodiscard','exact26','streak']},
 {id:'primm',name:'Primm',venue:'The Vikki & Vance Casino',back:'stripe',lean:{num:2,mid:1.5},purse:50,chal:35,
  intro:'Primm’s roller coaster hasn’t run in two hundred years, but the casino still deals. The bank-robber mannequins in the lobby watch every hand. Lady Marigold, the last croupier in town, keeps the books and the best table.',
  dealers:[
   {name:'June Calloway',blurb:'Plays tight, bets tighter.',max:50,noise:26,extra:{J:2,Q:2,K:2}},
   {name:'Rollercoaster Ray',blurb:'Climbs the dead coaster every morning for luck. Comes down in a mood.',max:50,noise:23,extra:{J:2,Q:1,K:2,JK:1}},
   {name:'Deputy Kip',blurb:'Primm’s newest deputy. Plays like he’s still reading the manual.',max:60,noise:21,extra:{J:3,Q:1,K:2}}],
  champ:{name:'Lady Marigold',blurb:'The casino’s last croupier. Feather boa, perfect memory.',max:80,noise:17,extra:{J:2,Q:3,K:2,JK:1},trophy:'QH',
   pre:'“House rules, darling: no crying at my table, and no counting cards out loud.”',
   post:'Marigold gathers the cards with one long sweep. “You play like he did. Fast and a little rude.” She tucks a Queen of Hearts into your pocket with a holotape. “He said someone would come asking. Took forty years.”',
   tape:'“Primm. Lost a hand to a woman in a feather boa with a memory like a vault door. Told her my name. She’ll remember it longer than I will.”'},
  high:{name:'Mint Julep Jones',blurb:'Sips something green and never loses track of the count.',max:180,noise:14,extra:{J:2,Q:2,K:3,JK:2}},
  challenges:['sweep','quick','bigbet','noface']},
 {id:'novac',name:'Novac',venue:'The Dinosaur Motel',back:'uranium',lean:{face:1.6,Q:2,J:1.5},purse:80,chal:55,
  intro:'A dinosaur-shaped motel on the edge of nowhere. The town is quiet; the snipers on the roof are quieter. Dino Dale deals from inside the dinosaur’s mouth and swears the view is worth the climb.',
  dealers:[
   {name:'Ollie Banks',blurb:'Loves a Joker more than his mule.',max:100,noise:19,extra:{J:2,Q:1,K:2,JK:2}},
   {name:'Sister Mae',blurb:'Deals with a prayer and a grudge.',max:100,noise:16,extra:{J:3,Q:2,K:2,JK:1}},
   {name:'Two-Bit Tilly',blurb:'Runs the motel desk. Overcharges for rooms, undercharges for lessons.',max:120,noise:14,extra:{J:2,Q:3,K:2,JK:1}}],
  champ:{name:'Dino Dale',blurb:'Lives in the dinosaur’s head. Hasn’t come down in a week.',max:160,noise:12,extra:{J:3,Q:2,K:3,JK:2},trophy:'JK',
   pre:'“Up here you can see a sandstorm coming an hour off. Can’t see a Joker coming at all.”',
   post:'Dale laughs until the whole dinosaur shakes. “He told me you’d come. Said, when the kid shows up, give ’em this.” A holotape and a Joker from a deck older than the motel.',
   tape:'“Novac. Slept in a dinosaur. Lost a Joker to a man who lives in one. Some nights the wasteland writes its own jokes.”'},
  high:{name:'Rocket Red',blurb:'Claims he flew to the moon once. Plays like he’s still up there.',max:350,noise:10,extra:{J:3,Q:2,K:3,JK:2}},
  challenges:['joker','kings','streak','nodiscard']},
 {id:'boulder',name:'Boulder City',venue:'The Old Train Station',back:'rust',lean:{J:2.2,face:1.3},purse:120,chal:80,
  intro:'Half rubble, half NCR checkpoint. Troopers play for ration chits and bragging rights in the old train station. Major Ada Strand runs the quartermaster’s table, and she counts everything twice.',
  dealers:[
   {name:'Sergeant Hollis',blurb:'NCR, twenty years in. Plays by the book, and the book is mean.',max:150,noise:13,extra:{J:3,Q:2,K:2,JK:1}},
   {name:'Corporal Fenn',blurb:'Bets his whole paycheck every hand. Has never been paid.',max:150,noise:11,extra:{J:3,Q:2,K:3}},
   {name:'Juno the Runner',blurb:'Khan messenger. Fast hands, faster exits.',max:180,noise:9.5,extra:{J:4,Q:2,K:2,JK:1}}],
  champ:{name:'Major Ada Strand',blurb:'NCR quartermaster. Has a form for everything, including losing.',max:250,noise:8,extra:{J:4,Q:2,K:3,JK:2},trophy:'JD',
   pre:'“Regulations say no gambling on duty. I’m not on duty.”',
   post:'Strand signs a requisition form, stamps it twice, and hands over a Jack of Diamonds and a holotape marked CLASSIFIED. It isn’t.',
   tape:'“Boulder City. An NCR major beat me three hands straight, then filed a report about it. Proud of her. Don’t tell her.”'},
  high:{name:'Ranger Cobb',blurb:'Says nothing. Wins anyway.',max:550,noise:6.5,extra:{J:3,Q:3,K:3,JK:2}},
  challenges:['jacks','sweep','bigbet','quick']},
 {id:'freeside',name:'Freeside',venue:'The Atomic Wrangler',back:'shot',lean:{K:2,JK:2,face:1.4},purse:180,chal:110,
  intro:'The shadow of the Strip, where the lights spill over the wall and nothing else does. Every corner has a game, and every game has an angle. Lena Vasquez never plays the same deck twice, and she’s never lost in Freeside.',
  dealers:[
   {name:'Dutch Ferro',blurb:'Stacks Kings like he stacks debts.',max:250,noise:8,extra:{J:2,Q:2,K:5,JK:1}},
   {name:'Sweetwater Sal',blurb:'Sells purified water by day, takes your caps by night.',max:250,noise:7,extra:{J:3,Q:3,K:3,JK:1}},
   {name:'“Hound Dog” Harlan',blurb:'Pompadour, leather jacket, very serious about both.',max:300,noise:6,extra:{J:3,Q:2,K:4,JK:2}}],
  champ:{name:'Lena Vasquez',blurb:'Never plays the same deck twice. Never loses in Freeside.',max:400,noise:4.5,extra:{J:3,Q:3,K:4,JK:2},trophy:'KH',
   pre:'“Pick a deck, any deck. Doesn’t matter. I’ve already beaten it.”',
   post:'Lena stares at the table for a long time. Then she smiles. “He’s on the Strip. Top of the tower, the High Table. He’s been waiting for someone like you. Take the King. Take the tape. Go.”',
   tape:'“Freeside. A kid with a switchblade and a perfect shuffle. Told her never to play the same deck twice. She took me literally. Good.”'},
  high:{name:'Brass Knuckle Bo',blurb:'Runs the back room. You don’t want to owe him.',max:900,noise:3.5,extra:{J:3,Q:3,K:4,JK:2}},
  challenges:['kings','exact26','streak','joker']},
 {id:'strip',name:'The Strip',venue:'The High Table',back:'blood',lean:{face:1.8,K:1.6,JK:1.6,high:1.4},purse:300,chal:150,
  intro:'Lights you can see from Goodsprings. Securitrons on every corner, and at the top of the tallest tower, the High Table. Three house dealers stand between you and the Old Man.',
  dealers:[
   {name:'Mr. Pell',blurb:'House dealer. House rules: none.',max:400,noise:4,extra:{J:4,Q:2,K:4,JK:2}},
   {name:'Chairman Vic',blurb:'Sharp suit, sharper deck. Croons between hands.',max:400,noise:3,extra:{J:3,Q:3,K:4,JK:2}},
   {name:'White Glove Wren',blurb:'Never touches the cards with bare hands. Never misses.',max:500,noise:2.5,extra:{J:4,Q:3,K:4,JK:2}}],
  champ:{name:'The Old Man',blurb:'Taught half the Mojave to play. Shuffles one-handed.',max:750,noise:0.5,extra:{J:4,Q:3,K:4,JK:2},trophy:'JK',final:true,
   pre:'An old man in a dusty suit, shuffling a deck with one hand. “Took you long enough. Sit. Let’s see what the Mojave taught you.”',
   post:'The Old Man sets his cards down and laughs, a real laugh. “I dealt the first hand of Caravan after the bombs fell. Been looking for someone to deal the last one. Not yet, though.” He slides his own Joker across, worn soft as cloth. “The circuit’s yours, kid. When you’re ready, run it again. It’ll be meaner this time. So will I.”',
   tape:'“The Strip. Been waiting at this table forty years. If you’re hearing this, you found me. Deal.”'},
  high:{name:'Platinum Croupier',blurb:'A pre-war robot dealer. Its smile is painted on.',max:1500,noise:1,extra:{J:4,Q:3,K:5,JK:2}},
  challenges:['sweep','nodiscard','bigbet','kings']},
];
const CHALLENGES={
  noface:{name:'Clean Hands',desc:'Win without playing a face card.',test:g=>!g.stats.faces},
  sweep:{name:'Clean Sweep',desc:'Win 3–0, selling all three caravans.',test:(g,l)=>l.filter(x=>x==='p').length===3},
  exact26:{name:'Twenty-Six',desc:'Win with a caravan sold at exactly 26.',test:(g,l)=>[0,1,2].some(i=>l[i]==='p'&&cvValue(g.p.cv[i])===26)},
  kings:{name:'Crowned',desc:'Play 3 Kings in a game you win.',test:g=>(g.stats.kings||0)>=3},
  jacks:{name:'Saboteur',desc:'Play 2 Jacks in a game you win.',test:g=>(g.stats.jacks||0)>=2},
  joker:{name:'Wild Card',desc:'Win a game where you played a Joker.',test:g=>(g.stats.jokers||0)>=1},
  nodiscard:{name:'No Regrets',desc:'Win without discarding or disbanding.',test:g=>!g.stats.discards&&!g.stats.disbands},
  quick:{name:'Fast Hands',desc:'Win in 12 of your turns or fewer.',test:g=>(g.stats.turns||99)<=12},
  streak:{name:'On a Roll',desc:'Win 3 games in a row in this town.',test:(g,l,c)=>c.streak>=3},
  bigbet:{name:'All In',desc:'Win a bet at a dealer’s full table limit.',test:(g,l,c)=>c.bet>0&&c.bet>=c.max},
};
const REP_TIERS=[[0,'Stranger'],[3,'Regular'],[6,'Respected'],[10,'Legend']];
const repTier=n=>{let t=REP_TIERS[0];for(const r of REP_TIERS)if(n>=r[0])t=r;return t[1];};
const repDiscount=n=>n>=10?0.8:n>=3?0.9:1;
const BET_LADDER=[0,10,25,50,75,100,150,200,300,400,500,750,1000,1500,2000,3000];
const TROPHY_NAME=k=>{const c=fromKeyC(k);return c.rank==='JK'?'Joker':`${FACE_NAME[c.rank]||c.rank} of ${SUIT_WORD[c.suit]}`;};

// ---------- career state ----------
function careerInit(cp){
  if(cp.career)return cp;
  cp.career=1;cp.plus=cp.plus||0;cp.towns=cp.towns||1;cp.cbeat=cp.cbeat||[];cp.rep=cp.rep||{};cp.streak={};cp.trophies=cp.trophies||[];
  cp.tapes=cp.tapes||[];cp.chal=cp.chal||{};cp.seen=cp.seen||{};cp.story=cp.story||[];cp.stocks={};cp.lastBet={};cp.rec=cp.rec&&!Array.isArray(cp.rec)&&!('0' in cp.rec)?cp.rec:{};
  // older saves: convert the 8-dealer ladder into town progress
  const old=Array.isArray(cp.beaten)?cp.beaten.length:0;
  if(old){const cleared=Math.min(5,Math.floor(old*6/8));
    for(let t=0;t<cleared;t++){const T=TOWNS[t];cp.cbeat.push(`${T.id}:c`,`${T.id}:0`,`${T.id}:1`);cp.rep[T.id]=3;cp.seen[T.id]=1;
      if(!cp.trophies.some(x=>x.from===T.champ.name))cp.trophies.push({k:T.champ.trophy,from:T.champ.name,town:T.id,inDeck:false});
      if(!cp.tapes.includes(T.id))cp.tapes.push(T.id);}
    cp.towns=Math.min(6,cleared+1);
    cp.story.push({title:'The circuit got bigger',text:`The road to the High Table now runs through six towns, each with its own regulars, a champion, a high roller, a vendor and side challenges. Your collection, deck and caps came with you, and your old wins count: ${cleared?`you’ve already cleared ${cleared} town${cleared>1?'s':''}`:'pick up where you left off'}.`});
  }else cp.story.push({title:'A holotape, no label',text:OPENING_TAPE});
  cp.beaten=cp.beaten||[];
  return cp;
}
const CP=()=>{const cp=meta.classic.camp;return cp?careerInit(cp):null;};
const plusMul=()=>1+(CP().plus||0);
function dealerFor(id){
  const [tid,slot]=id.split(':'),ti=TOWNS.findIndex(t=>t.id===tid),T=TOWNS[ti];if(!T)return null;
  const base=slot==='c'?T.champ:slot==='h'?T.high:T.dealers[+slot];
  const p=CP().plus||0,extra={...base.extra};
  if(p){for(const r of ['J','K'])extra[r]=(extra[r]||0)+p;extra.JK=Math.min(2+p,(extra.JK||0)+1);}
  return {...base,id,ti,slot,town:T,max:Math.round(base.max*(1+p)),noise:Math.max(0.3,base.noise*Math.pow(0.55,p)),extra,
    place:`${T.venue}, ${T.name}`,kind:slot==='c'?'Champion':slot==='h'?'High roller':'Regular'};
}
const beatNow=id=>CP().cbeat.includes(id);
const regularsBeaten=T=>[0,1,2].filter(i=>beatNow(`${T.id}:${i}`)).length;
function dealerOpen(id){
  const d=dealerFor(id),T=d.town,cp=CP();
  if(d.ti>=cp.towns)return false;
  if(d.slot==='c')return regularsBeaten(T)>=2;
  if(d.slot==='h')return beatNow(`${T.id}:c`)&&(cp.rep[T.id]||0)>=6;
  return true;
}
function lockReason(id){
  const d=dealerFor(id),T=d.town,cp=CP();
  if(d.slot==='c')return `Beat ${2-regularsBeaten(T)} more regular${2-regularsBeaten(T)===1?'':'s'} here.`;
  if(d.slot==='h')return !beatNow(`${T.id}:c`)?`Beat ${T.champ.name} first.`:`Needs Respected reputation (${cp.rep[T.id]||0}/6).`;
  return '';
}
function campDeckSize(cp){return countsSize(cp.deck)+cp.trophies.filter(t=>t.inDeck).length;}
function campDeckSpec(){
  const cp=CP(),spec=withPacks(countsToSpec(cp.deck),packList());
  for(const t of cp.trophies)if(t.inDeck){const c=fromKeyC(t.k),T=TOWNS.find(x=>x.id===t.town);spec.push({...c,pack:T?T.back:'map',trophy:true});}
  return spec;
}
function rollTownStock(T,coll){
  const cp=CP(),w=T.lean,n=(cp.rep[T.id]||0)>=10?8:6;
  const weight=k=>{const c=fromKeyC(k),v=c.rank==='JK'?0:isNum(c)?val(c):0;let x=1;
    if(isNum(c)){x*=w.num||1;if(v<=4)x*=w.low||1;else if(v<=7)x*=w.mid||1;else x*=w.high||1;}
    else{x*=w.face||1;x*=w[c.rank]||1;}return x;};
  const pool=ALL_KEYS.filter(k=>(coll[k]||0)<capFor(k)),out=[];
  while(out.length<n&&pool.length){const tot=pool.reduce((a,k)=>a+weight(k),0);let r=Math.random()*tot,i=0;for(;i<pool.length;i++){r-=weight(pool[i]);if(r<=0)break;}out.push({k:pool.splice(Math.min(i,pool.length-1),1)[0],sold:false});}
  return out;
}
function townStock(T){const cp=CP();if(!cp.stocks[T.id])cp.stocks[T.id]=rollTownStock(T,cp.coll);return cp.stocks[T.id];}
const townPrice=(T,k)=>Math.max(1,Math.round(singlePrice(k)*repDiscount(CP().rep[T.id]||0)));

// ---------- starting a career match ----------
function startCareer(id,bet){
  const cp=CP(),d=dealerFor(id);
  if(!d||!dealerOpen(id)||bet>cp.caps||bet>d.max||campDeckSize(cp)<MIN_DECK)return;
  cp.caps-=bet;cp.lastBet[id]=bet;campPick=null;
  G=newMatch(campDeckSpec(),addFaces(baseNumbers(),d.extra),d.ti,baseRules());
  G.mode='campaign';G.stake=bet;G.cd={id,name:d.name,blurb:d.blurb,place:d.place,noise:d.noise,max:d.max,ti:d.ti,slot:d.slot};
  enterMatch();
}
function careerFinish(winner,ov,stake){
  const cp=CP(),d=G.cd,T=TOWNS[d.ti],lanes=lanesResult(G),r=cp.rec[d.id]||{w:0,l:0},p=cp.plus||0;
  const ctx={bet:stake,max:d.max,streak:0};ov.lines=[];
  if(winner==='p'){
    cp.caps+=stake*2;cp.wins++;r.w++;
    cp.streak[T.id]=(cp.streak[T.id]||0)+1;ctx.streak=cp.streak[T.id];
    const first=!beatNow(d.id);
    cp.rep[T.id]=Math.min(12,(cp.rep[T.id]||0)+(d.slot==='c'?2:d.slot==='h'?2:1));
    if(first){cp.cbeat.push(d.id);ov.firstBeat=true;}
    if(d.slot==='c'){const pp=TABLE_PROPS.find(x=>x.camp===T.id);if(pp)unlockProp(pp.id);}
    if(d.slot==='c'&&first){
      const purse=T.purse*(1+p);cp.caps+=purse;ov.lines.push(`Champion’s purse: ${purse} caps`);
      const C=T.champ;let text=C.post;
      if(!cp.trophies.some(t=>t.from===C.name)){cp.trophies.push({k:C.trophy,from:C.name,town:T.id,inDeck:true});ov.lines.push(`Trophy: ${TROPHY_NAME(C.trophy)} (added to your deck)`);}
      if(!cp.tapes.includes(T.id)){cp.tapes.push(T.id);text+=`\n\nHolotape: ${C.tape}`;}
      cp.story.push({title:p?`${C.name}, again`:C.name,text:p?`${C.name} pays out and shakes your hand. “Meaner every time around, aren’t you?”`:text});
      if(d.ti+1>=cp.towns&&d.ti<TOWNS.length-1){cp.towns=d.ti+2;const N=TOWNS[d.ti+1];ov.lines.push(`New town: ${N.name}`);}
      if(C.final){
        if(!cp.done){cp.done=true;ov.campDone=true;}
        cp.plus=p+1;cp.cbeat=[];cp.towns=1;cp.streak={};cp.stocks={};
        cp.story.push({title:`Circuit ${cp.plus+1}`,text:`Word gets around. Every dealer from Goodsprings to the Strip has studied your game, and the stakes have gone up. Dealers are sharper, decks carry more Kings and Jokers, table limits are ${cp.plus+1}× higher, and every challenge pays out again. Your collection, trophies and reputation carry over. Start in Goodsprings.`});
        ov.lines.push(`Circuit ${cp.plus+1} begins`);
      }
    }
    // side challenges, once per circuit
    const done=cp.chal[p]=cp.chal[p]||{};
    for(const cid of T.challenges){const key=`${T.id}:${cid}`;if(done[key])continue;
      if(CHALLENGES[cid].test(G,lanes,ctx)){done[key]=1;const pay=T.chal*(1+p);cp.caps+=pay;cp.rep[T.id]=Math.min(12,(cp.rep[T.id]||0)+1);ov.lines.push(`Challenge: ${CHALLENGES[cid].name} +${pay} caps`);}}
  }else{cp.losses++;r.l++;cp.streak[T.id]=0;}
  cp.rec[d.id]=r;cp.stocks={};
  ov.delta=winner==='p'?stake:-stake;
  if(winner==='p'&&cp.tab&&stake)ov.tabPaid=payTab(cp,Math.ceil(stake/2));
}

// ---------- screens ----------
let townView=null, vendorTown=null;
function storyHTML(){
  const cp=CP();if(!cp||!cp.story.length)return '';
  const s=cp.story[0];
  return `<div class="overlay"><div class="panel result storycard" role="dialog" aria-label="${esc(s.title)}">
    <div class="tapehead">◉ ${esc(s.title)}</div>
    ${s.text.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join('')}
    <button class="btn hot" data-storyok>Continue</button></div></div>`;
}
const repBar=n=>`<span class="repbar" title="${repTier(n)}"><i style="width:${Math.min(100,n/12*100)}%"></i></span>`;
function careerHeader(cp){
  return `<div class="careerhead">
    <div><small>${cp.plus?`Circuit ${cp.plus+1}`:'The circuit'}</small><b>${cp.done&&!cp.plus?'':''}${TOWNS[Math.min(cp.towns,TOWNS.length)-1].name}</b><span>${cp.wins}W · ${cp.losses}L · ${cp.trophies.length} troph${cp.trophies.length===1?'y':'ies'} · ${cp.tapes.length}/6 holotapes</span></div>
    ${capsHTML(cp.caps)}</div>`;
}
function renderCampaign(){
  const cp=CP();
  const deckN=campDeckSize(cp),deckOK=deckN>=MIN_DECK;
  app.innerHTML=`
  <div class="mbar">${backBtn('classic','Classic')}${capsHTML(cp.caps)}</div>
  <section class="hero small"><div class="neon sm">${cp.plus?`Circuit ${cp.plus+1}`:'The circuit'}</div>
    <p class="tagline">${cp.done?`You beat the Old Man${cp.plus>1?` ${cp.plus} times`:''}. The road’s meaner now.`:'Goodsprings to the High Table.'}</p></section>
  <div class="hubbar">
    <button class="btn" data-build="camp">Edit deck (${deckN})</button>
    <button class="btn" data-go="journal">Journal</button>
  </div>
  ${deckOK?'':`<p class="hint" style="color:var(--blood)">Your deck needs at least ${MIN_DECK} cards. <button class="btn" data-build="camp" style="padding:3px 10px">Build it</button></p>`}
  <section class="panel trailmap"><div class="maplabel">Goodsprings → The Strip</div>
    ${TOWNS.map((T,i)=>{const open=i<cp.towns,done=beatNow(`${T.id}:c`),rep=cp.rep[T.id]||0,chDone=T.challenges.filter(c=>(cp.chal[cp.plus||0]||{})[`${T.id}:${c}`]).length;
      if(!open)return `<div class="stopmini"><span class="mile">${i+1}</span><div><b>${esc(T.name)}</b><span>Locked. Beat the champion in ${esc(TOWNS[i-1].name)}.</span></div></div>`;
      return `<button class="towncard${done?' done':''}${i===cp.towns-1&&!done?' now':''}" data-town="${i}">
        <span class="mile">${done?'✓':i+1}</span>
        <span class="tc-body"><b>${esc(T.name)}</b><span>${esc(T.venue)} · ${regularsBeaten(T)}/3 regulars · champion ${done?'beaten':'waiting'}</span>
          <span class="tc-meta">${repBar(rep)} ${repTier(rep)} · challenges ${chDone}/4</span></span>
        <span class="tc-go">›</span></button>`;}).join('')}
  </section>
  <section class="panel" style="margin-top:14px">
    <div class="sect-h"><h2 style="font-size:22px">${esc(TAB.lender)}’s tab</h2>${cp.tab?`<span class="pill num">You owe ${cp.tab}</span>`:''}</div>
    ${cp.tab
      ?`<p class="note">${esc(TAB.lender)} takes half of every win until the tab is paid. You can’t borrow again until it’s clear.</p>
        <div class="hubbtns" style="margin-top:0"><button class="btn${cp.caps>=cp.tab?' hot':''}" data-paytab ${cp.caps?'':'disabled'}>Pay ${Math.min(cp.caps,cp.tab)} now</button></div>`
      :`<p class="note">The bartender at ${esc(TAB.bar)} will float you caps for a flat ${Math.round(TAB.fee*100)}% fee. One loan at a time. Half of every win goes back to her until it’s paid.</p>
        <div class="hubbtns" style="margin-top:0">${TAB.options.map(a=>`<button class="btn" data-borrow="${a}">Borrow ${a}, owe ${tabOwe(a)}</button>`).join('')}</div>`}
    <div class="stop rita" style="margin-top:10px">
      <div class="mile">★</div>
      <div><div class="place">${esc(RITA.place)}</div><div class="who">${esc(RITA.name)} · ${esc(RITA.blurb)}</div>
        <div class="terms num">Always open · no bet · win and she pays you ${RITA.pay} caps while you hold under ${RITA.under}${cp.rita?` · record ${cp.rita.w}W · ${cp.rita.l}L`:''}</div></div>
      <button class="btn${cp.caps<10?' hot':''}" data-ritaplay ${deckOK?'':'disabled'}>Play</button>
    </div>
  </section>
  ${storyHTML()}`;
}
function renderTown(){
  const cp=CP(),ti=Math.min(townView??cp.towns-1,cp.towns-1),T=TOWNS[ti],rep=cp.rep[T.id]||0,p=cp.plus||0;
  if(!cp.seen[T.id]){cp.seen[T.id]=1;cp.story.push({title:T.name,text:T.intro});save();}
  const deckOK=campDeckSize(cp)>=MIN_DECK;
  const row=id=>{const d=dealerFor(id),open=dealerOpen(id),beat=beatNow(id),r=cp.rec[id]||{w:0,l:0},picking=campPick===id;
    const bets=[...new Set([...BET_LADDER.filter(b=>b<=d.max&&b<=cp.caps),...(d.max<=cp.caps?[d.max]:[])])].sort((a,b)=>a-b);
    return `<div class="stop${beat?' beat':''}${open?'':' locked'}${d.slot==='c'?' champ':d.slot==='h'?' high':''}">
      <div class="mile">${beat?'✓':d.slot==='c'?'♛':d.slot==='h'?'◆':+d.slot+1}</div>
      <div><div class="place">${esc(d.name)}<small class="kind"> · ${d.kind}</small></div><div class="who">${esc(d.blurb)}</div>
        <div class="terms num">${open?`Table limit ${d.max} · record ${r.w}W · ${r.l}L${d.slot==='c'&&!beat?` · purse ${T.purse*(1+p)}`:''}`:esc(lockReason(id))}</div>
        ${picking?`<div class="bets" role="group" aria-label="Choose your bet">${bets.map(b=>`<button class="btn${b===(cp.lastBet[id]??Math.min(25,d.max))?' hot':''}" data-cbet="${b}">${b?capN(b):'Friendly'}</button>`).join('')}</div>`:''}</div>
      <button class="btn${open&&!picking&&!beat&&deckOK?' hot':''}" data-cpick="${id}" ${open&&deckOK?'':'disabled'}>${!open?'Locked':picking?'Cancel':beat?'Play again':'Play'}</button>
    </div>`;};
  const done=cp.chal[p]||{};
  app.innerHTML=`
  <div class="mbar">${backBtn('campaign','The circuit')}${capsHTML(cp.caps)}</div>
  <section class="hero small"><div class="neon sm">${esc(T.name)}</div><p class="tagline">${esc(T.venue)}</p></section>
  <div class="hubbar">
    <span class="pill">${repBar(rep)} ${repTier(rep)} · ${rep}/12</span>
    <button class="btn" data-ctownvendor="${ti}">Town vendor</button>
    <button class="btn" data-build="camp">Edit deck (${campDeckSize(cp)})</button>
  </div>
  <section class="panel">
    <details class="townstory"><summary>About ${esc(T.name)}</summary><p>${esc(T.intro)}</p></details>
    <div class="road">${[0,1,2,'c','h'].map(s=>row(`${T.id}:${s}`)).join('')}</div>
  </section>
  <section class="panel" style="margin-top:14px">
    <h2 style="font-size:22px">Side challenges</h2>
    <p class="note">Complete them in any game against a dealer here. Each pays ${T.chal*(1+p)} caps and +1 reputation, once per circuit.</p>
    <div class="plist">${T.challenges.map(c=>{const ok=done[`${T.id}:${c}`];return `<div class="prow chal${ok?' ok':''}"><div><b>${ok?'✓ ':''}${CHALLENGES[c].name}</b><span>${esc(CHALLENGES[c].desc)}</span></div><span class="pill num">${ok?'Done':`+${T.chal*(1+p)}`}</span></div>`;}).join('')}</div>
    <p class="note" style="margin-top:10px">Reputation: <b>Regular</b> at 3 (vendor 10% off), <b>Respected</b> at 6 (opens the high-roller table once the champion is beaten), <b>Legend</b> at 10 (vendor 20% off and more stock).</p>
  </section>
  ${storyHTML()}`;
}
function renderVendor(){
  const cp=CP(),ti=Math.min(vendorTown??cp.towns-1,cp.towns-1),T=TOWNS[ti],rep=cp.rep[T.id]||0,stock=townStock(T);
  const canSet=ALL_KEYS.some(k=>(cp.coll[k]||0)<capFor(k)),setPrice=Math.round(SET_PRICE*repDiscount(rep));
  const sellable=ALL_KEYS.filter(k=>(cp.coll[k]||0)>(cp.deck[k]||0));
  const spare=countsSize(cp.coll)-countsSize(cp.deck);
  app.innerHTML=`
  <div class="mbar">${backBtn('town',T.name)}${capsHTML(cp.caps)}</div>
  <section class="panel">
    <div class="sect-h"><h2 style="font-size:26px">${esc(T.name)} vendor</h2><button class="btn" data-build="camp">Edit deck</button></div>
    <p class="note">Every town stocks different cards, and stock changes after every game. ${repDiscount(rep)<1?`Your reputation here gets you ${Math.round((1-repDiscount(rep))*100)}% off.`:'Earn reputation here for discounts.'} Cards you buy go into your <b>collection</b>; tap <b>Edit deck</b> to play them.</p>
    ${spare>0?`<p class="note" style="color:var(--sage)">You have ${spare} card${spare===1?'':'s'} in your collection that ${spare===1?'isn’t':'aren’t'} in your deck.</p>`:''}
    ${deckLimitHTML()}
    <div class="prow"><div><b>Full pack</b><span>One of every card plus 2 Jokers, each from your next unused pack. Cards you already own from every pack are skipped.</span></div>
      <button class="btn${canSet&&cp.caps>=setPrice?' hot':''}" data-buyset ${canSet&&cp.caps>=setPrice?'':'disabled'}>${capN(setPrice)}</button></div>
    <h3 class="sub">Single cards</h3>
    <div class="offers">${stock.map((o,i)=>{const c=fromKeyC(o.k),pr=townPrice(T,o.k),full=(cp.coll[o.k]||0)>=capFor(o.k);return `<div class="offer${o.sold?' sold':''}">
      ${cardHTML(c)}<div class="what">${c.rank==='JK'?'Joker':isNum(c)?cardName(c):FACE_NAME[c.rank]+' '+SUIT_CH[c.suit]} · own ${cp.coll[o.k]||0}</div>
      <button class="btn${!o.sold&&!full&&cp.caps>=pr?' hot':''}" data-cbuy="${i}" ${o.sold||full||cp.caps<pr?'disabled':''}>${o.sold?'Sold':full?'Maxed':capN(pr)}</button></div>`;}).join('')||'<p class="note">Nothing left you can own more of. Earn more packs to raise the limit.</p>'}</div>
    <h3 class="sub">Sell spare cards</h3>
    <p class="note">Cards not in your deck sell for half the base price. Take a card out of your deck first to sell it. Trophies can’t be sold.</p>
    ${sellable.length?`<div class="deckgrid">${sellable.map(k=>{const c=fromKeyC(k);return `<button class="card-btn" data-csell="${k}" aria-label="Sell ${cardName(c)}" style="${armedCut===k?'transform:translateY(-6px)':''}">${cardHTML(c)}</button>`;}).join('')}</div>
      <p class="hint" style="text-align:left">${armedCut&&typeof armedCut==='string'?`Tap ${cardName(fromKeyC(armedCut))} again to sell it for ${Math.floor(singlePrice(armedCut)/2)} caps.`:''}</p>`:'<p class="note">Every card you own is in your deck.</p>'}
  </section>`;
}
function renderJournal(){
  const cp=CP(),p=cp.plus||0,allDone=Object.keys(cp.chal).reduce((a,k)=>a+Object.keys(cp.chal[k]).length,0);
  app.innerHTML=`
  <div class="mbar">${backBtn('campaign','The circuit')}${capsHTML(cp.caps)}</div>
  <section class="hero small"><div class="neon sm">Journal</div><p class="tagline">${cp.plus?`Circuit ${p+1}`:'Your first circuit'} · ${cp.wins}W · ${cp.losses}L</p></section>
  <section class="panel">
    <h2 style="font-size:22px">Holotapes ${cp.tapes.length}/6</h2>
    <div class="tapes">
      <div class="tape"><b>The first tape</b><p>${esc(OPENING_TAPE)}</p></div>
      ${TOWNS.map(T=>cp.tapes.includes(T.id)?`<div class="tape"><b>${esc(T.name)}</b><p>${esc(T.champ.tape)}</p></div>`:`<div class="tape locked"><b>${esc(T.name)}</b><p>Beat ${esc(T.champ.name)} to find this tape.</p></div>`).join('')}
    </div>
  </section>
  <section class="panel" style="margin-top:14px">
    <h2 style="font-size:22px">Trophy cards ${cp.trophies.length}/6</h2>
    <p class="note">Won from each town champion, from their own pack. They don’t count against your pack limit. Choose which ones ride in your deck.</p>
    <div class="trophies">${cp.trophies.map((t,i)=>`<button class="trophy${t.inDeck?' on':''}" data-trophy="${i}" aria-pressed="${t.inDeck}"><span data-back="${(TOWNS.find(x=>x.id===t.town)||{}).back||'map'}">${cardHTML(fromKeyC(t.k))}</span><b>${esc(TROPHY_NAME(t.k))}</b><small>from ${esc(t.from)}</small><i>${t.inDeck?'In your deck':'Not in deck'}</i></button>`).join('')||'<p class="note">None yet. Beat Sheriff Dunn in Goodsprings for your first.</p>'}</div>
  </section>
  <section class="panel" style="margin-top:14px">
    <h2 style="font-size:22px">Towns</h2>
    <div class="plist">${TOWNS.map((T,i)=>{const rep=cp.rep[T.id]||0,rw=[0,1,2,'c','h'].map(s=>cp.rec[`${T.id}:${s}`]||{w:0,l:0}).reduce((a,r)=>({w:a.w+r.w,l:a.l+r.l}),{w:0,l:0});
      return `<div class="prow"><div><b>${esc(T.name)}</b><span>${i<cp.towns||rep?`${repTier(rep)} (${rep}/12) · ${rw.w}W · ${rw.l}L`:'Not reached yet'}</span></div>${repBar(rep)}</div>`;}).join('')}</div>
    <p class="note" style="margin-top:10px">Challenges completed, all circuits: ${allDone}.</p>
  </section>
  <section class="panel" style="margin-top:14px">
    <h2 style="font-size:22px">Start a new circuit</h2>
    <p class="note">Wipes this campaign only: collection, deck, caps, tab, reputation, trophies, holotapes and challenges. Packs, achievements and everything outside the campaign stay.</p>
    <button class="btn${armedCut==='newcircuit'?' armed':''}" data-newcircuit>${armedCut==='newcircuit'?'Tap again to start over':'Start a new circuit'}</button>
  </section>
  ${storyHTML()}`;
}
function handleCareerClick(d){
  const cp=meta.classic&&meta.classic.camp?CP():null;if(!cp)return false;
  if('storyok' in d){cp.story.shift();save();render();return true;}
  if('town' in d){townView=+d.town;campPick=null;screen='town';render();window.scrollTo(0,0);return true;}
  if('ctownvendor' in d){vendorTown=+d.ctownvendor;screen='vendor';render();window.scrollTo(0,0);return true;}
  if('cpick' in d){const id=d.cpick,dd=dealerFor(id);
    if(campPick!==id&&dd.slot==='c'&&!cp.seen[id+(cp.plus||0)]){cp.seen[id+(cp.plus||0)]=1;cp.story.push({title:dd.name,text:dd.pre});}
    campPick=campPick===id?null:id;save();render();return true;}
  if('cbet' in d){if(campPick)startCareer(campPick,+d.cbet);return true;}
  if('crebet' in d){const id=d.crebet;const bet=Math.min(cp.lastBet[id]||0,cp.caps);G=null;startCareer(id,bet);return true;}
  if('trophy' in d){const t=cp.trophies[+d.trophy];if(t){if(t.inDeck&&campDeckSize(cp)<=MIN_DECK)return true;t.inDeck=!t.inDeck;save();}render();return true;}
  if('newcircuit' in d){if(armedCut==='newcircuit'){meta.classic.camp=careerInit(freshCamp());armedCut=null;save();screen='campaign';}else armedCut='newcircuit';render();return true;}
  return false;
}


