#!/usr/bin/env node
'use strict';

// update-cuisine-data.js
// Fetches restaurant details from Google Places API for all cuisines × areas,
// saves results to cuisine-data.json, and updates store counts in app.js.
// Replaces update-counts.js — run this script instead.
//
// Usage: GOOGLE_MAPS_API_KEY=your_key node update-cuisine-data.js

const fs   = require('fs');
const path = require('path');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('Error: GOOGLE_MAPS_API_KEY environment variable is not set.');
  process.exit(1);
}

// ============================================================
// Area definitions — must match AREAS in app.js
// ============================================================
const AREAS = {
  'tokyo-23':          { name: '東京23区',               lat: 35.6762, lng: 139.6503, radius: 15000 },
  'tokyo-outside':     { name: '東京（23区外）',          lat: 35.7141, lng: 139.3627, radius: 20000 },
  'yokohama-kawasaki': { name: '横浜・川崎',              lat: 35.4437, lng: 139.6380, radius: 15000 },
  'kanagawa-other':    { name: '神奈川（横浜・川崎以外）', lat: 35.3387, lng: 139.2779, radius: 25000 },
};

// ============================================================
// Cuisine definitions — must match CUISINES in app.js (23 genres)
// ============================================================
const CUISINES = [
  { id: 'thai',           name: 'タイ料理',           query: 'thai restaurant' },
  { id: 'vietnamese',     name: 'ベトナム料理',       query: 'vietnamese restaurant' },
  { id: 'korean',         name: '韓国料理',           query: 'korean restaurant' },
  { id: 'indian-nepali',  name: 'インド・ネパール料理', query: 'indian restaurant OR nepali restaurant' },
  { id: 'south-indian',   name: '南インド料理',       query: 'south indian restaurant OR ミールス OR ドーサ' },
  { id: 'machi-chuka',    name: '町中華',             query: '中華料理 OR ラーメン OR 餃子' },
  { id: 'honkaku-chuka',  name: '本格中華',           query: '本格中華 OR 四川料理 OR 広東料理 OR 上海料理' },
  { id: 'taiwanese',      name: '台湾料理',           query: '台湾料理 OR 魯肉飯' },
  { id: 'mexican',        name: 'メキシコ料理',       query: 'mexican restaurant' },
  { id: 'italian',        name: 'イタリア料理',       query: 'italian restaurant' },
  { id: 'french',         name: 'フランス料理',       query: 'french restaurant' },
  { id: 'greek',          name: 'ギリシャ料理',       query: 'greek restaurant' },
  { id: 'middle-eastern', name: '中東料理',           query: 'middle eastern restaurant OR lebanese restaurant' },
  { id: 'peruvian',       name: 'ペルー料理',         query: 'peruvian restaurant' },
  { id: 'turkish',        name: 'トルコ料理',         query: 'turkish restaurant' },
  { id: 'spanish',        name: 'スペイン料理',       query: 'spanish restaurant' },
  { id: 'brazilian',      name: 'ブラジル料理',       query: 'brazilian restaurant' },
  { id: 'african',        name: 'アフリカ料理',       query: 'african restaurant OR ethiopian restaurant OR moroccan restaurant' },
  { id: 'sri-lankan',     name: 'スリランカ料理',     query: 'sri lankan restaurant' },
  { id: 'mongolian',      name: 'モンゴル料理',       query: 'mongolian restaurant' },
  { id: 'singaporean',    name: 'シンガポール料理',   query: 'singaporean restaurant' },
  { id: 'uzbek',          name: 'ウズベキスタン料理', query: 'uzbek restaurant' },
  { id: 'british',        name: 'イギリス料理',       query: 'british restaurant' },
];

// ============================================================
// Address-based area filtering
// Removes restaurants whose address falls outside the target area.
// ============================================================
function filterByArea(restaurants, areaKey) {
  const OUTSIDE_CITIES = /八王子|町田|立川|府中|調布|三鷹|武蔵野|小金井|国分寺|国立|狛江|東大和|清瀬|東久留米|武蔵村山|多摩|稲城|羽村|あきる野|西東京/;
  return restaurants.filter(r => {
    const addr = r.address;
    switch (areaKey) {
      case 'tokyo-23':
        return addr.includes('東京都') && !OUTSIDE_CITIES.test(addr) &&
               !addr.match(/瑞穂|日の出|檜原|奥多摩/);
      case 'tokyo-outside':
        return addr.includes('東京都') && OUTSIDE_CITIES.test(addr);
      case 'yokohama-kawasaki':
        return addr.includes('横浜市') || addr.includes('川崎市');
      case 'kanagawa-other':
        return addr.includes('神奈川県') &&
               !addr.includes('横浜市') && !addr.includes('川崎市');
      default:
        return true;
    }
  });
}

// ============================================================
// Haversine distance (meters)
// ============================================================
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6_371_000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

