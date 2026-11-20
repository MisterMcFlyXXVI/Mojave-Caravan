// =====================================================================
// THE ROAD: run-based roguelite
// =====================================================================
const NV_STOPS=[0,2,4,5,8,9]; // ROAD indices: Goodsprings, Primm, Nelson, Boulder City, Fremont Street, The Strip
const WC_IDX=[0,2,4,5,6,8,9];  // The Water Chip: seven stops, difficulty borrowed from these ROAD tables
let RUN_STOPS=NV_STOPS;
const isWC=()=>!!(meta&&meta.run&&meta.run.special==='waterchip');
function syncRoute(){RUN_STOPS=isWC()?WC_IDX:NV_STOPS;}
// ---- The Water Chip (Fallout 1 special run) ----
const WC_DAYS=150,WC_COST=[6,8,10],WC_SKIP=3;
const wcCost=t=>Math.max(2,WC_COST[t]-SPX.wcDays(sp('E')));
const WC_ROUTE=[
  {place:'Vault 15',name:'Garl',art:'garl',blurb:'Leader of the Khans. Took over the ruins of Vault 15 and deals like he’s already won.',rule:'Khan Raiders: his caravans sell up to 27.',fn:R=>{R.range.a=[R.range.a[0],R.range.a[1]+1];},drop:'redryder'},
  {place:'Shady Sands',name:'Tandi',art:'tandi',blurb:'Aradesh’s daughter. Sharp, stubborn, and tired of being rescued.',rule:'Stubborn: she holds 6 cards.',fn:R=>{R.hand.a=Math.max(R.hand.a,6);},comp:'ian'},
  {place:'Junktown',junk:true,comp:'tycho'},
  {place:'The Hub',name:'Decker',art:'decker',blurb:'Runs the Hub’s underworld from the back of the Maltese Falcon.',rule:'Loaded Deck: he opens every hand with 9 cards.',fn:R=>{R.deal.a=Math.max(R.deal.a,9);},drop:'plasma'},
  {place:'Necropolis',name:'Set',art:'set',blurb:'Ghoul ruler of the City of the Dead. Patient. Very, very patient.',rule:'Dead Hand: your 2s and 3s can’t be played.',fn:R=>{R.dead.p=['2','3'];},comp:'katja'},
  {place:'Mariposa',name:'The Lieutenant',art:'lieutenant',blurb:'Runs the Master’s dipping vats. Has no use for vault dwellers.',rule:'Super Mutant Hide: your Jacks can’t touch his caravans.',fn:R=>{R.jackproof.a=true;},drop:'powerarmor'},
  {place:'The Cathedral',name:'The Master',art:'master',blurb:'Once a man. Now a mass of flesh and machinery speaking in many voices.',rule:'Many Voices: one of his rules changes every few turns.',fn:R=>{},drop:'waterchip',final:true},
];
const WC_JUNK={
  killian:{name:'Killian Darkwater',art:'killian',blurb:'Runs the general store and the law in Junktown. Plays it straight.',rule:'Clean Game: nobody can play Jokers.',fn:R=>{R.banned.push('JK');}},
  gizmo:{name:'Gizmo',art:'gizmo',blurb:'Owns the casino, and most of Junktown with it. Sweats a lot.',rule:'House Kings: his Kings multiply ×3.',fn:R=>{R.kingMult.a=3;}},
};
const wcBoss=s=>{const st=WC_ROUTE[s];if(!st)return null;if(st.junk){const j=WC_JUNK[(run()&&run().junk)||'gizmo'];return {...j,place:st.place};}return st;};
const MASTER_POOL=['noking','noqueen','nojack','mirror','greedy','tight','long','light'];
const TABLE_KIND=['Saloon table','High Stakes table','Boss table'];
// Beyond the Strip: endless stops after a won run. Loops with rising difficulty.
const BEYOND=[
  {place:'Red Rock Canyon',name:'Smoke-Sister Vey',art:'vey',blurb:'Reads your fortune in the campfire, then takes it.'},
  {place:'Jacobstown',name:'Big Tom the Gentle',art:'big-tom',blurb:'A super mutant with reading glasses and a library card. Plays slow, never wrong.'},
  {place:'Black Mountain',name:'The Voice on the Mountain',art:'voice',blurb:'Deals over the radio. You never see a hand, only the result.'},
  {place:'The Divide',name:'The Dust Prophet',art:'dust-prophet',blurb:'Walked out of the storm wearing someone else’s face.'},
  {place:'Big Mountain',name:'Professor Static',art:'professor-static',blurb:'A brain in a jar with a robot arm. Shuffles with lasers.'},
  {place:'Zion Canyon',name:'Burned Ezekiel',art:'ezekiel',blurb:'Wrapped in bandages, quoting scripture, cheating politely.'},
  {place:'The Sierra Madre',name:'The Ghost Croupier',art:'ghost-croupier',blurb:'The casino died two hundred years ago. Nobody told her.'},
  {place:'Hoover Dam',name:'Colonel Ash',art:'colonel-ash',blurb:'Both armies want this table. He’s been holding it for both.'},
];
const inBeyond=s=>s>=RUN_STOPS.length;
const placeOf=s=>isWC()?(WC_ROUTE[Math.max(0,Math.min(s,WC_ROUTE.length-1))].place):inBeyond(s)?BEYOND[(s-RUN_STOPS.length)%BEYOND.length].place:ROAD[RUN_STOPS[s]].place;
const riOf=s=>RUN_STOPS[Math.min(s,RUN_STOPS.length-1)];
const mileOf=s=>s-RUN_STOPS.length+1;
// ---------- Road story ----------
const PROLOGUE={
  vladmira:'Vladmira laces her boots, shoulders a pack heavier than most people, and squints at the road east. “Six stops to the Strip. I have walked farther for worse reasons.”',
  nuke:'Nuke Skywalker checks the still in his backpack, sniffs a bottle, and puts it back. “Vegas has the best chemistry sets in the Mojave. Also cards, I guess.”',
  chevy:'Chevy Ford kicks the tire of a car that hasn’t run in two hundred years, for luck. Then he starts walking. “Turret’s loaded. Deck’s shuffled. Let’s roll.”',
  ronald:'Ronald Raygun clears his throat into a handheld mic. “Good morning, wasteland! This is WRAY, coming to you live from the road to Vegas. Tonight’s program: me, winning.”',
  matt:'Matt looks at the road. The road looks at Matt. Somewhere a molerat sighs. “Okay,” says Matt, and starts walking.',
  greg:'Greg sets Alex the doll on his shoulder so she can see. “Big trip, Alex. We play nice. We win nice.” Alex says nothing, supportively.',
  jeanita:'Jeanita straightens her concierge vest, checks her reflection in a broken window, and winces. “Checking out early, darling. Vegas has a vacancy with my name on it.”',
};
PROLOGUE.vaultdweller='The Vault Dweller blinks at the open sky, adjusts the Pip-Boy, and takes a first careful step onto actual dirt. “Okay. Cards. I can do cards.”';
PROLOGUE.harold='Harold pats the tree on his head. “Come on, Bob. Long road. Lots of card tables. You like card tables.” Bob rustles, possibly in agreement.';
PROLOGUE.snipsnip='Snip Snip polishes all three eyes, sharpens all three arms, and hovers toward the horizon. “Six stops to the Strip! Plenty of patients along the way. Snip snip!”';
PROLOGUE.threedog='Three Dog taps the mic. “Ow-ooooo! Wasteland, this is Three Dog, broadcasting from the road to Vegas. Stay tuned, ‘cause your favorite DJ is about to win some caps.”';
PROLOGUE.benny='Benny straightens his checkered lapels and flips the platinum chip. “Six stops, baby. Easy money. What’s the worst that could happen?” Somewhere behind him, someone in a courier’s coat is following his tracks.';
const EPILOGUE={
  vladmira:'The High Table goes quiet as Vladmira lays down the last card. She sets her pack down for the first time in six stops. “Now,” she says, “I would like a very large breakfast.”',
  nuke:'Nuke toasts his win with something that glows. The pit boss asks what’s in it. “Science,” says Nuke, and it is the last thing anyone remembers clearly.',
  chevy:'Chevy pockets the pot and pats his turret. “Told you, baby. Vegas or bust.” Somewhere outside, the old car he kicked for luck finally starts.',
  ronald:'“And that’s the ballgame, folks!” Ronald is broadcasting from the winners’ table, and every radio on the Strip is tuned in. Sales of Raygun’s Reserve triple overnight.',
  matt:'Matt wins. The color doesn’t come back, exactly. But for a second, the neon looks a little pink. “Huh,” says Matt.',
  greg:'Greg wins the Strip and the crowd doesn’t run away, for once. Alex gets a seat of honor at the bar. Greg orders her a milk.',
  jeanita:'Jeanita takes the pot and the penthouse. “Room service,” she purrs into the phone, “send up everything.” For the first time in two hundred years, someone else carries the bags.',
};
EPILOGUE.vaultdweller='The Vault Dweller lays down the winning card and grins. Two hundred years underground, and the vault never taught them this. The wasteland did.';
EPILOGUE.harold='Harold wins the last hand and tips his hat. Bob drops a single leaf on the table, which the pit boss decides to count as a tip.';
EPILOGUE.snipsnip='Snip Snip lays down the winning card with surgical precision. “Operation successful!” The pit boss asks if he does house calls. All three eyes light up.';
EPILOGUE.threedog='“You heard it here first, wasteland: Three Dog just beat the Strip!” Every radio on the Strip crackles to life with the news. Ow-ooooo!';
EPILOGUE.benny='Benny rakes in the pot and lights a cigarette. “Ring-a-ding-ding.” He’s gone before anyone checks whose chips he walked in with.';
const BEYOND_INTRO='The Strip is behind you, but the road keeps going. Past the lights, the Mojave is full of tables nobody talks about, run by dealers nobody beats. Every stop out here is meaner than the last. How far can you get?';
const RIVAL_TAUNT={
  vladmira:'“You walked all this way to lose to me? Is very efficient of you.”',
  nuke:'“I brewed something special for this hand. Don’t worry, it’s mostly for me.”',
  chevy:'“Turret says you’re outgunned. Turret’s never wrong.”',
  ronald:'“Folks at home, our challenger looks nervous. Stay tuned, this is gonna be ugly.”',
  matt:'“Hey.” That’s all Matt says. The room goes gray.',
  greg:'Greg sets Alex down to watch. “Alex says good luck. Alex is lying.”',
  jeanita:'“Your table is ready, darling. I’m afraid it’s the losing one.”',
};
RIVAL_TAUNT.vaultdweller='“The Overseer said to be polite. He didn’t say I had to let you win.”';
RIVAL_TAUNT.harold='“Bob says you look nervous. Bob’s usually right.”';
RIVAL_TAUNT.snipsnip='“Oh, a new patient! Lie down on the table. The card table. Snip snip!”';
RIVAL_TAUNT.threedog='“Folks, I’m live at the table with our challenger. Let’s all wish ‘em luck. They’re gonna need it.”';
RIVAL_TAUNT.benny='“Truth is, the game was rigged from the start, baby.”';
const RADIO=[
  'This is WRAY, the voice of the long road. Weather out of {next}: dust, then more dust, then a card game.',
  'Word on the wire: somebody named {char} cleaned out the tables in {last}. Dealers up the road are sharpening their decks.',
  'Raygun here with a public service announcement: never play Caravan with a man who keeps a deck in his boot. It’s always in the other boot.',
  'Caravan tip of the hour: a King on a 10 is twenty. Two Kings is forty. Forty is a bust. You’re welcome.',
  'Reports of a two-headed brahmin running for mayor of {next}. Polls show both heads leading.',
  'A listener in {last} writes in: “Is it cheating if the Joker is on my side?” Ma’am, the Joker is on nobody’s side.',
  'Up next on WRAY: twelve minutes of a man humming, sponsored by Raygun’s Reserve. Smooth as radiation.',
  'Traders say {next} pays good caps at the tables tonight. Traders also say the snakes there bite twice.',
  'News from the Strip: the High Table is still waiting for a winner. Today’s odds on {char}? The house isn’t saying.',
  'Lost: one bottle cap, slightly bent, great sentimental value. If found, keep it. That’s how caps work.',
  'Raygun’s Reserve: aged in a barrel, a bathtub and a hubcap. The Mojave’s finest. Now with fewer teeth.',
  '{char}, if you’re listening: the dealer in {next} heard you’re coming. He bought new cards. They look sharp.',
  'The NCR reminds travelers: gambling on duty is prohibited. The NCR also reminds travelers: nobody’s on duty right now.',
  'Weather update: clear skies, light radiation, chance of losing your shirt at {next}.',
  'Quick reminder from the WRAY legal department, which is a dog named Lawyer: all bets are final. Woof.',
  'That’s the news. Here’s a song about a cowboy who lost his horse at cards and won it back with a Queen. True story. Mostly.',
];
const radioLine=s=>{const r=run(),line=RADIO[(hashStr(String(r.started)+s))%RADIO.length];return line.replace(/\{char\}/g,CHARS[r.char].name).replace(/\{next\}/g,placeOf(s)).replace(/\{last\}/g,placeOf(Math.max(0,s-1)));};
function runStoryHTML(){
  const r=run();if(!r||!r.story||!r.story.length)return '';const st=r.story[0];
  return `<div class="overlay"><div class="panel result storycard" role="dialog" aria-label="${esc(st.title)}">
    <div class="tapehead">◉ ${esc(st.title)}</div>${st.text.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join('')}
    <button class="btn hot" data-runstoryok>Continue</button></div></div>`;
}
const DECKS=[
  {id:'plain',name:'Plain Deck',twist:'No twist. A standard 54-card deck.'},
  {id:'sarsaparilla',name:'Sarsaparilla-Soaked',twist:'Sticky Fingers: every discard costs 1 cap.'},
  {id:'blood',name:'Blood-Stained',twist:'Blood Money: every Jack you play costs 2 caps.'},
  {id:'scorched',name:'Scorched',twist:'Burnt Up: 6 random face cards are lost before the run starts.'},
  {id:'irradiated',name:'Irradiated',twist:'Rad Sickness: you open every hand with 7 cards instead of 8.'},
  {id:'rust',name:'Rust-Pitted',twist:'Seized Up: rerolls cost double and cards cost 1 cap more.'},
  {id:'bullet',name:'Bullet-Riddled',twist:'Outgunned: every dealer opens with an extra card.'},
  {id:'gold',name:'Gold-Plated',twist:'Gilded Cage: no interest, and every boss has an extra rule.'},
];
const TIERS=[
  {id:'copper',name:'Copper Road',desc:'The standard run.'},
  {id:'silver',name:'Silver Road',desc:'Sharper dealers, an extra rule on every boss, and fewer starting caps.'},
  {id:'gold',name:'Gold Road',desc:'Everything on Silver, plus a rule on every table, pricier shops and less interest.'},
];
// ---- Mojave Express office: NCR dollars and the loadout you keep between runs ----
// NCR dollars are earned on every Road table you win and on every run, won or lost. It never goes away.
const GEAR_SLOTS=[
  {id:'head',name:'Headwear'},{id:'coat',name:'Coat'},{id:'pants',name:'Pants'},{id:'shoes',name:'Shoes'},
  {id:'gun',name:'Gun'},{id:'melee',name:'Melee'},{id:'throw',name:'Throwable'},{id:'comp',name:'Companion'},
];
const GEAR={
  hat:{slot:'head',name:'Desperado Hat',price:45,sp:{C:1},desc:'The first boss you beat each run gives you back 1 Grit (up to 2).'},
  lamp:{slot:'head',name:'Prospector’s Headlamp',price:30,sp:{P:2},desc:'Every bundle you open has at least one upgraded card in it.'},
  beret:{slot:'head',name:'Ranger Beret',price:50,sp:{P:1,A:1,E:1},desc:'The dealer opens every hand with 7 cards instead of 8.'},
  duster:{slot:'coat',name:'Dusty Duster',price:15,sp:{E:1},desc:'Dust in their eyes: the dealer’s first play each hand is a random one.'},
  labcoat:{slot:'coat',name:'Lab Coat',price:30,sp:{I:1},desc:'Every chem you use also draws you a card.'},
  armor:{slot:'coat',name:'Leather Armor',price:45,sp:{E:2,A:-1},desc:'The dealer can’t play Queens on your caravans.'},
  jeans:{slot:'pants',name:'Patched Jeans',price:15,sp:{A:1},desc:'Glass cards never break.'},
  cargo:{slot:'pants',name:'Cargo Pants',price:30,sp:{S:1},desc:'+3 caps every time you reach a new stop.'},
  chaps:{slot:'pants',name:'Road Chaps',price:40,sp:{E:1,L:1},desc:'Selling all three caravans pays double the bonus.'},
  boots:{slot:'shoes',name:'Cowboy Boots',price:15,sp:{C:1},desc:'Skipping a table pays 5 caps on top of its reward.'},
  sneakers:{slot:'shoes',name:'Pre-War Sneakers',price:35,sp:{A:2},desc:'Once per stop, walk away from a table you’re losing. It counts as a loss but costs no Grit.'},
  combat:{slot:'shoes',name:'Combat Boots',price:45,sp:{E:1,S:1},desc:'Boss tables have one fewer boss rule.'},
  varmint:{slot:'gun',name:'Varmint Rifle',price:20,sp:{P:1},desc:'Pest control: the dealer can’t play Jokers at all.'},
  sawedoff:{slot:'gun',name:'Sawed-Off Shotgun',price:35,sp:{S:2,P:-1},desc:'Playing a Jack doesn’t use your turn.'},
  revolver:{slot:'gun',name:'Lucky Revolver',price:50,sp:{L:2},desc:'Lucky cards draw 2 cards instead of 1.'},
  knife:{slot:'melee',name:'Combat Knife',price:15,sp:{A:1},desc:'Two random number cards start the run Steel.'},
  machete:{slot:'melee',name:'Machete',price:30,sp:{S:1},desc:'Cuts the deadwood: up to 4 Aces and 2s are cut from your starting deck.'},
  bat:{slot:'melee',name:'Louisville Slugger',price:40,sp:{S:2},desc:'Once per hand, knock the top card off one of your own caravans. Doesn’t use your turn.'},
  frag:{slot:'throw',name:'Frag Grenade',price:15,sp:{S:1},desc:'Start every run with an extra Joker in your deck.'},
  nuka:{slot:'throw',name:'Nuka-Grenade',price:35,sp:{L:1},desc:'Two random number cards start the run Glass.'},
  dynamite:{slot:'throw',name:'Dynamite',price:50,sp:{S:1,I:1},desc:'Your Jokers on the dealer’s caravans blow up the card they land on, too.'},
  dogmeat:{slot:'comp',name:'Dogmeat',price:30,sp:{P:1},desc:'Good boy. Sniffs out 1 extra card in every bundle you open.'},
  codsworth:{slot:'comp',name:'Codsworth',price:35,sp:{I:1},desc:'Tidies up: once per hand, a discard doesn’t use your turn.'},
  piper:{slot:'comp',name:'Piper',price:40,sp:{C:1,I:1},desc:'Rattles the dealer with questions: they hold 1 fewer card.'},
  cass:{slot:'comp',name:'Cass',price:45,sp:{C:1,L:1},desc:'Crimson Caravan connections: the trading post stocks 1 extra card.'},
  fawkes:{slot:'comp',name:'Fawkes',price:50,sp:{S:2},desc:'Stands guard: the dealer can’t play Kings on your caravans.'},
  ede:{slot:'comp',name:'ED-E',price:50,sp:{P:2},desc:'Once per hand, zap a random card out of the dealer’s hand. Doesn’t use your turn.'},
  boone:{slot:'comp',name:'Boone',price:60,sp:{P:2,A:1},desc:'Once per hand, shoot the newest King or Queen off a dealer caravan. Uses your turn.'},
  nick:{slot:'comp',name:'Nick Valentine',price:55,sp:{I:1,P:1},desc:'Detective work: you always know the next card the dealer will draw.'},
  ian:{slot:'comp',name:'Ian',price:35,sp:{A:1},wc:true,desc:'Trigger-happy: at the start of every hand he shoots the top card off a random dealer caravan. Now and then he hits one of yours.'},
  tycho:{slot:'comp',name:'Tycho',price:45,sp:{E:1,P:1},wc:true,desc:'Desert Ranger: once per run, sneak you past a boss. No reward, but no fight either.'},
  katja:{slot:'comp',name:'Katja',price:50,sp:{A:1,L:1},wc:true,desc:'Light fingers: the first card you take at each trading post is free.'},
};
// In a run, only the loadout you started with counts. Outside a run, nothing does.
const gear=id=>!!(runLive()&&meta.run.gear&&meta.run.gear.includes(id));
// (SPECIAL: gear modifiers live in GEAR[id].sp; see js/special.js)
const scripHTML=n=>`<span class="pill num scrip"><span class="tix" aria-hidden="true"></span> ${n} NCR ${n===1?'dollar':'dollars'}</span>`;
function loadoutLine(){
  const list=GEAR_SLOTS.map(sl=>meta.gear.on[sl.id]).filter(id=>id&&GEAR[id]);
  return list.length?list.map(id=>esc(GEAR[id].name)).join(' · '):'Nothing equipped yet.';
}
function renderOffice(){
  const g=meta.gear,live=runLive();
  app.innerHTML=`
  <div class="mbar">${backBtn('road','The Road')}${scripHTML(meta.scrip||0)}</div>
  <section class="hero small"><div class="neon sm" style="font-size:clamp(24px,7vw,40px)">Mojave Express</div><p class="tagline">Spend NCR dollars on gear you keep for good. Wear one piece in each slot; your loadout is applied when a run starts.</p></section>
  ${live?'<p class="note" style="text-align:center">You’re on a run. Loadout changes apply from your next run.</p>':''}
  <div class="slotstrip" aria-label="Your loadout">${GEAR_SLOTS.map(sl=>{const id=g.on[sl.id];return `<div class="nslot${id?' full':''}">${sl.id==='comp'&&id&&ART.comp[id]?`<img class="compart sm" src="${ART.comp[id]}" alt="">`:''}<small>${sl.name}</small><b>${id&&GEAR[id]?esc(GEAR[id].name):'Empty'}</b></div>`;}).join('')}</div>
  ${meta.char?`<section class="panel"><h2 style="font-size:22px">${esc(CHARS[meta.char].name)}’s SPECIAL</h2>${specialBarsHTML(meta.char,currentGearIds())}${specialEffectsHTML(meta.char,currentGearIds())}<p class="note">Every piece of gear adds to or takes from these. Stats run from 1 to 10.</p></section>`:''}
  <section class="panel office">
    <p class="note">Earn NCR dollars on the Road: 1 for a Saloon table, 2 for High Stakes, 3 for a Boss (+1 each on Silver, +2 on Gold). A run that ends pays 1 per stop reached, and making it to Vegas pays 10, 15 or 20.</p>
    ${GEAR_SLOTS.map(sl=>`<div class="nslot-h"><span class="nslot mini${g.on[sl.id]?' full':''}"></span><h3 class="sub">${sl.name}</h3></div><div class="gearrow">${Object.entries(GEAR).filter(([,x])=>x.slot===sl.id).map(([id,x])=>{
      const own=g.owned.includes(id),on=g.on[sl.id]===id,afford=(meta.scrip||0)>=x.price;
      return `<div class="gearopt${on?' on':''}">${x.slot==='comp'&&ART.comp[id]?`<img class="compart" src="${ART.comp[id]}" alt="">`:''}<b>${esc(x.name)}</b><span class="gspwrap">${spChips(x)}</span><span>${esc(x.desc)}</span>
        ${own?`<button class="btn${on?' hot':''}" data-gearon="${id}" aria-pressed="${on}">${on?(x.slot==='comp'?'With you':'Wearing'):(x.slot==='comp'?'Take along':'Wear')}</button>`:x.wc?`<span class="note">🔒︎ Joins you on the Water Chip run.</span>`:`<button class="btn" data-gearbuy="${id}" ${afford?'':'disabled'}><span class="tix" aria-hidden="true"></span> ${x.price}</button>`}</div>`;}).join('')}</div>`).join('')}
    <h3 class="sub" style="margin-top:22px">Legend cards</h3>
    <p class="note">Buy a Legend card to add it to the trading posts on The Road. They’re rare: about 1 trading post in 4 has one, and legendaries turn up a third as often as rares. Once you buy one on the road it’s in your deck for the run. Playing one doesn’t use your turn.</p>
    <div class="gearrow">${Object.entries(LEGENDS).map(([id,L])=>{const own=(meta.legends||[]).includes(id),pr=LEGEND_PRICE[L.rar].ncr;
      return `<div class="gearopt lgopt${own?' on':''}">${ART.legend[id]?cardHTML({legend:id}):''}<b class="lg-${L.rar}">${esc(L.name)}</b><i class="rar lgt-${L.rar}">${L.rar}</i><span>${esc(L.desc)}</span>
        ${own?'<button class="btn" disabled>In the trading posts</button>':L.found?`<span class="note">🔒︎ ${esc(L.found)}</span>`:`<button class="btn" data-legendbuy="${id}" ${(meta.scrip||0)>=pr?'':'disabled'}><span class="tix" aria-hidden="true"></span> ${pr}</button>`}</div>`;}).join('')}</div>
  </section>`;
}
function handleOfficeClick(d){
  const g=meta.gear;
  if('legendbuy' in d){const id=d.legendbuy,L=LEGENDS[id];meta.legends=meta.legends||[];if(!L||L.found||meta.legends.includes(id))return true;const pr=LEGEND_PRICE[L.rar].ncr;if((meta.scrip||0)<pr)return true;meta.scrip-=pr;meta.st.ncrSpent=(meta.st.ncrSpent||0)+pr;meta.legends.push(id);if(typeof sfx==='function')sfx('clink');save();render();return true;}
  if('gearbuy' in d){const x=GEAR[d.gearbuy];if(!x||x.wc||g.owned.includes(d.gearbuy)||(meta.scrip||0)<x.price)return true;meta.scrip-=x.price;meta.st.ncrSpent=(meta.st.ncrSpent||0)+x.price;g.owned.push(d.gearbuy);g.on[x.slot]=d.gearbuy;if(typeof sfx==='function')sfx('clink');checkState();save();render();return true;}
  if('gearon' in d){const x=GEAR[d.gearon];if(!x||!g.owned.includes(d.gearon))return true;g.on[x.slot]=g.on[x.slot]===d.gearon?null:d.gearon;save();render();return true;}
  return false;
}
const TOKENS={
  stash:{name:'Stash',desc:'Start the run with 8 extra caps.'},
  kit:{name:'Field Kit',desc:'Start with Mentats and a hit of Jet.'},
  marked:{name:'Marked Cards',desc:'Two random cards in your deck start Lucky.'},
  charm:{name:'Lucky Charm',desc:'Start with a random common perk.'},
  second:{name:'Second Wind',desc:'Start the run with 1 extra Grit.'},
};
const BOSS_RULES={
  tight:HOUSE.tight, sand:HOUSE.sand, nojk:HOUSE.nojk, long:HOUSE.long, stacked:HOUSE.stacked, iron:HOUSE.iron, royal:HOUSE.royal,
  drought:{name:'Drought',desc:'You can’t discard or disband.',apply:R=>{R.noDiscard.p=true;R.noDisband=R.noDisband||{p:false,a:false};R.noDisband.p=true;}},
  loaded:{name:'Loaded Deck',desc:'The dealer’s deck has 2 extra Jacks, 2 extra Kings and an extra Joker.',apply:R=>{R.dealerBonus={J:2,K:2,JK:1};}},
  short:{name:'Short Deal',desc:'You open with at most 6 cards.',apply:R=>{R.deal.p=Math.min(R.deal.p,6);}},
  noking:{name:'Home Kings',desc:'Kings can only be played on your own caravans: nobody can King the other side.',apply:R=>{R.kingOwn=true;}},
  noqueen:{name:'No Queens',desc:'You can’t play Queens.',apply:R=>{R.banP.push('Q');}},
  pickpocket:{name:'Pickpocket',desc:'When the dealer Jacks one of your number cards, they take it into their hand and draw a card.',apply:R=>{R.heist.a=true;}},
  heavy:{name:'Heavy Hitter',desc:'The dealer opens with 4 extra cards.',apply:R=>{R.deal.a+=4;}},
  nojack:{name:'No Jacks',desc:'Jacks can’t be played.',apply:R=>{R.banned.push('J');}},
  light:{name:'Light Pockets',desc:'You hold 1 fewer card.',apply:R=>{R.hand.p=Math.max(3,R.hand.p-1);}},
  floor:{name:'High Floor',desc:'Caravans sell at 23–26.',apply:R=>{R.range.p=[23,26];R.range.a=[23,26];}},
  stubborn:{name:'No Backing Out',desc:'Nobody can disband a caravan.',apply:R=>{R.noDisband={p:true,a:true};}},
  mirror:{name:'Crooked Crown',desc:'The dealer’s Kings triple instead of double, and each one draws them a card.',apply:R=>{R.kingMult.a=3;R.kingDraw.a=true;}},
  greedy:{name:'Greedy House',desc:'The dealer’s caravans sell up to 2 points higher.',apply:R=>{R.range.a=[R.range.a[0],R.range.a[1]+2];}},
};
// Rules that measured as helping the player stay defined (old saved runs may hold them) but are no longer dealt.
const BOSS_LEGACY=['royal','short','noqueen','quick','pickpocket'];
const BOSS_POOL=Object.keys(BOSS_RULES).filter(id=>!BOSS_LEGACY.includes(id));
const GENERIC_DEALERS=[
  ['Whiskey Wanda','Pours a double, deals a single.'],['Tumbleweed Tom','Rolls into town, rolls out broke.'],['Doc Fizz','Prescribes cards for every ailment.'],
  ['Rattlesnake Ruth','Rattles her bracelets when she bluffs.'],['Lefty Loomis','Deals left-handed. Swears it’s lucky.'],['Big Iron Ike','Keeps his hand on his holster and his eyes on yours.'],
  ['Cactus Kate','Prickly loser, worse winner.'],['Junkyard Jay','Bets bottle caps, bolts and one shoe.'],['Sweet Sue','Smiles the whole hand. That’s the scary part.'],
  ['Old Moe','Has played since before the bombs. Says so often.'],['Copper Cal','Polishes every cap before he bets it.'],['Dusty Dell','Hasn’t cleaned her deck since the war.'],
  ['Pastor Pete','Prays over every draw.'],['Brahma Bill','Raises cattle and stakes.'],['Two-Tone Tess','Wears one red boot and one black. Never says why.'],
];
const VOUCHER_PRICE=id=>disc(id==='pockets'||id==='rack'?22:16);
const VOUCHERS={
  pouch:{name:'Chem Set',desc:'Every chem you use has a 1 in 3 chance not to be used up.'},
  pockets:{name:'Deep Pockets',desc:'Keep 1 extra card from every bundle.'},
  haggle:{name:'Haggler',desc:'Tossing cards in the fire is free, and pays 2 caps per card.'},
  dice:{name:'Lucky Dice',desc:'Rerolls start at 1 cap.'},
  rack:{name:'Gun Rack',desc:'The trading post offers 3 perks instead of 2.'},
  tin:{name:'Savings Tin',desc:'Interest pays out on tables you lose, too.'},
};
const TAGS={
  caps:{name:'Cap Stash',desc:'Free caps right now (4, plus 1 for each stop you’ve reached).'},
  crate:{name:'Free Bundle',desc:'A free Supply bundle (see 5 cards, keep 2) at the next shop.'},
  chem:{name:'Pick-Me-Up',desc:'A free random chem right now.'},
  half:{name:'Clearance Sale',desc:'The next shop is half price.'},
  reroll:{name:'Rerolls',desc:'Two free shop rerolls, saved until you use them.'},
  upgrade:{name:'Tune-Up',desc:'Upgrade a card for free at the next shop.'},
  cards:{name:'Card Drop',desc:'Two random cards join your deck right now, one of them upgraded.'},
  shiny:{name:'Polish',desc:'A random number card in your deck gets a special finish (Holo, Golden, Neon or Ghost).'},
  collector:{name:'Collector’s Pick',desc:'A free Collector’s bundle (keep 1 of 4 finished cards) at the next shop.'},
  nest:{name:'Nest Egg',desc:'Extra interest right now: 1 cap for every 5 you hold, up to 10.'},
  grit:{name:'Second Wind',desc:'+1 Grit right now (up to 2).'},
};
const MODS={
  steel:{name:'Steel',desc:'Can’t be removed by Jacks.',tag:'STL'},
  gilded:{name:'Gilded',desc:'+3 caps when it’s in one of your caravans that sells.',tag:'GLD'},
  lucky:{name:'Lucky',desc:'Draw an extra card when you play it.',tag:'LCK'},
  glass:{name:'Glass',desc:'Worth double, but breaks after the hand it’s played in.',tag:'GLS'},
  wild:{name:'Wild',desc:'Counts as any suit for the suit rule.',tag:'WLD'},
};
// Editions: a special finish on number cards (A–10), separate from upgrades. Road only, and only for the run.
const EDITIONS={
  holo:{name:'Holographic',tag:'HOLO',desc:'The caravan it’s in can sell 1 point higher.',price:3,w:12},
  gold:{name:'Golden',tag:'GOLD',desc:'+3 caps every time you play it (paid when the table ends).',price:4,w:7},
  neon:{name:'Neon',tag:'NEON',desc:'If it’s in a caravan you sell, that table pays 25% more.',price:6,w:3},
  ghost:{name:'Ghost',tag:'GHOST',desc:'Doesn’t take up a slot in your hand.',price:8,w:1},
};
function rollEdition(chance){ // chance: odds out of 100 that a card gets any edition; null = guaranteed
  const tot=Object.values(EDITIONS).reduce((a,e)=>a+e.w,0);
  if(chance!=null&&Math.random()*100>=chance)return null;
  let x=Math.random()*tot;for(const [id,e] of Object.entries(EDITIONS)){x-=e.w;if(x<0)return id;}return 'holo';
}
// Cards you pick up on the Road wear the back of a Pack you've earned. No Packs yet: a Classic back that isn't your starter.
function runPackBack(){
  const earned=earnedPacks();if(earned.length)return pick(earned);
  const free=LOOKS.back.filter(b=>!b.art&&b.id!==starterBack()).map(b=>b.id);return free.length?pick(free):null;
}
function runAddCard(c){const n={...c};delete n.id;const b=runPackBack();if(b)n.pack=b;meta.deck.push(n);return n;}
const edLine=c=>c&&c.ed&&EDITIONS[c.ed]?`${EDITIONS[c.ed].name}: ${EDITIONS[c.ed].desc}`:'';
const PERK_RARITY={
  nose:'common',heist:'common',scrapper:'common',ironclad:'common',royal:'common',cool:'common',prospector:'common',scav:'common',
  honest:'uncommon',shark:'uncommon',twotone:'uncommon',roller:'uncommon',collector:'uncommon',showcase:'uncommon',hunter:'uncommon',
  wide:'rare',kingpin:'rare',momentum:'rare',jackrabbit:'rare',courier:'rare',steady:'rare',hazmat:'rare',cannon:'rare',
  lead:'legendary',insure:'legendary',
};


