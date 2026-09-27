import {sceneById,sampleById} from './content.js';
import {drawPhoto} from './camera.js';
import {drawSolarPhoto,rendererReady} from './solar-renderer.js';
import {eraConfig,bodyById} from './solar-system.js';
const FONT='"Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif';
const cache=new Map();
export function loadImage(src) {
  if(!cache.has(src)) cache.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{cache.delete(src);reject(new Error('画像を読み込めませんでした。通信を確認して、もう一度お試しください。'));};img.src=src;}));
  return cache.get(src);
}
function wrap(ctx,text,x,y,maxWidth,lineHeight){let line='';for(const char of text){if(ctx.measureText(line+char).width>maxWidth&&line){ctx.fillText(line,x,y);line=char;y+=lineHeight;}else line+=char;}if(line)ctx.fillText(line,x,y);return y+lineHeight;}
function contain(ctx,img,x,y,w,h){const scale=Math.min(w/img.width,h/img.height);ctx.drawImage(img,x+(w-img.width*scale)/2,y+(h-img.height*scale)/2,img.width*scale,img.height*scale);}
function box(ctx,x,y,w,h,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,9);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.65;ctx.stroke();}}
function label(ctx,s,x,y,size=12,bold=false,color='#173443'){ctx.font=`${bold?700:400} ${size}px ${FONT}`;ctx.fillStyle=color;ctx.fillText(s,x,y);}
function writingBox(ctx,y,h,n,title,hint,lines=true){box(ctx,514,y,292,h,'#fff','#acbcc4');label(ctx,`${n}  ${title}`,527,y+24,14,true);label(ctx,hint,527,y+43,9,false,'#536975');if(lines){ctx.strokeStyle='#c5d0d5';ctx.lineWidth=.5;for(let line=y+78;line<y+h-10;line+=30){ctx.beginPath();ctx.moveTo(528,line);ctx.lineTo(792,line);ctx.stroke();}}}
export async function renderSlide(item,title,index=1,total=1,scale=2.4){
  await document.fonts.ready;
  if(item.record.solar||item.record.photos?.some(p=>p.solar))await rendererReady;
  const canvas=document.createElement('canvas');canvas.width=Math.round(842*scale);canvas.height=Math.round(595*scale);const ctx=canvas.getContext('2d');ctx.scale(scale,scale);ctx.fillStyle='#fff';ctx.fillRect(0,0,842,595);
  label(ctx,'時空調査船  /  わたしの宇宙調査',36,35,10,true,'#187b84');label(ctx,`${index} / ${total}`,759,35,10);
  let titleSize=25;while(titleSize>14){ctx.font=`700 ${titleSize}px ${FONT}`;if(ctx.measureText(title).width<=485)break;titleSize--;}
  label(ctx,title,36,75,titleSize,true);label(ctx,'組　　 番　 名前',555,66,11);ctx.strokeStyle='#aebfc6';ctx.beginPath();ctx.moveTo(667,73);ctx.lineTo(806,73);ctx.stroke();ctx.strokeStyle='#187b84';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(36,95);ctx.lineTo(806,95);ctx.stroke();
  const scene=sceneById(item.scene);
  if(item.kind==='compare'){
    label(ctx,'時代をならべて、見比べよう',36,124,13,true);
    const [a,b]=item.record.scenes.map(sceneById);
    for(const [i,s] of [a,b].entries()) {const photo=item.record.photos?.[i];box(ctx,36+i*230,141,218,151,'#09131d');if(photo?.solar)drawSolarPhoto(ctx,photo.solar,36+i*230,141,218,151);else{const img=await loadImage(s.image);drawPhoto(ctx,img,photo?.camera,36+i*230,141,218,151);}label(ctx,s.name,36+i*230,313,11,true);label(ctx,s.era,36+i*230,332,10);}
    if(item.record.id==='sun-history'){
      label(ctx,'大きさの比較（模式図・直径の目安）',36,367,11,true);
      ctx.fillStyle='#ffdc78';ctx.beginPath();ctx.arc(73,407,.53,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#91a8b3';ctx.beginPath();ctx.moveTo(74,408);ctx.lineTo(93,426);ctx.stroke();label(ctx,'現在 = 1',38,445,10);
      ctx.fillStyle='#e8986e';ctx.beginPath();ctx.arc(293,407,53,0,Math.PI*2);ctx.fill();label(ctx,'赤色巨星：数十〜数百倍',214,475,10);
      label(ctx,'図は約100倍の例。写真2枚の縮尺は異なります。',36,498,9,false,'#536975');
    }else{box(ctx,36,355,448,126,'#eff6f7');label(ctx,'比べるヒント',50,379,11,true,'#187b84');ctx.font=`12px ${FONT}`;ctx.fillStyle='#173443';wrap(ctx,'色・雲・海の有無に注目しよう。風景は科学に基づく再現です。',50,404,414,23);}
    writingBox(ctx,118,129,1,'見つけたこと','例：左の写真には＿＿が見える。');writingBox(ctx,260,129,2,'前と後を比べよう','例：前は＿＿、後は＿＿に変わった。');writingBox(ctx,402,114,3,'授業とのつながり','例：授業で習った＿＿とつながる。');
  }else{
    const sample=item.kind==='sample'?sampleById(item.record.id):null;
    label(ctx,sample?'選んだサンプル・観測記録':'選んだ写真',36,124,13,true);
    box(ctx,36,140,448,253,sample?.kind==='material'?'#f0f4f6':'#09131d');
    if(item.record.solar)drawSolarPhoto(ctx,item.record.solar,48,149,424,226);else{const img=await loadImage(sample?.image||scene.image);if(sample)contain(ctx,img,48,149,424,226);else drawPhoto(ctx,img,item.record.camera,48,149,424,226);}
    label(ctx,sample?'ゲーム内の模擬サンプル・観測データ':item.record.solar?'ゲーム内で撮影した3D宇宙（配置・過去未来は学習モデル）':'ゲーム内で撮影した科学的再現の風景',36,412,9,false,'#536975');
    box(ctx,36,432,448,82,'#eff6f7');label(ctx,'調査の記録',50,453,11,true,'#187b84');label(ctx,`時代：${item.record.solar?eraConfig(item.record.solar.era).label:scene.era}`,50,474,11);label(ctx,sample?`方法：${sample.method}`:`場所：${item.record.solar?(bodyById(item.record.solar.subject,item.record.solar)?.name||"宇宙の全天"):scene.location}`,50,495,11);
    if(sample){writingBox(ctx,118,129,1,'見つけたこと','例：色は＿＿、形は＿＿。絵でもよい。',false);writingBox(ctx,260,129,2,'比べる・順序を考える','例：＿＿と比べると、＿＿がちがう。');writingBox(ctx,402,114,3,'授業とのつながり','例：授業で習った＿＿とつながる。');}
    else{writingBox(ctx,118,129,1,'見つけたこと','例：写真には＿＿が見える。');writingBox(ctx,260,129,2,'ほかの時代・天体と比べる','例：＿＿と比べると、＿＿がちがう。');writingBox(ctx,402,114,3,'授業とのつながり','例：授業で習った＿＿とつながる。');}
  }
  ctx.strokeStyle='#bac8ce';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(36,542);ctx.lineTo(806,542);ctx.stroke();label(ctx,'白い欄に、自分の言葉や絵で書き込もう。',36,563,9,false,'#536975');
  if(item.record.solar||item.record.photos?.some(p=>p.solar)){
    label(ctx,'画像：Solar System Scope（縮小・合成・CG加工）solarsystemscope.com/textures',36,577,6.5,false,'#536975');
    label(ctx,'CC BY 4.0 — creativecommons.org/licenses/by/4.0/',36,586,6.5,false,'#536975');
  }
  return canvas;
}
// Minimal PDF encoder: each page embeds one high-resolution JPEG. All Japanese text
// is painted by the browser's Japanese font before export; no network font is needed.
export function encodePdf(pages){
  if(!pages.length)throw new Error('発表に使う記録を1つ以上選んでください。');
  const encoder=new TextEncoder(), chunks=[], offsets=[0];let length=0;
  const bytes=value=>typeof value==='string'?encoder.encode(value):value;
  const append=value=>{const b=bytes(value);chunks.push(b);length+=b.length;};
  const object=(n,parts)=>{offsets[n]=length;append(`${n} 0 obj\n`);for(const p of parts)append(p);append('\nendobj\n');};
  append('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  object(1,['<< /Type /Catalog /Pages 2 0 R >>']);
  object(2,[`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`]);
  for(let i=0;i<pages.length;i++){
    const p=pages[i],n=3+i*3;
    object(n,[`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Im0 ${n+1} 0 R >> >> /Contents ${n+2} 0 R >>`]);
    object(n+1,[`<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.data.length} >>\nstream\n`,p.data,'\nendstream']);
    const stream='q\n842 0 0 595 0 0 cm\n/Im0 Do\nQ\n';
    object(n+2,[`<< /Length ${bytes(stream).length} >>\nstream\n${stream}endstream`]);
  }
  const xref=length;append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);for(let i=1;i<offsets.length;i++)append(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks,{type:'application/pdf'});
}
export async function createPdf(items,titles,onProgress=()=>{}) {
  const pages=[];
  for(let i=0;i<items.length;i++){
    onProgress(i+1,items.length);
    const c=await renderSlide(items[i],titles[items[i].key]||items[i].name,i+1,items.length,3);
    const jpeg=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('PDF画像を作成できませんでした。')),'image/jpeg',.92));
    pages.push({data:new Uint8Array(await jpeg.arrayBuffer()),width:c.width,height:c.height});
  }
  return encodePdf(pages);
}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
