'use strict';

// ============================================================
// URL Parameter Parsing
// ============================================================
const params = new URLSearchParams(window.location.search);
const cuisineId   = params.get('cuisine') || 'thai';
const cuisineName = params.get('name')    || '料理ジャンル';
const area        = params.get('area')    || 'tokyo-23';

// ============================================================
// Area Definitions (mirrors app.js)
// ============================================================
const AREAS = {
  'tokyo-23':          { name: '東京23区',               lat: 35.6762, lng: 139.6503, radius: 15000 },
  'tokyo-outside':     { name: '東京（23区外）',          lat: 35.7141, lng: 139.3627, radius: 20000 },
  'yokohama-kawasaki': { name: '横浜・川崎',              lat: 35.4437, lng: 139.6380, radius: 15000 },
  'kanagawa-other':    { name: '神奈川（横浜・川崎以外）', lat: 35.3387, lng: 139.2779, radius: 25000 },
};

const areaData = AREAS[area] || AREAS['tokyo-23'];
const areaName = areaData.name;

// ============================================================
// Representative Menu Items per Cuisine Genre
// ============================================================
const CUISINE_REPRESENTATIVE_MENUS = {
  thai:             'トムヤムクン・ガパオライス・パッタイ',
  vietnamese:       'フォー・バインミー・生春巻き',
  korean:           'サムギョプサル・ビビンバ・チヂミ',
  'indian-nepali':  'バターチキンカレー・ナン・モモ',
  'south-indian':   'ミールス・ドーサ・イドゥリ',
  'machi-chuka':    'ラーメン・チャーハン・餃子',
  'honkaku-chuka':  '麻婆豆腐・小籠包・北京ダック',
  taiwanese:        '魯肉飯・小籠包・タピオカティー',
  mexican:          'タコス・ブリトー・ナチョス',
  italian:          'マルゲリータ・カルボナーラ・ティラミス',
  french:           'キッシュ・ラタトゥイユ・ガレット',
  greek:            'ムサカ・スブラキ・ギリシャサラダ',
  'middle-eastern': 'フムス・ファラフェル・シャワルマ',
  peruvian:         'セビーチェ・ロモサルタード・アンティクーチョ',
  turkish:          'ケバブ・バクラヴァ・メゼ',
  spanish:          'パエリア・タパス・ガスパチョ',
  brazilian:        'シュラスコ・フェジョアーダ・ポンデケージョ',
  african:          'インジェラ・タジン・クスクス',
  'sri-lankan':     'カレー・ホッパー・コットゥ',
  mongolian:        'ホーショール・ボーズ・羊肉',
  singaporean:      'チキンライス・ラクサ・バクテー',
  uzbek:            'プロフ・シャシリク・サムサ',
  british:          'フィッシュ&チップス・ローストビーフ・スコーン',
};

// ============================================================
// Utility: render star rating (★☆)
// ============================================================
function renderStars(rating) {
  const full    = Math.floor(rating);
  const hasHalf = (rating - full) >= 0.25 && (rating - full) < 0.75;
  const empty   = 5 - full - (hasHalf ? 1 : 0);
  return '★'.repeat(full) + (hasHalf ? '⯨' : '') + '☆'.repeat(empty);
}

// ============================================================
// Utility: format distance (null-safe)
// ============================================================
function formatDistance(meters) {
  if (meters == null) return '---';
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// ============================================================
// Utility: escape HTML to prevent XSS
// ============================================================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// Utility: render hours row HTML
// openNow is not shown — data is from weekly batch and may be stale
// ============================================================
function renderHoursRow(r) {
  const hoursText = r.todayHours || '要確認';
  return `<div class="restaurant-hours">🕒 ${escapeHtml(hoursText)}</div>`;
}

// ============================================================
// Pagination state
// ============================================================
const PAGE_SIZE = 10;
let currentPage    = 0;
let allRestaurants = [];
let mapIframe      = null;

// ============================================================
// Utility: build Google Maps URL
// ============================================================
function getGoogleMapsUrl(placeId) {
  return `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`;
}

// ============================================================
// Utility: update map iframe to center on given coordinates
// ============================================================
function updateMapCenter(lat, lng) {
  if (!mapIframe || lat == null || lng == null) return;
  mapIframe.src = `https://maps.google.com/maps?q=${lat},${lng}&output=embed&hl=ja&z=15`;
}

// ============================================================
// Render: skeleton placeholders while data loads
// ============================================================
function showSkeletons(count = 3) {
  const list = document.getElementById('restaurant-list');
  list.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'restaurant-skeleton';
    list.appendChild(sk);
  }
  const pagination = document.getElementById('pagination');
  if (pagination) pagination.hidden = true;
}