const RARITY_PRICE={common:10,uncommon:16,rare:24,legendary:32};
Object.assign(PERKS,{
  jackrabbit:{name:'Jackrabbit',desc:'Playing a Jack doesn’t use your turn.'},
  scrapper:{name:'Trickster',desc:'Playing a Joker doesn’t use your turn.'},
  prospector:{name:'Prospector',desc:'Interest can pay up to 3 more caps.'},
  kingpin:{name:'Kingpin',desc:'Scales: every 2 Kings you play this run raise your sell ceiling by 1 (up to +4).'},
  nose:{name:'Bloodhound',desc:'Whenever one of your caravans reaches 25 or 26, draw 2 cards.'},
  collector:{name:'Collector',desc:'Every perk you own beyond your second raises your sell ceiling by 1.'},
  momentum:{name:'Momentum',desc:'Scales: +1 hand size for every 4 tables you win this run (up to +2).'},
  honest:{name:'Honest Work',desc:'Your number cards with no face card on them can’t be removed by Jacks or Jokers.'},
  ironclad:{name:'Ironclad',desc:'Steel cards in your caravans are worth 2 more.'},
  showcase:{name:'Showcase',desc:'Cards with a special finish are worth 2 more.'},
  heist:{name:'Heist',desc:'When you Jack one of the dealer’s number cards, you take it into your hand and draw a card.'},
  hazmat:{name:'Hazmat Suit',desc:'Jokers can never remove your cards, yours included.'},
  courier:{name:'Royal Courier',desc:'Playing a King doesn’t use your turn.'},
  cannon:{name:'Glass Cannon',desc:'Glass cards are worth triple instead of double, and only break if you lose the hand.'},
});
PERKS.insure={name:'Guardian Angel',desc:'If you lose with no Grit left, the run doesn’t end: you get another shot at that table. Breaks when used.'};
PERKS.scav={name:'Scavenger',desc:'After every table, win or lose, you pocket a random number card from the dealer’s caravans. It joins your deck.'};

