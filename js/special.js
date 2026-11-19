// SPECIAL: Strength, Perception, Endurance, Charisma, Intelligence, Agility, Luck.
// Every character has a base value (1-10) for each in CHAR_BIO[id].stats, in that order. Equipped gear adds modifiers
// (GEAR[id].sp), and the result, clamped to 1-10, drives the effects below. SPX is the single source of truth for those
// effects: the game's rules read it, and specialEffects() builds the on-screen text from the same numbers.
const SPECIAL=[
  {k:'S',name:'Strength'},{k:'P',name:'Perception'},{k:'E',name:'Endurance'},{k:'C',name:'Charisma'},
  {k:'I',name:'Intelligence'},{k:'A',name:'Agility'},{k:'L',name:'Luck'},
];
const STAT_NAMES=SPECIAL.map(x=>x.name);
const statIdx=n=>SPECIAL.findIndex(x=>x.k===n||x.name===n);

const SPX={
  chems:S=>Math.max(1,3+(S>=7?1:0)+(S>=10?1:0)-(S<=3?1:0)),   // chems you can carry
  ceiling:S=>S>=9?1:0,                                        // sell ceiling bonus
  bundleSee:P=>P>=10?2:P>=7?1:P<=3?-1:0,                      // extra cards shown in every bundle
  peek:P=>P>=10,                                              // always see the dealer's hand
  grit:E=>(E>=10?1:0)-(E<=3?1:0),                             // starting Grit (a point of Grit is worth ~30 win-rate points, so only a 10 earns it)
  wcDays:E=>E>=7?1:0,                                         // days saved per table on the Water Chip run
  discount:C=>C>=10?0.8:C>=9?0.85:C>=8?0.9:C>=7?0.95:C<=3?1.1:1, // trading post price multiplier
  reroll:I=>I>=7?1:0,                                         // shop reroll discount
  keep:I=>I>=9?1:0,                                           // extra cards kept from a bundle
  bounty:I=>I<=3?0.5:1,                                       // bounty payout multiplier
  deal:A=>(A>=7?1:0)-(A<=3?1:0),                              // opening hand size change
  quick:A=>A>=9,                                              // first discard each hand is free
  luckyDraw:L=>L>=9?2:1,                                      // Lucky cards draw this many
};

const gearSpecial=ids=>{const m=[0,0,0,0,0,0,0];for(const id of ids||[]){const g=GEAR[id];if(g&&g.sp)for(const [k,v] of Object.entries(g.sp))m[statIdx(k)]+=v;}return m;};
// In a run, only the loadout you started with counts. Outside a run, it's whatever you've equipped.
const currentGearIds=()=>runLive()?(meta.run.gear||[]):GEAR_SLOTS.map(sl=>meta.gear.on[sl.id]).filter(id=>id&&GEAR[id]&&meta.gear.owned.includes(id));
const baseSpecial=id=>(CHAR_BIO[id]&&CHAR_BIO[id].stats)||[5,5,5,5,5,5,5];
function specialFor(charId,ids){const m=gearSpecial(ids);return baseSpecial(charId).map((v,i)=>Math.max(1,Math.min(10,v+m[i])));}
const specialChar=()=>runLive()?meta.run.char:meta.char;
const sp=n=>specialFor(specialChar(),currentGearIds())[statIdx(n)];
const statOf=sp;   // road events ask for a stat by name

// Chems you can carry: Strength sets it, except Nuke (always at least 5) and Snip Snip (none).
const chemCap=id=>id==='snipsnip'?0:id==='nuke'?Math.max(5,SPX.chems(sp('S'))):SPX.chems(sp('S'));
// Perk and boss-reward rarity leans with Luck (5 is neutral).
function rarityWeights(){const d=sp('L')-5;return {common:Math.max(10,55-4*d),uncommon:30+d,rare:Math.max(1,12+2*d),legendary:Math.max(0.5,3+d)};}
function bossRarityWeights(){const d=sp('L')-5;return [['uncommon',Math.max(10,50-3*d)],['rare',40+2*d],['legendary',Math.max(1,10+d)]];}
function rollWeighted(pairs){const tot=pairs.reduce((a,[,w])=>a+w,0);let x=Math.random()*tot;for(const [k,w] of pairs){x-=w;if(x<0)return k;}return pairs[0][0];}

