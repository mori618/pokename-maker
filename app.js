import { themes, types as typeWords, affixes, foreign, tagWords } from './data.js';
import { pokemonList } from './data_pokemon.js';
import { generalWords, extendedTagWords } from './data_words.js';

// --- State ---
let selectedThemes = new Set(['random']);
let selectedTypes = new Set();


// --- DOM Elements ---
const pokemonTypeBadges = document.getElementById('pokemon-type-badges');
const pokemonTypeGroup = document.getElementById('pokemon-type-group');
const inspirationBoard = document.getElementById('inspiration-board');
const themeTags = document.getElementById('theme-tags');
const pokemonInput = document.getElementById('pokemon-input');
const suggestionsList = document.getElementById('suggestions-list');
const generateBtn = document.getElementById('generate-btn');
const regenerateBtn = document.getElementById('regenerate-btn');
const resultsGrid = document.getElementById('results-grid');
const toast = document.getElementById('toast');

// --- Initialization ---
function init() {
    setupEventListeners();
}

const TYPE_COLORS = {
    "normal": "var(--type-normal)", "fire": "var(--type-fire)", "water": "var(--type-water)",
    "electric": "var(--type-electric)", "grass": "var(--type-grass)", "ice": "var(--type-ice)",
    "fighting": "var(--type-fighting)", "poison": "var(--type-poison)", "ground": "var(--type-ground)",
    "flying": "var(--type-flying)", "psychic": "var(--type-psychic)", "bug": "var(--type-bug)",
    "rock": "var(--type-rock)", "ghost": "var(--type-ghost)", "dragon": "var(--type-dragon)",
    "dark": "var(--type-dark)", "steel": "var(--type-steel)", "fairy": "var(--type-fairy)"
};

const TYPE_LABELS = {
    "normal": "ノーマル", "fire": "ほのお", "water": "みず", "electric": "でんき",
    "grass": "くさ", "ice": "こおり", "fighting": "かくとう", "poison": "どく",
    "ground": "じめん", "flying": "ひこう", "psychic": "エスパー", "bug": "むし",
    "rock": "いわ", "ghost": "ゴースト", "dragon": "ドラゴン", "dark": "あく",
    "steel": "はがね", "fairy": "フェアリー"
};

// 背景色に応じて読みやすい文字色（白 or 暗色）を返す
const TYPE_DARK_TEXT = new Set(['electric', 'ice', 'ground', 'steel', 'normal', 'bug']);

/**
 * ポケモン選択時にそのタイプをバッジとして表示する
 * @param {string[]} typeKeys - タイプキーの配列（例: ['fire', 'flying']）
 */
function showPokemonTypeBadges(typeKeys) {
    // バッジエリアをクリア
    pokemonTypeBadges.innerHTML = '';

    if (typeKeys.length === 0) {
        // タイプなしの場合は非表示
        pokemonTypeGroup.style.display = 'none';
        return;
    }

    // 各タイプのバッジを作成
    typeKeys.forEach(key => {
        const badge = document.createElement('span');
        badge.className = 'type-badge';
        badge.textContent = TYPE_LABELS[key] || key;
        badge.style.backgroundColor = TYPE_COLORS[key] || '#999';
        // 明るい背景色のタイプは文字色を暗くして読みやすくする
        badge.style.color = TYPE_DARK_TEXT.has(key) ? '#2c3e50' : 'white';
        pokemonTypeBadges.appendChild(badge);
    });

    // バッジエリアを表示
    pokemonTypeGroup.style.display = '';
}

/**
 * ポケモン選択時にそのポケモンのプロファイル（多国語名、モチーフ、特性、タグ）を
 * インスピレーションボードに描画する
 * @param {Object} pkmn - ポケモンオブジェクト
 */
