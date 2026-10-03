// A playful fictional visitor, rendered on its own transparent layer. Planet
// materials and the scientific scene are never modified by this encounter.
import {basis,getBodies,sub,dot,length,unit} from './solar-system.js';
import {ufoPosition,UFO_DEPARTURE_SECONDS} from './ufo-encounter.js';

const HALF_FOV=.532;
const clamp=value=>Math.max(0,Math.min(1,value));
const ease=value=>{const t=clamp(value);return t*t*(3-2*t);};

// Match the solar renderer's camera, using actual canvas aspect rather than a
// stale saved viewport. A planet in front of the visitor occludes it.
export function projectUfo(world,encounter,width,height){
  if(!world||!encounter||!(width>0&&height>0)||!(encounter.radius>0))return null;
  if(encounter.phase==='departing'&&encounter.departureSeconds>=UFO_DEPARTURE_SECONDS)return null;
  const position=ufoPosition(encounter,world);if(!position)return null;
  const relative=sub(position,world.position),distance=length(relative);
  const view=basis(world.orientation),depth=dot(relative,view.forward);
  if(!(depth>encounter.radius*.1))return null;
  const pixelsPerUnit=height/(2*HALF_FOV*depth);
  const x=width/2+dot(relative,view.right)*pixelsPerUnit;
  const y=height/2-dot(relative,view.up)*pixelsPerUnit;
  const radius=encounter.radius*pixelsPerUnit;
  if(x+radius*1.2<0||x-radius*1.2>width||y+radius*.6<0||y-radius*1.45>height)return null;
  const ray=unit(relative);
  for(const body of getBodies(world)){
    const center=sub(body.position,world.position),along=dot(center,ray);
    if(along<=0||along-body.radius>=distance+encounter.radius)continue;
    const perpendicularSquared=Math.max(0,dot(center,center)-along*along);
    if(perpendicularSquared>=body.radius**2)continue;
    const hit=along-Math.sqrt(body.radius**2-perpendicularSquared);
    if(hit>0&&hit<distance-encounter.radius*.2)return null;
  }
  return {x,y,radius,distance,depth};
}

export function drawUfo(ctx,world,ufo,width,height,{clear=true}={}){
  ctx.save();
  // Photo compositing keeps the caller's crop/translation and existing scene.
  // The live overlay owns its canvas, so it starts with a clean identity layer.
  if(clear){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);}
  const encounter=ufo?.encounter,projection=projectUfo(world,encounter,width,height);
  if(!projection){ctx.restore();return null;}
  const phase=encounter.phase,seconds=Math.max(0,encounter.progressSeconds||0);
  const departure=Math.max(0,encounter.departureSeconds||0),departing=phase==='departing';
  const stillDeparture=departing&&encounter.departureReducedMotion===true;
  const reveal=stillDeparture?1:departing?1-ease(departure/.7):phase==='received'?1:phase==='greeting'?ease(seconds/1.5):0;
  const gift=stillDeparture?0:departing?1-ease(departure/.2):phase==='received'?1:phase==='greeting'?ease((seconds-1.35)/1.3):0;
  // The engine moves the ship away in world space. The hatch closes first and
  // the distant saucer fades gently, without a flash or a permanent marker.
  if(departing)ctx.globalAlpha*=stillDeparture?1-clamp(departure/UFO_DEPARTURE_SECONDS):1-ease((departure-(UFO_DEPARTURE_SECONDS-.85))/.85);
  ctx.translate(projection.x,projection.y);ctx.scale(projection.radius/120,projection.radius/120);
  ctx.lineJoin='round';ctx.lineCap='round';
  drawSaucerBack(ctx,reveal);
  if(reveal>0)drawVisitor(ctx,reveal,gift);
  drawDome(ctx,reveal);
  drawSaucerFront(ctx);
  ctx.restore();return projection;
}

