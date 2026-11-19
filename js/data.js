const HOUSE={
  tight:{name:'Tight range',desc:'Caravans sell at 22–25.',apply:R=>{R.range.p=[22,25];R.range.a=[22,25];}},
  royal:{name:'Royal court',desc:'Kings triple instead of double.',apply:R=>{R.kingMult.p=3;R.kingMult.a=3;}},
  sand:{name:'Sandstorm',desc:'You can’t see the dealer’s totals.',apply:R=>{R.hideOpp=true;}},
  nojk:{name:'No Jokers',desc:'Jokers can’t be played.',apply:R=>{R.banned.push('JK');}},
  long:{name:'Long haul',desc:'Caravans sell at 24–30.',apply:R=>{R.range.p=[24,30];R.range.a=[24,30];}},
  stacked:{name:'Stacked house',desc:'The dealer holds 6 cards.',apply:R=>{R.hand.a=6;}},
  iron:{name:'Iron house',desc:'Your Jacks can’t touch the dealer’s cards.',apply:R=>{R.jackproof.a=true;}},
};
const ROAD=[
  {place:'Goodsprings',name:'Scrapper Jo-Jo',art:'scrapper-jojo',blurb:'Trades in junk, bets in junk, plays like junk. Pays up, though.',noise:30,extra:{J:2,Q:1,K:1}},
  {place:'Jean',name:'Deputy Rivet',blurb:'A rusty robot lawman still enforcing laws nobody remembers.',noise:24,extra:{J:2,Q:2,K:2}},
  {place:'Primm',name:'Mama Tallow',art:'mama-tallow',blurb:'Runs the roadside chow wagon. Feeds you first, fleeces you second.',noise:18,extra:{J:3,Q:2,K:2,JK:1}},
  {place:'Searchlight',name:'Preacher Isotope',blurb:'Glows faintly. Swears the cards speak to him.',noise:14,extra:{J:3,Q:2,K:3,JK:1}},
  {place:'Nelson',name:'Gus the Prospector',art:'gus',blurb:'Dug his deck out of a ghost mine. It’s still a little dusty.',noise:10,extra:{J:4,Q:2,K:3,JK:1}},
  {place:'Boulder City',name:'Sergeant Brick',art:'sergeant-brick',blurb:'Plays by the book. Most of the book got blown out in the war.',noise:7,extra:{J:4,Q:3,K:3,JK:2}},
  {place:'Henderson',name:'The Lizard King',blurb:'Hunts giant lizards. Tells you about it. Every. Single. Hand.',noise:5,extra:{J:4,Q:3,K:4,JK:2}},
  {place:'North Las Vegas',name:'Two-Bit Carver',blurb:'Raider bookie with a stacked sleeve and a smile to match.',noise:3,extra:{J:5,Q:3,K:4,JK:2}},
  {place:'Fremont Street',name:'Velvet Moreno',art:'velvet-moreno',blurb:'Lounge singer, card sharp, part-time knife thrower.',noise:1.5,extra:{J:5,Q:3,K:5,JK:2}},
  {place:'The Strip',name:'Silver Lou',art:'silver-lou',blurb:'The house dealer. The house always wins. Prove it doesn’t.',noise:0.5,extra:{J:5,Q:4,K:5,JK:3}},
];

