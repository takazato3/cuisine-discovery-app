'use strict';

// ============================================================
// URL Parameter Parsing
// ============================================================
const params = new URLSearchParams(window.location.search);
const cuisineId   = params.get('cuisine') || 'japanese';
const cuisineName = params.get('name')    || '料理ジャンル';
const area        = params.get('area')    || 'tokyo-23';

// ============================================================
// Area Definitions (mirrors app.js)
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

const areaData = AREAS[area] || AREAS['tokyo-23'];
const areaName  = areaData.name;

// ============================================================
// Representative Menu Items per Cuisine Genre
// ============================================================
const CUISINE_REPRESENTATIVE_MENUS = {
  thai:       'トムヤムクン・ガパオライス・パッタイ',
  vietnamese: 'フォー・バインミー・生春巻き',
  korean:     'サムギョプサル・ビビンバ・チヂミ',
  indian:     'バターチキンカレー・ナン・タンドリーチキン',
  mexican:    'タコス・ブリトー・ナチョス',
  italian:    'マルゲリータ・カルボナーラ・ティラミス',
  french:     'キッシュ・ガレット・ラタトゥイユ',
  chinese:    '麻婆豆腐・チャーハン・小籠包',
  greek:      'ムサカ・スブラキ・ギリシャサラダ',
  ethiopian:  'インジェラ・ドロワット・ティブス',
  peruvian:   'セビーチェ・ロモサルタード・アンティクーチョ',
  lebanese:   'フムス・ファラフェル・タブーレ',
  turkish:    'ケバブ・メゼ・バクラヴァ',
  spanish:    'パエリア・タパス・ガスパチョ',
  brazilian:  'シュラスコ・フェジョアーダ・ポンデケージョ',
  japanese:   'ラーメン・寿司・天ぷら',
  russian:    'ボルシチ・ピロシキ・ビーフストロガノフ',
  moroccan:   'タジン・クスクス・ハリラ',
};