// ============================================================
// Extract today's opening hours from weekdayDescriptions array
// ============================================================
function getTodayHoursText(weekdayDescriptions) {
  if (!weekdayDescriptions || weekdayDescriptions.length === 0) return null;
  const dayIndex = (new Date().getDay() + 6) % 7; // 0=Mon … 6=Sun
  const entry = weekdayDescriptions[dayIndex];
  if (!entry) return null;
  const colonIdx = entry.indexOf(': ');
  return colonIdx !== -1 ? entry.slice(colonIdx + 2) : entry;
}

// ============================================================
// Fetch restaurants for one cuisine × area (single page, 20 results)
// Returns array of restaurant objects with full details.
// ============================================================
async function fetchRestaurants(cuisine, areaId, area) {
  const body = {
    textQuery: `${cuisine.query} ${area.name}`,
    languageCode: 'ja',
    maxResultCount: 20,
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

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'API error');

  return (json.places || []).map(place => {
    const lat = place.location?.latitude  ?? null;
    const lng = place.location?.longitude ?? null;
    return {
      name:        place.displayName?.text || '名称不明',
      rating:      place.rating            ?? 0,
      ratingCount: place.userRatingCount   ?? 0,
      address:     place.formattedAddress  || '',
      lat,
      lng,
      distance:    (lat != null && lng != null)
        ? calcDistance(area.lat, area.lng, lat, lng)
        : null,
      photoName:   place.photos?.[0]?.name || null,
      todayHours:  getTodayHoursText(place.currentOpeningHours?.weekdayDescriptions),
      placeId:     place.id || null,
    };
  });
}

// ============================================================
// Format date as YYYY-MM-DD (UTC)
// ============================================================
function formatDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('=== update-cuisine-data.js ===');
  console.log(`${CUISINES.length} cuisines × ${Object.keys(AREAS).length} areas\n`);

  const today  = formatDate(new Date());
  const result = { lastUpdated: today, data: {} };

  let totalOk   = 0;
  let totalFail = 0;

  for (const cuisine of CUISINES) {
    result.data[cuisine.id] = { name: cuisine.name };
    console.log(`\n🍽️  ${cuisine.name}`);

    for (const [areaId, area] of Object.entries(AREAS)) {
      let restaurants = [];
      try {
        const raw = await fetchRestaurants(cuisine, areaId, area);
        restaurants = filterByArea(raw, areaId);
        console.log(`  ✓ ${areaId}: ${raw.length}件取得 → ${restaurants.length}件（住所フィルタ後）`);
        totalOk++;
      } catch (err) {
        console.warn(`  ⚠ ${areaId}: 失敗 — ${err.message}`);
        totalFail++;
      }

      result.data[cuisine.id][areaId] = {
        count:       restaurants.length,
        restaurants,
      };

      // 200ms pause between API requests
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // ---- Save cuisine-data.json ----
  const jsonPath = path.join(__dirname, 'cuisine-data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n✅ cuisine-data.json を保存しました`);

  // ---- Update app.js counts ----
  const appJsPath = path.join(__dirname, 'app.js');
  let appContent;
  try {
    appContent = fs.readFileSync(appJsPath, 'utf8');
  } catch (err) {
    console.error(`Error: app.js を読み込めません: ${err.message}`);
    process.exit(1);
  }

  for (const cuisine of CUISINES) {
    for (const areaId of Object.keys(AREAS)) {
      const count    = result.data[cuisine.id]?.[areaId]?.count ?? 0;
      const countStr = String(count);
      const regex    = new RegExp(
        `(id:\\s*'${cuisine.id}'[^\\n]*'${areaId}':\\s*)(?:'[^']*'|\\d+)`
      );
      if (regex.test(appContent)) {
        appContent = appContent.replace(regex, `$1'${countStr}'`);
      } else {
        console.warn(`  ⚠ app.js: '${cuisine.id}' の '${areaId}' が見つかりません`);
      }
    }
    // Update per-cuisine lastUpdated
    const dateRegex = new RegExp(
      `(id:\\s*'${cuisine.id}'[^\\n]*lastUpdated:\\s*)'[^']*'`
    );
    if (dateRegex.test(appContent)) {
      appContent = appContent.replace(dateRegex, `$1'${today}'`);
    }
  }

  // Update global LAST_UPDATED
  appContent = appContent.replace(
    /const LAST_UPDATED = '[^']+';/,
    `const LAST_UPDATED = '${today}';`
  );

  fs.writeFileSync(appJsPath, appContent, 'utf8');
  console.log('✅ app.js の店舗数を更新しました');

  const total = CUISINES.length * Object.keys(AREAS).length;
  console.log(`\n✅ 完了: ${totalOk}/${total} 成功, ${totalFail} 失敗 (${today})`);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(0);
});
