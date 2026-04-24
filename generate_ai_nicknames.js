const fs = require('fs');

const content = fs.readFileSync('./data_pokemon.js', 'utf8');
const listStart = content.indexOf('[');
const listEnd = content.lastIndexOf(']') + 1;
const listStr = content.substring(listStart, listEnd);
let pokemonList;
eval(`pokemonList = ${listStr};`);

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

// ==========================
// テーマ別辞書 (6文字以内制限を考慮)
// ==========================

// cool (カタカナ多め、カッコイイ)
const coolPrefix = ["ゼロ", "ネオ", "コア", "ギガ", "メテオ", "ブラド", "シャド", "ルシ", "アビス", "ゼノ"];
const coolSuffix = ["レクス", "ドラゴ", "ナイト", "ブレド", "ロード", "カイザ", "クロス", "キラー", "エッジ", "ファル"];

// cute (ひらがな・カタカナ、かわいい)
const cutePrefix = ["もこ", "ふわ", "ぷち", "きゅん", "める", "ぴんく", "マカロン", "みるく", "ゆめ", "ちび"];
const cuteSuffix = ["ちゃん", "りぼん", "めろ", "パフェ", "ミント", "チェリ", "ぽん", "まる", "姫", "プリン"];

// japanese (ひらがな主体、和風)
const japPrefix = ["くろき", "あかき", "やみの", "かげの", "もりの", "しろき", "げき", "じん", "らい", "ひ"];
const japSuffix = ["のすけ", "まる", "たろう", "かげ", "おに", "じん", "ひめ", "きみ", "けん", "りゅう"];

// western (カタカナ主体、洋風)
const westPrefix = ["キング", "ロード", "グラン", "ロイヤ", "ルビ", "サファ", "エンカ", "ノブル", "リッチ", "ホリ"];
const westSuffix = ["スミス", "ジョン", "アレク", "レオ", "シャル", "アンナ", "マリ", "ローズ", "ベル", "デュー"];

// unique (ネタ系)
const uniPrefix = ["デカ", "ヤバ", "チョウ", "マジ", "オレの", "アレな", "ナゾの", "メタ", "ゴク", "ウラ"];
const uniSuffix = ["アニキ", "オヤジ", "ドン", "パイセ", "ニキ", "マッス", "ボス", "ヤロウ", "ダマ", "ブツ"];

function generateName(rndFn, p, theme, isSecond) {
  let name = "";
  let base = p.name.replace("メガ", "").replace(/\(.*\)/, "");
  let shortBase2 = base.substring(0, 2);
  let shortBase3 = base.length > 2 ? base.substring(0, 3) : base;

  switch(theme) {
    case 'cool':
      if (isSecond) {
        name = getRandom(coolPrefix, rndFn) + shortBase2;
      } else {
        name = shortBase2 + getRandom(coolSuffix, rndFn);
      }
      break;
    case 'cute':
      if (isSecond) {
        name = getRandom(cutePrefix, rndFn) + shortBase2;
      } else {
        // "姫" は漢字なので "ひめ" に直す
        let suf = getRandom(cuteSuffix, rndFn);
        if (suf === "姫") suf = "ひめ";
        name = shortBase2 + suf;
      }
      break;
    case 'japanese':
      if (isSecond) {
        name = getRandom(japPrefix, rndFn) + shortBase2;
      } else {
        name = shortBase2 + getRandom(japSuffix, rndFn);
      }
      break;
    case 'western':
      if (isSecond) {
        name = getRandom(westPrefix, rndFn) + shortBase2;
      } else {
        name = shortBase2 + getRandom(westSuffix, rndFn);
      }
      break;
    case 'unique':
      if (isSecond) {
        name = getRandom(uniPrefix, rndFn) + shortBase2;
      } else {
        name = shortBase3 + getRandom(uniSuffix, rndFn);
      }
      break;
  }

  // 「メガ」対応
  if (p.name.includes("メガ") && name.length <= 4) {
    name = "メガ" + name;
  }

  // 6文字制限
  if (name.length > 6) name = name.substring(0, 6);

  // カタカナ・ひらがなのみチェック（漢字が含まれていたら消す等）
  // 念のため "姫" などが混じらないよう
  name = name.replace(/[\u4E00-\u9FFF]/g, "");

  return name;
}

pokemonList.forEach(p => {
  const rnd = seededRandom(p.name + p.no);

  // 既存を退避
  let general = p.nicknames || [];
  delete p.nicknames;

  p.aiNicknames = {
    general: general,
    cool: [generateName(rnd, p, 'cool', false), generateName(rnd, p, 'cool', true)],
    cute: [generateName(rnd, p, 'cute', false), generateName(rnd, p, 'cute', true)],
    japanese: [generateName(rnd, p, 'japanese', false), generateName(rnd, p, 'japanese', true)],
    western: [generateName(rnd, p, 'western', false), generateName(rnd, p, 'western', true)],
    unique: [generateName(rnd, p, 'unique', false), generateName(rnd, p, 'unique', true)]
  };
});

const newContent = content.substring(0, listStart) + JSON.stringify(pokemonList, null, 2) + content.substring(listEnd);
fs.writeFileSync('./data_pokemon_ai.js', newContent, 'utf8');
console.log('Done generating AI nicknames');
