/* ═══════════════════════════════════════════════
   AutoVault 3D — UI Controller
   Info panel · Carousel · Tabs · Interact btns
   Camera presets · Day/Night · All module wiring
═══════════════════════════════════════════════ */

const UI = (() => {

  let currentCarData  = null;
  let currentCarGroup = null;
  let visibleCars     = [...CARS]; // filtered list

  /* ═══════════════════════════════════════════
     Carousel
  ═══════════════════════════════════════════ */
  function buildCarousel(carsList) {
    const track = document.getElementById('carousel-track');
    track.innerHTML = '';

    carsList.forEach(car => {
      const card = document.createElement('div');
      card.className = 'car-card' + (currentCarData && car.id === currentCarData.id ? ' active' : '');
      card.dataset.id = car.id;
      card.innerHTML = `
        <div class="card-brand">${car.brand}</div>
        <div class="card-name">${car.name}</div>
        <div class="card-price">${formatPrice(car.price)}</div>
        <div class="card-fuel">${car.specs.fuelType} · ${car.bodyType}</div>
      `;
      card.addEventListener('click', () => selectCar(car.id));
      track.appendChild(card);
    });

    // Carousel arrows
    document.getElementById('car-prev').onclick = () => {
      track.scrollBy({ left: -160, behavior: 'smooth' });
    };
    document.getElementById('car-next').onclick = () => {
      track.scrollBy({ left: 160, behavior: 'smooth' });
    };
  }

  function setActiveCard(id) {
    document.querySelectorAll('.car-card').forEach(c => {
      c.classList.toggle('active', c.dataset.id === id);
    });
    // Scroll active card into view
    const active = document.querySelector(`.car-card[data-id="${id}"]`);
    if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  /* ═══════════════════════════════════════════
     Info Panel
  ═══════════════════════════════════════════ */
  function updateInfoPanel(car) {
    document.getElementById('info-brand').textContent  = car.brand;
    document.getElementById('info-name').textContent   = car.name;
    document.getElementById('info-price').textContent  = formatPrice(car.price);
    document.getElementById('info-badge').textContent  = car.badge;
    document.getElementById('info-desc').textContent   = car.description;

    // Specs
    document.getElementById('s-engine').textContent  = car.specs.engine;
    document.getElementById('s-hp').textContent      = car.specs.horsepower;
    document.getElementById('s-fuel').textContent    = car.specs.fuelType;
    document.getElementById('s-mileage').textContent = car.specs.mileage;
    document.getElementById('s-speed').textContent   = car.specs.topSpeed;
    document.getElementById('s-accel').textContent   = car.specs.acceleration;

    // Safety pills
    const safetyWrap = document.getElementById('safety-wrap');
    safetyWrap.innerHTML = car.specs.safety.map(s =>
      `<span class="safety-tag">✓ ${s}</span>`
    ).join('');

    // Features list
    const featureList = document.getElementById('feature-list');
    featureList.innerHTML = car.features.map(f => `<li>${f}</li>`).join('');

    // Fav button state
    Favorites.updateFavBtn(car.id);

    // Compare button state
    Compare.updateAddBtn(car.id);

    // Reset to Features tab
    switchTab('features');

    // Reset interact button states
    resetInteractBtns();
  }

  /* ═══════════════════════════════════════════
     Tab switching
  ═══════════════════════════════════════════ */
  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === `tab-${name}`));
  }

  function initTabs() {
    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
  }

  /* ═══════════════════════════════════════════
     Interact Buttons
  ═══════════════════════════════════════════ */
  function resetInteractBtns() {
    document.querySelectorAll('.interact-btn').forEach(b => b.classList.remove('active'));
  }

  function toggleInteractBtn(id) {
    const btn = document.getElementById(id);
    if (btn) btn.classList.toggle('active');
  }

  function initInteractButtons() {
    document.getElementById('ibtn-fl').addEventListener('click', () => {
      if (!currentCarGroup) return;
      CarBuilder.toggleDoor(currentCarGroup, 'doorFL', true);
      toggleInteractBtn('ibtn-fl');
    });
    document.getElementById('ibtn-fr').addEventListener('click', () => {
      if (!currentCarGroup) return;
      CarBuilder.toggleDoor(currentCarGroup, 'doorFR', false);
      toggleInteractBtn('ibtn-fr');
    });
    document.getElementById('ibtn-rl').addEventListener('click', () => {
      if (!currentCarGroup) return;
      CarBuilder.toggleDoor(currentCarGroup, 'doorRL', true);
      toggleInteractBtn('ibtn-rl');
    });
    document.getElementById('ibtn-rr').addEventListener('click', () => {
      if (!currentCarGroup) return;
      CarBuilder.toggleDoor(currentCarGroup, 'doorRR', false);
      toggleInteractBtn('ibtn-rr');
    });
    document.getElementById('ibtn-bonnet').addEventListener('click', () => {
      if (!currentCarGroup) return;
      CarBuilder.toggleBonnet(currentCarGroup);
      toggleInteractBtn('ibtn-bonnet');
    });
    document.getElementById('ibtn-trunk').addEventListener('click', () => {
      if (!currentCarGroup) return;
      CarBuilder.toggleTrunk(currentCarGroup);
      toggleInteractBtn('ibtn-trunk');
    });
    document.getElementById('ibtn-lights').addEventListener('click', () => {
      if (!currentCarGroup) return;
      CarBuilder.toggleHeadlights(currentCarGroup);
      toggleInteractBtn('ibtn-lights');
    });
    document.getElementById('ibtn-reset').addEventListener('click', () => {
      if (!currentCarGroup) return;
      CarBuilder.resetAll(currentCarGroup);
      resetInteractBtns();
    });
  }

  /* ═══════════════════════════════════════════
     Favorites & Compare in panel
  ═══════════════════════════════════════════ */
  function initPanelActions() {
    document.getElementById('fav-toggle').addEventListener('click', () => {
      if (!currentCarData) return;
      const nowFav = Favorites.toggle(currentCarData.id);
      Favorites.updateFavBtn(currentCarData.id);
    });

    document.getElementById('compare-add').addEventListener('click', () => {
      if (!currentCarData) return;
      Compare.addCar(currentCarData.id);
      Compare.updateAddBtn(currentCarData.id);
    });
  }

  /* ═══════════════════════════════════════════
     Camera Presets
  ═══════════════════════════════════════════ */
  function initCameraPresets() {
    const presets = {
      default: { r: 10, phi: 0.65, theta: 0.4 },
      front:   { r: 8,  phi: 0.35, theta: 0 },
      side:    { r: 8,  phi: 0.4,  theta: Math.PI / 2 },
      rear:    { r: 8,  phi: 0.35, theta: Math.PI },
      top:     { r: 10, phi: 0.1,  theta: 0.4 }
    };

    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = presets[btn.dataset.view];
        if (p) SceneManager.getControls().flyTo(p.r, p.phi, p.theta);
      });
    });
  }

  /* ═══════════════════════════════════════════
     Day/Night Toggle
  ═══════════════════════════════════════════ */
  function initDayNight() {
    const btn = document.getElementById('day-night-toggle');
    btn.addEventListener('click', () => {
      Environment.toggleDayNight(() => {
        btn.textContent = Environment.getIsNight() ? '🌙' : '☀️';
      });
    });
  }

  /* ═══════════════════════════════════════════
     Car Selection — called from carousel, wishlist, etc.
  ═══════════════════════════════════════════ */
  function selectCar(carId) {
    const car = CARS.find(c => c.id === carId);
    if (!car) return;

    currentCarData = car;

    // Update 3D scene via Main
    if (window._loadCar3D) window._loadCar3D(car);

    // Update UI
    updateInfoPanel(car);
    setActiveCard(car.id);
    Booking.setCurrentCar(car.id);
  }

  /* ═══════════════════════════════════════════
     Filter callback — rebuild carousel
  ═══════════════════════════════════════════ */
  function onFilterChange(filteredCars) {
    visibleCars = filteredCars;
    buildCarousel(filteredCars);
    if (filteredCars.length === 0) return;

    // If current car is still in results — keep it
    if (!currentCarData || !filteredCars.find(c => c.id === currentCarData.id)) {
      selectCar(filteredCars[0].id);
    } else {
      setActiveCard(currentCarData.id);
    }
  }

  /* ═══════════════════════════════════════════
     Set car group (called from Main after 3D build)
  ═══════════════════════════════════════════ */
  function setCarGroup(group) {
    currentCarGroup = group;
  }

  /* ═══════════════════════════════════════════
     Init
  ═══════════════════════════════════════════ */
  function init() {
    initTabs();
    initInteractButtons();
    initPanelActions();
    initCameraPresets();
    initDayNight();

    // Filters
    Filters.init(onFilterChange);

    // Compare modal
    Compare.init();

    // Favorites modal (pass selectCar so "View in Showroom" works)
    Favorites.init(selectCar);

    // Customizer
    Customizer.init(() => {});

    // Booking
    Booking.init();

    // Build initial carousel with all cars
    buildCarousel(CARS);

    // Select first car
    selectCar(CARS[0].id);
  }

  return { init, selectCar, setCarGroup, onFilterChange };
})();
