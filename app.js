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
  // === レベル3: types + primaryType（超厳格） ===
  { id: 'taiwanese',               flagCode: 'tw',         name: '台湾料理',                   counts: { 'tokyo-23': '15', 'tokyo-outside': '8',  'yokohama-kawasaki': '14', 'kanagawa-other': '0' }, lastUpdated: '2026-03-01', query: 'taiwanese restaurant OR 台湾料理 OR ルーローハン OR 小籠包',                                                                      filterType: 'taiwanese_restaurant',    filterPrimaryType: 'taiwanese_restaurant',    filterLevel: 3, menuItems: ['魯肉飯', '小籠包', 'タピオカティー'] },
  { id: 'authentic-chinese',       flagCode: 'cn',         name: '本格中華',                   counts: { 'tokyo-23': '20',  'tokyo-outside': '0',  'yokohama-kawasaki': '19',  'kanagawa-other': '0' }, lastUpdated: '2026-03-01', query: 'authentic chinese restaurant OR 四川料理 OR 湖南料理 OR 東北料理 OR 飲茶 OR 本格中華',                                                 filterType: 'chinese_restaurant',      filterPrimaryType: 'chinese_restaurant',      filterLevel: 3, menuItems: ['麻婆豆腐', '小籠包', '飲茶'] },
  { id: 'indian',                  flagCode: 'in',         name: 'インド料理',                 counts: { 'tokyo-23': '14',  'tokyo-outside': '13',  'yokohama-kawasaki': '13',  'kanagawa-other': '0' }, lastUpdated: '2026-03-01', query: 'indian restaurant OR インド料理 OR ナン',                                                                                         filterType: 'indian_restaurant',       filterPrimaryType: 'indian_restaurant',       filterLevel: 3, menuItems: ['バターチキンカレー', 'ナン', 'チャパティ'] },
  { id: 'korean',                  flagCode: 'kr',         name: '韓国料理',                   counts: { 'tokyo-23': '19', 'tokyo-outside': '0',  'yokohama-kawasaki': '19', 'kanagawa-other': '1' }, lastUpdated: '2026-03-01', query: 'korean restaurant OR 韓国料理 OR サムギョプサル OR スンドゥブ',                                                                    filterType: 'korean_restaurant',       filterPrimaryType: 'korean_restaurant',       filterLevel: 3, menuItems: ['サムギョプサル', 'ビビンバ', 'チヂミ'] },
  { id: 'thai',                    flagCode: 'th',         name: 'タイ料理',                   counts: { 'tokyo-23': '20', 'tokyo-outside': '0',  'yokohama-kawasaki': '11', 'kanagawa-other': '5' }, lastUpdated: '2026-03-01', query: 'thai restaurant OR タイ料理 OR トムヤムクン OR パッタイ',                                                                           filterType: 'thai_restaurant',         filterPrimaryType: 'thai_restaurant',         filterLevel: 3, menuItems: ['トムヤムクン', 'ガパオライス', 'パッタイ'] },

  // === レベル2: types のみ（バランス型） ===
  { id: 'vietnamese',              flagCode: 'vn',         name: 'ベトナム料理',               counts: { 'tokyo-23': '20', 'tokyo-outside': '0', 'yokohama-kawasaki': '16', 'kanagawa-other': '3' }, lastUpdated: '2026-03-01', query: 'vietnamese restaurant OR ベトナム料理 OR フォー OR バインミー',                                                                    filterType: 'vietnamese_restaurant',                                                          filterLevel: 2, menuItems: ['フォー', 'バインミー', '生春巻き'] },
  { id: 'indonesian-malaysian',    flagCode: 'id',         name: 'インドネシア・マレーシア料理', counts: { 'tokyo-23': '12',  'tokyo-outside': '0',  'yokohama-kawasaki': '5',  'kanagawa-other': '5' }, lastUpdated: '2026-03-01', query: 'indonesian restaurant OR malaysian restaurant OR ナシゴレン OR サテ OR ナシレマ OR ルンダン',                                          filterType: 'indonesian_restaurant',                                                          filterLevel: 2, menuItems: ['ナシゴレン', 'サテ', 'ラクサ'] },
  { id: 'spanish',                 flagCode: 'es',         name: 'スペイン料理',               counts: { 'tokyo-23': '20', 'tokyo-outside': '0', 'yokohama-kawasaki': '20', 'kanagawa-other': '2' }, lastUpdated: '2026-03-01', query: 'spanish restaurant OR スペイン料理 OR パエリア OR アヒージョ OR スペインバル OR タパス',                                               filterType: 'spanish_restaurant',                                                             filterLevel: 2, menuItems: ['パエリア', 'タパス', 'ガスパチョ'] },
  { id: 'turkish',                 flagCode: 'tr',         name: 'トルコ料理',                 counts: { 'tokyo-23': '17', 'tokyo-outside': '0',  'yokohama-kawasaki': '7', 'kanagawa-other': '3' }, lastUpdated: '2026-03-01', query: 'turkish restaurant OR トルコ料理 OR ケバブ OR メゼ OR キョフテ',                                                                    filterType: 'turkish_restaurant',                                                             filterLevel: 2, menuItems: ['ケバブ', 'バクラヴァ', 'メゼ'] },
  { id: 'middle-eastern',          flagCode: 'middleeast', name: '中東・アラビア料理',         counts: { 'tokyo-23': '15', 'tokyo-outside': '0',  'yokohama-kawasaki': '3', 'kanagawa-other': '1' }, lastUpdated: '2026-03-01', query: 'lebanese restaurant OR middle eastern restaurant OR アラブ料理 OR ヨルダン料理 OR フムス OR ファラフェル OR ピデ',                    filterType: 'middle_eastern_restaurant',                                                      filterLevel: 2, menuItems: ['フムス', 'ファラフェル', 'シャワルマ'] },
  { id: 'mexican',                 flagCode: 'mx',         name: 'メキシコ料理',               counts: { 'tokyo-23': '18', 'tokyo-outside': '0',  'yokohama-kawasaki': '14', 'kanagawa-other': '2' }, lastUpdated: '2026-03-01', query: 'mexican restaurant OR メキシコ料理 OR タコス OR ブリトー OR エンチラーダ OR ケサディーヤ',                                              filterType: 'mexican_restaurant',                                                             filterLevel: 2, menuItems: ['タコス', 'ブリトー', 'ナチョス'] },
  { id: 'brazilian',               flagCode: 'br',         name: 'ブラジル料理',               counts: { 'tokyo-23': '20', 'tokyo-outside': '0',  'yokohama-kawasaki': '12', 'kanagawa-other': '2' }, lastUpdated: '2026-03-01', query: 'brazilian restaurant OR ブラジル料理 OR シュラスコ OR フェイジョアーダ',                                                              filterType: 'brazilian_restaurant',                                                           filterLevel: 2, menuItems: ['シュラスコ', 'フェジョアーダ', 'ポンデケージョ'] },
  { id: 'peruvian',                flagCode: 'pe',         name: 'ペルー料理',                 counts: { 'tokyo-23': '11', 'tokyo-outside': '2',  'yokohama-kawasaki': '7',  'kanagawa-other': '6' }, lastUpdated: '2026-03-01', query: 'peruvian restaurant OR ペルー料理 OR セビーチェ OR ロモサルタード',                                                                  filterType: 'peruvian_restaurant',                                                            filterLevel: 2, menuItems: ['セビーチェ', 'ロモサルタード', 'アンティクーチョ'] },
  { id: 'greek',                   flagCode: 'gr',         name: 'ギリシャ料理',               counts: { 'tokyo-23': '5', 'tokyo-outside': '1',  'yokohama-kawasaki': '4',  'kanagawa-other': '0' }, lastUpdated: '2026-03-01', query: 'greek restaurant OR ギリシャ料理 OR ムサカ',                                                                                      filterType: 'greek_restaurant',                                                               filterLevel: 2, menuItems: ['ムサカ', 'スブラキ', 'ギリシャサラダ'] },
  { id: 'german',                  flagCode: 'de',         name: 'ドイツ料理',                 counts: { 'tokyo-23': '18',  'tokyo-outside': '1',  'yokohama-kawasaki': '11',  'kanagawa-other': '4' }, lastUpdated: '2026-03-01', query: 'german restaurant OR ドイツ料理 OR シュニッツェル OR ソーセージ OR ドイツビール',                                                    filterType: 'german_restaurant',                                                              filterLevel: 2, menuItems: ['シュニッツェル', 'ソーセージ', 'ザウアークラウト'] },

  // === レベル1: フィルタなし ===
  { id: 'south-indian-sri-lankan', flagCode: 'in',         name: '南インド・スリランカ料理',   counts: { 'tokyo-23': '20',  'tokyo-outside': '1',  'yokohama-kawasaki': '20',  'kanagawa-other': '9' }, lastUpdated: '2026-03-01', query: 'south indian restaurant OR sri lankan restaurant OR ミールス OR スリランカ料理 OR アーユルヴェーダ',                                    filterLevel: 1,                                                                               menuItems: ['ミールス', 'ドーサ', 'ホッパー'] },
  { id: 'singaporean',             flagCode: 'sg',         name: 'シンガポール料理',           counts: { 'tokyo-23': '20', 'tokyo-outside': '0',  'yokohama-kawasaki': '6', 'kanagawa-other': '0' }, lastUpdated: '2026-03-01', query: 'singaporean restaurant OR シンガポール料理 OR 海南鶏飯 OR チリクラブ OR シンガポールチキンライス',                                    filterLevel: 1,                                                                               menuItems: ['チキンライス', 'ラクサ', 'バクテー'] },
  { id: 'portuguese',              flagCode: 'pt',         name: 'ポルトガル料理',             counts: { 'tokyo-23': '9',  'tokyo-outside': '0',  'yokohama-kawasaki': '2',  'kanagawa-other': '1' }, lastUpdated: '2026-03-01', query: 'portuguese restaurant OR ポルトガル料理 OR バカリャウ',                                                                              filterLevel: 1,                                                                               menuItems: ['バカリャウ', 'パステル・デ・ナタ', 'ガスパチョ'] },
  { id: 'belgian',                 flagCode: 'be',         name: 'ベルギー料理',               counts: { 'tokyo-23': '11',  'tokyo-outside': '0',  'yokohama-kawasaki': '0',  'kanagawa-other': '1' }, lastUpdated: '2026-03-01', query: 'belgian restaurant OR ベルギー料理 OR ベルギービール OR ムール貝 OR ベルギーワッフル',                                                filterType: 'belgian_restaurant',                                                             filterLevel: 2,                                                                               menuItems: ['ムール貝', 'ベルギービール', 'ワッフル'] },
  { id: 'british-irish',           flagCode: 'gb',         name: 'イギリス・アイルランド料理', counts: { 'tokyo-23': '19',  'tokyo-outside': '1',  'yokohama-kawasaki': '15',  'kanagawa-other': '0' }, lastUpdated: '2026-03-01', query: 'british restaurant OR irish restaurant OR アイリッシュパブ OR フィッシュアンドチップス',                                              filterLevel: 1,                                                                               menuItems: ['フィッシュ&チップス', 'ローストビーフ', 'ギネスビール'] },
  { id: 'nordic',                  flagCode: 'se',         name: '北欧料理',                   counts: { 'tokyo-23': '11',  'tokyo-outside': '1',  'yokohama-kawasaki': '3',  'kanagawa-other': '0' }, lastUpdated: '2026-03-01', query: 'scandinavian restaurant OR swedish restaurant OR danish restaurant OR finnish restaurant OR 北欧料理 OR ミートボール',                filterLevel: 1,                                                                               menuItems: ['ミートボール', 'スモーブロー', 'クネッケ'] },
  { id: 'mongolian',               flagCode: 'mn',         name: 'モンゴル料理',               counts: { 'tokyo-23': '18', 'tokyo-outside': '1',  'yokohama-kawasaki': '17', 'kanagawa-other': '1' }, lastUpdated: '2026-03-01', query: 'mongolian restaurant OR モンゴル料理 OR スーテーツァイ OR ホーショール',                                                            filterLevel: 1,                                                                               menuItems: ['ホーショール', 'ボーズ', '羊肉スープ'] },
  { id: 'moroccan',                flagCode: 'ma',         name: 'モロッコ料理',               counts: { 'tokyo-23': '4',  'tokyo-outside': '0',  'yokohama-kawasaki': '1',  'kanagawa-other': '0' }, lastUpdated: '2026-03-01', query: 'moroccan restaurant OR モロッコ料理 OR タジン鍋 OR クスクス',                                                                       filterType: 'moroccan_restaurant',                                                            filterLevel: 2,                                                                               menuItems: ['タジン鍋', 'クスクス', 'ミント茶'] },
  { id: 'african',                 flagCode: 'africa',     name: 'アフリカ料理',               counts: { 'tokyo-23': '19', 'tokyo-outside': '1',  'yokohama-kawasaki': '6', 'kanagawa-other': '3' }, lastUpdated: '2026-03-01', query: 'african restaurant OR ethiopian restaurant OR egyptian restaurant OR アフリカ料理 OR エチオピア料理 OR エジプト料理 OR コシャリ OR インジェラ', filterLevel: 1,                                                                               menuItems: ['インジェラ', 'コシャリ', 'ジョロフライス'] },
];

// ============================================================
// Last updated date — rewritten weekly by update-counts.js
// ============================================================
const LAST_UPDATED = '2026-03-01';

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
  if (flagCode === 'mediterranean') {
    return '<span class="cuisine-flag cuisine-flag--emoji" aria-hidden="true">🌊</span>';
  }
  if (flagCode === 'centraleurope') {
    return '<span class="cuisine-flag cuisine-flag--emoji" aria-hidden="true">🇦🇹</span>';
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

  // Show last-updated date from cuisine-data.json (falls back to LAST_UPDATED in app.js)
  const lastUpdatedEl = document.getElementById('last-updated');
  if (lastUpdatedEl) {
    fetch('cuisine-data.json')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const date = data?.lastUpdated || LAST_UPDATED;
        lastUpdatedEl.textContent = date ? formatJapaneseDate(date) : '—';
      })
      .catch(() => {
        lastUpdatedEl.textContent = formatJapaneseDate(LAST_UPDATED);
      });
  }
});
