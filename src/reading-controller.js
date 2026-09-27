import {speechText} from './reading-support.js';

// Short utterances avoid a single long lesson getting stuck in browser speech
// engines. Split on sentence boundaries, then cap unusually long sentences.
export function readingChunks(plainText, maxLength=200) {
  const maximum = Number.isInteger(maxLength) && maxLength > 0 ? maxLength : 200;
  const sentences = speechText(plainText).match(/[^。！？!?\n]+[。！？!?\n]*|[。！？!?\n]+/gu) || [];
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    let rest = Array.from(sentence.trim());
    if (!rest.length) continue;
    if (current && Array.from(current).length + rest.length > maximum) {
      chunks.push(current); current = '';
    }
    while (rest.length > maximum) {
      chunks.push(rest.slice(0,maximum).join(''));
      rest = rest.slice(maximum);
    }
    current += rest.join('');
  }
  if (current) chunks.push(current);
  return chunks;
}

/** The host owns UI and calls stop on navigation, closing, or hiding the page. */
export function createReadingController({engine, createUtterance, onStatus=()=>{}, onError=()=>{}}={}) {
  let generation = 0;
  let currentUtterance = null;
  let speaking = false;
  const status = value => { speaking=value; onStatus({speaking:value}); };

  function stop() {
    generation++;
    currentUtterance = null;
    try { engine?.cancel?.(); } catch { /* A stopped UI must stay stopped. */ }
    status(false);
  }

  function start(plainText) {
    stop();
    if (typeof engine?.speak !== 'function' || typeof engine?.cancel !== 'function' || typeof createUtterance !== 'function') {
      onError('このブラウザでは読み上げを使えません。画面のふりがなを使って読んでください。');
      return false;
    }
    const chunks = readingChunks(plainText);
    if (!chunks.length) { onError('読み上げる説明がありません。'); return false; }
    const run = generation;
    let voices, voice;
    try {
      voices = typeof engine.getVoices === 'function' ? engine.getVoices() : [];
      const japanese = Array.from(voices || []).filter(item=>/^ja(?:[-_]|$)/i.test(item.lang || ''));
      voice = japanese.find(item=>item.default) || japanese.find(item=>item.localService) || japanese[0];
      if (voices?.length && !voice) {
        onError('この端末に日本語の読み上げ音声が見つかりません。端末の言語・音声設定を確認してください。');
        return false;
      }
    } catch {
      onError('読み上げ音声を確認できませんでした。もう一度「この説明を聞く」を押してください。');
      return false;
    }
    let index = 0;
    const fail = () => {
      if (generation !== run) return;
      stop();
      onError('読み上げを続けられませんでした。もう一度「この説明を聞く」を押してください。');
    };
    const next = () => {
      if (generation !== run || !speaking) return;
      if (index >= chunks.length) { currentUtterance=null; status(false); return; }
      try {
        const utterance = createUtterance(chunks[index++]);
        utterance.lang='ja-JP'; utterance.rate=.9;
        if (voice) utterance.voice=voice;
        currentUtterance=utterance;
        utterance.onend = () => {
          if (generation !== run || currentUtterance !== utterance) return;
          currentUtterance=null; next();
        };
        utterance.onerror = () => {
          if (generation !== run || currentUtterance !== utterance) return;
          fail();
        };
        engine.speak(utterance);
      } catch { fail(); }
    };
    status(true);
    try { if (engine.paused) engine.resume?.(); } catch { fail(); return false; }
    next();
    return speaking;
  }
  return {start, stop};
}
