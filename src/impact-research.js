const ASSET='https://images-assets.nasa.gov/video/ARC-20221004-AAV3443-MoonOrigin-Social-NASAWeb-1080p/ARC-20221004-AAV3443-MoonOrigin-Social-NASAWeb-1080p';
const VIDEO_URL=`${ASSET}~medium.mp4`;
const ARTICLE_URL='https://www.nasa.gov/solar-system/collision-may-have-formed-the-moon-in-mere-hours-simulations-reveal/';
const YOUTUBE_URL='https://www.youtube.com/watch?v=kRlhlCWplqk';
const CAPTIONS=[
  [0,'若い地球に火星ほどの天体が衝突した、という仮説を調べた研究です。'],
  [31,'衝突すると、地球と衝突天体の物質が大きく変形して広がります。'],
  [40,'この計算では、飛び出した物質から大小のかたまりができます。'],
  [53,'小さいかたまりが、月になる天体の候補です。'],
  [64,'かたまり同士に働く重力によって、小さいかたまりの進む道が変わります。'],
  [72,'この研究では、月になる天体が短時間で地球から離れた軌道へ移ります。月の形成を説明するモデルの一つです。']
];

export function impactResearchHtml(){
  return `<section class="impact-research" aria-label="月の形成を調べた研究映像">
    <p class="impact-badge">仮説に基づく再現映像</p>
    <p>実際の撮影映像ではなく、衝突の条件を設定して計算した研究の一例です。月のでき方は研究が続いています。</p>
    <video class="impact-video" data-impact-video controls playsinline muted preload="none" poster="${ASSET}~medium.jpg" aria-label="NASAによる月の形成の研究映像"></video>
    <div class="impact-play-actions"><button type="button" class="button" data-impact-play>研究映像を再生</button><span>約2分・英語／日本語の補足付き</span></div>
    <p class="impact-status" data-impact-status role="status" aria-live="polite">再生するとNASAの映像を読み込みます。音声は最初ミュートです。</p>
    <div class="impact-caption"><small>日本語の補足は学習用の要約</small><p data-impact-caption>${CAPTIONS[0][1]}</p></div>
    <p class="impact-credit">NASA / Durham University / Jacob Kegerreis（2022）<br><span lang="en">New Supercomputer Simulation Sheds Light on Moon’s Origin</span></p>
    <p class="impact-links"><a href="${ARTICLE_URL}" target="_blank" rel="noopener noreferrer">NASAの研究紹介</a> · <a href="${YOUTUBE_URL}" target="_blank" rel="noopener noreferrer">NASA公式YouTubeで見る</a> · <a href="https://doi.org/10.3847/2041-8213/ac8d96" target="_blank" rel="noopener noreferrer">研究論文</a></p>
    <p class="impact-fallback">学校の通信設定などで映像を読み込めない場合は、上の研究紹介やYouTubeを開けます。</p>
  </section>`;
}

// A dialog owns this controller. Disposing it cancels delayed play promises and
// releases the remote media request as well as event listeners and the timer.
export function mountImpactResearch(root){
  const video=root.querySelector('[data-impact-video]'),button=root.querySelector('[data-impact-play]');
  const status=root.querySelector('[data-impact-status]'),caption=root.querySelector('[data-impact-caption]');
  if(!video||!button||!status||!caption)return ()=>{};
  const events=new AbortController();let disposed=false,timer=0,attempt=0,hasSource=false;
  const bind=(el,type,handler)=>el.addEventListener(type,handler,{signal:events.signal});
  const clearLoading=()=>{if(timer){clearTimeout(timer);timer=0;}};
  const releaseMedia=()=>{hasSource=false;video.pause();video.removeAttribute('src');video.load();};
  function fail(message){
    if(disposed)return;
    attempt++;clearLoading();releaseMedia();button.disabled=false;button.hidden=false;button.textContent='もう一度読み込む';status.textContent=message;
  }
  function loading(){
    if(disposed||!hasSource)return;
    status.textContent='研究映像を読み込んでいます…';
    if(!timer)timer=setTimeout(()=>fail('読み込みに時間がかかっています。もう一度試すか、NASAの研究紹介・YouTubeを開いてください。'),20000);
  }
  bind(button,'click',()=>{
    if(disposed||button.disabled)return;
    const token=++attempt;clearLoading();video.muted=true;button.disabled=true;button.textContent='読み込み中…';
    caption.textContent=CAPTIONS[0][1];hasSource=true;video.setAttribute('src',VIDEO_URL);video.load();loading();
    try{
      Promise.resolve(video.play()).catch(()=>{
        if(!disposed&&token===attempt)fail('映像を再生できませんでした。もう一度試すか、NASAの研究紹介・YouTubeを開いてください。');
      });
    }catch{
      if(!disposed&&token===attempt)fail('映像を再生できませんでした。NASAの研究紹介・YouTubeも利用できます。');
    }
  });
  bind(video,'playing',()=>{
    if(disposed||!hasSource)return;
    clearLoading();button.disabled=false;button.hidden=true;status.textContent='研究映像を再生中です。下の日本語の補足と合わせて観察しましょう。';
  });
  bind(video,'waiting',loading);
  bind(video,'stalled',loading);
  bind(video,'pause',()=>{
    if(disposed||!hasSource)return;
    clearLoading();status.textContent='映像を一時停止しています。動画の再生ボタンで続けられます。';
  });
  bind(video,'error',()=>{
    if(!disposed&&hasSource)fail('映像を読み込めませんでした。もう一度試すか、NASAの研究紹介・YouTubeを開いてください。');
  });
  bind(video,'ended',()=>{
    if(disposed||!hasSource)return;
    clearLoading();button.disabled=false;button.hidden=false;button.textContent='もう一度見る';status.textContent='映像を見終わりました。この結果は衝突条件を設定した研究モデルの一例です。';
  });
  bind(video,'timeupdate',()=>{
    if(disposed||!hasSource)return;
    const seconds=Number.isFinite(video.currentTime)?video.currentTime:0;
    let text=CAPTIONS[0][1];for(const [at,value] of CAPTIONS){if(seconds<at)break;text=value;}
    if(caption.textContent!==text)caption.textContent=text;
  });
  return ()=>{
    if(disposed)return;
    disposed=true;attempt++;clearLoading();events.abort();releaseMedia();
  };
}
