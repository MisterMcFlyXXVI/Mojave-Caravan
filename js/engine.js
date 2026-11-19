// ================= ENGINE START =================
const SUITS=['S','H','D','C'];
const SUIT_CH={S:'♠',H:'♥',D:'♦',C:'♣'};
const NUM_RANKS=['A','2','3','4','5','6','7','8','9','10'];
const ROMAN=['I','II','III'];
const FACE_NAME={J:'Jack',Q:'Queen',K:'King',JK:'Joker'};

const isNum=c=>!c.legend&&!(c.rank in FACE_NAME);
const val=c=>c.rank==='A'?1:parseInt(c.rank,10);
const isRed=s=>s==='H'||s==='D';
const cardName=c=>c.legend?((typeof LEGENDS!=='undefined'&&LEGENDS[c.legend])?LEGENDS[c.legend].name:'Legend card'):c.rank==='JK'?'Joker':c.rank+SUIT_CH[c.suit];
const clone=o=>JSON.parse(JSON.stringify(o));
const other=s=>s==='p'?'a':'p';
let _uid=0;
const mk=(rank,suit)=>({id:'c'+(++_uid)+'_'+Math.random().toString(36).slice(2,6),rank,suit});
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function buildDeck(spec){return shuffle(spec.map((s,i)=>{const c=mk(s.rank,s.suit);if(s.mod)c.mod=s.mod;if(s.ed)c.ed=s.ed;if(s.pack)c.pack=s.pack;if(s.legend)c.legend=s.legend;c.si=i;return c;}));}
function baseNumbers(){const out=[];for(const s of SUITS)for(const r of NUM_RANKS)out.push({rank:r,suit:s});return out;}
function addFaces(spec,extra){
  for(const [rank,n] of Object.entries(extra)){
    for(let i=0;i<n;i++)spec.push({rank,suit:rank==='JK'?null:SUITS[i%4]});
  }
  return spec;
}
// Rules can differ per side (perks for you, house rules for the table).
function baseRules(){
  return {range:{p:[21,26],a:[21,26]},kingMult:{p:2,a:2},hand:{p:5,a:5},deal:{p:8,a:8},
    color:{p:false,a:false},jackproof:{p:false,a:false},jokerproof:{p:false,a:false},freeDisband:{p:false,a:false},noDiscard:{p:false,a:false},jackDraw:{p:false,a:false},discardDraw:{p:1,a:1},banned:[],hideOpp:false,
    kingproof:{p:false,a:false},queenproof:{p:false,a:false},allproof:{p:false,a:false},noJoker:{p:false,a:false},queenDraw:{p:false,a:false},luckyDraw:{p:1,a:1},bigJoker:{p:false,a:false},spareParts:{p:false,a:false},tieWin:{p:false,a:false},anyOrder:{p:false,a:false},dead:{p:[],a:[]},kingDraw:{p:false,a:false},glassMult:{p:2,a:2}};
}
const RULES=g=>g.rules||baseRules();

