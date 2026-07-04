/* ═══════════════════════════════════════════════
   AutoVault 3D — Car Builder v2
   10 Individually Designed Cars
   Each car has its own real-world iconic features
═══════════════════════════════════════════════ */

const CarBuilder = (() => {

  /* ─── Shared Materials ─── */
  const glassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x223344), metalness: 0.1, roughness: 0.0,
    transparent: true, opacity: 0.45
  });
  const tireMat  = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.0 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.3, roughness: 0.7 });
  const darkMat  = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.2, roughness: 0.8 });
  const redAccent = new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.4, roughness: 0.5 });

  function makePaintMat(hex) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex), metalness: 0.88, roughness: 0.12, envMapIntensity: 1.5
    });
  }
  function makeChromeMat() {
    return new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1.0, roughness: 0.05 });
  }
  function makeRimMat(style) {
    const c = { standard:{color:0xaaaaaa,m:0.9,r:0.25}, sport:{color:0x333333,m:0.95,r:0.1}, racing:{color:0xc0392b,m:0.85,r:0.2} };
    const s = c[style] || c.standard;
    return new THREE.MeshStandardMaterial({ color: s.color, metalness: s.m, roughness: s.r });
  }
  function makeLightMat(col, em) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(col), emissive: new THREE.Color(em),
      emissiveIntensity: 0.0, transparent: true, opacity: 0.92
    });
  }

  /* ─── Geometry Helpers ─── */
  function box(w, h, d, mat, rx=0, ry=0, rz=0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.rotation.set(rx, ry, rz);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
  function cyl(rt, rb, h, seg, mat) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.castShadow = true;
    return m;
  }
  function add(g, mesh, x, y, z) { mesh.position.set(x, y, z); g.add(mesh); return mesh; }

  /* ─── Wheel Assembly ─── */
  function buildWheel(rimStyle='standard') {
    const g = new THREE.Group();
    const rimM = makeRimMat(rimStyle);
    const chrM = makeChromeMat();
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.12, 16, 32), tireMat);
    tire.rotation.y = Math.PI/2; tire.castShadow = true; g.add(tire);
    const disc = cyl(0.28, 0.28, 0.06, 32, rimM);
    disc.rotation.z = Math.PI/2; g.add(disc);
    for (let i = 0; i < 5; i++) {
      const sp = box(0.04, 0.04, 0.22, rimM);
      sp.rotation.z = Math.PI/2; sp.rotation.x = (i/5)*Math.PI*2;
      sp.position.set(0, Math.sin(sp.rotation.x)*0.12, Math.cos(sp.rotation.x)*0.12);
      g.add(sp);
    }
    const cap = cyl(0.06, 0.06, 0.07, 16, chrM);
    cap.rotation.z = Math.PI/2; g.add(cap);
    return g;
  }

  /* ─── Door Helper ─── */
  function makeDoor(g, px, py, pz, doorLen, doorH, w, winH, paint, chrome) {
    const dg = new THREE.Group();
    const panel = box(w, doorH, doorLen, paint);
    panel.position.set(0, 0, doorLen/2);
    const win = box(w, winH, doorLen*0.85, glassMat);
    win.position.set(0, doorH/2 + winH/2, doorLen/2);
    const hdl = box(w*1.1, 0.03, 0.09, chrome);
    hdl.position.set(0, doorH*0.25, doorLen*0.65);
    dg.add(panel, win, hdl);
    dg.position.set(0, 0, -doorLen/2);
    const pg = new THREE.Group();
    pg.position.set(px, py, pz);
    pg.add(dg); g.add(pg);
    return pg;
  }

  /* ─── Wheels helper ─── */
  function addWheels(g, positions, scale, rimStyle) {
    const wheels = [];
    positions.forEach(([x,y,z]) => {
      const w = buildWheel(rimStyle);
      w.position.set(x,y,z);
      if (scale !== 1) w.scale.setScalar(scale);
      w.rotation.z = x < 0 ? Math.PI/2 : -Math.PI/2;
      g.add(w); wheels.push(w);
    });
    return wheels;
  }

  /* ─── Arch helper ─── */
  function addArch(g, x, y, z, w, h, d) {
    const a = box(w, h, d, blackMat);
    a.position.set(x, y, z); g.add(a);
  }

  /* ─── Bonnet+Trunk helper ─── */
  function makeBonnet(g, pz, py, meshLen, meshW, paint) {
    const pg = new THREE.Group();
    pg.position.set(0, py, pz);
    const m = box(meshW, 0.06, meshLen, paint);
    m.position.set(0, 0, meshLen/2);
    pg.add(m); g.add(pg);
    return pg;
  }
  function makeTrunk(g, pz, py, meshLen, meshW, paint) {
    const pg = new THREE.Group();
    pg.position.set(0, py, pz);
    const m = box(meshW, 0.07, meshLen, paint);
    m.position.set(0, 0, -meshLen/2);
    pg.add(m); g.add(pg);
    return pg;
  }

  /* ════════════════════════════════════════════
     1. BMW M4 COMPETITION
     Signature: Tall upright kidney grilles,
     M4 hood power dome, quad exhausts, low stance
  ════════════════════════════════════════════ */
  function buildBMWM4(color, rimStyle) {
    const g = new THREE.Group();
    const paint = makePaintMat(color);
    const chrome = makeChromeMat();

    // Lower body + wide M4 flares
    add(g, box(2.04, 0.52, 4.3, paint), 0, 0.38, 0);
    [-1.04, 1.04].forEach(x => {
      add(g, box(0.08, 0.48, 1.3, paint), x, 0.37, 0.72);
      add(g, box(0.08, 0.46, 1.1, paint), x, 0.37, -0.7);
    });

    // Sill strips
    [-1.04, 1.04].forEach(x => add(g, box(0.06, 0.1, 3.5, blackMat), x, 0.19, 0));

    // Cabin
    add(g, box(1.9, 0.5, 2.05, paint), 0, 0.91, -0.1);

    // Roof
    add(g, box(1.84, 0.07, 1.86, paint), 0, 1.17, -0.12);

    // M4 Hood with power domes
    add(g, box(1.88, 0.06, 1.18, paint), 0, 0.66, 1.56);
    [-0.38, 0.38].forEach(x => add(g, box(0.14, 0.05, 1.14, paint), x, 0.695, 1.56));

    // Windshield + glass
    add(g, box(1.82, 0.46, 0.07, blackMat, -0.54, 0, 0), 0, 0.94, 0.9);
    add(g, box(1.72, 0.43, 0.04, glassMat, -0.54, 0, 0), 0, 0.94, 0.88);

    // Rear window
    add(g, box(1.82, 0.42, 0.07, blackMat, 0.54, 0, 0), 0, 0.92, -1.16);
    add(g, box(1.72, 0.39, 0.04, glassMat, 0.54, 0, 0), 0, 0.92, -1.14);

    // Side windows (rear)
    [-1.0, 1.0].forEach(x => add(g, box(0.04, 0.28, 0.78, glassMat), x, 0.96, -0.48));

    // Side mirrors (wide M-sport)
    [-1.06, 1.06].forEach(x => add(g, box(0.06, 0.09, 0.15, blackMat), x, 0.88, 0.76));

    // === FRONT FACE ===
    // BMW M4 SIGNATURE: Two TALL upright kidney grilles
    const kidneyMat = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.1, roughness: 0.9 });
    [-0.3, 0.3].forEach(x => {
      // Chrome border frame
      const frame = box(0.5, 0.35, 0.09, chrome);
      frame.position.set(x, 0.52, 2.18);
      g.add(frame);
      // Dark kidney opening
      const kidney = box(0.42, 0.29, 0.1, kidneyMat);
      kidney.position.set(x, 0.52, 2.19);
      g.add(kidney);
      // Kidney vertical bars
      for (let i = 0; i < 3; i++) {
        const bar = box(0.04, 0.25, 0.07, kidneyMat);
        bar.position.set(x - 0.12 + i*0.12, 0.52, 2.21);
        g.add(bar);
      }
    });
    // Chrome divider between kidneys
    add(g, box(0.06, 0.32, 0.08, chrome), 0, 0.52, 2.19);

    // Wide lower bumper with M4 air intakes
    add(g, box(2.04, 0.26, 0.13, blackMat), 0, 0.23, 2.15);
    [-0.52, 0.52].forEach(x => {
      add(g, box(0.48, 0.19, 0.11, kidneyMat), x, 0.24, 2.16);
      add(g, box(0.5, 0.21, 0.09, chrome), x, 0.24, 2.14);
    });
    // Center air duct
    add(g, box(0.36, 0.14, 0.1, kidneyMat), 0, 0.24, 2.17);
    // Bottom carbon strip
    add(g, box(2.02, 0.1, 0.11, blackMat), 0, 0.13, 2.14);

    // Headlights: Angular L-shape (BMW M4 signature)
    const hlMat = makeLightMat(0xeeeeff, 0xffffff);
    [-0.74, 0.74].forEach(x => {
      add(g, box(0.38, 0.09, 0.07, hlMat), x, 0.65, 2.17);    // main beam
      add(g, box(0.34, 0.03, 0.06, hlMat), x, 0.56, 2.17);    // DRL horizontal
      const v = box(0.03, 0.13, 0.06, hlMat);                   // DRL vertical arm
      v.position.set(x < 0 ? x+0.17 : x-0.17, 0.61, 2.17);
      g.add(v);
    });
    const hlMats = [hlMat];

    // === REAR ===
    // Diffuser
    add(g, box(1.6, 0.14, 0.09, blackMat), 0, 0.14, -2.2);
    for (let i = 0; i < 5; i++) add(g, box(0.03, 0.12, 0.07, darkMat), -0.28+i*0.14, 0.14, -2.22);
    add(g, box(2.04, 0.22, 0.13, blackMat), 0, 0.22, -2.2);

    // QUAD EXHAUST TIPS (M4 signature 2+2)
    [[-0.56,0.18],[-0.38,0.18],[0.38,0.18],[0.56,0.18]].forEach(([x,y]) => {
      const ex = cyl(0.046, 0.046, 0.09, 10, chrome);
      ex.rotation.x = Math.PI/2; ex.position.set(x, y, -2.26); g.add(ex);
    });

    // Taillights — full-width LED strip (M4 style)
    const tlMat = makeLightMat(0xff1100, 0xff1100);
    [-0.65, 0.65].forEach(x => add(g, box(0.46, 0.1, 0.07, tlMat), x, 0.59, -2.19));
    add(g, box(1.84, 0.03, 0.05, tlMat), 0, 0.53, -2.19);

    // Boot lid
    add(g, box(1.9, 0.09, 0.72, paint), 0, 0.73, -1.58);

    // Rear bumper
    add(g, box(2.04, 0.2, 0.12, paint), 0, 0.58, -2.19);

    // === ANIMATED PARTS ===
    const doorFL = makeDoor(g, -1.04, 0.67, 0.89, 0.85, 0.44, 0.07, 0.27, paint, chrome);
    const doorFR = makeDoor(g,  1.04, 0.67, 0.89, 0.85, 0.44, 0.07, 0.27, paint, chrome);
    const doorRL = makeDoor(g, -1.04, 0.67, 0.0,  0.78, 0.43, 0.07, 0.26, paint, chrome);
    const doorRR = makeDoor(g,  1.04, 0.67, 0.0,  0.78, 0.43, 0.07, 0.26, paint, chrome);
    const bonnetPivot = makeBonnet(g, 1.0, 0.65, 1.14, 1.88, paint);
    const trunkPivot  = makeTrunk(g, -1.18, 0.72, 0.74, 1.88, paint);

    // Wheels (low stance)
    const wPos = [[-1.0,0.36,1.34],[1.0,0.36,1.34],[-1.0,0.36,-1.34],[1.0,0.36,-1.34]];
    const wheels = addWheels(g, wPos, 1.0, rimStyle);
    wPos.forEach(([x,y,z]) => addArch(g, x*0.99, y+0.22, z, 0.18, 0.15, 0.68));

    g.userData = {
      state: { doorFL:false,doorFR:false,doorRL:false,doorRR:false,bonnet:false,trunk:false,lights:false },
      parts: { doorFL,doorFR,doorRL,doorRR,bonnetPivot,trunkPivot,hlMats,wheels,tlMat },
      paintMeshes: collectPaintMeshes(g, paint), paintMat: paint
    };
    return g;
  }

  /* ════════════════════════════════════════════
     2. BMW X5 xDrive50e
     Signature: Landscape kidney grille at top,
     L-shaped headlights, high stance, roof rails
  ════════════════════════════════════════════ */
  function buildBMWX5(color, rimStyle) {
    const g = new THREE.Group();
    const paint = makePaintMat(color);
    const chrome = makeChromeMat();

    // Lower body (tall)
    add(g, box(2.12, 0.65, 4.65, paint), 0, 0.52, 0);
    // Plastic cladding
    add(g, box(2.18, 0.24, 4.55, blackMat), 0, 0.24, 0);
    // Running boards
    [-1.1, 1.1].forEach(x => add(g, box(0.14, 0.05, 3.2, blackMat), x, 0.22, 0));
    // Sills
    [-1.1, 1.1].forEach(x => add(g, box(0.06, 0.12, 3.8, blackMat), x, 0.28, 0));

    // Cabin (tall, full-length)
    add(g, box(2.06, 0.68, 3.15, paint), 0, 1.19, -0.15);
    add(g, box(2.0, 0.09, 2.95, paint), 0, 1.54, -0.15);

    // Roof rails
    [-0.86, 0.86].forEach(x => add(g, box(0.04, 0.04, 2.6, blackMat), x, 1.6, -0.18));

    // Hood (blunt, raised)
    add(g, box(2.04, 0.09, 1.1, paint), 0, 0.9, 1.7);

    // Windshield (more upright)
    add(g, box(1.98, 0.61, 0.08, blackMat, -0.44, 0, 0), 0, 1.18, 1.04);
    add(g, box(1.88, 0.57, 0.04, glassMat, -0.44, 0, 0), 0, 1.18, 1.02);
    // Rear window
    add(g, box(1.98, 0.53, 0.08, blackMat, 0.38, 0, 0), 0, 1.2, -1.56);
    add(g, box(1.88, 0.49, 0.04, glassMat, 0.38, 0, 0), 0, 1.2, -1.54);
    // Side windows
    [-1.07, 1.07].forEach(x => {
      add(g, box(0.04, 0.4, 0.92, glassMat), x, 1.16, 0.46);
      add(g, box(0.04, 0.37, 0.8, glassMat),  x, 1.15, -0.56);
    });
    // D-pillar quarter glass
    [-1.07, 1.07].forEach(x => add(g, box(0.04, 0.3, 0.35, glassMat), x, 1.13, -1.28));

    // Side mirrors
    [-1.1, 1.1].forEach(x => add(g, box(0.07, 0.1, 0.16, paint), x, 1.12, 1.04));

    // === FRONT — BMW X5 SIGNATURE ===
    // Large landscape kidney grille (connected, wide, at top of front)
    const kidneyMat = new THREE.MeshStandardMaterial({ color: 0x060606, roughness: 0.9 });
    // Chrome surround frame (very prominent on X5)
    add(g, box(1.46, 0.38, 0.1, chrome), 0, 0.66, 2.36);
    // Dark kidney opening (landscape, connected pair)
    add(g, box(1.38, 0.3, 0.12, kidneyMat), 0, 0.66, 2.37);
    // Kidney divider
    add(g, box(0.07, 0.27, 0.1, chrome), 0, 0.66, 2.38);
    // Internal grille bars
    for (let i = 0; i < 5; i++) {
      add(g, box(0.6, 0.04, 0.08, new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.3,roughness:0.8})), -0.36, 0.55+i*0.05, 2.39);
      add(g, box(0.6, 0.04, 0.08, new THREE.MeshStandardMaterial({color:0x1a1a1a,metalness:0.3,roughness:0.8})),  0.36, 0.55+i*0.05, 2.39);
    }
    // Lower bumper
    add(g, box(2.12, 0.28, 0.14, blackMat), 0, 0.36, 2.34);
    add(g, box(1.9,  0.12, 0.12, chrome),   0, 0.22, 2.35);
    // Air curtain intakes
    [-0.62, 0.62].forEach(x => add(g, box(0.46, 0.2, 0.11, kidneyMat), x, 0.38, 2.36));

    // X5 L-SHAPED HEADLIGHTS
    const hlMat = makeLightMat(0xeeeeff, 0xffffff);
    [-0.78, 0.78].forEach(x => {
      add(g, box(0.38, 0.09, 0.07, hlMat), x, 0.79, 2.34);   // top beam
      add(g, box(0.09, 0.22, 0.07, hlMat), x < 0 ? x+0.15 : x-0.15, 0.7, 2.34);  // vertical DRL
      add(g, box(0.35, 0.04, 0.06, hlMat), x, 0.62, 2.35);   // DRL strip
    });
    const hlMats = [hlMat];

    // === REAR ===
    add(g, box(2.12, 0.24, 0.14, blackMat), 0, 0.28, -2.38);
    add(g, box(1.8,  0.12, 0.12, chrome),   0, 0.2,  -2.38);
    const tlMat = makeLightMat(0xff1100, 0xff1100);
    [-0.72, 0.72].forEach(x => {
      add(g, box(0.38, 0.12, 0.07, tlMat), x, 0.78, -2.36);
      add(g, box(0.09, 0.28, 0.06, tlMat), x < 0 ? x+0.15 : x-0.15, 0.7, -2.36);
    });
    add(g, box(1.86, 0.03, 0.05, tlMat), 0, 0.62, -2.35);
    [-0.38, 0.38].forEach(x => {
      const ex = cyl(0.05, 0.05, 0.1, 12, chrome);
      ex.rotation.x = Math.PI/2; ex.position.set(x, 0.24, -2.44); g.add(ex);
    });
    // Rear paint panel
    add(g, box(2.1, 0.65, 0.12, paint), 0, 0.76, -2.37);

    // === ANIMATED PARTS ===
    const doorFL = makeDoor(g, -1.07, 0.84, 0.98, 0.96, 0.56, 0.07, 0.35, paint, chrome);
    const doorFR = makeDoor(g,  1.07, 0.84, 0.98, 0.96, 0.56, 0.07, 0.35, paint, chrome);
    const doorRL = makeDoor(g, -1.07, 0.84, -0.02, 0.9, 0.54, 0.07, 0.34, paint, chrome);
    const doorRR = makeDoor(g,  1.07, 0.84, -0.02, 0.9, 0.54, 0.07, 0.34, paint, chrome);
    const bonnetPivot = makeBonnet(g, 1.15, 0.9, 1.12, 2.02, paint);
    const trunkPivot  = makeTrunk(g, -1.64, 0.94, 0.62, 2.0, paint);

    const wPos = [[-1.04,0.45,1.48],[1.04,0.45,1.48],[-1.04,0.45,-1.48],[1.04,0.45,-1.48]];
    const wheels = addWheels(g, wPos, 1.14, rimStyle);
    wPos.forEach(([x,y,z]) => addArch(g, x*0.99, y+0.26, z, 0.2, 0.18, 0.76));

    g.userData = {
      state: { doorFL:false,doorFR:false,doorRL:false,doorRR:false,bonnet:false,trunk:false,lights:false },
      parts: { doorFL,doorFR,doorRL,doorRR,bonnetPivot,trunkPivot,hlMats,wheels,tlMat },
      paintMeshes: collectPaintMeshes(g, paint), paintMat: paint
    };
    return g;
  }

  /* ════════════════════════════════════════════
     3. TOYOTA CAMRY HYBRID
     Signature: Ultra-wide horizontal grille,
     swept headlights into fenders, fastback roof
  ════════════════════════════════════════════ */
  function buildToyotaCamry(color, rimStyle) {
    const g = new THREE.Group();
    const paint = makePaintMat(color);
    const chrome = makeChromeMat();

    // Long, low body
    add(g, box(2.0, 0.54, 4.7, paint), 0, 0.38, 0);
    [-1.02, 1.02].forEach(x => add(g, box(0.05, 0.1, 3.6, blackMat), x, 0.22, 0));

    // Cabin (slightly fastback)
    add(g, box(1.9, 0.5, 2.1, paint), 0, 0.91, -0.15);
    add(g, box(1.84, 0.08, 1.88, paint), 0, 1.17, -0.2);

    // Long hood (Camry has very long hood)
    add(g, box(1.9, 0.05, 1.35, paint), 0, 0.66, 1.65);

    // Windshield (swept)
    add(g, box(1.82, 0.47, 0.07, blackMat, -0.52, 0, 0), 0, 0.94, 0.9);
    add(g, box(1.72, 0.44, 0.04, glassMat, -0.52, 0, 0), 0, 0.94, 0.88);
    // Rear window (fastback slope)
    add(g, box(1.82, 0.4, 0.07, blackMat, 0.48, 0, 0), 0, 0.92, -1.18);
    add(g, box(1.72, 0.37, 0.04, glassMat, 0.48, 0, 0), 0, 0.92, -1.16);
    [-1.01, 1.01].forEach(x => add(g, box(0.04, 0.28, 0.78, glassMat), x, 0.96, -0.5));

    // Side mirrors (slim)
    [-1.04, 1.04].forEach(x => add(g, box(0.05, 0.08, 0.14, blackMat), x, 0.88, 0.78));

    // === FRONT FACE — CAMRY SIGNATURE ===
    // Ultra-wide chrome grille surround (Camry's most distinctive feature)
    add(g, box(2.0, 0.06, 0.1, chrome), 0, 0.56, 2.22); // top chrome bar
    add(g, box(2.0, 0.04, 0.09, chrome), 0, 0.35, 2.22); // bottom chrome bar
    // Vertical side pillars of grille
    [-0.97, 0.97].forEach(x => add(g, box(0.06, 0.22, 0.09, chrome), x, 0.455, 2.22));
    // Grille mesh (dark, large opening)
    add(g, box(1.88, 0.2, 0.1, new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:0.9})), 0, 0.455, 2.23);
    // Diamond mesh bars
    for (let i=0; i<4; i++) add(g, box(1.86, 0.02, 0.07, new THREE.MeshStandardMaterial({color:0x333,metalness:0.4})), 0, 0.38+i*0.055, 2.24);
    // Toyota emblem position (chrome T badge)
    add(g, box(0.14, 0.08, 0.06, chrome), 0, 0.455, 2.25);

    // Lower bumper
    add(g, box(2.0, 0.2, 0.12, paint), 0, 0.22, 2.2);
    add(g, box(1.78, 0.14, 0.1, blackMat), 0, 0.22, 2.22);
    add(g, box(2.0, 0.09, 0.1, blackMat), 0, 0.13, 2.2);

    // SWEPT HEADLIGHTS (run into the fender lines)
    const hlMat = makeLightMat(0xeeeeff, 0xffffff);
    [-0.72, 0.72].forEach(x => {
      // Main headlight (angular, swept)
      add(g, box(0.44, 0.1, 0.07, hlMat), x, 0.6, 2.2);
      // DRL that sweeps into hood
      const dr = box(0.16, 0.04, 0.06, hlMat, 0, 0, x < 0 ? 0.3 : -0.3);
      dr.position.set(x < 0 ? x-0.18 : x+0.18, 0.62, 2.14);
      g.add(dr);
      // Arrow DRL
      add(g, box(0.38, 0.03, 0.06, hlMat), x, 0.52, 2.2);
    });
    const hlMats = [hlMat];

    // === REAR ===
    add(g, box(2.0, 0.2, 0.12, paint), 0, 0.26, -2.28);
    add(g, box(1.0, 0.08, 0.1, chrome), 0, 0.25, -2.28);
    // Boot lid
    add(g, box(1.9, 0.09, 0.75, paint), 0, 0.73, -1.62);
    const tlMat = makeLightMat(0xff1100, 0xff1100);
    [-0.7, 0.7].forEach(x => {
      add(g, box(0.44, 0.12, 0.07, tlMat), x, 0.57, -2.26);
      add(g, box(0.4, 0.03, 0.06, tlMat), x, 0.49, -2.26);
    });
    add(g, box(1.9, 0.02, 0.05, tlMat), 0, 0.52, -2.26);
    // Dual exhausts (hidden in bumper)
    [-0.38, 0.38].forEach(x => {
      const ex = cyl(0.04, 0.04, 0.08, 12, chrome);
      ex.rotation.x = Math.PI/2; ex.position.set(x, 0.19, -2.32); g.add(ex);
    });

    const doorFL = makeDoor(g, -1.02, 0.67, 0.9, 0.88, 0.44, 0.07, 0.27, paint, chrome);
    const doorFR = makeDoor(g,  1.02, 0.67, 0.9, 0.88, 0.44, 0.07, 0.27, paint, chrome);
    const doorRL = makeDoor(g, -1.02, 0.67, -0.02, 0.82, 0.43, 0.07, 0.26, paint, chrome);
    const doorRR = makeDoor(g,  1.02, 0.67, -0.02, 0.82, 0.43, 0.07, 0.26, paint, chrome);
    const bonnetPivot = makeBonnet(g, 0.98, 0.65, 1.38, 1.88, paint);
    const trunkPivot  = makeTrunk(g, -1.24, 0.72, 0.76, 1.88, paint);

    const wPos = [[-0.98,0.37,1.44],[0.98,0.37,1.44],[-0.98,0.37,-1.44],[0.98,0.37,-1.44]];
    const wheels = addWheels(g, wPos, 1.0, rimStyle);
    wPos.forEach(([x,y,z]) => addArch(g, x*0.99, y+0.22, z, 0.18, 0.15, 0.68));

    g.userData = {
      state: { doorFL:false,doorFR:false,doorRL:false,doorRR:false,bonnet:false,trunk:false,lights:false },
      parts: { doorFL,doorFR,doorRL,doorRR,bonnetPivot,trunkPivot,hlMats,wheels,tlMat },
      paintMeshes: collectPaintMeshes(g, paint), paintMat: paint
    };
    return g;
  }

  /* ════════════════════════════════════════════
     4. TOYOTA FORTUNER LEGENDER
     Signature: Chrome oval grille, stacked
     headlights (2-tier), chrome running boards
  ════════════════════════════════════════════ */
  function buildToyotaFortuner(color, rimStyle) {
    const g = new THREE.Group();
    const paint = makePaintMat(color);
    const chrome = makeChromeMat();

    // Tall boxy body
    add(g, box(2.08, 0.66, 4.6, paint), 0, 0.53, 0);
    add(g, box(2.16, 0.26, 4.52, blackMat), 0, 0.24, 0);
    // Chrome running boards
    [-1.1, 1.1].forEach(x => {
      add(g, box(0.16, 0.05, 3.1, chrome), x, 0.22, 0);
      add(g, box(0.06, 0.14, 3.9, blackMat), x, 0.28, 0);
    });

    // Cabin (upright, boxy)
    add(g, box(2.02, 0.7, 3.1, paint), 0, 1.2, -0.15);
    add(g, box(1.98, 0.09, 2.92, paint), 0, 1.56, -0.15);
    [-0.86, 0.86].forEach(x => add(g, box(0.04, 0.04, 2.55, blackMat), x, 1.62, -0.18));

    // Hood (blunt, flat)
    add(g, box(2.02, 0.09, 1.12, paint), 0, 0.9, 1.65);

    // Windshield (upright Fortuner)
    add(g, box(1.96, 0.61, 0.08, blackMat, -0.42, 0, 0), 0, 1.19, 1.04);
    add(g, box(1.86, 0.57, 0.04, glassMat, -0.42, 0, 0), 0, 1.19, 1.02);
    add(g, box(1.96, 0.53, 0.08, blackMat, 0.36, 0, 0), 0, 1.21, -1.55);
    add(g, box(1.86, 0.49, 0.04, glassMat, 0.36, 0, 0), 0, 1.21, -1.53);
    [-1.06, 1.06].forEach(x => {
      add(g, box(0.04, 0.39, 0.9, glassMat), x, 1.17, 0.46);
      add(g, box(0.04, 0.36, 0.78, glassMat), x, 1.16, -0.56);
    });
    [-1.06, 1.06].forEach(x => add(g, box(0.07, 0.1, 0.16, paint), x, 1.14, 1.04));

    // === FRONT FACE — FORTUNER SIGNATURE ===
    // Big chrome oval grille surround
    add(g, box(1.7, 0.38, 0.1, chrome), 0, 0.64, 2.34);  // chrome frame
    add(g, box(1.6, 0.3, 0.11, new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:0.8})), 0, 0.64, 2.36);
    // Horizontal chrome slats inside grille
    for (let i=0; i<4; i++) add(g, box(1.58, 0.04, 0.08, chrome), 0, 0.52+i*0.07, 2.37);
    // Toyota T emblem (center chrome block)
    add(g, box(0.18, 0.09, 0.07, chrome), 0, 0.66, 2.38);

    // STACKED HEADLIGHTS (Fortuner signature: 2 tiers per side)
    const hlMat = makeLightMat(0xeeeeff, 0xffffff);
    [-0.82, 0.82].forEach(x => {
      // Upper headlight (main, narrow strip)
      add(g, box(0.26, 0.07, 0.07, hlMat), x, 0.82, 2.33);
      // Lower headlight (fog/DRL, wider)
      add(g, box(0.3, 0.1, 0.08, hlMat), x, 0.65, 2.34);
      // Connecting chrome piece
      add(g, box(0.28, 0.06, 0.07, chrome), x, 0.745, 2.33);
    });
    const hlMats = [hlMat];

    // Lower bumper
    add(g, box(2.1, 0.28, 0.16, blackMat), 0, 0.34, 2.32);
    add(g, box(1.8, 0.1, 0.14, chrome), 0, 0.21, 2.33);  // skid plate

    // === REAR ===
    add(g, box(2.1, 0.24, 0.14, blackMat), 0, 0.28, -2.36);
    add(g, box(1.8, 0.1, 0.12, chrome), 0, 0.2, -2.37);  // rear step
    add(g, box(2.08, 0.68, 0.12, paint), 0, 0.84, -2.36);
    const tlMat = makeLightMat(0xff1100, 0xff1100);
    [-0.74, 0.74].forEach(x => {
      add(g, box(0.32, 0.14, 0.07, tlMat), x, 0.86, -2.36);
      add(g, box(0.26, 0.07, 0.07, tlMat), x, 0.72, -2.36);
    });
    // Spare on rear not for fortuner (hatch)
    add(g, box(1.98, 0.68, 0.1, paint), 0, 0.88, -2.35);
    [-0.36, 0.36].forEach(x => {
      const ex = cyl(0.045, 0.045, 0.09, 12, chrome);
      ex.rotation.x = Math.PI/2; ex.position.set(x, 0.22, -2.42); g.add(ex);
    });

    const doorFL = makeDoor(g, -1.06, 0.84, 0.98, 0.96, 0.57, 0.07, 0.35, paint, chrome);
    const doorFR = makeDoor(g,  1.06, 0.84, 0.98, 0.96, 0.57, 0.07, 0.35, paint, chrome);
    const doorRL = makeDoor(g, -1.06, 0.84, -0.02, 0.9, 0.55, 0.07, 0.34, paint, chrome);
    const doorRR = makeDoor(g,  1.06, 0.84, -0.02, 0.9, 0.55, 0.07, 0.34, paint, chrome);
    const bonnetPivot = makeBonnet(g, 1.12, 0.9, 1.14, 2.0, paint);
    const trunkPivot  = makeTrunk(g, -1.6, 0.94, 0.6, 1.96, paint);

    const wPos = [[-1.02,0.46,1.46],[1.02,0.46,1.46],[-1.02,0.46,-1.46],[1.02,0.46,-1.46]];
    const wheels = addWheels(g, wPos, 1.16, rimStyle);
    wPos.forEach(([x,y,z]) => addArch(g, x*0.99, y+0.28, z, 0.2, 0.18, 0.74));

    g.userData = {
      state: { doorFL:false,doorFR:false,doorRL:false,doorRR:false,bonnet:false,trunk:false,lights:false },
      parts: { doorFL,doorFR,doorRL,doorRR,bonnetPivot,trunkPivot,hlMats,wheels,tlMat },
      paintMeshes: collectPaintMeshes(g, paint), paintMat: paint
    };
    return g;
  }

  /* ════════════════════════════════════════════
     5. TATA NEXON EV MAX
     Signature: Full-width thin DRL at hood edge,
     separate main lights below, coupe-SUV roofline
  ════════════════════════════════════════════ */
  function buildTataNexonEV(color, rimStyle) {
    const g = new THREE.Group();
    const paint = makePaintMat(color);
    const chrome = makeChromeMat();
    const evBlue = new THREE.MeshStandardMaterial({ color: 0x0066cc, metalness: 0.6, roughness: 0.3 });

    add(g, box(1.86, 0.62, 3.9, paint), 0, 0.5, 0);
    add(g, box(1.92, 0.22, 3.82, blackMat), 0, 0.24, 0);
    [-0.96, 0.96].forEach(x => add(g, box(0.06, 0.12, 3.5, blackMat), x, 0.27, 0));

    // Coupe-SUV cabin (sweeping roof)
    add(g, box(1.8, 0.64, 2.7, paint), 0, 1.13, -0.2);
    add(g, box(1.76, 0.08, 2.35, paint), 0, 1.46, -0.28);

    // Hood (shorter, SUV)
    add(g, box(1.78, 0.07, 0.86, paint), 0, 0.84, 1.56);

    // Windshield
    add(g, box(1.74, 0.58, 0.07, blackMat, -0.46, 0, 0), 0, 1.12, 0.96);
    add(g, box(1.64, 0.54, 0.04, glassMat, -0.46, 0, 0), 0, 1.12, 0.94);
    // Rear glass (sweep)
    add(g, box(1.74, 0.48, 0.07, blackMat, 0.42, 0, 0), 0, 1.13, -1.4);
    add(g, box(1.64, 0.45, 0.04, glassMat, 0.42, 0, 0), 0, 1.13, -1.38);
    [-0.94, 0.94].forEach(x => {
      add(g, box(0.04, 0.38, 0.9, glassMat), x, 1.1, 0.42);
      add(g, box(0.04, 0.32, 0.7, glassMat), x, 1.08, -0.56);
    });
    [-0.97, 0.97].forEach(x => add(g, box(0.06, 0.09, 0.14, blackMat), x, 1.05, 0.96));

    // Charging port (right side)
    add(g, box(0.05, 0.08, 0.12, blackMat), 0.95, 0.88, 1.3);
    add(g, box(0.04, 0.06, 0.1, evBlue), 0.95, 0.88, 1.31);

    // === FRONT — NEXON EV SIGNATURE ===
    // FULL-WIDTH THIN DRL STRIP (most iconic Nexon feature)
    const hlMat = makeLightMat(0xeeeeff, 0xffffff);
    const drlStrip = box(1.78, 0.04, 0.07, hlMat);  // ultra-thin full-width DRL
    drlStrip.position.set(0, 0.87, 1.96);
    g.add(drlStrip);

    // EV blue accent connecting strip
    const blueStrip = box(1.78, 0.025, 0.06, evBlue);
    blueStrip.position.set(0, 0.845, 1.96);
    g.add(blueStrip);

    // Main headlight clusters (below DRL, separate)
    [-0.68, 0.68].forEach(x => {
      add(g, box(0.36, 0.12, 0.08, hlMat), x, 0.72, 1.96);  // main beam
      add(g, box(0.34, 0.04, 0.06, hlMat), x, 0.62, 1.96);  // lower DRL
    });
    const hlMats = [hlMat];

    // Closed/clean grille (EV - no big grille needed)
    add(g, box(1.3, 0.24, 0.09, new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:0.8})), 0, 0.62, 1.95);
    add(g, box(1.32, 0.02, 0.08, evBlue), 0, 0.505, 1.95);  // blue bottom trim
    // Lower bumper
    add(g, box(1.88, 0.22, 0.13, blackMat), 0, 0.3, 1.93);
    add(g, box(1.6, 0.14, 0.1, new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:0.8})), 0, 0.3, 1.95);

    // === REAR ===
    const tlMat = makeLightMat(0xff1100, 0xff1100);
    // Full-width tail strip (Nexon style)
    add(g, box(1.78, 0.04, 0.06, tlMat), 0, 0.88, -1.98);
    [-0.62, 0.62].forEach(x => add(g, box(0.38, 0.12, 0.07, tlMat), x, 0.72, -1.97));
    add(g, box(1.86, 0.62, 0.1, paint), 0, 0.72, -1.96);
    add(g, box(1.88, 0.22, 0.12, blackMat), 0, 0.28, -1.95);
    add(g, box(0.16, 0.06, 0.06, evBlue), 0, 0.3, -1.97); // EV badge
    const ex = cyl(0.04, 0.04, 0.08, 12, blackMat);
    ex.rotation.x = Math.PI/2; ex.position.set(0, 0.2, -2.01); g.add(ex);

    const doorFL = makeDoor(g, -0.95, 0.8, 0.88, 0.9, 0.52, 0.07, 0.32, paint, chrome);
    const doorFR = makeDoor(g,  0.95, 0.8, 0.88, 0.9, 0.52, 0.07, 0.32, paint, chrome);
    const doorRL = makeDoor(g, -0.95, 0.8, -0.04, 0.84, 0.5, 0.07, 0.31, paint, chrome);
    const doorRR = makeDoor(g,  0.95, 0.8, -0.04, 0.84, 0.5, 0.07, 0.31, paint, chrome);
    const bonnetPivot = makeBonnet(g, 1.0, 0.84, 0.88, 1.76, paint);
    const trunkPivot  = makeTrunk(g, -1.44, 0.94, 0.5, 1.74, paint);

    const wPos = [[-0.94,0.42,1.26],[0.94,0.42,1.26],[-0.94,0.42,-1.26],[0.94,0.42,-1.26]];
    const wheels = addWheels(g, wPos, 1.08, rimStyle);
    wPos.forEach(([x,y,z]) => addArch(g, x*0.99, y+0.24, z, 0.18, 0.17, 0.7));

    g.userData = {
      state: { doorFL:false,doorFR:false,doorRL:false,doorRR:false,bonnet:false,trunk:false,lights:false },
      parts: { doorFL,doorFR,doorRL,doorRR,bonnetPivot,trunkPivot,hlMats,wheels,tlMat },
      paintMeshes: collectPaintMeshes(g, paint), paintMat: paint
    };
    return g;
  }

  /* ════════════════════════════════════════════
     6. TATA HARRIER DARK
     Signature: Split headlights, FLOATING ROOF
     (black D-pillar), very wide planted stance
  ════════════════════════════════════════════ */
  function buildTataHarrier(color, rimStyle) {
    const g = new THREE.Group();
    const paint = makePaintMat(color);
    const chrome = makeChromeMat();

    // Wide lower body
    add(g, box(2.1, 0.66, 4.6, paint), 0, 0.52, 0);
    add(g, box(2.17, 0.24, 4.52, blackMat), 0, 0.24, 0);
    [-1.09, 1.09].forEach(x => add(g, box(0.06, 0.13, 3.9, blackMat), x, 0.28, 0));

    // Cabin with FLOATING ROOF (black D-pillar makes roof appear to float)
    add(g, box(2.04, 0.68, 3.05, paint), 0, 1.19, -0.14);
    // Black D-pillar (floating roof signature)
    [-1.03, 1.03].forEach(x => add(g, box(0.04, 0.66, 0.5, blackMat), x, 1.19, -1.2));
    // Roof (slightly contrasting)
    add(g, box(1.98, 0.09, 2.88, blackMat), 0, 1.54, -0.14);
    // Panoramic glass roof
    add(g, box(1.7, 0.06, 1.8, new THREE.MeshStandardMaterial({color:0x112233,transparent:true,opacity:0.6})), 0, 1.57, 0);
    [-0.84, 0.84].forEach(x => add(g, box(0.04, 0.04, 2.5, blackMat), x, 1.6, -0.16));

    // Hood (wide, Harrier shoulder line)
    add(g, box(2.04, 0.09, 1.08, paint), 0, 0.9, 1.66);
    // Strong shoulder crease
    [-0.78, 0.78].forEach(x => add(g, box(0.05, 0.08, 4.0, paint), x, 0.78, 0));

    // Windshield
    add(g, box(1.98, 0.6, 0.08, blackMat, -0.44, 0, 0), 0, 1.18, 1.05);
    add(g, box(1.88, 0.56, 0.04, glassMat, -0.44, 0, 0), 0, 1.18, 1.03);
    add(g, box(1.98, 0.52, 0.08, blackMat, 0.38, 0, 0), 0, 1.2, -1.53);
    add(g, box(1.88, 0.48, 0.04, glassMat, 0.38, 0, 0), 0, 1.2, -1.51);
    [-1.07, 1.07].forEach(x => {
      add(g, box(0.04, 0.39, 0.9, glassMat), x, 1.16, 0.47);
      add(g, box(0.04, 0.36, 0.78, glassMat), x, 1.15, -0.56);
    });
    [-1.07, 1.07].forEach(x => add(g, box(0.07, 0.1, 0.16, blackMat), x, 1.12, 1.04));

    // === FRONT — HARRIER SPLIT HEADLIGHTS ===
    const hlMat = makeLightMat(0xeeeeff, 0xffffff);
    // Upper DRL strips (thin, at hood level, wide)
    [-0.6, 0.6].forEach(x => {
      add(g, box(0.54, 0.04, 0.07, hlMat), x, 0.93, 2.34);  // thin DRL strip
    });
    // Dark gap between DRL and main light
    [-0.6, 0.6].forEach(x => add(g, box(0.56, 0.03, 0.07, blackMat), x, 0.88, 2.34));
    // Main headlight clusters (below gap)
    [-0.68, 0.68].forEach(x => {
      add(g, box(0.42, 0.14, 0.09, hlMat), x, 0.72, 2.34);
      add(g, box(0.38, 0.04, 0.07, hlMat), x, 0.62, 2.34);  // lower DRL
    });
    const hlMats = [hlMat];

    // Harrier grille (tri-arrow pattern)
    add(g, box(1.7, 0.28, 0.11, new THREE.MeshStandardMaterial({color:0x080808,roughness:0.9})), 0, 0.62, 2.33);
    // Horizontal chrome bar across grille
    add(g, box(1.72, 0.04, 0.1, chrome), 0, 0.62, 2.32);
    // Tri-arrow pattern bars
    for (let i=0; i<4; i++) {
      add(g, box(1.68, 0.025, 0.08, blackMat), 0, 0.52+i*0.07, 2.34);
    }
    add(g, box(2.1, 0.28, 0.14, blackMat), 0, 0.36, 2.32);
    add(g, box(1.88, 0.1, 0.12, chrome), 0, 0.21, 2.33);

    // === REAR ===
    const tlMat = makeLightMat(0xff1100, 0xff1100);
    add(g, box(2.08, 0.66, 0.12, paint), 0, 0.84, -2.36);
    add(g, box(2.1, 0.28, 0.14, blackMat), 0, 0.28, -2.36);
    // Split taillights (matching front style)
    [-0.68, 0.68].forEach(x => {
      add(g, box(0.46, 0.14, 0.07, tlMat), x, 0.78, -2.36);
      add(g, box(0.5, 0.03, 0.06, tlMat), x, 0.92, -2.36); // upper tail strip
    });
    add(g, box(1.9, 0.03, 0.05, tlMat), 0, 0.62, -2.36);
    add(g, box(1.88, 0.1, 0.12, chrome), 0, 0.21, -2.37);
    [-0.38, 0.38].forEach(x => {
      const ex = cyl(0.045, 0.045, 0.09, 12, chrome);
      ex.rotation.x = Math.PI/2; ex.position.set(x, 0.22, -2.43); g.add(ex);
    });

    const doorFL = makeDoor(g, -1.07, 0.84, 0.98, 0.94, 0.56, 0.07, 0.35, paint, chrome);
    const doorFR = makeDoor(g,  1.07, 0.84, 0.98, 0.94, 0.56, 0.07, 0.35, paint, chrome);
    const doorRL = makeDoor(g, -1.07, 0.84, -0.0, 0.88, 0.54, 0.07, 0.34, paint, chrome);
    const doorRR = makeDoor(g,  1.07, 0.84, -0.0, 0.88, 0.54, 0.07, 0.34, paint, chrome);
    const bonnetPivot = makeBonnet(g, 1.12, 0.9, 1.1, 2.02, paint);
    const trunkPivot  = makeTrunk(g, -1.6, 0.94, 0.6, 2.0, paint);

    const wPos = [[-1.04,0.45,1.46],[1.04,0.45,1.46],[-1.04,0.45,-1.46],[1.04,0.45,-1.46]];
    const wheels = addWheels(g, wPos, 1.14, rimStyle);
    wPos.forEach(([x,y,z]) => addArch(g, x*0.99, y+0.26, z, 0.2, 0.18, 0.76));

    g.userData = {
      state: { doorFL:false,doorFR:false,doorRL:false,doorRR:false,bonnet:false,trunk:false,lights:false },
      parts: { doorFL,doorFR,doorRL,doorRR,bonnetPivot,trunkPivot,hlMats,wheels,tlMat },
      paintMeshes: collectPaintMeshes(g, paint), paintMat: paint
    };
    return g;
  }

  /* ════════════════════════════════════════════
     7. MAHINDRA XUV700 AX7
     Signature: X-shaped DRL connecting headlights,
     three-element headlight cluster, bold nose
  ════════════════════════════════════════════ */
  function buildMahindraXUV700(color, rimStyle) {
    const g = new THREE.Group();
    const paint = makePaintMat(color);
    const chrome = makeChromeMat();

    add(g, box(2.08, 0.68, 4.7, paint), 0, 0.53, 0);
    add(g, box(2.16, 0.24, 4.62, blackMat), 0, 0.24, 0);
    [-1.09, 1.09].forEach(x => add(g, box(0.06, 0.13, 3.9, blackMat), x, 0.28, 0));

    add(g, box(2.02, 0.72, 3.12, paint), 0, 1.22, -0.14);
    add(g, box(1.98, 0.09, 2.95, paint), 0, 1.59, -0.14);
    [-0.86, 0.86].forEach(x => add(g, box(0.04, 0.04, 2.6, blackMat), x, 1.65, -0.17));

    add(g, box(2.04, 0.09, 1.1, paint), 0, 0.92, 1.67);

    add(g, box(1.98, 0.62, 0.08, blackMat, -0.44, 0, 0), 0, 1.2, 1.06);
    add(g, box(1.88, 0.58, 0.04, glassMat, -0.44, 0, 0), 0, 1.2, 1.04);
    add(g, box(1.98, 0.54, 0.08, blackMat, 0.37, 0, 0), 0, 1.22, -1.56);
    add(g, box(1.88, 0.5, 0.04, glassMat, 0.37, 0, 0), 0, 1.22, -1.54);
    [-1.06, 1.06].forEach(x => {
      add(g, box(0.04, 0.4, 0.92, glassMat), x, 1.18, 0.47);
      add(g, box(0.04, 0.37, 0.8, glassMat), x, 1.17, -0.57);
    });
    [-1.07, 1.07].forEach(x => add(g, box(0.07, 0.1, 0.16, paint), x, 1.14, 1.05));

    // === FRONT — XUV700 SIGNATURE ===
    // X-SHAPED DRL connecting inner headlight points
    const hlMat = makeLightMat(0xeeeeff, 0xffffff);
    // X-shape: two diagonal bars crossing center
    const xDRL1 = box(1.0, 0.04, 0.07, hlMat, 0, 0, 0.36);  // diagonal /
    xDRL1.position.set(0, 0.82, 2.36); g.add(xDRL1);
    const xDRL2 = box(1.0, 0.04, 0.07, hlMat, 0, 0, -0.36); // diagonal \
    xDRL2.position.set(0, 0.82, 2.36); g.add(xDRL2);
    // Headlight clusters (three-element per side)
    [-0.76, 0.76].forEach(x => {
      add(g, box(0.28, 0.12, 0.09, hlMat), x, 0.88, 2.35);  // upper pod
      add(g, box(0.28, 0.1,  0.09, hlMat), x, 0.74, 2.35);  // middle pod
      add(g, box(0.28, 0.08, 0.09, hlMat), x, 0.62, 2.35);  // lower pod
      add(g, box(0.04, 0.36, 0.07, chrome), x < 0 ? x+0.13 : x-0.13, 0.75, 2.35); // inner separator
    });
    const hlMats = [hlMat];

    // Bold chrome grille bar (XUV700 signature horizontal bar)
    add(g, box(1.8, 0.08, 0.1, chrome), 0, 0.6, 2.34);
    // Dark grille area
    add(g, box(1.7, 0.28, 0.11, new THREE.MeshStandardMaterial({color:0x080808,roughness:0.9})), 0, 0.5, 2.35);
    for (let i=0; i<3; i++) add(g, box(1.68, 0.025, 0.08, new THREE.MeshStandardMaterial({color:0x333,metalness:0.4})), 0, 0.41+i*0.09, 2.36);
    add(g, box(2.1, 0.28, 0.14, blackMat), 0, 0.35, 2.33);
    // Large air intake
    add(g, box(1.3, 0.18, 0.12, new THREE.MeshStandardMaterial({color:0x060606})), 0, 0.35, 2.35);
    add(g, box(1.84, 0.1, 0.12, chrome), 0, 0.2, 2.33);  // front skid

    // === REAR ===
    const tlMat = makeLightMat(0xff1100, 0xff1100);
    add(g, box(2.08, 0.7, 0.12, paint), 0, 0.86, -2.4);
    add(g, box(2.1, 0.28, 0.14, blackMat), 0, 0.28, -2.4);
    [-0.72, 0.72].forEach(x => {
      add(g, box(0.3, 0.24, 0.07, tlMat), x, 0.82, -2.39);
      add(g, box(0.26, 0.08, 0.06, tlMat), x, 0.62, -2.39);
    });
    add(g, box(1.78, 0.03, 0.05, tlMat), 0, 0.7, -2.39);
    add(g, box(1.84, 0.1, 0.12, chrome), 0, 0.2, -2.41);
    [-0.4, 0.4].forEach(x => {
      const ex = cyl(0.045, 0.045, 0.09, 12, chrome);
      ex.rotation.x = Math.PI/2; ex.position.set(x, 0.22, -2.46); g.add(ex);
    });

    const doorFL = makeDoor(g, -1.07, 0.86, 1.0, 0.96, 0.58, 0.07, 0.36, paint, chrome);
    const doorFR = makeDoor(g,  1.07, 0.86, 1.0, 0.96, 0.58, 0.07, 0.36, paint, chrome);
    const doorRL = makeDoor(g, -1.07, 0.86, -0.0, 0.9, 0.56, 0.07, 0.35, paint, chrome);
    const doorRR = makeDoor(g,  1.07, 0.86, -0.0, 0.9, 0.56, 0.07, 0.35, paint, chrome);
    const bonnetPivot = makeBonnet(g, 1.14, 0.92, 1.12, 2.02, paint);
    const trunkPivot  = makeTrunk(g, -1.63, 0.96, 0.62, 2.0, paint);

    const wPos = [[-1.04,0.46,1.48],[1.04,0.46,1.48],[-1.04,0.46,-1.48],[1.04,0.46,-1.48]];
    const wheels = addWheels(g, wPos, 1.15, rimStyle);
    wPos.forEach(([x,y,z]) => addArch(g, x*0.99, y+0.27, z, 0.2, 0.18, 0.76));

    g.userData = {
      state: { doorFL:false,doorFR:false,doorRL:false,doorRR:false,bonnet:false,trunk:false,lights:false },
      parts: { doorFL,doorFR,doorRL,doorRR,bonnetPivot,trunkPivot,hlMats,wheels,tlMat },
      paintMeshes: collectPaintMeshes(g, paint), paintMat: paint
    };
    return g;
  }

  /* ════════════════════════════════════════════
     8. MAHINDRA THAR ROXX
     Signature: ROUND HEADLIGHTS in chrome bezels,
     7-slot vertical grille, completely boxy,
     snorkel, spare wheel on rear door
  ════════════════════════════════════════════ */
  function buildMahindraThar(color, rimStyle) {
    const g = new THREE.Group();
    const paint = makePaintMat(color);
    const chrome = makeChromeMat();

    // Completely BOXY body
    add(g, box(2.0, 0.62, 4.05, paint), 0, 0.59, 0);
    // No cladding on Thar - painted body sides
    add(g, box(2.06, 0.3, 3.98, blackMat), 0, 0.26, 0);

    // BOXY upright cabin
    add(g, box(1.94, 0.72, 2.6, paint), 0, 1.26, 0.02);
    // Flat roof
    add(g, box(1.9, 0.07, 2.56, paint), 0, 1.63, 0.02);

    // Flat, short hood (Thar boxy front)
    add(g, box(1.96, 0.09, 0.76, paint), 0, 0.95, 1.68);

    // Upright windshield
    add(g, box(1.88, 0.64, 0.08, blackMat, -0.28, 0, 0), 0, 1.26, 1.12);
    add(g, box(1.78, 0.6, 0.04, glassMat, -0.28, 0, 0), 0, 1.26, 1.10);
    // Rear glass (flat, upright)
    add(g, box(1.88, 0.62, 0.08, blackMat, 0.24, 0, 0), 0, 1.26, -1.3);
    add(g, box(1.78, 0.58, 0.04, glassMat, 0.24, 0, 0), 0, 1.26, -1.28);
    [-0.98, 0.98].forEach(x => {
      add(g, box(0.04, 0.44, 0.88, glassMat), x, 1.22, 0.44);
      add(g, box(0.04, 0.42, 0.7, glassMat), x, 1.2, -0.56);
    });
    // Thar fold-flat wipers attachment
    [-0.98, 0.98].forEach(x => add(g, box(0.06, 0.1, 0.14, blackMat), x, 1.0, 1.1));

    // SNORKEL (right side A-pillar — Thar signature)
    const snorkel = box(0.06, 0.52, 0.06, blackMat);
    snorkel.position.set(0.97, 1.28, 1.06); g.add(snorkel);
    const snorkelElbow = box(0.07, 0.07, 0.12, blackMat);
    snorkelElbow.position.set(0.97, 1.54, 1.12); g.add(snorkelElbow);

    // Side steps (tube style)
    [-1.03, 1.03].forEach(x => {
      add(g, box(0.12, 0.06, 3.2, blackMat), x, 0.24, 0);
      // Tube bracket details
      for (let z=-1; z<=1; z++) add(g, box(0.08, 0.12, 0.06, blackMat), x, 0.24, z*1.0);
    });

    // === FRONT — THAR SIGNATURE ===
    // ROUND HEADLIGHTS in chrome bezels (most iconic)
    const hlMat = makeLightMat(0xeeeeff, 0xffffff);
    [-0.64, 0.64].forEach(x => {
      // Chrome bezel (cylinder used as ring)
      const bezel = cyl(0.19, 0.19, 0.08, 24, chrome);
      bezel.rotation.x = Math.PI/2; bezel.position.set(x, 0.84, 2.04); g.add(bezel);
      // Inner black ring
      const inner = cyl(0.16, 0.16, 0.07, 24, blackMat);
      inner.rotation.x = Math.PI/2; inner.position.set(x, 0.84, 2.05); g.add(inner);
      // ROUND HEADLIGHT (white disc)
      const hl = cyl(0.14, 0.14, 0.06, 24, hlMat);
      hl.rotation.x = Math.PI/2; hl.position.set(x, 0.84, 2.07); g.add(hl);
    });
    const hlMats = [hlMat];

    // 7-SLOT VERTICAL GRILLE (Thar/Jeep signature)
    add(g, box(0.72, 0.34, 0.1, chrome), 0, 0.72, 2.04); // chrome frame
    add(g, box(0.68, 0.3, 0.11, new THREE.MeshStandardMaterial({color:0x080808,roughness:0.9})), 0, 0.72, 2.05);
    // 7 vertical slots
    for (let i=0; i<7; i++) {
      const slot = box(0.05, 0.26, 0.08, blackMat);
      slot.position.set(-0.27 + i*0.09, 0.72, 2.07); g.add(slot);
    }
    // 6 divider bars between slots
    for (let i=0; i<6; i++) {
      const div = box(0.025, 0.28, 0.07, chrome);
      div.position.set(-0.225 + i*0.09, 0.72, 2.08); g.add(div);
    }

    // Tube front bumper
    const fBump = cyl(0.06, 0.06, 1.9, 12, blackMat);
    fBump.rotation.z = Math.PI/2; fBump.position.set(0, 0.42, 2.06); g.add(fBump);
    add(g, box(1.92, 0.08, 0.1, blackMat), 0, 0.38, 2.04);
    // Tow hook (front)
    const hook = box(0.08, 0.12, 0.14, blackMat);
    hook.position.set(0, 0.32, 2.08); g.add(hook);

    // Headlight connecting panel
    add(g, box(2.02, 0.5, 0.1, paint), 0, 0.84, 2.03);
    add(g, box(1.96, 0.12, 0.09, paint), 0, 1.02, 2.03);

    // === REAR — SPARE WHEEL ON DOOR ===
    add(g, box(1.96, 0.72, 0.14, paint), 0, 0.86, -2.08);
    // Rear door with spare wheel (Thar signature)
    const spareGroup = new THREE.Group();
    // Spare tire
    const spareTire = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.12, 14, 28), tireMat);
    spareTire.position.set(0, 0.86, -2.16); g.add(spareTire);
    // Spare rim
    const spareRim = cyl(0.26, 0.26, 0.07, 24, makeRimMat(rimStyle));
    spareRim.rotation.x = Math.PI/2; spareRim.position.set(0, 0.86, -2.17); g.add(spareRim);
    // Spare carrier
    add(g, box(0.84, 0.84, 0.08, blackMat), 0, 0.86, -2.13);

    add(g, box(1.96, 0.28, 0.14, blackMat), 0, 0.28, -2.07);
    // Rear tube bumper
    const rBump = cyl(0.06, 0.06, 1.9, 12, blackMat);
    rBump.rotation.z = Math.PI/2; rBump.position.set(0, 0.36, -2.1); g.add(rBump);

    const tlMat = makeLightMat(0xff1100, 0xff1100);
    [-0.74, 0.74].forEach(x => add(g, box(0.3, 0.22, 0.07, tlMat), x, 0.78, -2.09));
    add(g, box(1.5, 0.04, 0.05, tlMat), 0, 0.62, -2.09);

    // Only front doors on Thar 4-door (no traditional rear doors, use makeDoor)
    const doorFL = makeDoor(g, -1.01, 0.96, 1.0, 0.88, 0.58, 0.07, 0.36, paint, chrome);
    const doorFR = makeDoor(g,  1.01, 0.96, 1.0, 0.88, 0.58, 0.07, 0.36, paint, chrome);
    const doorRL = makeDoor(g, -1.01, 0.96, 0.08, 0.82, 0.56, 0.07, 0.35, paint, chrome);
    const doorRR = makeDoor(g,  1.01, 0.96, 0.08, 0.82, 0.56, 0.07, 0.35, paint, chrome);
    const bonnetPivot = makeBonnet(g, 1.06, 0.94, 0.78, 1.94, paint);
    const trunkPivot  = makeTrunk(g, -1.32, 1.56, 0.36, 1.88, paint); // soft top concept

    // BIG off-road wheels
    const wPos = [[-1.0,0.52,1.3],[1.0,0.52,1.3],[-1.0,0.52,-1.3],[1.0,0.52,-1.3]];
    const wheels = addWheels(g, wPos, 1.36, rimStyle);
    wPos.forEach(([x,y,z]) => addArch(g, x*0.99, y+0.32, z, 0.22, 0.2, 0.78));

    g.userData = {
      state: { doorFL:false,doorFR:false,doorRL:false,doorRR:false,bonnet:false,trunk:false,lights:false },
      parts: { doorFL,doorFR,doorRL,doorRR,bonnetPivot,trunkPivot,hlMats,wheels,tlMat },
      paintMeshes: collectPaintMeshes(g, paint), paintMat: paint
    };
    return g;
  }

  /* ════════════════════════════════════════════
     9. MERCEDES-BENZ C-CLASS AMG LINE
     Signature: 3-pointed star on hood/grille,
     horizontal chrome grille slats, T-shaped DRL,
     elegant tapered body
  ════════════════════════════════════════════ */
  function buildMercedesC(color, rimStyle) {
    const g = new THREE.Group();
    const paint = makePaintMat(color);
    const chrome = makeChromeMat();

    // Elegant long body
    add(g, box(2.0, 0.54, 4.67, paint), 0, 0.38, 0);
    [-1.02, 1.02].forEach(x => add(g, box(0.05, 0.1, 3.6, blackMat), x, 0.22, 0));

    // Cabin (graceful C-pillar angle)
    add(g, box(1.9, 0.5, 2.08, paint), 0, 0.91, -0.14);
    add(g, box(1.84, 0.08, 1.86, paint), 0, 1.17, -0.19);

    // Long elegant hood
    add(g, box(1.9, 0.05, 1.38, paint), 0, 0.66, 1.66);
    // Hood crease lines (Mercedes elegant lines)
    [-0.5, 0.5].forEach(x => add(g, box(0.04, 0.055, 1.34, paint), x, 0.688, 1.66));

    // Windshield (raked)
    add(g, box(1.82, 0.46, 0.07, blackMat, -0.54, 0, 0), 0, 0.94, 0.9);
    add(g, box(1.72, 0.43, 0.04, glassMat, -0.54, 0, 0), 0, 0.94, 0.88);
    add(g, box(1.82, 0.42, 0.07, blackMat, 0.52, 0, 0), 0, 0.93, -1.17);
    add(g, box(1.72, 0.39, 0.04, glassMat, 0.52, 0, 0), 0, 0.93, -1.15);
    [-1.01, 1.01].forEach(x => add(g, box(0.04, 0.28, 0.78, glassMat), x, 0.96, -0.49));
    [-1.03, 1.03].forEach(x => add(g, box(0.05, 0.08, 0.14, blackMat), x, 0.87, 0.78));

    // === FRONT — MERCEDES SIGNATURE ===
    // Grille with chrome horizontal slats
    add(g, box(1.28, 0.3, 0.1, chrome), 0, 0.47, 2.24);  // chrome surround
    add(g, box(1.2, 0.24, 0.11, new THREE.MeshStandardMaterial({color:0x080808,roughness:0.9})), 0, 0.47, 2.25);
    // 7 horizontal chrome slats (Mercedes signature)
    for (let i=0; i<7; i++) {
      add(g, box(1.18, 0.02, 0.08, chrome), 0, 0.37+i*0.035, 2.26);
    }
    // THREE-POINTED STAR EMBLEM on grille (3 fins at 120°)
    const starMat = chrome;
    const star1 = box(0.04, 0.16, 0.06, starMat);
    star1.position.set(0, 0.47, 2.27); g.add(star1);
    const star2 = box(0.04, 0.16, 0.06, starMat, 0, 0, Math.PI*2/3);
    star2.position.set(0, 0.47, 2.27); g.add(star2);
    const star3 = box(0.04, 0.16, 0.06, starMat, 0, 0, -Math.PI*2/3);
    star3.position.set(0, 0.47, 2.27); g.add(star3);
    // Star circle
    const starRing = cyl(0.085, 0.085, 0.07, 20, chrome);
    starRing.rotation.x = Math.PI/2; starRing.position.set(0, 0.47, 2.27); g.add(starRing);

    // Bonnet star (3-pointed star on hood)
    add(g, box(0.02, 0.08, 0.05, chrome), 0, 0.7, 1.8);

    // Lower bumper (AMG Line)
    add(g, box(2.0, 0.22, 0.13, blackMat), 0, 0.22, 2.22);
    add(g, box(1.5, 0.1, 0.11, new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:0.9})), 0, 0.22, 2.24);
    [-0.6, 0.6].forEach(x => add(g, box(0.32, 0.14, 0.1, blackMat), x, 0.22, 2.23));

    // T-SHAPED DRL (Mercedes signature headlight)
    const hlMat = makeLightMat(0xeeeeff, 0xffffff);
    [-0.72, 0.72].forEach(x => {
      add(g, box(0.38, 0.07, 0.07, hlMat), x, 0.64, 2.22);  // horizontal bar
      add(g, box(0.06, 0.18, 0.06, hlMat), x < 0 ? x+0.16 : x-0.16, 0.56, 2.22);  // vertical drop
      add(g, box(0.36, 0.04, 0.06, hlMat), x, 0.56, 2.22);  // DRL strip
    });
    const hlMats = [hlMat];

    // === REAR ===
    add(g, box(2.0, 0.22, 0.13, blackMat), 0, 0.26, -2.32);
    add(g, box(1.0, 0.06, 0.1, chrome), 0, 0.25, -2.32);  // chrome strip
    add(g, box(1.9, 0.1, 0.75, paint), 0, 0.74, -1.62);

    const tlMat = makeLightMat(0xff1100, 0xff1100);
    // Mercedes fin-style taillights
    [-0.7, 0.7].forEach(x => {
      add(g, box(0.42, 0.13, 0.07, tlMat), x, 0.58, -2.3);
      add(g, box(0.06, 0.28, 0.06, tlMat), x < 0 ? x+0.19 : x-0.19, 0.58, -2.3);  // vertical fin
    });
    add(g, box(1.84, 0.02, 0.05, tlMat), 0, 0.52, -2.3);
    // Hidden exhausts in lower diffuser
    add(g, box(1.4, 0.1, 0.09, blackMat), 0, 0.15, -2.3);  // diffuser
    [-0.42, 0.42].forEach(x => {
      const ex = cyl(0.038, 0.038, 0.08, 14, chrome);
      ex.rotation.x = Math.PI/2; ex.position.set(x, 0.17, -2.37); g.add(ex);
    });
    add(g, box(2.0, 0.54, 0.12, paint), 0, 0.58, -2.3);

    const doorFL = makeDoor(g, -1.02, 0.67, 0.9, 0.88, 0.44, 0.07, 0.27, paint, chrome);
    const doorFR = makeDoor(g,  1.02, 0.67, 0.9, 0.88, 0.44, 0.07, 0.27, paint, chrome);
    const doorRL = makeDoor(g, -1.02, 0.67, -0.02, 0.82, 0.43, 0.07, 0.26, paint, chrome);
    const doorRR = makeDoor(g,  1.02, 0.67, -0.02, 0.82, 0.43, 0.07, 0.26, paint, chrome);
    const bonnetPivot = makeBonnet(g, 0.98, 0.65, 1.4, 1.88, paint);
    const trunkPivot  = makeTrunk(g, -1.26, 0.72, 0.76, 1.88, paint);

    const wPos = [[-0.98,0.37,1.44],[0.98,0.37,1.44],[-0.98,0.37,-1.44],[0.98,0.37,-1.44]];
    const wheels = addWheels(g, wPos, 1.0, rimStyle);
    wPos.forEach(([x,y,z]) => addArch(g, x*0.99, y+0.22, z, 0.18, 0.15, 0.68));

    g.userData = {
      state: { doorFL:false,doorFR:false,doorRL:false,doorRR:false,bonnet:false,trunk:false,lights:false },
      parts: { doorFL,doorFR,doorRL,doorRR,bonnetPivot,trunkPivot,hlMats,wheels,tlMat },
      paintMeshes: collectPaintMeshes(g, paint), paintMat: paint
    };
    return g;
  }

  /* ════════════════════════════════════════════
     10. HYUNDAI CRETA N LINE
     Signature: PARAMETRIC PIXEL GRILLE,
     split C-shaped headlights, N-Line red accent
  ════════════════════════════════════════════ */
  function buildHyundaiCreta(color, rimStyle) {
    const g = new THREE.Group();
    const paint = makePaintMat(color);
    const chrome = makeChromeMat();

    add(g, box(1.88, 0.63, 3.96, paint), 0, 0.5, 0);
    add(g, box(1.94, 0.24, 3.88, blackMat), 0, 0.24, 0);
    [-0.97, 0.97].forEach(x => add(g, box(0.06, 0.13, 3.5, blackMat), x, 0.27, 0));
    // N-LINE RED ACCENT STRIP (side signature)
    [-0.97, 0.97].forEach(x => add(g, box(0.04, 0.04, 2.8, redAccent), x, 0.44, 0.1));

    add(g, box(1.82, 0.65, 2.74, paint), 0, 1.15, -0.18);
    add(g, box(1.78, 0.08, 2.5, paint), 0, 1.48, -0.24);

    add(g, box(1.8, 0.07, 0.88, paint), 0, 0.86, 1.56);

    add(g, box(1.76, 0.58, 0.07, blackMat, -0.46, 0, 0), 0, 1.13, 0.96);
    add(g, box(1.66, 0.54, 0.04, glassMat, -0.46, 0, 0), 0, 1.13, 0.94);
    add(g, box(1.76, 0.48, 0.07, blackMat, 0.42, 0, 0), 0, 1.14, -1.38);
    add(g, box(1.66, 0.44, 0.04, glassMat, 0.42, 0, 0), 0, 1.14, -1.36);
    [-0.95, 0.95].forEach(x => {
      add(g, box(0.04, 0.37, 0.9, glassMat), x, 1.1, 0.42);
      add(g, box(0.04, 0.32, 0.7, glassMat), x, 1.08, -0.54);
    });
    [-0.97, 0.97].forEach(x => add(g, box(0.06, 0.09, 0.14, blackMat), x, 1.06, 0.96));

    // === FRONT — CRETA SIGNATURE ===
    // PARAMETRIC PIXEL GRILLE (4×3 grid of rectangular pixels)
    const pixelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.5, roughness: 0.6 });
    add(g, box(1.42, 0.3, 0.11, chrome), 0, 0.6, 1.98);  // chrome outer frame
    add(g, box(1.38, 0.26, 0.12, new THREE.MeshStandardMaterial({color:0x060606,roughness:0.95})), 0, 0.6, 1.99);
    // 4 columns × 3 rows of pixel boxes
    const pW = 0.28, pH = 0.07, gap = 0.06;
    for (let col=0; col<4; col++) {
      for (let row=0; row<3; row++) {
        const px = -0.5 + col*(pW+gap*0.5);
        const py = 0.5 + row*(pH+gap);
        const pixel = box(pW, pH, 0.09, pixelMat);
        pixel.position.set(px, py, 2.0); g.add(pixel);
      }
    }
    // Chrome pixel grid lines
    for (let i=0; i<3; i++) {
      add(g, box(1.34, 0.02, 0.07, chrome), 0, 0.49+i*0.13, 2.01);
    }
    for (let i=0; i<3; i++) {
      add(g, box(0.02, 0.24, 0.07, chrome), -0.355+i*0.355, 0.6, 2.01);
    }

    // SPLIT HEADLIGHTS with C-shaped DRL
    const hlMat = makeLightMat(0xeeeeff, 0xffffff);
    [-0.7, 0.7].forEach(x => {
      // Upper DRL (at hood level)
      add(g, box(0.38, 0.04, 0.06, hlMat), x, 0.88, 1.97);
      // Vertical connecting arm
      add(g, box(0.04, 0.24, 0.06, hlMat), x < 0 ? x+0.17 : x-0.17, 0.77, 1.97);
      // Main headlight (lower)
      add(g, box(0.36, 0.11, 0.08, hlMat), x, 0.65, 1.98);
    });
    const hlMats = [hlMat];

    // N-LINE BUMPER
    add(g, box(1.9, 0.24, 0.13, blackMat), 0, 0.3, 1.96);
    add(g, box(0.8, 0.18, 0.11, blackMat), 0, 0.3, 1.98);
    // N-Line red bumper accent
    add(g, box(1.88, 0.025, 0.12, redAccent), 0, 0.195, 1.96);
    [-0.54, 0.54].forEach(x => add(g, box(0.52, 0.18, 0.11, blackMat), x, 0.3, 1.97));

    // === REAR ===
    const tlMat = makeLightMat(0xff1100, 0xff1100);
    add(g, box(1.88, 0.63, 0.1, paint), 0, 0.73, -2.0);
    add(g, box(1.9, 0.24, 0.12, blackMat), 0, 0.28, -2.0);
    // Pixel taillights (mirroring front)
    [-0.64, 0.64].forEach(x => {
      add(g, box(0.36, 0.12, 0.07, tlMat), x, 0.72, -2.0);
      add(g, box(0.04, 0.2, 0.06, tlMat), x < 0 ? x+0.16 : x-0.16, 0.64, -2.0);
    });
    add(g, box(1.78, 0.02, 0.05, tlMat), 0, 0.62, -2.0);
    // N-Line red rear strip
    add(g, box(1.86, 0.025, 0.1, redAccent), 0, 0.195, -2.0);
    const ex = cyl(0.04, 0.04, 0.09, 12, chrome);
    ex.rotation.x = Math.PI/2; ex.position.set(0, 0.2, -2.07); g.add(ex);

    const doorFL = makeDoor(g, -0.96, 0.8, 0.88, 0.9, 0.52, 0.07, 0.32, paint, chrome);
    const doorFR = makeDoor(g,  0.96, 0.8, 0.88, 0.9, 0.52, 0.07, 0.32, paint, chrome);
    const doorRL = makeDoor(g, -0.96, 0.8, -0.04, 0.84, 0.5, 0.07, 0.31, paint, chrome);
    const doorRR = makeDoor(g,  0.96, 0.8, -0.04, 0.84, 0.5, 0.07, 0.31, paint, chrome);
    const bonnetPivot = makeBonnet(g, 1.0, 0.86, 0.9, 1.78, paint);
    const trunkPivot  = makeTrunk(g, -1.43, 0.94, 0.52, 1.76, paint);

    const wPos = [[-0.95,0.42,1.26],[0.95,0.42,1.26],[-0.95,0.42,-1.26],[0.95,0.42,-1.26]];
    const wheels = addWheels(g, wPos, 1.08, rimStyle);
    wPos.forEach(([x,y,z]) => addArch(g, x*0.99, y+0.24, z, 0.18, 0.17, 0.7));

    g.userData = {
      state: { doorFL:false,doorFR:false,doorRL:false,doorRR:false,bonnet:false,trunk:false,lights:false },
      parts: { doorFL,doorFR,doorRL,doorRR,bonnetPivot,trunkPivot,hlMats,wheels,tlMat },
      paintMeshes: collectPaintMeshes(g, paint), paintMat: paint
    };
    return g;
  }

  /* ─── Collect paint meshes ─── */
  function collectPaintMeshes(group, paintMat) {
    const list = [];
    group.traverse(obj => {
      if (obj.isMesh && obj.material === paintMat) list.push(obj);
    });
    return list;
  }

  /* ─── Animation System ─── */
  const DOOR_ANGLE   = Math.PI / 2.5;
  const BONNET_ANGLE = -Math.PI / 2.4;
  const TRUNK_ANGLE  =  Math.PI / 2.2;

  function animatePart(pivot, target, axis, dur=600) {
    if (!pivot) return;
    const start = pivot.rotation[axis];
    const t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      const e = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
      pivot.rotation[axis] = start + (target - start) * e;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function toggleDoor(carGroup, doorKey, leftSide) {
    const { state, parts } = carGroup.userData;
    const open = !state[doorKey];
    state[doorKey] = open;
    if (!parts[doorKey]) return;
    animatePart(parts[doorKey], open ? (leftSide ? -DOOR_ANGLE : DOOR_ANGLE) : 0, 'y');
  }

  function toggleBonnet(carGroup) {
    const { state, parts } = carGroup.userData;
    state.bonnet = !state.bonnet;
    animatePart(parts.bonnetPivot, state.bonnet ? BONNET_ANGLE : 0, 'x');
  }

  function toggleTrunk(carGroup) {
    const { state, parts } = carGroup.userData;
    state.trunk = !state.trunk;
    animatePart(parts.trunkPivot, state.trunk ? TRUNK_ANGLE : 0, 'x');
  }

  function toggleHeadlights(carGroup) {
    const { state, parts } = carGroup.userData;
    state.lights = !state.lights;
    const intensity = state.lights ? 2.5 : 0;
    parts.hlMats.forEach(m => { m.emissiveIntensity = intensity; });
    parts.tlMat.emissiveIntensity = state.lights ? 1.0 : 0;
  }

  function resetAll(carGroup) {
    const { state, parts } = carGroup.userData;
    if (state.doorFL) toggleDoor(carGroup, 'doorFL', true);
    if (state.doorFR) toggleDoor(carGroup, 'doorFR', false);
    if (state.doorRL) toggleDoor(carGroup, 'doorRL', true);
    if (state.doorRR) toggleDoor(carGroup, 'doorRR', false);
    if (state.bonnet) toggleBonnet(carGroup);
    if (state.trunk)  toggleTrunk(carGroup);
    if (state.lights) toggleHeadlights(carGroup);
  }

  /* ─── Color & Wheel updates ─── */
  function setColor(carGroup, hex) {
    carGroup.userData.paintMat.color.set(hex);
  }

  function setWheelStyle(carGroup, style) {
    const newRim = makeRimMat(style);
    carGroup.userData.parts.wheels.forEach(w => {
      w.traverse(obj => {
        if (obj.isMesh && obj.material.metalness > 0.8 && obj.material.roughness < 0.5) {
          obj.material = newRim;
        }
      });
    });
  }

  function spinWheels(carGroup, delta=0.012) {
    const { wheels } = carGroup.userData.parts;
    if (wheels) wheels.forEach(w => { w.rotation.x += delta; });
  }

  /* ─── Main build dispatcher (by car ID) ─── */
  const BUILDERS = {
    'bmw-m4':          buildBMWM4,
    'bmw-x5':          buildBMWX5,
    'toyota-camry':    buildToyotaCamry,
    'toyota-fortuner': buildToyotaFortuner,
    'tata-nexon-ev':   buildTataNexonEV,
    'tata-harrier':    buildTataHarrier,
    'mahindra-xuv700': buildMahindraXUV700,
    'mahindra-thar':   buildMahindraThar,
    'mercedes-c':      buildMercedesC,
    'hyundai-creta':   buildHyundaiCreta
  };

  function build(carId, color, rimStyle='standard') {
    const fn = BUILDERS[carId] || buildBMWM4;
    return fn(color, rimStyle);
  }

  return { build, toggleDoor, toggleBonnet, toggleTrunk, toggleHeadlights, resetAll, setColor, setWheelStyle, spinWheels };
})();
