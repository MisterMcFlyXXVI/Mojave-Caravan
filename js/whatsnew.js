// "What's new": shown once on the first open after an update. To announce a release, add an entry at the TOP of
// WHATS_NEW with a new id and a few short lines. Players who haven't seen that id get the card; brand-new players don't.
const WHATS_NEW=[
  {id:'2026-11-d',title:'A New Vegas deck',lines:[
    'Every face card has its own New Vegas character now: Mr. House, Jane and Yes Man in Spades, Caesar, Lanius and Vulpes in Clubs, Doc Mitchell, Cass and Boone in Hearts, and the King, Sunny Smiles and Victor in Diamonds. Benny is the Joker.',
    'New hand-inked atomic suit symbols on every card.',
  ]},
  {id:'2026-11-c',title:'Currency cards',lines:[
    'The <b>Gilded</b> upgrade is now <b>Currency</b>, printed on green NCR banknote paper. It pays <b>1 NCR dollar</b> (once per table) when it’s in a caravan that sells, instead of caps, so it no longer duplicates Golden cards.',
  ]},
  {id:'2026-11-b',title:'Heads or tails',lines:[
    'A <b>cap flip</b> now decides who opens each hand. Tutorials still let you go first.',
  ]},
  {id:'2026-11-a',title:'Bigger rewards',lines:[
    'Achievements now pay <b>NCR dollars</b> for the Mojave Express, scaled to how hard they are. Ones you’ve already earned paid out once.',
    'Fonts, card faces and play mats are now achievement rewards. Anything you were already using is yours to keep.',
    'The Achievements screen shows what’s <b>closest to unlocking</b>, and locked Three Dog shows his progress.',
    'Galaxy News Radio is now Three Dog’s pack. Fast Hands, Cap Hoarder and Dragon’s Hoard are harder.',
    '<b>Table props</b> are back: on a shelf on the home screen, and on the desk by the table on wide screens. Pick yours under Customize.',
  ]},
];
function whatsNewHTML(items){
  return `<div class="overlay whatsnew" data-whatsnew-bg><div class="panel result" role="dialog" aria-label="What’s new">
    <h2 style="font-size:26px;margin-top:0">What’s new</h2>
    ${items.map(w=>`<h3 class="sub">${esc(w.title)}</h3><ul class="wnlist">${w.lines.map(l=>`<li>${l}</li>`).join('')}</ul>`).join('')}
    <div class="hubbtns" style="justify-content:center"><button class="btn hot" data-whatsnew-ok>Got it</button></div>
  </div></div>`;
}
function showWhatsNew(){
  if(!meta||!WHATS_NEW.length)return;
  const latest=WHATS_NEW[0].id,seen=meta.seenNews;
  if(seen===latest)return;
  const veteran=((meta.st&&meta.st.hands)||0)>0||(meta.runsWon||0)>0||(meta.bestStop||0)>0||(meta.classic&&meta.classic.wins>0);
  if(!seen&&!veteran){meta.seenNews=latest;save();return;}                 // a new player: nothing to catch up on
  if(screen==='match')return;                                              // never over a hand in progress
  const i=seen?WHATS_NEW.findIndex(w=>w.id===seen):-1,items=(i<0?WHATS_NEW:WHATS_NEW.slice(0,i)).slice(0,3);
  const el=document.createElement('div');el.id='whatsnew';el.innerHTML=whatsNewHTML(items);document.body.appendChild(el);
  const close=()=>{el.remove();meta.seenNews=latest;save();};
  el.querySelector('[data-whatsnew-ok]').onclick=close;
  el.querySelector('[data-whatsnew-bg]').onclick=e=>{if(e.target===e.currentTarget)close();};
}