function cvValue(cv){
  return cv.reduce((s,e)=>s+val(e.card)*(e.card.mod==='glass'?(e.card.gx||2):1)*e.faces.reduce((m,f)=>f.rank==='K'?m*(f.m||2):m,1),0);
}
function cvState(cv){
  let dir=0,suit=null,wild=false;
  for(let i=0;i<cv.length;i++){
    const e=cv[i];
    // Equal neighbours can only appear after a Jack/Joker removal; direction then stays as it was.
    if(i>0){const d=val(e.card)-val(cv[i-1].card);if(d!==0)dir=d>0?1:-1;}
    suit=e.card.suit;wild=e.card.mod==='wild';
    for(const f of e.faces){if(f.rank==='Q'){dir=-dir;suit=f.suit;wild=false;}}
  }
  return {dir,suit,wild};
}
function canPlayNum(cv,card,colorMatch){
  if(cv.length===0)return true;
  const last=cv[cv.length-1];
  if(val(card)===val(last.card))return false;
  const {dir,suit,wild}=cvState(cv);
  if(wild||card.mod==='wild'||card.suit===suit||(colorMatch&&isRed(card.suit)===isRed(suit)))return true;
  if(dir===0)return true;
  return dir>0?val(card)>val(last.card):val(card)<val(last.card);
}
function canPlayFace(cv,idx,card){
  const e=cv[idx]; if(!e)return false;
  if(card.rank==='J')return true;
  if(card.rank==='Q')return idx===cv.length-1;
  return true;
}
const inR=(v,r)=>v>=r[0]&&v<=r[1];
function laneWinner(pv,av,R){
  const pi=inR(pv,R.range.p),ai=inR(av,R.range.a);
  if(pi&&ai&&pv===av&&R.tieWin){const tp=!!R.tieWin.p,ta=!!R.tieWin.a;if(tp&&!ta)return 'p';if(ta&&!tp)return 'a';}
  if(pi&&(!ai||pv>av))return 'p';
  if(ai&&(!pi||av>pv))return 'a';
  return null;
}
const edIn=(cv,ed)=>cv.reduce((n,e)=>n+(e.card.ed===ed?1:0)+e.faces.filter(f=>f.ed===ed).length,0);
function laneRange(g,side,l){const r=RULES(g).range[side],h=edIn(g[side].cv[l],'holo');return h?[r[0],r[1]+h]:r;}
function lanesResult(g){const R=RULES(g);return [0,1,2].map(l=>{const pr=laneRange(g,'p',l);if(pr===R.range.p)return laneWinner(cvValue(g.p.cv[l]),cvValue(g.a.cv[l]),R);
  return laneWinner(cvValue(g.p.cv[l]),cvValue(g.a.cv[l]),{range:{p:pr,a:R.range.a},tieWin:R.tieWin});});}