const run=()=>{syncRoute();return meta&&meta.run;};
const runV=id=>!!(run()&&run().vouchers.includes(id));
const deckIdx=id=>DECKS.findIndex(d=>d.id===id);
const deckUnlocked=id=>deckIdx(id)<(meta.decksUnlocked||1);
const tierIdx=id=>TIERS.findIndex(t=>t.id===id);
// Difficulty is tracked per deck: win a deck on Copper to open Silver for that deck, and so on.
const deckTierCount=d=>Math.max(1,((meta.deckTiers||{})[d])||1);
const tierPips=d=>{const w=(meta.deckWon||{})[d]??-1;return ` <span class="tpips" title="${w<0?'Not won yet':'Won on the '+TIERS[w].name}">${TIERS.map((t,i)=>`<i class="tp ${t.id}${i<=w?' won':''}"></i>`).join('')}</span>`;};
const tierUnlocked=(id,deck)=>tierIdx(id)<deckTierCount(deck||((meta.newRun&&meta.newRun.deck)||'plain'));
function runRoster(cid,daily){
  if(isWC())return RUN_STOPS.map(()=>null);
  const r=RUN_STOPS.map(()=>null);
  const pool=shuffle([...ORIGINALS,...(daily?[]:NEWCOMERS.filter(charUnlocked))].filter(x=>x!==cid)); // rivals come from the whole cast you've unlocked
  if(ORIGINALS.includes(cid)||NEWCOMERS.includes(cid)){r[1]=pool[0];r[3]=pool[1];r[5]='greg';}
  else if(cid==='greg'){r[1]=pool[0];r[2]=pool[1];r[3]=pool[2];r[5]='jeanita';}
  else if(cid==='jeanita'){r[1]=pool[0];r[2]=pool[1];r[3]=pool[2];r[4]='greg';}
  else return r;
  if(!(cid==='greg'||cid==='jeanita'))for(const s of [1,3])if(Math.random()<1/3)r[s]=null; // now and then the stop keeps its own boss (Mama Tallow, Sergeant Brick)
  return r;
}
const rosterOf=()=>{const r=run();return r.roster||runRoster(r.char);};
function bossDealer(s){
  if(isWC()){const b=wcBoss(s);return {name:b.name,blurb:b.blurb,rival:null,art:b.art,wcRule:b.rule};}
  if(inBeyond(s)){const b=BEYOND[(s-RUN_STOPS.length)%BEYOND.length];return {name:b.name,blurb:b.blurb,rival:null,art:b.art};}
  const rv=rosterOf()[s];
  if(rv)return {name:CHARS[rv].name,blurb:RIVALS[rv].blurb,rival:rv};
  const o=ROAD[RUN_STOPS[s]];return {name:o.name,blurb:o.blurb,rival:null,art:o.art};
}
// A boss's picture: rival portrait, custom boss art if the file exists, otherwise an outlaw silhouette.
const OUTLAW_SVG=`<svg viewBox="0 0 100 120" aria-hidden="true"><g fill="currentColor"><ellipse cx="50" cy="40" rx="40" ry="8"/><path d="M30 40 Q32 14 50 14 Q68 14 70 40 Z"/><circle cx="50" cy="52" r="15"/><path d="M33 56 L67 56 L50 76 Z"/><path d="M14 120 Q16 82 50 78 Q84 82 86 120 Z"/></g></svg>`;
function bossPic(d,cls){
  if(!d)return '';
  const src=d.rival?portrait(d.rival):d.art&&PORTRAIT_FILE[d.art];
  return src?`<img class="${cls}" src="${src}" alt="">`:(d.art?`<span class="${cls} bsil">${OUTLAW_SVG}</span>`:'');
}
// Rules that can't share a table (they'd cancel out or make no sense together).
const RULE_CLASH=[['tight','long','floor'],['royal','noking','mirror'],['nojack','iron'],['stacked','light'],['drought','stubborn']];
const RANGE_RULES=['tight','long','floor'];
function drawRules(n,avoid=[]){
  const out=[];let pool=shuffle(BOSS_POOL.filter(x=>!avoid.includes(x)));
  if(pool.length<n)pool=shuffle(BOSS_POOL.slice());
  for(const id of pool){if(out.length>=n)break;
    if(RULE_CLASH.some(g=>g.includes(id)&&out.some(o=>o!==id&&g.includes(o))))continue;
    out.push(id);}
  // range-setting rules go first so modifiers like Greedy House stack on top of them
  return out.sort((a,b)=>(RANGE_RULES.includes(b)?1:0)-(RANGE_RULES.includes(a)?1:0));
}
// Skip boons: weighted, never the same boon twice at one stop, and at most twice per run.
const TAG_WEIGHT={caps:10,crate:9,chem:8,half:7,reroll:8,upgrade:8,cards:8,shiny:5,collector:4,nest:6,grit:3};
function pickTag(used,stopTags){
  const ok=Object.keys(TAG_WEIGHT).filter(k=>TAGS[k]&&!stopTags.includes(k)&&(used[k]||0)<2);
  const pool=ok.length?ok:Object.keys(TAG_WEIGHT);
  let x=Math.random()*pool.reduce((a,k)=>a+TAG_WEIGHT[k],0);
  for(const k of pool){x-=TAG_WEIGHT[k];if(x<0){used[k]=(used[k]||0)+1;return k;}}
  return pool[0];
}
function tagPair(r){const used={};for(const st of (r.skipTags||[]))if(st)for(const k of st)used[k]=(used[k]||0)+1;const a=pickTag(used,[]);return [a,pickTag(used,[a])];}
// Boss rule swap: pay a bribe to replace one of a boss's own rules with one of two others (once per boss).
const bossSwapCost=s=>10+3*s;
function swapOptions(s,i){
  const r=run(),cur=r.bosses[s],others=cur.filter((_,k)=>k!==i),bn=r.bounties[s];
  const bad=id=>(id==='tight'&&bn==='p26')||(id==='noking'&&bn==='kings')||(id==='drought'&&bn==='calm'); // would make the bounty impossible
  const pool=BOSS_POOL.filter(id=>!cur.includes(id)&&!bad(id)&&!RULE_CLASH.some(g=>g.includes(id)&&others.some(o=>g.includes(o))));
  return withSeed('swap:'+s+':'+i+':'+(r.hands||0),()=>shuffle(pool).slice(0,2));
}
function rulesWithSwapHTML(r,s,t,ids){
  if(!ids.length)return 'None. Straight Caravan.';
  const cost=bossSwapCost(s),can=t===2&&!(r.swapUsed||{})[s]&&meta.caps>=cost&&!r.swapPick,pk=r.swapPick&&r.swapPick.s===s?r.swapPick:null;
  return ids.map((id,i)=>{
    const own=t===2&&i<(r.bosses[s]||[]).length&&r.bosses[s][i]===id;
    let h=`<b>${BOSS_RULES[id].name}:</b> ${esc(BOSS_RULES[id].desc)}`;
    if(own&&can)h+=` <button class="btn" data-rulesw="${i}" style="padding:2px 8px;font-size:12px">Swap · ${capN(cost)}</button>`;
    if(pk&&pk.i===i)h+=`<div class="swapopts">Swap it for: ${pk.opts.map(o=>`<button class="btn hot" data-rulepick="${o}" style="padding:3px 8px;margin:3px 4px 0 0"><b>${BOSS_RULES[o].name}</b>: ${esc(BOSS_RULES[o].desc)} (${capN(cost)})</button>`).join('')}<button class="btn" data-rulekeep style="padding:3px 8px">Keep it</button></div>`;
    return h;
  }).join('<br>')+(can?'<br><span class="note">Bribe the house to swap one boss rule. Once per boss.</span>':'');
}
// Wagers: stake caps on a table. A win returns the stake plus a bonus; a loss forfeits it. Riskier tables pay more.
const wagerMax=s=>5+3*s, WAGER_ODDS=[.5,1,1.5];
function wagerRowHTML(r,s,t){
  const mx=wagerMax(s),opts=[0,5,10,20,40].filter(x=>x===0||(x<=meta.caps&&x<=mx)),sel=((r.wagerSel||0)<=meta.caps&&(r.wagerSel||0)<=mx)?(r.wagerSel||0):0,mult=WAGER_ODDS[t];
  return `<dt>Wager</dt><dd>${opts.map(x=>`<button class="btn${x===sel?' hot':''}" data-wager="${x}" style="padding:3px 10px;margin:0 4px 4px 0">${x?capN(x):'None'}</button>`).join('')}<br><span class="note">${sel?`Win: your ${sel} back plus ${Math.round(sel*mult)} more. Lose: it’s gone.`:`Stake caps on this table (up to ${mx}). Win and it comes back with a ${Math.round(mult*100)}% bonus. Lose and it’s gone.`}</span></dd>`;
}
function genRun(){
  const r=run(), t=tierIdx(r.tier);
  r.bosses=[];RUN_STOPS.forEach((_,s)=>{r.bosses[s]=drawRules((s<2?1:s<4?2:3)+(t>=1?1:0)+(r.deck==='gold'?1:0),s?r.bosses[s-1]:[]);});
  r.extra=RUN_STOPS.map(()=>t>=2?[drawRules(1)[0],drawRules(1)[0]]:[null,null]);
  const names=shuffle(GENERIC_DEALERS.slice());
  r.dealers=RUN_STOPS.map((_,s)=>[0,1].map(k=>{const d=names[(s*2+k)%names.length];return {name:d[0],blurb:d[1],rival:null};}));
  r.skipTags=[];RUN_STOPS.forEach((_,s)=>{r.skipTags[s]=tagPair(r);});
  r.bounties=RUN_STOPS.map((_,s)=>{const b=r.bosses[s];return pick(Object.keys(BOUNTIES).filter(k=>k!=='wild'&&!(k==='p26'&&b.includes('tight'))&&!(k==='kings'&&b.includes('noking'))&&!(k==='calm'&&b.includes('drought'))));});
}
function ensureStop(s){
  const r=run();if(r.bosses[s])return;const t=tierIdx(r.tier),k=s-RUN_STOPS.length;
  r.bosses[s]=drawRules(Math.min(7,3+Math.floor(k/2)+(t>=1?1:0)+(r.deck==='gold'?1:0)+(r.char==='threedog'?1:0)),r.bosses[s-1]||[]);
  r.extra[s]=[drawRules(1)[0],k>=2||t>=2?drawRules(1)[0]:null];
  const names=shuffle(GENERIC_DEALERS.slice());r.dealers[s]=[0,1].map(i=>({name:names[i][0],blurb:names[i][1],rival:null}));
  r.skipTags[s]=tagPair({skipTags:r.skipTags.slice(Math.max(0,s-5),s)});
  r.bounties[s]=pick(Object.keys(BOUNTIES).filter(x=>x!=='wild'&&!(x==='p26'&&r.bosses[s].includes('tight'))&&!(x==='kings'&&r.bosses[s].includes('noking'))&&!(x==='calm'&&r.bosses[s].includes('drought'))));
}
function tableRuleIds(s,t){
  ensureStop(s);
  const r=run();const ids=t===2?r.bosses[s].slice(0,gear('combat')?Math.max(0,r.bosses[s].length-1):undefined):(r.extra[s][t]?[r.extra[s][t]]:[]);
  return s===r.stop&&t===r.table?ids.concat(r.nextRules||[]):ids;
}
// Late-game escalation: from the third stop on, Boss dealers get stronger in ways shown on the pre-hand screen.
const ESCALATION=[
  {from:2,text:'The dealer holds 1 more card.',apply:R=>{R.hand.a+=1;}},
  {from:3,text:'The dealer’s caravans sell 1 point higher.',apply:R=>{R.range.a=[R.range.a[0],R.range.a[1]+1];}},
  {from:4,text:'The dealer’s Kings triple.',apply:R=>{R.kingMult.a=Math.max(R.kingMult.a,3);}},
  {from:5,text:'The dealer holds 1 more card, and opens with 2 extra.',apply:R=>{R.hand.a+=1;R.deal.a+=2;}},
];
const escalationFor=(s,t)=>t===2?ESCALATION.filter(e=>(inBeyond(s)?99:s)>=e.from):[];
function runRules(s,t){
  const r=run(),R=baseRules();
  for(const id of tableRuleIds(s,t))BOSS_RULES[id]&&BOSS_RULES[id].apply(R);
  for(const e of escalationFor(s,t))e.apply(R);
  if(t===2){const rv=rosterOf()[s];if(rv)RIVALS[rv].fn(R);}
  if(t===2&&isWC()){const b=wcBoss(s);if(b)b.fn(R);}
  if(has('wide'))R.range.p=[R.range.p[0]-2,R.range.p[1]];
  if(has('royal'))R.kingMult.p+=1;
  if(has('steady'))R.freeRank.p.push('Q');
  if(has('shark'))R.hand.p+=1;
  if(has('lead'))R.jackproof.p=true;
  if(has('twotone'))R.color.p=true;
  if(has('cool'))R.freeDisband.p=true;
  if(has('jackrabbit'))R.freeRank.p.push('J');
  if(has('courier'))R.freeRank.p.push('K');
  if(has('scrapper'))R.freeRank.p.push('JK');
  if(has('hazmat'))R.jokerproof.p=true;
  if(has('cannon'))R.glassMult.p=3;
  if(has('collector'))R.range.p=[R.range.p[0],R.range.p[1]+Math.max(0,meta.perks.length-2)];
  if(has('roller')&&t===2)R.hand.p+=1;
  if(has('nose'))R.exact26.p=true;
  if(has('honest'))R.numProof.p=true;
  if(has('heist'))R.heist.p=true;
  if(has('ironclad'))R.steelPlus.p=2;
  if(has('showcase'))R.edPlus.p=2;
  if(has('kingpin'))R.range.p=[R.range.p[0],R.range.p[1]+Math.min(4,Math.floor((r.kings||0)/2))];
  if(has('momentum'))R.hand.p+=Math.min(2,Math.floor((r.won||0)/4));
  if(SPX.ceiling(sp('S')))R.range.p=[R.range.p[0],R.range.p[1]+SPX.ceiling(sp('S'))];
  if(isChar('jeanita'))R.jokerproof.p=true;
  if(isChar('greg')){R.hand.p+=1;R.jackproof.a=true;}
  R.deal.p+=SPX.deal(sp('A'));
  if(r.deck==='irradiated')R.deal.p-=1;
  if(r.deck==='bullet')R.deal.a+=1;
  if(gear('beret'))R.deal.a-=1;
  if(gear('piper'))R.hand.a-=1;
  if(gear('fawkes'))R.kingproof.p=true;
  if(gear('armor'))R.queenproof.p=true;
  if(gear('varmint'))R.noJoker.a=true;
  R.luckyDraw.p=Math.max(SPX.luckyDraw(sp('L')),gear('revolver')?2:1);
  if(gear('dynamite'))R.bigJoker.p=true;
  if(isChar('snipsnip'))R.spareParts.p=true;
  if(isChar('benny')){R.tieWin.p=true;R.hand.a+=1;}   // Double-Crosser: nobody trusts him, so every dealer holds an extra card
  if(isChar('harold'))R.hand.p=Math.max(3,R.hand.p-1);
  return R;
}
function runNoise(s,t){
  const base=inBeyond(s)?Math.max(1.2,5-(s-RUN_STOPS.length)*0.5):[44,33,23,15,9,6,4][s], adj=inBeyond(s)?[2,1,0][t]:[14,6,0][t], tm=[1,0.72,0.5][tierIdx(run().tier)];
  return Math.max(0.5,(base+adj)*tm);
}
function runDealerExtra(s,t){
  if(inBeyond(s)){const k=Math.floor((s-RUN_STOPS.length)/2);return {J:3+k,Q:3,K:4+k,JK:t===2?2:1};}
  const ri=RUN_STOPS[s];const e={...ROAD[Math.max(0,ri-(t===2?0:1))].extra};
  if(t<2){e.JK=Math.max(0,(e.JK||0)-1);}
  return e;
}
function interestCap(){
  const r=run();if(r.deck==='gold')return 0;
  return (r.tier==='gold'?3:5)+(has('prospector')?3:0);
}
const tableReward=(s,t)=>[5,7,11][t]+Math.round(s*1.5);
// Selling all three caravans pays half the table's base reward on top (at least 3).
const sweepBonus=(s,t)=>Math.max(3,Math.ceil(tableReward(s,t)/2));
const rollerMult=()=>has('roller')?1.25:1;
const bossBountyPay=s=>Math.round((4+s)*(has('hunter')?2:1)*SPX.bounty(sp('I')));

