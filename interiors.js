import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Helper Functions                                                   */
/* ------------------------------------------------------------------ */

function box(w, h, d, x, y, z, material, cast = true, receive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

function cyl(rt, rb, h, segs, x, y, z, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  return mesh;
}

function makeCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ */
/*  Procedural Canvas Textures for Interiors                          */
/* ------------------------------------------------------------------ */

// 1. Olive/sage green-grey cafe tile floor
const cafeFloorTex = makeCanvas(256, 256, (g, w, h) => {
  g.fillStyle = '#4f5e55';
  g.fillRect(0, 0, w, h);
  const tileSize = 32;
  for (let x = 0; x < w; x += tileSize) {
    for (let y = 0; y < h; y += tileSize) {
      const isEven = ((x / tileSize + y / tileSize) % 2 === 0);
      g.fillStyle = isEven ? '#59695f' : '#49574e';
      g.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
    }
  }
  // Subtle mottled vintage wear
  g.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 400; i++) {
    g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
});
cafeFloorTex.wrapS = THREE.RepeatWrapping;
cafeFloorTex.wrapT = THREE.RepeatWrapping;
cafeFloorTex.repeat.set(4, 4);

// 2. Glazed deep red subway tile backsplash for back-bar
const redSubwayTileTex = makeCanvas(256, 128, (g, w, h) => {
  g.fillStyle = '#3f1114';
  g.fillRect(0, 0, w, h);
  const rows = 6;
  const rh = h / rows;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * 28;
    for (let x = -28 + offset; x < w + 28; x += 56) {
      g.fillStyle = (r + x) % 3 === 0 ? '#7e1e23' : '#6b181c';
      g.fillRect(x + 1, r * rh + 1, 54, rh - 2);
    }
  }
});
redSubwayTileTex.wrapS = THREE.RepeatWrapping;
redSubwayTileTex.wrapT = THREE.RepeatWrapping;
redSubwayTileTex.repeat.set(2, 2);