function winnerOf(g){
  if(g.setupLeft.p>0||g.setupLeft.a>0)return null;
  const r=lanesResult(g); if(r.some(x=>!x))return null;
  return r.filter(x=>x==='p').length>=2?'p':'a';
}
function legalMoves(g,side){
  const R=RULES(g),me=g[side],moves=[],setup=g.setupLeft[side]>0;
  me.hand.forEach((c,ci)=>{
    if(isNum(c)){
      if(R.dead&&R.dead[side]&&R.dead[side].includes(c.rank))return;
      for(let l=0;l<3;l++){
        const cv=me.cv[l];
        if(setup){if(cv.length===0)moves.push({t:'num',ci,lane:l});}
        else if((R.anyOrder&&R.anyOrder[side])||canPlayNum(cv,c,R.color[side]))moves.push({t:'num',ci,lane:l});
      }
    }else if(!c.legend&&!setup&&!R.banned.includes(c.rank)&&!(c.rank==='JK'&&R.noJoker&&R.noJoker[side])){
      for(const s of ['p','a']){
        if(c.rank==='J'&&s!==side&&R.jackproof[s])continue;
        if(s!==side&&((c.rank==='K'&&R.kingproof&&R.kingproof[s])||(c.rank==='Q'&&R.queenproof&&R.queenproof[s])||(R.allproof&&R.allproof[s])))continue;
        for(let l=0;l<3;l++){
          const cv=g[s].cv[l];
          for(let i=0;i<cv.length;i++)if(canPlayFace(cv,i,c)&&!(c.rank==='J'&&cv[i].card.mod==='steel'))moves.push({t:'face',ci,side:s,lane:l,idx:i});
        }
      }
    }
  });
  if(!setup){
    if(!(R.noDiscard&&R.noDiscard[side]))me.hand.forEach((c,ci)=>moves.push({t:'discard',ci}));
    if(!(R.noDisband&&R.noDisband[side]))for(let l=0;l<3;l++)if(me.cv[l].length)moves.push({t:'disband',lane:l});
  }
  if(!moves.length)me.hand.forEach((c,ci)=>moves.push({t:'discard',ci})); // never leave anyone with no move at all
  return moves;
}
const handSize=h=>h.filter(c=>c.ed!=='ghost').length; // Ghost edition cards don't take a hand slot
function drawTo(g,side,n){const me=g[side];while(handSize(me.hand)<n&&me.deck.length)me.hand.push(me.deck.pop());}
function applyMove(g,side,m,sim){
  const R=RULES(g),me=g[side];
  if(m.t==='disband'){me.cv[m.lane]=[];return;}
  if(m.t==='turret'){g[other(side)].cv[m.lane].pop();return;}
  if(m.t==='boone'){const cv=g[other(side)].cv[m.lane];for(let i=cv.length-1;i>=0;i--){const k=cv[i].faces.map(f=>f.rank).lastIndexOf('K'),q=cv[i].faces.map(f=>f.rank).lastIndexOf('Q'),j=Math.max(k,q);if(j>=0){cv[i].faces.splice(j,1);break;}}return;}
  const wasSetup=g.setupLeft[side]>0;
  const card=me.hand.splice(m.ci,1)[0];
  if(!sim&&side==='p'&&card.ed==='gold'&&(m.t==='num'||m.t==='face'))g.goldCaps=(g.goldCaps||0)+3;
  if(m.t==='num'){
    if(card.mod==='glass')card.gx=(R.glassMult&&R.glassMult[side])||2;
    me.cv[m.lane].push({card,faces:[]});
    if(wasSetup)g.setupLeft[side]--;
  }else if(m.t==='face'){
    const cv=g[m.side].cv[m.lane],e=cv[m.idx];
    if(card.rank==='J'){const gone=cv.splice(m.idx,1)[0];if(!sim&&gone&&m.side==='p'&&side==='a')g.lastLost={lane:m.lane,e:gone};if(!sim&&m.side!==side&&R.spareParts&&R.spareParts[m.side]&&gone)g[m.side].hand.push(gone.card);}
    else if(card.rank==='JK'){
      e.faces.push(card);
      const tv=val(e.card),ts=e.card.suit;
      for(const s of ['p','a'])for(let l=0;l<3;l++){
        if(R.jokerproof&&R.jokerproof[s])continue;
        const keep=g[s].cv[l].filter(x=>x===e||!(tv===1?x.card.suit===ts:val(x.card)===tv));
        if(!sim&&s==='p'&&side==='a'&&keep.length<g[s].cv[l].length){const lost=g[s].cv[l].filter(x=>!keep.includes(x));g.lastLost={lane:l,e:lost[lost.length-1]};}
        g[s].cv[l]=keep;
      }
      if(R.bigJoker&&R.bigJoker[side]&&m.side!==side){const cvT=g[m.side].cv[m.lane],k=cvT.indexOf(e);if(k>=0)cvT.splice(k,1);}
    }else{
      if(card.rank==='K')card.m=R.kingMult[side];
      e.faces.push(card);
    }
  }
  if(sim)return;
  if(m.t==='discard'){const n=(R.discardDraw&&R.discardDraw[side])||1;for(let i=0;i<n&&me.deck.length;i++)me.hand.push(me.deck.pop());}
  else if(!(m.t==='num'&&wasSetup))drawTo(g,side,R.hand[side]);
  if(m.t==='num'&&card.mod==='lucky')for(let i=0;i<((R.luckyDraw&&R.luckyDraw[side])||1)&&me.deck.length;i++)me.hand.push(me.deck.pop());
  if(me.deck.length&&m.t==='face'&&((card.rank==='J'&&R.jackDraw&&R.jackDraw[side])||(card.rank==='Q'&&R.queenDraw&&R.queenDraw[side])||(card.rank==='K'&&R.kingDraw&&R.kingDraw[side])))me.hand.push(me.deck.pop());
}
// AI heuristics
function laneScore(v,r){
  const [lo,hi]=r;
  if(v===0)return 0;
  if(v<lo)return v*2*21/lo;
  if(v<=hi)return 62+(v-lo)*2;
  return 8-(v-hi)*4;
}
function evalState(g,side,P){
  const w=winnerOf(g);
  if(w)return w===side?100000:-100000;
  const R=RULES(g),os=other(side),me=g[side],op=g[os];
  let s=0;
  for(let l=0;l<3;l++){
    const mv=cvValue(me.cv[l]),ov=cvValue(op.cv[l]);
    s+=laneScore(mv,R.range[side])-laneScore(ov,R.range[os])*((P&&P.opp)||0.8);
    if(inR(mv,R.range[side])&&inR(ov,R.range[os]))s+=mv>ov?25:mv<ov?-25:0;
    const st=cvState(me.cv[l]);
    if(me.cv[l].length>1&&mv<R.range[side][0]){
      const last=val(me.cv[l][me.cv[l].length-1].card);
      if((st.dir>0&&last>=10)||(st.dir<0&&last<=1))s-=6;
    }
  }
  return s;
}
const KEEP={J:7,Q:2,K:6,JK:12},KEEPK={J:'jack',Q:'queen',K:'king',JK:'joker'};
// A dealer's play style scales how much they value holding each face card. Higher = holds it back for a decisive play.
// (Measured over thousands of simulated hands: a King-savvy dealer, holding Kings for the decisive play, beats the stock AI 61-70% of the time.)
const keepCost=(c,P)=>KEEP[c.rank]*((P&&P[KEEPK[c.rank]])||1);
function moveCost(g,side,m,P){
  if(m.t==='disband')return 3;
  const c=g[side].hand[m.ci];
  if(m.t==='discard')return isNum(c)?2+(val(c)>=9?0:1):keepCost(c,P)+4;
  if(m.t==='face')return keepCost(c,P);
  return 0;
}
function chooseAIMove(g,side,noise,P){
  const moves=legalMoves(g,side);
  if(!moves.length)return null;
  let best=null,bs=-Infinity;
  for(const m of moves){
    const g2=clone(g); applyMove(g2,side,m,true);
    const sc=evalState(g2,side,P)-moveCost(g,side,m,P)+Math.random()*noise;
    if(sc>bs){bs=sc;best=m;}
  }
  return best;
}
function newMatch(playerSpec,oppSpec,oppIndex,rules){
  const R=rules||baseRules();
  const g={p:{deck:buildDeck(playerSpec),hand:[],cv:[[],[],[]]},a:{deck:buildDeck(oppSpec.some(c=>c.pack)?oppSpec:withPacks(oppSpec,typeof dealerPacks==='function'&&typeof LOOKS!=='undefined'?dealerPacks(String(oppIndex)+':'+oppSpec.length):[null])),hand:[],cv:[[],[],[]]},
    turn:'p',setupLeft:{p:3,a:3},log:[],over:null,opp:oppIndex,fx:null,rules:R};
  while(handSize(g.p.hand)<R.deal.p&&g.p.deck.length)g.p.hand.push(g.p.deck.pop());
  for(let i=0;i<R.deal.a;i++)g.a.hand.push(g.a.deck.pop());
  return g;
}
// ================= ENGINE END =================
// Node: lets tools/ load the rules engine directly. In the browser this is skipped and the globals are used.
if(typeof module!=='undefined'&&module.exports)module.exports={SUITS,SUIT_CH,NUM_RANKS,FACE_NAME,isNum,val,isRed,cardName,clone,other,mk,shuffle,buildDeck,baseNumbers,addFaces,baseRules,RULES,cvValue,cvState,canPlayNum,canPlayFace,inR,laneWinner,edIn,laneRange,lanesResult,winnerOf,legalMoves,handSize,drawTo,applyMove,laneScore,evalState,KEEP,moveCost,chooseAIMove,newMatch};
