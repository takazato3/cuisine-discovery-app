'use strict';

// ============================================================
// Cuisine Data
// count and lastUpdated are updated weekly by GitHub Actions (update-counts.js)
// ============================================================
const CUISINES = [
  { id: 'thai',       flagCode: 'th', name: 'タイ料理',       count: 328,  lastUpdated: '2026-02-21', query: 'thai restaurant',      menuItems: ['トムヤムクン', 'ガパオライス', 'パッタイ'] },
  { id: 'vietnamese', flagCode: 'vn', name: 'ベトナム料理',   count: 214,  lastUpdated: '2026-02-21', query: 'vietnamese restaurant', menuItems: ['フォー', 'バインミー', '生春巻き'] },
  { id: 'korean',     flagCode: 'kr', name: '韓国料理',       count: 486,  lastUpdated: '2026-02-21', query: 'korean restaurant',     menuItems: ['サムギョプサル', 'ビビンバ', 'チヂミ'] },
  { id: 'indian',     flagCode: 'in', name: 'インド料理',     count: 301,  lastUpdated: '2026-02-21', query: 'indian restaurant',     menuItems: ['バターチキンカレー', 'ナン', 'タンドリーチキン'] },
  { id: 'mexican',    flagCode: 'mx', name: 'メキシコ料理',   count: 97,   lastUpdated: '2026-02-21', query: 'mexican restaurant',    menuItems: ['タコス', 'ブリトー', 'ナチョス'] },
  { id: 'italian',    flagCode: 'it', name: 'イタリア料理',   count: 612,  lastUpdated: '2026-02-21', query: 'italian restaurant',    menuItems: ['マルゲリータ', 'カルボナーラ', 'ティラミス'] },
  { id: 'french',     flagCode: 'fr', name: 'フランス料理',   count: 278,  lastUpdated: '2026-02-21', query: 'french restaurant',     menuItems: ['キッシュ', 'ガレット', 'ラタトゥイユ'] },
  { id: 'chinese',    flagCode: 'cn', name: '中国料理',       count: 731,  lastUpdated: '2026-02-21', query: 'chinese restaurant',    menuItems: ['麻婆豆腐', 'チャーハン', '小籠包'] },
  { id: 'greek',      flagCode: 'gr', name: 'ギリシャ料理',   count: 54,   lastUpdated: '2026-02-21', query: 'greek restaurant',      menuItems: ['ムサカ', 'スブラキ', 'ギリシャサラダ'] },
  { id: 'ethiopian',  flagCode: 'et', name: 'エチオピア料理', count: 23,   lastUpdated: '2026-02-21', query: 'ethiopian restaurant',  menuItems: ['インジェラ', 'ドロワット', 'ティブス'] },
  { id: 'peruvian',   flagCode: 'pe', name: 'ペルー料理',     count: 41,   lastUpdated: '2026-02-21', query: 'peruvian restaurant',   menuItems: ['セビーチェ', 'ロモサルタード', 'アンティクーチョ'] },
  { id: 'lebanese',   flagCode: 'lb', name: 'レバノン料理',   count: 68,   lastUpdated: '2026-02-21', query: 'lebanese restaurant',   menuItems: ['フムス', 'ファラフェル', 'タブーレ'] },
  { id: 'turkish',    flagCode: 'tr', name: 'トルコ料理',     count: 89,   lastUpdated: '2026-02-21', query: 'turkish restaurant',    menuItems: ['ケバブ', 'メゼ', 'バクラヴァ'] },
  { id: 'spanish',    flagCode: 'es', name: 'スペイン料理',   count: 143,  lastUpdated: '2026-02-21', query: 'spanish restaurant',    menuItems: ['パエリア', 'タパス', 'ガスパチョ'] },
  { id: 'brazilian',  flagCode: 'br', name: 'ブラジル料理',   count: 62,   lastUpdated: '2026-02-21', query: 'brazilian restaurant',  menuItems: ['シュラスコ', 'フェジョアーダ', 'ポンデケージョ'] },
  { id: 'japanese',   flagCode: 'jp', name: '日本料理',       count: 924,  lastUpdated: '2026-02-21', query: 'japanese restaurant',   menuItems: ['ラーメン', '寿司', '天ぷら'] },
  { id: 'russian',    flagCode: 'ru', name: 'ロシア料理',     count: 76,   lastUpdated: '2026-02-21', query: 'russian restaurant',    menuItems: ['ボルシチ', 'ピロシキ', 'ビーフストロガノフ'] },
  { id: 'moroccan',   flagCode: 'ma', name: 'モロッコ料理',   count: 35,   lastUpdated: '2026-02-21', query: 'moroccan restaurant',   menuItems: ['タジン', 'クスクス', 'ハリラ'] },
];

