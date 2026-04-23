import { pokemonList, themes, types as typeWords, affixes, foreign } from './data.js';

// --- State ---
let selectedThemes = new Set(['random']);
let selectedType = null;
let favorites = JSON.parse(localStorage.getItem('pokemonNicknames_favs')) || [];

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
const favoritesBtn = document.getElementById('favorites-btn');
const favoritesCount = document.getElementById('favorites-count');
const favoritesModal = document.getElementById('favorites-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalOverlay = document.querySelector('.modal-overlay');
const favoritesList = document.getElementById('favorites-list');
const clearFavoritesBtn = document.getElementById('clear-favorites-btn');
const toast = document.getElementById('toast');

// --- Initialization ---
function init() {
    renderTypes();
    updateFavoritesCount();
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
            if (selectedType === key) {
                selectedType = null;
                btn.classList.remove('active');
            } else {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                selectedType = key;
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
        lengthVal.textContent = val === 6 ? '制限なし' : `${val}文字`;
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
        
        const matches = pokemonList.filter(p => p.name.includes(val)).slice(0, 5);
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
                    const typeKey = Object.keys(TYPE_LABELS).find(k => TYPE_LABELS[k] === pType1Label);
                    if (typeKey) {
                        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                        selectedType = typeKey;
                        document.querySelector(`[data-type="${typeKey}"]`).classList.add('active');
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

    // Favorites
    favoritesBtn.addEventListener('click', showFavorites);
    closeModalBtn.addEventListener('click', hideFavorites);
    modalOverlay.addEventListener('click', hideFavorites);
    clearFavoritesBtn.addEventListener('click', () => {
        if(confirm('すべてのお気に入りを削除しますか？')) {
            favorites = [];
            saveFavorites();
            renderFavorites();
        }
    });
}

// --- Generation Logic ---
function generateNicknames() {
    const targetLength = parseInt(lengthSlider.value);
    const limitLength = targetLength === 6 ? 99 : targetLength;
    const basePokemon = pokemonInput.value.trim();
    
    let results = new Set();
    const resultDetails = [];

    const addResult = (name, method) => {
        // filter by length rules
        if (name.length < 1) return;
        if (targetLength !== 6 && name.length !== targetLength) return;
        if (targetLength === 6 && name.length > 6) return; // Rom limit is 6 for JPN usually, but we allow 6 = any (up to 6)
        
        // Custom rules
        if (name.startsWith('ん')) return;
        if (name.includes('んん')) return;
        if (/(?<char>.)\k<char>\k<char>/.test(name)) return; // 3 same chars

        if (!results.has(name) && results.size < 8) {
            results.add(name);
            resultDetails.push({ name, method });
        }
    };

    let attempts = 0;
    while(results.size < 8 && attempts < 100) {
        attempts++;
        
        // 1. Anagram if base pokemon exists
        if (basePokemon && Math.random() < 0.3) {
            const shuffled = basePokemon.split('').sort(() => 0.5 - Math.random()).join('');
            if (shuffled !== basePokemon) addResult(shuffled, 'アナグラム');
        }

        // 2. Type based
        if (selectedType && typeWords[selectedType] && Math.random() < 0.4) {
            const arr = typeWords[selectedType];
            const word = arr[Math.floor(Math.random() * arr.length)];
            addResult(word, 'タイプ連想');
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
            const word = arr[Math.floor(Math.random() * arr.length)];
            // simplistic kana conversion or just use romaji/english
            addResult(word, '外国語');
        }

        // 5. Affixes
        if (Math.random() < 0.3) {
            // try to take a random word and add affix
            let base = "";
            if (basePokemon) {
                base = basePokemon.substring(0, 2);
            } else if (selectedType && typeWords[selectedType]) {
                const arr = typeWords[selectedType];
                base = arr[Math.floor(Math.random() * arr.length)].substring(0, 2);
            } else {
                base = "モン";
            }
            
            if (Math.random() > 0.5) {
                const prefix = affixes.prefixes[Math.floor(Math.random() * affixes.prefixes.length)];
                addResult(prefix + base, '接頭辞');
            } else {
                const suffix = affixes.suffixes[Math.floor(Math.random() * affixes.suffixes.length)];
                addResult(base + suffix, '接尾辞');
            }
        }

        // 6. Random completely
        if (selectedThemes.has('random') || Math.random() < 0.2) {
            const kana = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ";
            let len = targetLength === 6 ? Math.floor(Math.random() * 3) + 3 : targetLength;
            let res = "";
            let dakuonCount = 0;
            for(let i=0; i<len; i++) {
                let char = kana[Math.floor(Math.random() * kana.length)];
                if (i===0 && char==='ン') char = 'ア';
                if ("ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ".includes(char)) {
                    dakuonCount++;
                    if (dakuonCount > 3) char = 'ア';
                }
                res += char;
            }
            addResult(res, 'ランダム');
        }
    }

    renderResults(resultDetails);
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
        const isFav = favorites.includes(d.name);
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        card.innerHTML = `
            <span class="method-tag">${d.method}</span>
            <div class="nickname-display">${d.name}</div>
            <div class="card-actions">
                <button class="action-btn copy-btn" data-name="${d.name}">
                    <span class="material-icons-round">content_copy</span>
                    コピー
                </button>
                <button class="action-btn fav-btn ${isFav ? 'active' : ''}" data-name="${d.name}">
                    <span class="material-icons-round">${isFav ? 'favorite' : 'favorite_border'}</span>
                    お気に入り
                </button>
            </div>
        `;

        // Copy event
        card.querySelector('.copy-btn').addEventListener('click', (e) => {
            navigator.clipboard.writeText(d.name).then(() => {
                showToast(`「${d.name}」をコピーしました！`);
            });
        });

        // Fav event
        card.querySelector('.fav-btn').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const name = btn.dataset.name;
            if (favorites.includes(name)) {
                favorites = favorites.filter(f => f !== name);
                btn.classList.remove('active');
                btn.querySelector('.material-icons-round').textContent = 'favorite_border';
            } else {
                favorites.push(name);
                btn.classList.add('active');
                btn.querySelector('.material-icons-round').textContent = 'favorite';
                showToast(`「${name}」をお気に入りに追加しました！`);
            }
            saveFavorites();
        });

        resultsGrid.appendChild(card);
    });
}

