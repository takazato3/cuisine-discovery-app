#!/usr/bin/env node
'use strict';

// survey-tokyo.js
// 東京23区における指定クエリの店舗数を Google Places API (New) で調査する
// Requires Node.js 18+ (uses global fetch)
// Usage: GOOGLE_MAPS_API_KEY=your_key node survey-tokyo.js

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('Error: GOOGLE_MAPS_API_KEY environment variable is not set.');
  process.exit(1);
}

// 調査エリア: 東京23区
const AREA = {
  name: '東京23区',
  lat: 35.6762,
  lng: 139.6503,
  radius: 15000,
};

// 調査対象クエリ
// OR で結ばれたものは個別クエリに分割し、重複ID除去で集計する
const SURVEYS = [
  {
    label: '町中華・チェーン系中華',
    queries: ['町中華', '日高屋', '餃子の王将', 'バーミヤン'],
  },
  {
    label: '本格中華料理',
    queries: ['本格中華', '四川料理', '広東料理', '上海料理'],
  },
  {
    label: '台湾料理',
    queries: ['台湾料理'],
  },
  {
    label: '南インド料理',
    queries: ['南インド料理', 'ミールス', 'ドーサ'],
  },
  {
    label: 'インド・ネパール料理',
    queries: ['インド料理', 'ネパール料理'],
  },
];

// ============================================================
// Places API (New) Text Search で place ID 一覧を取得する
// 最大 20 件/リクエスト の制限に注意
// ============================================================
async function fetchPlaceIds(query) {
  const body = {
    textQuery: `${query} ${AREA.name}`,
    languageCode: 'ja',
    maxResultCount: 20,
    locationBias: {
      circle: {
        center: { latitude: AREA.lat, longitude: AREA.lng },
        radius: AREA.radius,
      },
    },
  };

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type':     'application/json',
      'X-Goog-Api-Key':   API_KEY,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'API error');

  return (json.places || []).map(p => p.id);
}

// ============================================================
// 1 調査項目を処理: 各サブクエリを順次呼び出し、ユニーク件数を返す
// ============================================================
async function surveyItem(item) {
  const allIds = new Set();
  const details = [];

  for (const q of item.queries) {
    let ids;
    try {
      ids = await fetchPlaceIds(q);
      details.push(`    "${q}": ${ids.length} 件`);
      ids.forEach(id => allIds.add(id));
    } catch (err) {
      details.push(`    "${q}": ERROR — ${err.message}`);
    }

    // API レート制限対策: 200ms 待機
    await new Promise(r => setTimeout(r, 200));
  }

  return { uniqueCount: allIds.size, details };
}

// ============================================================
// メイン
// ============================================================
async function main() {
  console.log('================================================');
  console.log('  東京23区 店舗数調査 (Google Places API New)');
  console.log('================================================');
  console.log(`エリア  : ${AREA.name}`);
  console.log(`中心座標: ${AREA.lat}, ${AREA.lng}  半径: ${AREA.radius / 1000} km`);
  console.log(`調査日  : ${new Date().toLocaleDateString('ja-JP')}`);
  console.log('');
  console.log('注意: Places API は 1 リクエストあたり最大 20 件を返します。');
  console.log('      実際の店舗数が 20 件を超える場合は過小評価になります。');
  console.log('      OR クエリは個別リクエストに分解し、重複 ID を除去して集計します。');
  console.log('================================================\n');

  const results = [];

  for (const item of SURVEYS) {
    console.log(`[調査中] ${item.label}`);
    console.log(`  クエリ: ${item.queries.map(q => `"${q}"`).join(' OR ')}`);

    const { uniqueCount, details } = await surveyItem(item);

    console.log('  サブクエリ内訳:');
    details.forEach(d => console.log(d));
    console.log(`  重複除去後 ユニーク件数: ${uniqueCount} 件\n`);

    results.push({ label: item.label, count: uniqueCount });
  }

  // ========== サマリー ==========
  console.log('================================================');
  console.log('  集計結果サマリー');
  console.log('================================================');
  const labelWidth = Math.max(...results.map(r => [...r.label].length)) + 2;
  for (const r of results) {
    const padded = r.label.padEnd(labelWidth, '　');
    console.log(`  ${padded}: ${r.count.toString().padStart(3)} 件`);
  }
  console.log('================================================');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
