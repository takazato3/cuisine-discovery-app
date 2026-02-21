'use strict';

// ============================================================
// URL Parameter Parsing
// ============================================================
const params = new URLSearchParams(window.location.search);
const cuisineId   = params.get('cuisine') || 'japanese';
const cuisineName = params.get('name')    || '料理ジャンル';
const region      = params.get('region')  || 'tokyo';

// ============================================================
// Region Display Names
// ============================================================
const REGION_NAMES = {
  tokyo:   '東京',
  osaka:   '大阪',
  nagoya:  '名古屋',
  fukuoka: '福岡',
  sapporo: '札幌',
};
const regionName = REGION_NAMES[region] || '東京';

// ============================================================
// Dummy Restaurant Data
// Structure ready to swap for Google Places API response
// ============================================================
const DUMMY_RESTAURANTS = {
  thai: [
    { name: 'バンコク亭 渋谷店',          rating: 4.3, ratingCount: 127, address: '東京都渋谷区道玄坂1-3-3',     distance: 320  },
    { name: 'チャオタイ 新宿店',          rating: 4.1, ratingCount: 89,  address: '東京都新宿区新宿3-4-5',       distance: 580  },
    { name: 'タイ屋台 999',               rating: 4.5, ratingCount: 312, address: '東京都港区南青山3-4-5',       distance: 720  },
    { name: 'ロイヤルタイ 六本木',        rating: 3.9, ratingCount: 64,  address: '東京都港区六本木5-6-7',       distance: 950  },
    { name: 'マンゴーツリー東京',         rating: 4.4, ratingCount: 203, address: '東京都千代田区丸の内1-2-3',   distance: 1200 },
    { name: 'タイキッチン 恵比寿',        rating: 4.2, ratingCount: 91,  address: '東京都渋谷区恵比寿4-2-10',   distance: 1480 },
  ],
  vietnamese: [
    { name: 'フォー・ベトナム 渋谷',      rating: 4.2, ratingCount: 98,  address: '東京都渋谷区宇田川町2-1',    distance: 280  },
    { name: 'アンコム 中目黒店',          rating: 4.4, ratingCount: 176, address: '東京都目黒区中目黒1-5-3',    distance: 640  },
    { name: 'サイゴン バインミー',        rating: 4.0, ratingCount: 55,  address: '東京都港区赤坂7-3-12',       distance: 870  },
    { name: 'ベトナム食堂 ĂNCƠM',        rating: 4.3, ratingCount: 141, address: '東京都新宿区大久保1-8-6',    distance: 1050 },
    { name: 'ハノイの空 池袋店',          rating: 3.8, ratingCount: 43,  address: '東京都豊島区池袋2-11-4',     distance: 1310 },
  ],
  korean: [
    { name: '韓国家庭料理 ハヌル',        rating: 4.5, ratingCount: 284, address: '東京都新宿区大久保1-12-6',   distance: 210  },
    { name: 'プルコギ亭 新大久保本店',    rating: 4.3, ratingCount: 198, address: '東京都新宿区百人町1-5-2',    distance: 350  },
    { name: '本格韓国料理 ソウルガーデン', rating: 4.1, ratingCount: 112, address: '東京都渋谷区道玄坂2-6-17', distance: 590  },
    { name: 'サムギョプサル専門店 コギ',  rating: 4.4, ratingCount: 237, address: '東京都港区六本木3-4-19',     distance: 820  },
    { name: 'チキン&ビール ON',           rating: 4.2, ratingCount: 156, address: '東京都中央区銀座8-4-3',      distance: 1100 },
    { name: 'チヂミ食堂 恵比寿',          rating: 3.9, ratingCount: 67,  address: '東京都渋谷区恵比寿1-23-8',  distance: 1350 },
  ],
  indian: [
    { name: 'スパイス&カレー ムンバイ',   rating: 4.4, ratingCount: 189, address: '東京都渋谷区神南1-4-8',      distance: 390  },
    { name: 'デリーキッチン 新宿',        rating: 4.2, ratingCount: 134, address: '東京都新宿区西新宿1-13-12',  distance: 620  },
    { name: 'タンドール 赤坂',            rating: 4.5, ratingCount: 301, address: '東京都港区赤坂5-2-20',       distance: 780  },
    { name: 'ガンジー 銀座店',            rating: 4.0, ratingCount: 78,  address: '東京都中央区銀座6-10-1',     distance: 1020 },
    { name: 'ビリヤニ&カレー コルカタ',   rating: 4.3, ratingCount: 215, address: '東京都豊島区池袋1-25-3',     distance: 1290 },
  ],
  mexican: [
    { name: 'タコス&バリート MESA',       rating: 4.1, ratingCount: 76,  address: '東京都渋谷区神宮前5-10-1',  distance: 450  },
    { name: 'エル・トリート 六本木',      rating: 4.3, ratingCount: 103, address: '東京都港区六本木7-8-5',      distance: 680  },
    { name: 'メキシカングリル AZTECA',    rating: 3.8, ratingCount: 42,  address: '東京都千代田区神田神保町2-3', distance: 920  },
    { name: 'カンクン 新宿店',            rating: 4.0, ratingCount: 61,  address: '東京都新宿区歌舞伎町1-14-7', distance: 1140 },
    { name: 'ケサディア&タコ BAJA',       rating: 4.2, ratingCount: 88,  address: '東京都目黒区自由が丘1-7-3',  distance: 1560 },
  ],
  italian: [
    { name: 'トラットリア・チェルビーノ', rating: 4.5, ratingCount: 342, address: '東京都港区南青山5-8-2',      distance: 180  },
    { name: 'ピッツェリア ナポリ 表参道',  rating: 4.4, ratingCount: 276, address: '東京都渋谷区神宮前4-12-10', distance: 430  },
    { name: 'リストランテ・サバティーニ',  rating: 4.6, ratingCount: 487, address: '東京都中央区銀座7-3-13',    distance: 670  },
    { name: 'オステリア バルカ',          rating: 4.2, ratingCount: 148, address: '東京都目黒区中目黒3-1-5',    distance: 890  },
    { name: 'パスタ工房 ラ・フォルナーチェ', rating: 4.1, ratingCount: 109, address: '東京都新宿区四谷1-5-10', distance: 1100 },
    { name: 'ダルマット 西麻布',          rating: 4.3, ratingCount: 194, address: '東京都港区西麻布3-2-17',     distance: 1340 },
  ],
  french: [
    { name: 'ビストロ・ル・コワン',       rating: 4.5, ratingCount: 213, address: '東京都港区南青山6-1-3',      distance: 260  },
    { name: 'ブラッスリー ポール・ボキューズ 銀座', rating: 4.6, ratingCount: 521, address: '東京都中央区銀座3-5-1', distance: 540  },
    { name: 'レストラン・ロオジエ',       rating: 4.7, ratingCount: 389, address: '東京都中央区銀座7-5-5',      distance: 720  },
    { name: 'ビストロ NABE',              rating: 4.2, ratingCount: 87,  address: '東京都渋谷区恵比寿西1-4-1',  distance: 980  },
    { name: 'カフェ・ド・フロール 表参道', rating: 4.0, ratingCount: 124, address: '東京都渋谷区神宮前4-9-3',  distance: 1210 },
  ],
  chinese: [
    { name: '横浜中華街 老上海',          rating: 4.3, ratingCount: 267, address: '東京都渋谷区道玄坂2-2-1',   distance: 300  },
    { name: '四川料理 天府',              rating: 4.5, ratingCount: 412, address: '東京都新宿区新宿2-1-14',     distance: 550  },
    { name: '北京ダック専門店 全聚徳',    rating: 4.4, ratingCount: 338, address: '東京都中央区銀座4-2-15',     distance: 720  },
    { name: '飲茶・点心 桃園',            rating: 4.1, ratingCount: 156, address: '東京都港区赤坂3-19-8',       distance: 960  },
    { name: '上海小龍包 蟹家',            rating: 4.2, ratingCount: 201, address: '東京都豊島区池袋2-3-8',      distance: 1180 },
    { name: '広東料理 龍宮',              rating: 4.0, ratingCount: 93,  address: '東京都台東区上野4-8-7',      distance: 1420 },
  ],
  greek: [
    { name: 'オーパ！ギリシャ料理',      rating: 4.2, ratingCount: 68,  address: '東京都港区南青山3-16-6',     distance: 480  },
    { name: 'タベルナ・エレフシナ',       rating: 4.4, ratingCount: 95,  address: '東京都渋谷区神宮前1-11-6',  distance: 730  },
    { name: 'ムサカ&ギロス DELPHI',      rating: 4.0, ratingCount: 51,  address: '東京都中央区銀座1-8-19',     distance: 1010 },
    { name: 'ギリシャキッチン アクロポリス', rating: 3.9, ratingCount: 37, address: '東京都新宿区四谷2-12-3', distance: 1280 },
    { name: 'オリーブ&フェタ SANTORINI', rating: 4.3, ratingCount: 82,  address: '東京都目黒区自由が丘2-9-4', distance: 1590 },
  ],
  ethiopian: [
    { name: 'アフリカンキッチン ADDIS',   rating: 4.3, ratingCount: 47,  address: '東京都新宿区百人町2-3-10',  distance: 620  },
    { name: 'エチオピアン・カフェ ハベシャ', rating: 4.5, ratingCount: 89, address: '東京都港区六本木5-18-20', distance: 890  },
    { name: 'インジェラ食堂 ABYSSINIA',   rating: 4.1, ratingCount: 33,  address: '東京都豊島区西池袋5-14-2',  distance: 1150 },
    { name: 'エチオピア料理 ルーシー',    rating: 4.0, ratingCount: 28,  address: '東京都渋谷区幡ヶ谷1-6-3',  distance: 1440 },
    { name: 'カフア・コーヒー&エチオピアン', rating: 4.2, ratingCount: 61, address: '東京都台東区蔵前2-11-5', distance: 1780 },
  ],
  peruvian: [
    { name: 'セビーチェ&ペルー料理 LIMA', rating: 4.4, ratingCount: 73,  address: '東京都港区南青山5-4-41',    distance: 540  },
    { name: 'ペルー食堂 MACHU PICCHU',    rating: 4.2, ratingCount: 56,  address: '東京都渋谷区神宮前6-8-1',  distance: 820  },
    { name: 'アンデス料理 CUZCO',         rating: 4.1, ratingCount: 44,  address: '東京都新宿区新宿5-10-1',    distance: 1060 },
    { name: 'ラ・マル・ペルー',           rating: 4.5, ratingCount: 108, address: '東京都中央区銀座5-7-10',    distance: 1320 },
    { name: 'チチャ&ロモ サルタード',     rating: 3.9, ratingCount: 31,  address: '東京都目黒区中目黒4-1-7',   distance: 1640 },
  ],
  lebanese: [
    { name: 'アラビア料理 BEIRUT',        rating: 4.3, ratingCount: 84,  address: '東京都港区元麻布3-1-5',     distance: 490  },
    { name: 'ファラフェル&フムス レバント', rating: 4.1, ratingCount: 62, address: '東京都渋谷区富ヶ谷1-30-2', distance: 760  },
    { name: 'レバノン家庭料理 TYRE',      rating: 4.4, ratingCount: 97,  address: '東京都新宿区市谷砂土原町2-2', distance: 1000 },
    { name: 'シーダー・レストラン',       rating: 4.0, ratingCount: 48,  address: '東京都千代田区九段北4-1-8', distance: 1270 },
    { name: 'キッベ&タブレ SIDON',        rating: 3.8, ratingCount: 29,  address: '東京都豊島区目白3-4-18',    distance: 1560 },
  ],
  turkish: [
    { name: 'イスタンブール・サライ',     rating: 4.3, ratingCount: 116, address: '東京都港区六本木6-2-31',    distance: 380  },
    { name: 'ケバブ&メゼ OTTOMAN',        rating: 4.1, ratingCount: 78,  address: '東京都新宿区歌舞伎町1-2-10', distance: 610  },
    { name: 'アナトリア・キッチン',       rating: 4.4, ratingCount: 143, address: '東京都渋谷区恵比寿南1-8-3',  distance: 850  },
    { name: 'トルコ料理 ボスポラス',      rating: 4.0, ratingCount: 59,  address: '東京都台東区浅草2-3-1',     distance: 1110 },
    { name: 'バクラバ&チャイ ANKARA',     rating: 4.2, ratingCount: 91,  address: '東京都品川区五反田1-15-8',  distance: 1380 },
  ],
  spanish: [
    { name: 'バル・デ・エスパーニャ',     rating: 4.4, ratingCount: 168, address: '東京都港区南青山3-12-5',    distance: 320  },
    { name: 'パエリア専門店 バレンシア',  rating: 4.3, ratingCount: 134, address: '東京都中央区銀座6-13-4',    distance: 580  },
    { name: 'タパス&バール SEVILLA',      rating: 4.2, ratingCount: 112, address: '東京都渋谷区神宮前5-52-2',  distance: 810  },
    { name: 'レストラン・エル・カスティーヨ', rating: 4.5, ratingCount: 247, address: '東京都港区西麻布2-5-9', distance: 1050 },
    { name: 'ガウディ・バルセロナ',       rating: 4.1, ratingCount: 86,  address: '東京都新宿区新宿3-20-10',   distance: 1320 },
  ],
  brazilian: [
    { name: 'シュラスコ専門店 ブラジレイロ', rating: 4.4, ratingCount: 192, address: '東京都港区六本木7-14-4', distance: 430  },
    { name: 'ポルケッタ&フェイジョアーダ RIO', rating: 4.2, ratingCount: 87, address: '東京都渋谷区道玄坂1-20-4', distance: 670  },
    { name: 'ブラジル料理 サンパウロ',    rating: 4.1, ratingCount: 63,  address: '東京都新宿区高田馬場1-9-5', distance: 920  },
    { name: 'チュラスカリア COPACABANA',  rating: 4.5, ratingCount: 271, address: '東京都千代田区丸の内3-4-1', distance: 1180 },
    { name: 'アマゾン・グリル',           rating: 3.9, ratingCount: 44,  address: '東京都品川区大崎1-2-12',    distance: 1490 },
  ],
  japanese: [
    { name: '鮨 はた中 銀座',             rating: 4.7, ratingCount: 534, address: '東京都中央区銀座6-7-6',     distance: 250  },
    { name: '懐石料理 嵐山',              rating: 4.6, ratingCount: 312, address: '東京都港区南青山4-18-11',   distance: 490  },
    { name: '天ぷら みかわ',              rating: 4.5, ratingCount: 428, address: '東京都江東区福住1-3-1',     distance: 740  },
    { name: '焼鳥 とりいち 恵比寿',       rating: 4.3, ratingCount: 187, address: '東京都渋谷区恵比寿4-27-2',  distance: 960  },
    { name: 'しゃぶしゃぶ すき焼き 木曽路', rating: 4.2, ratingCount: 143, address: '東京都新宿区新宿3-26-1', distance: 1200 },
    { name: 'うどん 丸亀製麺 渋谷',       rating: 4.0, ratingCount: 356, address: '東京都渋谷区渋谷2-11-5',   distance: 1450 },
  ],
  russian: [
    { name: 'ロシア料理 サラファン',      rating: 4.3, ratingCount: 79,  address: '東京都港区六本木4-10-10',   distance: 560  },
    { name: 'ボルシチの店 モスクワ',      rating: 4.1, ratingCount: 54,  address: '東京都新宿区新宿7-4-3',     distance: 810  },
    { name: 'ピロシキ&ブリヌイ バイカル', rating: 4.2, ratingCount: 66,  address: '東京都渋谷区富ヶ谷2-22-10', distance: 1060 },
    { name: 'カフェ・ロシア',             rating: 3.9, ratingCount: 38,  address: '東京都文京区本郷3-7-4',     distance: 1290 },
    { name: 'スラブ料理 ペテルブルク',    rating: 4.0, ratingCount: 47,  address: '東京都台東区上野桜木2-5-3', distance: 1540 },
  ],
  moroccan: [
    { name: 'タジン専門店 マラケシュ',    rating: 4.4, ratingCount: 88,  address: '東京都港区南青山3-5-10',    distance: 510  },
    { name: 'クスクス&タジン FEZZY',      rating: 4.2, ratingCount: 67,  address: '東京都渋谷区神宮前1-23-2',  distance: 760  },
    { name: 'モロッコ料理 カサブランカ',  rating: 4.3, ratingCount: 94,  address: '東京都新宿区市谷本村町2-4',  distance: 1010 },
    { name: 'ミントティー&タジン サハラ', rating: 4.0, ratingCount: 51,  address: '東京都目黒区駒場1-22-4',   distance: 1290 },
    { name: 'アルガン・キッチン フェズ',  rating: 3.8, ratingCount: 34,  address: '東京都世田谷区三軒茶屋1-8-3', distance: 1610 },
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
// Utility: format distance
// ============================================================
function formatDistance(meters) {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// ============================================================
// Render: restaurant list
// ============================================================
function renderRestaurants(restaurants) {
  const list    = document.getElementById('restaurant-list');
  const countEl = document.getElementById('restaurant-count');

  // Show skeletons while "loading"
  list.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const sk = document.createElement('div');
    sk.className = 'restaurant-skeleton';
    list.appendChild(sk);
  }

  // Replace with real cards after brief delay (mirrors async API pattern)
  setTimeout(() => {
    list.innerHTML = '';
    restaurants.forEach((r) => {
      const card = document.createElement('div');
      card.className = 'restaurant-card';
      card.innerHTML = `
        <div class="restaurant-name">${escapeHtml(r.name)}</div>
        <div class="restaurant-rating">
          <span class="stars" aria-label="評価${r.rating}">${renderStars(r.rating)}</span>
          <span class="rating-value">${r.rating.toFixed(1)}</span>
          <span class="rating-count">(${r.ratingCount.toLocaleString('ja-JP')}件)</span>
        </div>
        <div class="restaurant-meta">
          <span class="restaurant-address">📍 ${escapeHtml(r.address)}</span>
          <span class="restaurant-distance">🚶 ${formatDistance(r.distance)}</span>
        </div>
      `;
      list.appendChild(card);
    });

    if (countEl) {
      countEl.textContent = `${restaurants.length}件`;
    }
  }, 400);
}

// ============================================================
// Utility: escape HTML to prevent XSS
// ============================================================
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// Map: initialize Google Maps legacy embed (no API key needed)
// To use Places API later: replace iframe src with Places API call
// ============================================================
function initMap(query, rName) {
  const container   = document.getElementById('map-container');
  const placeholder = document.getElementById('map-placeholder');
  const note        = document.getElementById('map-note');

  // Legacy embed URL — works without API key for basic map display
  const encodedQuery = encodeURIComponent(`${query} ${rName}`);
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
        <span>地図を表示できませんでした</span>
      `;
    }
  });

  container.appendChild(iframe);

  if (note) {
    note.textContent = '※ 地図はGoogle Maps埋め込み（参考表示）です。Google Places APIキー設定後に店舗ピンが表示されます。';
  }
}

// ============================================================
// Init
// ============================================================
function init() {
  // Set page title
  document.title = `${cuisineName}の店舗一覧 - 世界の料理を探そう`;

  // Set headings
  const headingEl = document.getElementById('cuisine-heading');
  const regionEl  = document.getElementById('region-label');
  if (headingEl) headingEl.textContent = cuisineName;
  if (regionEl)  regionEl.textContent  = regionName;

  // Update back button to restore region state
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.href = `index.html?region=${region}`;
  }

  // Get restaurants for this cuisine (fallback to japanese if unknown)
  const restaurants = DUMMY_RESTAURANTS[cuisineId] || DUMMY_RESTAURANTS['japanese'];
  renderRestaurants(restaurants);

  // Initialize map using cuisine query string
  const cuisineQuery = encodeURIComponent(cuisineId + ' restaurant');
  initMap(cuisineId + ' restaurant', regionName);
}

document.addEventListener('DOMContentLoaded', init);
