// ---------- achievements ----------
const ACH_CATS=['Getting started','At the table','Milestones','Classic','The Road','Style','Characters','Mojave Express & Legends','Road feats','The Water Chip'];
// Rewards. Hard feats pay NCR dollars (what the Mojave Express charges for gear), scaled to how hard they are: 1 for an
// easy one, up to 25 for the hardest. Tutorial-level steps pay a small cap voucher (cashed in at a trading post).
// Some also unlock a card back (a pack), a font, a card face or a play mat; those come from the items themselves (LOOKS).
const ACH_NCR={};
const payNCR=(n,ids)=>ids.split(' ').forEach(i=>{ACH_NCR[i]=n;});
payNCR(1,'exact26 sweep clean steady burn quick crown hands100 wins10 kings50 road_first bounty10 chems10 greg jeanita leg_play repairs10 requests10 hugs10 turret10 wc_dry strip_vladmira strip_nuke strip_chevy strip_ronald strip_matt strip_snipsnip strip_threedog strip_benny strip_greg strip_jeanita');
payNCR(2,'long wipe jacks25 wins50 champ1 trophy3 highroller chal10 tapes6 road_strip hoard loaded comeback tinker blind skip3 snipsnip gear_full leg10 leg_two leg_fatman leg_yesman leg_prime benny_tie legend all_in walk wc_junk wc_both wc_ufo wc_footprint wc_policebox ncr100 bounty25 kings200 jacks100');
payNCR(3,'threedog benny collector classic_expert beyond5 wipe5 hands500 wc_harold');
payNCR(4,'circuit2 skipper wc_crew');
payNCR(5,'camp_done silver_road run1 hoard250 ncr500 strip_5 leg_all');
payNCR(6,'wc_saved wc_100 comp_all');
payNCR(8,'ladder gear_all beyond10 wins200');
payNCR(12,'gold_road flawless wc_noskip');
payNCR(15,'wc_gold decks_all');
payNCR(20,'deck_gold3 beyond20');
payNCR(25,'strip_all');
const ACH_VOUCH={first_hand:5,first_win:5,tut_basics:5,tut_road:5,gear1:5,comp1:5,leg_buy:5,style:5,four:5,bounty1:5,camp_first:5};
const achNCR=a=>ACH_NCR[a.id||a]||0;
const achCaps=a=>ACH_VOUCH[a.id||a]||0;
const achCosmetics=id=>['font','face','mat'].flatMap(k=>LOOKS[k].filter(o=>o.unlock===id).map(o=>({kind:k,name:o.name})));
function achRewardText(a){
  const bits=[],rw=backReward(a.id),n=achNCR(a),c=achCaps(a);
  if(rw)bits.push(`${rw.name} pack`);
  for(const x of achCosmetics(a.id))bits.push(`${x.name} ${({font:'font',face:'card face',mat:'play mat'})[x.kind]}`);
  if(n)bits.push(`${n} NCR ${n===1?'dollar':'dollars'}`);
  if(c)bits.push(`${c}-cap voucher`);
  return bits.join(' + ');
}
function checkJunk(){const j=meta.junkFaced||{};if(j.killian&&j.gizmo)unlock('wc_both');}
const lifetimeNCR=()=>(meta.scrip||0)+((meta.st&&meta.st.ncrSpent)||0);
const stv=k=>(meta.st&&meta.st[k])||0;
const ACH=[
  {id:'first_hand',cat:0,name:'Pull Up a Chair',desc:'Finish your first hand.'},
  {id:'first_win',cat:0,name:'Beginner’s Luck',desc:'Win a hand.'},
  {id:'tut_basics',cat:0,name:'Ezra’s Pupil',desc:'Finish Old Ezra’s basics tutorial.'},
  {id:'tut_road',cat:0,name:'Road Ready',desc:'Finish Lucky Jo’s Road tutorial.'},
  {id:'exact26',cat:1,name:'Twenty-Six on the Nose',desc:'Win with a caravan sold at exactly 26.'},
  {id:'sweep',cat:1,name:'Clean Sweep',desc:'Win by selling all three caravans.'},
  {id:'clean',cat:1,name:'Honest Hands',desc:'Win without playing a face card.'},
  {id:'steady',cat:1,name:'Steady Nerves',desc:'Win without discarding or disbanding.'},
  {id:'burn',cat:1,name:'Burn It Down',desc:'Win a hand after disbanding a caravan.'},
  {id:'quick',cat:1,name:'Fast Hands',desc:'Win in 8 turns or fewer.'},
  {id:'long',cat:1,name:'Long Night',desc:'Win a hand that lasts 40 of your turns or more.'},
  {id:'crown',cat:1,name:'Crown Heavy',desc:'Stack two Kings on the same card.'},
  {id:'wipe',cat:1,name:'Clean Slate',desc:'Knock out 3 or more of the dealer’s cards with one Joker.'},
  {id:'hands100',cat:2,name:'Lifer',desc:'Play 100 hands.',prog:()=>[stv('hands'),100]},
  {id:'wins10',cat:2,name:'Regular',desc:'Win 10 hands.',prog:()=>[stv('wins'),10]},
  {id:'wins50',cat:2,name:'Table Legend',desc:'Win 50 hands.',prog:()=>[stv('wins'),50]},
  {id:'kings50',cat:2,name:'Royal Treatment',desc:'Play 50 Kings.',prog:()=>[stv('kings'),50]},
  {id:'jacks25',cat:2,name:'Professional Thief',desc:'Play 25 Jacks on the dealer’s cards.',prog:()=>[stv('jacks'),25]},
  {id:'classic_expert',cat:3,name:'Sharper Than the Sharp',desc:'Beat the Expert dealer in a single game.'},
  {id:'camp_first',cat:3,name:'On the Circuit',desc:'Beat your first campaign dealer.'},
  {id:'champ1',cat:3,name:'Badge of Honor',desc:'Beat Sheriff Dunn in Goodsprings.'},
  {id:'trophy3',cat:3,name:'Trophy Case',desc:'Win three champion trophies.'},
  {id:'highroller',cat:3,name:'High Roller',desc:'Beat a high-roller table.'},
  {id:'legend',cat:3,name:'Local Legend',desc:'Reach Legend reputation in any town.'},
  {id:'chal10',cat:3,name:'Odd Jobs',desc:'Complete ten side challenges.'},
  {id:'tapes6',cat:3,name:'Every Last Tape',desc:'Collect all six holotapes.'},
  {id:'circuit2',cat:3,name:'Meaner Every Time',desc:'Beat the Old Man on Circuit 2.'},
  {id:'camp_done',cat:3,name:'The High Table',desc:'Beat the Old Man at the High Table.'},
  {id:'all_in',cat:3,name:'All In',desc:'Win a 500-cap bet in the campaign.'},
  {id:'collector',cat:3,name:'Card Collector',desc:'Own 120 cards in your campaign collection.',prog:()=>[meta.classic.camp?countsSize(meta.classic.camp.coll):0,120]},
  {id:'road_first',cat:4,name:'Hit the Road',desc:'Beat the Goodsprings boss on a run.'},
  {id:'road_strip',cat:4,name:'Bright Lights',desc:'Reach the Strip on a run.'},
  {id:'beyond5',cat:4,name:'Off the Map',desc:'Clear five stops beyond the Strip in one run.'},
  {id:'beyond10',cat:4,name:'Where the Road Ends',desc:'Clear ten stops beyond the Strip in one run.'},
  {id:'run1',cat:4,name:'Vegas, Baby',desc:'Win a full run.'},
  {id:'silver_road',cat:4,name:'Sterling Work',desc:'Win a run on the Silver Road.'},
  {id:'gold_road',cat:4,name:'Solid Gold',desc:'Win a run on the Gold Road.'},
  {id:'ladder',cat:4,name:'Top of the Ladder',desc:'Win a run with the Gold-Plated deck.'},
  {id:'skip3',cat:4,name:'Places to Be',desc:'Skip three tables in one run.'},
  {id:'tinker',cat:4,name:'Workbench Regular',desc:'Have five upgraded cards in your deck.'},
  {id:'blind',cat:4,name:'Blind Faith',desc:'Win at a Sandstorm table.'},
  {id:'bounty1',cat:4,name:'Wanted Poster',desc:'Collect a bounty.'},
  {id:'bounty10',cat:4,name:'Dead or Alive',desc:'Collect 10 bounties.',prog:()=>[stv('bounties'),10]},
  {id:'chems10',cat:4,name:'Pick-Me-Up',desc:'Use 10 chems.',prog:()=>[stv('chems'),10]},
  {id:'loaded',cat:4,name:'Fully Loaded',desc:'Hold five perks at once on a run.'},
  {id:'hoard',cat:4,name:'Cap Hoarder',desc:'Hold 250 caps during a run.'},
  {id:'comeback',cat:4,name:'Back From Broke',desc:'Win a table while holding 2 caps or fewer.'},
  {id:'greg',cat:4,name:'Hey, Buddy!',desc:'Unlock Greg.'},
  {id:'jeanita',cat:4,name:'Long Distance Call',desc:'Unlock Jeanita.'},
  {id:'style',cat:5,name:'Dressed to Deal',desc:'Change your Classic Card Back or play mat.'},
  {id:'four',cat:5,name:'Seeing in Color',desc:'Try four-color suits.'},
  // ---- Characters ----
  {id:'snipsnip',cat:6,name:'Snip Snip!',desc:'Unlock Snip Snip by winning a run without using a chem.'},
  {id:'threedog',cat:6,name:'Ow-ooooo!',desc:'Unlock Three Dog.'},
  {id:'benny',cat:6,name:'Ring-a-Ding-Ding',desc:'Unlock Benny.'},
  {id:'strip_vladmira',cat:6,name:'Heavy Lifting',desc:'Beat the Strip as Vladmira.'},
  {id:'strip_nuke',cat:6,name:'Peer Reviewed',desc:'Beat the Strip as Nuke Skywalker.'},
  {id:'strip_chevy',cat:6,name:'Built to Last',desc:'Beat the Strip as Chevy Ford.'},
  {id:'strip_ronald',cat:6,name:'Last Call',desc:'Beat the Strip as Ronald.'},
  {id:'strip_matt',cat:6,name:'Just Winning',desc:'Beat the Strip as Matt.'},
  {id:'strip_snipsnip',cat:6,name:'Operation Successful',desc:'Beat the Strip as Snip Snip.'},
  {id:'strip_threedog',cat:6,name:'Breaking News',desc:'Beat the Strip as Three Dog.'},
  {id:'strip_benny',cat:6,name:'The Chairman',desc:'Beat the Strip as Benny.'},
  {id:'strip_greg',cat:6,name:'Alex Approves',desc:'Beat the Strip as Greg.'},
  {id:'strip_jeanita',cat:6,name:'Please Hold',desc:'Beat the Strip as Jeanita.'},
  {id:'strip_5',cat:6,name:'Seasoned Crew',desc:'Beat the Strip with five different characters.',prog:()=>[(meta.stripBy||[]).length,5]},
  {id:'strip_all',cat:6,name:'The Whole Gang',desc:'Beat the Strip with every character.',prog:()=>[CHAR_ORDER.filter(c=>(meta.stripBy||[]).includes(c)).length,CHAR_ORDER.length]},
  {id:'repairs10',cat:6,name:'Have You Tried Turning It Off',desc:'Use Snip Snip’s Self-Repair 10 times.',prog:()=>[stv('repairs'),10]},
  {id:'requests10',cat:6,name:'Caller, You’re On the Air',desc:'Take 10 requests as Three Dog.',prog:()=>[stv('requests'),10]},
  {id:'benny_tie',cat:6,name:'Rigged From the Start',desc:'Win a caravan on a tie as Benny.'},
  {id:'hugs10',cat:6,name:'Big Softie',desc:'Give 10 Bear Hugs as Greg.',prog:()=>[stv('hugs'),10]},
  {id:'turret10',cat:6,name:'Fire in the Hole',desc:'Fire Chevy’s turret 10 times.',prog:()=>[stv('turrets'),10]},
  // ---- Mojave Express & Legends ----
  {id:'ncr100',cat:7,name:'Payday',desc:'Earn 100 NCR dollars in total.',prog:()=>[lifetimeNCR(),100]},
  {id:'ncr500',cat:7,name:'Republic Treasury',desc:'Earn 500 NCR dollars in total.',prog:()=>[lifetimeNCR(),500]},
  {id:'gear1',cat:7,name:'Suited Up',desc:'Buy your first piece of gear at the Mojave Express.'},
  {id:'gear_full',cat:7,name:'Dressed for the Wasteland',desc:'Go on a run wearing something in all eight slots.'},
  {id:'gear_all',cat:7,name:'Walking Armory',desc:'Own every piece of gear.',prog:()=>[Object.keys(GEAR).filter(id=>GEAR[id].slot!=='comp'&&meta.gear.owned.includes(id)).length,Object.keys(GEAR).filter(id=>GEAR[id].slot!=='comp').length]},
  {id:'comp1',cat:7,name:'Travelling Companion',desc:'Hire your first companion.'},
  {id:'comp_all',cat:7,name:'Lonesome No More',desc:'Hire every companion.',prog:()=>[Object.keys(GEAR).filter(id=>GEAR[id].slot==='comp'&&meta.gear.owned.includes(id)).length,Object.keys(GEAR).filter(id=>GEAR[id].slot==='comp').length]},
  {id:'leg_buy',cat:7,name:'Stuff of Legend',desc:'Add your first Legend card to the trading posts.'},
  {id:'leg_all',cat:7,name:'The Complete Legend',desc:'Add every Legend card to the trading posts.',prog:()=>[(meta.legends||[]).filter(id=>LEGENDS[id]).length,Object.keys(LEGENDS).length]},
  {id:'leg_play',cat:7,name:'Legendary',desc:'Play a Legend card.'},
  {id:'leg10',cat:7,name:'Living Legend',desc:'Play 10 Legend cards.',prog:()=>[meta.legendPlays||0,10]},
  {id:'leg_two',cat:7,name:'Double Feature',desc:'Play two Legend cards in the same hand.'},
  {id:'leg_fatman',cat:7,name:'Mini Nuke',desc:'Win a hand after dropping a Fat Man.'},
  {id:'leg_yesman',cat:7,name:'Of Course!',desc:'Win a hand after Yes Man swaps your caravans.'},
  {id:'leg_prime',cat:7,name:'Democracy Is Non-Negotiable',desc:'Strip 4 or more face cards with Liberty Prime.'},
  // ---- Road feats ----
  {id:'decks_all',cat:8,name:'Every Deck in the House',desc:'Win a run with every deck.',prog:()=>[Object.keys(meta.deckWon||{}).length,DECKS.length]},
  {id:'deck_gold3',cat:8,name:'Triple Crown',desc:'Beat the Gold Road with three different decks.',prog:()=>[Object.values(meta.deckWon||{}).filter(t=>t>=2).length,3]},
  {id:'flawless',cat:8,name:'Flawless',desc:'Win a run without losing a single table.'},
  {id:'skipper',cat:8,name:'Scenic Route? No Thanks',desc:'Win a run after skipping 5 or more tables.'},
  {id:'beyond20',cat:8,name:'Past the Edge of the Map',desc:'Clear twenty stops beyond the Strip in one run.'},
  {id:'bounty25',cat:8,name:'Most Wanted',desc:'Collect 25 bounties.',prog:()=>[stv('bounties'),25]},
  {id:'hoard250',cat:8,name:'Dragon’s Hoard',desc:'Hold 400 caps during a run.'},
  {id:'walk',cat:8,name:'Know When to Fold ’Em',desc:'Walk away from a table in Pre-War Sneakers.'},
  {id:'wipe5',cat:8,name:'Joker’s Wild',desc:'Knock out 5 or more of the dealer’s cards with one Joker.'},
  {id:'kings200',cat:8,name:'Long Live the King',desc:'Play 200 Kings.',prog:()=>[stv('kings'),200]},
  {id:'jacks100',cat:8,name:'Grand Larceny',desc:'Play 100 Jacks on the dealer’s cards.',prog:()=>[stv('jacks'),100]},
  {id:'wins200',cat:8,name:'House Always Loses',desc:'Win 200 hands.',prog:()=>[stv('wins'),200]},
  {id:'wc_saved',cat:9,name:'War Never Changes',desc:'Save Vault 13 on the Water Chip run.'},
  {id:'wc_100',cat:9,name:'Plenty to Drink',desc:'Save Vault 13 with 100 or more days of water left.'},
  {id:'wc_noskip',cat:9,name:'The Long Way Round',desc:'Save Vault 13 without skipping a single table.'},
  {id:'wc_gold',cat:9,name:'Vault-Tec Gold Star',desc:'Save Vault 13 on the Gold Road.'},
  {id:'wc_dry',cat:9,name:'Bone Dry',desc:'Run out of water on the Water Chip run.'},
  {id:'wc_junk',cat:9,name:'Junktown Justice',desc:'Win the Junktown boss table.'},
  {id:'wc_both',cat:9,name:'Both Sides of Junktown',desc:'Face both Killian and Gizmo, on different runs.'},
  {id:'wc_ufo',cat:9,name:'They Came From Above',desc:'Search the crashed flying saucer.'},
  {id:'wc_footprint',cat:9,name:'Something Big Passed Through',desc:'Search the giant footprint.'},
  {id:'wc_policebox',cat:9,name:'Bigger on the Inside',desc:'Find the blue police box before it vanishes.'},
  {id:'wc_harold',cat:9,name:'Bob Says Hi',desc:'Unlock Harold.'},
  {id:'wc_crew',cat:9,name:'The Old Crew',desc:'Have Ian, Tycho and Katja all join you.',prog:()=>[['ian','tycho','katja'].filter(id=>meta.gear.owned.includes(id)).length,3]},
  {id:'hands500',cat:8,name:'Pull Up a Stool',desc:'Play 500 hands.',prog:()=>[stv('hands'),500]},
];
let toastQ=[], toastOn=false, achSilent=false;
function unlock(id){
  if(!meta.ach)meta.ach={};
  if(meta.ach[id])return false;
  meta.ach[id]=Date.now();
  const a=ACH.find(x=>x.id===id);
  if(a){
    const n=achNCR(a),c=achCaps(a);
    if(n){meta.scrip=(meta.scrip||0)+n;}
    if(c){meta.capVouch=meta.capVouch||[];meta.capVouch.push({id,caps:c});}
    const t=achRewardText(a);
    if(!achSilent)toast(t?{...a,desc:`${a.desc} Reward: ${t}.`}:a);
  }
  return true;
}
function toast(a){toastQ.push(a);if(!toastOn)nextToast();}
function nextToast(){
  const a=toastQ.shift(); if(!a){toastOn=false;return;}
  toastOn=true;
  let el=document.getElementById('toast');
  if(!el){el=document.createElement('div');el.id='toast';el.className='toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el);}
  el.innerHTML=`<span class="medal" aria-hidden="true">★</span><span><small>${esc(a.label||'Achievement unlocked')}</small><b>${esc(a.name)}</b><em>${esc(a.desc)}</em></span>`;
  requestAnimationFrame(()=>el.classList.add('show'));
  let done=false;const hide=()=>{if(done)return;done=true;el.classList.remove('show');setTimeout(nextToast,400);};
  el.onclick=hide;el.title='Tap to dismiss';setTimeout(hide,3600);
}
function checkState(){
  const before=Object.keys(meta.ach||{}).length;
  if(!meta.ncrRetro){meta.ncrRetro=1;meta.ach=meta.ach||{};let n=0;for(const id of Object.keys(meta.ach))n+=ACH_NCR[id]||0;if(n)meta.scrip=(meta.scrip||0)+n;meta.achRetroNCR=n;} // achievements you'd already earned pay their NCR once
  if(typeof charUnlocked==='function')for(const c of ['snipsnip','threedog','benny'])if(charUnlocked(c))unlock(c);
  if(typeof charUnlocked==='function'&&charUnlocked('harold'))unlock('wc_harold');
  for(const c of (meta.stripBy||[]))if(ACH.some(a=>a.id==='strip_'+c))unlock('strip_'+c);
  if((meta.stripBy||[]).length>=5)unlock('strip_5');
  if(meta.gear){if(meta.gear.owned.some(id=>GEAR[id]&&GEAR[id].slot!=='comp'))unlock('gear1');if(meta.gear.owned.some(id=>GEAR[id]&&GEAR[id].slot==='comp'))unlock('comp1');}
  if((meta.legends||[]).length)unlock('leg_buy');
  if((meta.legendPlays||0)>=1)unlock('leg_play');
  if(runLive()&&meta.caps>=400)unlock('hoard250');
  if(runLive()&&(meta.run.gear||[]).length>=8)unlock('gear_full');
  if(meta.tutorialDone)unlock('tut_basics');
  if(meta.roadTutDone)unlock('tut_road');
  const cp=meta.classic.camp;
  if(cp&&((cp.cbeat||[]).length||cp.done||(cp.beaten||[]).length))unlock('camp_first');
  if(cp&&cp.done)unlock('camp_done');
  if(cp&&cp.career){
    if((cp.trophies||[]).some(t=>t.town==='goodsprings'))unlock('champ1');
    if((cp.trophies||[]).length>=3)unlock('trophy3');
    if((cp.cbeat||[]).some(x=>x.endsWith(':h')))unlock('highroller');
    if(Object.values(cp.rep||{}).some(n=>n>=10))unlock('legend');
    if(Object.values(cp.chal||{}).reduce((a,o)=>a+Object.keys(o).length,0)>=10)unlock('chal10');
    if((cp.tapes||[]).length>=6)unlock('tapes6');
    if((cp.plus||0)>=2)unlock('circuit2');
  }
  if(cp&&countsSize(cp.coll)>=120)unlock('collector');
  if(runLive()&&meta.caps>=250)unlock('hoard');
  if(typeof charUnlocked==='function'){if(charUnlocked('greg'))unlock('greg');if(charUnlocked('jeanita'))unlock('jeanita');}
  if(runLive()&&meta.perks.length>=5)unlock('loaded');
  if(meta.look&&(meta.look.back!=='sunburst'||meta.look.mat!=='leather'))unlock('style');
  if(meta.look&&meta.look.four)unlock('four');
  if(stv('hands')>=1)unlock('first_hand');
  if(stv('wins')>=1||meta.wins>0||meta.classic.wins>0)unlock('first_win');
  for(const a of ACH)if(a.prog){const [c,t]=a.prog();if(c>=t)unlock(a.id);}
  return Object.keys(meta.ach).length-before;
}
function achOnFinish(){
  const ov=G.over; if(!ov)return;
  const st=meta.st, won=ov.winner==='p', s=G.stats||{};
  st.hands++; if(won)st.wins++;
  unlock('first_hand');
  if(G.opp===-1)unlock('tut_basics');
  if(G.opp===-2)unlock('tut_road');
  if(won){
    unlock('first_win');
    const lanes=lanesResult(G);
    if(lanes.every(w=>w==='p'))unlock('sweep');
    if([0,1,2].some(l=>lanes[l]==='p'&&cvValue(G.p.cv[l])===26))unlock('exact26');
    if(!s.faces)unlock('clean');
    if(!s.discards&&!s.disbands)unlock('steady');
    if(s.disbands)unlock('burn');
    if(s.turns&&s.turns<=8)unlock('quick');
    if(s.turns>=40)unlock('long');
    if(G.mode==='classic'&&G.opp===3)unlock('classic_expert');
    if(G.mode==='campaign'&&(G.stake||0)>=500)unlock('all_in');
    if(G.mode==='road'&&G.opp>=0){
      if((G.ruleIds||[]).includes('sand'))unlock('blind');
      if(meta.caps-(ov.delta||0)+(G.wager||0)<=2)unlock('comeback');
    }
    if(ov.bountyWon){st.bounties++;unlock('bounty1');}
    const ul=G.usedLegends||[];
    if(ul.includes('fatman'))unlock('leg_fatman');
    if(ul.includes('yesman'))unlock('leg_yesman');
    if(G.mode==='road'&&G.char==='benny'){const R=G.rules;if([0,1,2].some(l=>{const pv=cvValue(G.p.cv[l]),av=cvValue(G.a.cv[l]);return pv===av&&lanes[l]==='p';}))unlock('benny_tie');}
  }
  checkState(); save();
}
function achOnMove(side,m,beforeA){
  if(side!=='p'||!G.stats)return;
  if(m.t!=='face')return;
  const c=m._card;
  if(c.rank==='K'){meta.st.kings++;const e=G[m.side].cv[m.lane][m.idx];if(e&&e.faces.filter(f=>f.rank==='K').length>=2)unlock('crown');}
  if(c.rank==='J'&&m.side==='a')meta.st.jacks++;
  if(c.rank==='JK'){const after=G.a.cv.reduce((n,cv)=>n+cv.length,0);if(beforeA-after>=3)unlock('wipe');if(beforeA-after>=5)unlock('wipe5');}
}
const achProgress=a=>{if(meta.ach[a.id]||!a.prog)return null;const [c,t]=a.prog();return {c:Math.min(c,t),t,f:Math.min(1,c/t)};};
function achRowHTML(a){
  const when=meta.ach[a.id],p=achProgress(a),rt=achRewardText(a);
  return `<div class="achrow${when?' got':''}"><span class="medal" aria-hidden="true">★</span><div><b>${esc(a.name)}</b><span>${esc(a.desc)}</span>${rt?`<span class="reward">Reward: ${esc(rt)}${when&&(meta.capVouch||[]).some(v=>v.id===a.id)?' · voucher not cashed in yet':''}</span>`:''}
    ${when?`<small>Earned ${new Date(when).toLocaleDateString()}</small>`:p?`<div class="achprog"><i style="width:${p.f*100}%"></i></div><small>${p.c} / ${p.t}</small>`:''}</div></div>`;
}
function renderAch(){
  const got=ACH.filter(a=>meta.ach[a.id]).length;
  const near=ACH.map(a=>[a,achProgress(a)]).filter(([,p])=>p&&p.f>0).sort((x,y)=>y[1].f-x[1].f).slice(0,4).map(([a])=>a);
  app.innerHTML=`
  <div class="mbar">${backBtn(achFrom,'Back')}<span class="pill num">${got} of ${ACH.length}</span></div>
  <section class="panel">
    <h2 style="font-size:28px">Achievements</h2>
    <p class="note">Hard feats pay NCR dollars for the Mojave Express, and some unlock packs, fonts, card faces and play mats. The harder the feat, the bigger the prize.</p>
    ${(meta.capVouch||[]).length?`<p class="note">You’re holding ${meta.capVouch.length} cap voucher${meta.capVouch.length>1?'s':''} worth ${meta.capVouch.reduce((n,v)=>n+v.caps,0)} caps. Cash one in at any trading post on The Road.</p>`:''}
    <div class="achbar" role="progressbar" aria-valuenow="${got}" aria-valuemin="0" aria-valuemax="${ACH.length}"><span style="width:${got/ACH.length*100}%"></span></div>
    ${near.length?`<h3 class="sub">Closest to unlocking</h3><div class="achlist">${near.map(achRowHTML).join('')}</div>`:''}
    ${ACH_CATS.map((cat,ci)=>`<h3 class="sub">${cat}</h3><div class="achlist">${ACH.filter(a=>a.cat===ci).map(achRowHTML).join('')}</div>`).join('')}
  </section>`;
}
let achFrom='home';
