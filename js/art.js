// ---------- art: procedural textures, card back art, table props, dust ----------
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];}
function rngSeed(seed){let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>(s=(s*16807)%2147483647)/2147483647;}
function addNoise(x,W,H,r,amt){const d=x.getImageData(0,0,W,H);for(let i=0;i<d.data.length;i+=4){const n=(r()-.5)*amt;d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n;}x.putImageData(d,0,0);}
function rrect(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();}

function texGrain(){
  const N=200,[c,x]=mkCanvas(N,N),r=rngSeed(11),d=x.createImageData(N,N);
  for(let i=0;i<d.data.length;i+=4){const v=r()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=r()<.5?16:0;}
  x.putImageData(d,0,0);return c.toDataURL();
}
function texPaper(){
  const N=160,[c,x]=mkCanvas(N,N),r=rngSeed(5);
  for(let i=0;i<1100;i++){x.fillStyle=r()<.55?`rgba(90,60,30,${r()*.07})`:`rgba(255,250,235,${r()*.08})`;x.fillRect(r()*N,r()*N,r()*2+.4,r()*2+.4);}
  x.lineWidth=.6;
  for(let i=0;i<46;i++){x.strokeStyle=`rgba(110,80,40,${.03+r()*.04})`;x.beginPath();const sx=r()*N,sy=r()*N;x.moveTo(sx,sy);x.quadraticCurveTo(sx+r()*20-10,sy+r()*20-10,sx+r()*30-15,sy+r()*30-15);x.stroke();}
  return c.toDataURL();
}
function texWood(base,dark,light,seed){
  const W=512,H=256,[c,x]=mkCanvas(W,H),r=rngSeed(seed),PH=64;
  x.fillStyle=base;x.fillRect(0,0,W,H);
  for(let p=0;p<H/PH;p++){
    const y0=p*PH,tone=(r()-.5)*.22;
    x.fillStyle=tone>0?`rgba(255,215,160,${tone*.6})`:`rgba(0,0,0,${-tone})`;x.fillRect(0,y0,W,PH);
    for(let i=0;i<30;i++){
      const yy=y0+r()*PH,amp=.8+r()*3.2,k=1+Math.floor(r()*4),fr=k*2*Math.PI/W,ph=r()*6;
      x.strokeStyle=r()<.62?dark:light;x.globalAlpha=.08+r()*.24;x.lineWidth=.5+r()*1.8;
      x.beginPath();for(let xx=0;xx<=W;xx+=8){const yv=yy+Math.sin(xx*fr+ph)*amp;xx?x.lineTo(xx,yv):x.moveTo(xx,yv);}x.stroke();
    }
    if(r()<.75){const kx=60+r()*(W-120),ky=y0+PH*(.35+r()*.3);x.strokeStyle=dark;x.lineWidth=1;
      for(let k=0;k<7;k++){x.globalAlpha=.32-k*.03;x.beginPath();x.ellipse(kx,ky,5+k*6,1.8+k*1.5,0,0,Math.PI*2);x.stroke();}
      x.globalAlpha=.5;x.fillStyle=dark;x.beginPath();x.ellipse(kx,ky,4,1.8,0,0,7);x.fill();}
    x.globalAlpha=1;
    x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,y0+PH-2,W,2);
    x.fillStyle='rgba(255,230,190,.07)';x.fillRect(0,y0,W,1);
    for(const nx of [14,W/2+7,W-14]){x.fillStyle='rgba(20,14,8,.85)';x.beginPath();x.arc(nx,y0+PH/2,2.3,0,7);x.fill();x.fillStyle='rgba(255,230,190,.25)';x.beginPath();x.arc(nx-.7,y0+PH/2-.7,.8,0,7);x.fill();}
  }
  for(let i=0;i<110;i++){x.strokeStyle=`rgba(255,235,200,${r()*.07})`;x.lineWidth=.5;x.beginPath();const sx=r()*W,sy=r()*H;x.moveTo(sx,sy);x.lineTo(sx+r()*44-22,sy+r()*6-3);x.stroke();}
  addNoise(x,W,H,r,16);
  return c.toDataURL('image/jpeg',.86);
}
function texLeather(base,seed){
  const W=256,H=256,[c,x]=mkCanvas(W,H),r=rngSeed(seed);
  x.fillStyle=base;x.fillRect(0,0,W,H);
  for(let i=0;i<34;i++){const px=r()*W,py=r()*H,rad=20+r()*60,g=x.createRadialGradient(px,py,0,px,py,rad),dk=r()<.6;
    g.addColorStop(0,dk?'rgba(0,0,0,.18)':'rgba(255,210,160,.07)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H);}
  for(let i=0;i<3200;i++){const px=r()*W,py=r()*H,rad=.8+r()*2.4,dk=r()<.55;
    x.fillStyle=dk?`rgba(0,0,0,${.07+r()*.12})`:`rgba(255,220,180,${.025+r()*.05})`;
    for(const [ox,oy] of [[0,0],[W,0],[-W,0],[0,H],[0,-H]]){x.beginPath();x.ellipse(px+ox,py+oy,rad,rad*(.6+r()*.5),r()*3,0,7);x.fill();}}
  for(let i=0;i<16;i++){x.strokeStyle=`rgba(0,0,0,${.08+r()*.12})`;x.lineWidth=.7;x.beginPath();let sx=r()*W,sy=r()*H;x.moveTo(sx,sy);for(let k=0;k<4;k++){sx+=r()*28-14;sy+=r()*28-14;x.lineTo(sx,sy);}x.stroke();}
  addNoise(x,W,H,r,10);
  return c.toDataURL('image/jpeg',.86);
}
function texDust(){
  const N=320,[c,x]=mkCanvas(N,N),r=rngSeed(29);
  for(let i=0;i<14;i++){const px=r()*N,py=r()*N,rad=30+r()*90,g=x.createRadialGradient(px,py,0,px,py,rad);
    g.addColorStop(0,'rgba(210,175,120,.10)');g.addColorStop(1,'rgba(210,175,120,0)');x.fillStyle=g;x.fillRect(0,0,N,N);}
  for(let i=0;i<1400;i++){x.fillStyle=`rgba(225,195,145,${r()*.22})`;const s=r()*1.6+.3;x.fillRect(r()*N,r()*N,s,s);}
  for(let i=0;i<30;i++){x.strokeStyle=`rgba(230,205,160,${r()*.12})`;x.lineWidth=.6;x.beginPath();const sx=r()*N,sy=r()*N;x.moveTo(sx,sy);x.lineTo(sx+r()*24-12,sy+r()*24-12);x.stroke();}
  return c.toDataURL();
}

// --- card backs: printed designs with real-world wear ---
const BACK_IDS=['sunburst','cap','stripe','dusk','star','blood','uranium','cowhide','rust','shot','map'];
function backArt(id){
  const W=240,H=336,[c,x]=mkCanvas(W,H),r=rngSeed(id.split('').reduce((a,ch)=>a*31+ch.charCodeAt(0),7));
  const IX=13,IY=13,IW=W-26,IH=H-26;
  const fullBleed=['cowhide','rust','uranium'].includes(id);
  // paper stock with a printed border
  x.fillStyle=id==='blood'?'#f1e7d2':'#ece0c6';x.fillRect(0,0,W,H);
  x.save();
  if(!fullBleed){rrect(x,IX,IY,IW,IH,9);x.clip();}
  const cx=W/2,cy=H/2;
  const splat=(sx,sy,R,col)=>{x.fillStyle=col;x.beginPath();x.arc(sx,sy,R,0,7);x.fill();
    for(let i=0;i<14;i++){const a=r()*7,d=R*(.6+r()*1.1),rr=R*(.12+r()*.28);x.beginPath();x.ellipse(sx+Math.cos(a)*d,sy+Math.sin(a)*d,rr*1.6,rr,a,0,7);x.fill();}
    for(let i=0;i<22;i++){const a=r()*7,d=R*(1.2+r()*1.8);x.beginPath();x.arc(sx+Math.cos(a)*d,sy+Math.sin(a)*d,.6+r()*2.2,0,7);x.fill();}};
  if(id==='sunburst'){
    x.fillStyle='#5a2116';x.fillRect(0,0,W,H);
    for(let i=0;i<36;i++){const a=i/36*Math.PI*2;x.fillStyle=i%2?'#7a2f1d':'#43170f';x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,320,a,a+Math.PI/36*2);x.closePath();x.fill();}
    const g=x.createRadialGradient(cx,cy,0,cx,cy,44);g.addColorStop(0,'#ffd28a');g.addColorStop(.6,'#f08a2c');g.addColorStop(1,'#a8421a');
    x.fillStyle=g;x.beginPath();x.arc(cx,cy,40,0,7);x.fill();
    x.strokeStyle='#f3c27a';x.lineWidth=2;x.beginPath();x.arc(cx,cy,48,0,7);x.stroke();x.lineWidth=1;x.beginPath();x.arc(cx,cy,54,0,7);x.stroke();
  }else if(id==='cap'){
    x.fillStyle='#2c5664';x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=1;for(let i=-H;i<W;i+=8){x.beginPath();x.moveTo(i,0);x.lineTo(i+H,H);x.stroke();x.beginPath();x.moveTo(i+H,0);x.lineTo(i,H);x.stroke();}
    const R=46;x.save();x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=10;x.shadowOffsetY=4;
    x.beginPath();for(let i=0;i<54;i++){const a=i/54*Math.PI*2,rad=i%2?R:R*.9;x.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad);}x.closePath();
    const g=x.createLinearGradient(cx-R,cy-R,cx+R,cy+R);g.addColorStop(0,'#f6f1e6');g.addColorStop(.5,'#b9b2a2');g.addColorStop(1,'#6e675a');x.fillStyle=g;x.fill();x.restore();
    const g2=x.createRadialGradient(cx-10,cy-12,4,cx,cy,R*.8);g2.addColorStop(0,'#e0483a');g2.addColorStop(1,'#7a1610');x.fillStyle=g2;x.beginPath();x.arc(cx,cy,R*.74,0,7);x.fill();
    x.strokeStyle='#f3e6c8';x.lineWidth=2.5;x.beginPath();x.arc(cx,cy,R*.55,0,7);x.stroke();
    x.fillStyle='#f3e6c8';x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rad=i%2?7:17;x.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad);}x.closePath();x.fill();
    x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(cx-16,cy-20,14,6,-.6,0,7);x.fill();
  }else if(id==='stripe'){
    x.fillStyle='#efe2c6';x.fillRect(0,0,W,H);
    for(let i=-H;i<W+H;i+=22){x.fillStyle='#9e2a1e';x.beginPath();x.moveTo(i,0);x.lineTo(i+11,0);x.lineTo(i+11+H,H);x.lineTo(i+H,H);x.closePath();x.fill();
      x.fillStyle='rgba(30,60,120,.18)';x.beginPath();x.moveTo(i+2,0);x.lineTo(i+13,0);x.lineTo(i+13+H,H);x.lineTo(i+2+H,H);x.closePath();x.fill();}
    x.fillStyle='#efe2c6';rrect(x,cx-38,cy-22,76,44,8);x.fill();x.strokeStyle='#9e2a1e';x.lineWidth=2;x.stroke();
    x.fillStyle='#9e2a1e';x.font='20px Limelight, Georgia, serif';x.textAlign='center';x.fillText('CARAVAN',cx,cy+7);
  }else if(id==='dusk'){
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#140c26');g.addColorStop(.42,'#4a2343');g.addColorStop(.62,'#d8683a');g.addColorStop(.7,'#f2a75a');g.addColorStop(.71,'#2a1612');g.addColorStop(1,'#1a0d0a');
    x.fillStyle=g;x.fillRect(0,0,W,H);
    for(let i=0;i<60;i++){x.fillStyle=`rgba(255,245,220,${r()*.8})`;x.fillRect(r()*W,r()*H*.4,1.2,1.2);}
    const sg=x.createRadialGradient(cx,H*.68,0,cx,H*.68,40);sg.addColorStop(0,'#fff0b8');sg.addColorStop(.6,'#ffb75a');sg.addColorStop(1,'rgba(255,140,60,0)');x.fillStyle=sg;x.beginPath();x.arc(cx,H*.68,40,0,7);x.fill();
    x.fillStyle='#2a1612';x.beginPath();x.moveTo(0,H*.71);x.lineTo(20,H*.63);x.lineTo(70,H*.63);x.lineTo(84,H*.71);x.lineTo(150,H*.71);x.lineTo(162,H*.655);x.lineTo(222,H*.655);x.lineTo(240,H*.71);x.lineTo(240,H);x.lineTo(0,H);x.closePath();x.fill();
    const cactus=(bx,by,s)=>{x.fillStyle='#120807';rrect(x,bx-4*s,by-60*s,8*s,60*s,4*s);x.fill();rrect(x,bx-18*s,by-40*s,6*s,22*s,3*s);x.fill();rrect(x,bx-18*s,by-22*s,16*s,6*s,3*s);x.fill();rrect(x,bx+12*s,by-48*s,6*s,24*s,3*s);x.fill();rrect(x,bx+4*s,by-28*s,14*s,6*s,3*s);x.fill();};
    cactus(56,H*.9,1);cactus(190,H*.86,.7);
  }else if(id==='star'){
    x.fillStyle='#17223d';x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(255,255,255,.05)';for(let i=0;i<H;i+=6){x.beginPath();x.moveTo(0,i);x.lineTo(W,i);x.stroke();}
    x.save();x.translate(cx,cy);x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=8;x.shadowOffsetY=3;
    const g=x.createLinearGradient(-50,-50,50,50);g.addColorStop(0,'#fff0c0');g.addColorStop(.45,'#d6a443');g.addColorStop(1,'#7c5716');
    x.fillStyle=g;x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rad=i%2?22:54;x.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);}x.closePath();x.fill();
    x.shadowColor='transparent';for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;x.beginPath();x.arc(Math.cos(a)*56,Math.sin(a)*56,6,0,7);x.fill();}
    x.strokeStyle='#7c5716';x.lineWidth=1.5;x.beginPath();x.arc(0,0,17,0,7);x.stroke();x.restore();
  }else if(id==='blood'){
    x.fillStyle='#f1e7d2';x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(150,40,30,.55)';x.lineWidth=1;for(let i=-H;i<W+H;i+=14){x.beginPath();x.moveTo(i,0);x.lineTo(i+H,H);x.stroke();x.beginPath();x.moveTo(i+H,0);x.lineTo(i,H);x.stroke();}
    x.strokeStyle='rgba(150,40,30,.8)';x.lineWidth=2;rrect(x,IX+8,IY+8,IW-16,IH-16,6);x.stroke();
    splat(cx+18,cy-30,26,'rgba(110,8,6,.92)');splat(cx-40,cy+60,12,'rgba(120,10,8,.85)');splat(cx+50,cy+96,7,'rgba(120,10,8,.8)');
    for(let i=0;i<4;i++){const dx=cx+4+i*12+r()*6,len=40+r()*90;x.strokeStyle='rgba(105,8,6,.88)';x.lineWidth=2.5+r()*3;x.lineCap='round';x.beginPath();x.moveTo(dx,cy-20);x.lineTo(dx+r()*3-1.5,cy-20+len);x.stroke();x.fillStyle='rgba(105,8,6,.9)';x.beginPath();x.arc(dx,cy-20+len,x.lineWidth*.8,0,7);x.fill();}
    x.fillStyle='rgba(60,4,2,.35)';x.beginPath();x.arc(cx+18,cy-30,18,0,7);x.fill();
  }else if(id==='uranium'){
    const g=x.createRadialGradient(cx,cy,10,cx,cy,220);g.addColorStop(0,'#26301f');g.addColorStop(1,'#0b0d0a');x.fillStyle=g;x.fillRect(0,0,W,H);
    for(let i=0;i<500;i++){x.fillStyle=`rgba(${r()<.5?'0,0,0':'120,140,110'},${r()*.2})`;x.fillRect(r()*W,r()*H,1.5,1.5);}
    const halo=x.createRadialGradient(cx,cy+10,0,cx,cy+10,110);halo.addColorStop(0,'rgba(120,255,90,.55)');halo.addColorStop(1,'rgba(120,255,90,0)');x.fillStyle=halo;x.fillRect(0,0,W,H);
    const crystal=(px,py,s,rot)=>{x.save();x.translate(px,py);x.rotate(rot);
      const cg=x.createLinearGradient(-8*s,0,8*s,0);cg.addColorStop(0,'#2fbf2a');cg.addColorStop(.5,'#d9ffb8');cg.addColorStop(1,'#1f8f1c');
      x.shadowColor='#7dff5a';x.shadowBlur=18;x.fillStyle=cg;x.beginPath();x.moveTo(0,-34*s);x.lineTo(9*s,-20*s);x.lineTo(8*s,14*s);x.lineTo(-8*s,14*s);x.lineTo(-9*s,-20*s);x.closePath();x.fill();
      x.shadowBlur=0;x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1;x.beginPath();x.moveTo(0,-34*s);x.lineTo(0,14*s);x.stroke();x.restore();};
    for(const [px,py,s,rot] of [[cx,cy+20,1.5,0],[cx-26,cy+30,1.1,-.45],[cx+28,cy+32,1.15,.4],[cx-12,cy+42,.8,-.2],[cx+12,cy+44,.75,.25],[cx-44,cy+44,.7,-.8],[cx+44,cy+46,.7,.8]])crystal(px,py,s,rot);
    x.fillStyle='#14170f';x.beginPath();x.ellipse(cx,cy+54,70,14,0,0,7);x.fill();
    for(let i=0;i<40;i++){x.fillStyle=`rgba(160,255,120,${r()*.7})`;x.beginPath();x.arc(cx+(r()-.5)*150,cy+(r()-.5)*190,r()*1.6,0,7);x.fill();}
    x.strokeStyle='rgba(120,255,90,.55)';x.lineWidth=2;rrect(x,10,10,W-20,H-20,10);x.stroke();
  }else if(id==='cowhide'){
    x.fillStyle='#efe9df';x.fillRect(0,0,W,H);
    const patch=(px,py,R,col)=>{x.fillStyle=col;for(let i=0;i<26;i++){const a=r()*7,d=r()*R*.8;x.beginPath();x.ellipse(px+Math.cos(a)*d,py+Math.sin(a)*d*1.2,R*(.35+r()*.4),R*(.3+r()*.35),r()*3,0,7);x.fill();}};
    patch(60,70,62,'#1d1612');patch(190,170,58,'#2a1d14');patch(70,260,50,'#1d1612');patch(210,40,30,'#5a3a24');patch(150,300,26,'#5a3a24');
    x.lineWidth=.7;for(let i=0;i<2600;i++){const px=r()*W,py=r()*H,l=2+r()*4;x.strokeStyle=r()<.5?'rgba(0,0,0,.12)':'rgba(255,255,255,.12)';x.beginPath();x.moveTo(px,py);x.lineTo(px+l*.4,py+l);x.stroke();}
    x.strokeStyle='#c9a46a';x.lineWidth=2;x.setLineDash([6,5]);rrect(x,12,12,W-24,H-24,10);x.stroke();x.setLineDash([]);
  }else if(id==='rust'){
    const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#8b9298');g.addColorStop(.5,'#5e666d');g.addColorStop(1,'#3e454b');x.fillStyle=g;x.fillRect(0,0,W,H);
    for(let i=0;i<H;i+=2){x.fillStyle=`rgba(255,255,255,${r()*.06})`;x.fillRect(0,i,W,1);}
    for(let i=0;i<26;i++){const px=r()*W,py=r()*H,R=10+r()*48,rg=x.createRadialGradient(px,py,0,px,py,R);rg.addColorStop(0,`rgba(${130+r()*40},${50+r()*20},18,${.55+r()*.35})`);rg.addColorStop(.7,'rgba(110,45,15,.25)');rg.addColorStop(1,'rgba(110,45,15,0)');x.fillStyle=rg;x.fillRect(0,0,W,H);}
    for(let i=0;i<900;i++){x.fillStyle=`rgba(${r()<.5?'150,60,20':'60,25,10'},${r()*.5})`;x.fillRect(r()*W,r()*H,1.5,1.5);}
    const rivet=(px,py)=>{const rg=x.createRadialGradient(px-1.5,py-1.5,0,px,py,6);rg.addColorStop(0,'#d7dce0');rg.addColorStop(.6,'#6b7379');rg.addColorStop(1,'#2a2f33');x.fillStyle=rg;x.beginPath();x.arc(px,py,5,0,7);x.fill();
      x.fillStyle='rgba(140,55,18,.5)';x.beginPath();x.arc(px+3,py+5,4,0,7);x.fill();};
    for(const py of [22,H/2,H-22])for(const px of [22,W-22])rivet(px,py);for(const px of [W/2])for(const py of [22,H-22])rivet(px,py);
    x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;x.beginPath();x.moveTo(60,200);x.lineTo(150,150);x.lineTo(170,154);x.stroke();
    x.strokeStyle='rgba(0,0,0,.35)';x.beginPath();x.moveTo(61,202);x.lineTo(151,152);x.stroke();
  }else if(id==='shot'){
    x.fillStyle='#e8dcc0';x.fillRect(0,0,W,H);
    for(let k=6;k>0;k--){x.fillStyle=k%2?'#a3281c':'#e8dcc0';x.beginPath();x.arc(cx,cy,k*17,0,7);x.fill();}
    x.fillStyle='#1d1612';x.font='11px Special Elite, monospace';x.textAlign='center';x.fillText('10',cx,cy+4);
    const hole=(hx,hy,R)=>{const bg=x.createRadialGradient(hx,hy,R*.6,hx,hy,R*2.4);bg.addColorStop(0,'rgba(40,20,10,.5)');bg.addColorStop(1,'rgba(40,20,10,0)');x.fillStyle=bg;x.beginPath();x.arc(hx,hy,R*2.4,0,7);x.fill();
      x.fillStyle='#f4ead2';x.beginPath();for(let i=0;i<12;i++){const a=i/12*Math.PI*2,rad=R*(1.1+r()*.6);x.lineTo(hx+Math.cos(a)*rad,hy+Math.sin(a)*rad);}x.closePath();x.fill();
      x.fillStyle='#0c0a09';x.beginPath();x.arc(hx,hy,R,0,7);x.fill();};
    hole(cx+6,cy-9,4.5);hole(cx-34,cy+22,4.2);hole(cx+40,cy+52,4);hole(cx-14,cy-70,3.8);hole(cx+70,cy-110,3.6);
    for(let i=0;i<30;i++){x.fillStyle=`rgba(30,20,12,${r()*.4})`;x.beginPath();x.arc(cx+(r()-.5)*40,cy+(r()-.5)*40,r()*1.2,0,7);x.fill();}
  }else if(id==='map'){
    x.fillStyle='#e4cf9f';x.fillRect(0,0,W,H);
    for(let i=0;i<20;i++){const px=r()*W,py=r()*H,R=20+r()*60,mg=x.createRadialGradient(px,py,0,px,py,R);mg.addColorStop(0,'rgba(140,100,50,.18)');mg.addColorStop(1,'rgba(140,100,50,0)');x.fillStyle=mg;x.fillRect(0,0,W,H);}
    x.strokeStyle='rgba(120,80,40,.45)';x.lineWidth=1;
    for(let k=0;k<7;k++){const ox=70+k*3,oy=110+k*2;x.beginPath();for(let a=0;a<=Math.PI*2+.1;a+=.2){const rad=14+k*10+Math.sin(a*3+k)*5;const px=ox+Math.cos(a)*rad*1.3,py=oy+Math.sin(a)*rad;a?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();}
    for(let k=0;k<5;k++){const ox=170,oy=250;x.beginPath();for(let a=0;a<=Math.PI*2+.1;a+=.2){const rad=10+k*9+Math.cos(a*2+k)*4;const px=ox+Math.cos(a)*rad,py=oy+Math.sin(a)*rad*1.2;a?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();}
    x.strokeStyle='#7a2a1a';x.lineWidth=2;x.setLineDash([5,5]);x.beginPath();x.moveTo(40,300);x.bezierCurveTo(90,240,40,180,110,150);x.bezierCurveTo(170,120,160,70,200,48);x.stroke();x.setLineDash([]);
    x.strokeStyle='#7a2a1a';x.lineWidth=3;x.beginPath();x.moveTo(192,40);x.lineTo(208,56);x.moveTo(208,40);x.lineTo(192,56);x.stroke();
    x.save();x.translate(56,58);x.fillStyle='#4a2e14';for(let i=0;i<4;i++){x.rotate(Math.PI/2);x.beginPath();x.moveTo(0,-26);x.lineTo(5,0);x.lineTo(-5,0);x.closePath();x.fill();}
    x.strokeStyle='#4a2e14';x.lineWidth=1;x.beginPath();x.arc(0,0,14,0,7);x.stroke();x.font='10px Limelight, Georgia, serif';x.textAlign='center';x.fillText('N',0,-30);x.restore();
  }
  x.restore();
  // wear: scuffs along the edges, grime, a soft vignette
  const vg=x.createRadialGradient(cx,cy,Math.min(W,H)*.35,cx,cy,Math.max(W,H)*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(40,25,10,.38)');x.fillStyle=vg;x.fillRect(0,0,W,H);
  for(let i=0;i<70;i++){const edge=r()*4|0,t=r();let px=edge<2?t*W:(edge===2?r()*8:W-r()*8),py=edge>=2?t*H:(edge===0?r()*8:H-r()*8);
    x.strokeStyle=`rgba(255,248,230,${.1+r()*.25})`;x.lineWidth=.6+r();x.beginPath();x.moveTo(px,py);x.lineTo(px+(r()-.5)*10,py+(r()-.5)*10);x.stroke();}
  for(let i=0;i<14;i++){x.strokeStyle=`rgba(255,250,235,${r()*.12})`;x.lineWidth=.5;x.beginPath();const sx=r()*W,sy=r()*H;x.moveTo(sx,sy);x.lineTo(sx+(r()-.5)*60,sy+(r()-.5)*20);x.stroke();}
  if(['stripe','map','blood','shot'].includes(id)){x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;x.beginPath();x.moveTo(0,H*.37);x.lineTo(W,H*.41);x.stroke();x.strokeStyle='rgba(0,0,0,.18)';x.beginPath();x.moveTo(0,H*.37+1.2);x.lineTo(W,H*.41+1.2);x.stroke();}
  addNoise(x,W,H,r,18);
  return c.toDataURL('image/jpeg',.9);
}

// --- table props: glowing sodas, a raygun, a scoped revolver, bottle caps ---
function drawBottle(x,cx,top,h,w,liq,core,band){
  const L=t=>top+t*h;
  const path=()=>{x.beginPath();
    x.moveTo(cx-w*.14,L(0));x.lineTo(cx-w*.15,L(.2));x.quadraticCurveTo(cx-w*.5,L(.32),cx-w*.45,L(.48));
    x.quadraticCurveTo(cx-w*.33,L(.62),cx-w*.48,L(.8));x.quadraticCurveTo(cx-w*.52,L(.98),cx-w*.42,L(1));
    x.lineTo(cx+w*.42,L(1));x.quadraticCurveTo(cx+w*.52,L(.98),cx+w*.48,L(.8));x.quadraticCurveTo(cx+w*.33,L(.62),cx+w*.45,L(.48));
    x.quadraticCurveTo(cx+w*.5,L(.32),cx+w*.15,L(.2));x.lineTo(cx+w*.14,L(0));x.closePath();};
  x.save();x.shadowColor=liq;x.shadowBlur=26;path();x.fillStyle=liq;x.globalAlpha=.55;x.fill();x.restore();
  x.save();path();x.clip();
  x.fillStyle='rgba(220,240,255,.10)';x.fillRect(cx-w,L(0),w*2,h);
  const g=x.createLinearGradient(cx-w/2,0,cx+w/2,0);g.addColorStop(0,liq);g.addColorStop(.45,core);g.addColorStop(1,liq);
  x.fillStyle=g;x.fillRect(cx-w,L(.24),w*2,h);
  x.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<7;i++){x.beginPath();x.arc(cx-w*.25+((i*37)%17)/17*w*.5,L(.4+((i*53)%29)/29*.5),.9+(i%3)*.5,0,7);x.fill();}
  if(band){x.fillStyle=band;x.fillRect(cx-w,L(.52),w*2,h*.13);}
  x.restore();
  path();x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;x.stroke();
  x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=1.6;x.beginPath();x.moveTo(cx-w*.3,L(.36));x.quadraticCurveTo(cx-w*.36,L(.48),cx-w*.28,L(.58));x.stroke();
  x.fillStyle='#b8b1a2';rrect(x,cx-w*.19,L(0)-5,w*.38,6,1.5);x.fill();
  x.fillStyle='rgba(0,0,0,.3)';for(let i=0;i<5;i++)x.fillRect(cx-w*.17+i*w*.08,L(0)-5,1,6);
}
function drawCap(x,cx,cy,R,col){
  x.beginPath();for(let i=0;i<42;i++){const a=i/42*Math.PI*2,rad=i%2?R:R*.9;x.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad*.62);}x.closePath();
  const g=x.createLinearGradient(cx-R,cy-R,cx+R,cy+R);g.addColorStop(0,'#f4efe4');g.addColorStop(1,col);x.fillStyle=g;x.fill();
  x.fillStyle=col;x.beginPath();x.ellipse(cx,cy,R*.62,R*.38,0,0,7);x.fill();
  x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.ellipse(cx-R*.2,cy-R*.12,R*.18,R*.08,0,0,7);x.fill();
}
function drawRevolver(x){
  const steel=(y0,y1)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#a8b0b8');g.addColorStop(.35,'#4d555d');g.addColorStop(1,'#1c2126');return g;};
  x.fillStyle='#262c31';x.fillRect(132,18,8,12);x.fillRect(196,18,8,12);
  x.fillStyle=steel(4,20);rrect(x,108,5,118,14,6);x.fill();
  x.fillStyle=steel(0,24);rrect(x,100,1,16,22,4);x.fill();rrect(x,220,1,15,22,4);x.fill();
  x.save();x.shadowColor='#7fe3ff';x.shadowBlur=8;x.fillStyle='#9fefff';x.globalAlpha=.8;x.beginPath();x.ellipse(235,12,2.4,8,0,0,7);x.fill();x.restore();
  x.fillStyle=steel(28,44);rrect(x,110,28,140,15,3);x.fill();
  x.fillStyle='#0f1214';x.fillRect(247,31,3,9);
  x.fillStyle=steel(44,51);rrect(x,118,44,92,6,2);x.fill();
  x.fillStyle='#262c31';x.fillRect(238,22,5,7);
  x.fillStyle=steel(22,72);x.beginPath();x.moveTo(52,30);x.lineTo(114,26);x.lineTo(118,62);x.lineTo(96,70);x.lineTo(72,72);x.lineTo(56,58);x.closePath();x.fill();
  x.fillStyle=steel(24,62);rrect(x,74,24,40,38,6);x.fill();
  x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=2;for(const fy of [33,43,53]){x.beginPath();x.moveTo(78,fy);x.lineTo(110,fy);x.stroke();}
  x.fillStyle='#262c31';x.beginPath();x.moveTo(54,30);x.lineTo(38,15);x.lineTo(47,12);x.lineTo(64,28);x.closePath();x.fill();
  x.strokeStyle='#3a4249';x.lineWidth=4;x.beginPath();x.arc(88,72,13,.1,Math.PI-.2);x.stroke();
  x.strokeStyle='#1c2126';x.lineWidth=3;x.beginPath();x.moveTo(86,68);x.quadraticCurveTo(84,78,90,82);x.stroke();
  const g=x.createLinearGradient(30,60,70,104);g.addColorStop(0,'#94572f');g.addColorStop(.5,'#5e3418');g.addColorStop(1,'#341a0a');
  x.fillStyle=g;x.beginPath();x.moveTo(56,56);x.lineTo(76,70);x.quadraticCurveTo(70,92,62,104);x.lineTo(34,106);x.quadraticCurveTo(26,96,30,86);x.quadraticCurveTo(40,70,56,56);x.closePath();x.fill();
  x.strokeStyle='rgba(255,210,160,.18)';x.lineWidth=1;for(let i=0;i<5;i++){x.beginPath();x.moveTo(38+i*5,100);x.quadraticCurveTo(50+i*3,82,60+i*2,66);x.stroke();}
  x.fillStyle='#c9a25a';x.beginPath();x.arc(52,88,3,0,7);x.fill();
  x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=1;x.beginPath();x.moveTo(112,30);x.lineTo(248,30);x.stroke();
  x.strokeStyle='#c9a25a';x.lineWidth=1.2;x.beginPath();x.moveTo(140,36);x.lineTo(150,36);x.moveTo(160,36);x.lineTo(240,36);x.stroke();
}
function drawRaygun(x){
  const chrome=(y0,y1)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#f4f6f8');g.addColorStop(.3,'#a2acb5');g.addColorStop(.62,'#3d454d');g.addColorStop(1,'#cfd6dc');return g;};
  const gr=x.createLinearGradient(50,60,84,118);gr.addColorStop(0,'#c23a2f');gr.addColorStop(1,'#5e1210');
  x.fillStyle=gr;x.beginPath();x.moveTo(58,60);x.lineTo(90,62);x.quadraticCurveTo(84,95,80,116);x.lineTo(50,116);x.quadraticCurveTo(47,90,58,60);x.closePath();x.fill();
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=1.2;for(let i=0;i<5;i++){x.beginPath();x.moveTo(55+i*.6,74+i*8);x.lineTo(82-i*.6,74+i*8);x.stroke();}
  x.strokeStyle='#8e9aa3';x.lineWidth=3.5;x.beginPath();x.arc(100,72,12,.2,Math.PI-.4);x.stroke();
  x.fillStyle='#b8322a';x.beginPath();x.moveTo(34,46);x.lineTo(6,16);x.lineTo(52,34);x.closePath();x.fill();
  x.beginPath();x.moveTo(34,56);x.lineTo(4,82);x.lineTo(50,64);x.closePath();x.fill();
  x.fillStyle='#d94b3d';x.beginPath();x.moveTo(62,28);x.lineTo(80,2);x.lineTo(100,28);x.closePath();x.fill();
  x.fillStyle=chrome(22,80);x.beginPath();x.ellipse(80,51,52,28,0,0,Math.PI*2);x.fill();
  x.save();x.beginPath();x.ellipse(80,51,52,28,0,0,Math.PI*2);x.clip();x.fillStyle='#b8322a';x.fillRect(64,20,12,64);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(64,20,12,6);x.restore();
  x.save();x.shadowColor='#9dff7a';x.shadowBlur=14;x.fillStyle='#b7ff9a';x.beginPath();x.ellipse(102,30,10,6,0,0,7);x.fill();x.restore();
  x.fillStyle=chrome(40,62);rrect(x,124,40,66,22,6);x.fill();
  x.fillStyle='#2b3138';for(const bx of [136,152,168]){rrect(x,bx,35,6,32,3);x.fill();}
  x.fillStyle=chrome(36,64);x.beginPath();x.moveTo(188,38);x.lineTo(214,46);x.lineTo(214,56);x.lineTo(188,64);x.closePath();x.fill();
  x.save();x.shadowColor='#5ff0ff';x.shadowBlur=18;x.fillStyle='#bdfaff';x.beginPath();x.ellipse(216,51,4.5,7,0,0,7);x.fill();x.restore();
  x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1.4;x.beginPath();x.ellipse(74,40,30,9,-.15,Math.PI*1.05,Math.PI*1.75);x.stroke();
}
let PROPS=null;
const PROP_W=720,PROP_H=150;
function buildProps(){
  const S=2,[c,x]=mkCanvas(PROP_W*S,PROP_H*S);x.scale(S,S);
  const shadow=(cx,cy,rx,ry)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,rx);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.save();x.scale(1,ry/rx);x.fillStyle=g;x.beginPath();x.arc(cx,cy*rx/ry,rx,0,7);x.fill();x.restore();};
  shadow(150,128,130,14);shadow(388,140,36,7);shadow(575,132,120,13);
  x.save();x.translate(22,26);x.rotate(-.07);drawRevolver(x);x.restore();
  drawCap(x,292,128,10,'#b8322a');drawCap(x,318,138,9,'#3f7a3a');drawCap(x,300,112,8,'#c9a25a');drawCap(x,470,140,9,'#b8322a');drawCap(x,690,136,8,'#c9a25a');
  drawBottle(x,388,14,126,40,'#5dff5a','#e6ffd6',null);
  x.save();x.translate(470,22);x.rotate(.05);drawRaygun(x);x.restore();
  PROPS={url:c.toDataURL(),glows:[{x:388,y:14+126*.62,c:'#5dff5a',s:160},{x:470+216,y:22+51,c:'#5ff0ff',s:60}]};
}
function propsHTML(){
  if(!PROPS)buildProps();
  return `<div class="barrail" aria-hidden="true"><img src="${PROPS.url}" alt="">${PROPS.glows.map(g=>`<span class="glowdot" style="left:${g.x/PROP_W*100}%;top:${g.y/PROP_H*100}%;--gc:${g.c};--gs:${g.s/PROP_W*100}%"></span>`).join('')}</div>`;
}

