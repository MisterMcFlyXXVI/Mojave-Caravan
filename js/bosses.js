// Boss behaviour: how the dealer AI plays (styles) and the once-per-hand tricks you can see coming (signatures).
// Boss play styles, tuned from simulated hands. jack/king/joker: how hard they hold that card back for a decisive play
// (a King-savvy dealer wins ~60-70% against the stock AI). opp: how much they care about hurting you (default 0.8; low = defensive).
const AI_STYLES={
  'Mama Tallow':{opp:.4,tell:'Cautious: builds her own caravans and rarely goes after yours.'},
  'Gus the Prospector':{joker:5,tell:'Holds his Jokers for one big swing instead of spending them early.'},
  'Sergeant Brick':{king:2,tell:'By the book: spends Kings only where they count.'},
  'Velvet Moreno':{king:6,tell:'Patient: saves her Kings for the decisive play.'},
  'Silver Lou':{king:10,jack:3,tell:'The house never wastes a face card.'},
  'Vladmira':{king:3,tell:'Saves her Kings for one huge caravan.'},
  'Nuke Skywalker':{king:6,tell:'Counts everything. Rarely wastes a face card.'},
  'Chevy Ford':{jack:5,tell:'Holds his Jacks for the one shot that matters.'},
  'Greg':{jack:8,king:8,tell:'Gentle: almost never plays a Jack, but he stacks Kings like a champ.'},
  'Jeanita':{king:8,tell:'She already knows your hand, so she never wastes a face card.'},
  'Three Dog':{joker:4,tell:'Saves his Jokers for the big finish.'},
  'Benny':{joker:6,king:6,tell:'Hoards Jokers and Kings for one wrecking play.'},
  'Harold':{opp:.4,jack:4,tell:'Patient: waits for you to overextend.'},
  'Smoke-Sister Vey':{joker:4,tell:'Reads your fortune, then waits to play her Jokers.'},
  'Big Tom the Gentle':{opp:.4,jack:6,tell:'Slow and careful: rarely attacks.'},
  'The Voice on the Mountain':{king:6,tell:'You never see a hand. You only see the result.'},
  'The Dust Prophet':{king:4,joker:4,tell:'Walks out of the storm saving everything for the right moment.'},
  'Professor Static':{king:8,tell:'Every face card is an experiment, and he runs few.'},
  'Burned Ezekiel':{king:6,jack:3,tell:'Cheats politely: spends face cards only when it pays.'},
  'The Ghost Croupier':{king:10,tell:'Hasn’t wasted a card since before the war.'},
  'Colonel Ash':{king:10,jack:3,tell:'Holds the table for both armies, and every Jack and King for the kill.'},
  'Tandi':{opp:.4,tell:'Stubborn: builds a wall before she swings.'},
  'Killian Darkwater':{opp:.5,jack:3,tell:'Plays it straight and careful.'},
  'Decker':{king:6,tell:'Runs the Hub. Never throws away a face card.'},
  'Set':{opp:.4,king:6,tell:'Patient. Very, very patient.'},
  'The Master':{king:8,joker:3,tell:'Many voices, many plans, very few wasted cards.'},
};
// Harder difficulties make every boss savvier with their Kings.
const CLASSIC_STYLES={2:{jack:4},3:{king:4,jack:2}};
function aiProfile(){
  if(!G)return null;
  if(G.mode==='road'&&G.run){
    const r=run(),t=G.runTable,P={...(t===2?(AI_STYLES[OPP().name]||{}):{})};
    // Dealers get savvier with their Kings the further you go: all tables a little, bosses a lot (and more on Silver and Gold).
    const st=Math.min(5,G.runStop);
    if(t===2){const floor=inBeyond(G.runStop)?6:[1,1,2,3,4,5][st]+({copper:0,silver:1,gold:3}[r.tier]||0);if(floor>1)P.king=Math.max(P.king||1,floor);}
    else{const f=Math.max(t===1?[1,1,1,2,3,3][st]:[1,1,1,1,2,2][st],t===1&&r.tier==='gold'?3:1);if(f>1)P.king=f;}
    return P;
  }
  if(G.mode==='classic'&&G.opp>=0)return CLASSIC_STYLES[G.opp]||null;
  if(G.mode==='campaign'&&G.cd&&(G.cd.slot==='c'||G.cd.slot==='h')&&G.cd.ti>=2)return {king:3};
  return null;
}

