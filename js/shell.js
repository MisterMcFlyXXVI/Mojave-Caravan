// ---------- top bar + settings, help, customize ----------
const gearPath=(()=>{const n=8,R=10,r=7.6,cx=12,cy=12;let d='';for(let i=0;i<n*4;i++){const a=(i/(n*4))*Math.PI*2-Math.PI/(n*4),rad=(i%4<2)?R:r;d+=(i?'L':'M')+(cx+Math.cos(a)*rad).toFixed(2)+' '+(cy+Math.sin(a)*rad).toFixed(2);}return d+'Z';})();
const capPoints=(()=>{let d='';for(let i=0;i<36;i++){const a=i/36*Math.PI*2,rad=i%2?11:9.8;d+=(i?'L':'M')+(12+Math.cos(a)*rad).toFixed(2)+' '+(12+Math.sin(a)*rad).toFixed(2);}return d+'Z';})();
const starPts=(cx,cy,R,r)=>{let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rad=i%2?r:R;d+=(i?'L':'M')+(cx+Math.cos(a)*rad).toFixed(2)+' '+(cy+Math.sin(a)*rad).toFixed(2);}return d+'Z';};
const ICONS={
  pencil:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 013 3L8 18.5 4 20z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M13.5 7l3.5 3.5" stroke="currentColor" stroke-width="1.8"/></svg>`,
  cap:`<svg viewBox="0 0 24 24" aria-hidden="true"><defs><radialGradient id="capg" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#8fc0ff"/><stop offset=".55" stop-color="#2f6db8"/><stop offset="1" stop-color="#173a6b"/></radialGradient></defs><path d="${capPoints}" fill="url(#capg)" stroke="#0d2242" stroke-width=".6"/><circle cx="12" cy="12" r="7.3" fill="none" stroke="#cfe3ff" stroke-opacity=".5" stroke-width=".7"/><path d="${starPts(12,12.4,5.4,2.2)}" fill="#f4f8ff"/></svg>`,
  help:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.4 9.4a2.7 2.7 0 115 1.3c-.8.9-2.1 1.3-2.4 2.6v.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1.15" fill="currentColor"/></svg>`,
  gear:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${gearPath}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
};
const TOP_SCREENS=['custom','ach','help','settings'];
let navFrom='home';
// ---- "Add to Home Screen" guide ----
let installOpen=false;
const deviceKind=()=>{const ua=navigator.userAgent||'';if(/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1))return 'ios';if(/Android/i.test(ua))return 'android';return 'other';};
function installHTML(){
  const auto=!meta.installSeen&&!isStandalone()&&deviceKind()!=='other';
  if(!installOpen&&!auto)return '';
  const dev=installOpen?(installOpen==='pick'?deviceKind():installOpen):deviceKind();
  const ios=`<ol class="steps">
      <li>Open this page in <b>Safari</b>. (Other browsers on iPhone can’t add web apps.)</li>
      <li>Tap the <b>Share</b> button: the square with an arrow pointing up. It’s at the bottom of the screen, or at the top on iPad.</li>
      <li>Scroll down and tap <b>Add to Home Screen</b>. If you don’t see it, tap <b>Edit Actions</b> at the bottom of the list and turn it on.</li>
      <li>Check the name says <b>Caravan</b>, then tap <b>Add</b>.</li>
      <li>Open Caravan from its new tile on your Home Screen from now on.</li></ol>`;
  const android=`<ol class="steps">
      <li>Open this page in <b>Chrome</b>.</li>
      <li>Tap the <b>⋮</b> menu in the top-right corner.</li>
      <li>Tap <b>Add to Home screen</b> (on some phones it’s <b>Install app</b>).</li>
      <li>Tap <b>Add</b> (or <b>Install</b>), and confirm if your phone asks where to put it.</li>
      <li>Open Caravan from its new tile on your Home Screen from now on.</li></ol>`;
  const tab=(id,label)=>`<button class="btn${dev===id?' hot':''}" data-installtab="${id}" aria-pressed="${dev===id}">${label}</button>`;
  return `<div class="overlay"><div class="panel result installcard" role="dialog" aria-label="Add Caravan to your Home Screen">
    <h2 style="font-size:24px">Put Caravan on your Home Screen</h2>
    <p>Caravan gets its own tile, so it’s one tap away, just like an app.</p>
    <p class="note"><b>Tip:</b> if the Home Screen version opens without your progress, sign in under Settings in both places and your save comes across.</p>
    <div class="hubbtns" style="margin:8px 0 4px">${tab('ios','iPhone / iPad')}${tab('android','Android')}</div>
    ${dev==='android'?android:ios}
    ${isStandalone()?'<p class="note">You’re already playing from your Home Screen. You’re all set.</p>':''}
    <div class="hubbtns"><button class="btn hot" data-installclose>Got it</button></div>
    <p class="note">You can find these steps again any time in Settings.</p>
  </div></div>`;
}
function topbarHTML(){
  const newAch=ACH.filter(a=>meta.ach[a.id]).length>(meta.achSeen||0);
  const b=(go,label,icon,extra='')=>`<button class="tb${screen===go?' on':''}" data-go="${go}" aria-label="${label}" title="${label}">${ICONS[icon]}${extra}</button>`;
  return `<header class="topbar">
    <button class="wordmark" data-go="home" aria-label="Home: choose a mode">CARAVAN</button>
    <nav aria-label="Menu">${b('custom','Decks and customization','pencil')}${b('ach','Achievements','cap',newAch?'<i class="dot" aria-label="new"></i>':'')}${b('help','Rules and FAQ','help')}${b('settings','Settings','gear')}</nav>
  </header>`;
}
function resumeHTML(){
  const m=meta.lastMode; if(!m)return '';
  const label=m==='road'?'The Road':m==='campaign'?'Classic campaign':'Classic';
  const go=m==='campaign'?(meta.classic.camp?'campaign':'classic'):m;
  return `<button class="resume" data-go="${go}"><span>Continue</span><b>${label}</b><em>→</em></button>`;
}
const ROAD_RULES=`
  <li>A <b>run</b> is six stops from Goodsprings to the Strip. Every stop has three tables: a Saloon table, a High Stakes table and a Boss table.</li>
  <li><b>Grit:</b> you start each run with 1. Lose a Saloon or High Stakes table and you spend 1 Grit and move on without the reward. Lose a Boss and you spend 1 Grit to try again. <b>With no Grit left, any loss ends the run.</b> Campfires on the road can restore Grit (up to 2).</li>
  <li>You can <b>skip</b> the Saloon or High Stakes table: you give up its winnings to earn a <b>boon</b> instead (caps, cards, a free bundle or chem, a card finish, Grit, shop discounts and more). Boons change every run, and each table shows its boon. The Boss table can’t be skipped.</li>
  <li>Some number cards in the shop have a <b>special finish</b>: <b>Holographic</b> (its caravan can sell 1 higher), <b>Golden</b> (+3 caps each time you play it), <b>Neon</b> (+25% winnings if its caravan sells) or <b>Ghost</b> (doesn’t take a hand slot). The <b>Collector’s bundle</b> only has finished cards. Like everything you buy on the Road, they last for the run.</li>
  <li>Cards you add during a run wear the back of a <b>Pack</b> you’ve earned (or a different Classic back if you haven’t earned any yet), so you can spot them coming off your deck.</li>
  <li><b>Bosses</b> bring random rules that change every run, and they stack up the further you go. Read them on the map before you deal in.</li>
  <li>Win a table with <b>all three caravans sold</b> and you get a <b>triple sale</b> bonus: half the table’s base winnings on top.</li>
  <li>Every run starts with a 54-card deck and a few caps. The <b>Plain deck</b> has no twist; win runs to unlock tougher decks (each with its own twist), and win each deck to open its Silver and Gold difficulties. Win tables to earn caps, plus <b>interest</b>: 1 cap for every 5 you hold, up to 5 (less on some decks and difficulties).</li>
  <li>Between tables, the <b>trading post</b> sells perks, single cards, chems, card upgrades and one voucher per stop. Reroll it if you don’t like what’s there.</li>
  <li><b>Card bundles</b> show you several cards and let you keep some: a Saddlebag (keep 1 of 3), a Supply bundle or Caravan haul (keep 2 of 5), a themed bundle of one suit or of Kings and Queens, or a Collector’s bundle (keep 1 of 4, all special finishes). You can always take nothing.</li>
  <li>The <b>Burn pile</b> removes up to 2 cards from your deck for good, once per visit. A thinner deck draws your best cards more often. Watch for free burn barrels on the road, too.</li>
  <li><b>Boss rewards:</b> beat a boss (other than the last) and choose one of three uncommon-or-better perks for free, or take caps instead. With full perk slots, sell one in the trading post first.</li>
  <li><b>Road events:</b> some choices need a stat from your character’s bio: Strength, Smarts, Charm, Grit or Luck. Choices you can’t take show what they need, so different characters see different options.</li>
  <li><b>Seeds and the daily run:</b> every run has a seed, shown on the map. The same seed gives the same bosses, shops and events. The Daily run is the same road for everyone today (set character, Plain deck, Copper, no gear), and your first finish each day pays NCR dollars and builds a streak.</li>
  <li><b>The Codex</b> (from the Road menu or after a run) remembers every perk, boss and event you’ve met, and each run ends with a summary of how it went.</li>
  <li><b>Wagers and boss swaps:</b> before a table you can stake some caps (up to 5, plus 3 per stop). Win and you get the stake back with a bonus: 50% at a Saloon table, 100% at High Stakes, 150% at a Boss. Lose and it’s gone, though walking away in Pre-War Sneakers refunds it. Before a boss, you can also bribe the house to swap one of the boss’s rules for one of two others, once per boss.</li>
  <li><b>Boss signatures:</b> many bosses have a once-per-hand trick: a knife that knocks a card off your biggest caravan, a hug that costs you a turn, a Platinum Chip that widens their sell range, extra cards, or ties going to the house. It shows as a countdown chip at the table and on the pre-hand screen, so you can plan around it. Silver and Gold roads fire it earlier.</li>
  <li><b>Perks</b> come in four rarities. You start with 3 slots, get a 4th from Boulder City on and a 5th from Fremont Street on. Sell a perk to make room.</li>
  <li><b>Card upgrades</b>: Steel can’t be Jacked, Gilded pays caps when it sells, Lucky draws an extra card, Glass is worth double but breaks, Wild matches any suit.</li>
  <li><b>Chems</b> are one-use boosts during a hand, one per turn, after the opening.</li>
  <li><b>Characters</b> each bend the rules (except Matt, who is just Matt), and each meets a different set of rivals on the way. Beat Greg at the Strip as any starting character to unlock him; beat Jeanita there as Greg to unlock her.</li>
  <li>Win a run and you can keep going <b>Beyond the Strip</b>: endless stops with more boss rules and sharper dealers. Your best distance is saved per difficulty.</li>
  <li><b>Win a run</b> to unlock the next deck on the ladder (each has its own look and twist) and new tokens. Difficulty is per deck: win with a deck on Copper to open Silver for that deck, then win it on Silver to open Gold. The dots beside each deck show the highest difficulty you’ve beaten with it.</li>
  <li><b>NCR dollars</b> are the money you keep between runs, even when a run ends badly. You earn it for every table you win and for every run. Spend it at the <b>Mojave Express</b> office on gear: headwear, coat, pants, shoes, a gun, a melee weapon and a throwable. Wear one piece per slot and it’s applied at the start of your next run.</li>
  <li><b>Companions</b> are the eighth Mojave Express slot: Dogmeat, Codsworth, Piper, Cass, Fawkes, ED-E, Boone and Nick Valentine each travel with you and bring their own trick. Your companion sits at the table with you. On the Water Chip run you can also meet Ian, Tycho and Katja; once they’ve joined you, they’re yours to hire here.</li>
  <li><b>Legend cards</b> are bought at the Mojave Express to add them to the trading posts. Once you buy one on the road it lives in your deck. Select it in your hand and tap Play: it doesn’t use your turn, and you draw a replacement. They can’t be played during the opening three turns.</li>`;
