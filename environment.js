/* ═══════════════════════════════════════════════
   AutoVault 3D — Environment
   Floor · Lighting · Day/Night · BG gradient
═══════════════════════════════════════════════ */

const Environment = (() => {

  let isNight = false;
  let ambientLight, hemi, spots = [], rimLight;
  let floorMesh, bgMesh;
  let scene;

  /* ─── Palette ─── */
  const DAY = {
    ambient:  new THREE.Color(0xd0e8ff),
    hemiSky:  new THREE.Color(0xd0e8ff),
    hemiGnd:  new THREE.Color(0x334455),
    spot1:    new THREE.Color(0xffffff),
    spot2:    new THREE.Color(0xd8eeff),
    rim:      new THREE.Color(0xaaccff),
    floor:    new THREE.Color(0x1a2235),
    floorR:   0.3,
    bgTop:    '#070B14',
    bgBottom: '#101C2E',
    ambInt:   0.6,
    hemiInt:  0.4,
    spotInt:  3.0,
    rimInt:   0.8
  };
  const NIGHT = {
    ambient:  new THREE.Color(0x102030),
    hemiSky:  new THREE.Color(0x0a1428),
    hemiGnd:  new THREE.Color(0x050a10),
    spot1:    new THREE.Color(0x4488ff),
    spot2:    new THREE.Color(0xff44aa),
    rim:      new THREE.Color(0x00d4ff),
    floor:    new THREE.Color(0x0d1020),
    floorR:   0.15,
    bgTop:    '#020408',
    bgBottom: '#080d18',
    ambInt:   0.15,
    hemiInt:  0.2,
    spotInt:  4.5,
    rimInt:   1.2
  };

  /* ─── Gradient BG ─── */
  function makeBgMesh(s) {
    const geo = new THREE.SphereGeometry(120, 16, 8);
    geo.scale(-1, -1, -1); // invert
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTop:    { value: new THREE.Color(0x070B14) },
        uBottom: { value: new THREE.Color(0x101C2E) }
      },
      vertexShader: `
        varying vec3 vPos;
        void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
      `,
      fragmentShader: `
        varying vec3 vPos;
        uniform vec3 uTop, uBottom;
        void main() {
          float t = clamp((vPos.y + 60.0) / 120.0, 0.0, 1.0);
          gl_FragColor = vec4(mix(uBottom, uTop, t), 1.0);
        }
      `,
      side: THREE.FrontSide,
      depthWrite: false
    });
    bgMesh = new THREE.Mesh(geo, mat);
    bgMesh.renderOrder = -1;
    s.add(bgMesh);
    return mat;
  }

  /* ─── Showroom Floor ─── */
  function makeFloor(s) {
    // Main reflective floor
    const geo = new THREE.CircleGeometry(22, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a2235),
      metalness: 0.85,
      roughness: 0.28,
    });
    floorMesh = new THREE.Mesh(geo, mat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    s.add(floorMesh);

    // Glowing platform ring under car
    const ringGeo = new THREE.RingGeometry(2.2, 3.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00B4D8),
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    s.add(ring);

    // Inner glow disc
    const discGeo = new THREE.CircleGeometry(2.2, 64);
    const discMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00B4D8),
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.001;
    s.add(disc);

    // Grid lines for depth
    const gridHelper = new THREE.GridHelper(40, 40, 0x1a2e44, 0x111c2a);
    gridHelper.position.y = 0.001;
    s.add(gridHelper);
  }

  /* ─── Spotlights ─── */
  function makeSpots(s) {
    const positions = [
      [0,  10,  0],   // top main
      [-5, 8,  4],   // left fill
      [5,  8,  4],   // right fill
      [0,  7, -5],   // back key
    ];
    positions.forEach(([x,y,z], i) => {
      const spot = new THREE.SpotLight(0xffffff, i === 0 ? 3.0 : 1.5);
      spot.position.set(x, y, z);
      spot.target.position.set(0, 0.5, 0);
      spot.angle = i === 0 ? 0.45 : 0.5;
      spot.penumbra = 0.35;
      spot.decay = 1.5;
      spot.distance = 30;
      spot.castShadow = (i === 0);
      if (i === 0) {
        spot.shadow.mapSize.width  = 2048;
        spot.shadow.mapSize.height = 2048;
        spot.shadow.camera.near = 0.5;
        spot.shadow.camera.far  = 30;
        spot.shadow.bias = -0.001;
      }
      s.add(spot);
      s.add(spot.target);
      spots.push(spot);
    });

    // Rim / backlight
    rimLight = new THREE.DirectionalLight(0xaaccff, 0.8);
    rimLight.position.set(-4, 3, -8);
    s.add(rimLight);

    return spots;
  }

  /* ─── Init ─── */
  function init(s) {
    scene = s;
    const bgMat = makeBgMesh(s);

    // Ambient
    ambientLight = new THREE.AmbientLight(DAY.ambient, DAY.ambInt);
    s.add(ambientLight);

    // Hemi
    hemi = new THREE.HemisphereLight(DAY.hemiSky, DAY.hemiGnd, DAY.hemiInt);
    s.add(hemi);

    makeFloor(s);
    makeSpots(s);

    return { ambientLight, spots, rimLight };
  }

  /* ─── Lerp Color ─── */
  function lerpColor(light, target, t) {
    light.color.lerp(target, t);
  }

  /* ─── Transition ─── */
  function transition(toNight, onDone) {
    const from = isNight ? NIGHT : DAY;
    const to   = toNight ? NIGHT : DAY;
    const dur = 1200;
    const t0  = performance.now();

    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = p < 0.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2;

      // Ambient
      ambientLight.color.copy(from.ambient).lerp(to.ambient, e);
      ambientLight.intensity = from.ambInt + (to.ambInt - from.ambInt) * e;

      // Hemi
      hemi.color.copy(from.hemiSky).lerp(to.hemiSky, e);
      hemi.groundColor.copy(from.hemiGnd).lerp(to.hemiGnd, e);
      hemi.intensity = from.hemiInt + (to.hemiInt - from.hemiInt) * e;

      // Spots
      spots[0].color.copy(from.spot1).lerp(to.spot1, e);
      spots[1].color.copy(from.spot2).lerp(to.spot2, e);
      spots[2].color.copy(from.spot2).lerp(to.spot2, e);
      spots[3].color.copy(from.spot1).lerp(to.spot1, e);
      spots[0].intensity = from.spotInt + (to.spotInt - from.spotInt) * e;

      // Rim
      rimLight.color.copy(from.rim).lerp(to.rim, e);
      rimLight.intensity = from.rimInt + (to.rimInt - from.rimInt) * e;

      // Floor
      if (floorMesh) {
        floorMesh.material.color.copy(from.floor).lerp(to.floor, e);
        floorMesh.material.roughness = from.floorR + (to.floorR - from.floorR) * e;
      }

      // BG
      if (bgMesh) {
        bgMesh.material.uniforms.uTop.value.set(to.bgTop);
        bgMesh.material.uniforms.uBottom.value.set(to.bgBottom);
      }

      if (p < 1) requestAnimationFrame(step);
      else { isNight = toNight; if (onDone) onDone(); }
    };
    requestAnimationFrame(step);
  }

  function toggleDayNight(onDone) { transition(!isNight, onDone); }
  function getIsNight() { return isNight; }

  return { init, toggleDayNight, getIsNight };
})();
