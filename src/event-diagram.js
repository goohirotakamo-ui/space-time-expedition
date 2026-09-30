// A teaching inset, separate from the all-sky view. Particle sizes, spacing and
// the bound-electron cloud are symbolic, never objects at astronomical scale.
const electron=(x,y)=>`<circle cx="${x}" cy="${y}" r="7" fill="#69c7ff"/><text x="${x}" y="${y+4}" text-anchor="middle" fill="#102434" font-size="12">−</text>`;
const nucleon=(x,y,proton)=>`<circle cx="${x}" cy="${y}" r="10" fill="${proton?'#ff8b86':'#adb8cb'}" stroke="#102434" stroke-width="1"/>${proton?`<text x="${x}" y="${y+4}" text-anchor="middle" fill="#102434" font-size="13">+</text>`:''}`;
const nucleus=(x,y)=>`<g>${nucleon(x-7,y-6,true)}${nucleon(x+7,y-6,false)}${nucleon(x-7,y+7,false)}${nucleon(x+7,y+7,true)}</g>`;
const label=(x,y,text)=>`<text x="${x}" y="${y}" fill="#e4f4ff" text-anchor="middle" font-size="15">${text}</text>`;
const arrow=(x,y,width=66)=>`<path d="M${x},${y}h${width}m-10,-7 10,7 -10,7" fill="none" stroke="#bed6e5" stroke-width="2"/>`;
const light=path=>`<path d="${path}" fill="none" stroke="#ffdc78" stroke-width="4" stroke-linecap="round"/>`;

export function earlyUniverseDiagram(stageIndex){
  const stage=Math.max(0,Math.min(3,Number.isInteger(stageIndex)?stageIndex:0));
  let drawing,description;
  if(stage===0){
    description='高温の粒子がばらばらに動いている模型。まだ原子はありません。';
    const particles=Array.from({length:28},(_,i)=>{const x=56+(i%7)*74,y=37+Math.floor(i/7)*27,r=3+(i%3);return `<circle cx="${x}" cy="${y}" r="${r}" fill="${['#ffc99e','#ef9cad','#c9aaff'][i%3]}"/><path d="M${x-14},${y+2}h7" stroke="#a78492" stroke-width="1.5"/>`;}).join('');
    drawing=particles+label(280,151,'とても熱い宇宙 · まだ原子はない');
  }else if(stage===1){
    description='陽子と中性子が結びつき、ヘリウムなどの原子核ができる模型。電子はまだ離れています。';
    drawing=nucleon(76,55,true)+nucleon(128,49,false)+nucleon(90,105,false)+nucleon(140,101,true)+arrow(187,78)+nucleus(303,76)+electron(400,42)+electron(443,109)+label(108,148,'陽子・中性子')+label(304,124,'原子核')+label(444,148,'電子はまだ離れる');
  }else if(stage===2){
    description='原子核と自由な電子が離れており、電子で光の進む向きが変わる模型。';
    drawing=nucleus(135,75)+electron(306,58)+electron(398,110)+light('M219,28 L306,58 L398,110 L486,50')+`<path d="M476,52 486,50 482,60" fill="none" stroke="#ffdc78" stroke-width="3"/>`+label(134,132,'原子核')+label(308,36,'電子')+label(384,153,'光が散らされる');
  }else{
    // Hydrogen recombination explains last scattering at about 380,000 years.
    // Helium recombines earlier; the preceding nucleosynthesis inset uses He-4.
    description='約38万年後、陽子1個と電子1個が結びついて水素原子ができ、光が遠くへ進みやすくなる模型。';
    drawing=`<ellipse cx="139" cy="80" rx="57" ry="49" fill="#69c7ff" fill-opacity=".12" stroke="#69c7ff" stroke-opacity=".35"/>`+nucleon(139,80,true)+electron(105,58)+label(139,152,'陽子＋電子 → 水素原子')+light('M245,80 H504')+`<path d="M492,72 504,80 492,88" fill="none" stroke="#ffdc78" stroke-width="3"/>`+label(378,127,'光が遠くへ進める');
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 174" role="img" aria-label="${description}"><title>${description}</title><rect x="1" y="1" width="558" height="172" rx="12" fill="#102434" stroke="#355267"/><g font-family="system-ui, sans-serif">${drawing}</g></svg>`;
}