// 3. Cute cat illustration canvas print (matching room_4_mua.png)
const catArtTex = makeCanvas(256, 320, (g, w, h) => {
  g.fillStyle = '#f8f4ec';
  g.fillRect(0, 0, w, h);
  // cat body
  g.fillStyle = '#22283a';
  g.beginPath();
  g.ellipse(128, 200, 52, 75, 0, 0, Math.PI * 2);
  g.fill();
  // cat head
  g.beginPath();
  g.arc(128, 120, 38, 0, Math.PI * 2);
  g.fill();
  // ears
  g.beginPath();
  g.moveTo(100, 110); g.lineTo(88, 70); g.lineTo(116, 95); g.fill();
  g.beginPath();
  g.moveTo(156, 110); g.lineTo(168, 70); g.lineTo(140, 95); g.fill();
  // eyes
  g.fillStyle = '#ffcf56';
  g.beginPath(); g.arc(114, 118, 5, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(142, 118, 5, 0, Math.PI * 2); g.fill();
});

// 4. Botanical sun & leaves canvas print (matching longer-room.png)
const botanicalArtTex = makeCanvas(256, 256, (g, w, h) => {
  g.fillStyle = '#faf7f2';
  g.fillRect(0, 0, w, h);
  // warm terracotta sun
  g.fillStyle = '#df8f54';
  g.beginPath();
  g.arc(140, 85, 40, 0, Math.PI * 2);
  g.fill();
  // green branch
  g.strokeStyle = '#3e5845';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(70, 210);
  g.quadraticCurveTo(110, 150, 160, 90);
  g.stroke();
  for (let i = 0; i < 5; i++) {
    const t = 0.2 + i * 0.15;
    const px = 70 + t * 90;
    const py = 210 - t * 120;
    g.fillStyle = '#496751';
    g.beginPath();
    g.ellipse(px + (i % 2 === 0 ? 16 : -16), py, 16, 7, (i % 2 === 0 ? 0.6 : -0.6), 0, Math.PI * 2);
    g.fill();
  }
});

// 5. Scandinavian light oak floor texture for Studio
const oakFloorTex = makeCanvas(256, 256, (g, w, h) => {
  g.fillStyle = '#d5c3aa';
  g.fillRect(0, 0, w, h);
  const plankH = 24;
  for (let y = 0; y < h; y += plankH) {
    g.fillStyle = 'rgba(70, 50, 30, 0.12)';
    g.fillRect(0, y, w, 1);
    const offset = (y % 48 === 0) ? 0 : 64;
    for (let x = offset; x < w; x += 128) {
      g.fillRect(x, y, 1, plankH);
    }
  }
  g.fillStyle = 'rgba(0,0,0,0.03)';
  for (let i = 0; i < 400; i++) {
    g.fillRect(Math.random() * w, Math.random() * h, 12, 1);
  }
});
oakFloorTex.wrapS = THREE.RepeatWrapping;
oakFloorTex.wrapT = THREE.RepeatWrapping;
oakFloorTex.repeat.set(3, 4);

/* ------------------------------------------------------------------ */
/*  Interior Materials                                                 */
/* ------------------------------------------------------------------ */

export function createInteriorMaterials(M) {
  return {
    cafeFloorTile: new THREE.MeshStandardMaterial({
      map: cafeFloorTex,
      roughness: 0.65,
      metalness: 0.05,
    }),
    cafeRedTile: new THREE.MeshStandardMaterial({
      map: redSubwayTileTex,
      roughness: 0.35,
      metalness: 0.15,
    }),
    cafeBarWood: new THREE.MeshStandardMaterial({
      color: 0x5a3821,
      roughness: 0.72,
    }),
    cafeBarGlow: new THREE.MeshBasicMaterial({
      color: 0xffb355,
    }),
    fabricPendant: new THREE.MeshStandardMaterial({
      color: 0xf3eee3,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
    pendantGlow: new THREE.MeshBasicMaterial({
      color: 0xffebc4,
    }),
    shelfGlow: new THREE.MeshBasicMaterial({
      color: 0xffd188,
    }),
    armchairVelvet: new THREE.MeshStandardMaterial({
      color: 0x2e4635,
      roughness: 0.85,
    }),
    espressoRed: new THREE.MeshStandardMaterial({
      color: 0x822428,
      roughness: 0.3,
      metalness: 0.4,
    }),
    atriumRailing: new THREE.MeshStandardMaterial({
      color: 0x82262d,
      roughness: 0.5,
      metalness: 0.4,
    }),
    studioOak: new THREE.MeshStandardMaterial({
      map: oakFloorTex,
      roughness: 0.7,
    }),
    studioTerracotta: new THREE.MeshStandardMaterial({
      color: 0xd88f72,
      roughness: 0.88,
    }),
    bedLinen: new THREE.MeshStandardMaterial({
      color: 0xfaf8f4,
      roughness: 0.92,
    }),
    bedPillows: new THREE.MeshStandardMaterial({
      color: 0xdfd4c2,
      roughness: 0.9,
    }),
    linenSheer: new THREE.MeshPhysicalMaterial({
      color: 0xfffcf7,
      roughness: 0.8,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    }),
    lampWarm: new THREE.MeshBasicMaterial({
      color: 0xfff0cb,
    }),
    catArt: new THREE.MeshStandardMaterial({
      map: catArtTex,
      roughness: 0.75,
    }),
    botanicalArt: new THREE.MeshStandardMaterial({
      map: botanicalArtTex,
      roughness: 0.75,
    }),
    interiorWall: new THREE.MeshStandardMaterial({
      color: 0xf5f1ea,
      roughness: 0.92,
    }),
  };
}

/* ------------------------------------------------------------------ */
/*  1. Ground Floor: Cafe & Bar Lounge                                 */
/* ------------------------------------------------------------------ */

export function createCafeInterior(IM, M) {
  const group = new THREE.Group();
  group.name = 'cafe_interior';

  // 1. Cafe Tiled Floor
  const floor = box(6.6, 0.12, 7.6, 0, 0.21, 4.8, IM.cafeFloorTile, false, true);
  group.add(floor);

  // 2. Concrete Ceiling with exposed structural cross-beams
  const ceiling = box(6.6, 0.15, 7.6, 0, 3.65, 4.8, IM.interiorWall, false, true);
  group.add(ceiling);
  for (const bz of [2.0, 4.4, 6.8]) {
    group.add(box(6.6, 0.35, 0.28, 0, 3.42, bz, IM.interiorWall));
  }

  // 3. Dividing Back Wall between Cafe and Central Atrium
  // Has large glass grid double-door opening in the center
  group.add(box(2.0, 3.4, 0.25, -2.3, 1.85, 1.0, IM.interiorWall));
  group.add(box(2.0, 3.4, 0.25, 2.3, 1.85, 1.0, IM.interiorWall));
  group.add(box(2.6, 0.8, 0.25, 0, 3.15, 1.0, IM.interiorWall));
  // Glass partition in the opening
  const atGlass = box(2.55, 2.7, 0.06, 0, 1.4, 1.0, M.glassClear);
  group.add(atGlass);
  // Grid steel frames on glass door
  for (let gx = -1.1; gx <= 1.1; gx += 0.55) {
    group.add(box(0.04, 2.7, 0.08, gx, 1.4, 1.0, M.steelBlack, false));
  }
  for (let gy = 0.5; gy <= 2.5; gy += 0.5) {
    group.add(box(2.55, 0.04, 0.08, 0, gy, 1.0, M.steelBlack, false));
  }

  // 4. Quầy Bar Pha Chế (Walnut Espresso Bar Counter)
  // Main front counter
  const barCounter = box(2.4, 1.05, 0.65, -2.0, 0.725, 3.4, IM.cafeBarWood);
  group.add(barCounter);
  // Solid wood top with overhang
  group.add(box(2.5, 0.08, 0.75, -2.0, 1.28, 3.4, IM.cafeBarWood));
  // Under-counter warm LED cove strip
  const barGlow = box(2.46, 0.04, 0.06, -2.0, 1.22, 3.76, IM.cafeBarGlow, false, false);
  group.add(barGlow);

  // Back-bar counter against the wall
  group.add(box(2.4, 0.88, 0.45, -2.0, 0.64, 1.4, IM.cafeBarWood));
  group.add(box(2.5, 0.06, 0.52, -2.0, 1.1, 1.4, IM.cafeBarWood));
  // Red glazed tile backsplash behind back-bar
  const redTile = box(2.4, 1.2, 0.04, -2.0, 1.75, 1.16, IM.cafeRedTile);
  group.add(redTile);
  // Floating wooden shelf for glasses and bottles
  group.add(box(2.3, 0.05, 0.25, -2.0, 2.4, 1.3, IM.cafeBarWood));
  // Glasses / bottles
  for (let i = 0; i < 7; i++) {
    const bx = -2.9 + i * 0.3;
    group.add(cyl(0.04, 0.04, 0.22, 12, bx, 2.53, 1.3, M.glassClear, false));
  }

  // Espresso Machine on back-bar
  const espresso = new THREE.Group();
  espresso.position.set(-1.8, 1.15, 1.4);
  espresso.add(box(0.65, 0.38, 0.42, 0, 0.19, 0, IM.espressoRed));
  espresso.add(box(0.6, 0.06, 0.15, 0, 0.03, 0.24, M.metalBrass));
  // Portafilters
  espresso.add(cyl(0.02, 0.02, 0.14, 8, -0.15, 0.22, 0.28, M.steelBlack));
  espresso.add(cyl(0.02, 0.02, 0.14, 8, 0.15, 0.22, 0.28, M.steelBlack));
  group.add(espresso);

  // 2 Tall Coffee Bean Grinders
  for (const gx of [-2.4, -2.7]) {
    const grinder = new THREE.Group();
    grinder.position.set(gx, 1.15, 1.4);
    grinder.add(box(0.18, 0.3, 0.2, 0, 0.15, 0, M.steelBlack));
    grinder.add(cyl(0.08, 0.06, 0.25, 16, 0, 0.42, 0, M.glassClear));
    group.add(grinder);
  }

  // 4 Sage Green Bar Stools
  for (const sx of [-1.1, -1.7, -2.3, -2.9]) {
    const stool = new THREE.Group();
    stool.position.set(sx, 0.2, 4.3);
    // 4 legs
    for (const [lx, lz] of [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]) {
      stool.add(cyl(0.015, 0.018, 0.72, 8, lx, 0.36, lz, M.greenGate));
    }
    // Footrest ring
    stool.add(cyl(0.16, 0.16, 0.03, 16, 0, 0.25, 0, M.greenGate, false));
    // Wooden curved seat
    stool.add(box(0.36, 0.04, 0.34, 0, 0.74, 0, IM.cafeBarWood));
    group.add(stool);
  }

  // 5. Bàn Ăn Chung Lớn (Communal Table with Crossed X Legs)
  const tableGroup = new THREE.Group();
  tableGroup.position.set(0.35, 0.2, 5.6);
  // Thick solid oak slab
  tableGroup.add(box(2.8, 0.07, 0.95, 0, 0.74, 0, M.woodWarm));
  // 2 crossed X trestle legs
  for (const tx of [-1.0, 1.0]) {
    const leg1 = box(0.1, 0.76, 0.08, tx, 0.36, 0, M.woodDark);
    leg1.rotation.z = 0.28;
    tableGroup.add(leg1);
    const leg2 = box(0.1, 0.76, 0.08, tx, 0.36, 0, M.woodDark);
    leg2.rotation.z = -0.28;
    tableGroup.add(leg2);
    // Lower crossbar
    tableGroup.add(box(0.1, 0.06, 0.8, tx, 0.08, 0, M.woodDark));
  }
  // 6 Wooden Dining Chairs (3 each side)
  for (let i = 0; i < 3; i++) {
    const cx = -0.9 + i * 0.9;
    // South side chair
    const c1 = new THREE.Group();
    c1.position.set(cx, 0, 0.72);
    c1.add(box(0.42, 0.04, 0.42, 0, 0.44, 0, M.woodWarm));
    c1.add(box(0.42, 0.4, 0.04, 0, 0.66, 0.19, M.woodWarm));
    for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      c1.add(cyl(0.015, 0.015, 0.44, 8, lx, 0.22, lz, M.woodWarm));
    }
    tableGroup.add(c1);

    // North side chair
    const c2 = new THREE.Group();
    c2.position.set(cx, 0, -0.72);
    c2.add(box(0.42, 0.04, 0.42, 0, 0.44, 0, M.woodWarm));
    c2.add(box(0.42, 0.4, 0.04, 0, 0.66, -0.19, M.woodWarm));
    for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      c2.add(cyl(0.015, 0.015, 0.44, 8, lx, 0.22, lz, M.woodWarm));
    }
    tableGroup.add(c2);
  }
  group.add(tableGroup);

  // Large Conical Fabric Drum Pendant Lamp above Communal Table
  const pendant = new THREE.Group();
  pendant.position.set(0.35, 2.75, 5.6);
  // Conical shade
  pendant.add(cyl(0.42, 0.62, 0.52, 32, 0, 0, 0, IM.fabricPendant));
  // Diffuser glow plate inside
  pendant.add(cyl(0.58, 0.58, 0.02, 24, 0, -0.22, 0, IM.pendantGlow, false));
  // Suspension cord up to ceiling
  pendant.add(cyl(0.008, 0.008, 0.8, 8, 0, 0.55, 0, M.steelBlack, false));

  // Warm spotlight focused down on table
  const tableLight = new THREE.PointLight(0xffe2ab, 2.8, 5.5, 1.2);
  tableLight.position.set(0, -0.1, 0);
  pendant.add(tableLight);
  group.add(pendant);

  // 6. Tủ Sách Thư Viện & Góc Đọc Sách (Library Bookcase Wall)
  const bookcase = new THREE.Group();
  bookcase.position.set(-3.15, 0.2, 6.7);
  // Vertical frame panels
  bookcase.add(box(0.28, 3.2, 0.04, 0, 1.6, -1.2, M.woodWarm));
  bookcase.add(box(0.28, 3.2, 0.04, 0, 1.6, 0, M.woodWarm));
  bookcase.add(box(0.28, 3.2, 0.04, 0, 1.6, 1.2, M.woodWarm));
  // Backboard with warm oak texture
  bookcase.add(box(0.04, 3.2, 2.4, -0.12, 1.6, 0, M.woodWarm));
  // 5 Shelves with books and warm LED strip
  const bookColors = [0x993d3d, 0x3d6652, 0x3b5375, 0xd4a359, 0xf0ebe1, 0x47382d];
  for (let s = 0; s < 5; s++) {
    const sy = 0.35 + s * 0.62;
    bookcase.add(box(0.28, 0.04, 2.4, 0, sy, 0, M.woodWarm));
    // LED light cove under shelf
    if (s > 0) bookcase.add(box(0.24, 0.02, 2.36, 0, sy - 0.02, 0, IM.shelfGlow, false, false));
    // Rows of books
    for (let b = 0; b < 14; b++) {
      const bz = -1.05 + b * 0.15;
      const col = bookColors[(s * 3 + b) % bookColors.length];
      const bh = 0.28 + ((b % 3) * 0.06);
      const bookMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 });
      bookcase.add(box(0.2, bh, 0.04, 0.02, sy + bh / 2 + 0.02, bz, bookMat));
    }
  }
  group.add(bookcase);

  // Góc Đọc Sách: Ghế bành bọc nỉ xanh rêu + Bàn trà + Đèn cây vintage
  const chair = new THREE.Group();
  chair.position.set(-2.2, 0.2, 7.3);
  chair.rotation.y = 0.45;
  // Seat cushion
  chair.add(box(0.68, 0.18, 0.65, 0, 0.38, 0, IM.armchairVelvet));
  // Curved high back
  chair.add(box(0.68, 0.68, 0.14, 0, 0.72, -0.28, IM.armchairVelvet));
  // Armrests
  chair.add(box(0.12, 0.34, 0.55, -0.32, 0.54, 0, IM.armchairVelvet));
  chair.add(box(0.12, 0.34, 0.55, 0.32, 0.54, 0, IM.armchairVelvet));
  // 4 tapered wood legs
  for (const [lx, lz] of [[-0.28, -0.25], [0.28, -0.25], [-0.28, 0.25], [0.28, 0.25]]) {
    chair.add(cyl(0.02, 0.014, 0.28, 8, lx, 0.14, lz, M.woodDark));
  }
  group.add(chair);

  // Small round timber coffee table
  group.add(cyl(0.28, 0.28, 0.04, 24, -1.4, 0.58, 7.3, M.woodWarm));
  group.add(cyl(0.02, 0.02, 0.36, 8, -1.4, 0.38, 7.3, M.woodDark));
  group.add(cyl(0.22, 0.22, 0.02, 16, -1.4, 0.21, 7.3, M.woodDark));

  // Vintage Mid-Century Floor Lamp with Glowing Sphere
  const floorLamp = new THREE.Group();
  floorLamp.position.set(-2.8, 0.2, 8.1);
  floorLamp.add(cyl(0.14, 0.14, 0.03, 16, 0, 0.015, 0, M.steelBlack));
  floorLamp.add(cyl(0.015, 0.015, 1.45, 8, 0, 0.73, 0, M.steelBlack));
  // Glowing glass globe
  floorLamp.add(cyl(0.12, 0.12, 0.24, 16, 0, 1.48, 0, IM.pendantGlow, false));
  const lampLight = new THREE.PointLight(0xffd588, 1.8, 4.0, 1.5);
  lampLight.position.set(0, 1.48, 0);
  floorLamp.add(lampLight);
  group.add(floorLamp);

  // 7. Băng Ghế Dài Dọc Tường Phải (Banquette Bench Seating)
  const bench = box(0.55, 0.45, 3.6, 2.95, 0.425, 5.8, M.woodWarm);
  group.add(bench);
  group.add(box(0.12, 0.55, 3.6, 3.2, 0.85, 5.8, M.woodWarm));
  // 2 Round Bistro Tables with Slim Pedestals
  for (const bz of [4.8, 6.8]) {
    group.add(cyl(0.32, 0.32, 0.03, 24, 2.2, 0.74, bz, M.whiteClean));
    group.add(cyl(0.025, 0.025, 0.52, 8, 2.2, 0.47, bz, M.steelBlack));
    group.add(cyl(0.2, 0.2, 0.02, 16, 2.2, 0.22, bz, M.steelBlack));
    // Bistro chair opposite bench
    const bChair = new THREE.Group();
    bChair.position.set(1.6, 0.2, bz);
    bChair.rotation.y = Math.PI / 2;
    bChair.add(box(0.38, 0.03, 0.38, 0, 0.44, 0, M.woodWarm));
    bChair.add(box(0.38, 0.36, 0.03, 0, 0.64, 0.18, M.woodWarm));
    for (const [lx, lz] of [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]) {
      bChair.add(cyl(0.015, 0.015, 0.44, 8, lx, 0.22, lz, M.woodWarm));
    }
    group.add(bChair);
  }

  // 8. Air Conditioner on Front Wall
  const ac = box(0.85, 0.28, 0.22, 1.4, 3.2, 8.4, M.whiteClean);
  group.add(ac);

  return group;
}