const TUTORS={
  '-1':{place:'Practice table',name:'Old Ezra',blurb:'Teaches the rules of Caravan, one card at a time.',noise:40,extra:{J:1,Q:1,K:1},house:[]},
  '-2':{place:'Practice table',name:'Lucky Jo',blurb:'Shows you how the road works: house rules, perks, chems and bounties.',noise:30,extra:{J:2,Q:1,K:1},house:['royal']},
};
const TUTOR=TUTORS['-1'];
const CLASSIC_DEALERS=[
  {level:'Easy',name:'Sunday Sal',place:'Classic table',blurb:'Plays for the company.',noise:30,extra:{J:2,Q:1,K:1}},
  {level:'Normal',name:'Hank Delgado',place:'Classic table',blurb:'Knows the game. Knows you don’t.',noise:12,extra:{J:2,Q:2,K:2,JK:1}},
  {level:'Hard',name:'Rosa Quill',place:'Classic table',blurb:'Never wastes a Jack.',noise:4,extra:{J:3,Q:2,K:3,JK:2}},
  {level:'Expert',name:'The Cardsharp',place:'Classic table',blurb:'Nobody’s seen him lose.',noise:0.5,extra:{J:3,Q:3,K:3,JK:2}},
];
const OPP=()=>G.opp<0?TUTORS[G.opp]:G.mode==='classic'?CLASSIC_DEALERS[G.opp]:G.mode==='campaign'?(G.rita?RITA:G.cd?{...G.cd,house:[]}:{name:'A dealer',place:'On the circuit',noise:20,house:[]}):{...ROAD[G.opp],...(G.dealer||{}),house:[],noise:G.noise??ROAD[G.opp].noise};
const isClassicish=()=>G.mode==='classic'||G.mode==='campaign';

// Ready-made decks for the classic card buy.
const nums=(skip=[])=>baseNumbers().filter(c=>!skip.includes(c.rank));
const STARTERS={
  standard:{name:'Mojave Standard',desc:'Every number card plus a few of each face. Steady and forgiving.',build:()=>addFaces(nums(),{J:2,Q:2,K:2,JK:1})},
  royal:{name:'King’s Ransom',desc:'No Aces, 2s or 3s. Four Kings. Hits the sell range fast, busts if you’re careless.',build:()=>addFaces(nums(['A','2','3']),{J:2,Q:1,K:4,JK:1})},
  saboteur:{name:'Saboteur',desc:'No Aces, every Jack and both Jokers. Wins by wrecking the other side.',build:()=>addFaces(nums(['A']),{J:4,Q:1,K:1,JK:2})},
};
// Classic card buy
// New Vegas rule: no two copies of a card from the same set. A set is 52 cards + 2 Jokers.
const CL_BUDGET=160;
const deckLimitHTML=()=>{const n=packCount();return `<div class="explain">
  <p><b>Packs.</b> A pack is one of every card plus 2 Jokers, and it never has two identical cards. So your second J♠ has to come from a different pack than your first. In play, each card shows its own pack’s back.</p>
  <p><b>You own ${n} pack${n>1?'s':''}</b>: your starter deck${n>1?` plus ${n-1} earned pack${n>2?'s':''}`:''}. So you can have up to ${n} of any one card (same value and suit) and up to ${2*n} Jokers. Earn more packs through achievements.</p>
  ${packStrip()}
</div>`;};
function deckSummary(spec){
  const n=spec.filter(isNum).length,cnt=r=>spec.filter(c=>c.rank===r).length;
  const nr=[...new Set(spec.filter(isNum).map(c=>c.rank))];const miss=NUM_RANKS.filter(r=>!nr.includes(r));
  const face=[['J','Jack'],['Q','Queen'],['K','King'],['JK','Joker']].map(([r,w])=>cnt(r)?`${cnt(r)} ${w}${cnt(r)>1?'s':''}`:null).filter(Boolean);
  const lg=spec.filter(c=>c.legend).length;if(lg)face.push(`${lg} Legend card${lg>1?'s':''}`);
  return `${spec.length} cards: ${n} numbers${miss.length?` (no ${miss.map(r=>r==='A'?'Aces':r+'s').join(', ')})`:' (every number, all four suits)'}, ${face.join(', ')}.`;
}
// Packs: every card back you own is a pack. One copy of each card per pack (Jokers: two per pack).
// Your starter deck is one pack in any of the free designs. Each Wasteland collection back you earn is one more pack.
const starterBack=()=>{const L=meta&&meta.look;if(!L)return 'sunburst';const b=LOOKS.back.find(o=>o.id===L.back);if(b&&!b.art)return b.id;const st=LOOKS.back.find(o=>o.id===L.starter&&!o.art);return st?st.id:'sunburst';};
const earnedPacks=()=>LOOKS.back.filter(b=>b.art&&lookUnlocked(b)).map(b=>b.id);
const packList=()=>[starterBack(),...earnedPacks()];
const packCount=()=>packList().length;
const backName=id=>(LOOKS.back.find(b=>b.id===id)||{name:id}).name;
const capFor=k=>k==='JK'?2*packCount():packCount();
const packOf=(k,i,packs)=>packs[Math.min(packs.length-1,k==='JK'?Math.floor(i/2):i)];
function withPacks(spec,packs){const seen={};return spec.map(c=>{const k=keyOf(c),i=seen[k]||0;seen[k]=i+1;return {...c,pack:packOf(k,i,packs)};});}
function dealerPacks(name){const mine=meta&&meta.look&&meta.look.back;const free=LOOKS.back.filter(b=>!b.art&&b.id!==mine).map(b=>b.id);let h=0;for(const ch of String(name))h=(h*31+ch.charCodeAt(0))>>>0;const sig=free[h%free.length];return [sig,...shuffle(free.filter(x=>x!==sig))];}
const packDots=(k,n)=>{const ps=packList();return n?`<div class="packdots">${Array.from({length:n},(_,i)=>{const id=packOf(k,i,ps);return `<span class="packdot" data-back="${id}" title="${esc(backName(id))}"></span>`;}).join('')}</div>`:'';};
const packStrip=()=>`<div class="packstrip">${packList().map(id=>`<span class="packchip"><span class="packdot" data-back="${id}"></span>${esc(backName(id))}</span>`).join('')}</div>`;
function clPrice(rank){
  if(rank==='JK')return 8; if(rank==='K')return 6; if(rank==='J')return 5; if(rank==='Q')return 3;
  const v=rank==='A'?1:+rank; return v<=4?2:v<=7?3:4;
}
const keyOf=c=>c.rank+(c.suit||'');
const fromKeyC=k=>k==='JK'?{rank:'JK',suit:null}:{rank:k.slice(0,-1),suit:k.slice(-1)};
const specToCounts=spec=>{const m={};for(const c of spec){const k=keyOf(c);m[k]=Math.min(capFor(k),(m[k]||0)+1);}return m;};
const ALL_KEYS=[...SUITS.flatMap(su=>[...NUM_RANKS,'J','Q','K'].map(r=>r+su)),'JK'];
const fullSetCounts=()=>{const m={};for(const k of ALL_KEYS)m[k]=k==='JK'?2:1;return m;};
const countsToSpec=m=>Object.entries(m).flatMap(([k,n])=>Array.from({length:n},()=>fromKeyC(k)));
const countsCost=m=>Object.entries(m).reduce((s,[k,n])=>s+clPrice(fromKeyC(k).rank)*n,0);
const countsSize=m=>Object.values(m).reduce((a,b)=>a+b,0);
let buildDraft=null;
const numCount=m=>Object.entries(m).filter(([k])=>isNum(fromKeyC(k))).reduce((a,[,n])=>a+n,0);