function plainDeck(){return addFaces(baseNumbers(),{J:4,Q:4,K:4,JK:2});}
// Seeded runs: the same seed gives the same bosses, shops, events and deals.
// Randomness is swapped for a seeded stream at the points where the run rolls its content.
const dailySeed=()=>'DAILY-'+new Date().toISOString().slice(0,10);
const dailyChar=()=>ORIGINALS[hashStr(dailySeed())%ORIGINALS.length];
const randomSeed=()=>Math.random().toString(36).slice(2,8).toUpperCase();
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function withSeedStr(str,fn){const orig=Math.random;Math.random=mulberry32(hashStr(str));try{return fn();}finally{Math.random=orig;}}
function withSeed(label,fn){const r=meta&&meta.run;if(!r||!r.seed)return fn();return withSeedStr(r.seed+'|'+label,fn);}
function recordDaily(r,won){
  if(!r.daily||!r.seed)return;
  const day=r.seed.replace('DAILY-','');meta.dailyLog=meta.dailyLog||{};
  const prev=meta.dailyLog[day],score=(won?100:0)+r.stop*10+r.won;
  if(!prev||score>prev.score)meta.dailyLog[day]={won,stop:r.stop,tables:r.won,score};
  if(meta.dailyDone!==day){
    const y=new Date(Date.parse(day)-864e5).toISOString().slice(0,10);
    meta.dailyStreak=(meta.dailyLog[y]?(meta.dailyStreak||0):0)+1;meta.dailyDone=day;
    const b=won?10:5;r.scrip=(r.scrip||0)+b;meta.scrip=(meta.scrip||0)+b;r.dailyBonus=b;
  }
}
function startRun(){
  const r0=meta.newRun||{};
  const seed=r0.daily?dailySeed():(String(r0.seed||'').trim().toUpperCase().slice(0,24)||randomSeed());
  withSeedStr(seed+'|start',()=>startRun0(seed));
}
function startRun0(seed){
  const r0=meta.newRun||{};
  const daily=!!r0.daily,prevChar=meta.char;if(daily)meta.char=dailyChar();
  const deck=daily?'plain':(deckUnlocked(r0.deck||'plain')?(r0.deck||'plain'):'plain'), tier=daily?'copper':(tierUnlocked(r0.tier||'copper',deck)?(r0.tier||'copper'):'copper');
  const token=daily?null:(r0.token&&meta.tokens.includes(r0.token)?r0.token:null);
  const special=daily?null:(r0.special==='waterchip'?'waterchip':null);
  meta.run={v:1,seed,daily,prevChar:daily?prevChar:undefined,special,days:special?WC_DAYS:undefined,found:[],char:meta.char,deck,tier,token,stop:0,table:0,phase:'table',won:0,kings:0,skips:0,hands:0,vouchers:[],tags:[],nextRules:[],
    grit:1+(token==='second'?1:0),halfShop:false,freeRerolls:0,freeBundles:[],freeUpgrade:0,started:Date.now(),voucherStop:-1,scrip:0,
    gear:daily?[]:GEAR_SLOTS.map(sl=>meta.gear.on[sl.id]).filter(id=>id&&GEAR[id]&&meta.gear.owned.includes(id))};
  meta.run.grit=Math.max(0,meta.run.grit+SPX.grit(sp('E')));
  syncRoute();
  meta.run.roster=runRoster(meta.char,daily);
  genRun();
  meta.caps=[10,7,5][tierIdx(tier)]+(token==='stash'?8:0)-(meta.char==='vaultdweller'?5:0);
  let d=plainDeck();
  if(deck==='scorched'){let cut=0;shuffle(d);d=d.filter(c=>{if(!isNum(c)&&cut<6){cut++;return false;}return true;});}
  if(token==='marked'){shuffle(d);let n=0;for(const c of d)if(isNum(c)&&n<2){c.mod='lucky';n++;}}
  for(const [g,mod] of [['knife','steel'],['nuka','glass']])if(gear(g)){const pool=shuffle(d.filter(c=>isNum(c)&&!c.mod));pool.slice(0,2).forEach(c=>c.mod=mod);}
  if(gear('machete')){let cut=0;for(let i=d.length-1;i>=0&&cut<4;i--)if(isNum(d[i])&&(d[i].rank==='A'||d[i].rank==='2')){d.splice(i,1);cut++;}}
  if(gear('frag'))d.push({rank:'JK',suit:null});
  meta.deck=d;
  meta.perks=[];meta.equipped=[];
  meta.chems={spy:0,coffee:0,fresh:0,shoe:0,buff:0,medx:0};
  if(token==='kit'){meta.chems.spy=1;meta.chems.coffee=1;}
  if(isChar('snipsnip'))for(const k of Object.keys(meta.chems))meta.chems[k]=0;
  if(isChar('benny'))meta.deck.push({rank:'LG',suit:null,legend:'platinum'});
  if(token==='charm'){const id=pick(Object.keys(PERK_RARITY).filter(p=>PERK_RARITY[p]==='common'));meta.perks.push(id);meta.equipped=meta.perks;}
  meta.equipped=meta.perks;
  meta.run.story=[{title:CHARS[meta.char].name,text:PROLOGUE[meta.char]||'The road to Vegas starts here.'}];
  if(special)meta.run.story.unshift({title:'Vault 13',text:'The water chip in Vault 13 has failed. The Overseer gives you a canteen, a Pip-Boy, and 150 days before the vault runs dry. Somewhere out in the wasteland there’s a replacement. Find it, and play your way there.'});
  if(meta.char==='vaultdweller'){const pool=Object.keys(PERK_RARITY).filter(p=>PERK_RARITY[p]!=='legendary'&&!meta.perks.includes(p));meta.run.tagPick=shuffle(pool).slice(0,3);}
  save();
}
// Codex: remembers every perk, boss and event you've met. Perk state bits: 1 seen, 2 owned, 4 won a run with it.
const cdx=()=>{meta.codex=meta.codex||{};const c=meta.codex;c.perk=c.perk||{};c.boss=c.boss||{};c.event=c.event||{};return c;};
function seePerks(list){const c=cdx();for(const id of list)c.perk[id]=(c.perk[id]||0)|1;}
function codexSync(){if(!meta||!meta.perks)return;const c=cdx();for(const id of meta.perks)c.perk[id]=(c.perk[id]||0)|3;}
function rollPerkOffer(n){const o=rollPerkOffer0(n);seePerks(o);return o;}
function rollPerkOffer0(n){
  const owned=new Set(meta.perks);const out=[];
  for(let k=0;k<n*6&&out.length<n;k++){
    const rar=rollWeighted(Object.entries(rarityWeights()));
    const pool=Object.keys(PERK_RARITY).filter(p=>PERK_RARITY[p]===rar&&!owned.has(p)&&!out.includes(p));
    if(pool.length)out.push(pick(pool));
  }
  return out;
}
// Boss reward: three perks, uncommon or better. Pick one free, or take caps instead.
function rollBossPerks(){const r=run(),o=withSeed('bossperk:'+(r?r.stop:0)+':'+(r?r.hands||0:0),rollBossPerks0);seePerks(o);return o;}
function rollBossPerks0(){
  const owned=new Set(meta.perks),out=[];
  for(let k=0;k<40&&out.length<3;k++){
    const rar=rollWeighted(bossRarityWeights());
    const pool=Object.keys(PERK_RARITY).filter(p=>PERK_RARITY[p]===rar&&!owned.has(p)&&!out.includes(p));
    if(pool.length)out.push(pick(pool));
  }
  return out;
}
const bossPerkCaps=s=>12+3*Math.min(s,10);
function rollCard(withMod){
  const r=Math.random();let rank;
  if(r<.07)rank='JK';else if(r<.22)rank='K';else if(r<.36)rank='J';else if(r<.45)rank='Q';else rank=pick(['10','10','9','9','8','7','6','5','4','A']);
  const c={rank,suit:rank==='JK'?null:pick(SUITS)};
  if(withMod&&isNum(c)&&Math.random()<.45)c.mod=pick(Object.keys(MODS));
  if(withMod&&isNum(c)){const e=rollEdition(30);if(e)c.ed=e;}
  return c;
}
function runCardPrice(c){
  const b=c.rank==='JK'?9:c.rank==='K'?6:c.rank==='J'?4:c.rank==='Q'?3:1+Math.ceil(val(c)/3);
  return disc(b+(c.mod?2:0)+(c.ed&&EDITIONS[c.ed]?EDITIONS[c.ed].price:0)+(run().deck==='rust'?1:0));
}
const perkRunPrice=id=>disc(RARITY_PRICE[PERK_RARITY[id]||'common']);
const perkSellPrice=id=>Math.max(1,Math.floor(RARITY_PRICE[PERK_RARITY[id]||'common']/2));
const chemRunPrice=id=>disc({spy:3,coffee:4,fresh:2,shoe:3,buff:4,medx:4}[id]||3);
const SUIT_WORD={S:'Spades',H:'Hearts',D:'Diamonds',C:'Clubs'};
const BUNDLES={
  saddlebag:{name:'Saddlebag',desc:'See 3 cards, keep 1. Mostly number cards.',price:4,see:3,keep:1,w:38},
  supply:{name:'Supply bundle',desc:'See 5 cards, keep 2. Better odds of faces and upgrades.',price:7,see:5,keep:2,w:28},
  haul:{name:'Caravan haul',desc:'See 5 cards, keep 2. Every card is a face card or an upgraded number.',price:11,see:5,keep:2,w:10},
  suit:{name:'Suit bundle',desc:'See 5 number cards of one suit, keep 2. Some come upgraded.',price:6,see:5,keep:2,w:16},
  royal:{name:'Royal bundle',desc:'See 5 Kings and Queens, keep 2.',price:9,see:5,keep:2,w:8},
  collector:{name:'Collector’s bundle',desc:'See 4 number cards, keep 1. Every one has a special finish: Holographic, Golden, Neon or Ghost.',price:14,see:4,keep:1,w:6},
};
const bundleName=b=>b.id==='suit'?`${SUIT_WORD[b.suit]} bundle`:BUNDLES[b.id].name;
const bundleDesc=b=>b.id==='suit'?`See 5 ${SUIT_WORD[b.suit].toLowerCase()} number cards, keep 2. Some come upgraded.`:BUNDLES[b.id].desc;
function twoBundles(){const a=rollBundle();let b=rollBundle();for(let k=0;k<8&&b.id===a.id&&b.suit===a.suit;k++)b=rollBundle();return [a,b];}
function rollBundle(){const tot=Object.values(BUNDLES).reduce((a,b)=>a+b.w,0);let x=Math.random()*tot;for(const [id,b] of Object.entries(BUNDLES)){x-=b.w;if(x<0)return id==='suit'?{id,suit:pick(SUITS)}:{id};}return {id:'saddlebag'};}
const bundleSee=b=>Math.max(BUNDLES[b.id].keep+1,BUNDLES[b.id].see+(gear('dogmeat')?1:0)+SPX.bundleSee(sp('P')));
function genBundleCards(b){const out=genBundleCards0(b);
  if(gear('lamp')&&!out.some(c=>c.mod)){const nums=out.filter(c=>isNum(c));if(nums.length)pick(nums).mod=pick(Object.keys(MODS));}
  return out;}
