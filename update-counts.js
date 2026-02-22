#!/usr/bin/env node
'use strict';

// update-counts.js
// Fetches per-area restaurant counts from Google Places API (New) and updates app.js
// Requires Node.js 18+ (uses global fetch)
// Usage: GOOGLE_MAPS_API_KEY=your_key node update-counts.js

const fs   = require('fs');
const path = require('path');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('Error: GOOGLE_MAPS_API_KEY environment variable is not set.');
  process.exit(1);
}

// Area definitions — must match AREAS in app.js
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

// Cuisines to update — must match ids in app.js CUISINES array
const CUISINES = [
  { id: 'thai',           query: 'thai restaurant' },
  { id: 'vietnamese',     query: 'vietnamese restaurant' },
  { id: 'korean',         query: 'korean restaurant' },
  { id: 'indian-nepali',  query: 'indian restaurant OR nepali restaurant' },
  { id: 'south-indian',   query: 'south indian restaurant OR ミールス OR ドーサ' },
  { id: 'machi-chuka',    query: '中華料理 OR ラーメン OR 餃子' },
  { id: 'honkaku-chuka',  query: '本格中華 OR 四川料理 OR 広東料理 OR 上海料理' },
  { id: 'taiwanese',      query: '台湾料理 OR 魯肉飯' },
  { id: 'mexican',        query: 'mexican restaurant' },
  { id: 'italian',        query: 'italian restaurant' },
  { id: 'french',         query: 'french restaurant' },
  { id: 'greek',          query: 'greek restaurant' },
  { id: 'middle-eastern', query: 'middle eastern restaurant OR lebanese restaurant' },
  { id: 'peruvian',       query: 'peruvian restaurant' },
  { id: 'turkish',        query: 'turkish restaurant' },
  { id: 'spanish',        query: 'spanish restaurant' },
  { id: 'brazilian',      query: 'brazilian restaurant' },
  { id: 'african',        query: 'african restaurant OR ethiopian restaurant OR moroccan restaurant' },
];

// ============================================================
// Fetch the count for one cuisine + area from Places API (New)
// Makes up to 3 paginated requests (max 20 results each = 60 total).
// Returns '60+' if total reaches 60, otherwise returns exact count as string.
// ============================================================
async function fetchCount(cuisine, areaId, area) {
  let totalCount = 0;
  let pageToken  = undefined;

  for (let page = 0; page < 3; page++) {
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
    if (pageToken) body.pageToken = pageToken;

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type':     'application/json',
        'X-Goog-Api-Key':   API_KEY,
        'X-Goog-FieldMask': 'places.id,nextPageToken',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const json = await res.json();
    if (json.error) throw new Error(json.error.message || 'API error');

    const places = json.places || [];
    totalCount += places.length;

    if (totalCount >= 60) return '60+';
    if (places.length < 20 || !json.nextPageToken) break;

    pageToken = json.nextPageToken;
    // Brief pause between paginated requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  return totalCount >= 60 ? '60+' : String(totalCount);
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
  console.log('=== update-counts.js ===');
  console.log(`Fetching counts for ${Object.keys(AREAS).length} areas × ${CUISINES.length} cuisines...\n`);

  const appJsPath = path.join(__dirname, 'app.js');
  let content;
  try {
    content = fs.readFileSync(appJsPath, 'utf8');
  } catch (err) {
    console.error(`Error: could not read app.js: ${err.message}`);
    process.exit(1);
  }

  const today = formatDate(new Date());
  let totalUpdated = 0;
  let totalFailed  = 0;

  // Iterate area-by-area, cuisine-by-cuisine
  for (const [areaId, area] of Object.entries(AREAS)) {
    console.log(`\n📍 ${area.name} (${areaId})`);

    for (const cuisine of CUISINES) {
      let count;
      try {
        count = await fetchCount(cuisine, areaId, area);
        console.log(`  ✓ ${cuisine.id}: ${count} stores`);
      } catch (err) {
        console.warn(`  ⚠ ${cuisine.id}: API call failed — ${err.message}`);
        console.warn(`    Keeping existing count.`);
        totalFailed++;
        await new Promise(r => setTimeout(r, 300));
        continue;
      }

      // Update the count for this area on the cuisine's line in app.js
      // Line format: { id: 'thai', ..., counts: { 'tokyo-23': '60+', ... }, ...
      // Matches either a quoted string ('60+', '45') or a legacy plain number
      const regex = new RegExp(`(id:\\s*'${cuisine.id}'[^\\n]*'${areaId}':\\s*)(?:'[^']*'|\\d+)`);
      if (regex.test(content)) {
        content = content.replace(regex, `$1'${count}'`);
        totalUpdated++;
      } else {
        console.warn(`  ⚠ ${cuisine.id}: could not locate '${areaId}' in app.js`);
      }

      // Update lastUpdated for this cuisine (only if area succeeded)
      const dateRegex = new RegExp(`(id:\\s*'${cuisine.id}'[^\\n]*lastUpdated:\\s*)'[^']*'`);
      if (dateRegex.test(content)) {
        content = content.replace(dateRegex, `$1'${today}'`);
      }

      // 200ms delay between API requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Update global LAST_UPDATED constant
  const luRegex = /const LAST_UPDATED = '[^']+';/;
  if (luRegex.test(content)) {
    content = content.replace(luRegex, `const LAST_UPDATED = '${today}';`);
  } else {
    console.warn('\n⚠ LAST_UPDATED constant not found in app.js');
  }

  try {
    fs.writeFileSync(appJsPath, content, 'utf8');
  } catch (err) {
    console.error(`Error: could not write app.js: ${err.message}`);
    process.exit(1);
  }

  const total = Object.keys(AREAS).length * CUISINES.length;
  console.log(`\n✅ Done. Updated ${totalUpdated}/${total} entries (${totalFailed} failed) for ${today}`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  // Exit 0 so the workflow is treated as successful (retry next week)
  process.exit(0);
});