// ============================================================
// Render: build a single restaurant card element
// ============================================================
function createRestaurantCard(r) {
  const card = document.createElement(r.placeId ? 'a' : 'div');
  card.className = 'restaurant-card';

  if (r.placeId) {
    card.href   = getGoogleMapsUrl(r.placeId);
    card.target = '_blank';
    card.rel    = 'noopener noreferrer';
  }

  // Photos require an API key on the client — show placeholder instead
  const photoHtml = `<div class="restaurant-photo-placeholder">🍽️</div>`;

  card.innerHTML = `
    <div class="restaurant-photo-wrap">${photoHtml}</div>
    <div class="restaurant-card-body">
      <div class="restaurant-name">${escapeHtml(r.name)}</div>
      <div class="restaurant-rating">
        <span class="stars" aria-label="評価${r.rating}">${renderStars(r.rating)}</span>
        <span class="rating-value">${Number(r.rating).toFixed(1)}</span>
        <span class="rating-count">(${Number(r.ratingCount).toLocaleString('ja-JP')}件)</span>
      </div>
      <div class="restaurant-address">📍 ${escapeHtml(r.address)}</div>
      ${renderHoursRow(r)}
      <div class="restaurant-distance">🚶 ${formatDistance(r.distance)}</div>
    </div>
  `;

  return card;
}

// ============================================================
// Render: display one page of restaurant cards
// ============================================================
function renderPagedCards(page) {
  const list    = document.getElementById('restaurant-list');
  const countEl = document.getElementById('restaurant-count');
  const total   = allRestaurants.length;
  const start   = page * PAGE_SIZE;
  const end     = Math.min(start + PAGE_SIZE, total);

  list.innerHTML = '';
  allRestaurants.slice(start, end).forEach(r => list.appendChild(createRestaurantCard(r)));

  if (countEl) {
    countEl.textContent = total <= PAGE_SIZE
      ? `${total}件`
      : `${total}件中 ${start + 1}–${end}件を表示`;
  }

  renderPagination(page, Math.ceil(total / PAGE_SIZE));
}

// ============================================================
// Render: pagination controls
// ============================================================
function renderPagination(page, totalPages) {
  const container = document.getElementById('pagination');
  if (!container) return;

  if (totalPages <= 1) {
    container.hidden = true;
    return;
  }

  container.hidden = false;
  container.innerHTML = '';

  const prev = document.createElement('button');
  prev.className  = 'pagination-btn';
  prev.textContent = '← 前へ';
  prev.disabled   = page === 0;
  prev.addEventListener('click', () => goToPage(page - 1));
  container.appendChild(prev);

  const pageNumbers = document.createElement('span');
  pageNumbers.className = 'page-numbers';
  for (let i = 0; i < totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn' + (i === page ? ' active' : '');
    btn.textContent = String(i + 1);
    btn.setAttribute('aria-current', i === page ? 'page' : 'false');
    btn.addEventListener('click', () => goToPage(i));
    pageNumbers.appendChild(btn);
  }
  container.appendChild(pageNumbers);

  const next = document.createElement('button');
  next.className  = 'pagination-btn';
  next.textContent = '次へ →';
  next.disabled   = page === totalPages - 1;
  next.addEventListener('click', () => goToPage(page + 1));
  container.appendChild(next);
}

