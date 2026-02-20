'use strict';

// ============================================================
// Cuisine Data
// store count is dummy data — will be replaced by API later
// ============================================================
const CUISINES = [
  { id: 'thai',      flag: '🇹🇭', name: 'タイ料理',       origin: 'タイ',         count: 328 },
  { id: 'vietnamese',flag: '🇻🇳', name: 'ベトナム料理',   origin: 'ベトナム',     count: 214 },
  { id: 'korean',    flag: '🇰🇷', name: '韓国料理',       origin: '韓国',         count: 486 },
  { id: 'indian',    flag: '🇮🇳', name: 'インド料理',     origin: 'インド',       count: 301 },
  { id: 'mexican',   flag: '🇲🇽', name: 'メキシコ料理',   origin: 'メキシコ',     count: 97  },
  { id: 'italian',   flag: '🇮🇹', name: 'イタリア料理',   origin: 'イタリア',     count: 612 },
  { id: 'french',    flag: '🇫🇷', name: 'フランス料理',   origin: 'フランス',     count: 278 },
  { id: 'chinese',   flag: '🇨🇳', name: '中国料理',       origin: '中国',         count: 731 },
  { id: 'greek',     flag: '🇬🇷', name: 'ギリシャ料理',   origin: 'ギリシャ',     count: 54  },
  { id: 'ethiopian', flag: '🇪🇹', name: 'エチオピア料理', origin: 'エチオピア',   count: 23  },
  { id: 'peruvian',  flag: '🇵🇪', name: 'ペルー料理',     origin: 'ペルー',       count: 41  },
  { id: 'lebanese',  flag: '🇱🇧', name: 'レバノン料理',   origin: 'レバノン',     count: 68  },
  { id: 'spanish',   flag: '🇪🇸', name: 'スペイン料理',   origin: 'スペイン',     count: 143 },
  { id: 'japanese',  flag: '🇯🇵', name: '日本料理',       origin: '日本',         count: 924 },
  { id: 'moroccan',  flag: '🇲🇦', name: 'モロッコ料理',   origin: 'モロッコ',     count: 35  },
  { id: 'turkish',   flag: '🇹🇷', name: 'トルコ料理',     origin: 'トルコ',       count: 89  },
  { id: 'brazilian', flag: '🇧🇷', name: 'ブラジル料理',   origin: 'ブラジル',     count: 62  },
  { id: 'american',  flag: '🇺🇸', name: 'アメリカ料理',   origin: 'アメリカ',     count: 208 },
];

// ============================================================
// Utility: format store count with locale separator
// ============================================================
function formatCount(n) {
  return n.toLocaleString('ja-JP');
}

// ============================================================
// Render: build a single card element
// ============================================================
function createCuisineCard(cuisine) {
  const card = document.createElement('a');
  card.className = 'cuisine-card';
  card.href = `#${cuisine.id}`;       // placeholder — swap for real route later
  card.setAttribute('aria-label', `${cuisine.name} — ${formatCount(cuisine.count)}店舗`);
  card.dataset.id = cuisine.id;

  card.innerHTML = `
    <span class="card-flag" aria-hidden="true">${cuisine.flag}</span>
    <span class="card-name">${cuisine.name}</span>
    <div class="card-count-wrap">
      <span class="card-count">${formatCount(cuisine.count)}</span>
      <span class="card-count-label">店舗</span>
    </div>
    <span class="card-origin">${cuisine.origin}</span>
  `;

  card.addEventListener('click', (e) => {
    e.preventDefault();
    handleCuisineSelect(cuisine);
  });

  return card;
}

// ============================================================
// Render: populate grid with skeleton → real cards
// ============================================================
function renderGrid(cuisines) {
  const grid = document.getElementById('cuisine-grid');
  const countEl = document.getElementById('genre-count');

  // Show skeleton placeholders first
  grid.innerHTML = '';
  for (let i = 0; i < cuisines.length; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'card-skeleton';
    grid.appendChild(skeleton);
  }

  // Render real cards after a brief delay (simulates async data fetch)
  requestAnimationFrame(() => {
    setTimeout(() => {
      grid.innerHTML = '';
      cuisines.forEach((cuisine) => {
        grid.appendChild(createCuisineCard(cuisine));
      });
      if (countEl) {
        countEl.textContent = `${cuisines.length}ジャンル`;
      }
    }, 300);
  });
}

// ============================================================
// Handler: cuisine card selected
// (Placeholder — Phase 2 will navigate to restaurant list)
// ============================================================
function handleCuisineSelect(cuisine) {
  // TODO Phase 2: navigate to restaurant list filtered by cuisine
  console.log('[cuisine-discovery] selected:', cuisine.id, cuisine.name);

  // Visual feedback: brief highlight
  const card = document.querySelector(`[data-id="${cuisine.id}"]`);
  if (card) {
    card.style.transition = 'none';
    card.style.backgroundColor = '#fff0e8';
    setTimeout(() => {
      card.style.transition = '';
      card.style.backgroundColor = '';
    }, 200);
  }
}

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  renderGrid(CUISINES);
});