const FAQ=[
  ['Why can’t I play a card there?','A number card has to follow the caravan’s direction (higher if it’s climbing, lower if it’s falling) unless it matches the caravan’s current suit, and it can never repeat the value right before it. Tap a card and the places it can go will glow. If nothing glows, discard it.'],
  ['What does “Sell 21–26” mean?','A caravan counts once its total is 21 to 26 and beats the one facing it. Some Road tables and perks change that range; the chips above the table show the current one.'],
  ['When does a hand end?','When all three pairs of caravans are settled at the same time. Whoever sold two or three wins. If two facing caravans tie, the hand keeps going.'],
  ['What happens if I run out of cards?','You lose the hand, as in the original. Disbanding and discarding both burn through your deck, so use them with care.'],
  ['How do I earn caps?','On the Road, win tables, hit bounties at Boss tables and let your caps earn interest (1 for every 5 you hold). Road caps only last for the run. In the Classic campaign, win your bets. The two modes keep separate wallets.'],
  ['I lost a table. Is that it?','On the Road, not always. Every run starts with 1 Grit. Lose a Saloon or High Stakes table and you spend it and move on without the reward; lose a Boss table and you spend it to try again. With no Grit left, a loss ends the run. The Second Wind token adds Grit, campfires restore it, and the Guardian Angel perk saves you once. In the Classic campaign, you never get stuck: Dusty Rita’s table is always open and pays 5 caps per win while you’re under 25 caps, and Velma will lend you caps for a flat 20% fee.'],
  ['Are these the real rules?','Classic follows the Caravan rules from Fallout: New Vegas. The Road uses the same rules underneath, with perks, chems, house rules and bounties on top.'],
  ['How many of one card can I have?','In Classic, one copy per pack. You start with one pack, your starter deck, in whichever Classic Card Back you pick. Each pack you earn through achievements is another full set of cards. So two J♠ have to come from two different packs, and in play you can see which pack each card came from by its back. The Road has no limit.'],
  ['Does my progress sync?','Yes, once you sign in under Settings (the gear). Everything syncs: progress, decks, achievements and your table style.'],
  ['How do I put it on my home screen?','On iPhone, open the game in Safari, tap Share, then Add to Home Screen. It opens full screen like an app.'],
];
function renderHelp(){
  app.innerHTML=`
  <div class="mbar">${backBtn(navFrom,'Back')}</div>
  <section class="panel">
    <h2 style="font-size:28px">Rules &amp; help</h2>
    <div class="hubbtns"><button class="btn hot" data-rundown>How a round works</button><button class="btn" data-cplay="-1">Replay basics tutorial</button><button class="btn" data-play="-2">Replay Road tutorial</button></div>
    <details class="rules" open><summary>How Caravan works</summary><div class="rulebook">${RULES_HTML}</div></details>
    <details class="rules"><summary>The Road</summary><ul>${ROAD_RULES}</ul></details>
    <details class="rules"><summary>Classic campaign</summary><ul>
      <li>Start with one full 54-card pack and ${CAMP_START} caps. Travel six towns, from Goodsprings to the Strip. Each has three regulars, a champion, a high-roller table, a vendor and side challenges.</li>
      <li>Beat two regulars to face the town champion. Beat the champion to open the next town and win their purse, a trophy card from their own pack, and a holotape about the Old Man.</li>
      <li>Wins and challenges earn reputation in that town: Regular (vendor 10% off), Respected (opens the high-roller table), Legend (20% off and more stock).</li>
      <li>Beat the Old Man at the High Table and the circuit starts over meaner: sharper dealers, more Kings and Jokers, higher limits, and challenges pay again. Your collection, trophies and reputation carry over.</li>
      <li>Pick your bet before each game, up to the dealer’s table limit. Win and they pay it; lose and you pay it. A Friendly game risks nothing and pays nothing.</li>
      <li>Low on caps? Dusty Rita’s table in Goodsprings is always open: no bet, and she pays you 5 caps when you win, as long as you’re holding under 25. Velma will also lend you 25 or 50 caps for a flat 20% fee; half of every win pays it back.</li>
      <li>Every town has its own vendor with different stock. Buy cards and full packs, sell spares for half, and build your deck from your collection for free with Edit deck.</li>
      <li>You start with one pack (your starter deck). Each pack you earn through achievements adds another full set of cards. You can own one copy of each card per pack (Jokers: two per pack).</li></ul></details>
    <h3 class="sub">FAQ</h3>
    <div class="faq">${FAQ.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  </section>`;
}
function renderSettings(){
  const o=meta.opt;
  setTimeout(()=>{if(installOpen&&screen==='settings'&&!document.querySelector('.installcard'))app.insertAdjacentHTML('beforeend',installHTML());},0);
  const seg=(key,val,label)=>`<button class="btn${o[key]===val?' hot':''}" data-opt="${key}:${val}" aria-pressed="${o[key]===val}">${label}</button>`;
  app.innerHTML=`
  <div class="mbar">${backBtn(navFrom,'Back')}</div>
  ${accountHTML().replace('style="margin-top:16px"','')}
  <section class="panel" style="margin-top:14px">
    <h2 style="font-size:24px">Gameplay</h2>
    <button class="prow" data-installopen style="margin-bottom:10px"><div><b>Add Caravan to your Home Screen</b><span>Step-by-step for iPhone and Android, so the game opens like an app.</span></div></button>
    <h3 class="sub">Dealer speed</h3>
    <div class="hubbtns" style="margin-top:0">${seg('speed','slow','Relaxed')}${seg('speed','normal','Normal')}${seg('speed','fast','Fast')}</div>
    <h3 class="sub">Effects</h3>
    <button class="prow toggle" data-opt="motion:${o.motion===false}" aria-pressed="${o.motion!==false}" style="margin-bottom:8px"><div><b>Card animations ${o.motion!==false?'on':'off'}</b><span>Cards fly, flip and shuffle; Jacks tear, Jokers blast, sold caravans get stamped. Turn off for instant moves.</span></div><span class="sw" aria-hidden="true"></span></button>
    <button class="prow toggle" data-opt="ambience:${o.ambience===false}" aria-pressed="${o.ambience!==false}" style="margin-bottom:8px"><div><b>Saloon lighting ${o.ambience!==false?'on':'off'}</b><span>A flickering lamp and drifting smoke over the card table.</span></div><span class="sw" aria-hidden="true"></span></button>
    <button class="prow toggle" data-opt="dust:${!o.dust}" aria-pressed="${o.dust}"><div><b>Drifting dust ${o.dust?'on':'off'}</b><span>The dust that floats across the screen. Turn it off for a cleaner look or to save battery.</span></div><span class="sw" aria-hidden="true"></span></button>
    <button class="prow toggle" data-opt="sound:${!o.sound}" aria-pressed="${o.sound}" style="margin-top:8px"><div><b>Sound effects ${o.sound?'on':'off'}</b><span>Card snaps, cap clinks and a chime when it’s your turn.</span></div><span class="sw" aria-hidden="true"></span></button>
    <button class="prow toggle" data-opt="haptics:${!o.haptics}" aria-pressed="${o.haptics}" style="margin-top:8px"><div><b>Vibration ${o.haptics?'on':'off'}</b><span>A short buzz on your turn and at the end of a hand. Works on Android; iPhone browsers don’t let websites vibrate.</span></div><span class="sw" aria-hidden="true"></span></button>
    <button class="prow toggle" data-opt="confirm:${!o.confirm}" aria-pressed="${o.confirm}" style="margin-top:8px"><div><b>Warn before busting ${o.confirm?'on':'off'}</b><span>Asks before you push one of your own caravans past its sell range.</span></div><span class="sw" aria-hidden="true"></span></button>
  </section>
  <section class="panel" style="margin-top:14px">
    <h2 style="font-size:24px">Your data</h2>
    <p class="note">Progress for every mode saves in this browser${syncState==='on'?' and in your account':''}.</p>
    <button class="btn${armedFold?' armed':''}" data-reset>${armedFold?'Tap again to wipe everything':'Start over'}</button>
  </section>
  <section class="panel" style="margin-top:14px">
    <h2 style="font-size:24px">About</h2>
    <p class="note">Mojave Caravan is a personal fan project, made to play with friends and family. Three ways to play: Classic single games, the Classic campaign and The Road.</p>
  </section>`;
}
function renderCustom(){
  const C=meta.classic, cp=C.camp, L=meta.look;
  const nm=(kind,id)=>(LOOKS[kind].find(o=>o.id===id)||{}).name||id;
  const row=(title,sub,btn,mile)=>`<div class="stop"><div class="mile">${mile}</div><div><div class="place">${title}</div><div class="who">${sub}</div></div>${btn}</div>`;
  app.innerHTML=`
  <div class="mbar">${backBtn(navFrom,'Back')}</div>
  <section class="panel">
    <h2 style="font-size:28px">Customize</h2>
    <h3 class="sub">Decks</h3>
    <div class="road">
      ${row('Classic single game',C.deck?`${C.deck.length} cards · bought with a ${CL_BUDGET}-cap budget`:'No deck yet',`<button class="btn" data-build="quick">${C.deck?'Edit':'Buy'}</button>`,C.deck?C.deck.length:'–')}
      ${row('Classic campaign',cp?`${countsSize(cp.deck)} cards in your deck · ${countsSize(cp.coll)} in your collection`:'Start the campaign to get your first set.',cp?`<button class="btn" data-build="camp">Edit</button>`:`<button class="btn" data-go="classic">Go</button>`,cp?countsSize(cp.deck):'–')}
      ${row('The Road','Your Road deck is rebuilt every run, starting from the Plain deck. Your starting cards use your Classic Card Back; cards you add during a run use the backs of your Packs.','<button class="btn" data-go="road">Go</button>',runLive()?meta.deck.length:'–')}
    </div>
    <h3 class="sub">Cards &amp; table</h3>
    <div class="road">
      <div class="stop"><div class="mile"><div class="card back" style="--cw:30px"></div></div>
        <div><div class="place">Look</div><div class="who">${esc(nm('font',L.font||'deco'))} font · ${esc(nm('face',L.face))} faces · ${esc(nm('back',L.back))} Classic Card Back · ${esc(nm('mat',L.mat))}${L.four?' · four-color suits':''}</div></div>
        <button class="btn" data-go="look">Change</button></div>
      <div class="stop"><div class="mile num">${packCount()}</div>
        <div><div class="place">Packs</div><div class="who">${packCount()===1?'Just your starter deck so far.':`Your starter deck plus ${packCount()-1} earned: ${packList().slice(1).map(backName).join(', ')}.`} Earn more through achievements.</div></div>
        <button class="btn" data-go="ach">Achievements</button></div>
    </div>
  </section>`;
}
// ---------- sound (synthesized, no files) and vibration ----------
let AC=null;
function audio(){
  if(!meta||!meta.opt.sound)return null;
  try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC;}catch(e){return null;}
}
function noiseBuf(a,dur){const b=a.createBuffer(1,Math.floor(a.sampleRate*dur),a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);return b;}
function tone(a,t,f,dur,type,vol,f2){const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g).connect(a.destination);o.start(t);o.stop(t+dur+.02);}
function burst(a,t,dur,freq,q,vol,type){const s=a.createBufferSource();s.buffer=noiseBuf(a,dur);const f=a.createBiquadFilter();f.type=type||'bandpass';f.frequency.value=freq;f.Q.value=q;const g=a.createGain();g.gain.value=vol;s.connect(f).connect(g).connect(a.destination);s.start(t);}
function sfx(kind,by){
  const a=audio();if(!a)return;const t=a.currentTime+.005,soft=by==='a'?.55:1;
  try{
    if(kind==='snap')burst(a,t,.07,2400,1.2,.5*soft);
    else if(kind==='face'){burst(a,t,.07,2000,1.2,.45*soft);tone(a,t+.02,180,.12,'sine',.18*soft,120);}
    else if(kind==='jack'){burst(a,t,.18,900,.7,.35*soft,'highpass');tone(a,t,300,.18,'triangle',.08*soft,90);}
    else if(kind==='swish')burst(a,t,.14,1500,.6,.25*soft,'highpass');
    else if(kind==='clink'){tone(a,t,2300,.14,'sine',.12);tone(a,t+.06,3400,.12,'sine',.08);}
    else if(kind==='turn')tone(a,t,880,.16,'sine',.05);
    else if(kind==='win'){[523,659,784,1046].forEach((f,i)=>tone(a,t+i*.09,f,.28,'triangle',.12));}
    else if(kind==='lose'){tone(a,t,330,.5,'sine',.12,190);}
    else if(kind==='shuffle'){for(let i=0;i<9;i++)burst(a,t+i*.045,.05,2600+i*90,1.4,.18);}
    else if(kind==='stamp'){burst(a,t,.12,180,.8,.9,'lowpass');tone(a,t,90,.18,'sine',.25,50);}
    else if(kind==='tear'){burst(a,t,.32,3200,.5,.32,'highpass');burst(a,t+.08,.2,1800,.8,.2);}
    else if(kind==='blast'){burst(a,t,.6,220,.6,.8,'lowpass');tone(a,t,70,.5,'sine',.3,30);}
    else if(kind==='shot'){burst(a,t,.09,1200,.6,.9);burst(a,t+.02,.3,300,.5,.4,'lowpass');}
    else if(kind==='burn'){burst(a,t,.9,900,.3,.22);burst(a,t+.2,.7,2400,.4,.12,'highpass');}
    else if(kind==='bust'){tone(a,t,160,.25,'sawtooth',.06,90);}
  }catch(e){}
}
function buzz(p){try{if(meta&&meta.opt.haptics&&navigator.vibrate)navigator.vibrate(p);}catch(e){}}
document.addEventListener('pointerdown',()=>{if(meta&&meta.opt.sound)audio();},{passive:true});

