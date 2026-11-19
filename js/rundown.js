// =====================================================================
// "How a round works": an illustrated rundown shown before the guided tutorial
// =====================================================================
let rundownStep=0, rundownThen=null;
const mc=(rank,suit)=>cardHTML({rank,suit});
function miniCv(cards,{v,dir,tag,cls,label}={}){
  return `<div class="mcv ${cls||''}">${label?`<small>${label}</small>`:''}<div class="mcv-top"><b class="num">${v??''}</b>${dir?`<span>${dir}</span>`:''}${tag?`<i class="mtag ${tag.toLowerCase()}">${tag}</i>`:''}</div>
    <div class="mcv-stack">${cards.map((c,i)=>`<div class="mcv-card" style="top:${i*18}px">${typeof c==='string'?c:mc(c[0],c[1])}${c[2]?`<span class="mchip">${c[2]}</span>`:''}</div>`).join('')}</div></div>`;
}
const RUNDOWN=[
  {title:'The goal',body:`<p>You and the dealer each build <b>three caravans</b>, side by side. Each of your caravans faces one of theirs.</p>
    <p>A caravan <b>sells</b> when it’s worth <b>21 to 26</b> and beats the one across from it. Sell <b>two of three</b> and you win the hand.</p>`,
    art:()=>`<div class="mrow"><div class="mlab">Dealer</div>${miniCv([['10','S'],['9','S']],{v:19,tag:'Behind'})}${miniCv([['9','D','K'],['6','D']],{v:24,tag:'Ahead'})}${miniCv([['10','C'],['9','H'],['8','C']],{v:27,tag:'Bust'})}</div>
      <div class="mrow"><div class="mlab">You</div>${miniCv([['10','H'],['6','H'],['7','H']],{v:23,tag:'Ahead'})}${miniCv([['10','D'],['8','C']],{v:18,tag:'Behind'})}${miniCv([['7','S'],['8','D'],['10','S']],{v:25,tag:'Ahead'})}</div>
      <p class="mcap">You’re ahead in I and III. If it ends like this, you win 2–1.</p>`},
  {title:'Your hand and your turn',body:`<p>You start with <b>8 cards</b> from your deck. After that, you play <b>one card per turn</b> and draw back up to <b>5</b>.</p>
    <p>On your turn you do exactly one thing:</p>
    <ul><li><b>Play a number card</b> on one of your caravans.</li><li><b>Play a face card</b> on any caravan, yours or the dealer’s.</li><li><b>Discard</b> a card from your hand.</li><li><b>Disband</b> one of your caravans, clearing it to start over.</li></ul>`,
    art:()=>`<div class="mhand">${[['4','S'],['9','H'],['K','C'],['Q','D'],['2','H']].map(c=>mc(c[0],c[1])).join('')}</div>`},
  {title:'The opening',body:`<p>Your first <b>three turns</b> are the opening. Each turn you must start one of your empty caravans with a <b>number card</b>.</p>
    <p>No face cards, discards or disbands until all three caravans have a card.</p>`,
    art:()=>`<div class="mrow">${miniCv([['7','S']],{v:7,label:'Turn 1'})}${miniCv([['3','H']],{v:3,label:'Turn 2'})}${miniCv([['A','D']],{v:1,label:'Turn 3'})}</div>`},
  {title:'Number cards and direction',body:`<p>Aces are 1, numbers are face value. A caravan’s worth is the cards added up.</p>
    <p>The <b>second card sets the direction</b>: higher than the first is <b>▲ up</b>, lower is <b>▼ down</b>. Every card after that has to keep going that way.</p>
    <p>Two exceptions: a card of the caravan’s <b>suit</b> can always go on, either way. And you can never play the <b>same value</b> as the top card.</p>`,
    art:()=>`<div class="mrow">${miniCv([['4','S'],['7','H']],{v:11,dir:'▲ ♥',label:'Going up'})}<div class="mrules"><span class="ok">9♣ ✓ higher</span><span class="no">5♣ ✗ lower</span><span class="ok">2♥ ✓ same suit</span><span class="no">7♦ ✗ same value</span></div></div>`},
  {title:'Face cards',body:`<p>Face cards attach to a card already in a caravan, <b>yours or the dealer’s</b>.</p>
    <ul><li><b>King:</b> adds that card’s value again. Two Kings on a 6 makes 24.</li><li><b>Queen:</b> top card only. Flips the direction and changes the suit.</li><li><b>Jack:</b> removes the card it’s on, and anything attached to it.</li><li><b>Joker:</b> on a 2–10, removes every other card of that value from the table. On an Ace, every other card of that suit.</li></ul>`,
    art:()=>`<div class="mrow">${miniCv([['8','D','K'],['10','D']],{v:26,label:'King on the 8'})}${miniCv([['3','C'],['6','C','Q♥']],{v:9,dir:'▼ ♥',label:'Queen flips it'})}${miniCv([['5','S'],['9','S','J']],{v:'14→5',label:'Jack on the 9'})}</div>`},
  {title:'Busting and messing with the dealer',body:`<p>Over 26 is a <b>bust</b>. A busted caravan can’t sell until you bring it back down, with a Jack or by disbanding.</p>
    <p>You can’t put number cards on the dealer’s caravans, but face cards go anywhere. A <b>King on their big card</b> is the classic way to bust them. They’ll do it to you, too.</p>`,
    art:()=>`<div class="mrow"><div class="mlab">Dealer</div>${miniCv([['10','S'],['8','S','K']],{v:26})}<span class="marrow">→</span>${miniCv([['10','S'],['8','S','K K']],{v:34,tag:'Bust'})}</div><p class="mcap">One more King on their 8 and their 26 becomes 34.</p>`},
  {title:'How the hand ends',body:`<p>The hand ends only when <b>all three matchups are settled at the same time</b>: in each pair, one side is at 21–26 and beats the other.</p>
    <p>An exact tie, both sides under 21, or both busting doesn’t count yet. Then whoever sold <b>two or three</b> caravans wins, and the winners get stamped <b>SOLD</b>.</p>
    <p>During play, tags show <b>AHEAD</b> and <b>BEHIND</b>. Nothing is final until the end.</p>`,
    art:()=>`<div class="mrow">${miniCv([['10','H'],['9','C']],{v:19,tag:'Behind',label:'Not settled'})}${miniCv([['9','S'],['8','H'],['7','S']],{v:24,tag:'Ahead',label:'Settled'})}${miniCv([['10','D'],['3','D']],{v:13,label:'Not settled'})}</div><p class="mcap">Only one matchup is settled here, so play goes on.</p>`},
  {title:'Ready to play',body:`<p>That’s the whole game. Now Old Ezra will deal you a real hand and walk you through it <b>one move at a time</b>, explaining why each play makes sense.</p>
    <p>You can reopen this rundown any time from the help screen, and every game has a <b>Rules</b> button at the top.</p>`,
    art:()=>`<div class="mhand">${[['10','H'],['K','S'],['Q','D'],['J','C']].map(c=>mc(c[0],c[1])).join('')}${cardHTML({rank:'JK'})}</div>`},
];
function openRundown(then){rundownThen=then||null;rundownStep=0;screen='rundown';render();window.scrollTo(0,0);}
function renderRundown(){
  const n=RUNDOWN.length,i=Math.max(0,Math.min(rundownStep,n-1)),R=RUNDOWN[i],last=i===n-1;
  app.innerHTML=`
  <div class="mbar">${backBtn(rundownThen==='road'?'road':rundownThen==='classic'?'classic':'help','Back')}<span class="pill num">${i+1} / ${n}</span></div>
  <section class="panel rundown">
    <div class="rd-dots">${RUNDOWN.map((_,k)=>`<i class="${k===i?'on':k<i?'past':''}"></i>`).join('')}</div>
    <h2>${esc(R.title)}</h2>
    <div class="rd-art">${R.art()}</div>
    <div class="rd-body">${R.body}</div>
    <div class="rd-nav">
      <button class="btn" data-rd="prev" ${i?'':'disabled'}>← Back</button>
      ${last?(rundownThen?`<button class="btn hot" data-rd="start">Start guided play</button>`:`<button class="btn hot" data-go="help">Done</button>`):`<button class="btn hot" data-rd="next">Next →</button>`}
    </div>
    ${rundownThen&&!last?`<button class="btn ghost rd-skip" data-rd="start">Skip to guided play</button>`:''}
  </section>`;
}
function handleRundownClick(d){
  if('rundown' in d){openRundown(null);return true;}
  if(!('rd' in d))return false;
  if(d.rd==='next')rundownStep++;
  else if(d.rd==='prev')rundownStep=Math.max(0,rundownStep-1);
  else if(d.rd==='start'){const t=rundownThen;rundownThen=null;if(t==='classic')startClassic(-1,true);else startMatch(-1,true);return true;}
  render();window.scrollTo(0,0);return true;
}