// ============================================================
// Dummy Restaurant Data
// Structure ready to swap for Google Places API response
// ============================================================
const DUMMY_RESTAURANTS = {
  thai: [
    { name: 'バンコク亭 渋谷店',          rating: 4.3, ratingCount: 127, address: '東京都渋谷区道玄坂1-3-3',     distance: 320,  menuItems: ['トムヤムクン', 'ガパオライス', 'パッタイ'],          placeId: null },
    { name: 'チャオタイ 新宿店',          rating: 4.1, ratingCount: 89,  address: '東京都新宿区新宿3-4-5',       distance: 580,  menuItems: ['グリーンカレー', '生春巻き', 'カオマンガイ'],         placeId: null },
    { name: 'タイ屋台 999',               rating: 4.5, ratingCount: 312, address: '東京都港区南青山3-4-5',       distance: 720,  menuItems: ['パッタイ', 'トムヤムクン', 'マッサマンカレー'],       placeId: null },
    { name: 'ロイヤルタイ 六本木',        rating: 3.9, ratingCount: 64,  address: '東京都港区六本木5-6-7',       distance: 950,  menuItems: ['グリーンカレー', 'ガパオライス', '生春巻き'],         placeId: null },
    { name: 'マンゴーツリー東京',         rating: 4.4, ratingCount: 203, address: '東京都千代田区丸の内1-2-3',   distance: 1200, menuItems: ['カオマンガイ', 'トムヤムクン', 'パッタイ'],           placeId: null },
    { name: 'タイキッチン 恵比寿',        rating: 4.2, ratingCount: 91,  address: '東京都渋谷区恵比寿4-2-10',   distance: 1480, menuItems: ['ガパオライス', 'グリーンカレー', 'パッタイ'],         placeId: null },
  ],
  vietnamese: [
    { name: 'フォー・ベトナム 渋谷',      rating: 4.2, ratingCount: 98,  address: '東京都渋谷区宇田川町2-1',    distance: 280,  menuItems: ['フォー', 'バインミー', '生春巻き'],                   placeId: null },
    { name: 'アンコム 中目黒店',          rating: 4.4, ratingCount: 176, address: '東京都目黒区中目黒1-5-3',    distance: 640,  menuItems: ['コムタム', 'ブンチャー', 'フォー'],                   placeId: null },
    { name: 'サイゴン バインミー',        rating: 4.0, ratingCount: 55,  address: '東京都港区赤坂7-3-12',       distance: 870,  menuItems: ['バインミー', '生春巻き', 'フォー'],                   placeId: null },
    { name: 'ベトナム食堂 ĂNCƠM',        rating: 4.3, ratingCount: 141, address: '東京都新宿区大久保1-8-6',    distance: 1050, menuItems: ['ブンチャー', 'コムタム', 'バインミー'],               placeId: null },
    { name: 'ハノイの空 池袋店',          rating: 3.8, ratingCount: 43,  address: '東京都豊島区池袋2-11-4',     distance: 1310, menuItems: ['フォー', '生春巻き', 'ブンチャー'],                   placeId: null },
  ],
  korean: [
    { name: '韓国家庭料理 ハヌル',        rating: 4.5, ratingCount: 284, address: '東京都新宿区大久保1-12-6',   distance: 210,  menuItems: ['サムギョプサル', 'ビビンバ', 'キムチチゲ'],           placeId: null },
    { name: 'プルコギ亭 新大久保本店',    rating: 4.3, ratingCount: 198, address: '東京都新宿区百人町1-5-2',    distance: 350,  menuItems: ['プルコギ', 'サムギョプサル', 'チヂミ'],               placeId: null },
    { name: '本格韓国料理 ソウルガーデン', rating: 4.1, ratingCount: 112, address: '東京都渋谷区道玄坂2-6-17', distance: 590,  menuItems: ['ビビンバ', '冷麺', 'チヂミ'],                         placeId: null },
    { name: 'サムギョプサル専門店 コギ',  rating: 4.4, ratingCount: 237, address: '東京都港区六本木3-4-19',     distance: 820,  menuItems: ['サムギョプサル', 'キムチチゲ', 'チヂミ'],             placeId: null },
    { name: 'チキン&ビール ON',           rating: 4.2, ratingCount: 156, address: '東京都中央区銀座8-4-3',      distance: 1100, menuItems: ['ヤンニョムチキン', 'フライドチキン', 'ビビンバ'],     placeId: null },
    { name: 'チヂミ食堂 恵比寿',          rating: 3.9, ratingCount: 67,  address: '東京都渋谷区恵比寿1-23-8',  distance: 1350, menuItems: ['チヂミ', 'サムギョプサル', '冷麺'],                   placeId: null },
  ],
  indian: [
    { name: 'スパイス&カレー ムンバイ',   rating: 4.4, ratingCount: 189, address: '東京都渋谷区神南1-4-8',      distance: 390,  menuItems: ['バターチキンカレー', 'ナン', 'タンドリーチキン'],     placeId: null },
    { name: 'デリーキッチン 新宿',        rating: 4.2, ratingCount: 134, address: '東京都新宿区西新宿1-13-12',  distance: 620,  menuItems: ['ナン', 'バターチキンカレー', 'サモサ'],               placeId: null },
    { name: 'タンドール 赤坂',            rating: 4.5, ratingCount: 301, address: '東京都港区赤坂5-2-20',       distance: 780,  menuItems: ['タンドリーチキン', 'ビリヤニ', 'ナン'],               placeId: null },
    { name: 'ガンジー 銀座店',            rating: 4.0, ratingCount: 78,  address: '東京都中央区銀座6-10-1',     distance: 1020, menuItems: ['ビリヤニ', 'バターチキンカレー', 'サモサ'],           placeId: null },
    { name: 'ビリヤニ&カレー コルカタ',   rating: 4.3, ratingCount: 215, address: '東京都豊島区池袋1-25-3',     distance: 1290, menuItems: ['ビリヤニ', 'タンドリーチキン', 'ナン'],               placeId: null },
  ],
  mexican: [
    { name: 'タコス&バリート MESA',       rating: 4.1, ratingCount: 76,  address: '東京都渋谷区神宮前5-10-1',  distance: 450,  menuItems: ['タコス', 'ブリトー', 'ナチョス'],                     placeId: null },
    { name: 'エル・トリート 六本木',      rating: 4.3, ratingCount: 103, address: '東京都港区六本木7-8-5',      distance: 680,  menuItems: ['ブリトー', 'エンチラーダ', 'ワカモレ'],               placeId: null },
    { name: 'メキシカングリル AZTECA',    rating: 3.8, ratingCount: 42,  address: '東京都千代田区神田神保町2-3', distance: 920,  menuItems: ['タコス', 'ナチョス', 'エンチラーダ'],                 placeId: null },
    { name: 'カンクン 新宿店',            rating: 4.0, ratingCount: 61,  address: '東京都新宿区歌舞伎町1-14-7', distance: 1140, menuItems: ['タコス', 'ワカモレ', 'ブリトー'],                     placeId: null },
    { name: 'ケサディア&タコ BAJA',       rating: 4.2, ratingCount: 88,  address: '東京都目黒区自由が丘1-7-3',  distance: 1560, menuItems: ['ケサディア', 'タコス', 'ナチョス'],                   placeId: null },
  ],
  italian: [
    { name: 'トラットリア・チェルビーノ', rating: 4.5, ratingCount: 342, address: '東京都港区南青山5-8-2',      distance: 180,  menuItems: ['マルゲリータ', 'カルボナーラ', 'ティラミス'],         placeId: null },
    { name: 'ピッツェリア ナポリ 表参道',  rating: 4.4, ratingCount: 276, address: '東京都渋谷区神宮前4-12-10', distance: 430,  menuItems: ['マルゲリータ', 'ラザニア', 'リゾット'],               placeId: null },
    { name: 'リストランテ・サバティーニ',  rating: 4.6, ratingCount: 487, address: '東京都中央区銀座7-3-13',    distance: 670,  menuItems: ['カルボナーラ', 'ティラミス', 'リゾット'],             placeId: null },
    { name: 'オステリア バルカ',          rating: 4.2, ratingCount: 148, address: '東京都目黒区中目黒3-1-5',    distance: 890,  menuItems: ['マルゲリータ', 'カルボナーラ', 'ラザニア'],           placeId: null },
    { name: 'パスタ工房 ラ・フォルナーチェ', rating: 4.1, ratingCount: 109, address: '東京都新宿区四谷1-5-10', distance: 1100, menuItems: ['カルボナーラ', 'ラザニア', 'リゾット'],               placeId: null },
    { name: 'ダルマット 西麻布',          rating: 4.3, ratingCount: 194, address: '東京都港区西麻布3-2-17',     distance: 1340, menuItems: ['マルゲリータ', 'ティラミス', 'カルボナーラ'],         placeId: null },
  ],
  french: [
    { name: 'ビストロ・ル・コワン',       rating: 4.5, ratingCount: 213, address: '東京都港区南青山6-1-3',      distance: 260,  menuItems: ['フォアグラ', 'ブイヤベース', 'クレームブリュレ'],     placeId: null },
    { name: 'ブラッスリー ポール・ボキューズ 銀座', rating: 4.6, ratingCount: 521, address: '東京都中央区銀座3-5-1', distance: 540, menuItems: ['ブイヤベース', 'ラタトゥイユ', 'クロワッサン'],    placeId: null },
    { name: 'レストラン・ロオジエ',       rating: 4.7, ratingCount: 389, address: '東京都中央区銀座7-5-5',      distance: 720,  menuItems: ['フォアグラ', 'クレームブリュレ', 'ラタトゥイユ'],    placeId: null },
    { name: 'ビストロ NABE',              rating: 4.2, ratingCount: 87,  address: '東京都渋谷区恵比寿西1-4-1',  distance: 980,  menuItems: ['ブイヤベース', 'クロワッサン', 'フォアグラ'],         placeId: null },
    { name: 'カフェ・ド・フロール 表参道', rating: 4.0, ratingCount: 124, address: '東京都渋谷区神宮前4-9-3',  distance: 1210, menuItems: ['クロワッサン', 'ラタトゥイユ', 'クレームブリュレ'],   placeId: null },
  ],
  chinese: [
    { name: '横浜中華街 老上海',          rating: 4.3, ratingCount: 267, address: '東京都渋谷区道玄坂2-2-1',   distance: 300,  menuItems: ['小龍包', 'チャーハン', '麻婆豆腐'],                   placeId: null },
    { name: '四川料理 天府',              rating: 4.5, ratingCount: 412, address: '東京都新宿区新宿2-1-14',     distance: 550,  menuItems: ['麻婆豆腐', '担担麺', '北京ダック'],                   placeId: null },
    { name: '北京ダック専門店 全聚徳',    rating: 4.4, ratingCount: 338, address: '東京都中央区銀座4-2-15',     distance: 720,  menuItems: ['北京ダック', '小龍包', 'チャーハン'],                 placeId: null },
    { name: '飲茶・点心 桃園',            rating: 4.1, ratingCount: 156, address: '東京都港区赤坂3-19-8',       distance: 960,  menuItems: ['小龍包', '点心', 'チャーハン'],                       placeId: null },
    { name: '上海小龍包 蟹家',            rating: 4.2, ratingCount: 201, address: '東京都豊島区池袋2-3-8',      distance: 1180, menuItems: ['小龍包', '蟹みそ', 'チャーハン'],                     placeId: null },
    { name: '広東料理 龍宮',              rating: 4.0, ratingCount: 93,  address: '東京都台東区上野4-8-7',      distance: 1420, menuItems: ['北京ダック', '広東炒麺', '小龍包'],                   placeId: null },
  ],
  greek: [
    { name: 'オーパ！ギリシャ料理',      rating: 4.2, ratingCount: 68,  address: '東京都港区南青山3-16-6',     distance: 480,  menuItems: ['ムサカ', 'スブラキ', 'タラモサラタ'],                 placeId: null },
    { name: 'タベルナ・エレフシナ',       rating: 4.4, ratingCount: 95,  address: '東京都渋谷区神宮前1-11-6',  distance: 730,  menuItems: ['ギロス', 'スパナコピタ', 'ムサカ'],                   placeId: null },
    { name: 'ムサカ&ギロス DELPHI',      rating: 4.0, ratingCount: 51,  address: '東京都中央区銀座1-8-19',     distance: 1010, menuItems: ['ムサカ', 'ギロス', 'スブラキ'],                       placeId: null },
    { name: 'ギリシャキッチン アクロポリス', rating: 3.9, ratingCount: 37, address: '東京都新宿区四谷2-12-3', distance: 1280, menuItems: ['スブラキ', 'タラモサラタ', 'ギロス'],                 placeId: null },
    { name: 'オリーブ&フェタ SANTORINI', rating: 4.3, ratingCount: 82,  address: '東京都目黒区自由が丘2-9-4', distance: 1590, menuItems: ['タラモサラタ', 'スパナコピタ', 'ムサカ'],             placeId: null },
  ],
  ethiopian: [
    { name: 'アフリカンキッチン ADDIS',   rating: 4.3, ratingCount: 47,  address: '東京都新宿区百人町2-3-10',  distance: 620,  menuItems: ['インジェラ', 'ドロワット', 'シロ'],                   placeId: null },
    { name: 'エチオピアン・カフェ ハベシャ', rating: 4.5, ratingCount: 89, address: '東京都港区六本木5-18-20', distance: 890,  menuItems: ['インジェラ', 'キトフォ', 'ティブス'],                 placeId: null },
    { name: 'インジェラ食堂 ABYSSINIA',   rating: 4.1, ratingCount: 33,  address: '東京都豊島区西池袋5-14-2',  distance: 1150, menuItems: ['インジェラ', 'シロ', 'ドロワット'],                   placeId: null },
    { name: 'エチオピア料理 ルーシー',    rating: 4.0, ratingCount: 28,  address: '東京都渋谷区幡ヶ谷1-6-3',  distance: 1440, menuItems: ['ドロワット', 'ティブス', 'インジェラ'],               placeId: null },
    { name: 'カフア・コーヒー&エチオピアン', rating: 4.2, ratingCount: 61, address: '東京都台東区蔵前2-11-5', distance: 1780, menuItems: ['インジェラ', 'シロ', 'キトフォ'],                     placeId: null },
  ],
  peruvian: [
    { name: 'セビーチェ&ペルー料理 LIMA', rating: 4.4, ratingCount: 73,  address: '東京都港区南青山5-4-41',    distance: 540,  menuItems: ['セビーチェ', 'ロモサルタード', 'ピカロン'],           placeId: null },
    { name: 'ペルー食堂 MACHU PICCHU',    rating: 4.2, ratingCount: 56,  address: '東京都渋谷区神宮前6-8-1',  distance: 820,  menuItems: ['セビーチェ', 'アヒデガヤ', 'チチャロン'],             placeId: null },
    { name: 'アンデス料理 CUZCO',         rating: 4.1, ratingCount: 44,  address: '東京都新宿区新宿5-10-1',    distance: 1060, menuItems: ['ロモサルタード', 'セビーチェ', 'コンチタス'],         placeId: null },
    { name: 'ラ・マル・ペルー',           rating: 4.5, ratingCount: 108, address: '東京都中央区銀座5-7-10',    distance: 1320, menuItems: ['セビーチェ', 'ロモサルタード', 'ピカロン'],           placeId: null },
    { name: 'チチャ&ロモ サルタード',     rating: 3.9, ratingCount: 31,  address: '東京都目黒区中目黒4-1-7',   distance: 1640, menuItems: ['ロモサルタード', 'チチャロン', 'セビーチェ'],         placeId: null },
  ],
  lebanese: [
    { name: 'アラビア料理 BEIRUT',        rating: 4.3, ratingCount: 84,  address: '東京都港区元麻布3-1-5',     distance: 490,  menuItems: ['フムス', 'ファラフェル', 'タブレ'],                   placeId: null },
    { name: 'ファラフェル&フムス レバント', rating: 4.1, ratingCount: 62, address: '東京都渋谷区富ヶ谷1-30-2', distance: 760, menuItems: ['ファラフェル', 'フムス', 'バクラバ'],                  placeId: null },
    { name: 'レバノン家庭料理 TYRE',      rating: 4.4, ratingCount: 97,  address: '東京都新宿区市谷砂土原町2-2', distance: 1000, menuItems: ['キッベ', 'フムス', 'タブレ'],                       placeId: null },
    { name: 'シーダー・レストラン',       rating: 4.0, ratingCount: 48,  address: '東京都千代田区九段北4-1-8', distance: 1270, menuItems: ['タブレ', 'ファラフェル', 'キッベ'],                   placeId: null },
    { name: 'キッベ&タブレ SIDON',        rating: 3.8, ratingCount: 29,  address: '東京都豊島区目白3-4-18',    distance: 1560, menuItems: ['キッベ', 'タブレ', 'フムス'],                         placeId: null },
  ],
  turkish: [
    { name: 'イスタンブール・サライ',     rating: 4.3, ratingCount: 116, address: '東京都港区六本木6-2-31',    distance: 380,  menuItems: ['ドネルケバブ', 'バクラバ', 'ムサカ'],                 placeId: null },
    { name: 'ケバブ&メゼ OTTOMAN',        rating: 4.1, ratingCount: 78,  address: '東京都新宿区歌舞伎町1-2-10', distance: 610, menuItems: ['ケバブ', 'メゼ', 'バクラバ'],                         placeId: null },
    { name: 'アナトリア・キッチン',       rating: 4.4, ratingCount: 143, address: '東京都渋谷区恵比寿南1-8-3',  distance: 850,  menuItems: ['ドネルケバブ', 'ムサカ', 'ケバブ'],                   placeId: null },
    { name: 'トルコ料理 ボスポラス',      rating: 4.0, ratingCount: 59,  address: '東京都台東区浅草2-3-1',     distance: 1110, menuItems: ['ケバブ', 'バクラバ', 'シシカバブ'],                   placeId: null },
    { name: 'バクラバ&チャイ ANKARA',     rating: 4.2, ratingCount: 91,  address: '東京都品川区五反田1-15-8',  distance: 1380, menuItems: ['バクラバ', 'チャイ', 'ケバブ'],                       placeId: null },
  ],
  spanish: [
    { name: 'バル・デ・エスパーニャ',     rating: 4.4, ratingCount: 168, address: '東京都港区南青山3-12-5',    distance: 320,  menuItems: ['パエリア', 'タパス', 'チュロス'],                     placeId: null },
    { name: 'パエリア専門店 バレンシア',  rating: 4.3, ratingCount: 134, address: '東京都中央区銀座6-13-4',    distance: 580,  menuItems: ['パエリア', 'ガスパチョ', 'クロケタス'],               placeId: null },
    { name: 'タパス&バール SEVILLA',      rating: 4.2, ratingCount: 112, address: '東京都渋谷区神宮前5-52-2',  distance: 810,  menuItems: ['タパス', 'ガスパチョ', 'チュロス'],                   placeId: null },
    { name: 'レストラン・エル・カスティーヨ', rating: 4.5, ratingCount: 247, address: '東京都港区西麻布2-5-9', distance: 1050, menuItems: ['パエリア', 'ガスパチョ', 'タパス'],                   placeId: null },
    { name: 'ガウディ・バルセロナ',       rating: 4.1, ratingCount: 86,  address: '東京都新宿区新宿3-20-10',   distance: 1320, menuItems: ['タパス', 'パエリア', 'クロケタス'],                   placeId: null },
  ],
  brazilian: [
    { name: 'シュラスコ専門店 ブラジレイロ', rating: 4.4, ratingCount: 192, address: '東京都港区六本木7-14-4', distance: 430,  menuItems: ['シュラスコ', 'ピカーニャ', 'フェイジョアーダ'],       placeId: null },
    { name: 'ポルケッタ&フェイジョアーダ RIO', rating: 4.2, ratingCount: 87, address: '東京都渋谷区道玄坂1-20-4', distance: 670, menuItems: ['フェイジョアーダ', 'シュラスコ', 'ポンデケージョ'],  placeId: null },
    { name: 'ブラジル料理 サンパウロ',    rating: 4.1, ratingCount: 63,  address: '東京都新宿区高田馬場1-9-5', distance: 920,  menuItems: ['シュラスコ', 'コシーニャ', 'フェイジョアーダ'],       placeId: null },
    { name: 'チュラスカリア COPACABANA',  rating: 4.5, ratingCount: 271, address: '東京都千代田区丸の内3-4-1', distance: 1180, menuItems: ['シュラスコ', 'ピカーニャ', 'コシーニャ'],             placeId: null },
    { name: 'アマゾン・グリル',           rating: 3.9, ratingCount: 44,  address: '東京都品川区大崎1-2-12',    distance: 1490, menuItems: ['シュラスコ', 'フェイジョアーダ', 'ピカーニャ'],       placeId: null },
  ],
  japanese: [
    { name: '鮨 はた中 銀座',             rating: 4.7, ratingCount: 534, address: '東京都中央区銀座6-7-6',     distance: 250,  menuItems: ['寿司', '刺身', 'おまかせ'],                           placeId: null },
    { name: '懐石料理 嵐山',              rating: 4.6, ratingCount: 312, address: '東京都港区南青山4-18-11',   distance: 490,  menuItems: ['懐石料理', '天ぷら', 'お造り'],                       placeId: null },
    { name: '天ぷら みかわ',              rating: 4.5, ratingCount: 428, address: '東京都江東区福住1-3-1',     distance: 740,  menuItems: ['天ぷら', '天丼', '刺身'],                             placeId: null },
    { name: '焼鳥 とりいち 恵比寿',       rating: 4.3, ratingCount: 187, address: '東京都渋谷区恵比寿4-27-2',  distance: 960,  menuItems: ['焼鳥', 'つくね', 'もつ焼き'],                         placeId: null },
    { name: 'しゃぶしゃぶ すき焼き 木曽路', rating: 4.2, ratingCount: 143, address: '東京都新宿区新宿3-26-1', distance: 1200, menuItems: ['しゃぶしゃぶ', 'すき焼き', '牛タン'],                 placeId: null },
    { name: 'うどん 丸亀製麺 渋谷',       rating: 4.0, ratingCount: 356, address: '東京都渋谷区渋谷2-11-5',   distance: 1450, menuItems: ['うどん', '天ぷら', 'かけうどん'],                     placeId: null },
  ],
  russian: [
    { name: 'ロシア料理 サラファン',      rating: 4.3, ratingCount: 79,  address: '東京都港区六本木4-10-10',   distance: 560,  menuItems: ['ボルシチ', 'ピロシキ', 'ペリメニ'],                   placeId: null },
    { name: 'ボルシチの店 モスクワ',      rating: 4.1, ratingCount: 54,  address: '東京都新宿区新宿7-4-3',     distance: 810,  menuItems: ['ボルシチ', 'ブリヌイ', 'オリヴィエサラダ'],           placeId: null },
    { name: 'ピロシキ&ブリヌイ バイカル', rating: 4.2, ratingCount: 66,  address: '東京都渋谷区富ヶ谷2-22-10', distance: 1060, menuItems: ['ピロシキ', 'ブリヌイ', 'ボルシチ'],                   placeId: null },
    { name: 'カフェ・ロシア',             rating: 3.9, ratingCount: 38,  address: '東京都文京区本郷3-7-4',     distance: 1290, menuItems: ['ブリヌイ', 'オリヴィエサラダ', 'ボルシチ'],           placeId: null },
    { name: 'スラブ料理 ペテルブルク',    rating: 4.0, ratingCount: 47,  address: '東京都台東区上野桜木2-5-3', distance: 1540, menuItems: ['ペリメニ', 'ボルシチ', 'ブリヌイ'],                   placeId: null },
  ],
  moroccan: [
    { name: 'タジン専門店 マラケシュ',    rating: 4.4, ratingCount: 88,  address: '東京都港区南青山3-5-10',    distance: 510,  menuItems: ['タジン', 'クスクス', 'ハリラスープ'],                 placeId: null },
    { name: 'クスクス&タジン FEZZY',      rating: 4.2, ratingCount: 67,  address: '東京都渋谷区神宮前1-23-2',  distance: 760,  menuItems: ['クスクス', 'タジン', 'ミントティー'],                 placeId: null },
    { name: 'モロッコ料理 カサブランカ',  rating: 4.3, ratingCount: 94,  address: '東京都新宿区市谷本村町2-4',  distance: 1010, menuItems: ['タジン', 'バスティラ', 'クスクス'],                   placeId: null },
    { name: 'ミントティー&タジン サハラ', rating: 4.0, ratingCount: 51,  address: '東京都目黒区駒場1-22-4',   distance: 1290, menuItems: ['ミントティー', 'タジン', 'クスクス'],                 placeId: null },
    { name: 'アルガン・キッチン フェズ',  rating: 3.8, ratingCount: 34,  address: '東京都世田谷区三軒茶屋1-8-3', distance: 1610, menuItems: ['クスクス', 'タジン', 'ハリラスープ'],               placeId: null },
  ],
};