/* ------------------------------------------------------------------ */
/*  2. Central Skylight Atrium & Courtyard                             */
/* ------------------------------------------------------------------ */

export function createAtriumInterior(IM, M) {
  const group = new THREE.Group();
  group.name = 'atrium_interior';

  // 1. Terracotta Tiled Courtyard Floor
  const floor = box(6.6, 0.12, 5.4, 0, 0.21, -1.8, M.terracottaTile, false, true);
  group.add(floor);

  // 2. Double-Height Lightwell Walls (Ground + Mezzanine)
  // Left wall
  group.add(box(0.18, 7.2, 5.4, -3.25, 3.75, -1.8, IM.interiorWall));
  // Right wall with porthole window
  const rightWall = box(0.18, 7.2, 5.4, 3.25, 3.75, -1.8, IM.interiorWall);
  group.add(rightWall);
  // Rear wall separating Atrium from private back area
  group.add(box(6.6, 7.2, 0.25, 0, 3.75, -4.5, IM.interiorWall));

  // Circular Porthole Window on Right Wall
  const porthole = new THREE.Group();
  porthole.position.set(3.15, 2.4, -1.8);
  porthole.rotation.y = -Math.PI / 2;
  porthole.add(cyl(0.44, 0.44, 0.22, 32, 0, 0, 0, M.woodWarm));
  porthole.add(cyl(0.38, 0.38, 0.26, 32, 0, 0, 0, M.glassClear));
  group.add(porthole);

  // 3. Raised Timber Platform Deck on Left Side
  const deck = new THREE.Group();
  deck.position.set(-1.6, 0.2, -1.8);
  // Deck structure
  deck.add(box(2.8, 0.32, 2.6, 0, 0.16, 0, M.woodWarm));
  // Square cutout well in deck for the living tree
  deck.add(box(0.9, 0.34, 0.9, 0, 0.17, 0, M.peachSolid));
  group.add(deck);

  // 4. Central Living Tree (Cây Bàng Đài Loan Giếng Trời)
  const treeGroup = new THREE.Group();
  treeGroup.position.set(-1.6, 0.36, -1.8);
  // Organic winding trunk
  treeGroup.add(cyl(0.08, 0.12, 4.6, 12, 0, 2.3, 0, M.woodDark));
  // Branches
  const b1 = cyl(0.05, 0.06, 1.8, 8, 0.5, 2.6, 0.2, M.woodDark);
  b1.rotation.z = -0.55;
  treeGroup.add(b1);
  const b2 = cyl(0.04, 0.05, 1.6, 8, -0.4, 3.2, -0.3, M.woodDark);
  b2.rotation.z = 0.48;
  treeGroup.add(b2);
  const b3 = cyl(0.035, 0.045, 1.4, 8, 0.3, 3.9, -0.2, M.woodDark);
  b3.rotation.x = -0.42;
  treeGroup.add(b3);

  // Lush Foliage Canopy Clusters reaching up into the double-height void (matching atrium-tree.webp)
  const leavesClusters = [
    [0.6, 2.2, 0.2, 0.55],
    [-0.5, 2.6, -0.3, 0.52],
    [0.8, 3.1, 0.3, 0.65],
    [-0.7, 3.5, -0.4, 0.62],
    [0.4, 4.1, -0.2, 0.68],
    [-0.3, 4.6, 0.3, 0.72],
    [0.1, 5.2, 0.0, 0.82],
  ];
  for (const [lx, ly, lz, sc] of leavesClusters) {
    const cluster = new THREE.Mesh(new THREE.IcosahedronGeometry(sc, 1), M.ivyGreen);
    cluster.scale.set(1.25, 0.8, 1.2);
    cluster.position.set(lx, ly, lz);
    cluster.castShadow = true;
    treeGroup.add(cluster);
  }

  // Uplight at base of tree
  const treeSpot = new THREE.PointLight(0xffdf9b, 2.6, 6.5, 1.3);
  treeSpot.position.set(0, 0.35, 0);
  treeGroup.add(treeSpot);
  group.add(treeGroup);

  // 5. Curved Mezzanine Balcony Overlooking Atrium
  // Positioned at Y = 3.8m, cantilevered from the rear mezzanine wall
  const mezBalcony = new THREE.Group();
  mezBalcony.position.set(0, 3.8, -3.2);
  // Semicircular cantilevered floor
  const s = new THREE.Shape();
  s.moveTo(-1.6, -1.2);
  s.lineTo(1.6, -1.2);
  s.lineTo(1.6, 0);
  s.absarc(0, 0, 1.6, 0, Math.PI, false);
  s.lineTo(-1.6, -1.2);
  s.closePath();
  const bGeo = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: false });
  bGeo.rotateX(-Math.PI / 2);
  const bMesh = new THREE.Mesh(bGeo, M.whiteClean);
  bMesh.position.set(0, 0.08, 0);
  mezBalcony.add(bMesh);

  // Curved Burgundy Railing
  for (let a = 0; a <= Math.PI; a += Math.PI / 16) {
    const rx = Math.cos(a) * 1.55;
    const rz = -Math.sin(a) * 1.55;
    mezBalcony.add(cyl(0.015, 0.015, 0.85, 8, rx, 0.5, rz, IM.atriumRailing));
  }
  // Top handrail arc
  for (let a = 0; a < Math.PI; a += Math.PI / 24) {
    const rx1 = Math.cos(a) * 1.55;
    const rz1 = -Math.sin(a) * 1.55;
    const rx2 = Math.cos(a + Math.PI / 24) * 1.55;
    const rz2 = -Math.sin(a + Math.PI / 24) * 1.55;
    const dx = rx2 - rx1;
    const dz = rz2 - rz1;
    const len = Math.hypot(dx, dz);
    const railSeg = box(len, 0.04, 0.04, (rx1 + rx2) / 2, 0.92, (rz1 + rz2) / 2, IM.atriumRailing, false);
    railSeg.rotation.y = -Math.atan2(dz, dx);
    mezBalcony.add(railSeg);
  }
  // Planters on mezzanine balcony
  for (const px of [-1.1, 1.1]) {
    mezBalcony.add(box(0.5, 0.28, 0.28, px, 0.24, -0.6, M.whiteClean));
    const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), M.ivyGreen);
    foliage.scale.set(1.3, 0.8, 1);
    foliage.position.set(px, 0.45, -0.6);
    mezBalcony.add(foliage);
  }
  group.add(mezBalcony);

  // 6. Băng Ghế Gỗ & Đôn Ngồi Dọc Tường (matching atrium-tree.webp)
  group.add(box(1.5, 0.42, 0.4, 2.2, 0.42, -3.4, M.woodWarm));
  group.add(box(0.35, 0.38, 0.35, 1.2, 0.4, -3.4, M.woodWarm));
  group.add(box(0.35, 0.38, 0.35, 0.7, 0.4, -3.4, M.woodWarm));

  // Secondary Ficus Pot in Corner
  const ficusPot = cyl(0.24, 0.18, 0.42, 16, 2.5, 0.42, -0.8, M.whiteClean);
  group.add(ficusPot);
  const ficusBush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38, 1), M.ivyGreen);
  ficusBush.scale.set(1, 1.4, 1);
  ficusBush.position.set(2.5, 1.0, -0.8);
  group.add(ficusBush);

  return group;
}