// --- dust motes drifting across the screen ---
function startDust(){
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const c=document.getElementById('dustfx');if(!c||reduce)return;
  const x=c.getContext('2d');let W=0,H=0,dpr=1;
  const P=Array.from({length:46},()=>({x:Math.random(),y:Math.random(),s:Math.random()*1.6+.4,a:Math.random()*.25+.06,vx:Math.random()*.00025+.00008,vy:(Math.random()-.6)*.00012,w:Math.random()*6}));
  const size=()=>{dpr=window.devicePixelRatio||1;W=window.innerWidth;H=window.innerHeight;c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);};
  size();window.addEventListener('resize',size);
  let t=0;const tick=()=>{if(!document.hidden){t+=1;x.clearRect(0,0,W,H);
    if(typeof meta!=='undefined'&&meta&&meta.opt&&meta.opt.dust===false){requestAnimationFrame(tick);return;}
    for(const p of P){p.x+=p.vx;p.y+=p.vy+Math.sin((t/90)+p.w)*.00006;if(p.x>1.02)p.x=-.02;if(p.y<-.02)p.y=1.02;if(p.y>1.02)p.y=-.02;
      x.fillStyle=`rgba(232,205,160,${p.a})`;x.beginPath();x.arc(p.x*W,p.y*H,p.s,0,7);x.fill();}}
    requestAnimationFrame(tick);};
  requestAnimationFrame(tick);
}

