// Plain text only: do not pass markup or the output of rubyText back into these
// functions. Convert the original content once, where it enters the UI.
export const TERM_READINGS = Object.freeze({
  '宇宙背景放射':'うちゅうはいけいほうしゃ',
  '宇宙の晴れ上がり':'うちゅうのはれあがり',
  '絶対温度':'ぜったいおんど',
  '原子核':'げんしかく', '原子':'げんし', '膨張':'ぼうちょう',
  '天の川銀河':'あまのがわぎんが', '天の川':'あまのがわ',
  '局部銀河群':'きょくぶぎんがぐん', '超銀河団':'ちょうぎんがだん',
  '銀河群':'ぎんがぐん', '銀河団':'ぎんがだん', '銀河':'ぎんが',
  '大規模構造':'だいきぼこうぞう', '星間物質':'せいかんぶっしつ',
  '暗黒物質':'あんこくぶっしつ', '天文単位':'てんもんたんい', '光年':'こうねん',
  '核融合':'かくゆうごう', '中心核':'ちゅうしんかく',
  '放射層':'ほうしゃそう', '対流層':'たいりゅうそう', '光球':'こうきゅう',
  '黒点':'こくてん', '彩層':'さいそう', '白斑':'はくはん', '太陽風':'たいようふう',
  '可視光線':'かしこうせん', '可視光':'かしこう',
  '紫外線':'しがいせん', '赤外線':'せきがいせん', '波長':'はちょう',
  '磁場':'じば', '水素':'すいそ', '粒子':'りゅうし',
  '星間雲':'せいかんうん', '原始太陽':'げんしたいよう',
  '主系列星':'しゅけいれつせい', '赤色巨星':'せきしょくきょせい',
  '白色矮星':'はくしょくわいせい', '惑星状星雲':'わくせいじょうせいうん',
  '超新星爆発':'ちょうしんせいばくはつ', '超新星':'ちょうしんせい',
  '中性子星':'ちゅうせいしせい', '質量':'しつりょう',
  '太陽系外縁天体':'たいようけいがいえんてんたい',
  '地球型惑星':'ちきゅうがたわくせい', '木星型惑星':'もくせいがたわくせい',
  // 日本天文学会「天文学辞典」 https://astro-dic.jp/ice-giant/
  '巨大氷惑星':'きょだいこおりわくせい',
  '原始惑星':'げんしわくせい', '微惑星':'びわくせい', '小惑星帯':'しょうわくせいたい',
  '小惑星':'しょうわくせい', '準惑星':'じゅんわくせい', '恒星':'こうせい',
  '惑星':'わくせい', '彗星':'すいせい', '衛星':'えいせい',
  '太陽系':'たいようけい', '太陽':'たいよう', '水星':'すいせい', '金星':'きんせい',
  '地球':'ちきゅう', '火星':'かせい', '木星':'もくせい', '土星':'どせい',
  '天王星':'てんのうせい', '海王星':'かいおうせい', '冥王星':'めいおうせい',
  '自転軸':'じてんじく', '自転':'じてん', '公転':'こうてん',
  '同期回転':'どうきかいてん', '公転周期':'こうてんしゅうき', '周期':'しゅうき',
  '温室効果':'おんしつこうか', '大赤斑':'だいせきはん', '二酸化炭素':'にさんかたんそ',
  '大気':'たいき', '窒素':'ちっそ', '酸素':'さんそ',
  '地殻':'ちかく', '隕石':'いんせき', '衝突':'しょうとつ', '岩石':'がんせき',
  '潮汐力':'ちょうせきりょく', '潮汐':'ちょうせき',
  '引力':'いんりょく', '重力':'じゅうりょく', '液体':'えきたい',
  '円盤':'えんばん', '楕円':'だえん', '軌道':'きどう', '密度':'みつど',
  '光速':'こうそく', '探査':'たんさ', '観測':'かんそく', '観察':'かんさつ',
  '試料':'しりょう', '採集':'さいしゅう', '採取':'さいしゅ', '模擬':'もぎ',
  '硫黄':'いおう', '堆積物':'たいせきぶつ', '模式図':'もしきず'
});

const escapeHtml = text => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const terms = Object.keys(TERM_READINGS).sort((a,b) => b.length-a.length);
// A single-character ring only matches outside longer kanji words such as 環境.
const termPattern = new RegExp(`${terms.map(escapeRegExp).join('|')}|(?<![\\p{Script=Han}])環(?![\\p{Script=Han}])`, 'gu');
const reading = term => term === '環' ? 'かん' : TERM_READINGS[term];

/** Escape plain text and annotate known astronomy terms. No HTML is trusted. */
export function rubyText(plainText) {
  const text = String(plainText ?? '');
  let output = '', offset = 0;
  for (const match of text.matchAll(termPattern)) {
    output += escapeHtml(text.slice(offset, match.index));
    output += `<ruby>${escapeHtml(match[0])}<rt>${escapeHtml(reading(match[0]))}</rt></ruby>`;
    offset = match.index + match[0].length;
  }
  return output + escapeHtml(text.slice(offset));
}

/** Prefer explicit kana for specialist terms; keep all other text and numbers. */
export function speechText(plainText) {
  return String(plainText ?? '').replace(termPattern, term => reading(term));
}