// Cosmetics. Every item has an id; add unlock:{...} to an item later to gate it.
const LOOKS={
  font:[{id:'deco',name:'Deco'},{id:'pixel',name:'Pixel'},{id:'western',name:'Western'},{id:'typewriter',name:'Typewriter'},{id:'stencil',name:'Stencil'},{id:'classic',name:'Classic'},{id:'marker',name:'Marker'},{id:'atomic',name:'Atomic'}],
  face:[{id:'bone',name:'Bone'},{id:'sand',name:'Sun-bleached'},{id:'night',name:'Midnight'},{id:'contrast',name:'High contrast'}],
  // The first 11 are free designs for your starter deck. The art backs below are extra packs, earned through achievements.
  back:[{id:'sunburst',name:'Sunburst'},{id:'cap',name:'Bottle cap'},{id:'stripe',name:'Barber pole'},{id:'dusk',name:'Mojave dusk'},{id:'star',name:'Lone star'},
    {id:'blood',name:'Blood-spattered'},{id:'uranium',name:'Uranium glow'},{id:'cowhide',name:'Cowhide'},{id:'rust',name:'Rusted steel'},{id:'shot',name:'Shot up'},{id:'map',name:'Old trail map'},
    // Unlockable backs: art comes from the "cardbacks" folder (file name = id). unlock = achievement id.
    {id:'vault13',name:'Vault 13',art:true,unlock:'tut_basics'},
    {id:'goldencaps',name:'Golden Bottlecaps',art:true,unlock:'hoard'},
    {id:'nukacola',name:'Nuka Cola',art:true,unlock:'chems10'},
    {id:'tops',name:'The Tops',art:true,unlock:'wins10'},
    {id:'gomorrah',name:'Gomorrah',art:true,unlock:'comeback'},
    {id:'fisto',name:'FISTO',art:true,unlock:'quick'},
    {id:'sierramadre',name:'Sierra Madre',art:true,unlock:'exact26'},
    {id:'zeta',name:'Mothership Zeta',art:true,unlock:'wipe'},
    {id:'gnr',name:'Galaxy News Radio',art:true,unlock:'jeanita'},
    {id:'ultraluxe',name:'Ultra-Luxe',art:true,unlock:'all_in'},
    {id:'brotherhood',name:'Brotherhood of Steel',art:true,unlock:'camp_done'},
    {id:'lucky38',name:'Lucky 38',art:true,unlock:'road_strip'},
    {id:'dogmeat',name:'Dogmeat',art:true,unlock:'first_win'},
    {id:'tunnelsnakes',name:'Tunnel Snakes',art:true,unlock:'sweep'},
    {id:'uraniumfever',name:'Uranium Fever',art:true,unlock:'blind'},
    {id:'greatkhans',name:'Great Khans',art:true,unlock:'jacks25'},
    {id:'ncr',name:'NCR',art:true,unlock:'bounty10'},
    {id:'legion',name:'Caesar’s Legion',art:true,unlock:'wins50'},
    {id:'waterchip',name:'Water Chip',art:true,unlock:'wc_saved'},
    {id:'cathedral',name:'Children of the Cathedral',art:true,unlock:'wc_100'},
    {id:'junktown',name:'Junktown',art:true,unlock:'wc_both'}],
  mat:[{id:'leather',name:'Saddle leather'},{id:'felt',name:'Casino felt'},{id:'navy',name:'Midnight felt'},{id:'wood',name:'Barn wood'},{id:'desert',name:'Desert sand'}],
};
const lookUnlocked=item=>!item.unlock||!!(meta.ach&&meta.ach[item.unlock])||meta.look.unlocked.includes(item.id);
const backReward=achId=>LOOKS.back.find(b=>b.unlock===achId);
function applyLook(){
  {const b=LOOKS.back.find(o=>o.id===meta.look.back);if(!b||b.art||!lookUnlocked(b))meta.look.back=starterBack();}
  const L=meta.look, el=document.documentElement;
  el.dataset.font=L.font||'deco'; el.dataset.face=L.face; el.dataset.back=L.back; el.dataset.mat=L.mat; el.dataset.four=L.four?'1':'0';el.dataset.pip=L.pip?'1':'0';
}
let lookFrom='home';

