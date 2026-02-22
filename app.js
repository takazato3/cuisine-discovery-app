'use strict';

// ============================================================
// Area Definitions
// ============================================================
const AREAS = {
  'tokyo-23': {
    name: '東京23区',
    lat: 35.6762,
    lng: 139.6503,
    radius: 15000,
  },
  'tokyo-outside': {
    name: '東京（23区外）',
    lat: 35.7141,
    lng: 139.3627,
    radius: 20000,
  },
  'yokohama-kawasaki': {
    name: '横浜・川崎',
    lat: 35.4437,
    lng: 139.6380,
    radius: 15000,
  },
  'kanagawa-other': {
    name: '神奈川（横浜・川崎以外）',
    lat: 35.3387,
    lng: 139.2779,
    radius: 25000,
  },
};

// ============================================================
// Cuisine Data
// counts per area are updated weekly by GitHub Actions (update-counts.js)
// ============================================================
const CUISINES = [
  { id: 'thai',           flagCode: 'th',         name: 'タイ料理',           counts: { 'tokyo-23': '60+', 'tokyo-outside': '60+', 'yokohama-kawasaki': '60+', 'kanagawa-other': '26' }, lastUpdated: '2026-02-21', query: 'thai restaurant',                                                   menuItems: ['トムヤムクン', 'ガパオライス', 'パッタイ'] },
  { id: 'vietnamese',     flagCode: 'vn',         name: 'ベトナム料理',       counts: { 'tokyo-23': '60+', 'tokyo-outside': '32', 'yokohama-kawasaki': '60+', 'kanagawa-other': '17' }, lastUpdated: '2026-02-21', query: 'vietnamese restaurant',                                             menuItems: ['フォー', 'バインミー', '生春巻き'] },
  { id: 'korean',         flagCode: 'kr',         name: '韓国料理',           counts: { 'tokyo-23': '60+', 'tokyo-outside': '60+', 'yokohama-kawasaki': '60+', 'kanagawa-other': '39' }, lastUpdated: '2026-02-21', query: 'korean restaurant',                                                 menuItems: ['サムギョプサル', 'ビビンバ', 'チヂミ'] },
  { id: 'indian-nepali',  flagCode: 'in',         name: 'インド・ネパール料理', counts: { 'tokyo-23': '60+', 'tokyo-outside': '45', 'yokohama-kawasaki': '60+', 'kanagawa-other': '24' }, lastUpdated: '2026-02-21', query: 'indian restaurant OR nepali restaurant',                           menuItems: ['バターチキンカレー', 'ナン', 'モモ'] },
  { id: 'south-indian',   flagCode: 'in',         name: '南インド料理',       counts: { 'tokyo-23': '20', 'tokyo-outside': '5',  'yokohama-kawasaki': '8',  'kanagawa-other': '2'  }, lastUpdated: '2026-02-21', query: 'south indian restaurant OR ミールス OR ドーサ',                      menuItems: ['ミールス', 'ドーサ', 'イドゥリ'] },
  { id: 'machi-chuka',    flagCode: 'cn',         name: '町中華',             counts: { 'tokyo-23': '60+', 'tokyo-outside': '60+', 'yokohama-kawasaki': '60+', 'kanagawa-other': '60+' }, lastUpdated: '2026-02-21', query: '中華料理 OR ラーメン OR 餃子',                                       menuItems: ['ラーメン', 'チャーハン', '餃子'] },
  { id: 'honkaku-chuka',  flagCode: 'cn',         name: '本格中華',           counts: { 'tokyo-23': '60+', 'tokyo-outside': '40', 'yokohama-kawasaki': '50', 'kanagawa-other': '20' }, lastUpdated: '2026-02-21', query: '本格中華 OR 四川料理 OR 広東料理 OR 上海料理',                         menuItems: ['麻婆豆腐', '小籠包', '北京ダック'] },
  { id: 'taiwanese',      flagCode: 'tw',         name: '台湾料理',           counts: { 'tokyo-23': '60+', 'tokyo-outside': '20', 'yokohama-kawasaki': '30', 'kanagawa-other': '10' }, lastUpdated: '2026-02-21', query: '台湾料理 OR 魯肉飯',                                                  menuItems: ['魯肉飯', '小籠包', 'タピオカティー'] },
  { id: 'mexican',        flagCode: 'mx',         name: 'メキシコ料理',       counts: { 'tokyo-23': '60+', 'tokyo-outside': '15', 'yokohama-kawasaki': '24', 'kanagawa-other': '8'  }, lastUpdated: '2026-02-21', query: 'mexican restaurant',                                                 menuItems: ['タコス', 'ブリトー', 'ナチョス'] },
  { id: 'italian',        flagCode: 'it',         name: 'イタリア料理',       counts: { 'tokyo-23': '60+', 'tokyo-outside': '60+', 'yokohama-kawasaki': '60+', 'kanagawa-other': '49' }, lastUpdated: '2026-02-21', query: 'italian restaurant',                                                menuItems: ['マルゲリータ', 'カルボナーラ', 'ティラミス'] },
  { id: 'french',         flagCode: 'fr',         name: 'フランス料理',       counts: { 'tokyo-23': '60+', 'tokyo-outside': '42', 'yokohama-kawasaki': '60+', 'kanagawa-other': '22' }, lastUpdated: '2026-02-21', query: 'french restaurant',                                                  menuItems: ['キッシュ', 'ラタトゥイユ', 'ガレット'] },
  { id: 'greek',          flagCode: 'gr',         name: 'ギリシャ料理',       counts: { 'tokyo-23': '60+', 'tokyo-outside': '8',  'yokohama-kawasaki': '14', 'kanagawa-other': '4'  }, lastUpdated: '2026-02-21', query: 'greek restaurant',                                                   menuItems: ['ムサカ', 'スブラキ', 'ギリシャサラダ'] },
  { id: 'middle-eastern', flagCode: 'middleeast', name: '中東料理',           counts: { 'tokyo-23': '60+', 'tokyo-outside': '15', 'yokohama-kawasaki': '20', 'kanagawa-other': '7'  }, lastUpdated: '2026-02-21', query: 'middle eastern restaurant OR lebanese restaurant',                   menuItems: ['フムス', 'ファラフェル', 'シャワルマ'] },
  { id: 'peruvian',       flagCode: 'pe',         name: 'ペルー料理',         counts: { 'tokyo-23': '60+', 'tokyo-outside': '6',  'yokohama-kawasaki': '10', 'kanagawa-other': '3'  }, lastUpdated: '2026-02-21', query: 'peruvian restaurant',                                                menuItems: ['セビーチェ', 'ロモサルタード', 'アンティクーチョ'] },
  { id: 'turkish',        flagCode: 'tr',         name: 'トルコ料理',         counts: { 'tokyo-23': '60+', 'tokyo-outside': '13', 'yokohama-kawasaki': '22', 'kanagawa-other': '7'  }, lastUpdated: '2026-02-21', query: 'turkish restaurant',                                                 menuItems: ['ケバブ', 'バクラヴァ', 'メゼ'] },
  { id: 'spanish',        flagCode: 'es',         name: 'スペイン料理',       counts: { 'tokyo-23': '60+', 'tokyo-outside': '21', 'yokohama-kawasaki': '36', 'kanagawa-other': '11' }, lastUpdated: '2026-02-21', query: 'spanish restaurant',                                                 menuItems: ['パエリア', 'タパス', 'ガスパチョ'] },
  { id: 'brazilian',      flagCode: 'br',         name: 'ブラジル料理',       counts: { 'tokyo-23': '60+', 'tokyo-outside': '9',  'yokohama-kawasaki': '16', 'kanagawa-other': '5'  }, lastUpdated: '2026-02-21', query: 'brazilian restaurant',                                               menuItems: ['シュラスコ', 'フェジョアーダ', 'ポンデケージョ'] },
  { id: 'african',        flagCode: 'africa',     name: 'アフリカ料理',         counts: { 'tokyo-23': '30', 'tokyo-outside': '5',  'yokohama-kawasaki': '8',  'kanagawa-other': '3'  }, lastUpdated: '2026-02-22', query: 'african restaurant OR ethiopian restaurant OR moroccan restaurant', menuItems: ['インジェラ', 'タジン', 'クスクス'] },
  { id: 'sri-lankan',    flagCode: 'lk',         name: 'スリランカ料理',       counts: { 'tokyo-23': '10', 'tokyo-outside': '3',  'yokohama-kawasaki': '5',  'kanagawa-other': '2'  }, lastUpdated: '2026-02-22', query: 'sri lankan restaurant',                                                   menuItems: ['カレー', 'ホッパー', 'コットゥ'] },
  { id: 'mongolian',     flagCode: 'mn',         name: 'モンゴル料理',         counts: { 'tokyo-23': '5',  'tokyo-outside': '2',  'yokohama-kawasaki': '3',  'kanagawa-other': '1'  }, lastUpdated: '2026-02-22', query: 'mongolian restaurant',                                                    menuItems: ['ホーショール', 'ボーズ', '羊肉'] },
  { id: 'singaporean',   flagCode: 'sg',         name: 'シンガポール料理',     counts: { 'tokyo-23': '20', 'tokyo-outside': '5',  'yokohama-kawasaki': '8',  'kanagawa-other': '3'  }, lastUpdated: '2026-02-22', query: 'singaporean restaurant',                                                  menuItems: ['チキンライス', 'ラクサ', 'バクテー'] },
  { id: 'uzbek',         flagCode: 'uz',         name: 'ウズベキスタン料理',   counts: { 'tokyo-23': '8',  'tokyo-outside': '2',  'yokohama-kawasaki': '3',  'kanagawa-other': '1'  }, lastUpdated: '2026-02-22', query: 'uzbek restaurant',                                                        menuItems: ['プロフ', 'シャシリク', 'サムサ'] },
  { id: 'british',       flagCode: 'gb',         name: 'イギリス料理',         counts: { 'tokyo-23': '15', 'tokyo-outside': '5',  'yokohama-kawasaki': '8',  'kanagawa-other': '3'  }, lastUpdated: '2026-02-22', query: 'british restaurant',                                                      menuItems: ['フィッシュ&チップス', 'ローストビーフ', 'スコーン'] },
];

