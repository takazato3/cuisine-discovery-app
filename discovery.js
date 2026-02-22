'use strict';

// ============================================================
// discovery.js
// Loads discoveries.json and renders the Discovery ticker
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
// Render: populate ticker for the selected area
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

    const itemsEl = document.getElementById('discovery-items');
    if (!itemsEl) return;

    // Build HTML strings for each item
    const items = [];
    (data.discoveries || []).forEach((discovery) => {
      const areaData = discovery.byArea[selectedArea];
      if (!areaData || areaData.count === 0) return;

      (areaData.restaurants || []).slice(0, 2).forEach((restaurant) => {
        const mapUrl    = getDiscoveryMapUrl(restaurant);
        const areaLabel = restaurant.area ? `(${restaurant.area})` : '';
        items.push(`<a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="discovery-item"><span class="flag">${discovery.flag}</span><span class="cuisine">${discovery.cuisineName}:</span><span class="restaurant">${restaurant.name}</span><span class="area">${areaLabel}</span><span class="arrow">→</span></a>`);
      });
    });

    // Show message when no rare cuisines in the selected area
    if (items.length === 0) {
      itemsEl.innerHTML = '<span class="no-discoveries">このエリアに珍しい料理は見つかりませんでした</span>';
      return;
    }

    // Duplicate content for seamless infinite scroll loop
    itemsEl.innerHTML = items.join('') + items.join('');
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
