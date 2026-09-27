import {getBodies,sub} from './solar-system.js';

const pathCache=new Map();
// The flight retains AU scale. The map deliberately compresses solar distances,
// but keeps satellite-system distances linear and centered on the parent planet.
export function orbitMapFrame(state,width=440,height=280){
  const all=getBodies(state),target=all.find(b=>b.id===state.target);
  const local=!!(target?.parent&&target.parent!=='sun');
  const parent=all.find(b=>b.id===(local?target.parent:'sun'));
  const bodies=parent?all.filter(b=>b.id===parent.id||b.parent===parent.id):[];
  const cx=width/2,cy=height/2-7,space=Math.min(width,height)/2-33;
  const extent=Math.max(local?1e-9:40,...bodies.filter(b=>b.id!==parent?.id).map(b=>b.orbit*(1+(b.eccentricity||0))))*1.1;
  const radial=r=>local?r/extent*space:Math.log1p(r*3)/Math.log1p(extent*3)*space;
  const project=position=>{const r=Math.hypot(position[0],position[2]),scale=r?radial(r)/r:0;return [cx+position[0]*scale,cy+position[2]*scale];};
  const key=[state.era||'present',parent?.id||'none',width,height].join(':');
  let paths=pathCache.get(key);
  if(!paths){
    paths=bodies.filter(b=>b.id!==parent?.id).map(body=>{
      const points=[],a=body.orbit,e=body.eccentricity||0,phase=body.phase||0,c=Math.cos(phase),s=Math.sin(phase),inclination=body.inclination||0;
      for(let i=0;i<=96;i++){
        const E=i/96*Math.PI*2,x=a*(Math.cos(E)-e),z=-a*Math.sqrt(1-e*e)*Math.sin(E);
        points.push(project([x*c-z*Math.cos(inclination)*s,z*Math.sin(inclination),x*s+z*Math.cos(inclination)*c]));
      }
      return {id:body.id,points,eccentric:!!e};
    });
    if(pathCache.size>=30)pathCache.delete(pathCache.keys().next().value);
    pathCache.set(key,paths);
  }
  return {width,height,local,parentId:parent?.id||null,paths,
    caption:!parent?'まだ恒星・惑星はありません':local?`${parent.name}と衛星（天体の大きさは拡大）`:'太陽系を上から見る（距離・大きさを圧縮）',
    bodies:bodies.map(body=>{const [x,y]=project(sub(body.position,parent.position));return {...body,x,y,selected:body.id===state.target,central:body.id===parent.id};})};
}

export function drawOrbitMap(canvas,state){
  const ctx=canvas.getContext('2d'),frame=orbitMapFrame(state,canvas.width,canvas.height);
  ctx.fillStyle='#071320';ctx.fillRect(0,0,frame.width,frame.height);
  for(const path of frame.paths){
    ctx.strokeStyle=path.id===state.target?'#657c8b':'#294151';ctx.lineWidth=path.id===state.target?1:.6;
    ctx.beginPath();path.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  }
  for(const b of frame.bodies){
    ctx.fillStyle=b.color||'#cfbe9b';ctx.beginPath();ctx.arc(b.x,b.y,b.central?6:b.selected?4:2.5,0,Math.PI*2);ctx.fill();
    if(frame.local||b.selected||['earth','jupiter','neptune','sun'].includes(b.id)){
      ctx.font='11px sans-serif';ctx.fillStyle='#d5e5ea';const textWidth=ctx.measureText(b.name).width;
      ctx.fillText(b.name,Math.min(frame.width-textWidth-5,b.x+7),Math.max(13,b.y+3));
    }
  }
  ctx.fillStyle='#93b2c5';ctx.font='11px sans-serif';ctx.fillText(frame.caption,12,frame.height-10);
}