function showInspirationBoard(pkmn) {
    if (!pkmn) {
        inspirationBoard.innerHTML = '';
        inspirationBoard.classList.add('hidden');
        return;
    }

    // 多国語名リスト
    const langNames = [];
    if (pkmn.nameEn) langNames.push(`<li><span class="lang-label">英語</span> <span class="lang-val">${pkmn.nameEn}${pkmn.nameReading?.en ? ` (${pkmn.nameReading.en})` : ''}</span></li>`);
    if (pkmn.nameLa) langNames.push(`<li><span class="lang-label">ラテン語</span> <span class="lang-val">${pkmn.nameLa}${pkmn.nameReading?.la ? ` (${pkmn.nameReading.la})` : ''}</span></li>`);
    if (pkmn.nameDe) langNames.push(`<li><span class="lang-label">ドイツ語</span> <span class="lang-val">${pkmn.nameDe}${pkmn.nameReading?.de ? ` (${pkmn.nameReading.de})` : ''}</span></li>`);
    if (pkmn.nameFr) langNames.push(`<li><span class="lang-label">フランス語</span> <span class="lang-val">${pkmn.nameFr}${pkmn.nameReading?.fr ? ` (${pkmn.nameReading.fr})` : ''}</span></li>`);

    // モチーフ多国語
    const langMotifs = [];
    if (pkmn.motif) langMotifs.push(`<li><span class="lang-label">日本語</span> <span class="lang-val">${pkmn.motif}</span></li>`);
    if (pkmn.motifEn) langMotifs.push(`<li><span class="lang-label">英語</span> <span class="lang-val">${pkmn.motifEn}${pkmn.motifReading?.en ? ` (${pkmn.motifReading.en})` : ''}</span></li>`);
    if (pkmn.motifLa) langMotifs.push(`<li><span class="lang-label">ラテン語</span> <span class="lang-val">${pkmn.motifLa}${pkmn.motifReading?.la ? ` (${pkmn.motifReading.la})` : ''}</span></li>`);
    if (pkmn.motifDe) langMotifs.push(`<li><span class="lang-label">ドイツ語</span> <span class="lang-val">${pkmn.motifDe}${pkmn.motifReading?.de ? ` (${pkmn.motifReading.de})` : ''}</span></li>`);
    if (pkmn.motifFr) langMotifs.push(`<li><span class="lang-label">フランス語</span> <span class="lang-val">${pkmn.motifFr}${pkmn.motifReading?.fr ? ` (${pkmn.motifReading.fr})` : ''}</span></li>`);

    // 特性
    const abilities = [];
    if (pkmn.ability1) abilities.push(`<li><span class="lang-label">特性1</span> <span class="lang-val">${pkmn.ability1}</span></li>`);
    if (pkmn.ability2) abilities.push(`<li><span class="lang-label">特性2</span> <span class="lang-val">${pkmn.ability2}</span></li>`);
    if (pkmn.hiddenAbility) abilities.push(`<li><span class="lang-label">夢特性</span> <span class="lang-val">${pkmn.hiddenAbility}</span></li>`);

    // タイプ名表示（バッジと別にボード用にもテキストで）
    const typesStr = [pkmn.type1, pkmn.type2].filter(Boolean).join(' / ');

    // タグ
    const tagsHtml = (pkmn.tags || []).map(t => `<span class="tag-item">${t}</span>`).join('');

    // ニックネーム例の抽出（2つ）
    const exampleNames = [];
    if (pkmn.aiNicknames) {
        const allAiNames = [];
        const themesArr = Array.from(selectedThemes);
        themesArr.forEach(t => {
            if (t === 'random') {
                if (pkmn.aiNicknames.general) allAiNames.push(...pkmn.aiNicknames.general);
            } else if (pkmn.aiNicknames[t]) {
                allAiNames.push(...pkmn.aiNicknames[t]);
            }
        });
        if (allAiNames.length === 0 && pkmn.aiNicknames.general) {
            allAiNames.push(...pkmn.aiNicknames.general);
        }
        
        const shuffledAi = [...allAiNames].sort(() => 0.5 - Math.random());
        if (shuffledAi[0]) exampleNames.push(shuffledAi[0]);
        if (shuffledAi[1]) exampleNames.push(shuffledAi[1]);
    }
    const examplesHtml = exampleNames.length > 0
        ? exampleNames.map(name => `<li style="font-size:1.15rem;font-weight:900;color:var(--primary-dark);justify-content:center;border-bottom:none;padding-bottom:0;">${name}</li>`).join('')
        : '<li style="color:var(--text-muted);justify-content:center;border-bottom:none;">データなし</li>';

    inspirationBoard.innerHTML = `
        <h3><span class="material-icons-round">lightbulb</span>「${pkmn.name}」のインスピレーションボード</h3>
        <div class="inspiration-grid">
            <!-- 多国語名 -->
            <div class="inspiration-card">
                <h4><span class="material-icons-round">translate</span>世界での名前</h4>
                <ul>
                    ${langNames.length > 0 ? langNames.join('') : '<li>データなし</li>'}
                </ul>
            </div>
            
            <!-- モチーフ -->
            <div class="inspiration-card accent-type">
                <h4><span class="material-icons-round">pets</span>由来・モチーフ</h4>
                <ul>
                    ${langMotifs.length > 0 ? langMotifs.join('') : '<li>データなし</li>'}
                </ul>
            </div>

            <!-- 特性・タイプ -->
            <div class="inspiration-card accent-abilities">
                <h4><span class="material-icons-round">flash_on</span>タイプ・特性</h4>
                <ul>
                    <li><span class="lang-label">タイプ</span> <span class="lang-val">${typesStr || 'なし'}</span></li>
                    ${abilities.join('')}
                </ul>
            </div>

            <!-- ニックネームの例 -->
            <div class="inspiration-card accent-examples" style="border-top-color: #3b4cca; background: rgba(59, 76, 202, 0.03);">
                <h4><span class="material-icons-round">casino</span>こんな名前にしてみる？</h4>
                <ul style="display:flex;flex-direction:column;gap:0.4rem;align-items:center;padding:0.2rem 0;">
                    ${examplesHtml}
                </ul>
                <div style="font-size:0.7rem;color:var(--text-muted);text-align:center;margin-top:0.4rem;border-top:1px solid #edf2f7;padding-top:0.3rem;width:100%;">
                    ※これらをヒントに独自のニックネームを作ってみましょう！
                </div>
            </div>
        </div>

        <!-- イメージタグ（グリッドの外で幅広に表示） -->
        <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px dashed #cbd5e1;">
            <h4 style="font-size: 0.85rem; color: var(--text-main); font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.3rem;">
                <span class="material-icons-round" style="font-size: 1.1rem; color: var(--text-muted);">local_offer</span>イメージワード
            </h4>
            <div class="badge-container" style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                ${tagsHtml || '<span style="font-size:0.85rem;color:var(--text-muted);">なし</span>'}
            </div>
        </div>
    `;
    inspirationBoard.classList.remove('hidden');
}

