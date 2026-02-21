#!/usr/bin/env node
'use strict';

// update-counts.js
// Fetches restaurant counts from Google Places API (New) and updates app.js
// Requires Node.js 18+ (uses global fetch)
// Usage: GOOGLE_MAPS_API_KEY=your_key node update-counts.js

const fs   = require('fs');
const path = require('path');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('Error: GOOGLE_MAPS_API_KEY environment variable is not set.');
  process.exit(1);
}

// Tokyo center coordinates
const TOKYO = { lat: 35.6762, lng: 139.6503 };

// Cuisines to update — must match ids in app.js CUISINES array
const CUISINES = [
  { id: 'thai',       query: 'thai restaurant' },
  { id: 'vietnamese', query: 'vietnamese restaurant' },
  { id: 'korean',     query: 'korean restaurant' },
  { id: 'indian',     query: 'indian restaurant' },
  { id: 'mexican',    query: 'mexican restaurant' },
  { id: 'italian',    query: 'italian restaurant' },
  { id: 'french',     query: 'french restaurant' },
  { id: 'chinese',    query: 'chinese restaurant' },
  { id: 'greek',      query: 'greek restaurant' },
  { id: 'ethiopian',  query: 'ethiopian restaurant' },
  { id: 'peruvian',   query: 'peruvian restaurant' },
  { id: 'lebanese',   query: 'lebanese restaurant' },
  { id: 'turkish',    query: 'turkish restaurant' },
  { id: 'spanish',    query: 'spanish restaurant' },
  { id: 'brazilian',  query: 'brazilian restaurant' },
  { id: 'japanese',   query: 'japanese restaurant' },
  { id: 'russian',    query: 'russian restaurant' },
  { id: 'moroccan',   query: 'moroccan restaurant' },
];

// ============================================================
// Fetch the number of results for one cuisine from Places API
// Note: Places API (New) returns at most 20 results per call.
// The count reflects stores found within 10km of Tokyo center.
// ============================================================
async function fetchCount(cuisine) {
  const body = {
    textQuery: `${cuisine.query} 東京`,
    languageCode: 'ja',
    maxResultCount: 20,
    locationBias: {
      circle: {
        center: { latitude: TOKYO.lat, longitude: TOKYO.lng },
        radius: 10000.0,
      },
    },
  };

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'X-Goog-Api-Key':  API_KEY,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'API error');

  return (json.places || []).length;
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
  console.log('Fetching restaurant counts from Places API...\n');

  const appJsPath = path.join(__dirname, 'app.js');
  let content;
  try {
    content = fs.readFileSync(appJsPath, 'utf8');
  } catch (err) {
    console.error(`Error: could not read app.js: ${err.message}`);
    process.exit(1);
  }

  const today = formatDate(new Date());
  let updatedCount = 0;

  for (const cuisine of CUISINES) {
    let count;
    try {
      count = await fetchCount(cuisine);
      console.log(`  ✓ ${cuisine.id}: ${count} stores`);
    } catch (err) {
      console.warn(`  ⚠ ${cuisine.id}: API call failed — ${err.message}`);
      console.warn(`    Keeping existing count.`);
      // Skip update for this cuisine; do not change content
      // Small delay before next request
      await new Promise(r => setTimeout(r, 300));
      continue;
    }

    // Update count on the cuisine's line
    const countRegex = new RegExp(`(id: '${cuisine.id}'[^\\n]*count:)\\s*\\d+`);
    if (countRegex.test(content)) {
      content = content.replace(countRegex, `$1 ${count}`);
    } else {
      console.warn(`  ⚠ ${cuisine.id}: could not locate 'count' field in app.js`);
    }

    // Update lastUpdated on the cuisine's line
    const dateRegex = new RegExp(`(id: '${cuisine.id}'[^\\n]*lastUpdated:)\\s*'[^']*'`);
    if (dateRegex.test(content)) {
      content = content.replace(dateRegex, `$1 '${today}'`);
    }

    updatedCount++;

    // Small delay to avoid rate limiting (200ms between requests)
    await new Promise(r => setTimeout(r, 200));
  }

  // Update global LAST_UPDATED constant
  const luRegex = /const LAST_UPDATED = '[^']+';/;
  if (luRegex.test(content)) {
    content = content.replace(luRegex, `const LAST_UPDATED = '${today}';`);
  } else {
    console.warn(`  ⚠ LAST_UPDATED constant not found in app.js`);
  }

  try {
    fs.writeFileSync(appJsPath, content, 'utf8');
  } catch (err) {
    console.error(`Error: could not write app.js: ${err.message}`);
    process.exit(1);
  }

  console.log(`\n✅ Done. Updated ${updatedCount}/${CUISINES.length} cuisines for ${today}`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  // Exit 0 so the workflow is treated as successful (retry next week)
  process.exit(0);
});
