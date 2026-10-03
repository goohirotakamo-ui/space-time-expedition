// A magnified teaching diagram, not a view of individually visible particles.
// Positions, sizes, colours and animation time have no physical scale.
export const PARTICLE_STAGES=Object.freeze([
  {progress:.10,tab:'① 高温の宇宙',age:'誕生から約1秒ごろ',title:'まだ原子ではない。粒子がばらばらに動く。',caption:'宇宙が膨張して冷える途中です。陽子・中性子・電子が動き、もっと前の状態は省略しています。'},
  {progress:.35,tab:'② 原子核ができる',age:'誕生から数分ごろ',title:'陽子と中性子が結びつき、ヘリウムの原子核へ。',caption:'電子はまだ自由に動いています。水素の原子核は陽子1個です。'},
  {progress:.60,tab:'③ 光が散らされる',age:'原子核ができた後〜晴れ上がりの前',title:'光は自由な電子に散らされ、遠くへ進みにくい。',caption:'黄色の光の進み方を追ってみよう。電子のところで向きが変わります。'},
  {progress:1,tab:'④ 晴れ上がり',age:'誕生から約38万年後',title:'原子ができ、光が遠くへ進めるようになる。',caption:'電子が原子核に結びつくと、自由な電子が減ります。まだ星も太陽系もありません。'}
].map(Object.freeze));
export function particleStage(world={}){const p=Number.isFinite(world.eventProgress)?world.eventProgress:1;return p<.22?0:p<.5?1:p<.78?2:3;}
export const isParticleView=world=>world?.era==='early-universe'&&[1,2].includes(world.particleModelVersion);
const clamp=v=>Math.max(0,Math.min(1,v));
const mix=(a,b,t)=>a+(b-a)*t;
const anchors=[[190,175],[460,255],[710,160],[810,310],[300,325],[600,340]];
export function particleFrame(world={}){
  if(world.particleModelVersion===2)return particleMotionFrame(world);
  const stage=particleStage(world),t=Number.isFinite(world.particleSeconds)?Math.max(0,world.particleSeconds):0;
  const nuclei=anchors.map(([x,y],i)=>({x:x+5*Math.sin(t*.6+i),y:y+4*Math.cos(t*.7+i),helium:i<2}));
  const electrons=Array.from({length:8},(_,i)=>({x:105+(i*113)%790+16*Math.sin(t*1.5+i),y:135+(i*61)%205+20*Math.cos(t*1.7+i)}));
  const combination=stage===1?clamp(t/5):stage>1?1:0;
  const capture=stage===3?clamp(t/4):0;
  const paths=Array.from({length:3},(_,i)=>stage===3&&capture>.95?[[55,130+i*95],[945,130+i*95]]:[[55,130+i*95],...Array.from({length:4},(_,j)=>{const e=electrons[(i+j*2)%8];return [e.x,e.y];}),[945,140+i*90]]);
  return {stage,t,nuclei,electrons,combination,capture,paths,protons:8,neutrons:4,electronCount:8,freeElectrons:stage===3?8*(1-capture):8};
}
function pointAlong(points,fraction){
  const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
  let distance=fraction*lengths.reduce((a,b)=>a+b,0),i=0;
  while(i<lengths.length-1&&distance>lengths[i])distance-=lengths[i++];
  const a=points[i],b=points[i+1],f=distance/lengths[i];return {x:mix(a[0],b[0],f),y:mix(a[1],b[1],f),angle:Math.atan2(b[1]-a[1],b[0]-a[0])};
}
export function drawParticleUniverse(ctx,world,x,y,width,height){
  if(world.particleModelVersion===2){drawParticleMotion(ctx,world,x,y,width,height);return;}
  const f=particleFrame(world),info=PARTICLE_STAGES[f.stage],scale=Math.min(width/1000,height/480);
  ctx.save();ctx.fillStyle='#06111f';ctx.fillRect(x,y,width,height);ctx.translate(x+(width-1000*scale)/2,y+(height-480*scale)/2);ctx.scale(scale,scale);
  const text=(s,px,py,size=20,color='#d7e8f4')=>{ctx.fillStyle=color;ctx.font=`${size}px sans-serif`;ctx.fillText(s,px,py);};
  text(info.age,45,33,24,'#86dcdd');text(info.title,45,70,28);
  const dot=(px,py,r,color,label='')=>{ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();if(label){ctx.textAlign='center';ctx.textBaseline='middle';text(label,px,py,13,'#071521');ctx.textAlign='left';ctx.textBaseline='alphabetic';}};
  // A small representative patch; the frame edge is not the edge of the universe.
  ctx.strokeStyle='#18354b';ctx.lineWidth=1;ctx.strokeRect(35,90,930,297);
  for(const [i,n] of f.nuclei.entries()){
    if(f.stage===3&&f.capture>0){const glow=ctx.createRadialGradient(n.x,n.y,5,n.x,n.y,n.helium?42:33);glow.addColorStop(0,'#48afff08');glow.addColorStop(.65,`rgba(78,168,255,${.18*f.capture})`);glow.addColorStop(1,'#48afff00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(n.x,n.y,n.helium?42:33,0,Math.PI*2);ctx.fill();}
    const group=n.helium?[['p',-8,-8],['n',8,-8],['n',-8,8],['p',8,8]]:[['p',0,0]];
    for(const [j,[kind,dx,dy]] of group.entries()){
      const spread=f.stage===0?58:55*(1-f.combination),phase=f.t*(f.stage===0?1.4:.25)+i+j*2;
      const px=n.x+dx+spread*Math.cos(phase),py=n.y+dy+spread*Math.sin(phase);
      dot(px,py,10,kind==='p'?'#fa997d':'#bbc5d0',kind==='p'?'+':'n');
    }
    if(f.stage>0&&f.combination>.98){text(f.capture>.95?(n.helium?'He 原子':'H 原子'):(n.helium?'He 原子核':'H 原子核'),n.x-42,n.y+55,21,'#b9cfdf');}
  }
  f.electrons.forEach((e,i)=>{const n=f.nuclei[i<4?Math.floor(i/2):i-2],angle=i*2.4,r=n.helium?29:24;
    // Bound electrons are a symbolic cloud/dot, not little planets on an orbit.
    const px=mix(e.x,n.x+Math.cos(angle)*r,f.capture),py=mix(e.y,n.y+Math.sin(angle)*r,f.capture);
    dot(px,py,7,'#73c9ff','−');
  });
  for(const [i,path] of f.paths.entries()){
    ctx.strokeStyle=f.stage===3?'#ffda6366':'#ffda6345';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.beginPath();path.forEach(([px,py],j)=>j?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.stroke();ctx.setLineDash([]);
    const head=pointAlong(path,(f.t*.14+i*.31)%1);ctx.save();ctx.translate(head.x,head.y);ctx.rotate(head.angle);ctx.shadowColor='#ffe18b';ctx.shadowBlur=12;ctx.fillStyle='#ffe18b';ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(-7,-5);ctx.lineTo(-3,0);ctx.lineTo(-7,5);ctx.closePath();ctx.fill();ctx.restore();
  }
  const legends=[['#fa997d','＋ 陽子',60],['#bbc5d0','n 中性子',235],['#73c9ff','− 電子',420],['#ffe18b','→ 光（光子）',585]];
  legends.forEach(([c,s,px])=>{dot(px,413,6,c);text(s,px+14,419,23);});
  text('拡大した説明模型 · 色・大きさ・個数の割合・速さは実際と異なります',45,452,21,'#9ab5c9');
  text('枠は宇宙の一部',794,419,20,'#9ab5c9');ctx.restore();
}

// Version 2 is a text-free moving scene. Keep version 1 above for existing
// photographs; an old recorded animation phase must not become a different image.
const motionAnchors=[[240,155],[700,315],[430,345],[520,110],[835,125],[150,365]];
const smooth=value=>{const p=clamp(value);return p*p*(3-2*p);};
export function particleMotionFrame(world={}){
  const stage=particleStage(world),t=Number.isFinite(world.particleSeconds)?Math.max(0,world.particleSeconds):0;
  const combination=stage===1?smooth((t-1)/6):stage>1?1:0;
  const capture=stage===3?smooth((t-.5)/6):0;
  const nuclei=motionAnchors.map(([x,y],i)=>({x:x+13*Math.sin(t*.28+i),y:y+12*Math.cos(t*.24+i),helium:i<2}));
  const electrons=Array.from({length:8},(_,i)=>{
    const n=nuclei[i<4?Math.floor(i/2):i-2],angle=i*2.4;
    const x=115+(i*107)%760+75*Math.sin(t*1.18+i*2.1),y=115+(i*53)%265+72*Math.cos(t*.94+i*1.7);
    return {x:mix(x,n.x+22*Math.cos(angle),capture),y:mix(y,n.y+22*Math.sin(angle),capture),freeX:x,freeY:y,boundX:n.x,boundY:n.y,opacity:1-smooth((capture-.65)/.35)};
  });
  const ends=[[[-80,90],[1080,180]],[[1080,255],[-80,320]],[[180,-80],[420,580]],[[1080,470],[-80,40]],[[-80,430],[1080,430]],[[780,580],[650,-80]]];
  const paths=ends.map(([a,b],i)=>capture>.85+(i%3)*.05?[a,b]:[a,...Array.from({length:4},(_,j)=>{const e=electrons[(i+j*2)%8];return [e.x,e.y];}),b]);
  const nucleons=nuclei.flatMap((n,i)=>(n.helium?[['p',-11,-9],['n',11,-9],['n',-11,9],['p',11,9]]:[['p',0,0]]).map(([kind,dx,dy],j)=>{
    const phase=t*(stage===0?.8:.16)+i+j*2.15,spread=n.helium?95*(1-combination):stage===0?30:0;
    return {kind,x:n.x+dx+spread*Math.cos(phase),y:n.y+dy+spread*Math.sin(phase),depth:.8+(i%3)*.12};
  }));
  return {stage,t,nuclei,electrons,nucleons,combination,capture,paths,protons:8,neutrons:4,electronCount:8,freeElectrons:8*(1-capture)};
}

function pathLength(points){return points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);}
function drawParticleMotion(ctx,world,x,y,width,height){
  const f=particleMotionFrame(world),sx=width/1000,sy=height/480,s=Math.min(sx,sy),px=v=>x+v*sx,py=v=>y+v*sy;
  ctx.save();ctx.beginPath();ctx.rect(x,y,width,height);ctx.clip();
  const heat=f.stage===0?1:f.stage===1?.66:f.stage===2?.36:.36*(1-f.capture);
  ctx.fillStyle=`rgb(${Math.round(6+heat*27)},${Math.round(13+heat*15)},${Math.round(27+heat*12)})`;ctx.fillRect(x,y,width,height);
  // Soft plasma illumination has no central explosion, no stars and no frame.
  // All visible glow is an explanatory colour/exposure choice, not a photograph.
  for(let i=0;i<6;i++){
    const gx=x+width*((i+.5)/6),gy=y+height*(.4+.2*Math.sin(i*2+f.t*.09)),r=Math.max(width*.24,height*.65);
    const g=ctx.createRadialGradient(gx,gy,0,gx,gy,r);g.addColorStop(0,`rgba(${heat>.5?'240,145,95':'85,153,198'},${.06+heat*.07})`);g.addColorStop(1,'rgba(22,40,61,0)');ctx.fillStyle=g;ctx.fillRect(x,y,width,height);
  }
  const sphere=(cx,cy,r,color,alpha=1)=>{
    if(alpha<=0)return;ctx.save();ctx.globalAlpha=alpha;
    const halo=ctx.createRadialGradient(cx,cy,r*.6,cx,cy,r*3.1);halo.addColorStop(0,color+'80');halo.addColorStop(1,color+'00');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,r*3.1,0,Math.PI*2);ctx.fill();
    const skin=ctx.createRadialGradient(cx-r*.35,cy-r*.4,r*.08,cx,cy,r);skin.addColorStop(0,'#f4fcff');skin.addColorStop(.3,color);skin.addColorStop(1,'#14263b');ctx.fillStyle=skin;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.restore();
  };
  // Incoming electrons decelerate into a diffuse probability cloud. There are
  // deliberately no orbital tracks and no bound electrons circling a nucleus.
  if(f.capture>0)for(const n of f.nuclei){
    const cx=px(n.x),cy=py(n.y),r=(n.helium?66:49)*s;
    const cloud=ctx.createRadialGradient(cx,cy,5*s,cx,cy,r);cloud.addColorStop(0,`rgba(81,161,255,${f.capture*.06})`);cloud.addColorStop(.48,`rgba(94,180,255,${f.capture*.26})`);cloud.addColorStop(1,'rgba(65,139,252,0)');ctx.fillStyle=cloud;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    for(let k=0;k<14;k++){const a=k*2.399,rho=Math.sqrt((k+.5)/14)*r*.83;ctx.fillStyle=`rgba(123,196,255,${f.capture*(.07+.04*Math.sin(f.t*.6+k))})`;ctx.beginPath();ctx.arc(cx+Math.cos(a)*rho,cy+Math.sin(a)*rho,2.5*s,0,Math.PI*2);ctx.fill();}
  }
  for(const n of f.nucleons)sphere(px(n.x),py(n.y),15*s*n.depth,n.kind==='p'?'#f59b79':'#b9d0d9');
  // Short fading trails make the free motion visible without a labelled diagram.
  const previous=particleMotionFrame({...world,particleSeconds:Math.max(0,f.t-.18)});
  f.electrons.forEach((e,i)=>{
    const p=previous.electrons[i];ctx.save();ctx.globalAlpha=e.opacity*.55;ctx.strokeStyle='#79cbff';ctx.lineWidth=3*s;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(px(p.x),py(p.y));ctx.lineTo(px(e.x),py(e.y));ctx.stroke();ctx.restore();
    sphere(px(e.x),py(e.y),8*s,'#75c9ff',e.opacity);
  });
  if(world.lightStyle==='wave')drawLightWaves(ctx,f,px,py,s);
  else if(world.lightStyle==='beam')drawLightBeams(ctx,f,px,py,s);
  else {
  // Legacy photographs keep their original point-and-trail light rendering.
  // Every wave packet travels at the same schematic speed. Scattering changes
  // its direction, not its speed; photon trails are not permanent guide lines.
  f.paths.forEach((path,i)=>{
    const length=pathLength(path);
    for(let packet=0;packet<3;packet++){
      const distance=(f.t*155+i*137+packet*length/3)%length,head=pointAlong(path,distance/length);
      ctx.save();ctx.lineCap='round';
      for(let tail=9;tail>=1;tail--){
        const d=Math.max(0,distance-tail*5),p=pointAlong(path,d/length),q=pointAlong(path,Math.max(0,d+4)/length);
        const a=Math.sin(d*.45+f.t*4)*2*s,ox=-Math.sin(p.angle)*a,oy=Math.cos(p.angle)*a;
        ctx.strokeStyle=`rgba(255,219,119,${(1-tail/11)*.76})`;ctx.lineWidth=(2.8-tail*.15)*s;ctx.beginPath();ctx.moveTo(px(p.x)+ox,py(p.y)+oy);ctx.lineTo(px(q.x)+ox,py(q.y)+oy);ctx.stroke();
      }
      const hx=px(head.x),hy=py(head.y),glow=ctx.createRadialGradient(hx,hy,0,hx,hy,15*s);glow.addColorStop(0,'#fffce7');glow.addColorStop(.15,'#ffe6a8');glow.addColorStop(.4,'#ffcd6144');glow.addColorStop(1,'#ffcd6100');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(hx,hy,15*s,0,Math.PI*2);ctx.fill();
      for(const e of f.electrons){const near=Math.hypot(head.x-e.x,head.y-e.y);if(path.length>2&&near<24){ctx.strokeStyle=`rgba(198,231,255,${(1-near/24)*.8})`;ctx.lineWidth=1.5*s;ctx.beginPath();ctx.arc(px(e.x),py(e.y),(12+near*.8)*s,0,Math.PI*2);ctx.stroke();}}
      ctx.restore();
    }
  });
  }
  ctx.restore();
}

// Keep the original short travelling waves, without photon dots or impact rings.
function drawLightWaves(ctx,frame,px,py,scale){
  ctx.save();ctx.lineCap='butt';ctx.lineJoin='round';
  frame.paths.forEach((path,index)=>{
    const length=pathLength(path);
    for(let packet=0;packet<3;packet++){
      const head=(frame.t*155+index*137+packet*length/3)%length;
      const start=Math.max(0,head-45),steps=Math.ceil((head-start)/1.5);
      if(steps<2)continue;
      ctx.beginPath();
      for(let step=0;step<=steps;step++){
        const fraction=step/steps,distance=mix(start,head,fraction),p=pointAlong(path,distance/length);
        const amplitude=Math.sin(distance*.45+frame.t*4)*3*scale*Math.sin(Math.PI*fraction);
        const x=px(p.x)-Math.sin(p.angle)*amplitude,y=py(p.y)+Math.cos(p.angle)*amplitude;
        if(step)ctx.lineTo(x,y);else ctx.moveTo(x,y);
      }
      ctx.strokeStyle='rgba(255,219,119,.14)';ctx.lineWidth=5*scale;ctx.stroke();
      ctx.strokeStyle='rgba(255,225,145,.88)';ctx.lineWidth=1.6*scale;ctx.stroke();
    }
  });
  ctx.restore();
}

// Continuous thin light, with a broad moving brightness pattern to make its
// direction visible. No luminous ball at the front, no arrowheads or text.
// The existing electron vertices and recombination clock are unchanged.
function drawLightBeams(ctx,frame,px,py,scale){
  ctx.save();ctx.lineCap='butt';ctx.lineJoin='round';
  frame.paths.forEach((path,index)=>{
    const trace=()=>{ctx.beginPath();path.forEach(([x,y],i)=>i?ctx.lineTo(px(x),py(y)):ctx.moveTo(px(x),py(y)));};
    // A faint continuous glow and a fine core both follow every scattering bend.
    trace();ctx.strokeStyle='rgba(255,211,102,.10)';ctx.lineWidth=7*scale;ctx.stroke();
    trace();ctx.strokeStyle='rgba(255,215,120,.36)';ctx.lineWidth=2.1*scale;ctx.stroke();
    let travelled=0;
    for(let segment=1;segment<path.length;segment++){
      const a=path[segment-1],b=path[segment],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<.0001)continue;
      const gradient=ctx.createLinearGradient(px(a[0]),py(a[1]),px(b[0]),py(b[1]));
      // The broad crests move at the former propagation rate. Brightness is
      // illustrative, not a plotted electromagnetic frequency or a photon size.
      const stops=Math.max(2,Math.ceil(length/28));
      for(let stop=0;stop<=stops;stop++){
        const fraction=stop/stops,phase=(travelled+fraction*length-frame.t*155-index*137)*Math.PI*2/440;
        const brightness=.32+.58*(.5+.5*Math.cos(phase));
        gradient.addColorStop(fraction,`rgba(255,243,193,${brightness})`);
      }
      ctx.strokeStyle=gradient;ctx.lineWidth=1.1*scale;ctx.beginPath();ctx.moveTo(px(a[0]),py(a[1]));ctx.lineTo(px(b[0]),py(b[1]));ctx.stroke();travelled+=length;
    }
  });
  ctx.restore();
}
