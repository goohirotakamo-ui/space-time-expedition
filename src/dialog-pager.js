// Paginate explanatory DOM without replacing it with truncated text. Nodes with
// state (inputs, buttons, canvases, ruby) are moved, rather than copied.
const mounted=new WeakMap();
const CONTAINERS=new Set(['DIV','SECTION','ARTICLE','ASIDE','NAV','UL','OL','FIGURE','DETAILS','BLOCKQUOTE','P','LI']);
const INLINE=new Set(['A','ABBR','B','BR','CODE','EM','I','MARK','RB','RP','RT','RUBY','S','SMALL','SPAN','STRONG','SUB','SUP','TIME']);
const useful=node=>node.nodeType===1||Boolean(node.textContent?.trim());

export function mountDialogPager(dialog,{onPageChange=()=>{}}={}){
  mounted.get(dialog)?.();
  const body=dialog.querySelector('.modal-body'),header=dialog.querySelector('.modal-header');
  if(!body||!header)return ()=>{};
  const owner=body.parentElement;
  let roots=[...body.childNodes],pages=[],index=0,journal=[],frame=0,disposed=false,layingOut=false;
  let priorWidth=0,priorHeight=0;
  const atomic=new WeakSet(),detailOrigins=new WeakMap(),detailStates=new WeakMap();
  body.querySelectorAll('details').forEach(detail=>detailStates.set(detail,detail.open));
  const footer=document.createElement('div');footer.className='dialog-pagination';
  footer.innerHTML='<button type="button" class="dialog-page-previous" aria-label="説明の前のページへ">前へ</button><span class="dialog-page-status" role="status" aria-live="polite"></span><button type="button" class="dialog-page-next" aria-label="説明の次のページへ">次へ</button>';
  const previous=footer.querySelector('button'),next=footer.querySelector('.dialog-page-next'),status=footer.querySelector('.dialog-page-status');
  owner.append(footer);dialog.classList.add('paged-dialog');owner.classList.add('dialog-pager-layout');

  function undoSplits(){
    for(let i=journal.length-1;i>=0;i--){
      const {node,children,clones}=journal[i];
      node.replaceChildren(...children);
      for(const clone of clones)clone.remove();
    }
    journal=[];
  }
  function sourceChanged(){
    // PDF previews finish asynchronously and replace .modal-body wholesale.
    // In that case the new DOM is authoritative; never resurrect the loading text.
    const foreign=[...body.childNodes].filter(node=>!pages.includes(node));
    if(foreign.some(useful)){
      if(pages.some(page=>page.parentElement===body)){
        undoSplits();roots.push(...foreign);
      }else{roots=foreign;journal=[];pages=[];}
    }
  }
  function watch(){if(!disposed)mutation.observe(body,{childList:true,subtree:true,characterData:true});}
  function showPage(value,{notify=true}={}){
    if(disposed||!pages.length)return;
    mutation.disconnect();
    const before=index;index=Math.max(0,Math.min(pages.length-1,value));
    pages.forEach((page,i)=>{page.hidden=i!==index;page.inert=i!==index;page.setAttribute('aria-label',`説明 ${i+1} / ${pages.length}`);});
    previous.disabled=index===0;next.disabled=index===pages.length-1;
    status.textContent=`${index+1} / ${pages.length}`;
    pages[index].scrollTop=0;
    if(notify&&before!==index)onPageChange();
    watch();
  }
  const newPage=()=>{
    const page=document.createElement('div');page.className='dialog-page';page.setAttribute('role','region');body.append(page);return page;
  };
  function fits(page){return page.scrollHeight<=page.clientHeight+2&&page.scrollWidth<=page.clientWidth+2;}

  function sentenceChildren(node){
    if(!['P','LI','BLOCKQUOTE'].includes(node.tagName)||atomic.has(node))return;
    const children=[...node.childNodes];
    if(children.some(child=>child.nodeType===1&&!INLINE.has(child.tagName)))return;
    const sentences=[];let sentence=document.createElement('span');sentence.className='dialog-sentence';
    const finish=()=>{if(sentence.hasChildNodes()){sentences.push(sentence);sentence=document.createElement('span');sentence.className='dialog-sentence';}};
    for(const child of children){
      if(child.nodeType!==3){sentence.append(child);continue;}
      // Never split inside a ruby or any other inline element. Sentence-ending
      // punctuation in text nodes gives readable boundaries without an NLP rule.
      for(const part of child.textContent.match(/[^。！？!?]*[。！？!?]+|[^。！？!?]+$/gu)||[]){
        sentence.append(document.createTextNode(part));
        if(/[。！？!?]$/u.test(part))finish();
      }
    }
    finish();
    if(sentences.length<2){node.replaceChildren(...children);return;}
    journal.push({node,children,clones:[]});node.replaceChildren(...sentences);
    for(const sentence of sentences)atomic.add(sentence);
  }
  function shell(node,record,offset){
    const clone=node.cloneNode(false);clone.removeAttribute('id');
    if(node.tagName==='OL')clone.start=(Number(node.getAttribute('start'))||1)+offset;
    if(node.tagName==='DETAILS'){
      const summary=node.querySelector(':scope > summary');
      if(summary){const repeated=summary.cloneNode(true);repeated.removeAttribute('id');repeated.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));clone.append(repeated);}
      detailOrigins.set(clone,node);detailStates.set(clone,clone.open);
    }
    record.clones.push(clone);return clone;
  }
  function splitInPlace(node,page,depth=0){
    if(node.nodeType!==1||depth>10||atomic.has(node)||!CONTAINERS.has(node.tagName)||node.matches('button,select,textarea,[contenteditable="true"]'))return [node];
    if(node.tagName==='DETAILS'&&!node.open)return [node];
    sentenceChildren(node);
    const children=[...node.childNodes];
    if(!children.some(useful))return [node];
    const parent=node.parentNode,anchor=node.nextSibling,record={node,children,clones:[]};journal.push(record);
    const queue=[...children],parts=[];let part=node,itemsBefore=0;
    node.replaceChildren();
    // Keep the original summary with the first details fragment.
    if(node.tagName==='DETAILS'&&queue[0]?.nodeType===1&&queue[0].tagName==='SUMMARY')part.append(queue.shift());
    while(queue.length){
      const child=queue.shift(),prior=[...part.childNodes].filter(el=>useful(el)&&!(el.nodeType===1&&el.tagName==='SUMMARY')).length;
      part.append(child);
      if(fits(page))continue;
      if(prior){
        child.remove();parts.push(part);itemsBefore+=[...part.children].filter(el=>el.tagName==='LI').length;
        const replacement=shell(node,record,itemsBefore);part.replaceWith(replacement);part=replacement;part.append(child);
        if(fits(page))continue;
      }
      const pieces=splitInPlace(child,page,depth+1);
      if(pieces.length>1){
        child.remove();queue.unshift(...pieces);
      }else{
        // A single very long sentence, interactive widget, or tiny viewport
        // must remain readable. That page will receive an explicit scroll fallback.
        atomic.add(child);
        if(queue.length){
          parts.push(part);itemsBefore+=[...part.children].filter(el=>el.tagName==='LI').length;
          const replacement=shell(node,record,itemsBefore);part.replaceWith(replacement);part=replacement;
        }
      }
    }
    if([...part.childNodes].some(useful))parts.push(part);else part.remove();
    for(const fragment of parts)fragment.remove();
    if(!parts.length)parts.push(node);
    parent.insertBefore(parts[0],anchor);
    return parts;
  }

  function layout(){
    frame=0;if(disposed||layingOut||!dialog.open)return;
    layingOut=true;mutation.disconnect();
    const focus=body.contains(document.activeElement)?document.activeElement:null;
    const oldIndex=index;
    const anchor=focus||pages[index]?.querySelector('button,input,select,textarea,a')||pages[index]?.firstElementChild;
    sourceChanged();undoSplits();
    body.replaceChildren();pages=[];
    let page=newPage();pages.push(page);
    const pending=[...roots];
    while(pending.length){
      const node=pending.shift();if(!useful(node)){page.append(node);continue;}
      const prior=[...page.childNodes].some(useful);page.append(node);
      if(fits(page))continue;
      if(prior){node.remove();page.hidden=true;page=newPage();pages.push(page);page.append(node);if(fits(page))continue;}
      const parts=splitInPlace(node,page);
      if(parts.length>1){
        node.remove();pending.unshift(...parts);
      }else{
        page.classList.add('dialog-page-overflow');page.tabIndex=0;
        page.setAttribute('data-scroll-fallback','true');
        if(pending.some(useful)){page.hidden=true;page=newPage();pages.push(page);}
      }
    }
    if(pages.length>1&&![...pages.at(-1).childNodes].some(useful)){pages.pop().remove();}
    const anchored=anchor?pages.findIndex(candidate=>candidate.contains(anchor)):-1;
    index=Math.min(oldIndex,pages.length-1);showPage(anchored>=0?anchored:index,{notify:false});
    if(focus?.isConnected&&pages[index].contains(focus))focus.focus({preventScroll:true});
    priorWidth=body.clientWidth;priorHeight=body.clientHeight;
    layingOut=false;onPageChange();watch();
  }
  function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(layout);}
  const mutation=new MutationObserver(records=>{
    // Speech feedback changes only its controls, not the explanatory document.
    // Repaginating that feedback would call onPageChange and cancel the reading
    // that just started. Actual text, PDF and layout changes still repaginate.
    if(records.some(record=>{
      const element=record.target.nodeType===1?record.target:record.target.parentElement;
      return !element?.closest('.reading-controls,.reading-status');
    }))schedule();
  });
  const resize=new ResizeObserver(()=>{if(Math.abs(body.clientWidth-priorWidth)>1||Math.abs(body.clientHeight-priorHeight)>1)schedule();});
  const previousPage=()=>showPage(index-1),nextPage=()=>showPage(index+1);
  function toggle(event){
    if(!event.target.matches?.('details'))return;
    const detail=event.target;
    if(detailStates.get(detail)===detail.open)return;
    detailStates.set(detail,detail.open);
    const origin=detailOrigins.get(detail);if(origin){detailStates.set(origin,detail.open);origin.open=detail.open;}
    schedule();
  }
  previous.addEventListener('click',previousPage);next.addEventListener('click',nextPage);body.addEventListener('toggle',toggle,true);
  resize.observe(body);watch();schedule();
  function dispose(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);mutation.disconnect();resize.disconnect();
    previous.removeEventListener('click',previousPage);next.removeEventListener('click',nextPage);body.removeEventListener('toggle',toggle,true);
    sourceChanged();undoSplits();body.replaceChildren(...roots);footer.remove();
    dialog.classList.remove('paged-dialog');owner.classList.remove('dialog-pager-layout');
    if(mounted.get(dialog)===dispose)mounted.delete(dialog);
  }
  mounted.set(dialog,dispose);return dispose;
}