const PERKS={
  wide:{name:'Wide Margin',desc:'Your caravans sell from 19 instead of 21.'},
  royal:{name:'Royal Blood',desc:'Your Kings multiply one step more: ×3 instead of ×2.'},
  steady:{name:'Steady Hands',desc:'Draw a card whenever you play a Queen.'},
  shark:{name:'Card Shark',desc:'You’re dealt 9 cards to open instead of 8.'},
  lead:{name:'Lead Lined',desc:'The dealer’s Jacks can’t touch your caravans.'},
  twotone:{name:'Two-Tone',desc:'Any card of the same color counts as matching suit for you.'},
  cool:{name:'Cool Head',desc:'Disbanding a caravan doesn’t use up your turn.'},
  roller:{name:'High Roller',desc:'Table winnings pay 50% more.'},
  hunter:{name:'Bounty Hunter',desc:'Bounties pay double.'},
};
const CHEMS={
  spy:{name:'Mentats',desc:'Sharper mind: see the dealer’s hand for the rest of the hand.'},
  coffee:{name:'Jet',desc:'Time slows down: your next play doesn’t end your turn.'},
  fresh:{name:'RadAway',desc:'Flush your hand: shuffle it back into your deck and draw a fresh one.'},
  shoe:{name:'Stimpak',desc:'Patch yourself up: draw 2 extra cards right now.'},
  buff:{name:'Buffout',desc:'Brute strength: Kings you play this hand multiply one step more (×2 becomes ×3).'},
  medx:{name:'Med-X',desc:'Numb to it: the dealer’s Jacks can’t touch your caravans for the rest of the hand.'},
};
const BOUNTIES={
  p26:{name:'Perfect 26',desc:'Win with a sold caravan at exactly 26.'},
  clean:{name:'Clean hands',desc:'Win without playing a face card.'},
  sweep:{name:'Clean sweep',desc:'Win by selling all three caravans.'},
  wild:{name:'Wild card',desc:'Win after playing a Joker.'},
  calm:{name:'No regrets',desc:'Win without discarding or disbanding.'},
  kings:{name:'Kingmaker',desc:'Win after playing two or more Kings.'},
};
const CHEM_MAX=3, START_CAPS=50, MIN_DECK=30, MIN_NUMS=24, SAVE_KEY='mojave-caravan-v1';

