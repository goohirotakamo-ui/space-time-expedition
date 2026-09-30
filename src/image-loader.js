const LOAD_ERROR='画像を読み込めませんでした。通信を確認して、もう一度お試しください。';
const TIMEOUT_ERROR='画像の読み込みに時間がかかっています。通信を確認して、もう一度お試しください。';

// A failed request must not poison later attempts after the connection returns.
// Injecting the browser primitives also lets the retry and timeout races be tested.
export function createImageLoader({createImage=()=>new Image(),timeoutMs=15000,setTimer=setTimeout,clearTimer=clearTimeout}={}) {
  const cache=new Map();
  return function loadImage(src) {
    if(cache.has(src))return cache.get(src).promise;
    let resolve,reject,img,timer;
    const attempt={settled:false,promise:new Promise((yes,no)=>{resolve=yes;reject=no;})};
    cache.set(src,attempt);
    function finish(error) {
      if(attempt.settled)return;
      attempt.settled=true;
      clearTimer(timer);
      if(img){img.onload=null;img.onerror=null;}
      if(error){
        if(cache.get(src)===attempt)cache.delete(src);
        reject(error);
      }else resolve(img);
    }
    try {
      img=createImage();
      img.onload=()=>finish();
      img.onerror=()=>finish(new Error(LOAD_ERROR));
      timer=setTimer(()=>finish(new Error(TIMEOUT_ERROR)),timeoutMs);
      img.src=src;
    }catch {finish(new Error(LOAD_ERROR));}
    return attempt.promise;
  };
}

export const loadImage=createImageLoader();
