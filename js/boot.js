// ---------- boot ----------
function start(data){
  meta=migrate((data&&data.meta)||load()||freshMeta());
  if(data&&data.G){G=data.G;screen=data.screen||'home';}
  else if(meta.match&&!meta.match.over){G=meta.match;screen='match';}
  else screen=(data&&data.screen)||'home';
  if(screen==='match'&&!G)screen='home';
  achSilent=true;const retro=checkState();achSilent=false;
  if(retro>0){save();setTimeout(()=>toast({name:`${retro} achievement${retro>1?'s':''} from past play`,desc:'Open Achievements to see them.'}),900);}if(screen==='hub')screen='road';
  if(G&&!G.rules)G.rules=baseRules();
  applyLook();if(!window.__art){window.__art=1;initArt();try{loadDeckTextures();}catch(e){}try{loadCourtArt();}catch(e){console.warn(e);}try{loadPropFiles();}catch(e){}try{loadPortraitFiles();}catch(e){}}
  try{propsRetro();}catch(e){}
  if(meta.convertNote!=null){const n=meta.convertNote;delete meta.convertNote;save();setTimeout(()=>toast({label:'Update',name:'The Road is now a roguelite',desc:n?`Your old progress became ${n} starting token${n>1?'s':''}. Pick one when you start a run.`:'Every run starts fresh with the Plain deck.'}),1200);}drawSky();render();
  if(screen==='match'&&G&&!G.over&&G.turn==='a'){busy=true;render();setTimeout(aiTurn,600);}
}
window.claude?.hot?.snapshot?.(()=>({meta,G,screen}));
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
initSync();