// ============================================================
// Cache: localStorage helpers
// Cache key: places_<cuisineId>_<area>
// TTL: 1 hour
// ============================================================
const CACHE_TTL = 3_600_000;

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL) return data;
  } catch (_) { /* ignore: private mode, parse error, etc. */ }
  return null;
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (_) { /* ignore: storage full, private mode, etc. */ }
}

// ============================================================
// Utility: Haversine distance in meters between two lat/lng points
// ============================================================
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6_371_000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

// ============================================================
// Places API (New): Text Search
// Note: max 20 results per call (Places API New does not support pagination)
// ============================================================
async function fetchFromPlacesAPI(queryCuisineName, queryArea) {
  const body = {
    textQuery: `${queryCuisineName} ${queryArea.name}`,
    languageCode: 'ja',
    maxResultCount: 20,
    locationBias: {
      circle: {
        center: { latitude: queryArea.lat, longitude: queryArea.lng },
        radius: queryArea.radius,
      },
    },
  };

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': CONFIG.GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.rating',
        'places.userRatingCount',
        'places.formattedAddress',
        'places.location',
        'places.photos',
        'places.currentOpeningHours',
      ].join(','),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Places API: HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'API error');

  return (json.places || []).map((place) => {
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    const weekdayDescriptions = place.currentOpeningHours?.weekdayDescriptions;
    return {
      name:        place.displayName?.text || '名称不明',
      rating:      place.rating    ?? 0,
      ratingCount: place.userRatingCount ?? 0,
      address:     place.formattedAddress || '',
      distance:    lat != null && lng != null
        ? calcDistance(queryArea.lat, queryArea.lng, lat, lng)
        : null,
      menuItems:   [],
      photoName:   place.photos?.[0]?.name || null,
      openNow:     place.currentOpeningHours?.openNow ?? null,
      todayHours:  getTodayHoursText(weekdayDescriptions),
      placeId:     place.id || null,
    };
  });
}

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
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// Utility: build photo URL from Places API (New) photo resource name
// ============================================================
function getPhotoUrl(photoName) {
  const apiKey = CONFIG.GOOGLE_MAPS_API_KEY;
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${apiKey}`;
}

// ============================================================
// Utility: extract today's hours text from weekdayDescriptions
// weekdayDescriptions: ["月曜日: 11:00~22:00", ...] index 0=Mon … 6=Sun
// JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
// ============================================================
function getTodayHoursText(weekdayDescriptions) {
  if (!weekdayDescriptions || weekdayDescriptions.length === 0) return null;
  const dayIndex = (new Date().getDay() + 6) % 7;
  const entry = weekdayDescriptions[dayIndex];
  if (!entry) return null;
  const colonIdx = entry.indexOf(': ');
  return colonIdx !== -1 ? entry.slice(colonIdx + 2) : entry;
}

// ============================================================
// Utility: render hours row HTML (hours + open/closed badge)
// ============================================================
function renderHoursRow(r) {
  const hoursText = r.todayHours || '要確認';
  let statusHtml = '';
  if (r.openNow === true) {
    statusHtml = ' <span class="open-status open-status--open">🟢 営業中</span>';
  } else if (r.openNow === false) {
    statusHtml = ' <span class="open-status open-status--closed">⚫ 閉店中</span>';
  }
  return `<div class="restaurant-hours">🕒 ${escapeHtml(hoursText)}${statusHtml}</div>`;
}

// ============================================================
// Pagination state
// ============================================================
const PAGE_SIZE = 10;
let currentPage = 0;
let allRestaurants = [];

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
  // Use <a> for real data with placeId, <div> for dummy data
  const card = document.createElement(r.placeId ? 'a' : 'div');
  card.className = 'restaurant-card';

  if (r.placeId) {
    card.href   = `https://www.google.com/maps/place/?q=place_id:${r.placeId}`;
    card.target = '_blank';
    card.rel    = 'noopener noreferrer';
  }

  const photoHtml = r.photoName
    ? `<img class="restaurant-photo" src="${getPhotoUrl(r.photoName)}" alt="${escapeHtml(r.name)}" loading="lazy">`
    : `<div class="restaurant-photo-placeholder">🍽️</div>`;

  card.innerHTML = `
    <div class="restaurant-photo-wrap">${photoHtml}</div>
    <div class="restaurant-card-body">
      <div class="restaurant-name">${escapeHtml(r.name)}</div>
      <div class="restaurant-rating">
        <span class="stars" aria-label="評価${r.rating}">${renderStars(r.rating)}</span>
        <span class="rating-value">${r.rating.toFixed(1)}</span>
        <span class="rating-count">(${r.ratingCount.toLocaleString('ja-JP')}件)</span>
      </div>
      <div class="restaurant-address">📍 ${escapeHtml(r.address)}</div>
      ${renderHoursRow(r)}
      ${r.menuItems && r.menuItems.length > 0 ? `
      <div class="popular-menu">
        <span class="menu-label">人気:</span>
        <span class="menu-items">${r.menuItems.slice(0, 3).map(escapeHtml).join('、')}</span>
      </div>` : ''}
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
  allRestaurants.slice(start, end).forEach((r) => {
    list.appendChild(createRestaurantCard(r));
  });

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

  // Prev button
  const prev = document.createElement('button');
  prev.className = 'pagination-btn';
  prev.textContent = '← 前へ';
  prev.disabled = page === 0;
  prev.addEventListener('click', () => goToPage(page - 1));
  container.appendChild(prev);

  // Page number buttons
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

  // Next button
  const next = document.createElement('button');
  next.className = 'pagination-btn';
  next.textContent = '次へ →';
  next.disabled = page === totalPages - 1;
  next.addEventListener('click', () => goToPage(page + 1));
  container.appendChild(next);
}

// ============================================================
// Render: go to a specific page and scroll to list top
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
function renderRestaurantCards(restaurants, isLive = false) {
  allRestaurants = restaurants;
  currentPage    = 0;

  const noteEl = document.getElementById('dummy-note');
  if (noteEl) {
    noteEl.textContent = isLive
      ? '※ Google Places APIの実データを表示しています。'
      : '※ 現在はダミーデータを表示しています。Google Places API連携後に実データに切り替わります。';
  }

  renderPagedCards(0);
}

// ============================================================
// Render: show API error banner
// ============================================================
function showApiError() {
  const el = document.getElementById('api-error');
  if (el) el.hidden = false;
}

// ============================================================
// Map: initialize Google Maps legacy embed
// ============================================================
function initMap(query, displayName) {
  const container   = document.getElementById('map-container');
  const placeholder = document.getElementById('map-placeholder');
  const note        = document.getElementById('map-note');

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
async function init() {
  // Set page title
  document.title = `${cuisineName}の店舗一覧 - 世界の料理を探そう`;

  // Set headings
  const headingEl   = document.getElementById('cuisine-heading');
  const regionEl    = document.getElementById('region-label');
  const menuLabelEl = document.getElementById('cuisine-menu-label');
  if (headingEl) headingEl.textContent = cuisineName;
  if (regionEl)  regionEl.textContent  = areaName;
  if (menuLabelEl) {
    const menuText = CUISINE_REPRESENTATIVE_MENUS[cuisineId];
    menuLabelEl.textContent = menuText ? `代表メニュー: ${menuText}` : '';
  }

  // Update back button to restore area state
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.href = `index.html?area=${area}`;

  // Initialize map
  initMap(cuisineId + ' restaurant', areaName);

  // ---- Restaurant data loading ----
  const cacheKey = `places_${cuisineId}_${area}`;
  const fallback = DUMMY_RESTAURANTS[cuisineId] || DUMMY_RESTAURANTS['japanese'];

  showSkeletons();

  // 1. Check localStorage cache first (valid for 1 hour)
  const cached = getCached(cacheKey);
  if (cached) {
    renderRestaurantCards(cached, true);
    return;
  }

  // 2. Detect whether a real API key has been configured
  const apiKey        = (typeof CONFIG !== 'undefined') ? CONFIG.GOOGLE_MAPS_API_KEY : null;
  const apiConfigured = Boolean(apiKey && apiKey !== 'YOUR_API_KEY_HERE');

  if (apiConfigured) {
    // 3a. Fetch from Places API
    try {
      const results = await fetchFromPlacesAPI(cuisineName, areaData);
      if (results.length === 0) throw new Error('検索結果が0件でした');
      setCache(cacheKey, results);
      renderRestaurantCards(results, true);
    } catch (err) {
      console.error('Places API error:', err);
      showApiError();
      renderRestaurantCards(fallback, false);
    }
  } else {
    // 3b. No API key — use dummy data with simulated async delay
    setTimeout(() => renderRestaurantCards(fallback, false), 400);
  }
}

document.addEventListener('DOMContentLoaded', init);