// ---- Signatures ----
// A signature is a once-per-hand trick, shown as a countdown chip at the table and on the pre-hand screen.
// It fires after the dealer's Nth turn once the opening is done. Silver and Gold roads fire it earlier (never before
// turn 3). House Edge is static. Bosses without a signature just play their style.
const SIG_FX={
  knife(){ // knocks the top card off your biggest caravan
    const lanes=[0,1,2].filter(l=>G.p.cv[l].length);if(!lanes.length)return 'It misses: you have nothing out.';
    const l=lanes.reduce((a,b)=>cvValue(G.p.cv[b])>cvValue(G.p.cv[a])?b:a),e=G.p.cv[l].pop();
    G.lastLost={lane:l,e};return `It takes the ${cardName(e.card)} off your caravan ${ROMAN[l]}.`;
  },
  hug(){G.sigSkip=true;return 'You skip your next turn.';},
  chip(){const a=G.rules.range.a;G.rules.range.a=[Math.min(18,a[0]),Math.max(30,a[1])];return `Their caravans now sell from ${G.rules.range.a[0]} to ${G.rules.range.a[1]}.`;},
  feast(){let n=0;for(let i=0;i<2&&G.a.deck.length;i++){G.a.hand.push(G.a.deck.pop());n++;}return `They draw ${n} extra card${n===1?'':'s'}.`;},
};
const BOSS_SIGS={
  'Mama Tallow':{fx:'feast',at:3,name:'Second Helping',desc:at=>`On turn ${at} she draws 2 extra cards. Feeds you first, fleeces you second.`},
  'Velvet Moreno':{fx:'knife',at:5,name:'Knife Throw',desc:at=>`On turn ${at} she throws a knife and knocks the top card off your biggest caravan.`},
  'Silver Lou':{fx:'edge',name:'House Edge',desc:()=>'Ties go to the house: if both caravans land on the same total, hers sells.'},
  'Benny':{fx:'chip',at:8,name:'Platinum Chip',desc:at=>`On turn ${at} he flips the chip: his caravans sell from 18 to 30 for the rest of the hand.`},
  'Greg':{fx:'hug',at:7,name:'Bear Hug',desc:at=>`On turn ${at} he gives you a big hug. You skip your next turn.`},
  'Chevy Ford':{fx:'knife',at:8,name:'Turret Nest',desc:at=>`On turn ${at} the turret opens up and shoots the top card off your biggest caravan.`},
  'Jeanita':{fx:'hug',at:6,name:'Hold Music',desc:at=>`On turn ${at} she puts you on hold. You skip your next turn.`},
  'Three Dog':{fx:'feast',at:4,name:'Live on Air',desc:at=>`On turn ${at} he goes live and draws 2 extra cards.`},
  'Snip Snip':{fx:'knife',at:5,name:'Snip, Snip',desc:at=>`On turn ${at}, Snip Snip trims the top card off your biggest caravan.`},
  'Nuke Skywalker':{fx:'feast',at:5,name:'Fresh Batch',desc:at=>`On turn ${at} he brews something and draws 2 extra cards.`},
};
const sigTurn=(sg,r)=>sg.fx==='edge'?0:Math.max(3,sg.at-Math.max(0,tierIdx(r.tier)));
const sigDesc=(sg,r)=>sg.desc(sigTurn(sg,r));
function setupSig(r){
  const sg=BOSS_SIGS[G.dealer&&G.dealer.name];if(!sg)return;
  G.sig={id:G.dealer.name,fx:sg.fx,at:sigTurn(sg,r),n:0,fired:false};
  if(sg.fx==='edge')G.rules.tieWin.a=true;
}
function sigAfterDealerMove(wasSetup){
  const sg=G.sig;if(!sg||sg.fired||sg.fx==='edge'||wasSetup)return;
  if(++sg.n<sg.at)return;
  sg.fired=true;const info=BOSS_SIGS[sg.id];
  G.log.unshift(`${info.name}! ${SIG_FX[sg.fx]()}`);sigFlash(info.name);
}
function sigLabel(){
  const sg=G.sig,info=BOSS_SIGS[sg.id];
  if(sg.fx==='edge')return `Signature: ${info.name}`;
  if(sg.fired)return `Signature: ${info.name} (used)`;
  const left=sg.at-sg.n;return `Signature: ${info.name} in ${left} turn${left===1?'':'s'}`;
}
function sigFlash(name){try{const el=document.createElement('div');el.className='legendflash lg-legendary';el.innerHTML=`<small>Boss signature</small><b>${esc(name)}</b>`;document.body.appendChild(el);setTimeout(()=>el.remove(),1900);buzz&&buzz([30,40,60]);}catch(e){}}