/* ------------------------------------------------------------------ */
/*  3. 3rd Floor: Living Studio Homestay Room                          */
/* ------------------------------------------------------------------ */

export function createStudioInterior(IM, M) {
  const group = new THREE.Group();
  group.name = 'studio_interior';

  // 1. Scandinavian Light Oak Floor
  const floor = box(6.6, 0.12, 7.4, 0, 7.35, 4.8, IM.studioOak, false, true);
  group.add(floor);

  // 2. Ceiling
  const ceiling = box(6.6, 0.14, 7.4, 0, 10.95, 4.8, IM.interiorWall, false, true);
  group.add(ceiling);

  // 3. Walls
  // Rear Accent Wall: Terracotta peach accent wall behind the bed (matching room_4_mua.png)
  const rearWall = box(6.6, 3.5, 0.22, 0, 9.15, 1.15, IM.studioTerracotta);
  group.add(rearWall);
  // Left wall
  group.add(box(0.22, 3.5, 7.4, -3.25, 9.15, 4.8, IM.interiorWall));
  // Right wall
  group.add(box(0.22, 3.5, 7.4, 3.25, 9.15, 4.8, IM.interiorWall));

  // Front Wall with sliding glass balcony doors
  // Wall edges around opening
  group.add(box(1.5, 3.5, 0.25, -2.55, 9.15, 8.4, IM.interiorWall));
  group.add(box(1.5, 3.5, 0.25, 2.55, 9.15, 8.4, IM.interiorWall));
  group.add(box(3.6, 0.65, 0.25, 0, 10.65, 8.4, IM.interiorWall));
  // Large sliding glass door leading to 3rd floor arched balcony
  const balconyGlass = box(3.55, 2.8, 0.06, 0, 8.85, 8.4, M.glassClear);
  group.add(balconyGlass);
  group.add(box(0.05, 2.8, 0.08, 0, 8.85, 8.4, M.steelBlack, false));

  // Sheer White Linen Curtains draped along the sides of the balcony glass
  for (const cx of [-1.55, 1.55]) {
    const curtain = box(0.65, 2.8, 0.05, cx, 8.85, 8.25, IM.linenSheer);
    curtain.rotation.y = cx > 0 ? -0.15 : 0.15;
    group.add(curtain);
  }

  // 4. Giường Bục Gỗ Sồi Thông Minh (Raised Oak Platform Bed with Steps)
  const bedGroup = new THREE.Group();
  bedGroup.position.set(-1.6, 7.41, 3.6);

  // Main raised oak wood platform
  bedGroup.add(box(2.2, 0.44, 2.2, 0, 0.22, 0, M.woodWarm));
  // High oak wood headboard
  bedGroup.add(box(2.2, 0.75, 0.08, 0, 0.72, -1.06, M.woodWarm));

  // 2 Rounded steps up on the right side of the platform
  bedGroup.add(box(0.65, 0.22, 0.9, 1.35, 0.11, 0.3, M.woodWarm));
  bedGroup.add(box(0.65, 0.34, 0.6, 1.35, 0.17, -0.3, M.woodWarm));

  // Premium Double Mattress
  bedGroup.add(box(1.8, 0.26, 1.9, -0.1, 0.57, 0.05, IM.bedLinen));
  // Duvet fold blanket
  bedGroup.add(box(1.82, 0.06, 1.2, -0.1, 0.72, 0.4, IM.bedPillows));

  // 4 Pillows (2 white, 2 beige)
  const p1 = box(0.65, 0.14, 0.38, -0.6, 0.76, -0.75, IM.bedLinen);
  p1.rotation.x = 0.25;
  bedGroup.add(p1);
  const p2 = box(0.65, 0.14, 0.38, 0.4, 0.76, -0.75, IM.bedLinen);
  p2.rotation.x = 0.25;
  bedGroup.add(p2);
  const p3 = box(0.55, 0.12, 0.32, -0.6, 0.79, -0.55, IM.bedPillows);
  p3.rotation.x = 0.35;
  bedGroup.add(p3);
  const p4 = box(0.55, 0.12, 0.32, 0.4, 0.79, -0.55, IM.bedPillows);
  p4.rotation.x = 0.35;
  bedGroup.add(p4);

  // Cute Mushroom Bedside Lamp on Headboard Shelf
  const lamp = new THREE.Group();
  lamp.position.set(-0.95, 0.88, -0.95);
  lamp.add(cyl(0.04, 0.06, 0.18, 16, 0, 0.09, 0, M.whiteClean));
  lamp.add(cyl(0.14, 0.14, 0.09, 24, 0, 0.22, 0, IM.lampWarm, false));
  const lampLight = new THREE.PointLight(0xffecc2, 1.9, 3.8, 1.6);
  lampLight.position.set(0, 0.22, 0);
  lamp.add(lampLight);
  bedGroup.add(lamp);

  group.add(bedGroup);

  // 5. Bàn Làm Việc Liền Kề Chân Giường (Integrated Workspace Desk)
  const desk = new THREE.Group();
  desk.position.set(-1.6, 7.41, 5.25);
  // Oak desktop
  desk.add(box(1.3, 0.06, 0.6, 0, 0.72, 0, M.woodWarm));
  // Side support panels
  desk.add(box(0.06, 0.72, 0.6, -0.62, 0.36, 0, M.woodWarm));
  desk.add(box(0.06, 0.72, 0.6, 0.62, 0.36, 0, M.woodWarm));
  // Laptop on desk
  desk.add(box(0.32, 0.015, 0.22, 0, 0.758, 0, M.steelBlack));
  const screen = box(0.32, 0.2, 0.015, 0, 0.85, -0.1, M.steelBlack);
  screen.rotation.x = 0.2;
  desk.add(screen);
  // Coffee mug
  desk.add(cyl(0.04, 0.04, 0.08, 12, 0.35, 0.79, 0.05, M.whiteClean));

  // Modern Scandinavian Chair with White Curved Shell
  const deskChair = new THREE.Group();
  deskChair.position.set(0, 0, 0.55);
  deskChair.add(box(0.42, 0.04, 0.42, 0, 0.44, 0, M.whiteClean));
  deskChair.add(box(0.42, 0.36, 0.04, 0, 0.64, 0.2, M.whiteClean));
  for (const [lx, lz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) {
    deskChair.add(cyl(0.015, 0.012, 0.44, 8, lx, 0.22, lz, M.woodWarm));
  }
  desk.add(deskChair);
  group.add(desk);

  // 6. Tranh Canvas Nghệ Thuật Treo Tường (matching room_4_mua.png & longer-room.png)
  // Botanical Leaf Art Print (Circular)
  const art1 = cyl(0.26, 0.26, 0.03, 32, 0.4, 9.8, 1.28, IM.botanicalArt);
  art1.rotation.x = Math.PI / 2;
  group.add(art1);
  // Black Cat Art Print (Circular)
  const art2 = cyl(0.26, 0.26, 0.03, 32, 0.4, 9.15, 1.28, IM.catArt);
  art2.rotation.x = Math.PI / 2;
  group.add(art2);

  // 7. Giá Treo Quần Áo Gỗ & Túi Vải (Wood Coat Rack)
  const rack = new THREE.Group();
  rack.position.set(-3.12, 9.3, 3.2);
  rack.add(box(0.03, 0.12, 0.9, 0, 0, 0, M.woodWarm));
  for (let p = -0.3; p <= 0.3; p += 0.2) {
    rack.add(cyl(0.015, 0.015, 0.12, 8, 0.06, 0, p, M.woodDark));
  }
  // Hanging canvas tote bag
  rack.add(box(0.06, 0.45, 0.35, 0.08, -0.35, -0.1, IM.bedPillows));
  group.add(rack);

  // 8. Round Wool Rug on Oak Floor
  const rug = cyl(0.9, 0.9, 0.015, 32, 0.8, 7.42, 5.0, IM.bedPillows, false);
  group.add(rug);

  return group;
}

/* ------------------------------------------------------------------ */
/*  4. Street Scene: Details Inside the Alley                          */
/* ------------------------------------------------------------------ */

export function createStreetDetails(M) {
  const group = new THREE.Group();
  group.name = 'street_details';

  // 1. Standing Chalkboard Menu outside cafe gate
  const board = new THREE.Group();
  board.position.set(0.2, 0.15, 12.8);
  board.rotation.y = -0.35;
  // A-frame easel legs
  const leg1 = box(0.04, 0.95, 0.04, -0.25, 0.48, -0.15, M.woodDark);
  leg1.rotation.x = -0.18;
  board.add(leg1);
  const leg2 = box(0.04, 0.95, 0.04, 0.25, 0.48, -0.15, M.woodDark);
  leg2.rotation.x = -0.18;
  board.add(leg2);
  const leg3 = box(0.04, 0.95, 0.04, 0, 0.48, 0.2, M.woodDark);
  leg3.rotation.x = 0.25;
  board.add(leg3);
  // Black chalkboard
  const boardFace = box(0.55, 0.72, 0.03, 0, 0.52, -0.12, M.steelBlack);
  boardFace.rotation.x = -0.18;
  board.add(boardFace);
  // Wood frame
  const boardFrame = box(0.59, 0.76, 0.04, 0, 0.52, -0.12, M.woodWarm);
  boardFrame.rotation.x = -0.18;
  board.add(boardFrame);
  group.add(board);

  // 2. Outdoor Alley Bench & Stools under Bougainvillea
  const bench = box(0.9, 0.38, 0.32, -3.4, 0.34, 12.8, M.woodWarm);
  group.add(bench);
  group.add(box(0.32, 0.34, 0.32, -2.6, 0.32, 12.8, M.woodWarm));

  // 3. Overhead Cafe Festoon Fairy Lights criss-crossing the alley
  const festoonGroup = new THREE.Group();
  festoonGroup.position.set(0, 5.2, 15.0);
  const bulbGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd277 });
  for (let i = 0; i < 9; i++) {
    const bx = -5.0 + i * 1.25;
    const by = -Math.sin((i / 8) * Math.PI) * 0.45;
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(bx, by, (i % 2 === 0 ? 0.3 : -0.3));
    festoonGroup.add(bulb);
  }
  group.add(festoonGroup);

  return group;
}