// ============================================================
// Render: navigate to a page and scroll to list top
// ============================================================
function goToPage(page) {
  currentPage = page;
  renderPagedCards(page);
  const section = document.querySelector('.restaurant-section');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
// Render: full restaurant list (stores data, resets to page 0)
// ============================================================
function renderRestaurantCards(restaurants) {
  allRestaurants = restaurants;
  currentPage    = 0;
  renderPagedCards(0);
}

// ============================================================
// Render: show data-load error message
// ============================================================
function showDataError(message) {
  const list = document.getElementById('restaurant-list');
  if (list) {
    list.innerHTML = `
      <div class="api-error" style="display:block">
        ⚠️ ${escapeHtml(message || '店舗データを読み込めませんでした。しばらく経ってから再度お試しください。')}
      </div>`;
  }
}

// ============================================================
// Map: initialize Google Maps embed
// ============================================================
function initMap(query, displayName) {
  const container   = document.getElementById('map-container');
  const placeholder = document.getElementById('map-placeholder');

  const encodedQuery = encodeURIComponent(`${query} ${displayName}`);
  const src = `https://maps.google.com/maps?q=${encodedQuery}&output=embed&hl=ja&z=13`;

  const iframe = document.createElement('iframe');
  iframe.src             = src;
  iframe.width           = '100%';
  iframe.height          = '100%';
  iframe.style.border    = 'none';
  iframe.title           = `${cuisineName}の店舗マップ`;
  iframe.loading         = 'lazy';
  iframe.allowFullscreen = true;

  iframe.addEventListener('load', () => {
    if (placeholder) placeholder.style.display = 'none';
  });
  iframe.addEventListener('error', () => {
    if (placeholder) {
      placeholder.innerHTML = `
        <span class="map-placeholder-icon">🗺️</span>
        <span>地図を表示できませんでした</span>`;
    }
  });

  mapIframe = iframe;
  if (container) container.appendChild(iframe);
}

// ============================================================
// Init
// ============================================================
async function init() {
  // Page title and headings
  document.title = `${cuisineName}の店舗一覧 - 世界の料理を探そう`;

  const headingEl   = document.getElementById('cuisine-heading');
  const regionEl    = document.getElementById('region-label');
  const menuLabelEl = document.getElementById('cuisine-menu-label');
  if (headingEl)   headingEl.textContent   = cuisineName;
  if (regionEl)    regionEl.textContent    = areaName;
  if (menuLabelEl) {
    const menuText = CUISINE_REPRESENTATIVE_MENUS[cuisineId];
    menuLabelEl.textContent = menuText ? `代表メニュー: ${menuText}` : '';
  }

  // Back button restores area state
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.href = `index.html?area=${area}`;

  // Map
  initMap(cuisineId + ' restaurant', areaName);

  // Skeleton loading state
  showSkeletons();

  // ---- Load cuisine-data.json ----
  try {
    const response = await fetch('cuisine-data.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    // Show data update date in footer
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = data.lastUpdated || '—';
    }

    const cuisineEntry = data.data?.[cuisineId];
    if (!cuisineEntry) {
      showDataError(`「${cuisineName}」のデータがまだ準備されていません。`);
      return;
    }

    const areaEntry = cuisineEntry[area];
    if (!areaEntry) {
      showDataError(`「${areaName}」のデータがまだ準備されていません。`);
      return;
    }

    const restaurants = areaEntry.restaurants || [];
    if (restaurants.length === 0) {
      showDataError('このエリアに該当する店舗データがありません。');
      return;
    }

    renderRestaurantCards(restaurants);

    // Center map on first result
    const first = restaurants[0];
    if (first?.lat != null && first?.lng != null) {
      updateMapCenter(first.lat, first.lng);
    }

  } catch (err) {
    console.error('cuisine-data.json の読み込みに失敗しました:', err);
    showDataError('店舗データを読み込めませんでした。ページを再読み込みしてください。');
  }
}

document.addEventListener('DOMContentLoaded', init);
