/* ═══════════════════════════════════════════════
   AutoVault 3D — Filters Module
   Search · Brand · Body · Fuel · Price
═══════════════════════════════════════════════ */

const Filters = (() => {

  let activeFilters = { brand: 'all', body: 'all', fuel: 'all', priceMax: 20000000 };
  let searchQuery = '';
  let onChangeCallback = null;

  function init(onChangeFn) {
    onChangeCallback = onChangeFn;

    // Filter toggle button
    const filterToggle = document.getElementById('filter-toggle');
    const sidebar      = document.getElementById('filter-sidebar');
    const filterClose  = document.getElementById('filter-close');

    filterToggle.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
    });
    filterClose.addEventListener('click', () => {
      sidebar.classList.add('hidden');
    });

    // Search
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value.toLowerCase().trim();
      notify();
    });

    // Tag filters
    document.querySelectorAll('.ftag').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        const value  = btn.dataset.value;

        // Deactivate siblings
        btn.parentElement.querySelectorAll('.ftag').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeFilters[filter] = value;
        notify();
      });
    });

    // Price range
    const priceRange = document.getElementById('price-range');
    const priceLabel = document.getElementById('price-val');
    priceRange.addEventListener('input', () => {
      const v = parseInt(priceRange.value);
      activeFilters.priceMax = v;
      priceLabel.textContent = formatPriceLabel(v);
      notify();
    });

    // Reset
    document.getElementById('reset-filters').addEventListener('click', resetAll);
  }

  function formatPriceLabel(v) {
    if (v >= 10000000) return `₹${(v/10000000).toFixed(1)} Cr`;
    if (v >= 100000)   return `₹${(v/100000).toFixed(0)} L`;
    return `₹${v.toLocaleString()}`;
  }

  function resetAll() {
    activeFilters = { brand: 'all', body: 'all', fuel: 'all', priceMax: 20000000 };
    searchQuery = '';
    document.getElementById('search-input').value = '';
    document.getElementById('price-range').value = 20000000;
    document.getElementById('price-val').textContent = '₹2Cr+';

    document.querySelectorAll('.ftag').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.value === 'all') btn.classList.add('active');
    });
    notify();
  }

  function applyFilters(carsList) {
    return carsList.filter(car => {
      if (searchQuery) {
        const hay = `${car.name} ${car.brand} ${car.bodyType}`.toLowerCase();
        if (!hay.includes(searchQuery)) return false;
      }
      if (activeFilters.brand !== 'all' && car.brand !== activeFilters.brand) return false;
      if (activeFilters.body !== 'all'  && car.bodyType !== activeFilters.body) return false;
      if (activeFilters.fuel !== 'all'  && car.specs.fuelType !== activeFilters.fuel) return false;
      if (car.price > activeFilters.priceMax) return false;
      return true;
    });
  }

  function notify() {
    if (onChangeCallback) onChangeCallback(applyFilters(CARS));
  }

  return { init, applyFilters };
})();