// Unlockable card back art: cardbacks/<id>.png|jpg|jpeg|webp, with a placeholder until it's uploaded.
function backPlaceholder(name){
  const W=240,H=336,[c,x]=mkCanvas(W,H);
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a2618');g.addColorStop(1,'#1b110b');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.strokeStyle='#c9a25a';x.lineWidth=3;rrect(x,12,12,W-24,H-24,10);x.stroke();x.lineWidth=1;rrect(x,20,20,W-40,H-40,7);x.stroke();
  x.fillStyle='#e6c171';x.textAlign='center';x.font='22px Limelight, Georgia, serif';
  const words=name.toUpperCase().split(' ');let line='',lines=[];for(const w of words){if((line+' '+w).trim().length>11){lines.push(line.trim());line=w;}else line+=' '+w;}lines.push(line.trim());
  lines.forEach((l,i)=>x.fillText(l,W/2,H/2-((lines.length-1)*14)+i*28));
  return c.toDataURL();
}
function loadBackArt(){
  const css=[],exts=['png','jpg','jpeg','webp','PNG','JPG','JPEG'];
  for(const b of LOOKS.back.filter(b=>b.art)){
    document.documentElement.style.setProperty('--back-'+b.id,`url(${backPlaceholder(b.name)})`);
    css.push(`[data-back="${b.id}"]{--back-bg:var(--back-${b.id}) center/cover no-repeat, #1b110b;--back-border:#00000099}`);
    const tryExt=n=>{if(n>=exts.length)return;const im=new Image();im.onload=()=>document.documentElement.style.setProperty('--back-'+b.id,`url(${im.src})`);im.onerror=()=>tryExt(n+1);im.src=`cardbacks/${b.id}.${exts[n]}`;};
    tryExt(0);
  }
  const st=document.createElement('style');st.textContent=css.join('\n');document.head.appendChild(st);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{for(const b of LOOKS.back.filter(b=>b.art)){const cur=getComputedStyle(document.documentElement).getPropertyValue('--back-'+b.id);if(cur.includes('data:'))document.documentElement.style.setProperty('--back-'+b.id,`url(${backPlaceholder(b.name)})`);}});
}
function initArt(){
  try{loadBackArt();}catch(e){}
  const root=document.documentElement.style;
  const set=(k,url)=>root.setProperty(k,`url(${url})`);
  try{
    set('--tex-grain',texGrain());set('--tex-paper',texPaper());set('--tex-dust',texDust());
    set('--tex-wood',texWood('#4a2e1b','#2a170b','#7a5233',3));
    set('--tex-wood-light',texWood('#7a5230','#3e2412','#a87a4c',9));
    set('--tex-leather',texLeather('#3b2416',4));
    set('--tex-leather-mat',texLeather('#4a1f17',8));
    const drawBacks=()=>{for(const id of BACK_IDS)set('--back-'+id,backArt(id));};
    drawBacks();
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{drawBacks();});
  }catch(e){}
  startDust();
}