// ============================================================
// Last updated date — rewritten weekly by update-counts.js
// ============================================================
const LAST_UPDATED = '2026-02-21';

// ============================================================
// Current area state
// ============================================================
let currentArea = 'tokyo-23';

// ============================================================
// Utility: flag display — emoji for special regions, img for countries
// ============================================================
function getFlagDisplay(flagCode, cuisineName) {
  if (flagCode === 'africa') {
    return '<span class="cuisine-flag cuisine-flag--emoji" aria-hidden="true">🌍</span>';
  }
  if (flagCode === 'middleeast') {
    return '<span class="cuisine-flag cuisine-flag--emoji" aria-hidden="true">🌐</span>';
  }
  return `<img src="https://flagcdn.com/w80/${flagCode}.png" alt="${cuisineName}の国旗" class="cuisine-flag">`;
}

// ============================================================
// Utility: format store count
// Accepts strings ('60+', '45') written by update-counts.js
// ============================================================
function formatCount(n) {
  if (typeof n === 'string') return n;
  return n.toLocaleString('ja-JP');
}

// ============================================================
// Utility: format ISO date (YYYY-MM-DD) to Japanese display
// ============================================================
function formatJapaneseDate(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${parseInt(y)}年${parseInt(m)}月${parseInt(d)}日`;
}

// ============================================================
// Render: build a single card element
// ============================================================
function createCuisineCard(cuisine) {
  const count = cuisine.counts[currentArea] ?? 0;
  const card = document.createElement('a');
  card.className = 'cuisine-card';
  card.href = `detail.html?cuisine=${cuisine.id}&name=${encodeURIComponent(cuisine.name)}&area=${currentArea}`;
  card.setAttribute('aria-label', `${cuisine.name} — ${formatCount(count)}店舗`);
  card.dataset.id = cuisine.id;
  card.dataset.representative = cuisine.menuItems.join('・');

  card.innerHTML = `
    ${getFlagDisplay(cuisine.flagCode, cuisine.name)}
    <div class="cuisine-name">${cuisine.name}</div>
    <div class="cuisine-count">${formatCount(count)}</div>
  `;

  card.addEventListener('click', (e) => {
    e.preventDefault();
    handleCuisineSelect(cuisine);
  });

  return card;
}

// ============================================================
// Render: populate grid with skeleton → real cards
// ============================================================
function renderGrid() {
  const grid = document.getElementById('cuisine-grid');
  const countEl = document.getElementById('genre-count');
  if (!grid) return;

  // Show skeleton placeholders first
  grid.innerHTML = '';
  for (let i = 0; i < CUISINES.length; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'card-skeleton';
    grid.appendChild(skeleton);
  }

  // Render real cards after a brief delay
  requestAnimationFrame(() => {
    setTimeout(() => {
      grid.innerHTML = '';
      CUISINES.forEach((cuisine) => {
        grid.appendChild(createCuisineCard(cuisine));
      });
      if (countEl) {
        countEl.textContent = `${CUISINES.length}ジャンル`;
      }
    }, 300);
  });
}

// ============================================================
// Handler: cuisine card selected — navigate to detail page
// ============================================================
function handleCuisineSelect(cuisine) {
  const url = `detail.html?cuisine=${cuisine.id}&name=${encodeURIComponent(cuisine.name)}&area=${currentArea}`;
  window.location.href = url;
}

// ============================================================
// Handler: area changed
// ============================================================
function handleAreaChange(area) {
  if (!AREAS[area]) return;
  currentArea = area;
  // Reflect selection in URL without page reload
  const url = new URL(window.location.href);
  url.searchParams.set('area', area);
  window.history.replaceState({}, '', url);
  renderGrid();
}

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Restore area from URL param (e.g. when navigating back from detail page)
  const urlParams = new URLSearchParams(window.location.search);
  const urlArea = urlParams.get('area');
  if (urlArea && AREAS[urlArea]) {
    currentArea = urlArea;
  }

  const areaSelect = document.getElementById('area-select');
  if (areaSelect) {
    areaSelect.value = currentArea;
    areaSelect.addEventListener('change', (e) => {
      handleAreaChange(e.target.value);
    });
  }

  renderGrid();

  const updateInfoEl = document.getElementById('update-info');
  if (updateInfoEl) {
    updateInfoEl.textContent = `店舗数更新日: ${formatJapaneseDate(LAST_UPDATED)}`;
  }
});