function genBundleCards0(b){
  const out=[],key=c=>c.rank+(c.suit||'')+(c.mod||'')+(c.ed||'');
  const numRank=()=>pick(['A','2','3','4','5','6','7','8','9','10']);
  const mod=()=>pick(Object.keys(MODS));
  const make=()=>{
    if(b.id==='royal')return {rank:pick(['K','Q','K']),suit:pick(SUITS)};
    if(b.id==='suit'){const c={rank:numRank(),suit:b.suit};if(Math.random()<.3)c.mod=mod();return c;}
    if(b.id==='haul'){if(Math.random()<.5){const r=Math.random();return r<.15?{rank:'JK',suit:null}:{rank:pick(['K','J','Q','K','J']),suit:pick(SUITS)};}return {rank:numRank(),suit:pick(SUITS),mod:mod()};}
    const [face,up]=b.id==='supply'?[.3,.35]:[.15,.15];
    if(Math.random()<face){const r=Math.random();return r<.12?{rank:'JK',suit:null}:{rank:pick(['K','J','Q','J','K']),suit:pick(SUITS)};}
    const c={rank:numRank(),suit:pick(SUITS)};if(Math.random()<up)c.mod=mod();return c;
  };
  for(let k=0;k<60&&out.length<bundleSee(b);k++){const c=b.id==='collector'?{rank:pick(['A','4','5','6','7','8','9','10','10','9']),suit:pick(SUITS)}:make();
    if(isNum(c)){const e=b.id==='collector'?rollEdition(null):rollEdition(4);if(e)c.ed=e;}
    if(!out.some(o=>key(o)===key(c)))out.push(c);}
  return out;
}
function openBundle(b,free){const r=run();return withSeed('bundle:'+r.stop+':'+r.table+':'+(r.bundleN=(r.bundleN||0)+1),()=>openBundle0(b,free));}
function openBundle0(b,free){const keep=BUNDLES[b.id].keep+(runV('pockets')?1:0)+SPX.keep(sp('I'));run().picker={kind:'bundle',title:bundleName(b)+(free?' (free)':''),note:`Pick up to ${keep} to add to your deck.`,options:genBundleCards(b),keep,sel:[]};}
function openBurn(max,title,note){run().picker={kind:'burn',title,note,keep:max,sel:[]};}
const burnRoom=()=>Math.max(0,meta.deck.length-MIN_DECK);
const CRATES={perk:{name:'Perk crate',desc:'Pick 1 of 3 perks.',price:20},chem:{name:'Chem crate',desc:'Pick 1 of 3 chems.',price:5}};
function rerollCost(){const r=run();return Math.max(1,(runV('dice')?1:3)*(r.deck==='rust'?2:1)-SPX.reroll(sp('I')))+(r.rerolls||0);}
// Free bundles stack: every source adds one to the queue, and the trading post opens them one after another.
function nextFreeBundle(){
  const r=run();
  if(r.freeCrate){(r.freeBundles=r.freeBundles||[]).push(r.freeCrate==='collector'?'collector':'supply');r.freeCrate=0;} // runs saved before stacking
  if(r.freeBundles&&r.freeBundles.length&&!r.picker)openBundle({id:r.freeBundles.shift()},true);
}
function openShop(){const r=run();return withSeed('shop:'+r.stop+':'+r.table+':'+(r.hands||0),()=>{r.rerollN=0;return openShop0();});}
function openShop0(){
  const r=run();
  r.offers={perks:rollPerkOffer(runV('rack')?3:2),cards:gear('cass')?[rollCard(true),rollCard(true),rollCard(true)]:[rollCard(true),rollCard(true)],chems:shuffle(Object.keys(CHEMS)).slice(0,2),
    upgrade:pick(Object.keys(MODS)),voucher:r.voucherStop===r.stop?null:pick(Object.keys(VOUCHERS).filter(v=>!r.vouchers.includes(v))),sold:{}};
  r.offers.bundles=twoBundles();r.burnUsed=false;
  {const inDeck=new Set(meta.deck.filter(c=>c.legend).map(c=>c.legend)),pool=(meta.legends||[]).filter(id=>LEGENDS[id]&&!inDeck.has(id));
   const wpool=pool.flatMap(id=>LEGENDS[id].rar==='legendary'?[id]:[id,id,id]);
   r.offers.legend=pool.length&&Math.random()<0.25?pick(wpool):null;}
  r.rerolls=0;r.crate=null;r.workbench=null;r.picker=null;r.sponsor=isChar('ronald')?1:0;r.vouchUsed=false;r.katjaUsed=false;
  if(isChar('vaultdweller'))(r.freeBundles=r.freeBundles||[]).push('saddlebag');
  nextFreeBundle();
}
function rerollShop(){const r=run();return withSeed('reroll:'+r.stop+':'+r.table+':'+(r.rerollN=(r.rerollN||0)+1),rerollShop0);}
function rerollShop0(){
  const r=run();
  r.offers.perks=rollPerkOffer(runV('rack')?3:2);r.offers.cards=gear('cass')?[rollCard(true),rollCard(true),rollCard(true)]:[rollCard(true),rollCard(true)];r.offers.chems=shuffle(Object.keys(CHEMS)).slice(0,2);r.offers.upgrade=pick(Object.keys(MODS));r.offers.bundles=twoBundles();r.offers.sold={};
}
function openCrate(kind){const r=run();return withSeed('crate:'+r.stop+':'+r.table+':'+(r.crateN=(r.crateN||0)+1),()=>openCrate0(kind));}
function openCrate0(kind){
  const opts=kind==='card'?[rollCard(true),rollCard(true),rollCard(true)]:kind==='perk'?rollPerkOffer(3):shuffle(Object.keys(CHEMS)).slice(0,3);
  run().crate={kind,options:opts};
}
function takeCrate(i){
  const r=run(),c=r.crate;if(!c)return;const o=c.options[i];
  if(c.kind==='card')runAddCard(o);
  else if(c.kind==='perk'){if(meta.perks.length<perkSlots()&&!meta.perks.includes(o))meta.perks.push(o);}
  else if(chemTotal()<chemMax())meta.chems[o]=(meta.chems[o]||0)+1;
  meta.equipped=meta.perks;r.crate=null;save();
}
const modCount=()=>meta.deck.filter(c=>c.mod).length;