// =====================================================================
// TABLE PROPS: real images you drop in props/<id>.png, unlocked by beating bosses.
// Pick up to 3 to sit on the table in every mode.
// =====================================================================
const PROP_SLOTS=3;
// Table props are switched off for now. Unlocks are still tracked quietly, so flipping this to true brings them back with everything already earned.
const PROPS_ON=false;
const TABLE_PROPS=[
  {id:'badge',name:'Tin star',size:'s',from:'Sheriff Amos Dunn',how:'Beat Sheriff Dunn in the campaign (Goodsprings).',camp:'goodsprings'},
  {id:'pearls',name:'Pearl necklace',size:'s',from:'Lady Marigold',how:'Beat Lady Marigold in the campaign (Primm).',camp:'primm'},
  {id:'dino',name:'Tin dinosaur',size:'m',from:'Dino Dale',how:'Beat Dino Dale in the campaign (Novac).',camp:'novac'},
  {id:'clipboard',name:'NCR requisition clipboard',size:'m',from:'Major Ada Strand',how:'Beat Major Strand in the campaign (Boulder City).',camp:'boulder'},
  {id:'switchblade',name:'Switchblade',size:'m',from:'Lena Vasquez',how:'Beat Lena Vasquez in the campaign (Freeside).',camp:'freeside'},
  {id:'watch',name:'Old pocket watch',size:'s',from:'The Old Man',how:'Beat the Old Man in the campaign (the Strip).',camp:'strip'},
  {id:'caps',name:'Pile of bottle caps',size:'s',from:'the Goodsprings boss',how:'Beat the Goodsprings boss on the Road.',road:0},
  {id:'iguana',name:'Iguana-on-a-stick plate',size:'m',from:'the Primm boss',how:'Beat the Primm boss on the Road.',road:1},
  {id:'lantern',name:'Miner’s lantern',size:'s',from:'the Nelson boss',how:'Beat the Nelson boss on the Road.',road:2},
  {id:'ammo',name:'Ammo box',size:'m',from:'the Boulder City boss',how:'Beat the Boulder City boss on the Road.',road:3},
  {id:'cocktail',name:'Lounge cocktail',size:'s',from:'the Fremont Street boss',how:'Beat the Fremont Street boss on the Road.',road:4},
  {id:'dice',name:'Gold dice and chips',size:'s',from:'the Strip boss',how:'Beat the Strip boss on the Road.',road:5},
];
const PROP_FILE={};
function loadPropFiles(){
  if(!PROPS_ON)return;
  const exts=['png','webp','PNG','WEBP'];
  for(const p of TABLE_PROPS){const tryExt=n=>{if(n>=exts.length)return;const im=new Image();
    im.onload=()=>{PROP_FILE[p.id]=im.src;if(meta&&(screen==='match'||screen==='look'))render();};im.onerror=()=>tryExt(n+1);im.src=`props/${p.id}.${exts[n]}`;};tryExt(0);}
}
const propUnlocked=id=>(meta.propsUnlocked||[]).includes(id);
function unlockProp(id){
  meta.propsUnlocked=meta.propsUnlocked||[];if(meta.propsUnlocked.includes(id))return;
  meta.propsUnlocked.push(id);const p=TABLE_PROPS.find(x=>x.id===id);
  meta.look.props=meta.look.props||[];if(meta.look.props.length<PROP_SLOTS)meta.look.props.push(id);
  if(PROPS_ON)setTimeout(()=>toast({label:'Table prop unlocked',name:p.name,desc:`From ${p.from}. ${meta.look.props.includes(id)?'It’s on your table now.':'Put it on your table from the pencil menu.'}`}),900);
}
function propsRetro(){ // credit bosses beaten before props existed
  const cp=meta.classic&&meta.classic.camp;
  for(const p of TABLE_PROPS){
    if(p.camp&&cp&&(cp.trophies||[]).some(t=>t.town===p.camp))unlockProp(p.id);
    if(p.road!=null&&((meta.bestStop||0)>p.road||(meta.runsWon||0)>0))unlockProp(p.id);
  }
}
// how each prop sits: flat things can lie at any angle, standing things stay near upright
const PROP_POSE={badge:[-30,30],pearls:[-35,35],clipboard:[-18,18],switchblade:[-25,25],caps:[-20,20],iguana:[-14,14],
  dino:[-8,8],watch:[-10,10],lantern:[-3,3],ammo:[-5,5],cocktail:[-2,2],dice:[-6,6]};