// ---------- Road characters ----------
const CHARS={
  vladmira:{name:'Vladmira',tag:'Vault strongwoman · slightly irradiated',bio:'Lifts engine blocks for fun. Talks her way into anything, reads her way into nothing.',
    traits:[]},
  nuke:{name:'Nuke Skywalker',tag:'Scientist & chemist',bio:'Can synthesize anything except confidence.',
    traits:[['+','Chemist','Carry up to 5 chems, and brew a free one after every win.'],['+','Probability Theory','You always see the next card you’ll draw.'],['−','Impostor Syndrome','Table winnings are 20% lower. He undersells himself.']]},
  chevy:{name:'Chevy Ford',tag:'Vault engineer & mechanic',bio:'If it moves, he fixed it. If it shouldn’t, he built a turret.',
    traits:[['+','Auto-Turret','Once per hand, shoot the top card off one of the dealer’s caravans. Uses your turn.'],['+','Tinkerer','One extra perk slot.'],['−','Union Dues','10% of table winnings go to the union.']]},
  ronald:{name:'Ronald Raygun',tag:'Distiller & radio host · Richmond, VA',bio:'Cooks rotgut in an oil-drum still and sells it live on air between call-in segments. Never met a jug, or a microphone, he didn’t like.',
    traits:[['+','Bootlegger','+3 caps after every table you win. The jug sells itself.'],['+','Sponsored Segment','Your first reroll at every trading post is free.']]},
  matt:{name:'Matt',tag:'Matt',bio:'Matt is here. Matt plays Caravan. The molerats seem to like him. That’s about it.',
    traits:[['=','Just Matt','No bonus. No drawback. Playing as Matt drains all the color out of the world.']]},
  greg:{name:'Greg',tag:'Big green mutant · gentle soul',bio:'Hulking, mustached and a little too friendly. Never goes anywhere without Alex, his doll and closest advisor.',locked:true,unlock:'Beat Greg at the Strip, playing as any starting character.',
    traits:[['+','Big Hands','Hold 6 cards instead of 5.'],['+','Bear Hug','Once per hand, hug the dealer. They skip their next turn recovering.'],['−','Gentle Giant','Your Jacks can’t touch the dealer’s cards. He doesn’t like being mean.']]},
  jeanita:{name:'Jeanita',tag:'Ghoul concierge',bio:'Was taking a reservation when the bombs dropped. Still at her post. The pantsuit has seen better centuries.',locked:true,unlock:'Beat Jeanita at the Strip, playing as Greg.',
    traits:[['+','Rad-Proof','Jokers can never remove your cards.'],['−','On Hold','Table winnings are 15% lower. Half her calls are still on hold.']]},
};
CHARS.snipsnip={name:'Snip Snip',tag:'Mr. Handy surgical unit',bio:'Three eyes, three arms, one setting: surgery. Very enthusiastic about trimming things. Including caravans.',locked:true,unlock:'Win a run without using a single chem.',
  traits:[['+','Self-Repair','Once per hand, take back your last turn, and the dealer’s reply with it.'],['+','Spare Parts','When the dealer’s Jack knocks one of your cards off, it comes back to your hand.'],['−','No Organics','He’s a robot. He can’t carry or use chems.']]};