// ---------- character portraits (drawn on canvas) ----------
const PORTRAIT_CACHE={};
function pEllipse(x,cx,cy,rx,ry,fill){x.fillStyle=fill;x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);x.fill();}
function pPoly(x,pts,fill){x.fillStyle=fill;x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.fill();}
function pShade(x,cx,cy,r,col){const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);}
function pEyes(x,y,dx,iris,opts={}){
  for(const s of [-1,1]){const ex=120+s*dx;
    pEllipse(x,ex,y,opts.w||8,opts.h||6,'#fbf6ec');pEllipse(x,ex+(opts.look||0),y+.5,3.6,3.8,iris);pEllipse(x,ex+(opts.look||0),y+.5,1.8,1.8,'#111');pEllipse(x,ex+1.4,y-1.4,1.1,1.1,'#fff');}
}
function pTorso(x,fill,w){x.fillStyle=fill;x.beginPath();x.moveTo(0,300);x.lineTo(0,268);x.quadraticCurveTo(20,226-w*.1,70-w,214);x.quadraticCurveTo(120,204,170+w,214);x.quadraticCurveTo(220,226-w*.1,240,268);x.lineTo(240,300);x.closePath();x.fill();}

function drawVladmira(x){
  x.save();x.shadowColor='rgba(120,255,90,.65)';x.shadowBlur=22;pTorso(x,'#2e7f8c',14);x.restore();
  pEllipse(x,44,238,42,30,'#2a7482');pEllipse(x,196,238,42,30,'#2a7482');
  pShade(x,44,230,30,'rgba(255,255,255,.12)');pShade(x,196,230,30,'rgba(255,255,255,.12)');
  pPoly(x,[[94,214],[120,248],[146,214]],'#c8e4e8');
  x.strokeStyle='#1d555f';x.lineWidth=2;x.beginPath();x.moveTo(120,248);x.lineTo(120,300);x.stroke();
  x.strokeStyle='#e9c46a';x.lineWidth=5;x.beginPath();x.moveTo(26,256);x.lineTo(56,252);x.moveTo(184,252);x.lineTo(214,256);x.stroke();
  x.fillStyle='#e3a97f';rrect(x,98,166,44,54,12);x.fill();
  // braid behind
  for(let i=0;i<7;i++)pEllipse(x,170+i*3.4,150+i*15,10-i*.3,9,i%2?'#d9b04c':'#e8c15a');
  pEllipse(x,190,256,7,5,'#c33');
  x.save();x.shadowColor='rgba(120,255,90,.55)';x.shadowBlur=16;pEllipse(x,120,126,47,55,'#eab38a');x.restore();
  pEllipse(x,74,132,8,12,'#e3a97f');pEllipse(x,166,132,8,12,'#e3a97f');
  pShade(x,120,170,40,'rgba(150,80,50,.18)');
  x.fillStyle='#e8c15a';x.beginPath();x.moveTo(72,124);x.quadraticCurveTo(70,64,120,64);x.quadraticCurveTo(172,64,170,124);x.quadraticCurveTo(160,96,138,92);x.quadraticCurveTo(120,104,96,92);x.quadraticCurveTo(82,100,72,124);x.closePath();x.fill();
  x.strokeStyle='#c99a3a';x.lineWidth=1.5;for(const sx of [92,108,126,144]){x.beginPath();x.moveTo(sx,70);x.quadraticCurveTo(sx+4,82,sx+2,96);x.stroke();}
  x.strokeStyle='#8a5a1e';x.lineWidth=4;x.lineCap='round';x.beginPath();x.moveTo(94,112);x.lineTo(110,108);x.moveTo(130,108);x.lineTo(146,112);x.stroke();
  pEyes(x,124,17,'#3a7bd5');
  pEllipse(x,96,146,9,6,'rgba(230,90,80,.35)');pEllipse(x,144,146,9,6,'rgba(230,90,80,.35)');
  x.fillStyle='rgba(120,200,90,.55)';for(const [fx,fy] of [[92,140],[98,144],[146,141],[141,146],[100,138]]){x.beginPath();x.arc(fx,fy,1.3,0,7);x.fill();}
  x.strokeStyle='#b97a55';x.lineWidth=2;x.beginPath();x.moveTo(120,128);x.quadraticCurveTo(116,142,122,144);x.stroke();
  x.fillStyle='#8f2a22';x.beginPath();x.moveTo(98,154);x.quadraticCurveTo(120,180,142,154);x.quadraticCurveTo(120,162,98,154);x.closePath();x.fill();
  x.fillStyle='#fff';x.beginPath();x.moveTo(101,155);x.quadraticCurveTo(120,163,139,155);x.lineTo(137,159);x.quadraticCurveTo(120,165,103,159);x.closePath();x.fill();
  x.fillStyle='rgba(160,255,120,.8)';for(let i=0;i<14;i++){x.beginPath();x.arc(20+((i*53)%200),40+((i*97)%220),1.2+(i%3)*.6,0,7);x.fill();}
}
function drawNuke(x){
  pTorso(x,'#e9ecef',-6);
  pShade(x,60,250,60,'rgba(0,0,0,.12)');pShade(x,180,250,60,'rgba(0,0,0,.12)');
  pPoly(x,[[100,214],[120,262],[140,214]],'#6d8fc7');
  pPoly(x,[[116,222],[124,222],[127,260],[120,270],[113,260]],'#b5322a');
  x.strokeStyle='#b8bec4';x.lineWidth=2;x.beginPath();x.moveTo(100,214);x.lineTo(118,268);x.lineTo(112,300);x.moveTo(140,214);x.lineTo(122,268);x.lineTo(128,300);x.stroke();
  x.fillStyle='#d5dade';rrect(x,150,250,34,30,3);x.fill();
  for(const [px,col] of [[156,'#2f6db8'],[164,'#b5322a'],[172,'#333']]){x.fillStyle=col;x.fillRect(px,240,3,16);}
  x.fillStyle='#ecc6a3';rrect(x,104,172,32,48,10);x.fill();
  pEllipse(x,120,136,40,50,'#f0c9a6');
  pEllipse(x,80,140,7,11,'#e8bd98');pEllipse(x,160,140,7,11,'#e8bd98');
  pPoly(x,[[78,124],[74,92],[90,98],[88,72],[104,86],[110,62],[122,82],[134,60],[140,84],[156,70],[152,96],[168,90],[162,124],[150,104],[120,100],[92,104]],'#3b2a1e');
  x.fillStyle='#2b2b2b';x.fillRect(80,96,80,8);
  for(const s of [-1,1]){pEllipse(x,120+s*18,96,12,11,'#555');pEllipse(x,120+s*18,96,8.5,7.5,'#d99a3a');pEllipse(x,120+s*18-3,93,2.5,2,'rgba(255,255,255,.6)');}
  x.strokeStyle='#6b4a2e';x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(96,120);x.lineTo(110,116);x.moveTo(130,116);x.lineTo(144,120);x.stroke();
  pEyes(x,134,17,'#5b3a1e',{w:6,h:5,look:-1});
  x.strokeStyle='#222';x.lineWidth=2.5;for(const s of [-1,1]){x.beginPath();x.arc(120+s*17,134,13,0,7);x.stroke();}x.beginPath();x.moveTo(110,133);x.lineTo(130,133);x.stroke();
  x.fillStyle='rgba(255,255,255,.18)';for(const s of [-1,1]){x.beginPath();x.ellipse(120+s*17-4,130,4,6,-.4,0,7);x.fill();}
  x.strokeStyle='#b07a5a';x.lineWidth=2;x.beginPath();x.moveTo(120,140);x.quadraticCurveTo(116,152,122,154);x.stroke();
  x.strokeStyle='#8a4a3a';x.lineWidth=2.5;x.beginPath();x.moveTo(106,166);x.quadraticCurveTo(112,162,118,166);x.quadraticCurveTo(124,170,132,164);x.stroke();
  x.fillStyle='#9fd8ff';x.beginPath();x.moveTo(160,108);x.quadraticCurveTo(166,120,160,124);x.quadraticCurveTo(154,120,160,108);x.fill();
  // flask
  x.save();x.translate(46,226);
  x.fillStyle='rgba(220,240,255,.35)';x.beginPath();x.moveTo(-6,0);x.lineTo(6,0);x.lineTo(6,22);x.lineTo(28,62);x.quadraticCurveTo(30,72,20,72);x.lineTo(-20,72);x.quadraticCurveTo(-30,72,-28,62);x.lineTo(-6,22);x.closePath();x.fill();
  x.save();x.shadowColor='#7dff5a';x.shadowBlur=18;x.fillStyle='#7dff5a';x.beginPath();x.moveTo(-17,42);x.lineTo(17,42);x.lineTo(28,62);x.quadraticCurveTo(30,72,20,72);x.lineTo(-20,72);x.quadraticCurveTo(-30,72,-28,62);x.closePath();x.fill();x.restore();
  x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=1.5;x.beginPath();x.moveTo(-6,0);x.lineTo(-6,22);x.lineTo(-28,62);x.stroke();
  x.fillStyle='#e9fff0';for(const [bx,by] of [[-6,52],[4,60],[10,48]]){x.beginPath();x.arc(bx,by,2,0,7);x.fill();}
  x.restore();
}
function drawChevy(x){
  pTorso(x,'#4f6b7a',6);
  x.fillStyle='#3d5562';x.fillRect(84,214,16,90);x.fillRect(140,214,16,90);
  pEllipse(x,92,226,6,6,'#c9a25a');pEllipse(x,148,226,6,6,'#c9a25a');
  x.fillStyle='#e9e4d6';x.beginPath();x.ellipse(176,252,22,12,0,0,7);x.fill();x.strokeStyle='#b5322a';x.lineWidth=1.5;x.stroke();
  x.fillStyle='#b5322a';x.font='11px Special Elite, monospace';x.textAlign='center';x.fillText('CHEVY',176,256);
  x.fillStyle='rgba(20,15,10,.45)';for(const [gx,gy,r] of [[60,262,10],[198,280,8],[110,284,7],[40,240,6]]){x.beginPath();x.ellipse(gx,gy,r,r*.6,.5,0,7);x.fill();}
  x.fillStyle='#d39a72';rrect(x,100,168,40,52,12);x.fill();
  // wrench over shoulder
  x.save();x.translate(196,206);x.rotate(-.9);
  const wg=x.createLinearGradient(0,-8,0,8);wg.addColorStop(0,'#d7dce0');wg.addColorStop(1,'#6b7379');x.fillStyle=wg;rrect(x,-10,-6,120,12,6);x.fill();
  x.beginPath();x.arc(116,0,16,0,7);x.fill();x.fillStyle='#5a2d16';x.beginPath();x.moveTo(116,0);x.lineTo(136,-9);x.lineTo(136,9);x.closePath();x.fill();
  x.restore();
  pEllipse(x,120,128,44,52,'#d9a07a');
  pEllipse(x,76,132,8,12,'#cf946e');pEllipse(x,164,132,8,12,'#cf946e');
  x.fillStyle='#5a3a24';x.fillRect(74,108,8,26);x.fillRect(158,108,8,26);
  x.fillStyle='rgba(60,40,25,.5)';for(let i=0;i<70;i++){const a=Math.PI*(.15+.7*((i*37)%100)/100),rad=40+((i*13)%9);x.beginPath();x.arc(120+Math.cos(a)*rad*.92,128+Math.sin(a)*rad,1,0,7);x.fill();}
  // cap
  x.fillStyle='#b5322a';x.beginPath();x.moveTo(74,108);x.quadraticCurveTo(76,62,120,60);x.quadraticCurveTo(164,62,166,108);x.closePath();x.fill();
  x.fillStyle='#8f241e';x.beginPath();x.ellipse(120,108,58,10,0,0,Math.PI);x.fill();
  x.fillStyle='#e9e4d6';rrect(x,108,74,24,16,3);x.fill();x.fillStyle='#b5322a';x.font='10px Limelight, Georgia, serif';x.textAlign='center';x.fillText('V',120,86);
  x.strokeStyle='#4a2e1a';x.lineWidth=4;x.lineCap='round';x.beginPath();x.moveTo(94,118);x.lineTo(110,120);x.moveTo(130,118);x.lineTo(146,114);x.stroke();
  pEyes(x,128,17,'#5b7a3a',{w:7,h:5});
  x.strokeStyle='#a86e4c';x.lineWidth=2;x.beginPath();x.moveTo(120,130);x.quadraticCurveTo(115,146,122,148);x.stroke();
  x.strokeStyle='#6e3524';x.lineWidth=3;x.beginPath();x.moveTo(104,160);x.quadraticCurveTo(120,166,140,154);x.stroke();
  // turret
  x.save();x.translate(30,232);
  x.strokeStyle='#3a3f42';x.lineWidth=4;x.beginPath();x.moveTo(20,30);x.lineTo(4,64);x.moveTo(20,30);x.lineTo(36,64);x.moveTo(20,30);x.lineTo(20,66);x.stroke();
  x.fillStyle='#6f7a5a';rrect(x,2,4,36,26,5);x.fill();x.fillStyle='#565f45';x.fillRect(2,20,36,4);
  x.fillStyle='#3a3f42';x.fillRect(36,12,26,6);x.fillRect(58,10,6,10);
  x.save();x.shadowColor='#ff3b2a';x.shadowBlur=10;pEllipse(x,12,12,3.5,3.5,'#ff4a3a');x.restore();
  x.restore();
}
function drawGreg(x){
  x.fillStyle='#6f8f3a';x.beginPath();x.moveTo(0,300);x.lineTo(0,200);x.quadraticCurveTo(30,168,80,174);x.quadraticCurveTo(120,178,160,174);x.quadraticCurveTo(210,168,240,200);x.lineTo(240,300);x.closePath();x.fill();
  pShade(x,40,220,60,'rgba(255,255,200,.12)');pShade(x,200,220,60,'rgba(255,255,200,.12)');
  x.strokeStyle='rgba(40,60,20,.6)';x.lineWidth=2;x.beginPath();x.moveTo(120,230);x.lineTo(120,300);x.moveTo(70,250);x.quadraticCurveTo(95,262,118,252);x.moveTo(170,250);x.quadraticCurveTo(145,262,122,252);x.stroke();
  x.strokeStyle='#5a3a1e';x.lineWidth=12;x.beginPath();x.moveTo(30,180);x.lineTo(210,300);x.stroke();
  pEllipse(x,140,248,9,9,'#c9a25a');pEllipse(x,140,248,4,4,'#5a3a1e');
  x.fillStyle='#6a8a36';rrect(x,94,150,52,36,14);x.fill();
  pEllipse(x,120,112,54,54,'#7aa041');
  pShade(x,104,92,40,'rgba(255,255,220,.18)');
  pEllipse(x,68,118,9,12,'#6f9339');pEllipse(x,172,118,9,12,'#6f9339');
  x.fillStyle='#5f8232';x.beginPath();x.ellipse(120,96,46,12,0,Math.PI,0);x.fill();
  x.strokeStyle='#2e3a14';x.lineWidth=3.5;x.lineCap='round';for(const s of [-1,1]){x.beginPath();x.arc(120+s*20,108,8,Math.PI*1.1,Math.PI*1.9);x.stroke();}
  pEllipse(x,96,124,8,5,'rgba(230,110,90,.35)');pEllipse(x,144,124,8,5,'rgba(230,110,90,.35)');
  x.fillStyle='#5f8232';x.beginPath();x.moveTo(114,108);x.quadraticCurveTo(110,126,120,130);x.quadraticCurveTo(130,126,126,108);x.fill();
  x.fillStyle='#3a2a14';x.beginPath();x.moveTo(120,134);x.quadraticCurveTo(100,126,82,140);x.quadraticCurveTo(76,150,70,146);x.quadraticCurveTo(80,158,98,146);x.quadraticCurveTo(110,140,120,142);x.quadraticCurveTo(130,140,142,146);x.quadraticCurveTo(160,158,170,146);x.quadraticCurveTo(164,150,158,140);x.quadraticCurveTo(140,126,120,134);x.fill();
  x.fillStyle='#4a1e14';x.beginPath();x.moveTo(98,148);x.quadraticCurveTo(120,172,142,148);x.closePath();x.fill();
  x.fillStyle='#fff';x.fillRect(104,148,32,5);
  // Alex the doll
  x.save();x.translate(150,212);x.rotate(.12);
  x.fillStyle='#4f78b8';rrect(x,-18,18,36,46,8);x.fill();
  x.strokeStyle='#2f4f88';x.lineWidth=1;x.setLineDash([3,3]);rrect(x,-15,21,30,40,6);x.stroke();x.setLineDash([]);
  pEllipse(x,0,4,17,17,'#f1d2b0');
  x.strokeStyle='#d0702e';x.lineWidth=3;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(i*4,-12);x.quadraticCurveTo(i*6,-4,i*6.5,4);x.stroke();}
  pEllipse(x,-6,4,2.6,2.6,'#111');pEllipse(x,6,4,2.6,2.6,'#111');
  x.strokeStyle='#a33';x.lineWidth=1.5;x.beginPath();x.arc(0,9,6,.2,Math.PI-.2);x.stroke();
  for(let i=-4;i<=4;i+=2){x.beginPath();x.moveTo(i*1.2,10);x.lineTo(i*1.2,13);x.stroke();}
  pEllipse(x,-12,9,3,2,'rgba(230,110,110,.5)');pEllipse(x,12,9,3,2,'rgba(230,110,110,.5)');
  x.restore();
  x.fillStyle='#6f9339';x.beginPath();x.ellipse(128,262,40,20,-.3,0,7);x.fill();
  x.strokeStyle='#4f6e28';x.lineWidth=2;for(let i=0;i<3;i++){x.beginPath();x.moveTo(150+i*7,248+i*3);x.lineTo(162+i*6,262+i*2);x.stroke();}
}
function drawJeanita(x){
  x.fillStyle='#6b4a6e';x.beginPath();x.moveTo(0,300);x.lineTo(0,240);x.lineTo(30,212);x.lineTo(80,206);x.lineTo(160,206);x.lineTo(210,212);x.lineTo(240,240);x.lineTo(240,300);x.closePath();x.fill();
  const patch=(px,py,w,h,col,rot)=>{x.save();x.translate(px,py);x.rotate(rot);x.fillStyle=col;x.fillRect(-w/2,-h/2,w,h);x.strokeStyle='#e9dcc0';x.lineWidth=1.2;x.setLineDash([3,3]);x.strokeRect(-w/2+2,-h/2+2,w-4,h-4);x.setLineDash([]);x.restore();};
  patch(40,250,34,28,'#b8892c',.15);patch(200,262,30,34,'#2f6f6a',-.12);patch(70,286,26,20,'#6a4a2a',.05);patch(186,226,22,18,'#8a3a3a',.3);
  pPoly(x,[[96,206],[120,262],[84,300],[64,300],[78,240]],'#5a3d5d');pPoly(x,[[144,206],[120,262],[156,300],[176,300],[162,240]],'#5a3d5d');
  x.fillStyle='#ece3cc';x.beginPath();x.moveTo(100,206);x.lineTo(120,250);x.lineTo(140,206);x.closePath();x.fill();
  x.strokeStyle='#cbbf9f';x.lineWidth=1.2;for(let i=0;i<4;i++){x.beginPath();x.arc(120,214+i*9,6,0,Math.PI);x.stroke();}
  x.fillStyle='#8f7d50';rrect(x,106,164,28,46,8);x.fill();
  x.strokeStyle='#6d5e36';x.lineWidth=1.2;for(const yy of [178,190]){x.beginPath();x.moveTo(108,yy);x.lineTo(132,yy+1);x.stroke();}
  // cord behind
  x.strokeStyle='#1d1d1d';x.lineWidth=2.4;x.beginPath();for(let t=0;t<=1;t+=.01){const px=70+Math.sin(t*Math.PI*14)*6-t*20,py=168+t*96;t?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();
  pEllipse(x,120,124,42,52,'#a49061');
  x.fillStyle='rgba(110,90,50,.55)';for(const [sx,sy,rx,ry] of [[98,98,10,7],[146,140,9,12],[104,160,8,5],[136,102,6,5]]){x.beginPath();x.ellipse(sx,sy,rx,ry,.4,0,7);x.fill();}
  x.fillStyle='rgba(200,185,130,.45)';for(const [sx,sy,r] of [[110,140,4],[132,154,3],[90,124,3]]){x.beginPath();x.arc(sx,sy,r,0,7);x.fill();}
  for(const s of [-1,1]){pEllipse(x,120+s*16,120,11,9,'#2e2414');x.save();x.shadowColor='#d8ff6a';x.shadowBlur=8;pEllipse(x,120+s*16,121,2.6,2.6,'#e6ff8a');x.restore();}
  x.strokeStyle='#6d5e36';x.lineWidth=2;x.beginPath();x.moveTo(98,108);x.lineTo(110,106);x.moveTo(130,106);x.lineTo(142,109);x.stroke();
  pEllipse(x,116,140,1.8,3.5,'#3a2e1a');pEllipse(x,124,140,1.8,3.5,'#3a2e1a');
  x.fillStyle='#4a2a22';x.beginPath();x.moveTo(104,156);x.quadraticCurveTo(120,164,136,154);x.quadraticCurveTo(120,158,104,156);x.fill();
  x.fillStyle='#e8dcb0';for(let i=0;i<4;i++)x.fillRect(122+i*3.4,155-i*.4,2.6,4);
  x.strokeStyle='rgba(80,60,30,.5)';x.lineWidth=1;for(const [a,b,c,d] of [[96,132,104,136],[138,134,146,130],[110,172,130,172]]){x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();}
  x.strokeStyle='#a0452e';x.lineWidth=2;x.lineCap='round';
  for(const [bx,by,ex,ey] of [[100,80,92,58],[110,76,108,52],[124,76,130,50],[138,80,150,62],[116,78,118,60]]){x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo((bx+ex)/2+6,(by+ey)/2,ex,ey);x.stroke();}
  x.fillStyle='#c9ccd0';for(const [sx,sy,r] of [[104,76,-.2],[124,74,.1],[140,79,.3]]){x.save();x.translate(sx,sy);x.rotate(r);x.fillRect(-6,-1.5,12,3);x.fillStyle='#8a8f94';x.fillRect(-6,-1.5,1.6,5);x.fillRect(4.4,-1.5,1.6,5);x.fillStyle='#c9ccd0';x.restore();}
  const receiver=(rx,ry,rot)=>{x.save();x.translate(rx,ry);x.rotate(rot);
    const g=x.createLinearGradient(-12,0,12,0);g.addColorStop(0,'#2a2a2a');g.addColorStop(.4,'#4a4a4a');g.addColorStop(1,'#141414');
    x.fillStyle=g;rrect(x,-7,-34,14,68,7);x.fill();
    pEllipse(x,0,-34,13,11,'#262626');pEllipse(x,0,34,13,11,'#262626');
    x.fillStyle='#111';for(const yy of [-34,34])for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){x.beginPath();x.arc(i*4,yy+j*3.4,1,0,7);x.fill();}
    x.fillStyle='rgba(255,255,255,.18)';rrect(x,-5,-26,3,52,2);x.fill();
    x.restore();};
  receiver(76,124,.22);receiver(164,124,-.22);
  x.fillStyle='rgba(120,90,60,.6)';pEllipse(x,82,124,6,14,'rgba(120,95,60,.6)');pEllipse(x,158,124,6,14,'rgba(120,95,60,.6)');
}
function drawRonald(x){
  pTorso(x,'#7a2e2e',4);
  pPoly(x,[[92,212],[120,256],[100,300],[70,300],[80,236]],'#5e2020');pPoly(x,[[148,212],[120,256],[140,300],[170,300],[160,236]],'#5e2020');
  x.fillStyle='#f1ead8';x.beginPath();x.moveTo(98,210);x.lineTo(120,250);x.lineTo(142,210);x.closePath();x.fill();
  pPoly(x,[[104,222],[120,230],[104,238]],'#e0b23c');pPoly(x,[[136,222],[120,230],[136,238]],'#e0b23c');pEllipse(x,120,230,4,4,'#b8892c');
  x.fillStyle='#e0b23c';x.font='10px Limelight, Georgia, serif';x.textAlign='center';
  x.fillStyle='#f1ead8';rrect(x,150,236,30,14,2);x.fill();x.fillStyle='#7a2e2e';x.font='9px Special Elite, monospace';x.fillText('WRAY',165,246);
  x.fillStyle='#e0b08a';rrect(x,102,170,36,48,10);x.fill();
  // moonshine jug
  x.save();x.translate(40,236);
  pEllipse(x,0,30,26,28,'#d8c39a');x.fillStyle='#b89f70';x.fillRect(-26,30,52,30);pEllipse(x,0,58,26,6,'#a68d5e');
  x.fillStyle='#d8c39a';x.fillRect(-8,-6,16,12);pEllipse(x,0,-6,9,4,'#6b4a2a');
  x.strokeStyle='#b89f70';x.lineWidth=4;x.beginPath();x.arc(14,10,10,-1.4,1);x.stroke();
  x.fillStyle='#3a2a1a';x.font='bold 16px Georgia, serif';x.textAlign='center';x.fillText('XXX',0,40);x.restore();
  // ribbon mic
  x.save();x.translate(196,250);
  x.strokeStyle='#555';x.lineWidth=4;x.beginPath();x.moveTo(0,0);x.lineTo(0,50);x.stroke();
  const mg=x.createLinearGradient(-16,0,16,0);mg.addColorStop(0,'#8a8f94');mg.addColorStop(.5,'#e8ecef');mg.addColorStop(1,'#6b7076');
  x.fillStyle=mg;rrect(x,-16,-44,32,44,14);x.fill();x.strokeStyle='#4a4f54';x.lineWidth=1;for(let i=-36;i<-6;i+=4){x.beginPath();x.moveTo(-12,i);x.lineTo(12,i);x.stroke();}
  x.restore();
  pEllipse(x,120,126,44,52,'#e6b892');
  pEllipse(x,76,132,8,12,'#dba984');pEllipse(x,164,132,8,12,'#dba984');
  // pompadour
  x.fillStyle='#2b1d14';x.beginPath();x.moveTo(76,120);x.quadraticCurveTo(66,56,124,52);x.quadraticCurveTo(176,50,168,104);x.quadraticCurveTo(164,86,148,84);x.quadraticCurveTo(110,96,84,94);x.quadraticCurveTo(78,104,76,120);x.fill();
  x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.ellipse(116,64,26,6,-.15,0,7);x.fill();
  x.fillStyle='#8f9aa3';x.fillRect(78,104,4,22);x.fillRect(158,104,4,22);
  // headphones
  x.strokeStyle='#2a2a2a';x.lineWidth=7;x.beginPath();x.moveTo(70,128);x.quadraticCurveTo(68,40,120,40);x.quadraticCurveTo(172,40,170,128);x.stroke();
  for(const s2 of [-1,1]){pEllipse(x,120+s2*48,132,12,18,'#2a2a2a');pEllipse(x,120+s2*48,132,7,12,'#b5322a');}
  x.strokeStyle='#2b1d14';x.lineWidth=4;x.lineCap='round';x.beginPath();x.moveTo(94,112);x.quadraticCurveTo(102,106,110,110);x.moveTo(130,110);x.quadraticCurveTo(138,106,146,112);x.stroke();
  pEyes(x,124,17,'#3a6b3a',{w:7,h:4.5});
  x.strokeStyle='#b07a5a';x.lineWidth=2;x.beginPath();x.moveTo(120,128);x.quadraticCurveTo(115,142,122,144);x.stroke();
  // pencil mustache + grin
  x.fillStyle='#2b1d14';x.beginPath();x.moveTo(102,152);x.quadraticCurveTo(120,146,138,152);x.quadraticCurveTo(120,150,102,152);x.fill();
  x.fillStyle='#7a2a22';x.beginPath();x.moveTo(102,158);x.quadraticCurveTo(120,178,140,156);x.quadraticCurveTo(120,164,102,158);x.fill();
  x.fillStyle='#fff';x.beginPath();x.moveTo(105,159);x.quadraticCurveTo(120,166,137,157);x.lineTo(135,161);x.quadraticCurveTo(120,168,107,162);x.closePath();x.fill();
  pEllipse(x,98,144,8,5,'rgba(220,80,70,.4)');pEllipse(x,142,144,8,5,'rgba(220,80,70,.4)');
  // radio waves
  x.strokeStyle='rgba(181,50,42,.7)';x.lineWidth=2.5;for(let i=1;i<=3;i++){x.beginPath();x.arc(196,206,i*10,-1.1,-.2);x.stroke();}
}
function drawMatt(x){
  pTorso(x,'#b9b2a2',0);
  x.fillStyle='#a8a191';x.beginPath();x.moveTo(104,212);x.lineTo(120,234);x.lineTo(136,212);x.closePath();x.fill();
  x.strokeStyle='#8f8878';x.lineWidth=2;x.beginPath();x.moveTo(120,234);x.lineTo(120,262);x.stroke();
  pEllipse(x,120,242,2.2,2.2,'#8f8878');pEllipse(x,120,252,2.2,2.2,'#8f8878');
  x.fillStyle='#ddb595';rrect(x,104,172,32,46,10);x.fill();
  // coffee mug
  x.save();x.translate(184,250);x.fillStyle='#e6e2d8';rrect(x,-16,-12,32,36,4);x.fill();
  x.strokeStyle='#e6e2d8';x.lineWidth=5;x.beginPath();x.arc(18,6,8,-1.3,1.3);x.stroke();
  x.fillStyle='#6b4a2a';x.fillRect(-14,-10,28,4);x.restore();
  pEllipse(x,120,128,42,50,'#e2bc9c');
  pEllipse(x,78,134,7,11,'#d9b292');pEllipse(x,162,134,7,11,'#d9b292');
  x.fillStyle='#6b5440';x.beginPath();x.moveTo(78,116);x.quadraticCurveTo(80,72,120,72);x.quadraticCurveTo(160,72,162,116);x.quadraticCurveTo(150,96,120,94);x.quadraticCurveTo(92,96,78,116);x.fill();
  x.strokeStyle='#6b5440';x.lineWidth=3.5;x.lineCap='round';x.beginPath();x.moveTo(96,116);x.lineTo(110,116);x.moveTo(130,116);x.lineTo(144,116);x.stroke();
  pEyes(x,128,17,'#7a6a58',{w:6,h:3.2});
  x.fillStyle='#e2bc9c';for(const s2 of [-1,1]){x.fillRect(120+s2*17-8,121,16,4);}
  x.strokeStyle='#b8927a';x.lineWidth=2;x.beginPath();x.moveTo(120,134);x.lineTo(118,146);x.lineTo(122,147);x.stroke();
  x.strokeStyle='#8a5a48';x.lineWidth=2.5;x.beginPath();x.moveTo(108,162);x.lineTo(132,162);x.stroke();
}
function drawSnipSnip(x){
  // three arms with tools
  x.strokeStyle='#8c9298';x.lineWidth=7;x.lineCap='round';
  x.beginPath();x.moveTo(90,200);x.quadraticCurveTo(46,214,40,262);x.moveTo(150,200);x.quadraticCurveTo(194,214,200,262);x.moveTo(120,214);x.lineTo(120,270);x.stroke();
  x.strokeStyle='#d8dde2';x.lineWidth=3;
  x.beginPath();x.moveTo(32,262);x.lineTo(46,282);x.moveTo(48,262);x.lineTo(34,282);x.stroke(); // scissors
  pEllipse(x,40,262,4,4,'#d8dde2');
  x.fillStyle='#d8dde2';x.beginPath();x.moveTo(200,258);x.lineTo(212,290);x.lineTo(196,290);x.closePath();x.fill(); // scalpel
  pEllipse(x,120,276,12,6,'#c2c7cc');
  // jet flame
  x.save();x.shadowColor='rgba(120,190,255,.9)';x.shadowBlur=18;pEllipse(x,120,232,16,10,'#8fd0ff');x.restore();
  // body sphere
  pEllipse(x,120,170,58,52,'#a7adb3');pEllipse(x,104,152,26,18,'rgba(255,255,255,.35)');
  x.strokeStyle='#6d7378';x.lineWidth=2;x.beginPath();x.ellipse(120,180,58,14,0,0,Math.PI);x.stroke();
  // three eye stalks
  for(const [ex,ey] of [[84,92],[120,78],[156,92]]){x.strokeStyle='#8c9298';x.lineWidth=5;x.beginPath();x.moveTo(120,128);x.lineTo(ex,ey);x.stroke();
    pEllipse(x,ex,ey,15,15,'#e9edf0');pEllipse(x,ex,ey,8,8,'#2a2f33');pEllipse(x,ex+3,ey-3,2.5,2.5,'#fff');}
}
function drawThreeDog(x){
  pTorso(x,'#2c2a30',6);
  x.fillStyle='#8a2f2a';x.beginPath();x.moveTo(104,212);x.lineTo(120,250);x.lineTo(136,212);x.closePath();x.fill();
  x.fillStyle='#6b4a32';rrect(x,104,172,32,46,10);x.fill();
  pEllipse(x,120,128,42,50,'#7a5236');
  // headphones band and cups
  x.strokeStyle='#1d1b20';x.lineWidth=9;x.beginPath();x.arc(120,124,50,Math.PI*1.05,Math.PI*1.95);x.stroke();
  pEllipse(x,72,134,13,20,'#1d1b20');pEllipse(x,168,134,13,20,'#1d1b20');pEllipse(x,72,134,6,10,'#8a2f2a');pEllipse(x,168,134,6,10,'#8a2f2a');
  // shades
  x.fillStyle='#141216';rrect(x,90,114,26,15,5);x.fill();rrect(x,124,114,26,15,5);x.fill();x.fillRect(114,118,12,4);
  x.fillStyle='rgba(255,255,255,.35)';x.fillRect(95,117,8,3);x.fillRect(129,117,8,3);
  // goatee and grin
  x.fillStyle='#2b1d14';x.beginPath();x.moveTo(108,160);x.quadraticCurveTo(120,186,132,160);x.quadraticCurveTo(120,168,108,160);x.fill();
  x.strokeStyle='#f4ead8';x.lineWidth=3;x.beginPath();x.moveTo(108,152);x.quadraticCurveTo(120,160,132,152);x.stroke();
  // microphone
  x.fillStyle='#55555c';rrect(x,178,236,10,46,3);x.fill();pEllipse(x,183,232,13,15,'#3b3b42');
}
function drawBenny(x){
  // checkered suit
  pTorso(x,'#e8e1cf',10);
  x.save();x.beginPath();x.moveTo(0,300);x.lineTo(0,268);x.quadraticCurveTo(20,222,60,214);x.quadraticCurveTo(120,204,180,214);x.quadraticCurveTo(220,222,240,268);x.lineTo(240,300);x.closePath();x.clip();
  x.fillStyle='#2b2620';for(let yy=200;yy<300;yy+=12)for(let xx=((yy/12)%2)*12;xx<240;xx+=24)x.fillRect(xx,yy,12,12);x.restore();
  x.fillStyle='#f6f1e6';x.beginPath();x.moveTo(100,212);x.lineTo(120,262);x.lineTo(140,212);x.closePath();x.fill();
  x.fillStyle='#1d1a16';x.beginPath();x.moveTo(114,216);x.lineTo(126,216);x.lineTo(123,252);x.lineTo(117,252);x.closePath();x.fill();
  x.fillStyle='#e0b48e';rrect(x,104,172,32,46,10);x.fill();
  pEllipse(x,120,130,40,48,'#e8bf98');
  pEllipse(x,80,136,7,11,'#dcb08c');pEllipse(x,160,136,7,11,'#dcb08c');
  // slick pompadour
  x.fillStyle='#1d140e';x.beginPath();x.moveTo(78,124);x.quadraticCurveTo(72,62,128,58);x.quadraticCurveTo(176,62,162,120);x.quadraticCurveTo(150,92,120,90);x.quadraticCurveTo(92,92,78,124);x.fill();
  x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.ellipse(118,70,22,5,-0.15,0,Math.PI*2);x.fill();
  pEyes(x,128,16,'#4a3424',{w:7,h:3.6,look:1});
  x.strokeStyle='#1d140e';x.lineWidth=3;x.beginPath();x.moveTo(97,117);x.lineTo(112,114);x.moveTo(128,114);x.lineTo(143,119);x.stroke();
  x.strokeStyle='#8a4a3a';x.lineWidth=2.5;x.beginPath();x.moveTo(106,158);x.quadraticCurveTo(122,166,136,154);x.stroke();
  // the platinum chip
  x.save();x.shadowColor='rgba(255,255,255,.9)';x.shadowBlur=12;pEllipse(x,190,250,15,15,'#e9eef2');x.restore();
  x.strokeStyle='#9aa4ac';x.lineWidth=2;x.beginPath();x.arc(190,250,10,0,Math.PI*2);x.stroke();
}
function drawVaultDweller(x){
  pTorso(x,'#2f5fae',8);
  x.fillStyle='#e8c33a';x.fillRect(112,214,16,90);x.fillRect(40,228,26,6);x.fillRect(174,228,26,6);
  x.fillStyle='#e8c33a';x.font='bold 30px Georgia';x.textAlign='center';x.fillText('13',120,272);
  x.fillStyle='#d8a77e';rrect(x,104,172,32,46,10);x.fill();
  pEllipse(x,120,130,40,48,'#e2b48c');
  x.fillStyle='#5a3a22';x.beginPath();x.moveTo(80,122);x.quadraticCurveTo(84,74,124,74);x.quadraticCurveTo(164,76,160,120);x.quadraticCurveTo(140,98,120,100);x.quadraticCurveTo(98,100,80,122);x.fill();
  pEyes(x,128,16,'#3a5f8a',{w:7,h:4});
  x.strokeStyle='#8a4a3a';x.lineWidth=2.5;x.beginPath();x.moveTo(108,158);x.quadraticCurveTo(120,164,132,158);x.stroke();
  x.fillStyle='#3e4a3a';rrect(x,30,250,40,30,6);x.fill();x.fillStyle='#7fe08a';x.fillRect(36,256,28,16);
}
function drawHarold(x){
  pTorso(x,'#6b5a44',6);
  pEllipse(x,120,140,44,50,'#8aa05a');
  x.fillStyle='#6f8648';for(const [a,b,r] of [[96,120,8],[140,150,10],[110,166,6],[148,118,7]]){x.beginPath();x.arc(a,b,r,0,Math.PI*2);x.fill();}
  pEyes(x,136,16,'#d9d2a0',{w:6,h:4});
  x.strokeStyle='#3a2a1a';x.lineWidth=3;x.beginPath();x.moveTo(104,168);x.quadraticCurveTo(120,176,136,168);x.stroke();
  // Bob the tree
  x.fillStyle='#6b4a2a';x.fillRect(114,40,12,56);
  x.fillStyle='#4f8a3a';for(const [a,b,r] of [[120,40,26],[96,52,18],[146,50,18],[110,26,16],[134,28,16]]){x.beginPath();x.arc(a,b,r,0,Math.PI*2);x.fill();}
}
const PORTRAIT_FN={vaultdweller:drawVaultDweller,harold:drawHarold,vladmira:drawVladmira,nuke:drawNuke,chevy:drawChevy,ronald:drawRonald,matt:drawMatt,greg:drawGreg,jeanita:drawJeanita,snipsnip:drawSnipSnip,threedog:drawThreeDog,benny:drawBenny};
const PORTRAIT_BG={vladmira:'#4fa3a5',nuke:'#8a7cc8',chevy:'#d9763a',ronald:'#c4473a',matt:'#a39e94',greg:'#86a843',jeanita:'#5aa58a',snipsnip:'#5f8fb3',threedog:'#c99a3a',benny:'#b0454f',vaultdweller:'#3d6db5',harold:'#7a8a4a'};
// Custom art: drop PNG, JPG or WebP images named after each character into a "portraits" folder next to index.html.
const PORTRAIT_FILE={};
// Boss portraits use the same folder: portraits/<art id>.jpg (see the art ids on ROAD and BEYOND).
const BOSS_ART=['garl','tandi','killian','gizmo','decker','set','lieutenant','master','overseer','scrapper-jojo','mama-tallow','gus','sergeant-brick','velvet-moreno','silver-lou','vey','big-tom','voice','dust-prophet','professor-static','ezekiel','ghost-croupier','colonel-ash'];
// Art for companions and Legend cards: companions/<id>.jpg and legends/<id>.jpg next to index.html (PNG and WebP work too).
const ART={comp:{},legend:{}};
const ART_EXTS=['jpg','jpeg','png','webp','JPG','JPEG','PNG','WEBP'];
function loadArtFolder(folder,ids,store){
  for(const id of ids){
    const tryExt=n=>{if(n>=ART_EXTS.length)return;const im=new Image();
      im.onload=()=>{store[id]=im.src;if(typeof render==='function'&&meta)render();};
      im.onerror=()=>tryExt(n+1);
      im.src=`${folder}/${id}.${ART_EXTS[n]}`;};
    tryExt(0);}
}
function loadPortraitFiles(){
  try{loadArtFolder('companions',Object.keys(GEAR).filter(id=>GEAR[id].slot==='comp'),ART.comp);loadArtFolder('legends',Object.keys(LEGENDS),ART.legend);}catch(e){}
  const exts=ART_EXTS;
  for(const id of [...Object.keys(PORTRAIT_FN),...BOSS_ART]){
    const tryExt=n=>{if(n>=exts.length)return;const im=new Image();
      im.onload=()=>{PORTRAIT_FILE[id]=im.src;if(typeof render==='function'&&meta)render();};
      im.onerror=()=>tryExt(n+1);
      im.src=`portraits/${id}.${exts[n]}`;};
    tryExt(0);}
}
function portrait(id,locked){
  if(!locked&&PORTRAIT_FILE[id])return PORTRAIT_FILE[id];
  const key=id+(locked?'-L':'');if(PORTRAIT_CACHE[key])return PORTRAIT_CACHE[key];
  const S=2,W=240,H=300,[c,x]=mkCanvas(W*S,H*S);x.scale(S,S);
  // aged cream paper, a colored burst and halftone dots: mid-century print look
  x.fillStyle='#efe2c4';x.fillRect(0,0,W,H);
  x.save();x.translate(120,130);for(let i=0;i<20;i++){x.rotate(Math.PI/10);x.fillStyle=i%2?PORTRAIT_BG[id]:'rgba(0,0,0,0)';x.beginPath();x.moveTo(0,0);x.lineTo(-30,-260);x.lineTo(30,-260);x.closePath();x.fill();}x.restore();
  x.fillStyle='rgba(60,40,20,.16)';for(let yy=0;yy<H;yy+=6)for(let xx=(yy/6)%2*3;xx<W;xx+=6){const d=Math.hypot(xx-120,yy-130)/200;x.beginPath();x.arc(xx,yy,Math.max(0,.4+d*1.6),0,7);x.fill();}
  // character layer with a thick ink outline
  const [cc,cx2]=mkCanvas(W*S,H*S);cx2.scale(S,S);PORTRAIT_FN[id](cx2);
  const [sc,sx]=mkCanvas(W*S,H*S);sx.drawImage(cc,0,0);sx.globalCompositeOperation='source-in';sx.fillStyle='#1b120c';sx.fillRect(0,0,W*S,H*S);
  x.setTransform(1,0,0,1,0,0);
  for(let k=0;k<16;k++){const a=k/16*Math.PI*2;x.drawImage(sc,Math.cos(a)*7,Math.sin(a)*7);}
  if(locked){x.drawImage(sc,0,0);}else x.drawImage(cc,0,0);
  x.setTransform(S,0,0,S,0,0);
  if(locked){x.fillStyle='#efe2c4';x.font='64px Limelight, Georgia, serif';x.textAlign='center';x.fillText('?',120,150);}
  // paper wear
  const r=rngSeed(id.length*31);x.strokeStyle='rgba(255,250,235,.35)';x.lineWidth=.6;for(let i=0;i<40;i++){x.beginPath();const px=r()*W,py=r()*H;x.moveTo(px,py);x.lineTo(px+(r()-.5)*30,py+(r()-.5)*8);x.stroke();}
  x.strokeStyle='#1b120c';x.lineWidth=5;x.strokeRect(2.5,2.5,W-5,H-5);
  return PORTRAIT_CACHE[key]=c.toDataURL('image/jpeg',.9);
}
// ---------- backdrop ----------
function drawSky(){
  const c=$('#sky'),dpr=window.devicePixelRatio||1,w=window.innerWidth,h=window.innerHeight;
  c.width=w*dpr;c.height=h*dpr;const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);
  const g=x.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#0c0910');g.addColorStop(.5,'#22121b');g.addColorStop(.78,'#5e2a20');g.addColorStop(.86,'#1b110e');g.addColorStop(1,'#120c0a');
  x.fillStyle=g;x.fillRect(0,0,w,h);
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<220;i++){const sx=rnd()*w,sy=rnd()*h*.62,r=rnd()*1.2+.2;x.globalAlpha=.25+rnd()*.7;x.fillStyle='#fff6e6';x.fillRect(sx,sy,r,r);}
  x.globalAlpha=1;
  const hy=h*.8, cx=w*.7;
  const glow=x.createRadialGradient(cx,hy,0,cx,hy,w*.45);
  glow.addColorStop(0,'rgba(255,150,70,.55)');glow.addColorStop(.4,'rgba(255,110,50,.15)');glow.addColorStop(1,'rgba(255,110,50,0)');
  x.fillStyle=glow;x.fillRect(0,0,w,h);
  // distant skyline
  x.fillStyle='#160d0c';
  for(let bx=cx-w*.12;bx<cx+w*.12;bx+=6+rnd()*8){const bh=6+rnd()*rnd()*46;x.fillRect(bx,hy-bh,5+rnd()*6,bh);}
  x.fillRect(cx-1.5,hy-h*.11,3,h*.11);x.beginPath();x.ellipse(cx,hy-h*.11,9,4,0,0,Math.PI*2);x.fill();
  x.fillStyle='#ffb46a';
  for(let i=0;i<60;i++){const wx=cx-w*.11+rnd()*w*.22,wy=hy-rnd()*30;if(rnd()<.5)x.fillRect(wx,wy,1.2,1.2);}
  // mesas
  x.fillStyle='#0f0a09';x.beginPath();x.moveTo(0,h);x.lineTo(0,hy-h*.05);
  let px=0;const plates=[[.08,-.09],[.18,-.09],[.22,-.02],[.34,-.02],[.38,-.06],[.48,-.06],[.52,0],[.86,0],[.9,-.04],[1,-.04]];
  for(const [fx,fy] of plates){px=fx*w;x.lineTo(px,hy+fy*h);}
  x.lineTo(w,h);x.closePath();x.fill();
}
window.addEventListener('resize',()=>{if(screen!=='match')drawSky();});