// ============================================================
// Region Data
// Multipliers relative to Tokyo baseline (dummy data)
// ============================================================
const REGION_MULTIPLIERS = {
  tokyo:   1.00,
  osaka:   0.72,
  nagoya:  0.44,
  fukuoka: 0.37,
  sapporo: 0.29,
};

let currentRegion = 'tokyo';

function getRegionCuisines(region) {
  const multiplier = REGION_MULTIPLIERS[region] ?? 1.0;
  return CUISINES.map((c) => ({
    ...c,
    count: Math.max(1, Math.round(c.count * multiplier)),
  }));
}

// ============================================================
// Utility: format store count with locale separator
// ============================================================
function formatCount(n) {
  return n.toLocaleString('ja-JP');
}

// ============================================================
// Render: build a single card element
// ============================================================
function createCuisineCard(cuisine) {
  const card = document.createElement('a');
  card.className = 'cuisine-card';
  card.href = `detail.html?cuisine=${cuisine.id}&name=${encodeURIComponent(cuisine.name)}`;
  card.setAttribute('aria-label', `${cuisine.name} — ${formatCount(cuisine.count)}店舗`);
  card.dataset.id = cuisine.id;

  card.innerHTML = `
    <img src="https://flagcdn.com/w80/${cuisine.flagCode}.png"
         alt="${cuisine.name}の国旗"
         class="cuisine-flag">
    <div class="cuisine-name">${cuisine.name}</div>
    <div class="cuisine-menu-preview">${cuisine.menuItems.join('・')}</div>
    <div class="cuisine-count">${formatCount(cuisine.count)}</div>
    <div class="cuisine-label">店舗</div>
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
function renderGrid(cuisines) {
  const grid = document.getElementById('cuisine-grid');
  const countEl = document.getElementById('genre-count');

  // Show skeleton placeholders first
  grid.innerHTML = '';
  for (let i = 0; i < cuisines.length; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'card-skeleton';
    grid.appendChild(skeleton);
  }

  // Render real cards after a brief delay (simulates async data fetch)
  requestAnimationFrame(() => {
    setTimeout(() => {
      grid.innerHTML = '';
      cuisines.forEach((cuisine) => {
        grid.appendChild(createCuisineCard(cuisine));
      });
      if (countEl) {
        countEl.textContent = `${cuisines.length}ジャンル`;
      }
    }, 300);
  });
}

// ============================================================
// Handler: cuisine card selected — navigate to detail page
// ============================================================
function handleCuisineSelect(cuisine) {
  const url = `detail.html?cuisine=${cuisine.id}&name=${encodeURIComponent(cuisine.name)}&region=${currentRegion}`;
  window.location.href = url;
}

// ============================================================
// Handler: region changed
// ============================================================
function handleRegionChange(region) {
  currentRegion = region;
  renderGrid(getRegionCuisines(region));
}

// ============================================================
// Last updated date — rewritten weekly by update-counts.js
// ============================================================
const LAST_UPDATED = '2026-02-21';

// ============================================================
// Utility: format ISO date (YYYY-MM-DD) to Japanese display
// ============================================================
function formatJapaneseDate(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${parseInt(y)}年${parseInt(m)}月${parseInt(d)}日`;
}

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const regionSelect = document.getElementById('region-select');
  if (regionSelect) {
    regionSelect.addEventListener('change', (e) => {
      handleRegionChange(e.target.value);
    });
  }
  renderGrid(getRegionCuisines(currentRegion));

  const updateInfoEl = document.getElementById('update-info');
  if (updateInfoEl) {
    updateInfoEl.textContent = `店舗数更新日: ${formatJapaneseDate(LAST_UPDATED)}`;
  }
});