CHARS.threedog={name:'Three Dog',tag:'Galaxy News Radio DJ',bio:'Ow-ooooo! The voice of the Capital Wasteland, fighting the good fight one card at a time, live on air.',locked:true,unlock:'Beat the Strip with three different characters.',
  traits:[['+','Request Line','Once per hand, swap a card in your hand for the top card of your deck. Doesn’t use your turn.'],['+','The Good Fight','Every boss you beat pays 2 extra NCR dollars.'],['−','Public Enemy','Every boss table has one extra boss rule. Talon Company listens to the radio too.']]};
CHARS.benny={name:'Benny',tag:'Chairmen boss · checkered suit',bio:'Ring-a-ding-ding, baby. Smooth talker, sharp dresser, and he’s holding a chip that isn’t his.',locked:true,unlock:'Beat the Strip on the Silver Road or harder.',
  traits:[['+','Ring-a-Ding-Ding','Ties go to Benny: if your caravan matches the dealer’s, you sell it.'],['+','The Platinum Chip','Starts every run with the Platinum Chip Legend card in his deck.']]};
CHARS.vaultdweller={name:'Vault Dweller',tag:'Vault 13 · blue and gold',bio:'Born and raised underground. Sent out with a canteen and a deadline to save everyone they know.',locked:true,unlock:'Save Vault 13 on the Water Chip run.',
  traits:[['+','Tag Skills','At the start of every run, choose 1 of 3 perks for free.'],['+','Vault Rations','A free Saddlebag bundle at every trading post.'],['−','Fresh Out of the Vault','Starts every run with 5 fewer caps.']]};
CHARS.harold={name:'Harold',tag:'Ghoul · has a tree named Bob',bio:'An old ghoul with a tree growing out of his head. He named it Bob. They get along.',locked:true,unlock:'On the Water Chip run, beat Set at Necropolis without losing a table.',
  traits:[['+','Bob the Tree','Once per hand, regrow the last card the dealer knocked off your caravans.'],['+','Rad-Rich','Neon cards pay double.'],['−','Old Bones','Holds 4 cards instead of 5.']]};
const CHAR_ORDER=['vladmira','nuke','chevy','ronald','matt','snipsnip','threedog','benny','vaultdweller','harold','greg','jeanita'];
const CHAR_BIO={
  vladmira:{stats:[10,3,7,9,2,4,5],quote:'You want to arm-wrestle for it? No? Then deal.',
    story:'Born and raised in a sealed vault, Vladmira spent her teens hauling reactor coolant by hand. That explains the arms, and the faint green glow. When the doors finally opened she walked out first and hasn’t stopped talking since. Folks can’t say no to her, mostly because they can’t get a word in.'},
  nuke:{stats:[2,7,4,3,10,5,7],quote:'Statistically, I’ll lose. Sorry in advance.',
    story:'Nuke ran the vault’s chemistry lab, mixing floor cleaner, cough syrup and the occasional explosive. He can calculate the odds of any card coming up, but not why anybody would want him at their table. Carries a flask of something green. Won’t say what.'},
  chevy:{stats:[6,4,8,5,7,6,4],quote:'If it ain’t broke, I ain’t been paid yet.',
    story:'Chevy spent twenty years keeping the vault’s generators alive with spit, wire and stubbornness. Out in the wasteland he’s never without a wrench, a toolbox and a folding turret he swears is for “home defense.” He plays cards like he fixes engines: patiently, then all at once.'},
  ronald:{stats:[5,4,6,10,6,3,7],quote:'You’re listening to WRAY, the last signal on the James River. This hand is brought to you by Raygun’s Reserve.',
    story:'Ronald Raygun stirs his mash in a rusted oil drum behind a collapsed tobacco warehouse on the James River, and broadcasts a pirate radio show out of the same shack. The Raygun Hour is mostly wasteland news, call-ins and ads for his own moonshine, which comes in a jug with a skull on it for legal reasons. He came west in the same battered hat and coat, chasing a bigger audience and a thirstier market. He found both at the card tables.'},
  matt:{stats:[5,5,5,5,5,5,5],quote:'Yeah. Okay. Sure.',
    story:'Matt grew up somewhere. He had a job, then a different job. Now he sits on a crate behind a scrap fence, holding a stick, while a family of molerats goes about its day around him. They’ve stopped noticing him. Most people have. When he walks into a room, the color quietly leaves it. Nobody knows why Matt is on the Road. Matt doesn’t really know either.'},
  greg:{stats:[10,2,10,8,4,4,6],quote:'Alex says you look like a good friend.',
    story:'Nobody’s sure where Greg came from, including Greg. He’s eight feet of green muscle with the manners of a church usher and a mustache he combs twice a day. Alex, a hand-stitched doll with yarn hair, offers advice on every hand. Greg always listens.'},
  jeanita:{stats:[2,10,8,6,8,5,7],quote:'Front desk, how may I direct your call? …Please hold.',
    story:'Jeanita was manning the front desk of a swanky hotel, a phone on each ear, when the bombs fell. The receivers fused to her head, the pantsuit held together (mostly), and she never left her post. Two centuries of overhearing every guest have made her the best-informed player in the wasteland. She staples her hair back on every morning before her shift.'},
};
CHAR_BIO.snipsnip={stats:[5,7,8,2,8,8,4],quote:'Snip snip! Hold still, this won’t hurt. Much.',
  story:'Snip Snip came off the line as a top-of-the-range surgical Mr. Handy, three arms of scalpels, saws and a bonesaw that hums when he’s happy. Two centuries without a patient have made him very, very eager. He took up Caravan because a caravan, like a patient, always has something you can take off.'};