function tablePropsHTML(){
  if(!PROPS_ON)return '';
  const ids=((meta.look&&meta.look.props)||[]).filter(id=>propUnlocked(id)&&PROP_FILE[id]).slice(0,PROP_SLOTS);
  if(!ids.length)return '';
  return ids.map((id,i)=>{const p=TABLE_PROPS.find(x=>x.id===id);const [lo,hi]=PROP_POSE[id]||[-10,10];
    const h=hashStr(id+':'+i);const tilt=lo+(h%1000)/1000*(hi-lo);const sc=0.94+((h>>10)%100)/100*0.12;
    const src=PROP_FILE[id];
    return `<div class="tprop slot${i} sz-${p.size} p-${id}" aria-hidden="true" style="--pt:${tilt.toFixed(1)}deg;--ps:${sc.toFixed(2)}"><img src="${src}" alt=""></div>`;}).join('')+'<div class="tvig" aria-hidden="true"></div>';
}
function propsPickerHTML(){
  if(!PROPS_ON)return '';
  const eq=(meta.look.props||[]);
  return `<h3 class="sub">Table props <span class="pill num" style="font-size:12px;vertical-align:middle">${TABLE_PROPS.filter(p=>propUnlocked(p.id)).length}/${TABLE_PROPS.length}</span></h3>
    <p class="note">Beat bosses to unlock props: each campaign champion and each Road boss gives one. Pick up to ${PROP_SLOTS} to sit on your table in every mode. Tap to add or remove.</p>
    <div class="propgrid">${TABLE_PROPS.map(p=>{const ok=propUnlocked(p.id),on=eq.includes(p.id),img=PROP_FILE[p.id];
      return `<button class="propopt${on?' on':''}${ok?'':' locked'}" data-propsel="${p.id}" ${ok?'':'disabled'} aria-pressed="${on}">
        <span class="pimgbox">${img?`<img src="${img}" alt="">`:`<span class="pph">${ok?'Art coming':'🔒︎'}</span>`}</span>
        <b>${esc(p.name)}</b><small>${ok?(on?'On your table':'Unlocked'):esc(p.how)}</small></button>`;}).join('')}</div>
    <p class="note">${eq.length}/${PROP_SLOTS} on the table.</p>`;
}

