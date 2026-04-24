import { themes, types as typeWords, affixes, foreign, tagWords } from './data.js';
import { pokemonList } from './data_pokemon.js';
import { generalWords, extendedTagWords } from './data_words.js';

// --- State ---
let selectedThemes = new Set(['random']);
let selectedTypes = new Set();


// --- DOM Elements ---
const typeGrid = document.getElementById('type-grid');
const themeTags = document.getElementById('theme-tags');
const pokemonInput = document.getElementById('pokemon-input');
const suggestionsList = document.getElementById('suggestions-list');
const lengthSlider = document.getElementById('length-slider');
const lengthVal = document.getElementById('length-val');
const generateBtn = document.getElementById('generate-btn');
const regenerateBtn = document.getElementById('regenerate-btn');
const resultsGrid = document.getElementById('results-grid');
const toast = document.getElementById('toast');
const associationToggle = document.getElementById('association-toggle');

// --- Initialization ---
function init() {
    renderTypes();
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

function renderTypes() {
    for (const [key, label] of Object.entries(TYPE_LABELS)) {
        const btn = document.createElement('button');
        btn.className = 'type-btn';
        btn.textContent = label;
        btn.dataset.type = key;
        btn.style.backgroundColor = TYPE_COLORS[key];
        
        btn.addEventListener('click', () => {
            if (selectedTypes.has(key)) {
                selectedTypes.delete(key);
                btn.classList.remove('active');
            } else {
                if (selectedTypes.size >= 2) {
                    const first = selectedTypes.values().next().value;
                    selectedTypes.delete(first);
                    document.querySelector(`.type-btn[data-type="${first}"]`).classList.remove('active');
                }
                selectedTypes.add(key);
                btn.classList.add('active');
            }
        });
        typeGrid.appendChild(btn);
    }
}

// --- Event Listeners ---
function setupEventListeners() {
    // Slider
    lengthSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        lengthVal.textContent = `${val}文字`;
    });

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
                    // Automatically select type if matched
                    const pType1Label = p.type1;
                    const pType2Label = p.type2;
                    
                    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                    selectedTypes.clear();

                    const type1Key = Object.keys(TYPE_LABELS).find(k => TYPE_LABELS[k] === pType1Label);
                    if (type1Key) {
                        selectedTypes.add(type1Key);
                        document.querySelector(`[data-type="${type1Key}"]`).classList.add('active');
                    }
                    if (pType2Label) {
                        const type2Key = Object.keys(TYPE_LABELS).find(k => TYPE_LABELS[k] === pType2Label);
                        if (type2Key) {
                            selectedTypes.add(type2Key);
                            document.querySelector(`[data-type="${type2Key}"]`).classList.add('active');
                        }
                    }
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

    // Mode Toggle
    associationToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            generateBtn.classList.add('association-mode');
            generateBtn.innerHTML = 'インスピレーションを得る';
        } else {
            generateBtn.classList.remove('association-mode');
            generateBtn.textContent = 'ニックネームを作成！';
        }
    });
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
    const targetLength = parseInt(lengthSlider.value);
    const basePokemon = pokemonInput.value.trim();
    const isAssociationMode = associationToggle.checked;
    
    let results = new Set();
    const resultDetails = [];

    // --- Prepare pool for Combinations ---
    const wordsByLength = {2: [], 3: [], 4: [], 5: [], 6: []};
    const addWordsToPool = (arr) => {
        arr.forEach(w => {
            if (!w) return;
            const cleanWord = w.replace(/・/g, '').replace(/（.*?）/g, '');
            const clen = cleanWord.length;
            if (clen >= 2 && clen <= 6) {
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
        name = isAssociationMode ? name : name.replace(/・/g, '');

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
        if (method === 'ランダム' || method === 'アナグラム') {
            limit = specialMethodLimit;
        }
        if ((methodCounts[method] || 0) >= limit) return;

        const isAlphabet = /^[a-zA-Z\s\-\ä\ö\ü\ß\é\è\ê\ë\à\â\ç\î\ï\ô\ù\û]+$/i.test(name);
        if (isAlphabet) {
            if (alphabetCount >= 1) return;
        }

        if (!results.has(name) && results.size < 16) {
            results.add(name);
            
            // 優先度の計算
            let priority = 10;
            if (method.includes('AI作成')) priority = 100;
            else if (['外国語名', '関連外国語', '特徴タグ'].includes(method)) priority = 90;
            else if (method === '言葉の組み合わせ') priority = 80;
            else if (['タイプ連想', 'テーマ'].includes(method)) priority = 70;
            else if (['まえにプラス', 'うしろにプラス'].includes(method)) priority = 60;
            else if (method === '外国語') priority = 50;
            else if (method === 'アナグラム') priority = 40;
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
        // 最初の試行では、AIニックネームがあれば必ず追加を試みる
        if (pkmn && pkmn.aiNicknames && (attempts === 1 || Math.random() < 0.6)) {
            const availableAiNames = [];
            const themesArr = Array.from(selectedThemes);
            
            themesArr.forEach(t => {
                    if (t === 'random') {
                        if (pkmn.aiNicknames.general) availableAiNames.push(...pkmn.aiNicknames.general.map(n => ({name: n, method: 'AI作成(おまかせ)'})));
                    } else if (pkmn.aiNicknames[t]) {
                        let methodLabel = 'AI作成';
                        if (t === 'cool') methodLabel = 'AI作成(かっこいい)';
                        if (t === 'cute') methodLabel = 'AI作成(かわいい)';
                        if (t === 'japanese') methodLabel = 'AI作成(和風)';
                        if (t === 'western') methodLabel = 'AI作成(洋風)';
                        if (t === 'unique') methodLabel = 'AI作成(ネタ)';
                        availableAiNames.push(...pkmn.aiNicknames[t].map(n => ({name: n, method: methodLabel})));
                    }
                });

                if (availableAiNames.length > 0) {
                    const choice = availableAiNames[Math.floor(Math.random() * availableAiNames.length)];
                    // ignoreLength を true にして長さを無視して表示する
                    addResult(choice.name, choice.method, 'AI厳選', true);
                }
            }

        // 1. Anagram if base pokemon exists
        if (basePokemon && Math.random() < 0.2) {
            const shuffled = basePokemon.split('').sort(() => 0.5 - Math.random()).join('');
            if (shuffled !== basePokemon) addResult(shuffled, 'アナグラム');
        }

        // 1.5. Specific Pokemon Data (Foreign names, Motifs, Tags)
        if (basePokemon && (isAssociationMode || Math.random() < 0.5)) {
            const pkmn = pokemonList.find(p => p.name === basePokemon);
            if (pkmn) {
                const specificMethods = [];
                // Add name readings
                if (pkmn.nameReading) {
                    const keys = Object.keys(pkmn.nameReading);
                    if (keys.length > 0) {
                        const k = keys[Math.floor(Math.random() * keys.length)];
                        const originalMap = { en: pkmn.nameEn, la: pkmn.nameLa, de: pkmn.nameDe, fr: pkmn.nameFr };
                        const originalWord = originalMap[k] || '';
                        const translation = pkmn.name || '';
                        specificMethods.push({ 
                            word: pkmn.nameReading[k], 
                            method: '外国語名',
                            subtitle: `${originalWord} (${translation})`
                        });
                    }
                }
                // Add motif readings
                if (pkmn.motifReading) {
                    const keys = Object.keys(pkmn.motifReading);
                    if (keys.length > 0) {
                        const k = keys[Math.floor(Math.random() * keys.length)];
                        const originalMap = { en: pkmn.motifEn, la: pkmn.motifLa, de: pkmn.motifDe, fr: pkmn.motifFr };
                        const originalWord = originalMap[k] || '';
                        const translation = pkmn.motif || '';
                        specificMethods.push({ 
                            word: pkmn.motifReading[k], 
                            method: '関連外国語',
                            subtitle: `${originalWord} (${translation})`
                        });
                    }
                }
                // Add tags
                if (pkmn.tags && pkmn.tags.length > 0) {
                    const t = pkmn.tags[Math.floor(Math.random() * pkmn.tags.length)];
                    let pool = [];
                    if (tagWords && tagWords[t]) pool = pool.concat(tagWords[t]);
                    if (typeof extendedTagWords !== 'undefined' && extendedTagWords[t]) pool = pool.concat(extendedTagWords[t]);
                    
                    if (pool.length > 0) {
                        const tagWord = pool[Math.floor(Math.random() * pool.length)];
                        specificMethods.push({ word: tagWord, method: '特徴タグ', subtitle: t });
                    }
                }

                if (specificMethods.length > 0) {
                    const choice = specificMethods[Math.floor(Math.random() * specificMethods.length)];
                    let word = choice.word;
                    let subtitle = choice.subtitle;
                    // Handle slash separated values like "トード/ラフレシア"
                    if (word.includes('/')) {
                        const parts = word.split('/');
                        const idx = Math.floor(Math.random() * parts.length);
                        word = parts[idx];
                        
                        if (subtitle) {
                            const match = subtitle.match(/^(.*?)\s*\((.*?)\)$/);
                            if (match) {
                                const origParts = match[1].split('/');
                                const transParts = match[2].split('/');
                                const orig = origParts[idx] || origParts[0];
                                const trans = transParts[idx] || transParts[0];
                                subtitle = `${orig} (${trans})`;
                            } else {
                                const origParts = subtitle.split('/');
                                subtitle = origParts[idx] || origParts[0];
                            }
                        }
                    }
                    // Extract just the base if it has prefixes like "（アローラフォーム）"
                    word = word.replace(/（.*?）/g, '').replace(/メガ・/, '');
                    
                    if (word.length > targetLength && !isAssociationMode) {
                        word = truncateToNatural(word, targetLength);
                    }
                    
                    addResult(word, choice.method, subtitle);
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
                addResult(word, 'タイプ連想');
            }
        }

        // 3. Theme based
        if (selectedThemes.size > 0 && !selectedThemes.has('random')) {
            const themesArr = Array.from(selectedThemes);
            const theme = themesArr[Math.floor(Math.random() * themesArr.length)];
            if (themes[theme]) {
                const arr = themes[theme];
                const word = arr[Math.floor(Math.random() * arr.length)];
                addResult(word, 'テーマ');
            }
        }

        // 4. Foreign Language
        if (Math.random() < 0.2) {
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

        // 7. Combination
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
                    addResult(w1 + w2, '言葉の組み合わせ', `${w1} + ${w2}`);
                }
            }
        }
    }

    // 優先度順にソートして、上位8件を抽出
    resultDetails.sort((a, b) => b.priority - a.priority);
    const finalResults = resultDetails.slice(0, 8);

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
            ${d.subtitle ? `<div class="nickname-subtitle" style="font-size: 0.8rem; color: #666; margin-top: -10px; margin-bottom: 10px; text-align: center;">${d.subtitle}</div>` : ''}
            <div class="card-actions">
                <button class="action-btn copy-btn" data-name="${d.name}">
                    <span class="material-icons-round">content_copy</span>
                    コピー
                </button>
                <button class="action-btn anagram-btn" title="アナグラム">
                    <span class="material-icons-round">shuffle</span>
                    アナグラム
                </button>
                <button class="action-btn revert-btn hidden" data-original="${d.name}" title="元に戻す">
                    <span class="material-icons-round">undo</span>
                    元に戻す
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
