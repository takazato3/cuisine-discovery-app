#!/usr/bin/env node
'use strict';

// test-queries.js
// Google Places API の検索挙動を調査するスクリプト
// 各クエリで実際にどんな店舗が返ってくるか確認する
// Usage: GOOGLE_MAPS_API_KEY=your_key node test-queries.js
//        node test-queries.js > query-test-results.txt

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('Error: GOOGLE_MAPS_API_KEY environment variable is not set.');
  process.exit(1);
}

const queries = [
  { label: 'ペルー料理',       query: 'peruvian restaurant' },
  { label: 'アルゼンチン料理', query: 'argentinian restaurant' },
  { label: 'トルコ料理',       query: 'turkish restaurant' },
  { label: '中東料理',         query: 'middle eastern restaurant' },
  { label: '南インド料理',     query: 'south indian restaurant' },
  { label: 'インド料理',       query: 'indian restaurant' },
  { label: 'シンガポール料理', query: 'singaporean restaurant' },
  { label: 'モンゴル料理',     query: 'mongolian restaurant' },
  { label: 'イギリス料理',     query: 'british restaurant' },
];

const areaConfig = {
  center: { lat: 35.6762, lng: 139.6503 },  // 東京23区
  radius: 12000,
};

// ============================================================
// Search restaurants using Places API (New) Text Search
// ============================================================
async function searchRestaurants(query, area) {
  const body = {
    textQuery:      query,
    languageCode:   'ja',
    maxResultCount: 20,
    includedType:   'restaurant',
    locationBias: {
      circle: {
        center: { latitude: area.center.lat, longitude: area.center.lng },
        radius: area.radius,
      },
    },
  };

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type':     'application/json',
      'X-Goog-Api-Key':   API_KEY,
      // types と primaryType を含めるためのフィールドマスク
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types,places.primaryType',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'API error');

  return json.places || [];
}

// ============================================================
// Main
// ============================================================
async function main() {
  const timestamp = new Date().toISOString();
  console.log(`=== Google Places API 検索挙動調査 ===`);
  console.log(`実行日時: ${timestamp}`);
  console.log(`エリア: 東京23区中心 (lat: ${areaConfig.center.lat}, lng: ${areaConfig.center.lng}, radius: ${areaConfig.radius}m)`);
  console.log(`クエリ数: ${queries.length}件\n`);

  for (const item of queries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`=== ${item.label} (${item.query}) ===`);
    console.log(`${'='.repeat(60)}`);

    let results;
    try {
      results = await searchRestaurants(item.query, areaConfig);
    } catch (err) {
      console.error(`  ⚠ API失敗: ${err.message}`);
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    console.log(`ヒット件数: ${results.length}件`);

    if (results.length > 0) {
      // types の集計（全件）
      const typeCount = {};
      const primaryTypeCount = {};
      for (const r of results) {
        for (const t of (r.types || [])) {
          typeCount[t] = (typeCount[t] || 0) + 1;
        }
        const pt = r.primaryType || '(なし)';
        primaryTypeCount[pt] = (primaryTypeCount[pt] || 0) + 1;
      }

      // primaryType 集計
      console.log('\n【primaryType 集計（全件）】');
      const sortedPrimary = Object.entries(primaryTypeCount).sort((a, b) => b[1] - a[1]);
      for (const [type, count] of sortedPrimary) {
        const bar = '█'.repeat(Math.min(count, 20));
        console.log(`  ${type.padEnd(40)} ${bar} ${count}件`);
      }

      // types 集計（restaurant / food 以外）
      const interestingTypes = Object.entries(typeCount)
        .filter(([t]) => !['restaurant', 'food', 'point_of_interest', 'establishment'].includes(t))
        .sort((a, b) => b[1] - a[1]);

      if (interestingTypes.length > 0) {
        console.log('\n【types 集計（上位10件、汎用タグ除く）】');
        for (const [type, count] of interestingTypes.slice(0, 10)) {
          const bar = '█'.repeat(Math.min(count, 20));
          console.log(`  ${type.padEnd(40)} ${bar} ${count}件`);
        }
      }

      // 最初の5件詳細
      console.log('\n【最初の5件詳細】');
      results.slice(0, 5).forEach((r, i) => {
        console.log(`\n${i + 1}. ${r.displayName?.text || '名称不明'}`);
        console.log(`   住所: ${r.formattedAddress || 'N/A'}`);
        console.log(`   primaryType: ${r.primaryType || 'N/A'}`);
        console.log(`   types: [${(r.types || []).join(', ')}]`);
      });
    }

    // レート制限対策: 200msウェイト
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`=== 調査完了 ===`);
  console.log(`${'='.repeat(60)}`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