CHAR_BIO.threedog={stats:[4,6,5,10,7,4,8],quote:'Ow-ooooo! This is Three Dog, and you’re listening to Galaxy News Radio!',
  story:'Three Dog has been telling the truth to the Capital Wasteland one broadcast at a time, playing the same handful of records between news of who’s winning and who’s getting shot. He came west chasing a story about a card game on the Strip, and figured he might as well sit down and play it.'};
CHAR_BIO.benny={stats:[3,6,3,10,7,9,8],quote:'Ring-a-ding-ding, baby. The house always wins, and tonight I’m the house.',
  story:'Benny runs the Chairmen out of the Tops, wears a checkered suit you can see from orbit, and carries a platinum chip that a certain courier would very much like back. He plays Caravan the way he does business: all charm up front and a knife behind the back.'};
CHAR_BIO.vaultdweller={stats:[5,6,5,5,7,6,6],quote:'The Overseer said 150 days. I’m going to need about 149 of them.',
  story:'The Vault Dweller had never seen the sky until the vault door rolled open. Now they have a canteen, a Pip-Boy 2000, a blue jumpsuit with a big yellow 13 on the back, and a whole vault counting on them. They learned Caravan from a trader in Shady Sands and turned out to be annoyingly good at it.'};
CHAR_BIO.harold={stats:[4,6,10,7,8,4,5],quote:'Don’t mind Bob. He’s friendly.',
  story:'Harold has been wandering the wasteland since before most people were born, getting a little greener and a little leafier every year. The tree on his head is named Bob. Harold talks to Bob. Bob, so far, has not talked back, which Harold takes as a sign of good manners.'};