// ---- start a table ----
function startRunTable(){
  const r=run();if(!r||r.phase!=='table')return;
  r.offers=null;kitOpen=null;
  const s=r.stop,t=r.table,ri=riOf(s);ensureStop(s);
  const R=runRules(s,t);
  const dealer=t===2?bossDealer(s):r.dealers[s][t];
  G=withSeed('match:'+s+':'+t+':'+(r.hands||0),()=>newMatch(meta.deck,addFaces(baseNumbers(),(()=>{const ex={...runDealerExtra(s,t)};if(R.dealerBonus)for(const [k,v] of Object.entries(R.dealerBonus))ex[k]=(ex[k]||0)+v;return ex;})()),ri,R));
  G.mode='road';G.run=true;G.runStop=s;G.runTable=t;G.dealer={...dealer,place:placeOf(s)};G.ruleIds=tableRuleIds(s,t);G.noise=runNoise(s,t);
  G.perks=[...meta.perks];G.char=r.char;G.turretUsed=false;G.hugUsed=false;G.hugPending=false;if(SPX.peek(sp('P')))G.peek=true;G.quick=SPX.quick(sp('A'));G.quickUsed=false;
  G.repairUsed=false;G.requestUsed=false;G.booneUsed=false;G.ede=gear('ede');G.zapUsed=false;
  G.bat=gear('bat');G.batUsed=false;G.duster=gear('duster');G.dustUsed=false;G.codsworth=gear('codsworth');G.tidyUsed=false;G.sawedoff=gear('sawedoff');
  G.canWalk=gear('sneakers')&&!((r.walkUsed||{})[r.stop]);G.walked=false;G.comp=meta.gear&&meta.gear.on&&meta.gear.on.comp&&r.gear&&r.gear.includes(meta.gear.on.comp)?meta.gear.on.comp:null;
  if(t===2){G.bounty=r.bounties[s];G.bountyPay=bossBountyPay(s);setupSig(r);}
  G.stake=0;r.nextRules=[];{const w0=r.wagerSel||0,w=(w0<=meta.caps&&w0<=wagerMax(s))?w0:0;r.wagerSel=0;if(w>0){meta.caps-=w;G.wager=w;G.stake=w;}}
  G.ianDone=false;G.regrowUsed=false;G.lastLost=null;
  if(isWC()&&t===2&&WC_ROUTE[s]&&WC_ROUTE[s].final){G.master=true;G.masterN=0;G.masterBase=JSON.stringify(G.rules);masterShift();}
  enterMatch();
}
function skipTable(){
  const r=run();if(!r||r.phase!=='table'||r.table>1)return;
  r.offers=null;r.halfShop=false;
  const tag=r.skipTags[r.stop][r.table];withSeed('skip:'+r.stop+':'+r.table,()=>applyTag(tag));if(gear('boots'))meta.caps+=5;
  if(r.special==='waterchip'){r.days=(r.days||0)-WC_SKIP;r.wcSkipped=(r.wcSkipped||0)+1;if(r.days<=0){r.days=0;r.dry=true;r.phase='over';r.result='lost';unlock('wc_dry');save();return;}}
  r.skips++;r.table++;if(r.skips>=3)unlock('skip3');
  save();
}
// ---------- card reveal: shows cards that were added, changed or removed without you picking them ----------
// Quick fly-in for cards you picked yourself (shop singles, bundle picks): a copy slides into the Deck count.
function flyToDeck(els){
  if(!motionOn())return;const dest=document.querySelector('.kitpill[data-kitopen="deck"]');if(!dest)return;
  const b=dest.getBoundingClientRect();
  els.forEach((el,i)=>{if(!el)return;const a=el.getBoundingClientRect();const g=el.cloneNode(true);
    Object.assign(g.style,{position:'fixed',left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px',margin:0,zIndex:90,pointerEvents:'none'});
    document.body.appendChild(g);
    const dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2);
    g.animate([{transform:'none',opacity:1},{transform:'translateY(-14px) scale(1.08)',opacity:1,offset:.25},{transform:`translate(${dx}px,${dy}px) scale(.2) rotate(${i%2?14:-14}deg)`,opacity:.15}],{duration:700,delay:i*90,easing:'cubic-bezier(.45,0,.6,1)',fill:'forwards'}).finished.then(()=>g.remove(),()=>g.remove());});
}
function showReveal(mode,title,note,cards){const r=run();if(!r)return;r.reveal={mode,title,note,cards:cards.map(c=>({...c}))};}
function revealHTML(){
  const v=run().reveal,head={add:'Added to your deck',change:'Card changed',remove:'Removed from your deck'}[v.mode];
  return `<div class="overlay reveal-wrap"><div class="panel result reveal r-${v.mode}" role="dialog" aria-label="${esc(v.title)}">
    <small class="eyebrow">${head}</small><h2 style="margin:4px 0 6px">${esc(v.title)}</h2>
    <div class="revealcards">${v.cards.map((c,i)=>`<div class="rvcard" style="--i:${i}">${cardHTML(c)}<small>${esc(cardName(c))}${c.mod?` · ${MODS[c.mod].name}`:''}${c.ed?` · ${EDITIONS[c.ed].name}`:''}</small></div>`).join('')}</div>
    <p class="note">${esc(v.note)}</p>
    <button class="btn hot" data-revealok>${v.mode==='add'?'Into the deck':v.mode==='remove'?'Let them go':'Nice'}</button>
  </div></div>`;
}
function closeReveal(){
  const r=run();if(!r||!r.reveal)return;
  const done=()=>{r.reveal=null;save();render();};
  const cards=[...document.querySelectorAll('.rvcard')],dest=document.querySelector('.kitpill[data-kitopen="deck"]');
  if(!motionOn()||!cards.length){done();return;}
  const mode=r.reveal.mode,anims=cards.map((el,i)=>{const a=el.getBoundingClientRect();
    if(mode==='add'&&dest){const b=dest.getBoundingClientRect();const dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2);
      return el.animate([{transform:'none',opacity:1},{transform:`translate(${dx}px,${dy}px) scale(.2) rotate(${i%2?12:-12}deg)`,opacity:.2}],{duration:520,delay:i*90,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'});}
    if(mode==='remove')return el.animate([{transform:'none',opacity:1,filter:'none'},{transform:'translateY(-30px) scale(.8)',opacity:0,filter:'sepia(1) brightness(.4)'}],{duration:500,delay:i*80,fill:'forwards'});
    return el.animate([{transform:'none'},{transform:'scale(1.08)'},{transform:'scale(.9)',opacity:0}],{duration:360,fill:'forwards'});});
  const wrap=document.querySelector('.reveal-wrap');if(wrap)wrap.animate([{background:getComputedStyle(wrap).backgroundColor},{background:'transparent'}],{duration:560,fill:'forwards'});
  document.querySelector('.reveal')?.querySelectorAll('h2,small.eyebrow,.note,button').forEach(e=>e.style.visibility='hidden');
  Promise.all(anims.map(a=>a.finished)).then(done,done);
}
function applyTag(tag){
  const r=run();
  if(tag==='caps')meta.caps+=4+r.stop;
  else if(tag==='chem'){if(chemTotal()<chemMax()){const id=pick(Object.keys(CHEMS));meta.chems[id]=(meta.chems[id]||0)+1;}}
  else if(tag==='half')r.halfShop=true;
  else if(tag==='reroll')r.freeRerolls+=2;
  else if(tag==='crate')(r.freeBundles=r.freeBundles||[]).push('supply');
  else if(tag==='collector')(r.freeBundles=r.freeBundles||[]).push('collector');
  else if(tag==='cards'){const a=runAddCard(rollCard(true));const b=runAddCard({rank:pick(['A','4','5','6','7','8','9','10']),suit:pick(SUITS),mod:pick(Object.keys(MODS))});showReveal('add','Card Drop','These join your deck.',[a,b]);}
  else if(tag==='shiny'){const pool=meta.deck.filter(c=>isNum(c)&&!c.ed);if(pool.length){const c=pick(pool);c.ed=rollEdition(null);showReveal('change','Polish',`Your ${cardName(c)} is now ${EDITIONS[c.ed].name}. ${EDITIONS[c.ed].desc}`,[c]);}}
  else if(tag==='nest')meta.caps+=Math.min(10,Math.floor(meta.caps/5));
  else if(tag==='grit')r.grit=Math.min(2,Math.max(r.grit||0,(r.grit||0)+1));
  else if(tag==='upgrade')r.freeUpgrade=(r.freeUpgrade||0)+1;
  toast({label:'Boon earned',name:TAGS[tag].name,desc:TAGS[tag].desc});
}
// ---- finish a table ----
function runFinish(winner,ov){
  const r=run(),s=G.runStop,t=G.runTable,lanes=lanesResult(G);
  ov.run=true;r.hands++;const before=meta.caps;
  if(t===2){const bd=G.dealer||{},c=cdx(),bb=c.boss[bd.name]=c.boss[bd.name]||{f:0,w:0};bb.f++;if(winner==='p')bb.w++;bb.rv=bd.rival||null;bb.art=bd.art||null;}
  const extras=[];
  if(G.goldCaps){meta.caps+=G.goldCaps;extras.push(`${G.goldCaps} from Golden cards`);}
  // glass breaks
  const played=new Set(G.glass||[]),spent=new Set(G.spent||[]),keepGlass=gear('jeans')||(has('cannon')&&winner==='p'),gone=new Set([...(keepGlass?[]:played),...spent]);
  if(gone.size)meta.deck=meta.deck.filter((c,i)=>!gone.has(i));
  if(played.size&&!keepGlass)extras.push(`${played.size} glass card${played.size>1?'s':''} broke`);
  if(spent.size)extras.push(`${spent.size} one-use Legend card${spent.size>1?'s':''} used up`);
  if(winner==='p'){
    const neon=[0,1,2].reduce((n,l)=>n+(lanes[l]==='p'?edIn(G.p.cv[l],'neon'):0),0);
    const w=Math.round(tableReward(s,t)*rollerMult()*winMult()*(1+(isChar('harold')?0.5:0.25)*neon));meta.caps+=w;ov.win=w;if(neon)extras.push(`Neon: winnings +${25*neon}%`);
    if(G.wager){const wp=G.wager+Math.round(G.wager*WAGER_ODDS[t]);meta.caps+=wp;extras.push(`Wager paid: +${wp} (your ${G.wager} back plus ${wp-G.wager})`);}
    if(t===2&&isWC()){const b=WC_ROUTE[s];
      if(b&&b.drop&&!b.final){extras.push(wcGive(b.drop,`${wcBoss(s).name} dropped something.`));}
      if(b&&b.comp&&!meta.gear.owned.includes(b.comp)){meta.gear.owned.push(b.comp);extras.push(`${GEAR[b.comp].name} joins you. Hire them at the Mojave Express from now on.`);}
      if(s===4&&!r.losses){meta.charFlags=meta.charFlags||{};if(!meta.charFlags.harold){meta.charFlags.harold=1;ov.newChars=(ov.newChars||[]).concat('harold');}}
      if(s===2)unlock('wc_junk');
    }
    if(t===2&&gear('hat')&&!r.hatUsed&&(r.grit||0)<2){r.hatUsed=true;r.grit=(r.grit||0)+1;extras.push('Desperado Hat: +1 Grit');}
    if(t===2&&isChar('threedog')){r.scrip=(r.scrip||0)+2;meta.scrip=(meta.scrip||0)+2;extras.push('2 NCR dollars for fighting the good fight');}
    if(lanes.every(x=>x==='p')){const sw=sweepBonus(s,t)*(gear('chaps')?2:1);meta.caps+=sw;extras.push(`Triple sale: all three caravans sold, +${sw}`);}
    {const sc=[1,2,3][t]+tierIdx(r.tier);r.scrip=(r.scrip||0)+sc;meta.scrip=(meta.scrip||0)+sc;ov.scrip=sc;}
    if(G.bounty&&bountyMet(G.bounty,lanes)){ov.bountyWon=G.bountyPay;meta.caps+=G.bountyPay;if(has('hunter')&&!r.hunterUsed&&(r.grit||0)<2){r.hunterUsed=true;r.grit=(r.grit||0)+1;extras.push('Bounty Hunter: +1 Grit');}}
    let gild=0;[0,1,2].forEach(l=>{if(lanes[l]==='p')for(const e of G.p.cv[l])if(e.card.mod==='gilded')gild+=3;});
    if(gild){meta.caps+=gild;extras.push(`${gild} from Gilded cards`);}
    if(G.char==='ronald'){meta.caps+=3;extras.push('3 from Bootlegger');}
    const intr=Math.min(interestCap(),Math.floor(before/5));if(intr>0){meta.caps+=intr;extras.push(`${intr} interest`);}
    if(G.char==='nuke'&&chemTotal()<chemMax()){const id=pick(Object.keys(CHEMS));meta.chems[id]=(meta.chems[id]||0)+1;ov.brewed=id;}
    r.won++;
    if(t===2&&s===0)unlock('road_first');
    if(t===2&&s<RUN_STOPS.length&&!isWC()){const pp=TABLE_PROPS.find(x=>x.road===s);if(pp)unlockProp(pp.id);}
    if(t===2){
      if(s===RUN_STOPS.length-1&&!r.endless&&isWC()){
        meta.charFlags=meta.charFlags||{};if(!r.usedChem)meta.charFlags.noChem=1;
        if(!meta.charFlags.vault){meta.charFlags.vault=1;ov.newChars=(ov.newChars||[]).concat('vaultdweller');}
        runWon(ov);
      }else if(s===RUN_STOPS.length-1&&!r.endless){
        meta.stripBy=meta.stripBy||[];const had=CHAR_ORDER.filter(charUnlocked);if(!meta.stripBy.includes(G.char))meta.stripBy.push(G.char);
        meta.charFlags=meta.charFlags||{};if(!r.usedChem)meta.charFlags.noChem=1;if(r.tier!=='copper')meta.charFlags.silver=1;
        for(const id of CHAR_ORDER)if(!had.includes(id)&&charUnlocked(id)){ov.newChar=id;(ov.newChars=ov.newChars||[]).push(id);}
        runWon(ov);
      }else{r.stop++;r.table=0;r.phase='event';{const bp=rollBossPerks();r.bossPick=bp.length?bp:null;r.bossCaps=bossPerkCaps(s);if(bp.length)extras.push('Boss reward: pick a free perk');}if(gear('cargo')){meta.caps+=3;extras.push('3 from Cargo Pants');}r.event=pickEvent();if(r.stop===RUN_STOPS.length-1&&!isWC())unlock('road_strip');if(r.endless){meta.endlessBest=meta.endlessBest||{};meta.endlessBest[r.tier]=Math.max(meta.endlessBest[r.tier]||0,mileOf(r.stop)-1);if(mileOf(r.stop)-1>=5)unlock('beyond5');if(mileOf(r.stop)-1>=10)unlock('beyond10');if(mileOf(r.stop)-1>=20)unlock('beyond20');}}
    }else{r.table++;r.phase='shop';openShop();}
  }else{
    r.losses=(r.losses||0)+1;
    if(G.wager){if(G.walked){meta.caps+=G.wager;extras.push('Wager refunded: you walked away.');}else extras.push(`Lost your ${G.wager}-cap wager.`);}
    if(runV('tin')){const intr=Math.min(interestCap(),Math.floor(before/5));if(intr>0){meta.caps+=intr;extras.push(`${intr} interest (Savings Tin)`);}}
    if(G.walked){
      r.walkUsed=r.walkUsed||{};r.walkUsed[s]=1;ov.saved=true;extras.push('You walked away. No Grit lost.');
      if(t<2){r.table++;r.phase='shop';openShop();ov.movedOn=true;}else r.phase='table';
    }else if((r.grit||0)>0){
      r.grit--;ov.saved=true;ov.grit=true;
      if(t<2){r.table++;r.phase='shop';openShop();ov.movedOn=true;}else r.phase='table';
    }else if(has('insure')){
      meta.perks=meta.perks.filter(p=>p!=='insure');meta.equipped=meta.perks;
      ov.saved=true;r.phase='table';
    }else{ov.runOver=true;runLost();}
  }
  if(isWC()&&r.phase!=='over'&&!ov.runOver){r.days=(r.days||0)-wcCost(t);extras.push(`${wcCost(t)} days on the road · ${Math.max(0,r.days)} left`);
    if(r.days<=0){r.days=0;r.dry=true;ov.runOver=true;r.phase='over';r.result='lost';{const b=r.stop+1;r.scrip=(r.scrip||0)+b;meta.scrip=(meta.scrip||0)+b;r.scripMiles=b;}unlock('wc_dry');
      meta.runHist=meta.runHist||[];meta.runHist.unshift({char:r.char,deck:r.deck,tier:r.tier,stop:r.stop,table:r.table,won:r.won,result:'lost',special:'waterchip',at:Date.now()});meta.runHist=meta.runHist.slice(0,12);}}
  if(has('scav')&&!ov.runOver){const pool=G.a.cv.flat().map(e=>e.card).filter(c=>isNum(c)&&c.suit);if(pool.length){const c=pick(pool);runAddCard({rank:c.rank,suit:c.suit});extras.push(`Scavenger: you pocketed the dealer’s ${cardName(c)}`);}}
  {const rs=r.rs=r.rs||{},g=G.stats||{},add=(k,v)=>{rs[k]=(rs[k]||0)+(v||0);};
   add('turns',g.turns);add('kings',g.kings);add('jacks',g.jacks);add('jokers',g.jokers);add('discards',g.discards);
   if(winner==='p'){add('caps',Math.max(0,meta.caps-before));rs.best=Math.max(rs.best||0,ov.win||0);if(lanes.every(x=>x==='p'))add('sweeps',1);if(ov.bountyWon)add('bounties',1);}}
  ov.extras=extras;ov.delta=meta.caps-before;
}
function runLost(abandon){
  const r=run();
  if(r.endless){r.phase='over';r.result='won';r.fellBeyond=true;r.unlocked=[];const h=(meta.runHist||[])[0];if(h)h.beyond=mileOf(r.stop);return;}
  r.phase='over';r.result='lost';r.endedAt=Date.now();
  if(!abandon){const b=r.stop+1;r.scrip=(r.scrip||0)+b;meta.scrip=(meta.scrip||0)+b;r.scripMiles=b;recordDaily(r,false);}
  meta.runHist=meta.runHist||[];meta.runHist.unshift({char:r.char,deck:r.deck,tier:r.tier,stop:r.stop,table:r.table,won:r.won,result:'lost',at:Date.now()});meta.runHist=meta.runHist.slice(0,12);
  meta.bestStop=Math.max(meta.bestStop||0,r.stop);
}
function runWon(ov){
  const r=run();r.phase='over';r.result='won';recordDaily(r,true);r.endedAt=Date.now();{const c=cdx();for(const id of meta.perks)c.perk[id]=(c.perk[id]||0)|4;}
  meta.runsWon=(meta.runsWon||0)+1;
  meta.runHist=meta.runHist||[];meta.runHist.unshift({char:r.char,deck:r.deck,tier:r.tier,stop:RUN_STOPS.length,won:r.won,result:'won',at:Date.now()});meta.runHist=meta.runHist.slice(0,12);
  meta.bestStop=RUN_STOPS.length;
  const unl=[];
  const di=deckIdx(r.deck);if(di+1<DECKS.length&&meta.decksUnlocked<di+2){meta.decksUnlocked=di+2;unl.push(`${DECKS[di+1].name} deck`);}
  const ti=tierIdx(r.tier);
  const tokenFor=[['kit','marked'],['charm'],['second']][ti];
  for(const tk of tokenFor)if(!meta.tokens.includes(tk)){meta.tokens.push(tk);unl.push(`${TOKENS[tk].name} token`);}
  meta.deckTiers=meta.deckTiers||{};meta.deckWon=meta.deckWon||{};
  if(ti>(meta.deckWon[r.deck]??-1))meta.deckWon[r.deck]=ti;
  if(di+1<DECKS.length&&!meta.deckTiers[DECKS[di+1].id])meta.deckTiers[DECKS[di+1].id]=1;
  if(ti+1<TIERS.length&&deckTierCount(r.deck)<ti+2){meta.deckTiers[r.deck]=ti+2;unl.push(`${TIERS[ti+1].name} for the ${DECKS[di].name}${/deck/i.test(DECKS[di].name)?'':' deck'}`);}
  if(meta.tiersUnlocked<ti+2)meta.tiersUnlocked=ti+2;
  {const b=[10,15,20][ti];r.scrip=(r.scrip||0)+b;meta.scrip=(meta.scrip||0)+b;unl.push(`${b} NCR dollars for making it to Vegas`);}
  r.story=r.story||[];
  if(r.special==='waterchip'){
    r.story.push({title:'The Water Chip',text:'You carry the new water chip home through the desert. Vault 13 will live. The Overseer shakes your hand, thanks you for everything, and tells you that you can never come back: the others would want to follow you out. The vault door rolls shut behind you.'});
    meta.legends=meta.legends||[];if(!meta.legends.includes('waterchip')){meta.legends.push('waterchip');unl.push('The Water Chip now turns up in trading posts');}
    unl.push('Vault Dweller');
    unlock('wc_saved');if((r.days||0)>=100)unlock('wc_100');if(!r.wcSkipped)unlock('wc_noskip');if(r.tier==='gold')unlock('wc_gold');
  }else r.story.push({title:'The High Table',text:EPILOGUE[r.char]||'You made it to Vegas.'});
  if(!r.losses&&r.special!=='waterchip')unlock('flawless');if((r.skips||0)>=5)unlock('skipper');
  unlock('run1');if(r.tier==='silver')unlock('silver_road');if(r.tier==='gold')unlock('gold_road');if(r.deck==='gold')unlock('ladder');
  r.unlocked=unl;ov.unlocked=unl;
}

// ---- wasteland events ----
function wcGive(id,why){
  meta.legends=meta.legends||[];const added=!meta.legends.includes(id);if(added)meta.legends.push(id);
  if(!meta.deck.some(c=>c.legend===id))meta.deck.push({rank:'LG',suit:null,legend:id});
  return `${why} ${LEGENDS[id].name} is in your deck${added?', and from now on it can turn up at trading posts on any run':''}.`;
}
function pickEvent(){const r=run();return withSeed('event:'+(r?r.stop:0),pickEvent0);}
function pickEvent0(){
  const r=run(),normal=Object.keys(EVENTS).filter(k=>!EVENTS[k].wc);
  if(r&&r.special==='waterchip'){
    if(r.stop===2&&!r.junk)return 'junktown';
    const sp=['ufo','footprint','policebox'].filter(k=>!(r.found||[]).includes(k));
    if(sp.length&&Math.random()<0.35)return pick(sp);
  }
  return pick(normal);
}
const EVENTS={
  junktown:{wc:true,title:'Junktown',text:'Junktown’s split in two. Killian Darkwater runs the store and the law; Gizmo runs the casino and wants Killian dead. Whoever you cross is who you’ll face at the boss table.',
    choices:[{label:'Side with Killian: play Gizmo',act:()=>{run().junk='gizmo';(meta.junkFaced=meta.junkFaced||{}).gizmo=1;checkJunk();return 'Killian nods. Gizmo is waiting for you at the casino tables.';}},
             {label:'Side with Gizmo: play Killian',act:()=>{run().junk='killian';(meta.junkFaced=meta.junkFaced||{}).killian=1;checkJunk();return 'Gizmo grins. Killian is waiting behind the counter with a fresh deck.';}}]},
  ufo:{wc:true,title:'A Crashed Flying Saucer',text:'A smoking saucer lies half-buried in the sand. Two very dead little grey pilots. A velvet painting of a familiar singer hangs inside.',
    choices:[{label:'Search the wreck',act:()=>{const r=run();r.found.push('ufo');unlock('wc_ufo');return wcGive('alienblaster','You pry a strange pistol from a dead pilot’s hand.');}},{label:'Leave it alone',act:()=>{run().found.push('ufo');return 'Some things are better left buried.';}}]},
  footprint:{wc:true,title:'A Giant Footprint',text:'A single, enormous footprint, deep in the ground. No other tracks anywhere. There’s a flattened traveler in the middle of it.',
    choices:[{label:'Search the remains',act:()=>{const r=run();r.found.push('footprint');unlock('wc_footprint');return wcGive('stealth','Clutched in a very flat hand:');}},{label:'Back away slowly',act:()=>{run().found.push('footprint');return 'You keep an eye on the sky for the rest of the day.';}}]},
  policebox:{wc:true,title:'An Unusual Call Box',text:'A blue police call box stands alone in the desert. As you walk closer, it groans, wheezes, and fades away.',
    choices:[{label:'Stand where it was',act:()=>{const r=run();r.found.push('policebox');unlock('wc_policebox');r.days=(r.days||0)+20;return 'You feel a little younger. Somehow you’ve gained 20 days.';}}]},
  trader:{title:'A Traveling Trader',text:'A trader with a two-headed mule offers to swap one of your plain number cards for an upgraded one.',
    choices:[{label:'Trade (5 caps)',cost:5,act:()=>{const plain=meta.deck.filter(c=>isNum(c)&&!c.mod);if(!plain.length){meta.caps+=5;return 'You have no plain number cards left to trade. The trader hands your caps back.';}const c=pick(plain);c.mod=pick(Object.keys(MODS));showReveal('change','Traded',`${MODS[c.mod].name}: ${MODS[c.mod].desc}`,[c]);return `Your ${cardName(c)} came back ${MODS[c.mod].name}.`;}},{label:'Spot the best piece in his cart: trade for free',req:['Intelligence',7],act:()=>{const plain=meta.deck.filter(c=>isNum(c)&&!c.mod);if(!plain.length)return 'You have no plain number cards left to trade.';const c=pick(plain);c.mod=pick(Object.keys(MODS));showReveal('change','Good eye',`${MODS[c.mod].name}: ${MODS[c.mod].desc}`,[c]);return `You spot the gem in his cart. Your ${cardName(c)} came back ${MODS[c.mod].name}, no charge.`;}},{label:'Keep walking',act:()=>'The trader shrugs and moves on.'}]},
  toll:{title:'Raider Toll',text:'Raiders block the road and want 10 caps to let you pass.',
    choices:[{label:'Pay up (10 caps)',cost:10,act:()=>'They wave you through.'},{label:'Stare them down',req:['Strength',6],act:()=>'They take one look at you and find somewhere else to be. No toll.'},{label:'Talk the price down (4 caps)',req:['Charisma',7],cost:4,act:()=>'You haggle them down to a fraction. They wave you through, grumbling.'},{label:'Slip past in the dark',req:['Agility',7],act:()=>'You slip through the checkpoint unseen. No toll.'},{label:'Refuse',act:()=>{run().nextRules=['heavy'];return 'They let you pass, but they tip off the next dealer. Your next table: the dealer opens with 2 extra cards.';}}]},
  doctor:{title:'The Strange Doctor',text:'A doctor in a stained coat offers to “reinforce” a card. Results guaranteed, mostly.',
    choices:[{label:'Steel a card (6 caps)',cost:6,act:()=>{const pool=meta.deck.filter(c=>isNum(c)&&!c.mod);if(!pool.length){meta.caps+=6;return 'He can’t find a plain card to work on and gives your caps back, looking disappointed.';}const c=pick(pool);c.mod='steel';showReveal('change','Reinforced',`Steel: ${MODS.steel.desc}`,[c]);return `Your ${cardName(c)} is now Steel.`;}},{label:'Check his work first: Steel a card (3 caps)',req:['Intelligence',7],cost:3,act:()=>{const pool=meta.deck.filter(c=>isNum(c)&&!c.mod);if(!pool.length){meta.caps+=3;return 'No plain card left to work on. He gives your caps back.';}const c=pick(pool);c.mod='steel';showReveal('change','Reinforced',`Steel: ${MODS.steel.desc}`,[c]);return `You spot his shortcuts and haggle. Your ${cardName(c)} is now Steel, for less.`;}},{label:'No thanks',act:()=>'You back away slowly.'}]},
  wreck:{title:'An Abandoned Caravan',text:'A wrecked caravan sits by the road. Something might be worth taking.',
    choices:[{label:'Search the cargo',act:()=>{const a=runAddCard(rollCard(true)),b=runAddCard(rollCard(false));showReveal('add','From the wreck','You pull these out of the cargo. They join your deck.',[a,b]);return `You found ${cardName(a)}${a.mod?` (${MODS[a.mod].name})`:''}${a.ed?` (${EDITIONS[a.ed].name})`:''} and ${cardName(b)}, now in your deck.`;}},{label:'Spot the hidden compartment',req:['Perception',7],act:()=>{const a=runAddCard(rollCard(true));meta.caps+=6;showReveal('add','Hidden in the wreck','Tucked behind a panel where the scavengers never looked.',[a]);return `You spot a hidden compartment: ${cardName(a)} joins your deck, plus 6 caps.`;}},{label:'Pry open the locked crate',req:['Strength',7],act:()=>{const a=runAddCard(rollCard(true)),b=runAddCard(rollCard(true));meta.caps+=6;showReveal('add','From the locked crate','You pry the lid off and take everything. These join your deck, plus 6 caps.',[a,b]);return `You pry it open: ${cardName(a)} and ${cardName(b)} join your deck, and you pocket 6 caps.`;}},{label:'Take the loose caps',act:()=>{meta.caps+=6;return 'You pocket 6 caps.';}}]},
  gambler:{title:'The Coin Flipper',text:'A grinning stranger offers a coin flip: double or nothing on 10 caps.',
    choices:[{label:'Flip (10 caps)',cost:10,act:()=>{if(Math.random()<.5){meta.caps+=20;return 'Heads! You win 20 caps.';}return 'Tails. The stranger laughs and walks off with your caps.';}},{label:'Flip with a lucky coin (10 caps, 70% to win)',req:['Luck',7],cost:10,act:()=>{if(Math.random()<.7){meta.caps+=20;return 'Heads! Your lucky coin comes through. You win 20 caps.';}return 'Tails. Even a lucky coin has off days.';}},{label:'Walk away',act:()=>'Probably wise.'}]},
  shrine:{title:'A Roadside Shrine',text:'An old shrine to a forgotten casino. Leaving an offering here thins your deck of the cards you least need.',
    choices:[{label:'Leave an offering',act:()=>{const lows=meta.deck.map((c,i)=>({c,i})).filter(o=>isNum(o.c)&&!o.c.mod&&val(o.c)<=3).slice(0,3).map(o=>o.i);if(!lows.length)return 'You have no low plain cards to offer. The shrine stays quiet.';if(meta.deck.length-lows.length>=MIN_DECK){const gone=lows.map(i=>meta.deck[i]);meta.deck=meta.deck.filter((c,i)=>!lows.includes(i));showReveal('remove','The offering','These leave your deck for good.',gone);}else return 'Your deck is too thin to give anything up.';return `You removed ${lows.length} low cards from your deck.`;}},{label:'Move on',act:()=>'You tip your hat and keep going.'}]},
  barrel:{title:'A Burn Barrel',text:'A barrel fire crackles by the roadside, and nobody’s watching it. A good place to get rid of cards you don’t want.',
    choices:[{label:'Burn up to 3 cards (free)',act:()=>{openBurn(3,'Burn barrel','Pick up to 3 cards to burn. They’re gone for the rest of the run.');return null;}},{label:'Warm your hands and move on',act:()=>'You warm up and hit the road.'}]},
  campfire:{title:'A Quiet Campfire',text:'Somebody left a fire burning by the road, with a coffee pot still warm. A good place to catch your breath, or to swap tall tales with a passing trader.',
    choices:[{label:'Rest a while (restore 1 Grit, up to 2)',act:()=>{const r=run();if((r.grit||0)<2){r.grit=(r.grit||0)+1;return `You feel steadier. Grit: ${r.grit}.`;}return 'You’re as steady as you get. The coffee was good, though.';}},{label:'Take first watch: restore 1 Grit and +4 caps',req:['Endurance',8],act:()=>{const r=run();r.grit=Math.min(2,(r.grit||0)+1);meta.caps+=4;return `You keep watch while the others sleep. Grit: ${r.grit}, and +4 caps.`;}},{label:'Swap stories (+4 caps)',act:()=>{meta.caps+=4;return 'The trader liked your story enough to pay for it. +4 caps.';}}]},
  medic:{title:'A Wandering Medic',text:'A medic offers chems from her bag at a fair price.',
    choices:[{label:'Buy a random chem (2 caps)',cost:2,act:()=>{if(chemTotal()<chemMax()){const id=pick(Object.keys(CHEMS));meta.chems[id]=(meta.chems[id]||0)+1;return `You got a ${CHEMS[id].name}.`;}meta.caps+=2;return 'Your chem pouch is already full. She waves off the caps and wishes you luck.';}},{label:'Sweet-talk her into a free chem',req:['Charisma',7],act:()=>{if(chemTotal()<chemMax()){const id=pick(Object.keys(CHEMS));meta.chems[id]=(meta.chems[id]||0)+1;return `She laughs, rummages in her bag and hands you a ${CHEMS[id].name}. No charge.`;}return 'Your chem pouch is already full. She wishes you luck anyway.';}},{label:'Decline',act:()=>'She nods and moves along.'}]},
};
Object.assign(EVENTS,{
  ambush:{title:'An Ambush on the Road',text:'The road narrows between two rock walls. Something glints on the ridge above: raiders, waiting. They haven’t seen you yet.',
    choices:[{label:'Spot the best way around',req:['Perception',7],act:()=>{meta.caps+=6;return 'You pick out every raider and slip around. Their stash is unguarded: +6 caps.';}},
             {label:'Dodge through the crossfire',req:['Agility',7],act:()=>'Bullets everywhere, and none of them hit. You’re through before they reload.'},
             {label:'Pay them off (8 caps)',cost:8,act:()=>'They take the caps and look the other way.'},
             {label:'Run for it',act:()=>{run().nextRules=['heavy'];return 'You make it, but they radio ahead. Next table: the dealer opens with 2 extra cards.';}}]},
  safe:{title:'A Pre-War Safe',text:'A rusted safe sits half-buried in the sand, its door welded shut by two centuries of rust. Somebody went to a lot of trouble hiding something in it.',
    choices:[{label:'Crack the combination',req:['Intelligence',7],act:()=>{const c=runAddCard({rank:pick(['A','4','5','6','7','8','9','10']),suit:pick(SUITS),mod:pick(Object.keys(MODS)),ed:rollEdition(null)});meta.caps+=6;showReveal('add','Inside the safe','An upgraded card with a special finish. It joins your deck.',[c]);return `Click. Inside: ${cardName(c)} (${MODS[c.mod].name}, ${EDITIONS[c.ed].name}) and 6 caps.`;}},
             {label:'Force the door',req:['Strength',7],act:()=>{meta.caps+=14;return 'The hinges give with a shriek. You pocket 14 caps from inside.';}},
             {label:'Shake it for loose change',act:()=>{meta.caps+=3;return 'Something rattles. You get 3 caps out of the crack.';}}]},
  radstorm:{title:'A Radstorm',text:'The sky turns green over the ridge. A radstorm is rolling in, fast. Dig in and wait it out, or run for the next town and hope for the best.',
    choices:[{label:'Dig in and wait it out (4 caps of supplies)',cost:4,act:()=>'You sit tight under a tarp until it passes. A little poorer, a lot safer.'},
             {label:'Run through it like you were born to it',req:['Endurance',8],act:()=>{meta.caps+=6;return 'You barely notice. On the far side you find 6 caps in the debris.';}},
             {label:'Spot a shelter in the rocks',req:['Perception',7],act:()=>{meta.caps+=4;return 'You spot an old culvert and ride the storm out in comfort. You even find 4 caps in it.';}},{label:'Run for it',act:()=>{run().nextRules=['light'];return 'You make it, but your hands shake. Next table: you hold one fewer card.';}}]},
});
function eventChoose(i){
  const r=run(),ev=EVENTS[r.event];if(!ev)return;const ch=ev.choices[i];if(!ch)return;
  if(ch.req&&statOf(ch.req[0])<ch.req[1])return;
  if(ch.cost&&meta.caps<ch.cost)return;
  if(ch.cost)meta.caps-=ch.cost;
  {const c=cdx();c.event[r.event]=(c.event[r.event]||0)+1;}
  const res=withSeed('ev:'+r.stop+':'+i,()=>ch.act());if(res!=null)r.eventResult=res;save();
}
function eventDone(){const r=run();r.event=null;r.eventResult=null;r.phase='shop';openShop();save();}

// ---- deck textures (laid over the player's chosen card design) ----
function deckTex(id){
  const W=240,H=336,[c,x]=mkCanvas(W,H),r=rngSeed(id.length*131+7);
  const splat=(sx,sy,R,col)=>{x.fillStyle=col;x.beginPath();x.arc(sx,sy,R,0,7);x.fill();for(let i=0;i<12;i++){const a=r()*7,d=R*(.7+r()*1.2);x.beginPath();x.arc(sx+Math.cos(a)*d,sy+Math.sin(a)*d,R*(.08+r()*.22),0,7);x.fill();}};
  if(id==='sarsaparilla'){
    for(let i=0;i<3;i++){const cx=40+r()*160,cy=60+r()*220,R=26+r()*30;x.strokeStyle=`rgba(110,60,20,${.35+r()*.2})`;x.lineWidth=3+r()*4;x.beginPath();x.arc(cx,cy,R,0,7);x.stroke();
      x.strokeStyle='rgba(110,60,20,.15)';x.lineWidth=10;x.beginPath();x.arc(cx,cy,R-4,r()*3,r()*3+2);x.stroke();}
    for(let i=0;i<3;i++){const dx=20+r()*200,len=30+r()*80;x.strokeStyle='rgba(120,65,20,.45)';x.lineWidth=3+r()*3;x.lineCap='round';x.beginPath();x.moveTo(dx,0);x.lineTo(dx+r()*4,len);x.stroke();}
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(140,80,30,.18)');g.addColorStop(1,'rgba(140,80,30,.05)');x.fillStyle=g;x.fillRect(0,0,W,H);
  }else if(id==='blood'){
    splat(60+r()*120,80+r()*80,14+r()*8,'rgba(120,10,8,.75)');splat(40+r()*160,220+r()*80,8+r()*6,'rgba(120,10,8,.7)');
    for(let i=0;i<40;i++){x.fillStyle=`rgba(110,8,6,${.3+r()*.5})`;x.beginPath();x.arc(r()*W,r()*H,r()*2.2,0,7);x.fill();}
    x.strokeStyle='rgba(110,8,6,.7)';x.lineWidth=3;x.lineCap='round';const dx=50+r()*140;x.beginPath();x.moveTo(dx,40+r()*40);x.lineTo(dx+2,160+r()*60);x.stroke();
  }else if(id==='scorched'){
    const g=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.62);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.75,'rgba(60,25,8,.45)');g.addColorStop(1,'rgba(10,5,2,.95)');x.fillStyle=g;x.fillRect(0,0,W,H);
    for(let i=0;i<60;i++){const e=r()*4|0,t2=r();const px=e<2?t2*W:(e===2?r()*20:W-r()*20),py=e>=2?t2*H:(e===0?r()*20:H-r()*20);x.fillStyle=`rgba(${r()<.3?'255,140,40':'20,10,5'},${.4+r()*.5})`;x.beginPath();x.arc(px,py,1+r()*4,0,7);x.fill();}
  }else if(id==='irradiated'){
    const g=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.65);g.addColorStop(0,'rgba(120,255,90,0)');g.addColorStop(1,'rgba(120,255,90,.5)');x.fillStyle=g;x.fillRect(0,0,W,H);
    for(let i=0;i<70;i++){x.fillStyle=`rgba(150,255,110,${.25+r()*.6})`;x.beginPath();x.arc(r()*W,r()*H,r()*2.4,0,7);x.fill();}
    for(let i=0;i<4;i++){const px=r()*W,py=r()*H,rg=x.createRadialGradient(px,py,0,px,py,30);rg.addColorStop(0,'rgba(140,255,100,.35)');rg.addColorStop(1,'rgba(140,255,100,0)');x.fillStyle=rg;x.fillRect(0,0,W,H);}
  }else if(id==='rust'){
    for(let i=0;i<16;i++){const px=r()*W,py=r()*H,R=12+r()*40,rg=x.createRadialGradient(px,py,0,px,py,R);rg.addColorStop(0,`rgba(${150+r()*40},${60+r()*20},18,${.45+r()*.3})`);rg.addColorStop(1,'rgba(140,60,18,0)');x.fillStyle=rg;x.fillRect(0,0,W,H);}
    for(let i=0;i<500;i++){x.fillStyle=`rgba(${r()<.5?'150,60,20':'80,30,10'},${r()*.4})`;x.fillRect(r()*W,r()*H,1.5,1.5);}
  }else if(id==='bullet'){
    const hole=(hx,hy)=>{const bg=x.createRadialGradient(hx,hy,4,hx,hy,22);bg.addColorStop(0,'rgba(30,15,5,.75)');bg.addColorStop(1,'rgba(30,15,5,0)');x.fillStyle=bg;x.beginPath();x.arc(hx,hy,22,0,7);x.fill();
      x.fillStyle='rgba(240,225,190,.9)';x.beginPath();for(let i=0;i<12;i++){const a=i/12*Math.PI*2,rad=7+r()*5;x.lineTo(hx+Math.cos(a)*rad,hy+Math.sin(a)*rad);}x.closePath();x.fill();
      x.fillStyle='#0c0907';x.beginPath();x.arc(hx,hy,5.5,0,7);x.fill();};
    hole(60+r()*40,80+r()*60);hole(140+r()*60,200+r()*80);
    x.strokeStyle='rgba(30,20,10,.25)';x.lineWidth=1;for(let i=0;i<10;i++){x.beginPath();const sx=r()*W,sy=r()*H;x.moveTo(sx,sy);x.lineTo(sx+(r()-.5)*40,sy+(r()-.5)*40);x.stroke();}
  }else if(id==='gold'){
    const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'rgba(255,215,120,.0)');g.addColorStop(.42,'rgba(255,225,140,.55)');g.addColorStop(.5,'rgba(255,250,220,.75)');g.addColorStop(.58,'rgba(255,225,140,.55)');g.addColorStop(1,'rgba(255,215,120,.0)');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(212,160,60,.9)';x.lineWidth=7;rrect(x,3,3,W-6,H-6,12);x.stroke();
    for(let i=0;i<18;i++){const px=r()*W,py=r()*H;x.fillStyle='rgba(255,250,220,.9)';x.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,rad=k%2?1:4;x.lineTo(px+Math.cos(a)*rad,py+Math.sin(a)*rad);}x.closePath();x.fill();}
  }
  return c.toDataURL();
}
function loadDeckTextures(){
  const css=['[data-deck="plain"],[data-deck=""]{--deck-tex:none}'];
  for(const d of DECKS){if(d.id==='plain')continue;document.documentElement.style.setProperty('--dtex-'+d.id,`url(${deckTex(d.id)})`);
    css.push(`[data-deck="${d.id}"]{--deck-tex:var(--dtex-${d.id});--deck-blend:${d.id==='irradiated'||d.id==='gold'?'screen':'multiply'}}`);}
  const st=document.createElement('style');st.textContent=css.join('\n');document.head.appendChild(st);
}
function mattMode(){
  const r=run(),live=r&&r.phase!=='over';
  let on=false;
  if(screen==='match'&&G&&G.mode==='road')on=G.char==='matt'||!!(G.dealer&&G.dealer.rival==='matt');
  else if(['road','shop'].includes(screen))on=live?r.char==='matt':meta.char==='matt';
  else if(screen==='pickchar')on=meta.char==='matt';
  document.documentElement.classList.toggle('matt',on);
}
function setDeckAttr(){
  mattMode();
  const r=run();const on=r&&r.phase!=='over'&&(screen==='road'||screen==='shop'||(screen==='match'&&G&&G.run));
  document.documentElement.dataset.deck=on?r.deck:'';
}