// --- Event Listeners ---
function setupEventListeners() {

    // Themes
    themeTags.addEventListener('click', (e) => {
        if (e.target.classList.contains('theme-btn')) {
            const theme = e.target.dataset.theme;
            if (theme === 'random') {
                selectedThemes.clear();
                selectedThemes.add('random');
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            } else {
                selectedThemes.delete('random');
                document.querySelector('[data-theme="random"]').classList.remove('active');
                
                if (selectedThemes.has(theme)) {
                    selectedThemes.delete(theme);
                    e.target.classList.remove('active');
                } else {
                    selectedThemes.add(theme);
                    e.target.classList.add('active');
                }
                
                if (selectedThemes.size === 0) {
                    selectedThemes.add('random');
                    document.querySelector('[data-theme="random"]').classList.add('active');
                }
            }
        }
    });

    // Autocomplete
    pokemonInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val.length < 1) {
            suggestionsList.classList.add('hidden');
            // 入力が空になったらタイプバッジとボードをリセット
            selectedTypes.clear();
            showPokemonTypeBadges([]);
            showInspirationBoard(null);
            return;
        }
        
        const katakanaVal = toKatakana(val);
        const matches = pokemonList.filter(p => p.name.includes(katakanaVal)).slice(0, 5);
        if (matches.length > 0) {
            suggestionsList.innerHTML = '';
            matches.forEach(p => {
                const li = document.createElement('li');
                li.textContent = p.name;
                li.addEventListener('click', () => {
                    pokemonInput.value = p.name;
                    suggestionsList.classList.add('hidden');
                    // ポケモンのタイプを selectedTypes に反映し、バッジ表示する
                    const pType1Label = p.type1;
                    const pType2Label = p.type2;

                    selectedTypes.clear();
                    const typeKeys = [];

                    const type1Key = Object.keys(TYPE_LABELS).find(k => TYPE_LABELS[k] === pType1Label);
                    if (type1Key) {
                        selectedTypes.add(type1Key);
                        typeKeys.push(type1Key);
                    }
                    if (pType2Label) {
                        const type2Key = Object.keys(TYPE_LABELS).find(k => TYPE_LABELS[k] === pType2Label);
                        if (type2Key) {
                            selectedTypes.add(type2Key);
                            typeKeys.push(type2Key);
                        }
                    }

                    // タイプバッジとインスピレーションボードを更新
                    showPokemonTypeBadges(typeKeys);
                    showInspirationBoard(p);
                });
                suggestionsList.appendChild(li);
            });
            suggestionsList.classList.remove('hidden');
        } else {
            suggestionsList.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-wrapper')) {
            suggestionsList.classList.add('hidden');
        }
    });

    // Generate
    generateBtn.addEventListener('click', () => generateNicknames());
    regenerateBtn.addEventListener('click', () => generateNicknames());
}

// --- Natural Truncation for Kana ---
function truncateToNatural(word, targetLength) {
    if (word.length <= targetLength) return word;
    
    // 1. ・で区切られている場合は、その区切りを優先
    if (word.includes('・')) {
        const parts = word.split('・');
        const exactPart = parts.find(p => p.length === targetLength);
        if (exactPart) return exactPart;
        
        const longParts = parts.filter(p => p.length > targetLength);
        if (longParts.length > 0) {
            word = longParts[Math.floor(Math.random() * longParts.length)];
        } else {
            word = parts.join(''); // つなげて再試行
        }
    }
    
    if (word.length <= targetLength) return word;

    const smallKana = "ァィゥェォャュョッー";
    const validStarts = [];
    
    for (let i = 0; i <= word.length - targetLength; i++) {
        // 先頭が小文字や伸ばし棒になるのは不自然
        if (smallKana.includes(word[i])) continue;
        
        // 切り取った直後の文字が小文字や伸ばし棒の場合、切り捨てられた文字が孤立して不自然になる
        const nextChar = word[i + targetLength];
        if (nextChar && smallKana.includes(nextChar)) continue;
        
        validStarts.push(i);
    }
    
    if (validStarts.length > 0) {
        // 最初の文字から切り取るのが最も自然なことが多いので確率を高くする
        if (validStarts.includes(0) && Math.random() < 0.7) {
            return word.substring(0, targetLength);
        }
        const start = validStarts[Math.floor(Math.random() * validStarts.length)];
        return word.substring(start, start + targetLength);
    }
    
    return word.substring(0, targetLength);
}

