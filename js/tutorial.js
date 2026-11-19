// ---------- guided tutorial ----------
const BASIC_STEPS=[
  {title:'Opening',say:'You and Ezra each build three caravans. A caravan sells when its total lands between 21 and 26 and beats the one facing it. Every caravan opens with a number card (Aces count as 1). You can’t discard during the opening. Tap the 7♥, then tap your caravan I.',
   why:'A middle card makes a flexible start. From 7 you can climb or drop, and you keep your bigger cards for when they count.',
   move:{t:'num',key:'7H',lane:0},ai:{t:'num',key:'8S',lane:0}},
  {title:'Opening',say:'Now open caravan II with the 5♠.',why:'A low opener leaves lots of room. Almost any card can follow a 5, so caravan II stays easy to build.',move:{t:'num',key:'5S',lane:1},ai:{t:'num',key:'6D',lane:1}},
  {title:'Opening',say:'And caravan III with the 9♣. Once all three are open, you draw back up to five cards after each play.',why:'A high opener gets a caravan near the sell range fast. Mixing high and low openers gives you different ways to reach 21.',move:{t:'num',key:'9C',lane:2},ai:{t:'num',key:'4C',lane:2}},
  {title:'Reading the table',info:true,say:'All three of your caravans are open. The big number above each caravan is its total. Once a caravan has two cards, an arrow shows its direction (▲ climbing, ▼ falling), and the small suit symbol shows its current suit. Tags like AHEAD, BEHIND and BUST appear as totals change. Nothing is final until all three caravans are settled; then the winners get stamped SOLD.',
   why:'Your caravans are on the bottom row and Ezra’s are on top. Each of yours faces the one directly above it: your I against his I, and so on.'},
  {title:'Direction',say:'The second card sets a caravan’s direction. Put the 10♦ on caravan I: 7 then 10 climbs, so the next card there has to be higher. A card matching the caravan’s current suit can break that rule. You can never play the same value twice in a row.',
   why:'7 + 10 is 17 in one move, just short of 21. The catch: nothing is higher than a 10, so this caravan can now only grow with a diamond or a face card. That’s fine, because you’re holding a King.',
   move:{t:'num',key:'10D',lane:0},ai:{t:'num',key:'9S',lane:0}},
  {title:'Direction, step by step',info:true,say:'Your caravan I is 7 then 10, so it’s climbing: the next number must be higher than 10. Ezra’s caravan I is 8 then 9, also climbing, so he needs a 10 next. If a caravan went 7 then 6 instead, it would be falling, and the next card would have to be lower than 6.',
   why:'Two exceptions. A card of the same suit as the top card can always be played, and it resets the direction: Ezra could put 3♠ on his 9♠, and his caravan would be falling from then on. And you can never play the same value as the top card, so no 9 on a 9.'},
  {title:'Kings',say:'Caravan I is at 17. A King doubles the card it sits on. Put the K♦ on your 7♥: it counts as 14, the caravan hits 24, and you’re in the sell range.',
   why:'A King adds the value of the card it sits on. On the 7 it adds 7 and lands you at 24, safely inside 21–26. On the 10 it would add 10 and bust you at 27. Always check which card you’re doubling.',
   move:{t:'face',key:'KD',side:'p',lane:0,idx:0},ai:{t:'face',key:'KC',side:'a',lane:0,idx:0}},
  {title:'Jacks',say:'Ezra answered with a King of his own. His caravan I is 25 and beats your 24. A Jack knocks a card out, along with anything stacked on it. Play your J♠ on his 8♠.',
   why:'Jacks hit hardest on a card carrying a King. Taking the 8♠ removes 16 points in one play: his caravan drops from 25 to 9, and your 24 is winning again.',
   move:{t:'face',key:'JS',side:'a',lane:0,idx:0},ai:{t:'num',key:'10S',lane:1}},
  {title:'Queens',info:true,say:'A Queen goes on the top card of a caravan, yours or the dealer’s. It flips the direction and changes the caravan’s suit to the Queen’s. Ezra’s caravan II is 6 then 10, climbing. A Queen of hearts on that 10 would make it falling, and hearts would then be allowed against the direction.',
   why:'Use a Queen to rescue one of your own caravans that got stuck, like one climbing from a 10, or to block the dealer’s plans.'},
  {title:'Jokers',info:true,say:'A Joker on a 2–10 removes every other card of that value from the whole table, both sides. On an Ace, it removes every other number card of that Ace’s suit. The card the Joker sits on stays put.',
   why:'Jokers hit your own caravans too. Before playing one, count how many matching cards you’d lose compared with the dealer.'},
  {title:'Selling and winning',info:true,say:'A caravan sells at 21–26 if it beats the one facing it. Your 23 against their 25: theirs sells. Your 23 against their 28: yours sells, since 28 is a bust. A tie like 24 against 24 sells for nobody. The hand ends when all three matchups have a seller at the same time, and whoever sold two or three wins.',
   why:'A caravan that’s selling can still be outbid or Jacked before the end, so keep an eye on all three matchups, not just your best one.'},
  {title:'Your hand now',say:'His King went with it, so your caravan I is ahead again. The rest is up to you. A Queen goes on a caravan’s top card, flips its direction and changes its suit to the Queen’s. A Joker on an Ace wipes every other card of that suit off the table; on 2–10 it wipes every other card of that value. Each turn you can play a card, discard one you can’t use, or disband a caravan that went bust. Sell two of three to win.',
   why:'Before each play, count both sides. Ask what your card does for you and what the dealer can do back. Save Jacks for big targets, and avoid pushing a caravan to 26 if a dealer King could bust it.',
   move:null},
];
const ROAD_STEPS=[
  {title:'House rules',say:'Out on the road, most tables bend the rules. This practice table plays Royal court: Kings triple instead of double. Look at the chips above the table. Put your K♦ on your 6♥ in caravan I: 6 × 3 makes 18.',
   why:'At a normal table this King adds 6. Here it adds 12. House rules change what a card is worth, so read them before every hand.',
   move:{t:'face',key:'KD',side:'p',lane:0,idx:0},ai:{t:'num',key:'5S',lane:0}},
  {title:'Perks',say:'Jo matched suit to reach 22. You have a perk equipped: Wide Margin, so your caravans sell from 19 instead of 21. Play the 9♣ on your 10♣ in caravan III. That makes only 19, short of the usual range, but for you it sells, and Jo’s caravan III is far behind.',
   why:'Perks change what counts as a good play. Anyone else would still be two points short here. The chips above the table always show your current sell range.',
   move:{t:'num',key:'9C',lane:2},ai:{t:'num',key:'10D',lane:1}},
  {title:'Chems',say:'Chems are one-use boosts, one per turn, after the opening. Using one doesn’t end your turn. Tap Mentats below your hand to see what Jo is holding.',
   why:'Seeing her hand tells you what she can do next. If she’s holding a Jack, your biggest caravan is a target, and it’s better to know before you put more cards into it.',
   move:{t:'chem',id:'spy'}},
  {title:'Bounties',say:'Now you can see Jo’s hand, and she’s holding a Jack. Boss tables also post a bounty for extra caps; this practice table has one too. This one is Kingmaker: win after playing two Kings. Put your K♠ on your 6♠ in caravan II: 3 + 18 makes 21.',
   why:'This one play does two jobs. Caravan II jumps into your sell range, and it’s your second King, so the bounty pays if you win. Spreading strength across caravans also means one Jack can’t wreck your whole hand.',
   move:{t:'face',key:'KS',side:'p',lane:1,idx:1},ai:{t:'face',key:'JH',side:'p',lane:2,idx:1}},
  {title:'On your own',say:'Jo spent the Jack you spotted on your 9♣. Now you’ve seen the road: every stop has three tables, bosses bring their own rules, perks and chems come from the trading post between tables, and a little Grit lets you survive a lost table or two. Finish the hand any way you like.',
   why:'Your caravan I sits at 18, one short of your Wide Margin range. Getting it to 19 or more with a heart or a high card puts it in range. Watch what Jo plays, and remember you can see her hand for the rest of this one.',
   move:null},
];
const TUTS={basics:BASIC_STEPS,road:ROAD_STEPS};
const tutSteps=()=>TUTS[(G.tut&&G.tut.kind)||'basics'];
function newRoadTutorial(){
  const fromKey=k=>mk(k.slice(0,-1),k.slice(-1));
  const E=k=>({card:fromKey(k),faces:[]});
  const pBoard=[['6H'],['3S','6S'],['10C']], aBoard=[['7S','10S'],['4D','8D'],['2C','9H']];
  const pHand=['KD','9C','KS','5H','2D'], aHand=['5S','JH','10D','6C','3H'];
  const usedP=new Set([...pBoard.flat(),...pHand]), usedA=new Set([...aBoard.flat(),...aHand]);
  const R=baseRules(); HOUSE.royal.apply(R); R.range.p=[R.range.p[0]-2,R.range.p[1]];
  return {p:{deck:buildDeck(addFaces(baseNumbers().filter(c=>!usedP.has(keyOf(c))),{J:2,Q:1,K:1})),hand:pHand.map(fromKey),cv:pBoard.map(l=>l.map(E))},
    a:{deck:buildDeck(addFaces(baseNumbers().filter(c=>!usedA.has(keyOf(c))),{J:1,Q:1,K:1})),hand:aHand.map(fromKey),cv:aBoard.map(l=>l.map(E))},
    turn:'p',setupLeft:{p:0,a:0},log:['Lucky Jo set up a hand already in progress.'],over:null,opp:-2,fx:null,rules:R,mode:'road',
    tut:{step:0,done:false,kind:'road'},perks:['wide'],bounty:'kings',bountyPay:10,
    stats:{faces:0,jokers:0,kings:0,discards:0,disbands:0},localChems:{spy:1,coffee:0,fresh:0,shoe:0}};
}
function newTutorial(mode){
  const key=c=>c.rank+(c.suit||'');
  const pHand=['7H','5S','9C','10D','KD','JS','6H','QC'], pDraws=['4S','3H','8C'];
  const aHand=['8S','6D','4C','9S','10S','KC','2H','3D'];
  const fromKey=k=>mk(k.slice(0,-1),k.slice(-1));
  const usedP=new Set([...pHand,...pDraws]), usedA=new Set(aHand);
  const pDeck=buildDeck(addFaces(baseNumbers().filter(c=>!usedP.has(key(c))),{J:2,Q:1,K:1,JK:1}));
  pDraws.forEach(k=>pDeck.push(fromKey(k)));
  const aDeck=buildDeck(addFaces(baseNumbers().filter(c=>!usedA.has(key(c))),{J:1,Q:1,K:1}));
  return {p:{deck:pDeck,hand:pHand.map(fromKey),cv:[[],[],[]]},a:{deck:aDeck,hand:aHand.map(fromKey),cv:[[],[],[]]},
    turn:'p',setupLeft:{p:3,a:3},log:[],over:null,opp:-1,fx:null,rules:baseRules(),mode:mode||'road',tut:{step:0,done:false,kind:'basics'}};
}
const tutActive=()=>G&&G.tut&&!G.tut.done&&!G.over;
function resolveSpec(spec,side){
  const ci=G[side].hand.findIndex(c=>c.rank+(c.suit||'')===spec.key);
  if(ci<0)return null;
  const m={t:spec.t,ci,lane:spec.lane};
  if(spec.t==='face'){m.side=spec.side;m.idx=spec.idx;}
  return m;
}
function playerLegal(){
  if(G.turn!=='p'||G.over||busy)return [];
  const all=legalMoves(G,'p');
  if(!tutActive())return all;
  const step=tutSteps()[G.tut.step];
  if(!step||step.info||!step.move||step.move.t==='chem')return [];
  const want=resolveSpec(step.move,'p');
  return want?all.filter(m=>m.t===want.t&&m.ci===want.ci&&m.lane===want.lane&&m.side===want.side&&m.idx===want.idx):[];
}