// ---------- Road: summary before dealing in ----------
// ---------- account sync (Firebase: Google or email sign-in, Firestore storage) ----------
// Paste your Firebase web config here (Firebase console → Project settings → Your apps → Config).
// These values are public by design; your Firestore security rules are what protect the data.
const FIREBASE_CONFIG={
  apiKey:'AIzaSyBQTKX8mLACmCRNqvxHZ2S3NG-GS9bKROw',
  authDomain:'mojave-caravan.firebaseapp.com',
  projectId:'mojave-caravan',
  storageBucket:'mojave-caravan.firebasestorage.app',
  messagingSenderId:'590352655819',
  appId:'1:590352655819:web:e622132ed2fed71ec6424e'
};
/* Example shape:
const FIREBASE_CONFIG={
  apiKey:"...", authDomain:"your-project.firebaseapp.com", projectId:"your-project",
  storageBucket:"your-project.appspot.com", messagingSenderId:"...", appId:"..."
};
*/
const FB_VERSION='10.12.2';
const isStandalone=()=>{try{return window.navigator.standalone===true||window.matchMedia('(display-mode: standalone)').matches;}catch(e){return false;}};
let fb=null, user=null, syncState='off', pushTimer=null, lastSync=null, authMsg='', authBusy=false, pendingChoice=null;
const authForm={email:'',pass:''};
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
async function initSync(){
  if(!FIREBASE_CONFIG){syncState='unconfigured';render();return;}
  try{
    const base=`https://www.gstatic.com/firebasejs/${FB_VERSION}/`;
    await loadScript(base+'firebase-app-compat.js');
    await Promise.all([loadScript(base+'firebase-auth-compat.js'),loadScript(base+'firebase-firestore-compat.js')]);
    const cfg={...FIREBASE_CONFIG};
    // A home-screen app can't use the cross-site redirect, so it signs in through this site's own /__/auth proxy (see vercel.json).
    if(isStandalone()&&location.protocol==='https:')cfg.authDomain=location.host;
    if(!firebase.apps.length)firebase.initializeApp(cfg);
    fb={auth:firebase.auth(),db:firebase.firestore()};
    syncState='signedout';
    fb.auth.getRedirectResult().catch(e=>{authMsg=authError(e);render();});
    fb.auth.onAuthStateChanged(async u=>{
      user=u;
      if(u){syncState='on';try{await pullCloud(true);}catch(e){authMsg='Couldn’t reach your account. Your progress is still saved on this device.';}}
      else syncState='signedout';
      render();
    });
  }catch(e){syncState='unavailable';}
  render();
}
const cloudRef=()=>fb.db.collection('caravan').doc(user.uid);
const hasProgress=m=>!!m&&((m.wins||0)+(m.losses||0)>0||m.tutorialDone||m.roadTutDone||(m.classic&&((m.classic.wins||0)+(m.classic.losses||0)>0||m.classic.camp)));
function schedulePush(){
  if(!user||!fb||pendingChoice)return;
  clearTimeout(pushTimer);
  pushTimer=setTimeout(pushNow,3000);
}
async function pushNow(){
  if(!user||!fb)return;
  clearTimeout(pushTimer);
  try{
    meta.syncUid=user.uid;
    await cloudRef().set({data:JSON.stringify(meta),updatedAt:meta.updatedAt||Date.now(),app:'mojave-caravan'});
    lastSync=new Date(); if(screen==='home')render();
  }catch(e){authMsg='Sync failed. Your progress is still saved on this device.';if(screen==='home')render();}
}
function adoptCloud(cloud){
  const inMatch=screen==='match'&&G&&!G.over;
  const keepAch=Object.assign({},meta&&meta.ach), keepSeen=(meta&&meta.achSeen)||0;
  meta=migrate(cloud); meta.syncUid=user.uid;
  // never lose an achievement when switching to the account copy
  for(const [k,v] of Object.entries(keepAch))if(!meta.ach[k]||v<meta.ach[k])meta.ach[k]=v;
  meta.achSeen=Math.max(meta.achSeen||0,keepSeen);
  achSilent=true;const n=checkState();achSilent=false;
  if(n>0||Object.keys(keepAch).length)setTimeout(()=>{save();},0);
  if(inMatch)meta.match=G; else{G=null;if(['match','build','vendor','shop'].includes(screen))screen='home';}
  applyLook();
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(meta));}catch(e){}
  lastSync=new Date();
}
async function pullCloud(first){
  const snap=await cloudRef().get();
  if(!snap.exists){await pushNow();return;}
  const cloud=JSON.parse(snap.data().data);
  if(first&&meta.syncUid!==user.uid&&hasProgress(meta)&&hasProgress(cloud)&&JSON.stringify(cloud)!==JSON.stringify(meta)){
    pendingChoice={cloud,when:snap.data().updatedAt};render();return;
  }
  if((cloud.updatedAt||0)>(meta.updatedAt||0)){adoptCloud(cloud);render();}
  else if((cloud.updatedAt||0)<(meta.updatedAt||0)||meta.syncUid!==user.uid)await pushNow();
  else lastSync=new Date();
}
function authError(e){
  const c=(e&&e.code)||'';
  if(c.includes('popup-closed')||c.includes('cancelled-popup'))return '';
  if(c.includes('invalid-credential')||c.includes('wrong-password')||c.includes('user-not-found'))return 'That email and password don’t match an account.';
  if(c.includes('email-already-in-use'))return 'There’s already an account with that email. Try signing in instead.';
  if(c.includes('weak-password'))return 'Use a password with at least 6 characters.';
  if(c.includes('invalid-email'))return 'That doesn’t look like an email address.';
  if(c.includes('unauthorized-domain'))return 'This website isn’t on the Firebase authorized domains list yet.';
  if(c.includes('operation-not-allowed'))return 'This sign-in method isn’t switched on in Firebase yet.';
  if(c.includes('network'))return 'No connection. Try again when you’re online.';
  return 'Sign-in didn’t work. Try again.';
}
async function doAuth(kind){
  if(!fb||authBusy)return;
  authMsg='';authBusy=true;render();
  try{
    if(kind==='google'){
      const prov=new firebase.auth.GoogleAuthProvider(); prov.setCustomParameters({prompt:'select_account'});
      if(isStandalone())await fb.auth.signInWithRedirect(prov);
      else try{await fb.auth.signInWithPopup(prov);}
      catch(e){if(/popup-blocked|operation-not-supported|web-storage-unsupported/.test(e.code||''))await fb.auth.signInWithRedirect(prov);else throw e;}
    }else if(kind==='login'){await fb.auth.signInWithEmailAndPassword(authForm.email.trim(),authForm.pass);}
    else if(kind==='signup'){const r=await fb.auth.createUserWithEmailAndPassword(authForm.email.trim(),authForm.pass);try{await r.user.sendEmailVerification();}catch(e){}}
    else if(kind==='reset'){
      if(!authForm.email.trim()){authMsg='Type your email first, then tap Forgot password.';}
      else{await fb.auth.sendPasswordResetEmail(authForm.email.trim());authMsg='Password reset email sent. Check your inbox.';}
    }else if(kind==='signout'){await pushNow();await fb.auth.signOut();authMsg='Signed out. Your progress stays on this device.';}
    else if(kind==='syncnow'){await pullCloud(false);}
  }catch(e){authMsg=authError(e);}
  authBusy=false;authForm.pass=kind==='login'||kind==='signup'?'':authForm.pass;render();
}
function accountHTML(){
  let body='';
  if(syncState==='unconfigured')body=`<p class="note">Sign-in isn’t switched on for this copy of the game yet.</p>`;
  else if(syncState==='unavailable')body=`<p class="note">Sign-in can’t load here. If you’re in the claude.ai preview, open the game on your own website to sync. Otherwise, check your connection.</p>`;
  else if(syncState==='off')body=`<p class="note">Loading sign-in…</p>`;
  else if(syncState==='on'&&user)body=`
    <div class="acct-on"><div><b>${esc(user.email||user.displayName||'Signed in')}</b><span>${lastSync?`Synced ${lastSync.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`:'Syncing…'}</span></div>
      <div class="acct-btns"><button class="btn" data-auth="syncnow" ${authBusy?'disabled':''}>Sync now</button><button class="btn ghost" data-auth="signout" ${authBusy?'disabled':''}>Sign out</button></div></div>`;
  else body=`
    <p class="note">Sign in to keep your progress, decks and table style in sync across your phone and computer.</p>
    <button class="btn hot gbtn" data-auth="google" ${authBusy?'disabled':''}>Continue with Google</button>
    <div class="or">or use email</div>
    <form class="authform" onsubmit="return false">
      <label for="auth-email">Email</label><input id="auth-email" type="email" autocomplete="email" value="${esc(authForm.email)}">
      <label for="auth-pass">Password</label><input id="auth-pass" type="password" autocomplete="current-password" value="${esc(authForm.pass)}">
      <div class="acct-btns"><button class="btn" data-auth="login" ${authBusy?'disabled':''}>Sign in</button><button class="btn" data-auth="signup" ${authBusy?'disabled':''}>Create account</button><button class="btn ghost" data-auth="reset" ${authBusy?'disabled':''}>Forgot password</button></div>
    </form>`;
  return `<section class="panel acct" style="margin-top:16px"><div class="sect-h"><h2>Account &amp; sync</h2>${syncState==='on'?'<span class="tag">SYNC ON</span>':''}</div>${body}${authMsg?`<p class="hint" style="text-align:left;color:var(--neon)" aria-live="polite">${esc(authMsg)}</p>`:''}</section>`;
}
function choiceHTML(){
  if(!pendingChoice)return '';
  const c=pendingChoice.cloud, when=pendingChoice.when?new Date(pendingChoice.when).toLocaleString():'';
  const sum=m=>`Road: ${m.caps} caps, ${m.beaten.length}/10 tables · Classic: ${m.classic.wins}W ${m.classic.losses}L${m.classic.camp?`, campaign ${m.classic.camp.wins||0}W`:''}`;
  return `<div class="overlay"><div class="panel result" style="text-align:left">
    <h2 style="font-size:26px">Which save do you want?</h2>
    <p>There’s progress on this device and in your account. Pick one to keep. The other will be replaced.</p>
    <button class="spoil" data-choose="cloud"><b>Use my account save</b><span>${esc(sum(migrate(JSON.parse(JSON.stringify(c)))))}${when?` · last saved ${esc(when)}`:''}</span></button>
    <button class="spoil" data-choose="local" style="margin-top:8px"><b>Keep this device’s save</b><span>${esc(sum(meta))}</span></button>
  </div></div>`;
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&user&&fb&&!pendingChoice)pullCloud(false).catch(()=>{});});

