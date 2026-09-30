// Redrawing the sky must not overwrite a native select's uncommitted choice.
// Remember the last model value, rather than comparing only with the DOM value.
export function createSelectValueSync(){
  const values=new WeakMap();
  return (select,value,{refresh=false}={})=>{
    const next=String(value??'');
    if(!refresh&&values.has(select)&&values.get(select)===next)return;
    if(select.value!==next)select.value=next;
    values.set(select,next);
  };
}

export function isFlightEditingTarget(target){
  return Boolean(target?.closest?.('input,select,textarea,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'));
}
