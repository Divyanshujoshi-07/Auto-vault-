/* ═══════════════════════════════════════════════
   AutoVault 3D — Main Entry Point
   Boots the scene, manages active 3D car,
   drives the loading screen, wires everything.
═══════════════════════════════════════════════ */

(function () {

  const canvas        = document.getElementById('showroom-canvas');
  const loaderBar     = document.getElementById('loader-bar');
  const loaderStatus  = document.getElementById('loader-status');
  const loadingScreen = document.getElementById('loading-screen');

  let activeCarGroup  = null;
  let scene           = null;
  let isTransitioning = false;

  /* ─── Loading Progress Helper ─── */
  function setProgress(pct, msg) {
    loaderBar.style.width  = pct + '%';
    loaderStatus.textContent = msg;
  }

  /* ─── Dismiss Loading Screen ─── */
  function hideLoader() {
    loadingScreen.classList.add('fade-out');
    setTimeout(() => { loadingScreen.style.display = 'none'; }, 900);
  }

  /* ─── Build + swap 3D car in scene ─── */
  function load3DCar(carData) {
    if (isTransitioning) return;
    isTransitioning = true;

    const doSwap = () => {
      // Remove old group
      if (activeCarGroup) {
        scene.remove(activeCarGroup);
        disposeGroup(activeCarGroup);
        activeCarGroup = null;
      }

      // Build new
      const group = CarBuilder.build(
        carData.id,
        carData.defaultColor,
        'standard'
      );

      // Centre and raise the car group slightly
      group.position.set(0, 0, 0);
      scene.add(group);
      activeCarGroup = group;

      // Give UI the group reference for interaction / customiser
      UI.setCarGroup(group);

      // Register wheel spin in animation loop
      SceneManager.removeAnimCallback(wheelSpin);
      SceneManager.addAnimCallback(wheelSpin);

      // Also hand carGroup to customiser (re-init swatches too)
      Customizer.loadCar(carData, group);

      isTransitioning = false;
    };

    // Tiny fade-out → swap → fade-in for smoother feel
    canvas.style.transition = 'opacity 0.25s';
    canvas.style.opacity    = '0';
    setTimeout(() => {
      doSwap();
      canvas.style.opacity = '1';
    }, 250);
  }

  /* ─── Wheel spin callback ─── */
  function wheelSpin() {
    if (activeCarGroup) CarBuilder.spinWheels(activeCarGroup, 0.012);
  }

  /* ─── Dispose Three.js objects ─── */
  function disposeGroup(group) {
    group.traverse(obj => {
      if (obj.isMesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }

  /* ─── Boot sequence ─── */
  function boot() {
    setProgress(10, 'Starting renderer…');

    // 1. Init Three.js scene
    const { scene: sc } = SceneManager.init(canvas);
    scene = sc;
    setProgress(28, 'Building showroom environment…');

    // 2. Init environment (floor, lights, BG)
    Environment.init(scene);
    setProgress(52, 'Loading car models…');

    // 3. Init UI modules (carousel, panels, events)
    UI.init();
    setProgress(76, 'Polishing paintwork…');

    // 4. Expose load3DCar globally so UI can call it on car selection
    window._loadCar3D = function (carData) {
      load3DCar(carData);
    };

    // 5. Trigger initial car load (UI.init already called selectCar(CARS[0]))
    //    The _loadCar3D hook above handles it, but we also fire it immediately.
    load3DCar(CARS[0]);

    setProgress(94, 'Almost ready…');

    // 6. Short delay then hide loader
    setTimeout(() => {
      setProgress(100, 'Welcome to AutoVault 3D!');
      setTimeout(hideLoader, 500);
    }, 600);
  }

  /* ─── Wait for DOM, then boot ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
