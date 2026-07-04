/* ═══════════════════════════════════════════════
   AutoVault 3D — Favorites / Wishlist
═══════════════════════════════════════════════ */

const Favorites = (() => {

  let favorites = JSON.parse(localStorage.getItem('av_favorites') || '[]');
  let onSelectCar = null;

  function init(onSelectFn) {
    onSelectCar = onSelectFn;

    document.getElementById('fav-nav-btn').addEventListener('click', openModal);
    document.getElementById('wishlist-close').addEventListener('click', closeModal);
    document.getElementById('wishlist-overlay').addEventListener('click', closeModal);
    updateBadge();
  }

  function isFav(id) { return favorites.includes(id); }

  function toggle(id) {
    if (isFav(id)) {
      favorites = favorites.filter(f => f !== id);
    } else {
      favorites.push(id);
    }
    localStorage.setItem('av_favorites', JSON.stringify(favorites));
    updateBadge();
    return isFav(id);
  }

  function updateBadge() {
    document.getElementById('fav-count').textContent = favorites.length;
  }

  function openModal() {
    renderGrid();
    document.getElementById('wishlist-modal').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('wishlist-modal').classList.add('hidden');
  }

  function renderGrid() {
    const grid  = document.getElementById('wishlist-grid');
    const empty = document.getElementById('wishlist-empty');
    grid.innerHTML = '';

    const favCars = CARS.filter(c => favorites.includes(c.id));
    if (favCars.length === 0) {
      grid.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }
    grid.classList.remove('hidden');
    empty.classList.add('hidden');

    favCars.forEach(car => {
      const card = document.createElement('div');
      card.className = 'wish-card';
      card.innerHTML = `
        <button class="wish-remove" data-id="${car.id}" title="Remove">✕</button>
        <div class="wish-brand">${car.brand}</div>
        <div class="wish-name">${car.name}</div>
        <div class="wish-price">${formatPrice(car.price)}</div>
        <div style="font-size:0.68rem;color:var(--text-muted)">${car.specs.fuelType} · ${car.bodyType}</div>
        <button class="wish-view" data-id="${car.id}">View in Showroom</button>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll('.wish-remove').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        toggle(btn.dataset.id);
        renderGrid();
        updateFavBtn(btn.dataset.id);
      });
    });

    grid.querySelectorAll('.wish-view').forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal();
        if (onSelectCar) onSelectCar(btn.dataset.id);
      });
    });
  }

  function updateFavBtn(carId) {
    const btn = document.getElementById('fav-toggle');
    if (!btn) return;
    btn.textContent = isFav(carId) ? '♥' : '♡';
    btn.classList.toggle('active', isFav(carId));
  }

  return { init, isFav, toggle, updateFavBtn };
})();
