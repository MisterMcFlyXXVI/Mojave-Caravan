// =====================================================================
// MOTION + EFFECTS
// =====================================================================
const motionOn=()=>!!(meta&&meta.opt&&meta.opt.motion!==false)&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const mDur=()=>({slow:520,normal:360,fast:210})[meta&&meta.opt.speed]||360;
const hashStr=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const tiltOf=id=>{const h=hashStr(id);return `${((h%100)/100*4.4-2.2).toFixed(2)}deg`;};
const nudgeOf=id=>{const h=hashStr(id+'x');return `${((h%100)/100*6-3).toFixed(1)}px`;};

function fxLayer(){let l=document.getElementById('fxlayer');if(!l){l=document.createElement('div');l.id='fxlayer';document.body.appendChild(l);}return l;}
function ghost(html,r,cls){
  const g=document.createElement('div');g.className='fxghost '+(cls||'');g.innerHTML=html;
  Object.assign(g.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px','--cw':r.width+'px'});
  fxLayer().appendChild(g);return g;
}
const done=(a,el)=>{a.onfinish=()=>el.remove();a.oncancel=()=>el.remove();};
const ctr=r=>({x:r.left+r.width/2,y:r.top+r.height/2});

function snapMatch(){
  const s={cards:{},piles:{},vals:{},sold:new Set(),bust:new Set()};
  document.querySelectorAll('#app [data-cid]').forEach(el=>{const c=el.querySelector('.card')||el;s.cards[el.dataset.cid]={r:el.getBoundingClientRect(),zone:el.dataset.zone,html:c.outerHTML,side:el.dataset.side,lane:el.dataset.lane};});
  document.querySelectorAll('#app .deckpile').forEach(el=>{s.piles[el.classList.contains('mine')?'p':'a']=el.getBoundingClientRect();});
  document.querySelectorAll('#app [data-lv]').forEach(el=>{s.vals[el.dataset.lv]=+el.dataset.val;});
  document.querySelectorAll('#app .stampmark').forEach(el=>s.sold.add(el.dataset.k));
  document.querySelectorAll('#app .lane.isbust').forEach(el=>s.bust.add(el.dataset.side+el.dataset.lane));
  return s;
}
function countUp(el,from,to,dur){
  if(from===to||from<0||to<0)return;const t0=performance.now();
  const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=Math.round(from+(to-from)*e);if(k<1)requestAnimationFrame(step);};
  requestAnimationFrame(step);
}
function flipCover(el,pack,d,delay){
  const card=el.classList.contains('card')?el:el.querySelector('.card');if(!card)return;
  const cov=document.createElement('div');cov.className='flipcover';if(pack)cov.dataset.back=pack;card.appendChild(cov);
  card.animate([{transform:'scaleX(1)'},{transform:'scaleX(.04)',offset:.5},{transform:'scaleX(1)'}],{duration:d,delay,easing:'ease-in-out'});
  const a=cov.animate([{opacity:1},{opacity:1,offset:.5},{opacity:0,offset:.501},{opacity:0}],{duration:d,delay,fill:'both'});done(a,cov);
}
function animateMatch(prev,fx){
  if(!motionOn()||!G)return;
  const d=mDur(),intro=G.intro;G.intro=false;
  const now={};document.querySelectorAll('#app [data-cid]').forEach(el=>now[el.dataset.cid]=el);
  const pileP=document.querySelector('#app .deckpile.mine'),pileA=document.querySelector('#app .deckpile.small');
  // riffle the decks at the start of a hand
  if(intro){[pileP,pileA].forEach(p=>p&&p.classList.add('riffle'));sfx('shuffle');setTimeout(()=>[pileP,pileA].forEach(p=>p&&p.classList.remove('riffle')),700);}
  let k=0;
  for(const [cid,el] of Object.entries(now)){
    const zone=el.dataset.zone,r=el.getBoundingClientRect(),p=prev&&prev.cards[cid];
    let from=null,flip=false,pack=null;
    if(p){
      const dx0=p.r.left-r.left,dy0=p.r.top-r.top;
      if(Math.abs(dx0)<3&&Math.abs(dy0)<3)continue;
      if(zone==='hand'&&p.zone==='hand'&&Math.abs(dx0)<4&&Math.abs(dy0)<16)continue;
      from=p.r;flip=p.zone==='fan'&&zone==='cv';
      if(flip){const m=/data-back="([^"]+)"/.exec(p.html);pack=m?m[1]:null;}
    }else{
      if(!prev&&!intro)continue;
      const src=zone==='fan'?pileA:zone==='hand'?pileP:null;if(!src)continue;
      from=src.getBoundingClientRect();flip=zone==='hand';
    }
    const dx=ctr(from).x-ctr(r).x,dy=ctr(from).y-ctr(r).y,sc=Math.max(.5,Math.min(1.6,(from.width||r.width)/r.width));
    const delay=p?0:(intro?520:120)+(k++)*(intro?75:90);
    const rot=(hashStr(cid)%2?1:-1)*(6+hashStr(cid)%8);
    const base=getComputedStyle(el).transform,bt=base&&base!=='none'?base:'';
    el.animate([{transform:`translate(${dx}px,${dy}px) scale(${sc}) rotate(${rot}deg) ${bt}`},{transform:bt||'none'}],{duration:d*1.15,delay,easing:'cubic-bezier(.2,.8,.25,1)',fill:'backwards'});
    if(flip)flipCover(el,pack||(zone==='hand'?(G.p.hand.find(c=>c.id===cid)||{}).pack:null),d*1.15,delay);
    if(!p&&zone==='hand'&&!intro)setTimeout(()=>sfx('swish'),delay);
  }
  if(!prev)return;
  // cards that left the table
  const gone=Object.entries(prev.cards).filter(([cid])=>!now[cid]);
  const kind=fx&&fx.kind, rank=fx&&fx.rank;
  // a face card played: fly the card from hand/fan to its target, then dissolve into the chip
  const faceSrc=gone.find(([,p])=>(p.zone==='hand'||p.zone==='fan')&&fx&&kind==='face');
  let hitAt=null;
  if(fx&&kind==='face'){
    const tgt=document.querySelector(`#app .entry[data-side="${fx.side}"][data-lane="${fx.lane}"][data-idx="${fx.idx}"]`);
    const victim=gone.find(([,p])=>p.zone==='cv'&&p.side===fx.side&&+p.lane===fx.lane);
    hitAt=tgt?tgt.getBoundingClientRect():victim?victim[1].r:null;
  }
  if(faceSrc&&hitAt){
    const [,p]=faceSrc;let html=p.html;
    if(p.zone==='fan'&&fx.card)html=cardHTML(fx.card);
    const g=ghost(html,p.r,'travel');
    const dx=ctr(hitAt).x-ctr(p.r).x,dy=ctr(hitAt).y-ctr(p.r).y;
    const a=g.animate([{transform:'none',opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${rank==='JK'?-20:12}deg) scale(1.08)`,opacity:1,offset:.75},{transform:`translate(${dx}px,${dy}px) scale(.5)`,opacity:0}],{duration:d*1.3,easing:'cubic-bezier(.3,.7,.3,1)'});done(a,g);
  }
  const hitDelay=faceSrc?d*.95:0;
  const victims=gone.filter(([,p])=>p.zone==='cv');
  if(kind==='face'&&rank==='JK'&&hitAt){
    setTimeout(()=>{const c=ctr(hitAt),w=document.createElement('div');w.className='shock';Object.assign(w.style,{left:c.x+'px',top:c.y+'px'});fxLayer().appendChild(w);
      const a=w.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:.95},{transform:'translate(-50%,-50%) scale(9)',opacity:0}],{duration:d*2,easing:'cubic-bezier(.1,.7,.3,1)'});done(a,w);sfx('blast');buzz([30,40,30]);
      document.querySelector('#app .table')&&document.querySelector('#app .table').animate([{transform:'none'},{transform:'translate(3px,-2px)'},{transform:'translate(-3px,2px)'},{transform:'none'}],{duration:260});},hitDelay);
  }
  victims.forEach(([cid,p],i)=>{
    const delay=hitDelay+(kind==='disband'?i*60:0);
    if(kind==='face'&&rank==='J'){
      setTimeout(()=>sfx('tear'),delay);
      for(const half of [-1,1]){
        const g=ghost(p.html,p.r,'torn '+(half<0?'tl':'tr'));
        const a=g.animate([{transform:'none',opacity:1},{transform:`translate(${half*34}px,${40+Math.random()*30}px) rotate(${half*(18+Math.random()*16)}deg)`,opacity:0}],{duration:d*2,delay,easing:'cubic-bezier(.3,.1,.6,1)',fill:'backwards'});done(a,g);
      }
    }else if(kind==='face'&&rank==='JK'&&hitAt){
      const c=ctr(hitAt),pc=ctr(p.r),ang=Math.atan2(pc.y-c.y,pc.x-c.x)||Math.random()*6,dist=160+Math.random()*80;
      const g=ghost(p.html,p.r,'blasted');
      const a=g.animate([{transform:'none',opacity:1},{transform:`translate(${Math.cos(ang)*dist}px,${Math.sin(ang)*dist}px) rotate(${(Math.random()-.5)*720}deg) scale(.7)`,opacity:0}],{duration:d*2.2,delay,easing:'cubic-bezier(.15,.7,.4,1)',fill:'backwards'});done(a,g);
    }else if(kind==='turret'){
      const g=ghost(p.html,p.r,'shot');sfx('shot');
      const a=g.animate([{transform:'none',opacity:1,filter:'brightness(1)'},{transform:'translate(0,-10px) rotate(-8deg)',filter:'brightness(2.5)',offset:.12},{transform:`translate(${60+Math.random()*40}px,-140px) rotate(${200+Math.random()*200}deg) scale(.6)`,opacity:0,filter:'brightness(1)'}],{duration:d*2.1,easing:'cubic-bezier(.2,.6,.4,1)'});done(a,g);
      const f=document.createElement('div');f.className='muzzle';const c=ctr(p.r);Object.assign(f.style,{left:c.x+'px',top:c.y+'px'});fxLayer().appendChild(f);
      const b=f.animate([{opacity:1,transform:'translate(-50%,-50%) scale(.3)'},{opacity:0,transform:'translate(-50%,-50%) scale(2)'}],{duration:260});done(b,f);
    }else{
      const g=ghost(p.html,p.r,'dropped');
      const a=g.animate([{transform:'none',opacity:1},{transform:`translate(${(Math.random()-.5)*30}px,70px) rotate(${(Math.random()-.5)*40}deg) scale(.85)`,opacity:0}],{duration:d*1.6,delay,easing:'cubic-bezier(.4,0,.8,.6)',fill:'backwards'});done(a,g);
    }
  });
  // discards: the card skims off to the side
  if(kind==='discard'){
    const p=gone.find(([,p])=>p.zone==='hand'||p.zone==='fan');
    if(p){const g=ghost(p[1].html,p[1].r,'discarded');const a=g.animate([{transform:'none',opacity:1},{transform:`translate(${p[1].zone==='hand'?160:-160}px,${p[1].zone==='hand'?-30:30}px) rotate(${p[1].zone==='hand'?40:-40}deg)`,opacity:0}],{duration:d*1.4,easing:'cubic-bezier(.4,0,.6,1)'});done(a,g);}
  }
  // totals count up, sold stamps slam, busts shake
  setTimeout(()=>{
    document.querySelectorAll('#app [data-lv]').forEach(el=>{const was=prev.vals[el.dataset.lv],v=+el.dataset.val;if(was!=null&&was!==v&&was>=0&&v>=0)countUp(el,was,v,d*1.4);});
    document.querySelectorAll('#app .stampmark').forEach(el=>{if(!prev.sold.has(el.dataset.k)){el.classList.add('fresh');setTimeout(()=>{sfx('stamp');buzz(25);},120);}});
    document.querySelectorAll('#app .lane.isbust').forEach(el=>{if(!prev.bust.has(el.dataset.side+el.dataset.lane)){el.classList.add('bustshake');sfx('bust');}});
  },hitDelay+d*.5);
}

// ---------- caps: fly into the wallet and tick up ----------
let lastCapsShown=null;
function capsBurst(to,n,fromR){
  if(!motionOn()||!to)return;const tr=to.getBoundingClientRect(),tc=ctr(tr);
  const src=fromR?ctr(fromR):{x:innerWidth/2,y:innerHeight*.45};
  for(let i=0;i<Math.min(12,n);i++){
    const c=document.createElement('span');c.className='flycap';fxLayer().appendChild(c);
    const sx=src.x+(Math.random()-.5)*80,sy=src.y+(Math.random()-.5)*40;
    Object.assign(c.style,{left:sx+'px',top:sy+'px'});
    const mx=(sx+tc.x)/2+(Math.random()-.5)*120,my=Math.min(sy,tc.y)-60-Math.random()*60;
    const a=c.animate([{transform:'translate(-50%,-50%) scale(.6)',opacity:0},{transform:`translate(calc(${mx-sx}px - 50%),calc(${my-sy}px - 50%)) scale(1.1) rotate(180deg)`,opacity:1,offset:.45},{transform:`translate(calc(${tc.x-sx}px - 50%),calc(${tc.y-sy}px - 50%)) scale(.7) rotate(360deg)`,opacity:.9}],{duration:620+i*45,delay:i*55,easing:'cubic-bezier(.3,.6,.4,1)',fill:'backwards'});
    a.onfinish=()=>{c.remove();if(i%2===0)sfx('clink');};
  }
  setTimeout(()=>to.animate([{transform:'scale(1)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],{duration:260}),620);
}
function capsTick(){
  const pills=[...document.querySelectorAll('#app [data-capsval]')];
  const key=['road','shop'].includes(screen)?'run':['campaign','vendor'].includes(screen)?'camp':screen;
  if(!pills.length||key==='match'){lastCapsShown=null;return;}
  const v=+pills[0].dataset.capsval;
  if(lastCapsShown&&lastCapsShown.key===key&&lastCapsShown.v!==v&&motionOn()){
    const from=lastCapsShown.v;
    pills.forEach((pill,i)=>{const num=pill.querySelector('.cn');if(num)countUp(num,from,v,700);if(i===0){if(v>from)capsBurst(pill,Math.ceil((v-from)/2));else pill.animate([{color:'#ff7a50'},{color:''}],{duration:700});}});
  }
  lastCapsShown={v,key};
}
function resultCaps(){
  const g=document.querySelector('#app .result .gain[data-delta]');if(!g||g.dataset.played)return;
  if(G&&G.over&&G.over.capsShown){g.dataset.played=1;return;}
  const n=+g.dataset.delta;if(!(n>0)||!motionOn())return;
  if(G&&G.over)G.over.capsShown=true;
  const num=g.querySelector('.cn');if(num)countUp(num,0,n,900);
  capsBurst(g,Math.min(12,Math.ceil(n/2)),{left:innerWidth/2-40,top:-40,width:80,height:40});
}

// ---------- screen transitions ----------
function screenIn(prevScreen){
  if(!motionOn()||prevScreen===screen)return;
  const app=document.getElementById('app');
  if(screen==='match')app.animate([{opacity:0,transform:'scale(.97)'},{opacity:1,transform:'none'}],{duration:280,easing:'ease-out'});
  else app.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:240,easing:'ease-out'});
}

// ---------- saloon lighting ----------
function ambience(){
  let a=document.getElementById('ambience');
  const on=screen==='match'&&meta&&meta.opt.ambience!==false;
  if(!on){if(a)a.remove();return;}
  if(a)return;
  a=document.createElement('div');a.id='ambience';a.setAttribute('aria-hidden','true');
  a.innerHTML='<div class="lamp"></div><div class="lampglow"></div>'+Array.from({length:5},(_,i)=>`<div class="smoke" style="--i:${i}"></div>`).join('');
  document.body.appendChild(a);
}

// ---------- bundles flip open, burned cards curl into embers ----------
function revealPicker(){
  const r=run&&run(),pk=r&&r.picker;if(!pk||pk.kind!=='bundle'||pk.revealed)return;
  pk.revealed=true;if(!motionOn())return;
  document.querySelectorAll('#app .pickcard').forEach((el,i)=>{el.style.pointerEvents='none';
    flipCover(el,starterBack(),420,180+i*150);
    el.animate([{transform:'translateY(-18px)',opacity:0},{transform:'none',opacity:1}],{duration:300,delay:i*150,fill:'backwards',easing:'ease-out'});
    setTimeout(()=>{el.style.pointerEvents='';sfx('snap');},400+i*150);});
}
function burnCards(els,cb){
  if(!motionOn()||!els.length){cb();return;}
  sfx('burn');
  els.forEach((el,i)=>{
    const card=el.querySelector('.card')||el,r=card.getBoundingClientRect(),g=ghost(card.outerHTML,r,'burning');el.style.visibility='hidden';
    const a=g.animate([{filter:'none',transform:'none',opacity:1},{filter:'sepia(1) brightness(.75) contrast(1.4)',transform:'rotate(-3deg)',offset:.35},{filter:'sepia(1) brightness(.25)',transform:'translateY(-14px) scale(.85,.6) rotate(6deg) skewX(8deg)',opacity:.85,offset:.75},{filter:'brightness(0)',transform:'translateY(-40px) scale(.4,.15)',opacity:0}],{duration:1100,delay:i*120,fill:'backwards',easing:'ease-in'});done(a,g);
    for(let k=0;k<14;k++){const e=document.createElement('span');e.className='ember';fxLayer().appendChild(e);
      const x=r.left+Math.random()*r.width,y=r.top+r.height*(.3+Math.random()*.7);Object.assign(e.style,{left:x+'px',top:y+'px'});
      const b=e.animate([{transform:'translate(0,0) scale(1)',opacity:0},{opacity:1,offset:.2},{transform:`translate(${(Math.random()-.5)*60}px,${-80-Math.random()*90}px) scale(.3)`,opacity:0}],{duration:900+Math.random()*700,delay:i*120+200+Math.random()*500,fill:'backwards',easing:'ease-out'});done(b,e);}
  });
  setTimeout(cb,1100+els.length*120);
}

// ---------- boss intro: a wanted poster ----------
function wantedPoster(cb){
  const r=run(),s=r.stop,d=bossDealer(s),ids=tableRuleIds(s,2).filter((x,i,a)=>a.indexOf(x)===i);
  const el=document.createElement('div');el.className='overlay poster-wrap';
  el.innerHTML=`<div class="poster" role="dialog" aria-label="Boss: ${esc(d.name)}">
    <div class="ph">WANTED</div><div class="psub">at the card table</div>
    <div class="pimg">${d.rival||(d.art&&PORTRAIT_FILE[d.art])?`<img src="${d.rival?portrait(d.rival):PORTRAIT_FILE[d.art]}" alt="">`:`<span class="psil">${OUTLAW_SVG}</span>`}</div>
    <div class="pname">${esc(d.name)}</div>
    ${d.rival&&RIVAL_TAUNT[d.rival]?`<div class="ptaunt">${esc(RIVAL_TAUNT[d.rival])}</div>`:''}
    ${AI_STYLES[d.name]&&AI_STYLES[d.name].tell?`<div class="ptaunt">Style: ${esc(AI_STYLES[d.name].tell)}</div>`:''}
    ${BOSS_SIGS[d.name]?`<div class="ptaunt">Signature: ${esc(BOSS_SIGS[d.name].name)}</div>`:''}
    <div class="prules">${ids.length?ids.map(id=>`<span><b>${BOSS_RULES[id].name}</b> · ${esc(BOSS_RULES[id].desc)}</span>`).join(''):'<span>No house rules. Just a mean streak.</span>'}${d.rival?`<span><b>Rival</b> · ${esc(RIVALS[d.rival].rule)}</span>`:''}</div>
    <div class="preward">REWARD ${capN(Math.round(tableReward(s,2)*rollerMult()*winMult()))} + BOUNTY ${capN(bossBountyPay(s))}</div>
    <div class="ptap">Tap to deal in</div></div>`;
  document.body.appendChild(el);
  const p=el.querySelector('.poster');
  if(motionOn())p.animate([{transform:'scale(1.8) rotate(-9deg)',opacity:0},{transform:'scale(.96) rotate(-2deg)',opacity:1,offset:.7},{transform:'rotate(-2deg)'}],{duration:420,easing:'cubic-bezier(.3,1.4,.5,1)',fill:'both'});
  setTimeout(()=>{sfx('stamp');buzz(30);},300);
  let gone=false;const go=()=>{if(gone)return;gone=true;el.remove();cb();};
  // stays up until tapped; ignore taps in the first half-second so the deal-in tap doesn't dismiss it
  const t0=Date.now();el.addEventListener('click',()=>{if(Date.now()-t0>500)go();});
}

// ---------- hand cards catch the light ----------
document.addEventListener('pointermove',e=>{
  const b=e.target.closest&&e.target.closest('.hand .card-btn, .pickcard, .offer .card');if(!b)return;
  const r=b.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  b.style.setProperty('--sx',`${(1-x)*100}%`);b.style.setProperty('--rx',`${(.5-y)*10}deg`);b.style.setProperty('--ry',`${(x-.5)*12}deg`);
},{passive:true});
document.addEventListener('pointerleave',e=>{},true);
document.addEventListener('pointerout',e=>{const b=e.target.closest&&e.target.closest('.hand .card-btn, .pickcard, .offer .card');if(b&&!b.contains(e.relatedTarget)){b.style.removeProperty('--rx');b.style.removeProperty('--ry');b.style.removeProperty('--sx');}},{passive:true});

function afterRender(prevScreen,prevSnap,fxNow){
  document.body.classList.toggle('stillfx',!motionOn());
  screenIn(prevScreen);
  ambience();
  if(screen==='match'){animateMatch(prevSnap,fxNow);if(G&&G.over)resultCaps();}
  if(typeof run==='function'&&run()&&run().picker)revealPicker();
  capsTick();
}


// ---------- illustrated court cards (Jack, Queen, King) and the Joker ----------
// Each court figure is drawn once per color, top half then mirrored, like a real double-ended court card.
function courtFigure(x,rank,red){
  const ink=red?'#8f1d18':'#1d2433', acc=red?'#c8342a':'#2c3e66', gold='#d9a43c', skin='#efc9a2', hair=red?'#6b3a1e':'#2a1d14';
  // shoulders / robe
  x.fillStyle=acc;x.beginPath();x.moveTo(6,84);x.quadraticCurveTo(14,58,38,54);x.lineTo(62,54);x.quadraticCurveTo(86,58,94,84);x.closePath();x.fill();
  x.fillStyle=gold;x.beginPath();x.moveTo(40,54);x.lineTo(50,72);x.lineTo(60,54);x.closePath();x.fill();
  x.fillStyle='#f4ead2';for(let i=0;i<6;i++){x.beginPath();x.arc(16+i*13,80,3,0,7);x.fill();}
  // neck + head
  x.fillStyle=skin;x.fillRect(44,44,12,12);
  x.beginPath();x.ellipse(50,34,15,17,0,0,7);x.fill();
  // face (vault-boy grin)
  const eyes=(y)=>{x.fillStyle='#fff';for(const s of [-1,1]){x.beginPath();x.ellipse(50+s*6,y,3,2.4,0,0,7);x.fill();}x.fillStyle='#111';for(const s of [-1,1]){x.beginPath();x.arc(50+s*6,y+.4,1.3,0,7);x.fill();}};
  if(rank==='K'){
    // bottle-cap crown
    x.fillStyle=gold;x.beginPath();x.moveTo(34,22);for(let i=0;i<=6;i++){x.lineTo(34+i*5.33,i%2?10:16);}x.lineTo(66,22);x.closePath();x.fill();
    for(let i=0;i<3;i++){x.fillStyle=i===1?acc:'#e8e2d4';x.beginPath();x.arc(40+i*10,18,3,0,7);x.fill();}
    x.fillStyle=hair;x.beginPath();x.ellipse(50,22,16,5,0,0,Math.PI);x.fill();
    eyes(32);
    // big mustache + beard
    x.fillStyle=hair;x.beginPath();x.moveTo(50,41);x.quadraticCurveTo(38,36,32,44);x.quadraticCurveTo(40,42,50,45);x.quadraticCurveTo(60,42,68,44);x.quadraticCurveTo(62,36,50,41);x.fill();
    x.beginPath();x.moveTo(38,44);x.quadraticCurveTo(50,62,62,44);x.quadraticCurveTo(50,50,38,44);x.fill();
    // scepter
    x.strokeStyle=gold;x.lineWidth=3;x.beginPath();x.moveTo(78,84);x.lineTo(86,40);x.stroke();x.fillStyle=gold;x.beginPath();x.arc(86,38,5,0,7);x.fill();
  }else if(rank==='Q'){
    // victory-roll hair
    x.fillStyle=hair;x.beginPath();x.ellipse(50,24,17,11,0,Math.PI,0);x.fill();
    x.beginPath();x.arc(38,20,7,0,7);x.arc(62,20,7,0,7);x.fill();
    x.beginPath();x.moveTo(34,30);x.quadraticCurveTo(28,46,36,52);x.lineTo(40,40);x.closePath();x.fill();
    x.beginPath();x.moveTo(66,30);x.quadraticCurveTo(72,46,64,52);x.lineTo(60,40);x.closePath();x.fill();
    x.fillStyle=acc;x.beginPath();x.moveTo(42,13);x.lineTo(50,6);x.lineTo(58,13);x.closePath();x.fill();
    eyes(33);x.strokeStyle='#111';x.lineWidth=1.2;for(const s of [-1,1]){x.beginPath();x.moveTo(50+s*4,30);x.lineTo(50+s*9,29);x.stroke();}
    x.fillStyle='#c2272d';x.beginPath();x.ellipse(50,42,4.5,2.2,0,0,7);x.fill();
    x.fillStyle='#3a2a1a';x.beginPath();x.arc(56,39,.9,0,7);x.fill();
    x.fillStyle='#f4ead2';for(let i=0;i<7;i++){x.beginPath();x.arc(41+i*3,57+Math.sin(i/6*Math.PI)*3,1.8,0,7);x.fill();}
    // rose
    x.fillStyle=red?'#e6453a':'#c2272d';x.beginPath();x.arc(20,70,5,0,7);x.fill();x.strokeStyle='#4f7a3a';x.lineWidth=2;x.beginPath();x.moveTo(20,75);x.lineTo(16,86);x.stroke();
  }else{
    // Jack: cowboy hat, bandana, toothpick
    x.fillStyle=hair;x.beginPath();x.ellipse(50,24,16,8,0,Math.PI,0);x.fill();
    x.fillStyle=red?'#7a4a22':'#3f3328';x.beginPath();x.ellipse(50,20,26,5,0,0,7);x.fill();
    x.beginPath();x.moveTo(37,20);x.quadraticCurveTo(38,4,50,6);x.quadraticCurveTo(62,4,63,20);x.closePath();x.fill();
    x.fillStyle=acc;x.fillRect(37,15,26,3);
    eyes(33);x.strokeStyle='#111';x.lineWidth=1.6;x.beginPath();x.moveTo(41,28);x.lineTo(47,29);x.moveTo(53,29);x.lineTo(59,27);x.stroke();
    x.strokeStyle='#7a2a20';x.lineWidth=1.8;x.beginPath();x.moveTo(42,40);x.quadraticCurveTo(50,46,58,39);x.stroke();
    x.strokeStyle='#d9c08a';x.lineWidth=1.4;x.beginPath();x.moveTo(57,41);x.lineTo(65,38);x.stroke();
    x.fillStyle=red?'#d23a2c':'#2c4f8a';x.beginPath();x.moveTo(36,52);x.lineTo(64,52);x.lineTo(50,66);x.closePath();x.fill();
    x.fillStyle='#fff';for(const [px,py] of [[44,55],[54,55],[50,60]]){x.beginPath();x.arc(px,py,1,0,7);x.fill();}
    // knife
    x.fillStyle='#c9ced2';x.beginPath();x.moveTo(82,44);x.lineTo(86,70);x.lineTo(80,70);x.closePath();x.fill();x.fillStyle='#5a3a24';x.fillRect(79,70,8,10);
  }
}
function drawCourt(rank,red){
  const S=3,W=100,H=140,HH=70;
  const [fc,fx]=mkCanvas(W*S,HH*S);fx.scale(S,S);fx.translate(0,-12);courtFigure(fx,rank,red);
  const [oc,ox]=mkCanvas(W*S,HH*S);ox.drawImage(fc,0,0);ox.globalCompositeOperation='source-in';ox.fillStyle=red?'#5a120e':'#0e121c';ox.fillRect(0,0,W*S,HH*S);
  const [hc,hx]=mkCanvas(W*S,HH*S);for(let k=0;k<10;k++){const a=k/10*Math.PI*2;hx.drawImage(oc,Math.cos(a)*4,Math.sin(a)*4);}hx.drawImage(fc,0,0);
  const [c,x]=mkCanvas(W*S,H*S);
  x.drawImage(hc,0,0);x.save();x.translate(W*S,H*S);x.rotate(Math.PI);x.drawImage(hc,0,0);x.restore();
  x.strokeStyle=red?'#8f1d18':'#1d2433';x.lineWidth=S;x.beginPath();x.moveTo(6*S,(HH+5)*S);x.lineTo((W-6)*S,(HH-5)*S);x.stroke();
  return c.toDataURL();
}
function drawJokerArt(){
  const S=3,W=100,H=140,[c,x]=mkCanvas(W*S,H*S);x.scale(S,S);
  const [fc,f]=mkCanvas(W*S,H*S);f.scale(S,S);
  // body
  f.fillStyle='#2c6a4a';f.beginPath();f.moveTo(14,140);f.quadraticCurveTo(18,96,50,92);f.quadraticCurveTo(82,96,86,140);f.closePath();f.fill();
  f.fillStyle='#c8342a';f.beginPath();f.moveTo(50,92);f.quadraticCurveTo(82,96,86,140);f.lineTo(50,140);f.closePath();f.fill();
  for(let i=0;i<5;i++){f.fillStyle=i%2?'#ffd34a':'#f4ead2';f.beginPath();f.arc(22+i*14,98+Math.abs(2-i)*3,5,0,7);f.fill();}
  // thumbs up
  f.fillStyle='#efc9a2';f.beginPath();f.ellipse(82,104,8,7,0,0,7);f.fill();f.fillRect(80,88,5,14);f.beginPath();f.arc(82.5,88,2.6,0,7);f.fill();
  // head
  f.fillStyle='#efc9a2';f.beginPath();f.ellipse(50,64,20,22,0,0,7);f.fill();
  // jester hat with bottle-cap bells
  const hat=(col,pts,bx,by)=>{f.fillStyle=col;f.beginPath();f.moveTo(...pts[0]);for(const p of pts.slice(1))f.lineTo(...p);f.closePath();f.fill();f.fillStyle='#d9a43c';f.beginPath();f.arc(bx,by,4.5,0,7);f.fill();f.fillStyle='#8a5a12';for(let k=0;k<10;k++){const a=k/10*Math.PI*2;f.beginPath();f.arc(bx+Math.cos(a)*4.5,by+Math.sin(a)*4.5,.9,0,7);f.fill();}};
  hat('#c8342a',[[30,52],[14,22],[50,44]],14,20);hat('#2c6a4a',[[42,44],[50,10],[58,44]],50,8);hat('#ffd34a',[[50,44],[86,22],[70,52]],86,20);
  f.fillStyle='#f4ead2';f.fillRect(30,46,40,7);
  // vault-boy face
  f.fillStyle='#fff';for(const s of [-1,1]){f.beginPath();f.ellipse(50+s*8,63,4.4,3.4,0,0,7);f.fill();}
  f.fillStyle='#111';for(const s of [-1,1]){f.beginPath();f.arc(50+s*8+1,63.5,1.8,0,7);f.fill();}
  f.strokeStyle='#111';f.lineWidth=1.6;f.beginPath();f.moveTo(43,58);f.lineTo(47,56);f.moveTo(53,56);f.lineTo(57,58);f.stroke();
  f.fillStyle='#7a2a20';f.beginPath();f.moveTo(38,72);f.quadraticCurveTo(50,88,62,72);f.quadraticCurveTo(50,77,38,72);f.fill();
  f.fillStyle='#fff';f.beginPath();f.moveTo(40,73);f.quadraticCurveTo(50,78,60,73);f.lineTo(59,76);f.quadraticCurveTo(50,80,41,76);f.closePath();f.fill();
  f.fillStyle='rgba(220,80,70,.35)';f.beginPath();f.ellipse(36,70,4,2.5,0,0,7);f.ellipse(64,70,4,2.5,0,0,7);f.fill();
  const [oc,ox]=mkCanvas(W*S,H*S);ox.drawImage(fc,0,0);ox.globalCompositeOperation='source-in';ox.fillStyle='#120c08';ox.fillRect(0,0,W*S,H*S);
  x.setTransform(1,0,0,1,0,0);for(let k=0;k<10;k++){const a=k/10*Math.PI*2;x.drawImage(oc,Math.cos(a)*4,Math.sin(a)*4);}x.drawImage(fc,0,0);
  return c.toDataURL();
}
// worn edges and scuffed corners, laid over every card face
function texWear(){
  const W=200,H=280,[c,x]=mkCanvas(W,H),r=rngSeed(77);
  const g=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.62);g.addColorStop(0,'rgba(80,50,20,0)');g.addColorStop(1,'rgba(80,50,20,.28)');x.fillStyle=g;x.fillRect(0,0,W,H);
  for(const [cx,cy] of [[0,0],[W,0],[0,H],[W,H]]){const cg=x.createRadialGradient(cx,cy,0,cx,cy,26);cg.addColorStop(0,'rgba(90,60,30,.35)');cg.addColorStop(1,'rgba(90,60,30,0)');x.fillStyle=cg;x.fillRect(0,0,W,H);}
  x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.8;for(let i=0;i<5;i++){x.beginPath();const sx=r()*W,sy=r()*H;x.moveTo(sx,sy);x.quadraticCurveTo(sx+(r()-.5)*40,sy+(r()-.5)*40,sx+(r()-.5)*70,sy+(r()-.5)*70);x.stroke();}
  x.strokeStyle='rgba(90,60,30,.14)';x.lineWidth=1;x.beginPath();x.moveTo(0,H*.52);x.lineTo(W,H*.48);x.stroke();
  for(let i=0;i<120;i++){x.fillStyle=`rgba(${r()<.5?'255,255,255':'70,45,20'},${r()*.18})`;const e=r()*4|0,t=r();const px=e<2?t*W:(e===2?r()*3:W-r()*3),py=e>=2?t*H:(e===0?r()*3:H-r()*3);x.fillRect(px,py,1.5,1.5);}
  return c.toDataURL();
}
function loadCourtArt(){
  const root=document.documentElement.style;
  for(const rk of ['J','Q','K'])for(const red of [true,false])root.setProperty(`--court-${rk}-${red?'r':'b'}`,`url(${drawCourt(rk,red)})`);
  root.setProperty('--court-JK',`url(${drawJokerArt()})`);
  root.setProperty('--tex-wear',`url(${texWear()})`);
}