function ellipse(ctx,x,y,rx,ry,fill,stroke,lineWidth=1){
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}
}
function gradient(ctx,x1,y1,x2,y2,stops){
  const result=ctx.createLinearGradient(x1,y1,x2,y2);
  for(const [offset,color] of stops)result.addColorStop(offset,color);
  return result;
}
function drawSaucerBack(ctx,reveal){
  const halo=ctx.createRadialGradient(0,11,10,0,11,142);
  halo.addColorStop(0,'rgba(100,238,220,.15)');halo.addColorStop(.65,'rgba(81,214,224,.07)');halo.addColorStop(1,'rgba(60,208,231,0)');
  ellipse(ctx,0,12,142,44,halo);
  ellipse(ctx,0,0,120,34,gradient(ctx,0,-31,0,28,[[0,'#dbe8e9'],[.3,'#b7d4d9'],[.6,'#718e9e'],[1,'#263e53']]),'#c2e8ec',1.8);
  ellipse(ctx,0,-7,83,20,gradient(ctx,0,-27,0,12,[[0,'#d1e1e6'],[1,'#7094a2']]),'rgba(231,248,248,.65)',1);
  ellipse(ctx,0,-10,45,13,'#122b39','#b5e3de',2);
  if(reveal>0){
    // The hatch retreats behind the visitor, rather than replacing the saucer.
    ellipse(ctx,0,-13-reveal*18,45*(1-reveal*.1),12*(1-reveal*.5),'#779fac','#caeaeb',1.2);
  }
}
function drawDome(ctx,reveal){
  if(reveal>=1)return;
  ctx.save();ctx.globalAlpha*=1-reveal;
  const glass=gradient(ctx,-27,-59,32,3,[[0,'rgba(137,249,224,.64)'],[.5,'rgba(69,177,179,.54)'],[1,'rgba(19,70,87,.7)']]);
  ctx.beginPath();ctx.moveTo(-45,-10);ctx.bezierCurveTo(-45,-76,45,-76,45,-10);ctx.ellipse(0,-10,45,12,0,0,Math.PI);ctx.fillStyle=glass;ctx.fill();ctx.strokeStyle='#a2eadc';ctx.lineWidth=1.7;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-28,-33);ctx.bezierCurveTo(-22,-49,-13,-52,-4,-53);ctx.strokeStyle='rgba(231,255,252,.8)';ctx.lineWidth=4;ctx.stroke();
  ellipse(ctx,0,-10,46,12,null,'#d7f5f0',1.4);ctx.restore();
}
function drawVisitor(ctx,reveal,gift){
  ctx.save();ctx.beginPath();ctx.rect(-110,-180,220,171);ctx.clip();
  // Move the whole head below the hatch at reveal=0, so returning inside does
  // not end with the still-visible head disappearing on the final frame.
  ctx.translate(0,125*(1-reveal));
  // Small shoulders and a teal flight suit. The face stays soft and friendly.
  ctx.beginPath();ctx.moveTo(-22,-11);ctx.quadraticCurveTo(-24,-48,-12,-53);ctx.lineTo(12,-53);ctx.quadraticCurveTo(24,-48,22,-11);ctx.closePath();
  ctx.fillStyle=gradient(ctx,-20,-40,25,-9,[[0,'#519e9d'],[.55,'#296475'],[1,'#173c58']]);ctx.fill();
  ctx.strokeStyle='#91cbc3';ctx.lineWidth=1.5;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-13,-47);ctx.lineTo(0,-35);ctx.lineTo(13,-47);ctx.strokeStyle='#b4e6d5';ctx.lineWidth=2;ctx.stroke();
  ellipse(ctx,0,-28,4,4,'#f1d279');
  // The head's broader forehead, small smile and rounded eyes avoid menace.
  ellipse(ctx,-28,-76,5,8,'#83c5a3');ellipse(ctx,28,-76,5,8,'#83c5a3');
  ctx.beginPath();ctx.moveTo(0,-51);ctx.bezierCurveTo(-19,-56,-34,-72,-30,-94);ctx.bezierCurveTo(-25,-119,25,-119,30,-94);ctx.bezierCurveTo(34,-72,19,-56,0,-51);ctx.closePath();
  ctx.fillStyle=gradient(ctx,-20,-111,25,-53,[[0,'#d1edb4'],[.45,'#a7d6a4'],[1,'#6aaa9a']]);ctx.fill();ctx.strokeStyle='#d8ebbf';ctx.lineWidth=1.2;ctx.stroke();
  for(const side of [-1,1]){
    ctx.save();ctx.translate(side*13,-84);ctx.rotate(side*-.17);
    ellipse(ctx,0,0,8,10,'#17384b');ellipse(ctx,-2,-3,2,2.5,'#d3f7e6');ctx.restore();
  }
  ctx.beginPath();ctx.moveTo(-6,-66);ctx.quadraticCurveTo(0,-61,6,-66);ctx.strokeStyle='#376967';ctx.lineWidth=1.8;ctx.stroke();
  // One arm waves from the hatch. The other extends a single star-shaped gift.
  ctx.strokeStyle='#92cfac';ctx.lineWidth=8;
  ctx.beginPath();ctx.moveTo(-17,-43);ctx.quadraticCurveTo(-33,-43,-36,-58);ctx.stroke();
  ellipse(ctx,-36,-62,5,7,'#b9dfa8');
  for(const spread of [-1,0,1]){
    ctx.beginPath();ctx.moveTo(-36+spread*2,-63);ctx.lineTo(-36+spread*4,-73+Math.abs(spread)*2);ctx.lineWidth=2.3;ctx.stroke();
  }
  const handX=22+gift*28,handY=-29-gift*15;
  ctx.beginPath();ctx.moveTo(17,-43);ctx.quadraticCurveTo(30,-27,handX,handY);ctx.lineWidth=8;ctx.stroke();
  ellipse(ctx,handX,handY,6,4,'#b9dfa8');
  if(gift>0){ctx.save();ctx.translate(handX+3,handY-15);ctx.scale(gift,gift);drawGift(ctx,17);ctx.restore();}
  ctx.restore();
}
function drawSaucerFront(ctx){
  ctx.beginPath();ctx.moveTo(-120,0);ctx.bezierCurveTo(-109,53,109,53,120,0);ctx.bezierCurveTo(83,22,-83,22,-120,0);ctx.closePath();
  ctx.fillStyle=gradient(ctx,0,1,0,41,[[0,'#b6d4dc'],[.3,'#7297a7'],[.7,'#334b65'],[1,'#183248']]);ctx.fill();
  ctx.strokeStyle='#9cbcc8';ctx.lineWidth=1.3;ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,0,120,28,0,0,Math.PI);ctx.strokeStyle='#c4f4eb';ctx.lineWidth=3;ctx.stroke();
  for(const position of [-.83,-.56,-.28,0,.28,.56,.83]){
    const x=position*112,y=16+Math.sqrt(1-position*position)*7;
    ellipse(ctx,x,y,5,2.5,'#9cf8e7','#ddfff4',.6);
  }
  ellipse(ctx,0,34,34,6,'#173749','#6699ae',1);
  ellipse(ctx,0,35,19,3,'#70d7d6');
}
function star(ctx,radius){
  ctx.beginPath();for(let i=0;i<10;i++){
    const angle=-Math.PI/2+i*Math.PI/5,r=i%2?radius*.46:radius;
    if(i)ctx.lineTo(Math.cos(angle)*r,Math.sin(angle)*r);else ctx.moveTo(Math.cos(angle)*r,Math.sin(angle)*r);
  }ctx.closePath();
}
function drawGift(ctx,radius){
  const halo=ctx.createRadialGradient(0,0,3,0,0,radius*2.5);halo.addColorStop(0,'rgba(255,220,107,.65)');halo.addColorStop(1,'rgba(255,219,99,0)');ellipse(ctx,0,0,radius*2.5,radius*2.5,halo);
  star(ctx,radius);ctx.fillStyle=gradient(ctx,0,-radius,0,radius,[[0,'#fff5b7'],[.45,'#f3cb65'],[1,'#bd812a']]);ctx.fill();ctx.strokeStyle='#fff2b2';ctx.lineWidth=1.3;ctx.stroke();
  ellipse(ctx,0,0,radius*.24,radius*.24,'#79ded2','#e4ffe8',1);
}

