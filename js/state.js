// ---------- state ----------
let rulesOpen=false;
let meta=null, G=null, screen='home', sel=null, disbandMode=false, busy=false, armedFold=false, armedCut=null;

function freshMeta(){
  meta={v:2,caps:0,deck:[],beaten:[],wins:0,losses:0,tutorialDone:false,match:null,
    perks:[],equipped:[],chems:{spy:1,coffee:0,fresh:0,shoe:0},draft:null,roadTutDone:false,starter:null,
    look:{font:'deco',face:'bone',back:'sunburst',mat:'leather',four:false,unlocked:[]},
    classic:{deck:null,wins:0,losses:0,rec:{},camp:null}};
  return meta;
}
function save(){meta.match=G&&!G.over?G:null;meta.updatedAt=Date.now();try{codexSync();}catch(e){}try{localStorage.setItem(SAVE_KEY,JSON.stringify(meta));}catch(e){}if(typeof schedulePush==='function')schedulePush();}
function load(){try{const s=localStorage.getItem(SAVE_KEY);if(s)return JSON.parse(s);}catch(e){}return null;}
function migrate(m){
  // special finishes are for number cards only
  if(m&&Array.isArray(m.deck))m.deck.forEach(c=>{if(c&&c.ed&&(c.rank==='JK'||['J','Q','K'].includes(c.rank)))delete c.ed;});
  if(!m.v){ // first version had 5 tables
    const map={0:0,1:2,2:3,3:5,4:9};
    m.beaten=(m.beaten||[]).map(i=>map[i]).filter(i=>i!=null);
    if(m.match){m.match.opp=m.match.opp<0?-1:map[m.match.opp]??0;}
    m.v=2;
  }
  m.perks=m.perks||[];m.equipped=m.equipped||[];m.chems=Object.assign({spy:0,coffee:0,fresh:0,shoe:0},m.chems||{});
  if(m.tutorialDone==null)m.tutorialDone=false;
  if(m.roadTutDone==null)m.roadTutDone=false;
  m.ach=m.ach||{}; if(m.char===undefined)m.char=null; m.stripBy=m.stripBy||[]; m.path=m.path||{}; m.opt=Object.assign({speed:'normal',dust:true,confirm:true,sound:true,haptics:true},m.opt||{}); m.st=Object.assign({hands:0,wins:0,kings:0,jacks:0,bounties:0,chems:0},m.st||{});
  m.look=Object.assign({font:'deco',face:'bone',back:'sunburst',mat:'leather',four:false,unlocked:[]},m.look||{});
  if(m.starter===undefined)m.starter=(m.wins||m.losses||(m.beaten&&m.beaten.length))?'legacy':null;
  m.classic=Object.assign({deck:null,wins:0,losses:0,rec:{},camp:null},m.classic||{});
  if(typeof m.caps!=='number'||m.caps<0)m.caps=0;
  if(m.match&&!m.match.rules)m.match.rules=baseRules();
  if(!m.runV){ // the Road became run-based: convert old progress into starting tokens
    m.runV=1;m.tokens=[];const b=(m.beaten||[]).length;
    if(b>=3)m.tokens.push('stash');if(b>=6)m.tokens.push('kit');if((m.stripBy||[]).length)m.tokens.push('charm');
    m.decksUnlocked=1;m.tiersUnlocked=1;m.run=null;
    if(m.match&&m.match.mode==='road'&&!m.match.run&&m.match.opp>=0)m.match=null;
    if(b||m.wins)m.convertNote=m.tokens.length;
  }
  if(m.run&&m.run.grit===undefined){ // runs started before Grit and the 6-stop road
    m.run.grit=1+(m.run.secondWind||0);
    if(!m.run.endless&&m.run.stop>5){m.run.stop=5;m.run.table=Math.min(m.run.table,2);}
  }
  m.tokens=m.tokens||[];m.decksUnlocked=m.decksUnlocked||1;m.tiersUnlocked=m.tiersUnlocked||1;
  if(!m.deckTiers){ // difficulty became per-deck: every deck you already had keeps the difficulties you'd unlocked
    m.deckTiers={};m.deckWon={};
    const ids=['plain','sarsaparilla','blood','scorched','irradiated','rust','bullet','gold'],tids=['copper','silver','gold'];
    ids.slice(0,m.decksUnlocked).forEach(id=>{m.deckTiers[id]=m.tiersUnlocked;});
    (m.runHist||[]).forEach(h=>{if(h.result==='won'&&!h.beyond){const ti=tids.indexOf(h.tier);if(ti>(m.deckWon[h.deck]??-1))m.deckWon[h.deck]=ti;}});
  }
  m.deckWon=m.deckWon||{};
  if(typeof m.scrip!=='number'||m.scrip<0)m.scrip=0;
  m.gear=Object.assign({owned:[],on:{}},m.gear||{});
  // Star Bottle Cap and Strength Bobblehead are back: undo the short-lived rename to Gold Bar / Mesmetron.
  {const L=(m.legends||[]).map(id=>id==='goldbar'?'starcap':id);if(L.includes('mesmetron')&&!m.legendsFixed)L.push('bobble');m.legends=[...new Set(L)];m.legendsFixed=1;}
  if(m.run&&Array.isArray(m.deck))m.deck.forEach(c=>{if(c&&c.legend==='goldbar')c.legend='starcap';});
  // Cosmetics and the GNR pack became achievement rewards: anything you were already using stays yours.
  if(!m.lookGrand){m.lookGrand=1;const u=m.look.unlocked=m.look.unlocked||[];for(const k of ['font','face','mat'])if(m.look[k]&&!u.includes(m.look[k]))u.push(m.look[k]);if(m.ach&&m.ach.jeanita&&!u.includes('gnr'))u.push('gnr');}
  m.charFlags=m.charFlags||{};
  m.codex=m.codex||{};m.codex.perk=m.codex.perk||{};m.codex.boss=m.codex.boss||{};m.codex.event=m.codex.event||{};
  return m;
}

