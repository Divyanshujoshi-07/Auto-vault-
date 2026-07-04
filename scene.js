/* ═══════════════════════════════════════════════
   AutoVault 3D — Scene Setup
   Renderer · Camera · Custom OrbitControls
═══════════════════════════════════════════════ */

const SceneManager = (() => {

  let renderer, scene, camera, controls;
  let animCallbacks = [];
  let frameId;

  /* ─── Custom Orbit Controls ─── */
  class OrbitControls {
    constructor(cam, el) {
      this.cam = cam;
      this.el  = el;
      this.target = new THREE.Vector3(0, 0.5, 0);
      this.minDist = 5;
      this.maxDist = 18;
      this.minPhi  = 0.15;
      this.maxPhi  = Math.PI * 0.48;
      this.enabled = true;
      this.dampFactor = 0.08;

      const sph = new THREE.Spherical();
      sph.setFromVector3(cam.position.clone().sub(this.target));
      this._sph = sph;
      this._targetSph = sph.clone();

      this._drag = false;
      this._last = {x:0, y:0};
      this._pinchDist = 0;

      this._bind();
    }

    _bind() {
      const el = this.el;
      el.addEventListener('mousedown',  e => this._onDown(e));
      window.addEventListener('mousemove', e => this._onMove(e));
      window.addEventListener('mouseup',   ()  => { this._drag = false; });
      el.addEventListener('wheel',      e => this._onWheel(e), {passive:false});
      el.addEventListener('touchstart', e => this._onTouchStart(e), {passive:false});
      el.addEventListener('touchmove',  e => this._onTouchMove(e),  {passive:false});
      el.addEventListener('touchend',   ()  => { this._drag = false; });
      el.addEventListener('contextmenu', e => e.preventDefault());
    }

    _onDown(e) {
      if (!this.enabled) return;
      this._drag = true;
      this._last = {x: e.clientX, y: e.clientY};
    }
    _onMove(e) {
      if (!this._drag || !this.enabled) return;
      const dx = (e.clientX - this._last.x) * 0.008;
      const dy = (e.clientY - this._last.y) * 0.008;
      this._targetSph.theta -= dx;
      this._targetSph.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this._targetSph.phi + dy));
      this._last = {x: e.clientX, y: e.clientY};
    }
    _onWheel(e) {
      if (!this.enabled) return;
      e.preventDefault();
      this._targetSph.radius = Math.max(this.minDist, Math.min(this.maxDist, this._targetSph.radius + e.deltaY * 0.012));
    }
    _onTouchStart(e) {
      if (!this.enabled) return;
      if (e.touches.length === 1) {
        this._drag = true;
        this._last = {x: e.touches[0].clientX, y: e.touches[0].clientY};
      } else if (e.touches.length === 2) {
        this._pinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }
    _onTouchMove(e) {
      e.preventDefault();
      if (!this.enabled) return;
      if (e.touches.length === 1 && this._drag) {
        const dx = (e.touches[0].clientX - this._last.x) * 0.01;
        const dy = (e.touches[0].clientY - this._last.y) * 0.01;
        this._targetSph.theta -= dx;
        this._targetSph.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this._targetSph.phi + dy));
        this._last = {x: e.touches[0].clientX, y: e.touches[0].clientY};
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = (this._pinchDist - dist) * 0.03;
        this._targetSph.radius = Math.max(this.minDist, Math.min(this.maxDist, this._targetSph.radius + delta));
        this._pinchDist = dist;
      }
    }

    update() {
      // Damped interpolation
      this._sph.theta += (this._targetSph.theta - this._sph.theta) * this.dampFactor;
      this._sph.phi    += (this._targetSph.phi   - this._sph.phi)   * this.dampFactor;
      this._sph.radius += (this._targetSph.radius - this._sph.radius) * this.dampFactor;

      const pos = new THREE.Vector3().setFromSpherical(this._sph);
      this.cam.position.copy(pos.add(this.target));
      this.cam.lookAt(this.target);
    }

    // Animate to a specific spherical position
    flyTo(radius, phi, theta, duration = 1200) {
      const start = {
        r: this._targetSph.radius,
        p: this._targetSph.phi,
        t: this._targetSph.theta
      };
      const end = { r: radius, p: phi, t: theta };
      const t0 = performance.now();

      const ease = x => x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2;

      const step = (now) => {
        const progress = Math.min((now - t0) / duration, 1);
        const e = ease(progress);
        this._targetSph.radius = start.r + (end.r - start.r) * e;
        this._targetSph.phi    = start.p + (end.p - start.p) * e;
        this._targetSph.theta  = start.t + (end.t - start.t) * e;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }

  /* ─── Init ─── */
  function init(canvas) {
    // Scene
    scene = new THREE.Scene();
    scene.background = null;

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding   = THREE.sRGBEncoding;
    renderer.toneMapping      = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 3.5, 10);

    // Controls
    controls = new OrbitControls(camera, canvas);
    controls._targetSph.radius = 10;
    controls._targetSph.phi    = 0.65;
    controls._targetSph.theta  = 0.4;

    // Resize
    window.addEventListener('resize', onResize);

    // Start loop
    animate();

    return { scene, renderer, camera, controls };
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    frameId = requestAnimationFrame(animate);
    controls.update();
    animCallbacks.forEach(cb => cb());
    renderer.render(scene, camera);
  }

  function addAnimCallback(fn) { animCallbacks.push(fn); }
  function removeAnimCallback(fn) { animCallbacks = animCallbacks.filter(c => c !== fn); }

  function getScene()    { return scene;    }
  function getCamera()   { return camera;   }
  function getControls() { return controls; }

  return { init, getScene, getCamera, getControls, addAnimCallback, removeAnimCallback };
})();
