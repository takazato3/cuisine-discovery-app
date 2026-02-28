#!/usr/bin/env node
'use strict';

// update-discoveries.js
// Searches Google Places API for rare cuisines (1-10 results in an area)
// and writes the findings to discoveries.json
// Usage: GOOGLE_MAPS_API_KEY=your_key node update-discoveries.js

const fs   = require('fs');
const path = require('path');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('Error: GOOGLE_MAPS_API_KEY environment variable is not set.');
  process.exit(1);
}

// ============================================================
// Target rare cuisines
// ============================================================
const RARE_CUISINES = [
  { name: 'ネパール料理',                  flag: '🇳🇵', query: 'nepali restaurant OR ネパール料理 OR ダルバート OR モモ OR ネパール民族料理' },
  { name: '地中海料理',                    flag: '🌊', query: 'mediterranean restaurant OR 地中海料理' },
  { name: '中・東欧料理',                  flag: '🇦🇹', query: 'austrian restaurant OR czech restaurant OR hungarian restaurant OR polish restaurant OR swiss restaurant OR オーストリア料理 OR チェコ料理 OR ハンガリー料理 OR ポーランド料理 OR スイス料理' },
  { name: 'ウズベキスタン・中央アジア料理', flag: '🇺🇿', query: 'uzbek restaurant OR central asian restaurant OR ウズベキスタン料理 OR プロフ OR マンティ OR 中央アジア料理' },
  { name: 'ロシア・旧ソ連系料理',          flag: '🇷🇺', query: 'russian restaurant OR ukrainian restaurant OR georgian restaurant OR ロシア料理 OR ウクライナ料理 OR ジョージア料理 OR ボルシチ OR シュクメルリ' },
  { name: 'イラン料理',                    flag: '🇮🇷', query: 'persian restaurant OR iranian restaurant OR イラン料理 OR ペルシャ料理 OR フェセンジャン' },
  { name: 'フィリピン料理',                flag: '🇵🇭', query: 'filipino restaurant OR フィリピン料理 OR アドボ' },
  { name: 'アルゼンチン料理',              flag: '🇦🇷', query: 'argentinian restaurant OR アルゼンチン料理 OR アサード OR エンパナーダ' },
  { name: 'カリブ料理',                    flag: '🇯🇲', query: 'jamaican restaurant OR cuban restaurant OR caribbean restaurant OR ジャマイカ料理 OR キューバ料理 OR ジャークチキン' },
];

// ============================================================
// Areas (same as app.js / update-counts.js)
// ============================================================
const AREAS = {
  'tokyo-23':          { name: '東京23区',             lat: 35.6762, lng: 139.6503, radius: 15000 },
  'tokyo-outside':     { name: '東京（23区外）',        lat: 35.7141, lng: 139.3627, radius: 20000 },
  'yokohama-kawasaki': { name: '横浜・川崎',            lat: 35.4437, lng: 139.6380, radius: 15000 },
  'kanagawa-other':    { name: '神奈川（横浜・川崎以外）', lat: 35.3387, lng: 139.2779, radius: 25000 },
};

// ============================================================
// Utility: extract ward/city name from a Japanese address
// e.g. "東京都渋谷区神南1-4-8" → "渋谷区"
// ============================================================
function extractAreaName(address) {
  const m = address.match(/([^\s都道府県]+[区市町村])/);
  return m ? m[1] : '';
}

// ============================================================
// Utility: format date as YYYY-MM-DD (UTC)
// ============================================================
function formatDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ============================================================
// Search one cuisine × one area via Places API (New) Text Search
// Returns restaurant array if count is 1–10, otherwise null
// ============================================================
async function searchCuisine(cuisine, area) {
  const body = {
    textQuery:    `${cuisine.query} ${area.name}`,
    languageCode: 'ja',
    maxResultCount: 20,
    includedType: 'restaurant',
    locationBias: {
      circle: {
        center: { latitude: area.lat, longitude: area.lng },
        radius: area.radius,
      },
    },
  };

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type':     'application/json',
      'X-Goog-Api-Key':   API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'API error');

  const places = json.places || [];
  if (places.length < 1 || places.length > 10) return null;

  return places.map((place) => ({
    name:    place.displayName?.text || '名称不明',
    address: place.formattedAddress  || '',
    placeId: place.id                || null,
    area:    extractAreaName(place.formattedAddress || ''),
  }));
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('=== update-discoveries.js ===');
  console.log(`Searching ${RARE_CUISINES.length} rare cuisines × ${Object.keys(AREAS).length} areas...\n`);

  // Map: cuisine.name → discovery entry
  const discoveryMap = new Map();

  for (const cuisine of RARE_CUISINES) {
    console.log(`\n🍽️  ${cuisine.name}`);

    for (const [areaId, area] of Object.entries(AREAS)) {
      try {
        const restaurants = await searchCuisine(cuisine, area);
        if (restaurants) {
          console.log(`  ✓ ${area.name}: ${restaurants.length}件 (rare!)`);
          if (!discoveryMap.has(cuisine.name)) {
            discoveryMap.set(cuisine.name, {
              cuisineName: cuisine.name,
              flag:        cuisine.flag,
              totalCount:  0,
              byArea:      {},
            });
          }
          const entry = discoveryMap.get(cuisine.name);
          entry.byArea[areaId] = { count: restaurants.length, restaurants };
          entry.totalCount    += restaurants.length;
        } else {
          console.log(`  - ${area.name}: スキップ（0件または11件以上）`);
        }
      } catch (err) {
        console.warn(`  ⚠ ${area.name}: API失敗 — ${err.message}`);
      }

      // 200ms delay between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const discoveries = [...discoveryMap.values()].filter(
    (d) => Object.keys(d.byArea).length > 0,
  );

  const output = {
    lastUpdated: formatDate(new Date()),
    discoveries,
  };

  const outPath = path.join(__dirname, 'discoveries.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\n✅ Done. Found ${discoveries.length} rare cuisine(s). Saved to discoveries.json`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  // Exit 0 so the workflow is treated as successful (retry next week)
  process.exit(0);
});