// The effects a set of effective stats gives, as display text. charId is only used to skip lines a character overrides.
function specialEffects(v,charId){
  const [S,P,E,C,I,A,L]=v,out=[],add=(k,sign,text)=>out.push({k,sign,text});
  if(charId!=='snipsnip'&&!(charId==='nuke'&&S<7)){if(S>=7)add('S','+',`Carry weight: you can hold ${SPX.chems(S)} chems.`);else if(S<=3)add('S','−',`Weak arms: you can hold only ${SPX.chems(S)} chems.`);}
  if(S>=9)add('S','+','Strong back: your caravans sell 1 point higher.');
  if(P>=10)add('P','+','Eagle eyes: you always see the dealer’s hand, and bundles show 2 more cards.');
  else if(P>=7)add('P','+','Sharp eyes: bundles show 1 more card.');
  else if(P<=3)add('P','−','Squinting: bundles show 1 fewer card.');
  if(E>=10)add('E','+','Tough as nails: you start every run with 1 more Grit.');
  if(E>=7)add('E','+','Hardy: on the Water Chip run, every table costs 1 fewer day.');
  if(E<=3)add('E','−','Frail: you start every run with 1 less Grit.');
  const dc=SPX.discount(C);
  if(dc<1)add('C','+',`Barter: ${Math.round((1-dc)*100)}% off at the trading post.`);
  else if(dc>1)add('C','−',`Off-putting: trading post prices are ${Math.round((dc-1)*100)}% higher.`);
  if(I>=9)add('I','+','Quick study: you keep 1 more card from every bundle.');
  if(I>=7)add('I','+','Savvy: shop rerolls cost 1 less.');
  if(I<=3)add('I','−','Slow on the uptake: bounties pay half.');
  if(A>=9)add('A','+','Quick hands: the first discard each hand doesn’t use your turn.');
  if(A>=7)add('A','+','Fast draw: you open every hand with 1 more card.');
  if(A<=3)add('A','−','Fumbling: you open every hand with 1 fewer card.');
  if(L>=6)add('L','+',`Fortune: perk offers and boss rewards lean toward better rarities${L>=9?', and Lucky cards draw 2':''}.`);
  else if(L<=4)add('L','−','Bad luck: perk offers and boss rewards lean toward worse rarities.');
  return out;
}

// ---- display ----
const spShort=n=>SPECIAL[statIdx(n)].k;
function spChips(g){ // gear modifiers as small chips
  if(!g||!g.sp)return '';
  return Object.entries(g.sp).map(([k,v])=>`<i class="gsp${v<0?' neg':''}">${v>0?'+':'−'}${Math.abs(v)} ${SPECIAL[statIdx(k)].name}</i>`).join('');
}
function specialBarsHTML(charId,ids){
  const base=baseSpecial(charId),eff=specialFor(charId,ids);
  return `<div class="stats special">${SPECIAL.map((x,i)=>{
    const b=base[i],e=eff[i],d=e-b;
    const pips=Array.from({length:10},(_,k)=>`<b class="${k<Math.min(b,e)?'on':k<e?'on gain':k<b?'loss':''}"></b>`).join('');
    return `<div class="stat"><span>${x.name}</span><i>${pips}</i><em>${e}${d?`<small class="${d>0?'up':'down'}">${d>0?'+':'−'}${Math.abs(d)}</small>`:''}</em></div>`;}).join('')}</div>`;
}
function specialEffectsHTML(charId,ids){
  const fx=specialEffects(specialFor(charId,ids),charId);
  if(!fx.length)return '<p class="note">Nothing stands out: every stat sits in the middle.</p>';
  return `<ul class="traits">${fx.map(f=>`<li class="${f.sign==='+'?'pro':'con'}"><b>${f.sign} ${SPECIAL[statIdx(f.k)].name}</b> ${esc(f.text)}</li>`).join('')}</ul>`;
}
const specialLine=charId=>baseSpecial(charId).map((v,i)=>`${SPECIAL[i].k}${v}`).join(' ');
