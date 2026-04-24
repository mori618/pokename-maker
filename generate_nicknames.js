const fs = require('fs');

const content = fs.readFileSync('./data_pokemon.js', 'utf8');

// 配列部分を抽出してパース
const listStart = content.indexOf('[');
const listEnd = content.lastIndexOf(']') + 1;
const listStr = content.substring(listStart, listEnd);
let pokemonList;
eval(`pokemonList = ${listStr};`);

// 特別な渾身のニックネーム（手動定義）
const specialNicknames = {
  "フシギバナ": ["森の賢者", "歩く熱帯雨林", "ハナちゃん"],
  "メガフシギバナ": ["超・森の賢者", "古代の巨花", "メガハナちゃん"],
  "リザードン": ["紅蓮の翼", "灼熱の竜", "リザ丸"],
  "メガリザードンX": ["蒼炎の黒竜", "クロスフレア", "黒竜丸"],
  "メガリザードンY": ["太陽の使者", "日照り王", "真・紅蓮の翼"],
  "カメックス": ["蒼海の要塞", "ハイドロタンク", "カメ吉"],
  "メガカメックス": ["メガキャノン", "超・要塞", "大砲ガメ"],
  "ピカチュウ": ["雷の申し子", "イエローフラッシュ", "ピカ太"],
  "ライチュウ": ["迅雷のネズミ", "オレンジボルト", "ライ吉"],
  "イーブイ": ["無限の可能性", "エボリューション", "ブイちゃん"],
  "ゲンガー": ["宵闇の幻影", "シャドウキング", "ゲン坊"],
  "ミュウツー": ["最強の遺伝子", "サイコマスター", "ツー様"],
  "ミュウ": ["幻の起源", "ミラージュ", "ミュウミュウ"],
  "ガブリアス": ["陸の鮫", "マッハドラゴン", "ガブ吉"],
  "ルカリオ": ["波導の勇者", "ブルースティール", "ルカ丸"],
  "サーナイト": ["白き守護者", "サイコエンジェル", "サナ姫"]
};

// タイプごとの形容詞（和風）
const typeAdjWa = {
  "ノーマル": ["無双の", "純白の", "始まりの", "普通の"],
  "ほのお": ["紅蓮の", "灼熱の", "爆炎の", "熱き"],
  "みず": ["蒼海の", "深海の", "激流の", "清らかな"],
  "でんき": ["迅雷の", "紫電の", "雷光の", "痺れる"],
  "くさ": ["深緑の", "大樹の", "森林の", "芽吹く"],
  "こおり": ["極寒の", "氷結の", "絶対零度の", "凍てつく"],
  "かくとう": ["剛腕の", "不屈の", "闘気の", "猛る"],
  "どく": ["猛毒の", "紫煙の", "危険な", "蝕む"],
  "じめん": ["大地の", "荒野の", "砂塵の", "揺るがぬ"],
  "ひこう": ["天空の", "疾風の", "飛翔の", "高き"],
  "エスパー": ["幻惑の", "精神の", "超常の", "見えざる"],
  "むし": ["甲殻の", "群れをなす", "森の", "小さき"],
  "いわ": ["盤石の", "巨岩の", "頑強の", "硬き"],
  "ゴースト": ["漆黒の", "幽玄の", "冥界の", "彷徨う"],
  "ドラゴン": ["竜の", "逆鱗の", "古代の", "神話の"],
  "あく": ["暗黒の", "宵闇の", "月夜の", "隠れし"],
  "はがね": ["鋼鉄の", "白銀の", "鉄壁の", "重き"],
  "フェアリー": ["妖精の", "夢幻の", "神秘の", "愛らしき"]
};

// タイプごとのカタカナ接頭辞
const typeAdjKata = {
  "ノーマル": ["ピュア", "ハイパー", "スター", "エース"],
  "ほのお": ["フレア", "バーン", "ヒート", "イグニス"],
  "みず": ["アクア", "マリン", "ハイドロ", "ウォーター"],
  "でんき": ["ボルト", "サンダー", "スパーク", "エレクトロ"],
  "くさ": ["リーフ", "グリーン", "フォレスト", "ウッド"],
  "こおり": ["フロスト", "アイス", "ブリザード", "スノー"],
  "かくとう": ["ファイト", "マッスル", "スマッシュ", "コンバット"],
  "どく": ["ポイズン", "アシッド", "トキシック", "ヴェノム"],
  "じめん": ["アース", "グランド", "サンド", "ソイル"],
  "ひこう": ["エアロ", "スカイ", "ウイング", "フライト"],
  "エスパー": ["サイコ", "マインド", "テレパシー", "ビジョン"],
  "むし": ["バグ", "インセクト", "スワーム", "ビートル"],
  "いわ": ["ロック", "ストーン", "ソリッド", "ハード"],
  "ゴースト": ["シャドウ", "ファントム", "ゴースト", "ソウル"],
  "ドラゴン": ["ドラグ", "ワイバーン", "ディノ", "レックス"],
  "あく": ["ダーク", "ナイト", "ブラック", "シャドウ"],
  "はがね": ["メタル", "スチール", "アイアン", "シルバー"],
  "フェアリー": ["フェアリー", "ピクシー", "マジック", "チャーム"]
};

// 愛称の接尾辞
const suffixes = ["丸", "吉", "太郎", "どん", "っち", "ゴン", "ぼう", "姫", "キング"];

// ランダム取得ヘルパー（シード固定のため、名前に基づく擬似乱数を使用）
function seededRandom(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function getRandom(arr, rndFn) {
  return arr[Math.floor(rndFn() * arr.length)];
}

// ニックネーム生成
pokemonList.forEach(p => {
  if (specialNicknames[p.name]) {
    p.nicknames = specialNicknames[p.name];
    return;
  }

  const rnd = seededRandom(p.name + p.no);
  const type = p.type1 || "ノーマル";
  
  // モチーフの取得（「/」で区切られている場合は最初の方）
  let motifWa = p.motif ? p.motif.split('/')[0] : "";
  let motifEn = p.motifEn ? p.motifEn.split('/')[0] : "";
  
  if (!motifWa && p.tags && p.tags.length > 0) {
    motifWa = getRandom(p.tags, rnd);
  }
  if (!motifWa) motifWa = "もの";

  if (!motifEn) {
    motifEn = "モンスター";
  }

  // 和風二つ名
  const adjWa = getRandom(typeAdjWa[type] || typeAdjWa["ノーマル"], rnd);
  const name1 = `${adjWa}${motifWa}`;

  // 洋風カタカナ
  const adjKata = getRandom(typeAdjKata[type] || typeAdjKata["ノーマル"], rnd);
  const name2 = `${adjKata}${motifEn.replace(/[^a-zA-Z]/g, '')}`;

  // 愛称
  const shortName = p.name.length > 3 ? p.name.substring(0, 2) : p.name.substring(0, 1);
  const suffix = getRandom(suffixes, rnd);
  let name3 = `${shortName}${suffix}`;
  
  // メガシンカ等への対応
  if (p.name.includes("メガ")) {
    name3 = "メガ" + name3;
  }

  p.nicknames = [name1, name2, name3];
});

// ファイル書き出し
const newContent = content.substring(0, listStart) + JSON.stringify(pokemonList, null, 2) + content.substring(listEnd);

fs.writeFileSync('./data_pokemon_new.js', newContent, 'utf8');
console.log('Successfully generated nicknames and wrote to data_pokemon_new.js');