const $=s=>document.querySelector(s);
const app=$('#app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const edCls=c=>c&&c.ed&&typeof EDITIONS!=='undefined'&&EDITIONS[c.ed]?' ed-'+c.ed:'';
const edFx=c=>edCls(c)?`<span class="edfx" aria-hidden="true"></span><span class="edtag">${EDITIONS[c.ed].tag}</span>`:'';
function cardHTML(c){
  if(c.legend){const L=(typeof LEGENDS!=='undefined'&&LEGENDS[c.legend])||{name:'Legend',rar:'common'};
    const art=typeof ART!=='undefined'&&ART.legend[c.legend];
    if(art)return `<div class="card legend has-art lg-${L.rar}"><img class="lgart" src="${art}" alt=""><span class="lgn">${esc(L.name)}</span></div>`;
    return `<div class="card legend lg-${L.rar}"><span class="lgk">Legend</span><span class="lgn">${esc(L.name)}</span><span class="lgr">${L.rar}</span></div>`;}
  if(c.rank==='JK')return `<div class="card joker${edCls(c)}"><span class="court jk"${FACE_FILE.JK?` style="background-image:url(${FACE_FILE.JK})"`:''}></span><span class="jkc t">JOKER</span><span class="jkc b">JOKER</span>${edFx(c)}</div>`;
  const red=isRed(c.suit), s=SUIT_CH[c.suit], num=isNum(c);
  const md=c.mod&&typeof MODS!=='undefined'&&MODS[c.mod]?c.mod:null;
  return `<div class="card s-${c.suit}${red?' red':''}${num?'':' face'}${md?' m-'+md:''}${edCls(c)}"><span class="r">${c.rank}<i>${suitIcon(c.suit)}</i></span>${num?`<span class="pip">${suitPip(c.suit)}</span>`:FACE_FILE[c.rank+c.suit]?`<span class="court img" style="--cf:url(${FACE_FILE[c.rank+c.suit]})"></span>`:`<span class="court" style="background-image:var(--court-${c.rank}-${red?'r':'b'})"></span>`}<span class="r2">${c.rank}<i>${suitIcon(c.suit)}</i></span>${md?`<span class="mod ${md}">${MODS[md].tag}</span>`:''}${edFx(c)}</div>`;
}
// Suit symbols are drawn as worn, hand-inked shapes (see the sprite at the top of index.html), not text glyphs, so they look the same on every phone.
// Your own symbols: drop spade, heart, diamond and club (.svg, .png or .webp, any shape on a transparent background) into suits/.
// They are used as a stencil, so they take the card's ink colour (red, black, four-color, Currency green...).
const SUIT_FILE={},SUIT_ART={},SUIT_NAME={S:'spade',H:'heart',D:'diamond',C:'club'};
function loadSuitFiles(){
  for(const s of SUITS){const exts=['svg','png','webp'],name=SUIT_NAME[s];const tryExt=n=>{if(n>=exts.length)return;const im=new Image();
    im.onload=()=>{SUIT_FILE[s]=im.src;if(typeof meta!=='undefined'&&meta&&typeof render==='function')render();};im.onerror=()=>tryExt(n+1);im.src=`suits/${name}.${exts[n]}`;};tryExt(0);
    const ar=new Image();ar.onload=()=>{SUIT_ART[s]=ar.src;if(typeof meta!=='undefined'&&meta&&typeof render==='function')render();};ar.src=`suits/${name}-art.png`;}  // full-colour art: used only for the big centre symbol
}
const suitPip=s=>SUIT_ART[s]?`<img class="pipart" src="${SUIT_ART[s]}" alt="">`:suitIcon(s);
// Your own face-card art: faces/KS.png, QH.png, JD.png ... (rank + suit letter) and faces/JK.png for the Joker. .webp works too.
// Court art is one half-length figure cut off at the waist; the game draws it twice, the second turned upside down.
const FACE_FILE={};
function loadFaceFiles(){
  const ids=['JK'];for(const r of ['J','Q','K'])for(const s of SUITS)ids.push(r+s);
  for(const id of ids){const exts=['webp','png'];const tryExt=n=>{if(n>=exts.length)return;const im=new Image();
    im.onload=()=>{FACE_FILE[id]=im.src;if(typeof meta!=='undefined'&&meta&&typeof render==='function')render();};im.onerror=()=>tryExt(n+1);im.src=`faces/${id}.${exts[n]}`;};tryExt(0);}
}
const suitIcon=s=>SUIT_FILE[s]?`<span class="sx img" aria-hidden="true" style="--m:url(${SUIT_FILE[s]})"></span>`:`<svg class="sx" viewBox="0 0 24 24" aria-hidden="true"><use href="#sx-${s}"/></svg>`;
const capsHTML=n=>`<span class="pill num" data-capsval="${n}"><span class="cap"></span> <span class="cn">${n}</span> caps</span>`;
const capN=n=>`<span class="cap"></span> ${n}`;

