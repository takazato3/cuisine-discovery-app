#!/usr/bin/env node
'use strict';

// update-counts.js
// Fetches per-area restaurant counts from Overpass API (OpenStreetMap data).
// - No API key required
// - No result-count cap (unlike Google Places API which maxes out at 20)
// - Data source: crowd-sourced OSM — actual store counts may be higher
//   than reported if a restaurant is not yet registered on OSM.
// Requires Node.js 18+ (uses global fetch)
// Usage: node update-counts.js

const fs   = require('fs');
const path = require('path');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// ============================================================
// Area Definitions — must match AREAS in app.js
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

// ============================================================
// Cuisine → OSM cuisine tag mapping
//
// OSM uses [amenity=restaurant][cuisine=<value>].
// Multiple tags are matched via regex OR (e.g. "thai|japanese").
// Reference: https://wiki.openstreetmap.org/wiki/Key:cuisine
// ============================================================
const CUISINES = [
  {
    id: 'thai',
    osmTags: ['thai'],
  },
  {
    id: 'vietnamese',
    osmTags: ['vietnamese'],
  },
  {
    id: 'korean',
    osmTags: ['korean'],
  },
  {
    id: 'indian',
    // north_indian / south_indian are common sub-tags
    osmTags: ['indian', 'north_indian', 'south_indian'],
  },
  {
    id: 'mexican',
    osmTags: ['mexican'],
  },
  {
    id: 'italian',
    osmTags: ['italian', 'pizza', 'pasta'],
  },
  {
    id: 'french',
    osmTags: ['french'],
  },
  {
    id: 'chinese',
    // Regional styles mapped here; taiwanese kept under chinese for app grouping
    osmTags: ['chinese', 'dim_sum', 'cantonese', 'sichuan', 'shanghainese', 'taiwanese'],
  },
  {
    id: 'greek',
    osmTags: ['greek'],
  },
  {
    id: 'ethiopian',
    osmTags: ['ethiopian'],
  },
  {
    id: 'peruvian',
    osmTags: ['peruvian'],
  },
  {
    id: 'lebanese',
    osmTags: ['lebanese'],
  },
  {
    id: 'turkish',
    osmTags: ['turkish', 'kebab'],
  },
  {
    id: 'spanish',
    osmTags: ['spanish'],
  },
  {
    id: 'brazilian',
    osmTags: ['brazilian', 'churrasco'],
  },
  {
    id: 'japanese',
    // Cover major Japanese sub-genres tagged separately in OSM
    osmTags: ['japanese', 'sushi', 'ramen', 'tempura', 'udon', 'soba',
              'yakitori', 'tonkatsu', 'izakaya', 'kaiseki'],
  },
  {
    id: 'russian',
    osmTags: ['russian'],
  },
  {
    id: 'moroccan',
    osmTags: ['moroccan'],
  },
];

// ============================================================
// Build and execute an Overpass QL query that counts
// amenity=restaurant nodes+ways matching any of the given
// cuisine tags within a circular area.
//
// out count; returns a single element like:
//   { "type":"count", "tags":{ "nodes":"42","ways":"3","total":"45" } }
// ============================================================
async function fetchCount(cuisine, area) {
  // Escape special regex characters in tag values (all are plain words here,
  // but guard against future entries with hyphens etc.)
  const pattern = cuisine.osmTags
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  // around:radius,lat,lon  (Overpass uses lon, not lng)
  const around = `around:${area.radius},${area.lat},${area.lng}`;

  const query = [
    '[out:json][timeout:60];',
    '(',
    `  node(${around})[amenity=restaurant][cuisine~"^(${pattern})$",i];`,
    `  way(${around})[amenity=restaurant][cuisine~"^(${pattern})$",i];`,
    ');',
    'out count;',
  ].join('\n');

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.remark && /runtime error|timeout/.test(json.remark)) {
    throw new Error(`Overpass remark: ${json.remark}`);
  }

  const total = json.elements?.[0]?.tags?.total;
  if (total === undefined) {
    throw new Error('Unexpected response shape: ' + JSON.stringify(json).slice(0, 200));
  }

  return parseInt(total, 10);
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
  console.log('=== update-counts.js (Overpass / OpenStreetMap) ===');
  console.log(`Fetching counts for ${Object.keys(AREAS).length} areas × ${CUISINES.length} cuisines...\n`);
  console.log('Note: counts reflect restaurants registered on OpenStreetMap.');
  console.log('      Actual store counts may be higher due to incomplete OSM coverage.\n');

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

  for (const [areaId, area] of Object.entries(AREAS)) {
    console.log(`\n📍 ${area.name} (${areaId})`);

    for (const cuisine of CUISINES) {
      let count;
      try {
        count = await fetchCount(cuisine, area);
        console.log(`  ✓ ${cuisine.id}: ${count} stores`);
      } catch (err) {
        console.warn(`  ⚠ ${cuisine.id}: API call failed — ${err.message}`);
        console.warn(`    Keeping existing count.`);
        totalFailed++;
        // Longer back-off on error to avoid hammering the server
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }

      // Update count in app.js
      // Line format: { id: 'thai', ..., counts: { 'tokyo-23': 328, ...
      const regex = new RegExp(`(id:\\s*'${cuisine.id}'[^\\n]*'${areaId}':\\s*)\\d+`);
      if (regex.test(content)) {
        content = content.replace(regex, `$1${count}`);
        totalUpdated++;
      } else {
        console.warn(`  ⚠ ${cuisine.id}: could not locate '${areaId}' in app.js`);
      }

      // Update lastUpdated for this cuisine
      const dateRegex = new RegExp(`(id:\\s*'${cuisine.id}'[^\\n]*lastUpdated:\\s*)'[^']*'`);
      if (dateRegex.test(content)) {
        content = content.replace(dateRegex, `$1'${today}'`);
      }

      // 2 s delay between requests — Overpass fair-use policy
      await new Promise(r => setTimeout(r, 2000));
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
  process.exit(0);
});