// --- Generation Logic ---
function generateNicknames() {
    const targetLength = 6; // 互換性用のダミー（isAssociationMode=trueのため参照されません）
    const basePokemon = pokemonInput.value.trim();
    const isAssociationMode = true; // 常にインスピレーション（アイデア）モード
    
    let results = new Set();
    const resultDetails = [];

    // --- Prepare pool for Combinations ---
    const wordsByLength = {2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: []};
    const addWordsToPool = (arr) => {
        arr.forEach(w => {
            if (!w) return;
            const cleanWord = w.replace(/・/g, '').replace(/（.*?）/g, '');
            const clen = cleanWord.length;
            if (clen >= 2 && clen <= 10) {
                if (!wordsByLength[clen]) wordsByLength[clen] = [];
                wordsByLength[clen].push(cleanWord);
            }
        });
    };
    if (generalWords) {
        if (generalWords.length2) addWordsToPool(generalWords.length2);
        if (generalWords.length3) addWordsToPool(generalWords.length3);
        if (generalWords.length4) addWordsToPool(generalWords.length4);
    }
    selectedTypes.forEach(t => { if (typeWords[t]) addWordsToPool(typeWords[t]); });
    Object.values(tagWords).forEach(arr => addWordsToPool(arr));
    if (typeof extendedTagWords !== 'undefined') {
        Object.values(extendedTagWords).forEach(arr => addWordsToPool(arr));
    }
    
    const getWordOfLength = (l) => {
        const pool = wordsByLength[l];
        if (!pool || pool.length === 0) return "";
        return pool[Math.floor(Math.random() * pool.length)];
    };
    // -------------------------------------

    let methodCounts = {};
    let alphabetCount = 0;
    const specialMethodLimit = selectedThemes.has('gibberish') ? 3 : 1;

    const addResult = (name, method, subtitle = '', ignoreLength = false) => {
        if (isAssociationMode) {
            ignoreLength = true;
        }

        // ・を消して、その後の文字数で判断
        name = isAssociationMode ? name : name.replace(/·/g, '');

        // filter by length rules
        if (name.length < 1) return;
        if (!ignoreLength && name.length !== targetLength) return;
        
        // Custom rules
        if (!isAssociationMode) {
            if (name.startsWith('ん')) return;
            if (name.includes('んん')) return;
            if (/(?<char>.)\k<char>\k<char>/.test(name)) return; // 3 same chars
        }
        if (/[\u4E00-\u9FFF]/.test(name)) return; // 漢字なしで

        // Limit same method
        let limit = 3;
        const themeSelected = !selectedThemes.has('random') && selectedThemes.size > 0;
        if (method === 'ランダム' || method === 'アナグラム') {
            limit = specialMethodLimit;
        } else if (method === 'テーマから') {
            limit = themeSelected ? 5 : 2; // テーマ選択時は積極的に出す
        } else if (method === 'タイプつながり') {
            limit = selectedTypes.size > 0 ? 4 : 2;
        } else if (method === 'イメージから') {
            limit = 4; // タグは複数カテゴリがあるので多めに
        } else if (method === 'とくせいから') {
            limit = 3; // 特性は最大3個まで
        } else if (method === 'せかいの名前' || method === 'つながる外国語') {
            limit = 4; // 外国語は言語ごとに異なる候補が出るので4個まで
        } else if (method === '外国語') {
            limit = 3;
        } else if (method === 'ことばをミックス') {
            limit = 2; // ことばをミックスは2個まで
        } else if (method === '和風スタイル') {
            limit = themeSelected && selectedThemes.has('japanese') ? 5 : 3;
        }
        if ((methodCounts[method] || 0) >= limit) return;

        const isAlphabet = /^[a-zA-Z\s\-\ä\ö\ü\ß\é\è\ê\ë\à\â\ç\î\ï\ô\ù\û]+$/i.test(name);
        if (isAlphabet) {
            if (alphabetCount >= 3) return; // アルファベット候補数を最大3つまでに増やす
        }

        if (!results.has(name) && results.size < 16) {
            results.add(name);
            
            // 優先度の計算（テーマ・タイプ選択時はそちらを重視）
            const themeActive = !selectedThemes.has('random') && selectedThemes.size > 0;
            const typeActive = selectedTypes.size > 0;
            let priority = 10;
            if (method.includes('AIのイチオシ')) priority = 100;
            else if (method === 'テーマから') priority = themeActive ? 95 : 70;   // テーマ選択中は最上位
            else if (method === 'タイプつながり') priority = typeActive ? 92 : 68; // タイプ選択中は高優先
            else if (method === 'イメージから') priority = 85;
            else if (method === 'とくせいから') priority = 82;
            else if (method === 'ことばをミックス') priority = 78;
            else if (method === '和風スタイル') priority = (themeActive && selectedThemes.has('japanese')) ? 94 : 75;
            else if (method === 'せかいの名前') priority = (themeActive && selectedThemes.has('western')) ? 88 : 65;
            else if (method === 'つながる外国語') priority = (themeActive && selectedThemes.has('western')) ? 86 : 63;
            else if (['まえにプラス', 'うしろにプラス'].includes(method)) priority = 58;
            else if (method === '外国語') priority = (themeActive && selectedThemes.has('western')) ? 85 : 52;
            else if (method === 'アナグラム') priority = 38;
            else if (method === 'ランダム') priority = 10;

            resultDetails.push({ name, method, subtitle, priority });
            methodCounts[method] = (methodCounts[method] || 0) + 1;
            if (isAlphabet) {
                alphabetCount++;
            }
        }
    };

    const pkmn = basePokemon ? pokemonList.find(p => p.name === basePokemon) : null;

    let attempts = 0;
    while(results.size < 16 && attempts < 200) {
        attempts++;
        
        // 0. AI Generated
        // 最初の試行ではAIニックネームがあれば必ず追加を試みる
        if (pkmn && pkmn.aiNicknames && (attempts === 1 || Math.random() < 0.6)) {
            const availableAiNames = [];
            const themesArr = Array.from(selectedThemes);
            
            themesArr.forEach(t => {
                    if (t === 'random') {
                        if (pkmn.aiNicknames.general) availableAiNames.push(...pkmn.aiNicknames.general.map(n => ({name: n, method: 'AIのイチオシ(おまかせ)'})));
                    } else if (pkmn.aiNicknames[t]) {
                        let methodLabel = 'AIのイチオシ';
                        if (t === 'cool') methodLabel = 'AIのイチオシ(かっこいい)';
                        if (t === 'cute') methodLabel = 'AIのイチオシ(かわいい)';
                        if (t === 'japanese') methodLabel = 'AIのイチオシ(和風)';
                        if (t === 'western') methodLabel = 'AIのイチオシ(洋風)';
                        if (t === 'unique') methodLabel = 'AIのイチオシ(ネタ)';
                        availableAiNames.push(...pkmn.aiNicknames[t].map(n => ({name: n, method: methodLabel})));
                    }
                });

                if (availableAiNames.length > 0) {
                    const choice = availableAiNames[Math.floor(Math.random() * availableAiNames.length)];
                    addResult(choice.name, choice.method, 'AIが厳選したニックネーム例', true);
                }
            }

        // 1. Anagram if base pokemon exists
        if (basePokemon && Math.random() < 0.3) {
            const shuffled = basePokemon.split('').sort(() => 0.5 - Math.random()).join('');
            if (shuffled !== basePokemon) addResult(shuffled, 'アナグラム', `「${basePokemon}」の文字を並び替え`);
        }

        // 1.5. ポケモン固有データ（外国語名・モチーフ・タグ・特性）から独立して生成
        // ※ポケモン名が入力されている場合、各カテゴリを独立して高確率で試行する
        if (basePokemon) {
            const pkmnData = pokemonList.find(p => p.name === basePokemon);
            if (pkmnData) {

                // --- A. 外国語名（せかいの名前）: 80%の確率で試行 ---
                const nameReadingChance = (!selectedThemes.has('random') && selectedThemes.has('western')) ? 0.9 : 0.75;
                if ((isAssociationMode || Math.random() < nameReadingChance) && pkmnData.nameReading) {
                    const keys = Object.keys(pkmnData.nameReading).filter(k => pkmnData.nameReading[k] && pkmnData.nameReading[k].trim() !== '');
                    if (keys.length > 0) {
                        const k = keys[Math.floor(Math.random() * keys.length)];
                        const originalMap = { en: pkmnData.nameEn, la: pkmnData.nameLa, de: pkmnData.nameDe, fr: pkmnData.nameFr };
                        const langLabelMap = { en: '英語', la: 'ラテン語', de: 'ドイツ語', fr: 'フランス語' };
                        const langLabel = langLabelMap[k] || k;
                        let word = pkmnData.nameReading[k];
                        let originalName = originalMap[k] || '';

                        if (word.includes('/')) {
                            const parts = word.split('/');
                            word = parts[Math.floor(Math.random() * parts.length)];
                        }
                        word = word.replace(/（.*?）/g, '').replace(/メガ・/, '');
                        if (word.length > targetLength && !isAssociationMode) {
                            word = truncateToNatural(word, targetLength);
                        }
                        let subtitle = `${originalName} （${pkmnData.name}の${langLabel}名）`;
                        if (word) addResult(word, 'せかいの名前', subtitle);
                    }
                }

                // --- B. モチーフ外国語（つながる外国語）: 80%の確率で試行 ---
                const motifReadingChance = (!selectedThemes.has('random') && selectedThemes.has('western')) ? 0.9 : 0.75;
                if ((isAssociationMode || Math.random() < motifReadingChance) && pkmnData.motifReading) {
                    const keys = Object.keys(pkmnData.motifReading).filter(k => pkmnData.motifReading[k] && pkmnData.motifReading[k].trim() !== '');
                    if (keys.length > 0) {
                        const k = keys[Math.floor(Math.random() * keys.length)];
                        const originalMap = { en: pkmnData.motifEn, la: pkmnData.motifLa, de: pkmnData.motifDe, fr: pkmnData.motifFr };
                        const langLabelMap = { en: '英語', la: 'ラテン語', de: 'ドイツ語', fr: 'フランス語' };
                        const langLabel = langLabelMap[k] || k;
                        let word = pkmnData.motifReading[k];
                        let baseMotif = pkmnData.motif || '';
                        let originalWord = originalMap[k] || '';

                        let idx = 0;
                        if (word.includes('/')) {
                            const parts = word.split('/');
                            idx = Math.floor(Math.random() * parts.length);
                            word = parts[idx];
                            
                            const motifParts = baseMotif.split('/');
                            baseMotif = motifParts[idx] || motifParts[0];

                            const origParts = originalWord.split('/');
                            originalWord = origParts[idx] || origParts[0];
                        }
                        word = word.replace(/（.*?）/g, '').replace(/メガ・/, '');
                        if (word.length > targetLength && !isAssociationMode) {
                            word = truncateToNatural(word, targetLength);
                        }
                        let subtitle = `${originalWord} （モチーフ「${baseMotif}」の${langLabel}訳）`;
                        if (word) addResult(word, 'つながる外国語', subtitle);
                    }
                }

                // --- C. タグ（イメージから）: 90%の確率で試行（タグが複数ある場合は2つまで） ---
                if ((isAssociationMode || Math.random() < 0.9) && pkmnData.tags && pkmnData.tags.length > 0) {
                    // タグをシャッフルして最大2つを試みる
                    const shuffledTags = [...pkmnData.tags].sort(() => 0.5 - Math.random());
                    const tagTrials = isAssociationMode ? shuffledTags.length : Math.min(2, shuffledTags.length);
                    for (let ti = 0; ti < tagTrials; ti++) {
                        const t = shuffledTags[ti];
                        let pool = [];
                        if (tagWords && tagWords[t]) pool = pool.concat(tagWords[t]);
                        if (typeof extendedTagWords !== 'undefined' && extendedTagWords[t]) pool = pool.concat(extendedTagWords[t]);
                        if (pool.length > 0) {
                            const tagWord = pool[Math.floor(Math.random() * pool.length)];
                            addResult(tagWord, 'イメージから', t);
                        }
                    }
                }

                // --- D. 特性（とくせいから）: 70%の確率で試行 ---
                if ((isAssociationMode || Math.random() < 0.7)) {
                    // 使える特性をリストアップ（空でないもの）
                    const abilities = [pkmnData.ability1, pkmnData.ability2, pkmnData.hiddenAbility]
                        .filter(a => a && a.trim() !== '');
                    if (abilities.length > 0) {
                        const chosenAbility = abilities[Math.floor(Math.random() * abilities.length)];
                        // 特性名をそのまま、または文字数に合わせてカット
                        let word = chosenAbility;
                        if (word.length > targetLength && !isAssociationMode) {
                            word = truncateToNatural(word, targetLength);
                        }
                        if (word) addResult(word, 'とくせいから', chosenAbility);
                    }
                }
            }
        }

        // 2. Type based
        if (selectedTypes.size > 0 && (isAssociationMode || Math.random() < 0.4)) {
            const typesArr = Array.from(selectedTypes);
            const chosenType = typesArr[Math.floor(Math.random() * typesArr.length)];
            if (typeWords[chosenType]) {
                const arr = typeWords[chosenType];
                const word = arr[Math.floor(Math.random() * arr.length)];
                addResult(word, 'タイプつながり');
            }
        }

        // 3. Theme based（テーマ選択中は複数回試行して多く出す）
        if (selectedThemes.size > 0 && !selectedThemes.has('random')) {
            const themesArr = Array.from(selectedThemes);
            // テーマ選択中は1ループで2回試みる（異なるテーマから）
            const trialCount = themesArr.length > 1 ? 2 : 2;
            for (let ti = 0; ti < trialCount; ti++) {
                const theme = themesArr[Math.floor(Math.random() * themesArr.length)];
                if (themes[theme]) {
                    const arr = themes[theme];
                    const word = arr[Math.floor(Math.random() * arr.length)];
                    addResult(word, 'テーマから');
                }
            }
        }

        // 4. Foreign Language
        // 洋風テーマ選択中は外国語をより多く試行
        const foreignChance = (!selectedThemes.has('random') && selectedThemes.has('western')) ? 0.6 : 0.35;
        if (Math.random() < foreignChance) {
            const langs = Object.keys(foreign);
            const lang = langs[Math.floor(Math.random() * langs.length)];
            const arr = foreign[lang];
            let word = arr[Math.floor(Math.random() * arr.length)];
            
            if (word.length > targetLength && !isAssociationMode) {
                word = truncateToNatural(word, targetLength);
            }
            
            // simplistic kana conversion or just use romaji/english
            addResult(word, '外国語');
        }

        // 5. Affixes
        if (Math.random() < 0.3) {
            // try to take a random word and add affix
            let base = "";
            if (basePokemon) {
                base = basePokemon.substring(0, 2);
            } else if (selectedTypes.size > 0) {
                const typesArr = Array.from(selectedTypes);
                const chosenType = typesArr[Math.floor(Math.random() * typesArr.length)];
                if (typeWords[chosenType]) {
                    const arr = typeWords[chosenType];
                    base = arr[Math.floor(Math.random() * arr.length)].substring(0, 2);
                } else {
                    base = "モン";
                }
            } else {
                base = "モン";
            }
            
            if (Math.random() > 0.5) {
                const prefix = affixes.prefixes[Math.floor(Math.random() * affixes.prefixes.length)];
                addResult(prefix + base, 'まえにプラス');
            } else {
                const suffix = affixes.suffixes[Math.floor(Math.random() * affixes.suffixes.length)];
                addResult(base + suffix, 'うしろにプラス');
            }
        }

        // 6. Random completely
        if (selectedThemes.has('random') || selectedThemes.has('gibberish') || Math.random() < 0.2) {
            const kana = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ";
            const hiragana = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";
            const chars = Math.random() < 0.5 ? kana : hiragana;
            let len = targetLength;
            let res = "";
            let dakuonCount = 0;
            for(let i=0; i<len; i++) {
                let char = chars[Math.floor(Math.random() * chars.length)];
                if (i===0 && (char==='ン' || char==='ん')) char = chars[0];
                if ("ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ".includes(char)) {
                    dakuonCount++;
                    if (dakuonCount > 3) char = chars[0];
                }
                res += char;
            }
            addResult(res, 'ランダム');
        }

        // 7. Combination（ことばをミックス）
        if (targetLength >= 4 && Math.random() < 0.4) {
            let len1, len2;
            if (targetLength === 4) {
                len1 = 2; len2 = 2;
            } else if (targetLength === 5) {
                len1 = Math.random() < 0.5 ? 2 : 3;
                len2 = targetLength - len1;
            } else if (targetLength === 6) {
                const splits = [[2,4], [3,3], [4,2]];
                const s = splits[Math.floor(Math.random() * splits.length)];
                len1 = s[0]; len2 = s[1];
            } else {
                len1 = 0; len2 = 0;
            }

            if (len1 > 0 && len2 > 0) {
                const w1 = getWordOfLength(len1);
                const w2 = getWordOfLength(len2);
                if (w1 && w2) {
                    addResult(w1 + w2, 'ことばをミックス', `${w1} + ${w2}`);
                }
            }
        }

        // 8. 和風スタイル（ポケモン名・タイプ・タグから和風ニックネームを生成）
        if (Math.random() < 0.6) {
            // 和風サフィックス（名前の末尾に付ける）
            const wafuSuffixes = [
                'まる', 'ひめ', 'おう', 'かぜ', 'のみ', 'つき', 'ほし', 'やみ',
                'かみ', 'おに', 'りゅう', 'きし', 'のすけ', 'たろう', 'ざぶろ',
                'すけ', 'ぼう', 'にゃん', 'ぽん', 'ちゃん', 'くん', 'べえ',
                'のぬし', 'ざん', 'まる'
            ];
            // 和風プレフィックス（名前の先頭に付ける）
            const wafuPrefixes = [
                'おお', 'こ', 'しろ', 'くろ', 'あか', 'あお', 'きん', 'ぎん',
                'ほのお', 'みず', 'かみ', 'やみ', 'ひ', 'かぜ', 'つき', 'たい'
            ];

            // ベースとなる言葉を選ぶ
            let wafuBase = '';
            if (basePokemon && Math.random() < 0.7) {
                // ポケモン名の最初の2〜3文字（自然な区切りで）
                const cleanName = basePokemon.replace(/（.*?）/g, '').replace(/メガ/g, '');
                const baseLen = Math.random() < 0.5 ? 2 : 3;
                wafuBase = truncateToNatural(cleanName, Math.min(baseLen, cleanName.length));
            } else if (selectedTypes.size > 0) {
                // タイプ名の一部
                const typesArr = Array.from(selectedTypes);
                const chosenType = typesArr[Math.floor(Math.random() * typesArr.length)];
                const typeLabel = TYPE_LABELS[chosenType] || '';
                wafuBase = typeLabel.length > 2 ? typeLabel.substring(0, 2) : typeLabel;
            } else {
                // 汎用的な和語ベース
                const generalBases = [
                    'はな', 'やま', 'うみ', 'かわ', 'そら', 'ほし', 'つき', 'かぜ',
                    'ゆき', 'あめ', 'ひ', 'くも', 'もり', 'いわ', 'つち', 'みず'
                ];
                wafuBase = generalBases[Math.floor(Math.random() * generalBases.length)];
            }

            if (wafuBase) {
                // サフィックス or プレフィックスを付ける（50:50）
                let wafuName = '';
                if (Math.random() < 0.6) {
                    // サフィックス型: ベース + サフィックス
                    const suffix = wafuSuffixes[Math.floor(Math.random() * wafuSuffixes.length)];
                    wafuName = wafuBase + suffix;
                } else {
                    // プレフィックス型: プレフィックス + ベース
                    const prefix = wafuPrefixes[Math.floor(Math.random() * wafuPrefixes.length)];
                    wafuName = prefix + wafuBase;
                }

                // 長さ調整
                if (wafuName.length > targetLength && !isAssociationMode) {
                    wafuName = truncateToNatural(wafuName, targetLength);
                }
                addResult(wafuName, '和風スタイル', wafuBase + 'ベース');
            }
        }
    }

    // ランダムな順番で表示（シャッフル）
    for (let i = resultDetails.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resultDetails[i], resultDetails[j]] = [resultDetails[j], resultDetails[i]];
    }
    const finalResults = resultDetails.slice(0, 10);

    renderResults(finalResults);
}

