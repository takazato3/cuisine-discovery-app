'use strict';

// ============================================================
// discovery.js
// Loads discoveries.json and renders the Discovery section
// on the top page, filtered by the currently selected area.
// ============================================================

// ============================================================
// Utility: build Google Maps URL (placeId or name search)
// ============================================================
function getDiscoveryMapUrl(restaurant) {
  if (restaurant.placeId) {
    return `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${restaurant.placeId}`;
  }
  return `https://www.google.com/maps/search/?q=${encodeURIComponent(restaurant.name)}`;
}

// ============================================================
// Render: populate discovery list for the selected area
// ============================================================
async function loadDiscoveries() {
  try {
    const response = await fetch('discoveries.json');
    if (!response.ok) throw new Error('discoveries.json not found');
    const data = await response.json();

    // Update the "last updated" date label
    const dateEl = document.getElementById('discovery-date');
    if (dateEl) dateEl.textContent = data.lastUpdated || '';

    // Determine which area is currently selected
    const areaSelect   = document.getElementById('area-select');
    const selectedArea = areaSelect ? areaSelect.value : 'tokyo-23';

    const listEl = document.getElementById('discovery-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    // Render one item per cuisine that has results in the selected area
    (data.discoveries || []).forEach((discovery) => {
      const areaData = discovery.byArea[selectedArea];
      if (!areaData || areaData.count === 0) return;

      const item = document.createElement('div');
      item.className = 'discovery-item';

      // Restaurant links (up to 3)
      const restaurantLinks = (areaData.restaurants || [])
        .slice(0, 3)
        .map((r) => {
          const mapUrl = getDiscoveryMapUrl(r);
          const areaLabel = r.area ? `<span class="location">(${r.area})</span>` : '';
          return `
            <a href="${mapUrl}"
               target="_blank"
               rel="noopener noreferrer"
               class="restaurant-link">
              ▸ ${r.name} ${areaLabel}
            </a>`;
        })
        .join('');

      // "+N more" badge
      const remaining = areaData.count > 3
        ? `<span class="more-count">+ 他${areaData.count - 3}店舗</span>`
        : '';

      item.innerHTML = `
        <div class="discovery-cuisine">
          <span class="flag">${discovery.flag}</span>
          <span class="name">${discovery.cuisineName}</span>
          <span class="count">${areaData.count}店舗</span>
        </div>
        <div class="discovery-restaurants">
          ${restaurantLinks}
          ${remaining}
        </div>
      `;

      listEl.appendChild(item);
    });

    // Show message when no rare cuisines in the selected area
    if (listEl.children.length === 0) {
      listEl.innerHTML =
        '<p class="no-discoveries">このエリアに珍しい料理は見つかりませんでした</p>';
    }
  } catch (error) {
    console.error('Discovery data load failed:', error);
    // Hide the section silently on error
    const section = document.querySelector('.discovery-section');
    if (section) section.style.display = 'none';
  }
}

// ============================================================
// Re-render when area changes
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadDiscoveries();

  const areaSelect = document.getElementById('area-select');
  if (areaSelect) {
    areaSelect.addEventListener('change', loadDiscoveries);
  }
});