const ORIGINALS=['vladmira','nuke','chevy','ronald','matt'];
// Rival roster: who you meet on the Road depends on who you play.
const RIVALS={
  vladmira:{blurb:'Arm-wrestles the dealer between hands. Wins those too.',rule:'Strong Back: her caravans sell up to 27.',fn:R=>{R.range.a=[R.range.a[0],R.range.a[1]+1];}},
  nuke:{blurb:'Mutters probabilities. Apologizes every time he wins.',rule:'Over-Prepared: holds one extra card.',fn:R=>{R.hand.a+=1;}},
  chevy:{blurb:'Bolted a turret to the card table. It’s “just for show.”',rule:'Turret Nest: your Jacks can’t touch his caravans.',fn:R=>{R.jackproof.a=true;}},
  ronald:{blurb:'Brought his still to the table. Narrates the whole hand like it’s on the radio.',rule:'Rotgut Royalty: his Kings triple.',fn:R=>{R.kingMult.a=3;}},
  matt:{blurb:'It’s Matt. A molerat is sitting in his lap. The room goes gray while you play him.',rule:'None. He’s just Matt.',fn:R=>{}},
  greg:{blurb:'The final table. Greg just wants to be friends. Alex is keeping score.',rule:'Big Hands: holds one extra card. Gentle Giant: his Jacks can’t touch yours.',fn:R=>{R.hand.a+=1;R.jackproof.p=true;}},
  jeanita:{blurb:'Her receivers crackle with every card you hold. She already knows.',rule:'Rad-Proof: Jokers can’t remove her cards. Party Line: holds one extra card.',fn:R=>{R.jokerproof.a=true;R.hand.a+=1;}},
};
const NEWCOMERS=['snipsnip','threedog','benny','vaultdweller','harold'];
RIVALS.vaultdweller={blurb:'Fresh out of the vault and squinting at the sun. Plays by the book.',rule:'Vault-Tec Training: holds one extra card.',fn:R=>{R.hand.a+=1;}};
RIVALS.harold={blurb:'Talks to the tree on his head between hands. The tree seems to be winning.',rule:'Bob the Tree: his caravans sell up to 27.',fn:R=>{R.range.a=[R.range.a[0],R.range.a[1]+1];}};
RIVALS.snipsnip={blurb:'Hovers over the table humming to himself. Every so often a scalpel twitches.',rule:'Precision: his caravans sell up to 27.',fn:R=>{R.range.a=[R.range.a[0],R.range.a[1]+1];}};
RIVALS.threedog={blurb:'Broadcasting the hand live. The whole wasteland is listening.',rule:'Request Line: holds one extra card.',fn:R=>{R.hand.a+=1;}};
RIVALS.benny={blurb:'Flips a platinum chip between his fingers. Smiles too much.',rule:'Ring-a-Ding-Ding: his Kings triple.',fn:R=>{R.kingMult.a=3;}};
const CHAR_UNLOCK={
  greg:()=>(meta.stripBy||[]).some(c=>ORIGINALS.includes(c)||NEWCOMERS.includes(c)||c==='none'),
  jeanita:()=>(meta.stripBy||[]).includes('greg'),
  snipsnip:()=>!!(meta.charFlags||{}).noChem,
  threedog:()=>new Set((meta.stripBy||[]).filter(c=>CHARS[c])).size>=3,
  benny:()=>!!(meta.charFlags||{}).silver,
  vaultdweller:()=>!!(meta.charFlags||{}).vault,
  harold:()=>!!(meta.charFlags||{}).harold,
};
const charUnlocked=id=>CHAR_UNLOCK[id]?CHAR_UNLOCK[id]():true;
const isChar=id=>meta&&meta.char===id;
const chemMax=()=>chemCap(specialChar());
const disc=n=>{let m=SPX.discount(sp('C'));if(runLive()){const r=meta.run;if(r.halfShop)m*=0.5;if(r.tier==='gold')m*=1.25;}return Math.max(1,Math.ceil(Math.round(n*m*1000)/1000));};   // rounded first: 100*1.1 is 110.00000000000001
const runLive=()=>!!(meta&&meta.run&&meta.run.phase!=='over');
const winMult=()=>isChar('nuke')?0.8:isChar('chevy')?0.9:isChar('jeanita')?0.85:1;

const pick=a=>a[Math.floor(Math.random()*a.length)];
const perkSlots=()=>runLive()?3+(meta.run.stop>=3?1:0)+(meta.run.stop>=4?1:0)+(isChar('chevy')?1:0):2+(meta.beaten.length>=4?1:0)+(meta.beaten.length>=8?1:0)+(isChar('chevy')?1:0);
const has=id=>(runLive()?meta.perks:meta.equipped).includes(id);
const chemTotal=()=>Object.values(meta.chems).reduce((a,b)=>a+b,0);

const rangeTxt=r=>`${r[0]}–${r[1]}`;

