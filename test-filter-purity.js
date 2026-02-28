#!/usr/bin/env node
'use strict';

// test-filter-purity.js
// Google Places API の2次フィルタ効果を検証するスクリプト
// primaryTypeだけでなく、typesに特定タグが含まれるかで
// 2次フィルタをかけた場合の純度を確認する
// Usage: GOOGLE_MAPS_API_KEY=your_key node test-filter-purity.js
//        node test-filter-purity.js > filter-purity-results.txt

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('Error: GOOGLE_MAPS_API_KEY environment variable is not set.');
  process.exit(1);
}

const queries = [
  {
    label: 'ペルー料理',
    query: 'peruvian restaurant',
    filterTag: 'peruvian_restaurant',
  },
  {
    label: 'アルゼンチン料理',
    query: 'argentinian restaurant',
    filterTag: 'argentinian_restaurant',
  },
  {
    label: 'トルコ料理',
    query: 'turkish restaurant',
    filterTag: 'turkish_restaurant',
  },
  {
    label: '中東料理',
    query: 'middle eastern restaurant',
    filterTag: 'middle_eastern_restaurant',
  },
  {
    label: '南インド料理',
    query: 'south indian restaurant',
    filterTag: 'south_indian_restaurant',
  },
  {
    label: 'インド料理',
    query: 'indian restaurant',
    filterTag: 'indian_restaurant',
  },
  {
    label: 'シンガポール料理',
    query: 'singaporean restaurant',
    filterTag: 'singaporean_restaurant',
  },
  {
    label: 'モンゴル料理',
    query: 'mongolian restaurant',
    filterTag: 'mongolian_restaurant',
  },
  {
    label: 'イギリス料理',
    query: 'british restaurant',
    filterTag: 'british_restaurant',
  },
  {
    label: 'インドネシア料理',
    query: 'indonesian restaurant',
    filterTag: 'indonesian_restaurant',
  },
  {
    label: 'マレーシア料理',
    query: 'malaysian restaurant',
    filterTag: 'malaysian_restaurant',
  },
  {
    label: 'ウズベキスタン料理',
    query: 'uzbek restaurant',
    filterTag: 'uzbek_restaurant',
  },
];

const areaConfig = {
  center: { lat: 35.6762, lng: 139.6503 },
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
  console.log(`=== Google Places API 2次フィルタ純度検証 ===`);
  console.log(`実行日時: ${timestamp}`);
  console.log(`エリア: 東京23区中心 (lat: ${areaConfig.center.lat}, lng: ${areaConfig.center.lng}, radius: ${areaConfig.radius}m)`);
  console.log(`クエリ数: ${queries.length}件`);

  for (const item of queries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`=== ${item.label} (${item.query}) ===`);
    console.log(`フィルタタグ: ${item.filterTag}`);
    console.log(`${'='.repeat(60)}`);

    let results;
    try {
      results = await searchRestaurants(item.query, areaConfig);
    } catch (err) {
      console.error(`  ⚠ API失敗: ${err.message}`);
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    console.log(`\n【検索結果】`);
    console.log(`総ヒット件数: ${results.length}件`);

    // 2次フィルタ適用
    const filtered = results.filter(r => {
      return r.types && r.types.includes(item.filterTag);
    });

    console.log(`\n【2次フィルタ適用後】`);
    console.log(`フィルタ後件数: ${filtered.length}件`);
    if (results.length > 0) {
      console.log(`純度: ${((filtered.length / results.length) * 100).toFixed(1)}%`);
    } else {
      console.log(`純度: N/A（検索結果0件）`);
    }
    console.log(`除外件数: ${results.length - filtered.length}件`);

    // フィルタで除外された店舗を表示
    const excluded = results.filter(r => {
      return !r.types || !r.types.includes(item.filterTag);
    });

    if (excluded.length > 0) {
      console.log(`\n【除外された店舗（最大10件）】`);
      excluded.slice(0, 10).forEach((r, i) => {
        console.log(`${i + 1}. ${r.displayName?.text || '名称不明'}`);
        console.log(`   primaryType: ${r.primaryType || 'N/A'}`);
        console.log(`   types: ${r.types ? r.types.filter(t => !['restaurant', 'food', 'point_of_interest', 'establishment'].includes(t)).join(', ') : 'N/A'}`);
      });
    }

    // フィルタ後の店舗例を表示
    if (filtered.length > 0) {
      console.log(`\n【フィルタ後の店舗（最大10件）】`);
      filtered.slice(0, 10).forEach((r, i) => {
        console.log(`${i + 1}. ${r.displayName?.text || '名称不明'}`);
        console.log(`   primaryType: ${r.primaryType || 'N/A'}`);
        console.log(`   types: ${r.types ? r.types.filter(t => !['restaurant', 'food', 'point_of_interest', 'establishment'].includes(t)).join(', ') : 'N/A'}`);
      });
    } else {
      console.log(`\n⚠️ フィルタタグ "${item.filterTag}" を持つ店舗が0件`);
      console.log(`→ このカテゴリは使用不可`);
    }

    // 判定
    if (results.length === 0) {
      console.log(`\n【判定】`);
      console.log(`❌ 使用不可（検索結果0件）`);
    } else {
      const purity = (filtered.length / results.length) * 100;
      console.log(`\n【判定】`);
      if (filtered.length === 0) {
        console.log(`❌ 使用不可（フィルタタグが存在しない）`);
      } else if (purity >= 95) {
        console.log(`✅ 優秀（純度${purity.toFixed(1)}%）`);
      } else if (purity >= 80) {
        console.log(`⭕ 使用可（純度${purity.toFixed(1)}%、2次フィルタ必須）`);
      } else if (purity >= 50) {
        console.log(`⚠️ 要検討（純度${purity.toFixed(1)}%、統合を推奨）`);
      } else {
        console.log(`❌ 使用不可（純度${purity.toFixed(1)}%）`);
      }
    }

    // レート制限対策: 200msウェイト
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`=== 検証完了 ===`);
  console.log(`${'='.repeat(60)}`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