// No remote resources or user-provided content: safe to use as a collection
// thumbnail, a saved item illustration or an image in the secret-item dialog.
export function ufoItemArt(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><defs><linearGradient id="ufo-gold" x1="0" y1="0" x2=".5" y2="1"><stop stop-color="#fff4b1"/><stop offset=".48" stop-color="#e9bb52"/><stop offset="1" stop-color="#a66f25"/></linearGradient><radialGradient id="ufo-glow"><stop stop-color="#96ead9" stop-opacity=".28"/><stop offset="1" stop-color="#96ead9" stop-opacity="0"/></radialGradient><linearGradient id="ufo-gem" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d1fff2"/><stop offset=".45" stop-color="#73d8c9"/><stop offset="1" stop-color="#257980"/></linearGradient></defs><circle cx="160" cy="160" r="153" fill="url(#ufo-glow)"/><circle cx="160" cy="160" r="95" fill="#18394b" stroke="url(#ufo-gold)" stroke-width="8"/><circle cx="160" cy="160" r="82" fill="none" stroke="#699b9c" stroke-width="2"/><path d="M160 40 190 116 272 122 207 174 229 254 160 209 91 254 113 174 48 122 130 116Z" fill="url(#ufo-gold)" stroke="#fff0b2" stroke-width="3"/><path d="m160 60 0 91-94-23 64-12Z" fill="#fff4c5" opacity=".65"/><path d="m160 151 47 23 22 80-69-45Z" fill="#965f1e" opacity=".35"/><path d="m160 124 26 26-26 37-26-37Z" fill="url(#ufo-gem)" stroke="#d4fff0" stroke-width="3"/><path d="m160 125 0 36-25-11Z" fill="#dffff2" opacity=".5"/><g fill="#b5eada"><circle cx="100" cy="83" r="4"/><circle cx="220" cy="83" r="4"/><circle cx="79" cy="193" r="4"/><circle cx="241" cy="193" r="4"/><circle cx="160" cy="252" r="4"/></g></svg>`;}
