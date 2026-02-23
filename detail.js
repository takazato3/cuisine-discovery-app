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
// Fallback dummy data (shown until cuisine-data.json is populated by GitHub Actions)
// ============================================================
const DUMMY_RESTAURANTS = {
  thai: [
    { name: 'バンコク亭 渋谷店',          rating: 4.3, ratingCount: 127, address: '東京都渋谷区道玄坂1-3-3',     distance: 320,  todayHours: '11:00〜22:00', placeId: null },
    { name: 'チャオタイ 新宿店',          rating: 4.1, ratingCount: 89,  address: '東京都新宿区新宿3-4-5',       distance: 580,  todayHours: '11:00〜22:00', placeId: null },
    { name: 'タイ屋台 999',               rating: 4.5, ratingCount: 312, address: '東京都港区南青山3-4-5',       distance: 720,  todayHours: '11:30〜23:00', placeId: null },
    { name: 'ロイヤルタイ 六本木',        rating: 3.9, ratingCount: 64,  address: '東京都港区六本木5-6-7',       distance: 950,  todayHours: '要確認',       placeId: null },
    { name: 'マンゴーツリー東京',         rating: 4.4, ratingCount: 203, address: '東京都千代田区丸の内1-2-3',   distance: 1200, todayHours: '11:00〜23:00', placeId: null },
  ],
  vietnamese: [
    { name: 'フォー・ベトナム 渋谷',      rating: 4.2, ratingCount: 98,  address: '東京都渋谷区宇田川町2-1',    distance: 280,  todayHours: '11:00〜22:00', placeId: null },
    { name: 'アンコム 中目黒店',          rating: 4.4, ratingCount: 176, address: '東京都目黒区中目黒1-5-3',    distance: 640,  todayHours: '11:30〜23:00', placeId: null },
    { name: 'サイゴン バインミー',        rating: 4.0, ratingCount: 55,  address: '東京都港区赤坂7-3-12',       distance: 870,  todayHours: '要確認',       placeId: null },
    { name: 'ベトナム食堂 ĂNCƠM',        rating: 4.3, ratingCount: 141, address: '東京都新宿区大久保1-8-6',    distance: 1050, todayHours: '11:00〜22:00', placeId: null },
  ],
  korean: [
    { name: '韓国家庭料理 ハヌル',        rating: 4.5, ratingCount: 284, address: '東京都新宿区大久保1-12-6',   distance: 210,  todayHours: '11:00〜23:00', placeId: null },
    { name: 'プルコギ亭 新大久保本店',    rating: 4.3, ratingCount: 198, address: '東京都新宿区百人町1-5-2',    distance: 350,  todayHours: '11:00〜23:00', placeId: null },
    { name: '本格韓国料理 ソウルガーデン', rating: 4.1, ratingCount: 112, address: '東京都渋谷区道玄坂2-6-17', distance: 590,  todayHours: '要確認',       placeId: null },
    { name: 'サムギョプサル専門店 コギ',  rating: 4.4, ratingCount: 237, address: '東京都港区六本木3-4-19',     distance: 820,  todayHours: '17:00〜24:00', placeId: null },
  ],
  'indian-nepali': [
    { name: 'スパイス&カレー ムンバイ',   rating: 4.4, ratingCount: 189, address: '東京都渋谷区神南1-4-8',      distance: 390,  todayHours: '11:00〜22:00', placeId: null },
    { name: 'デリーキッチン 新宿',        rating: 4.2, ratingCount: 134, address: '東京都新宿区西新宿1-13-12',  distance: 620,  todayHours: '11:00〜22:00', placeId: null },
    { name: 'ネパール食堂 ヒマラヤ 大久保', rating: 4.5, ratingCount: 208, address: '東京都新宿区大久保2-4-3', distance: 780,  todayHours: '11:00〜22:00', placeId: null },
    { name: 'ビリヤニ&モモ コルカタ',     rating: 4.3, ratingCount: 215, address: '東京都豊島区池袋1-25-3',     distance: 1290, todayHours: '要確認',       placeId: null },
  ],
  'south-indian': [
    { name: 'ミールス食堂 チェンナイ',    rating: 4.5, ratingCount: 89,  address: '東京都新宿区大久保1-3-10',   distance: 450,  todayHours: '11:00〜22:00', placeId: null },
    { name: 'ドーサ&イドゥリ バンガロール', rating: 4.3, ratingCount: 67, address: '東京都豊島区池袋2-15-3',  distance: 720,  todayHours: '要確認',       placeId: null },
    { name: '南インド食堂 ケーララ',      rating: 4.4, ratingCount: 78,  address: '東京都渋谷区神宮前5-1-10',  distance: 980,  todayHours: '11:30〜22:00', placeId: null },
  ],
  'machi-chuka': [
    { name: '大衆中華 龍ちゃん',          rating: 4.1, ratingCount: 156, address: '東京都台東区浅草橋3-5-2',   distance: 280,  todayHours: '11:00〜22:00', placeId: null },
    { name: '町の中華屋 幸来',            rating: 4.0, ratingCount: 98,  address: '東京都葛飾区亀有1-12-3',    distance: 650,  todayHours: '要確認',       placeId: null },
    { name: '中華食堂 一番',              rating: 4.2, ratingCount: 213, address: '東京都新宿区高田馬場2-8-5',  distance: 870,  todayHours: '11:00〜21:00', placeId: null },
    { name: '昭和中華 みんみん',          rating: 4.3, ratingCount: 178, address: '東京都足立区北千住1-3-7',    distance: 1100, todayHours: '11:00〜22:00', placeId: null },
  ],
  'honkaku-chuka': [
    { name: '四川料理 天府',              rating: 4.5, ratingCount: 412, address: '東京都新宿区新宿2-1-14',     distance: 300,  todayHours: '11:30〜23:00', placeId: null },
    { name: '北京ダック専門店 全聚徳',    rating: 4.4, ratingCount: 338, address: '東京都中央区銀座4-2-15',     distance: 550,  todayHours: '11:30〜23:00', placeId: null },
    { name: '飲茶・点心 桃園',            rating: 4.1, ratingCount: 156, address: '東京都港区赤坂3-19-8',       distance: 960,  todayHours: '要確認',       placeId: null },
  ],
  taiwanese: [
    { name: '台湾料理 魯肉飯 台北亭',    rating: 4.3, ratingCount: 142, address: '東京都新宿区新宿3-12-8',     distance: 340,  todayHours: '11:00〜22:00', placeId: null },
    { name: '小籠包&台湾点心 鼎泰豊',    rating: 4.6, ratingCount: 521, address: '東京都渋谷区代官山町12-3',   distance: 620,  todayHours: '11:00〜22:00', placeId: null },
    { name: '台湾夜市 FORMOSA',           rating: 4.1, ratingCount: 88,  address: '東京都豊島区池袋1-34-7',     distance: 890,  todayHours: '要確認',       placeId: null },
  ],
  mexican: [
    { name: 'タコス&バリート MESA',       rating: 4.1, ratingCount: 76,  address: '東京都渋谷区神宮前5-10-1',  distance: 450,  todayHours: '11:00〜22:00', placeId: null },
    { name: 'エル・トリート 六本木',      rating: 4.3, ratingCount: 103, address: '東京都港区六本木7-8-5',      distance: 680,  todayHours: '要確認',       placeId: null },
    { name: 'メキシカングリル AZTECA',    rating: 3.8, ratingCount: 42,  address: '東京都千代田区神田神保町2-3', distance: 920, todayHours: '要確認',        placeId: null },
  ],
  italian: [
    { name: 'トラットリア・チェルビーノ', rating: 4.5, ratingCount: 342, address: '東京都港区南青山5-8-2',      distance: 180,  todayHours: '11:30〜23:00', placeId: null },
    { name: 'ピッツェリア ナポリ 表参道',  rating: 4.4, ratingCount: 276, address: '東京都渋谷区神宮前4-12-10', distance: 430,  todayHours: '11:00〜22:00', placeId: null },
    { name: 'リストランテ・サバティーニ',  rating: 4.6, ratingCount: 487, address: '東京都中央区銀座7-3-13',    distance: 670,  todayHours: '11:30〜23:00', placeId: null },
    { name: 'オステリア バルカ',          rating: 4.2, ratingCount: 148, address: '東京都目黒区中目黒3-1-5',    distance: 890,  todayHours: '要確認',       placeId: null },
  ],
  french: [
    { name: 'ビストロ・ル・コワン',       rating: 4.5, ratingCount: 213, address: '東京都港区南青山6-1-3',      distance: 260,  todayHours: '12:00〜23:00', placeId: null },
    { name: 'ブラッスリー ポール・ボキューズ 銀座', rating: 4.6, ratingCount: 521, address: '東京都中央区銀座3-5-1', distance: 540, todayHours: '11:30〜23:00', placeId: null },
    { name: 'レストラン・ロオジエ',       rating: 4.7, ratingCount: 389, address: '東京都中央区銀座7-5-5',      distance: 720,  todayHours: '要確認',       placeId: null },
  ],
  greek: [
    { name: 'オーパ！ギリシャ料理',      rating: 4.2, ratingCount: 68,  address: '東京都港区南青山3-16-6',     distance: 480,  todayHours: '要確認',       placeId: null },
    { name: 'タベルナ・エレフシナ',       rating: 4.4, ratingCount: 95,  address: '東京都渋谷区神宮前1-11-6',  distance: 730,  todayHours: '17:00〜23:00', placeId: null },
    { name: 'ムサカ&ギロス DELPHI',      rating: 4.0, ratingCount: 51,  address: '東京都中央区銀座1-8-19',     distance: 1010, todayHours: '要確認',       placeId: null },
  ],
  'middle-eastern': [
    { name: '中東料理 BEIRUT',            rating: 4.3, ratingCount: 84,  address: '東京都港区元麻布3-1-5',     distance: 490,  todayHours: '要確認',       placeId: null },
    { name: 'ファラフェル&フムス レバント', rating: 4.1, ratingCount: 62, address: '東京都渋谷区富ヶ谷1-30-2', distance: 760, todayHours: '11:00〜22:00', placeId: null },
    { name: '中東家庭料理 TYRE',          rating: 4.4, ratingCount: 97,  address: '東京都新宿区市谷砂土原町2-2', distance: 1000, todayHours: '要確認',     placeId: null },
  ],
  peruvian: [
    { name: 'セビーチェ&ペルー料理 LIMA', rating: 4.4, ratingCount: 73,  address: '東京都港区南青山5-4-41',    distance: 540,  todayHours: '12:00〜22:00', placeId: null },
    { name: 'ペルー食堂 MACHU PICCHU',    rating: 4.2, ratingCount: 56,  address: '東京都渋谷区神宮前6-8-1',  distance: 820,  todayHours: '要確認',       placeId: null },
    { name: 'アンデス料理 CUZCO',         rating: 4.1, ratingCount: 44,  address: '東京都新宿区新宿5-10-1',    distance: 1060, todayHours: '要確認',       placeId: null },
  ],
  turkish: [
    { name: 'イスタンブール・サライ',     rating: 4.3, ratingCount: 116, address: '東京都港区六本木6-2-31',    distance: 380,  todayHours: '11:30〜23:00', placeId: null },
    { name: 'ケバブ&メゼ OTTOMAN',        rating: 4.1, ratingCount: 78,  address: '東京都新宿区歌舞伎町1-2-10', distance: 610, todayHours: '要確認',       placeId: null },
    { name: 'アナトリア・キッチン',       rating: 4.4, ratingCount: 143, address: '東京都渋谷区恵比寿南1-8-3',  distance: 850,  todayHours: '11:00〜23:00', placeId: null },
  ],
  spanish: [
    { name: 'バル・デ・エスパーニャ',     rating: 4.4, ratingCount: 168, address: '東京都港区南青山3-12-5',    distance: 320,  todayHours: '11:00〜23:00', placeId: null },
    { name: 'パエリア専門店 バレンシア',  rating: 4.3, ratingCount: 134, address: '東京都中央区銀座6-13-4',    distance: 580,  todayHours: '11:30〜23:00', placeId: null },
    { name: 'レストラン・エル・カスティーヨ', rating: 4.5, ratingCount: 247, address: '東京都港区西麻布2-5-9', distance: 1050, todayHours: '要確認',      placeId: null },
  ],
  brazilian: [
    { name: 'シュラスコ専門店 ブラジレイロ', rating: 4.4, ratingCount: 192, address: '東京都港区六本木7-14-4', distance: 430,  todayHours: '11:30〜23:00', placeId: null },
    { name: 'チュラスカリア COPACABANA',  rating: 4.5, ratingCount: 271, address: '東京都千代田区丸の内3-4-1', distance: 1180, todayHours: '11:00〜23:00', placeId: null },
    { name: 'ブラジル料理 サンパウロ',    rating: 4.1, ratingCount: 63,  address: '東京都新宿区高田馬場1-9-5', distance: 920,  todayHours: '要確認',       placeId: null },
  ],
  african: [
    { name: 'アフリカンキッチン ADDIS',   rating: 4.3, ratingCount: 47,  address: '東京都新宿区百人町2-3-10',  distance: 490,  todayHours: '要確認',       placeId: null },
    { name: 'エチオピアン・カフェ ハベシャ', rating: 4.5, ratingCount: 89, address: '東京都港区六本木5-18-20', distance: 760,  todayHours: '17:00〜24:00', placeId: null },
    { name: 'タジン専門店 マラケシュ',    rating: 4.4, ratingCount: 88,  address: '東京都港区南青山3-5-10',    distance: 1000, todayHours: '要確認',       placeId: null },
  ],
  'sri-lankan': [
    { name: 'スリランカ料理 コロンボ',    rating: 4.2, ratingCount: 45,  address: '東京都新宿区大久保1-5-2',   distance: 520,  todayHours: '要確認',       placeId: null },
    { name: 'ホッパー&コットゥ キャンディ', rating: 4.0, ratingCount: 32, address: '東京都豊島区池袋2-8-4',   distance: 780,  todayHours: '要確認',       placeId: null },
  ],
  mongolian: [
    { name: 'モンゴル料理 ゴビ',          rating: 4.1, ratingCount: 28,  address: '東京都新宿区高田馬場3-1-5', distance: 650,  todayHours: '要確認',       placeId: null },
    { name: 'ボーズ&ホーショール ウランバートル', rating: 3.9, ratingCount: 19, address: '東京都豊島区池袋3-2-7', distance: 900, todayHours: '要確認',      placeId: null },
  ],
  singaporean: [
    { name: 'チキンライス専門店 ハイナン', rating: 4.3, ratingCount: 87,  address: '東京都港区六本木3-11-5',   distance: 410,  todayHours: '11:00〜22:00', placeId: null },
    { name: 'ラクサ&バクテー シンガポール', rating: 4.2, ratingCount: 63, address: '東京都渋谷区神宮前4-5-2',  distance: 670,  todayHours: '要確認',       placeId: null },
    { name: 'シンガポール食堂 マーライオン', rating: 4.0, ratingCount: 41, address: '東京都中央区銀座2-4-6',   distance: 930,  todayHours: '要確認',       placeId: null },
  ],
  uzbek: [
    { name: 'ウズベキスタン料理 タシケント', rating: 4.2, ratingCount: 38, address: '東京都新宿区大久保2-1-8', distance: 560,  todayHours: '要確認',       placeId: null },
    { name: 'プロフ&シャシリク サマルカンド', rating: 4.0, ratingCount: 25, address: '東京都豊島区池袋1-17-3', distance: 810, todayHours: '要確認',        placeId: null },
  ],
  british: [
    { name: 'ブリティッシュパブ ロンドン', rating: 4.1, ratingCount: 94,  address: '東京都港区六本木4-11-7',   distance: 380,  todayHours: '11:00〜24:00', placeId: null },
    { name: 'フィッシュ&チップス シェフィールド', rating: 4.3, ratingCount: 67, address: '東京都渋谷区恵比寿1-8-3', distance: 620, todayHours: '要確認',   placeId: null },
    { name: 'ローストビーフ&スコーン マンチェスター', rating: 4.0, ratingCount: 48, address: '東京都新宿区四谷3-2-1', distance: 900, todayHours: '要確認', placeId: null },
  ],
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
    const areaEntry    = cuisineEntry?.[area];
    const restaurants  = areaEntry?.restaurants;

    if (restaurants && restaurants.length > 0) {
      // Real data available
      renderRestaurantCards(restaurants);
      const first = restaurants[0];
      if (first?.lat != null && first?.lng != null) {
        updateMapCenter(first.lat, first.lng);
      }
      return;
    }

    // Fall through to dummy data below
    throw new Error('no-data');

  } catch (err) {
    // Use dummy data until GitHub Actions populates cuisine-data.json
    const fallback = DUMMY_RESTAURANTS[cuisineId] || DUMMY_RESTAURANTS['thai'];
    renderRestaurantCards(fallback);
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) lastUpdatedEl.textContent = '準備中';
  }
}

document.addEventListener('DOMContentLoaded', init);
