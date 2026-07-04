/* ═══════════════════════════════════════════════
   AutoVault 3D — Compare Module
   Add up to 3 cars · Side-by-side table
═══════════════════════════════════════════════ */

const Compare = (() => {

  let compareList = []; // array of car IDs
  const MAX = 3;

  function init() {
    document.getElementById('compare-nav-btn').addEventListener('click', openModal);
    document.getElementById('compare-close').addEventListener('click', closeModal);
    document.getElementById('compare-overlay').addEventListener('click', closeModal);
  }

  function addCar(id) {
    if (compareList.includes(id)) {
      // Already there — remove it
      compareList = compareList.filter(c => c !== id);
      updateBadge();
      updateAddBtn(id);
      return false;
    }
    if (compareList.length >= MAX) {
      showToastWarn(`You can compare up to ${MAX} cars at a time.`);
      return false;
    }
    compareList.push(id);
    updateBadge();
    updateAddBtn(id);
    return true;
  }

  function removeCar(id) {
    compareList = compareList.filter(c => c !== id);
    updateBadge();
    renderTable();
  }

  function isInCompare(id) { return compareList.includes(id); }

  function updateBadge() {
    document.getElementById('compare-count').textContent = compareList.length;
  }

  function updateAddBtn(id) {
    const btn = document.getElementById('compare-add');
    if (!btn) return;
    const inList = isInCompare(id);
    btn.title = inList ? 'Remove from compare' : 'Add to compare';
    btn.style.color = inList ? 'var(--cyan)' : '';
  }

  function openModal() {
    if (compareList.length === 0) {
      showToastWarn('Add at least one car to compare using the ⚖ button.');
      return;
    }
    renderTable();
    document.getElementById('compare-modal').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('compare-modal').classList.add('hidden');
  }

  function showToastWarn(msg) {
    // Reuse toast with warning styling
    const toast = document.getElementById('toast');
    toast.innerHTML = `<span class="toast-icon">⚠️</span><div><strong>${msg}</strong></div>`;
    toast.classList.remove('hidden');
    toast.style.borderColor = 'var(--gold)';
    setTimeout(() => {
      toast.classList.add('hidden');
      toast.style.borderColor = '';
    }, 3000);
  }

  const COMPARE_ROWS = [
    { label: 'Brand',        key: c => c.brand },
    { label: 'Body Type',    key: c => c.bodyType },
    { label: 'Price',        key: c => formatPrice(c.price) },
    { label: 'Engine',       key: c => c.specs.engine },
    { label: 'Horsepower',   key: c => c.specs.horsepower },
    { label: 'Torque',       key: c => c.specs.torque },
    { label: 'Fuel Type',    key: c => c.specs.fuelType },
    { label: 'Mileage',      key: c => c.specs.mileage },
    { label: 'Top Speed',    key: c => c.specs.topSpeed },
    { label: '0–100 km/h',   key: c => c.specs.acceleration },
    { label: 'Transmission', key: c => c.specs.transmission },
    { label: 'Seats',        key: c => c.specs.seats },
    { label: 'Safety',       key: c => c.specs.safety.join(', ') },
  ];

  function renderTable() {
    const table = document.getElementById('compare-table');
    const cars  = compareList.map(id => CARS.find(c => c.id === id)).filter(Boolean);

    // Color swatches HTML for each car
    const swatchHtml = car => car.colors.slice(0,4).map(col =>
      `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${col};margin-right:2px;border:1px solid rgba(255,255,255,0.2)"></span>`
    ).join('');

    // Header row
    const headerCols = ['<th style="width:120px"></th>', ...cars.map(car => `
      <th>
        <button class="remove-compare" data-id="${car.id}" title="Remove">✕</button>
        <div style="font-size:0.65rem;color:var(--cyan);letter-spacing:.1em;text-transform:uppercase">${car.brand}</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:700;margin:3px 0">${car.name}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:var(--gold)">${formatPrice(car.price)}</div>
        <div style="margin-top:6px">${swatchHtml(car)}</div>
      </th>
    `)];

    // Data rows
    const dataRows = COMPARE_ROWS.map(row => {
      const vals = cars.map(c => row.key(c));
      // Highlight best numeric value (lower price, higher hp/speed)
      const cells = vals.map(v => `<td>${v}</td>`).join('');
      return `<tr><td>${row.label}</td>${cells}</tr>`;
    });

    table.innerHTML = `
      <thead><tr>${headerCols.join('')}</tr></thead>
      <tbody>${dataRows.join('')}</tbody>
    `;

    // Remove buttons
    table.querySelectorAll('.remove-compare').forEach(btn => {
      btn.addEventListener('click', () => {
        removeCar(btn.dataset.id);
        if (compareList.length === 0) closeModal();
      });
    });
  }

  return { init, addCar, removeCar, isInCompare, updateAddBtn };
})();
