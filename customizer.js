/* ═══════════════════════════════════════════════
   AutoVault 3D — Customizer Module
   Color swatches · Wheel style · Interior theme
═══════════════════════════════════════════════ */

const Customizer = (() => {

  let currentCar  = null;
  let currentGroup = null;
  let activeColor  = null;
  let activeWheel  = 'standard';
  let onColorChange = null;

  function init(onColorChangeFn) {
    onColorChange = onColorChangeFn;

    // Wheel buttons
    document.querySelectorAll('#wheel-btns .opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#wheel-btns .opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeWheel = btn.dataset.wheel;
        if (currentGroup) CarBuilder.setWheelStyle(currentGroup, activeWheel);
      });
    });

    // Interior buttons (visual only, label feedback)
    document.querySelectorAll('#interior-btns .opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#interior-btns .opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  function loadCar(carData, carGroup) {
    currentCar   = carData;
    currentGroup = carGroup;
    activeColor  = carData.defaultColor;
    activeWheel  = 'standard';

    // Reset wheel buttons
    document.querySelectorAll('#wheel-btns .opt-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.wheel === 'standard');
    });
    document.querySelectorAll('#interior-btns .opt-btn').forEach((b,i) => {
      b.classList.toggle('active', i === 0);
    });

    renderSwatches(carData.colors);
  }

  function renderSwatches(colors) {
    const container = document.getElementById('color-swatches');
    container.innerHTML = '';

    colors.forEach((hex, i) => {
      const swatch = document.createElement('button');
      swatch.className = 'swatch' + (i === 0 ? ' active' : '');
      swatch.style.background = hex;
      swatch.title = hex;
      swatch.addEventListener('click', () => {
        container.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        activeColor = hex;
        if (currentGroup) CarBuilder.setColor(currentGroup, hex);
        if (onColorChange) onColorChange(hex);
      });
      container.appendChild(swatch);
    });
  }

  return { init, loadCar };
})();