// --- Render Results ---
function renderResults(details) {
    resultsGrid.innerHTML = '';
    
    if (details.length === 0) {
        resultsGrid.innerHTML = `
            <div class="empty-state">
                <span class="material-icons-round huge-icon">sentiment_dissatisfied</span>
                <p>条件が厳しすぎます。<br>文字数やテーマを変えてみてください。</p>
            </div>
        `;
        return;
    }

    details.forEach((d, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        card.innerHTML = `
            <span class="method-tag">${d.method}</span>
            <div class="nickname-display">${d.name}</div>
            ${d.subtitle ? `
            <div class="origin-info">
                <span class="origin-label">発想・由来</span>
                <span class="origin-val">${d.subtitle}</span>
            </div>
            ` : ''}
            <div class="card-actions">
                <button class="action-btn copy-btn" data-name="${d.name}">
                    <span class="material-icons-round">content_copy</span>
                    コピー
                </button>
                <button class="action-btn anagram-btn" title="文字をシャッフル">
                    <span class="material-icons-round">shuffle</span>
                    シャッフル
                </button>
                <button class="action-btn revert-btn hidden" data-original="${d.name}" title="元に戻す">
                    <span class="material-icons-round">undo</span>
                    戻す
                </button>
            </div>
        `;

        // Copy event
        card.querySelector('.copy-btn').addEventListener('click', (e) => {
            navigator.clipboard.writeText(d.name).then(() => {
                showToast(`「${d.name}」をコピーしました！`);
            });
        });

        // Anagram & Revert events
        const displayEl = card.querySelector('.nickname-display');
        const copyBtn = card.querySelector('.copy-btn');
        const anagramBtn = card.querySelector('.anagram-btn');
        const revertBtn = card.querySelector('.revert-btn');

        anagramBtn.addEventListener('click', () => {
            const currentName = displayEl.textContent;
            let shuffled = currentName.split('').sort(() => 0.5 - Math.random()).join('');
            
            let tries = 0;
            while(shuffled === currentName && tries < 5) {
                 shuffled = currentName.split('').sort(() => 0.5 - Math.random()).join('');
                 tries++;
            }
            
            displayEl.textContent = shuffled;
            copyBtn.dataset.name = shuffled;
            
            revertBtn.classList.remove('hidden');
        });

        revertBtn.addEventListener('click', () => {
            const originalName = revertBtn.dataset.original;
            
            displayEl.textContent = originalName;
            copyBtn.dataset.name = originalName;
            
            revertBtn.classList.add('hidden');
        });

        resultsGrid.appendChild(card);
    });
}



// --- Utils ---
function toKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, function(match) {
        const chr = match.charCodeAt(0) + 0x60;
        return String.fromCharCode(chr);
    });
}

let toastTimeout;
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Start
init();