// --- Favorites ---
function saveFavorites() {
    localStorage.setItem('pokemonNicknames_favs', JSON.stringify(favorites));
    updateFavoritesCount();
}

function updateFavoritesCount() {
    favoritesCount.textContent = favorites.length;
}

function showFavorites() {
    renderFavorites();
    favoritesModal.classList.remove('hidden');
}

function hideFavorites() {
    favoritesModal.classList.add('hidden');
    // update grid in case favs were removed
    document.querySelectorAll('.fav-btn').forEach(btn => {
        const name = btn.dataset.name;
        if (favorites.includes(name)) {
            btn.classList.add('active');
            btn.querySelector('.material-icons-round').textContent = 'favorite';
        } else {
            btn.classList.remove('active');
            btn.querySelector('.material-icons-round').textContent = 'favorite_border';
        }
    });
}

function renderFavorites() {
    favoritesList.innerHTML = '';
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="text-align:center; color:#7f8c8d;">お気に入りはまだありません。</p>';
        return;
    }

    favorites.forEach(name => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
            <span class="fav-name">${name}</span>
            <div style="display:flex; gap: 0.5rem;">
                <button class="icon-btn dark copy-btn" data-name="${name}">
                    <span class="material-icons-round" style="font-size: 1rem;">content_copy</span>
                </button>
                <button class="icon-btn dark delete-btn" data-name="${name}">
                    <span class="material-icons-round" style="font-size: 1rem; color: #ef5350;">delete</span>
                </button>
            </div>
        `;

        item.querySelector('.copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(name).then(() => {
                showToast(`「${name}」をコピーしました！`);
            });
        });

        item.querySelector('.delete-btn').addEventListener('click', () => {
            favorites = favorites.filter(f => f !== name);
            saveFavorites();
            renderFavorites();
        });

        favoritesList.appendChild(item);
    });
}

// --- Utils ---
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
