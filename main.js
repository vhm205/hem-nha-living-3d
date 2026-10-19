import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';
import {
  createInteriorMaterials,
  createCafeInterior,
  createAtriumInterior,
  createStudioInterior,
  createStreetDetails,
} from './interiors.js';

/* ==================================================================
   HẺM NHÀ LIVING — Procedural 3D Architectural Model in Three.js
   ------------------------------------------------------------------
   A boutique shophouse in a Saigon alleyway (Hẻm Sài Gòn):
     T1: Cafe sân vườn, quầy bar & giếng trời (Atrium)
     T2: Mezzanine với hệ lam chắn nắng so le hiện đại
     T3: Phòng Homestay với 2 ban công vòm & 2 cửa sổ con nhộng bông gió
     T4: Phòng Homestay lớn với 2 vòm cao rộng & trụ bông gió cây xanh
     T5: Rooftop Sky Terrace với pergola, bida, bi lắc, quầy bar ngắm phố
   ================================================================== */

const TAU = Math.PI * 2;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0x48656d4e);
const rnd = (a = 0, b = 1) => a + (b - a) * rand();

/* ------------------------------------------------------------------ */
/*  Renderer, Scene, Camera                                            */
/* ------------------------------------------------------------------ */

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const MAX_ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4f1ea);
scene.fog = new THREE.Fog(0xf4f1ea, 180, 480);

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.2, 1200);
camera.position.set(38, 30, 48);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 8.5, 2);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.rotateSpeed = 0.7;
controls.zoomSpeed = 0.85;
controls.panSpeed = 0.7;
controls.minDistance = 0.8;
controls.maxDistance = 240;
controls.minPolarAngle = 0.03;
controls.maxPolarAngle = 1.48;
controls.screenSpacePanning = true;
controls.autoRotateSpeed = 0.45;

/* ------------------------------------------------------------------ */
/*  Procedural Canvas Textures                                         */
/* ------------------------------------------------------------------ */

function makeCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = MAX_ANISO;
  return t;
}

function repeatTex(tex, x, y = null) {
  const t = tex.clone();
  t.needsUpdate = true;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(x, y === null ? x : y);
  t.anisotropy = MAX_ANISO;
  return t;
}

// 1. Vietnamese White Breeze Blocks (Gạch bông gió trắng)
const breezeBlockTex = makeCanvas(256, 256, (g, w, h) => {
  g.fillStyle = '#f6f5f0';
  g.fillRect(0, 0, w, h);
  const size = 64;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const x = c * size;
      const y = r * size;
      g.strokeStyle = '#dedad2';
      g.lineWidth = 3;
      g.strokeRect(x + 2, y + 2, size - 4, size - 4);
      // Perforation
      g.fillStyle = '#22252a';
      g.beginPath();
      g.arc(x + size / 2, y + size / 2, size * 0.27, 0, TAU);
      g.fill();
      g.strokeStyle = '#e6e3dc';
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(x + size / 2, y + size / 2, size * 0.36, 0, TAU);
      g.stroke();
    }
  }
});

// 2. Fluted / Ribbed Glass for balconies
const flutedGlassTex = makeCanvas(128, 256, (g, w, h) => {
  g.fillStyle = '#e8eff2';
  g.fillRect(0, 0, w, h);
  const ribW = 8;
  for (let x = 0; x < w; x += ribW) {
    const grad = g.createLinearGradient(x, 0, x + ribW, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0.75)');
    grad.addColorStop(0.5, 'rgba(180,205,215,0.25)');
    grad.addColorStop(1, 'rgba(120,150,165,0.65)');
    g.fillStyle = grad;
    g.fillRect(x, 0, ribW, h);
  }
});

// 3. Warm Terracotta Paving Tiles
const terracottaTileTex = makeCanvas(256, 256, (g, w, h) => {
  g.fillStyle = '#c77852';
  g.fillRect(0, 0, w, h);
  const tileSize = 64;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const x = c * tileSize;
      const y = r * tileSize;
      const tone = rnd(-14, 14);
      g.fillStyle = `rgb(${199 + tone},${120 + tone * 0.7},${82 + tone * 0.5})`;
      g.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      g.fillStyle = 'rgba(0,0,0,0.04)';
      for (let i = 0; i < 40; i++) {
        g.fillRect(x + rand() * tileSize, y + rand() * tileSize, rnd(1, 3), rnd(1, 3));
      }
    }
  }
  g.strokeStyle = '#dfd6c8';
  g.lineWidth = 3;
  for (let i = 0; i <= 4; i++) {
    g.beginPath(); g.moveTo(i * tileSize, 0); g.lineTo(i * tileSize, h); g.stroke();
    g.beginPath(); g.moveTo(0, i * tileSize); g.lineTo(w, i * tileSize); g.stroke();
  }
});

// 4. Warm Peach Stucco Wall (Hồng đất)
const peachStuccoTex = makeCanvas(256, 256, (g, w, h) => {
  g.fillStyle = '#dfa996';
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 3000; i++) {
    const v = rnd(-15, 15);
    g.fillStyle = `rgba(${v > 0 ? 255 : 90},${v > 0 ? 230 : 60},${v > 0 ? 210 : 50},${Math.abs(v) / 75})`;
    g.fillRect(rand() * w, rand() * h, rnd(1, 2.8), rnd(1, 2.8));
  }
});

// 5. Classic French-Colonial Shophouse Neighbor
const neighborClassicTex = makeCanvas(256, 512, (g, w, h) => {
  g.fillStyle = '#eee9de';
  g.fillRect(0, 0, w, h);
  for (let f = 1; f <= 3; f++) {
    const y = (f * h) / 3;
    g.fillStyle = '#dcd5c7';
    g.fillRect(0, y - 6, w, 12);
    for (const wx of [w * 0.25, w * 0.75]) {
      g.fillStyle = '#f8f5ee';
      g.fillRect(wx - 26, y - 110, 52, 90);
      g.fillStyle = '#405646';
      g.fillRect(wx - 22, y - 106, 44, 82);
      for (let ly = y - 104; ly < y - 26; ly += 6) {
        g.fillStyle = '#314236';
        g.fillRect(wx - 20, ly, 40, 2);
      }
    }
  }
});

// 6. Modern Townhouse Neighbor
const neighborModernTex = makeCanvas(256, 512, (g, w, h) => {
  g.fillStyle = '#e5dfd4';
  g.fillRect(0, 0, w, h);
  for (let f = 1; f <= 3; f++) {
    const y = (f * h) / 3;
    g.fillStyle = '#515961';
    g.fillRect(24, y - 90, w - 48, 68);
    g.fillStyle = '#2d333b';
    g.fillRect(28, y - 86, w - 56, 60);
    for (let x = 60; x < w - 40; x += 40) {
      g.fillStyle = '#dcd8cf';
      g.fillRect(x, y - 86, 3, 60);
    }
  }
});

// 7. Grass
const grassTex = makeCanvas(256, 256, (g, w, h) => {
  g.fillStyle = '#658d44';
  g.fillRect(0, 0, w, h);
  const tones = ['#577b38', '#6f9849', '#4d7331', '#7ca552'];
  for (let i = 0; i < 2200; i++) {
    g.fillStyle = tones[(rand() * tones.length) | 0];
    g.globalAlpha = rnd(0.2, 0.5);
    g.fillRect(rand() * w, rand() * h, rnd(0.8, 2.0), rnd(0.8, 2.5));
  }
  g.globalAlpha = 1;
});

// 8. Alley Stone Pavement
const alleyStoneTex = makeCanvas(256, 256, (g, w, h) => {
  g.fillStyle = '#d5cfc4';
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2500; i++) {
    const v = rnd(-18, 18);
    g.fillStyle = `rgba(${v > 0 ? 255 : 60},${v > 0 ? 250 : 55},${v > 0 ? 235 : 50},${Math.abs(v) / 65})`;
    g.fillRect(rand() * w, rand() * h, rnd(1, 3.5), rnd(1, 3.5));
  }
  g.strokeStyle = 'rgba(130,120,105,0.2)';
  g.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke();
    g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke();
  }
});

// 9. Neon Sign Canvas Texture
const neonSignTex = makeCanvas(512, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  // Warm glowing background
  g.fillStyle = 'rgba(255, 230, 190, 0.15)';
  g.fillRect(0, 0, w, h);
  // Coffee text
  g.font = 'bold 44px "Be Vietnam Pro", sans-serif';
  g.fillStyle = '#ffeed6';
  g.shadowColor = '#ffaa44';
  g.shadowBlur = 14;
  g.fillText('COFFEE', 40, 80);
  // Hem cursive script
  g.font = 'italic 62px "Cormorant Garamond", Georgia, serif';
  g.fillStyle = '#fff6ea';
  g.shadowColor = '#ff8822';
  g.shadowBlur = 18;
  g.fillText('Hẻm', 300, 86);
});

/* ------------------------------------------------------------------ */
/*  Materials                                                          */
/* ------------------------------------------------------------------ */

const M = {
  peachStucco: new THREE.MeshStandardMaterial({
    map: repeatTex(peachStuccoTex, 2, 4),
    roughness: 0.88,
    metalness: 0.02,
  }),
  peachSolid: new THREE.MeshStandardMaterial({ color: 0xdfa996, roughness: 0.86 }),
  breezeBlock: new THREE.MeshStandardMaterial({
    map: repeatTex(breezeBlockTex, 2, 2),
    roughness: 0.78,
  }),
  terracottaTile: new THREE.MeshStandardMaterial({
    map: repeatTex(terracottaTileTex, 2, 2),
    roughness: 0.84,
    side: THREE.DoubleSide,
  }),
  flutedGlass: new THREE.MeshPhysicalMaterial({
    map: repeatTex(flutedGlassTex, 4, 1),
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.72,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.3,
  }),
  glassClear: new THREE.MeshPhysicalMaterial({
    color: 0x3a4f5c,
    roughness: 0.06,
    metalness: 0.2,
    transparent: true,
    opacity: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.4,
  }),
  woodWarm: new THREE.MeshStandardMaterial({ color: 0xaa6e40, roughness: 0.75 }),
  woodDark: new THREE.MeshStandardMaterial({ color: 0x6e4324, roughness: 0.8 }),
  greenGate: new THREE.MeshStandardMaterial({ color: 0x8a9e8b, roughness: 0.72 }),
  greenFrame: new THREE.MeshStandardMaterial({ color: 0x3f5446, roughness: 0.75 }),
  whiteClean: new THREE.MeshStandardMaterial({ color: 0xf5f3ee, roughness: 0.82 }),
  whiteSoft: new THREE.MeshStandardMaterial({ color: 0xe8e4da, roughness: 0.88 }),
  steelBlack: new THREE.MeshStandardMaterial({ color: 0x24272c, roughness: 0.45, metalness: 0.65 }),
  metalBrass: new THREE.MeshStandardMaterial({ color: 0xd4a858, roughness: 0.35, metalness: 0.8 }),
  ivyGreen: new THREE.MeshStandardMaterial({ color: 0x3d662b, roughness: 0.92, flatShading: true }),
  flowerPink: new THREE.MeshStandardMaterial({ color: 0xe63974, roughness: 0.75 }),
  neonSign: new THREE.MeshBasicMaterial({
    map: neonSignTex,
    transparent: true,
    side: THREE.DoubleSide,
  }),
  neonWarm: new THREE.MeshBasicMaterial({ color: 0xffe2a3 }),
  windowGlow: new THREE.MeshBasicMaterial({ color: 0xffd995, transparent: true, opacity: 0 }),
  roomInterior: new THREE.MeshStandardMaterial({ color: 0xd0c4b2, roughness: 0.9 }),
  canopyPoly: new THREE.MeshPhysicalMaterial({
    color: 0xebf2f7,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
  }),
  neighborClassic: new THREE.MeshStandardMaterial({
    map: repeatTex(neighborClassicTex, 1, 1),
    roughness: 0.9,
  }),
  neighborModern: new THREE.MeshStandardMaterial({
    map: repeatTex(neighborModernTex, 1, 1),
    roughness: 0.88,
  }),
  grass: new THREE.MeshStandardMaterial({
    map: repeatTex(grassTex, 0.35, 0.35),
    roughness: 0.98,
    side: THREE.DoubleSide,
  }),
  alleyStone: new THREE.MeshStandardMaterial({
    map: repeatTex(alleyStoneTex, 0.4, 0.4),
    roughness: 0.92,
    side: THREE.DoubleSide,
  }),
  studioFloor: new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 1, metalness: 0 }),
  clay: new THREE.MeshStandardMaterial({ color: 0xf2f0e9, roughness: 0.95 }),
  clayGlass: new THREE.MeshStandardMaterial({ color: 0xcdc8bf, roughness: 0.75 }),
};

const IM = createInteriorMaterials(M);

/* ------------------------------------------------------------------ */
/*  Lighting & 4 Moments (Sớm Mai · Trưa Hè · Hoàng Hôn · Đêm Sao)     */
/* ------------------------------------------------------------------ */

const hemi = new THREE.HemisphereLight(0xeef5fc, 0x9c8f7a, 0.75);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffeedb, 2.85);
sun.position.set(40, 75, 45);
sun.target.position.set(0, 8, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 5;
sun.shadow.camera.far = 240;
sun.shadow.camera.left = -40;
sun.shadow.camera.right = 40;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -25;
sun.shadow.bias = -0.00035;
sun.shadow.normalBias = 0.45;
sun.shadow.radius = 2.0;
scene.add(sun);
scene.add(sun.target);

const fill = new THREE.DirectionalLight(0xdde9ff, 0.38);
fill.position.set(-45, 25, -35);
scene.add(fill);

const nightLightsGroup = new THREE.Group();
scene.add(nightLightsGroup);

const cafeNeonLight = new THREE.PointLight(0xffca85, 0, 16, 2);
cafeNeonLight.position.set(0, 3.8, 9.5);
nightLightsGroup.add(cafeNeonLight);

const rooftopFairyLight = new THREE.PointLight(0xffdf9a, 0, 22, 1.8);
rooftopFairyLight.position.set(0, 18.2, 0);
nightLightsGroup.add(rooftopFairyLight);

const TIME_CONFIGS = {
  morning: {
    bg: 0xf6f3ec,
    fog: 0xf6f3ec,
    hemiSky: 0xfff6ea,
    hemiGround: 0xa89982,
    hemiInt: 0.75,
    sunColor: 0xffe6cb,
    sunInt: 2.75,
    sunPos: [55, 45, 55],
    fillColor: 0xd6e5f5,
    fillInt: 0.35,
    neonInt: 0.2,
    fairyInt: 0.1,
    glowOpacity: 0.05,
    floorColor: 0xf6f3ec,
    bodyClass: 'morning-mode',
  },
  noon: {
    bg: 0xf4f1ea,
    fog: 0xf4f1ea,
    hemiSky: 0xeef5fc,
    hemiGround: 0x9c8f7a,
    hemiInt: 0.78,
    sunColor: 0xffeedb,
    sunInt: 2.85,
    sunPos: [40, 75, 45],
    fillColor: 0xdde9ff,
    fillInt: 0.38,
    neonInt: 0.0,
    fairyInt: 0.0,
    glowOpacity: 0.0,
    floorColor: 0xf4f1ea,
    bodyClass: '',
  },
  sunset: {
    bg: 0xfaede4,
    fog: 0xfaede4,
    hemiSky: 0xffc49e,
    hemiGround: 0x6e5246,
    hemiInt: 0.7,
    sunColor: 0xff8c42,
    sunInt: 3.4,
    sunPos: [65, 24, 45],
    fillColor: 0x8fa4b8,
    fillInt: 0.45,
    neonInt: 2.5,
    fairyInt: 1.8,
    glowOpacity: 0.45,
    floorColor: 0xfaede4,
    bodyClass: 'sunset-mode',
  },
  night: {
    bg: 0x16181d,
    fog: 0x16181d,
    hemiSky: 0x222b3d,
    hemiGround: 0x111317,
    hemiInt: 0.45,
    sunColor: 0x3d526e,
    sunInt: 0.55,
    sunPos: [-30, 45, 35],
    fillColor: 0x1e2638,
    fillInt: 0.28,
    neonInt: 5.2,
    fairyInt: 3.8,
    glowOpacity: 0.75,
    floorColor: 0x16181d,
    bodyClass: 'night-mode',
  },
};

let currentTime = 'noon';
function setTimeOfDay(timeKey) {
  const cfg = TIME_CONFIGS[timeKey];
  if (!cfg) return;
  currentTime = timeKey;

  document.body.className = cfg.bodyClass;
  document.querySelectorAll('[data-time]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.time === timeKey);
  });

  scene.background.setHex(cfg.bg);
  scene.fog.color.setHex(cfg.fog);

  hemi.color.setHex(cfg.hemiSky);
  hemi.groundColor.setHex(cfg.hemiGround);
  hemi.intensity = cfg.hemiInt;

  sun.color.setHex(cfg.sunColor);
  sun.intensity = cfg.sunInt;
  sun.position.set(...cfg.sunPos);

  fill.color.setHex(cfg.fillColor);
  fill.intensity = cfg.fillInt;

  cafeNeonLight.intensity = cfg.neonInt;
  rooftopFairyLight.intensity = cfg.fairyInt;

  M.windowGlow.opacity = cfg.glowOpacity;
  M.studioFloor.color.setHex(cfg.floorColor);
}

/* ------------------------------------------------------------------ */
/*  Geometry Helpers                                                   */
/* ------------------------------------------------------------------ */

function roundedRectShape(w, d, r, cx = 0, cz = 0) {
  r = Math.max(0.01, Math.min(r, w / 2, d / 2));
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const z0 = cz - d / 2;
  const z1 = cz + d / 2;
  const s = new THREE.Shape();
  s.moveTo(x0 + r, z0);
  s.lineTo(x1 - r, z0);
  s.absarc(x1 - r, z0 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x1, z1 - r);
  s.absarc(x1 - r, z1 - r, r, 0, Math.PI / 2, false);
  s.lineTo(x0 + r, z1);
  s.absarc(x0 + r, z1 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, z0 + r);
  s.absarc(x0 + r, z0 + r, r, Math.PI, Math.PI * 1.5, false);
  s.closePath();
  return s;
}

function ringShape(wOut, dOut, rOut, wIn, dIn, rIn, cx = 0, cz = 0) {
  const s = roundedRectShape(wOut, dOut, rOut, cx, cz);
  const hole = roundedRectShape(wIn, dIn, rIn, cx, cz);
  s.holes.push(hole);
  return s;
}

function flatShape(shape, material, y = 0, segments = 48) {
  const geo = new THREE.ShapeGeometry(shape, segments);
  geo.rotateX(-Math.PI / 2);
  geo.scale(1, 1, -1);
  geo.translate(0, y, 0);
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  return mesh;
}

function box(w, h, d, x, y, z, material, cast = true, receive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

function archMesh(width, height, thickness, radius, material) {
  const s = new THREE.Shape();
  const hw = width / 2;
  s.moveTo(-hw, 0);
  s.lineTo(-hw, height - radius);
  s.absarc(0, height - radius, radius, Math.PI, 0, true);
  s.lineTo(hw, 0);
  s.lineTo(hw + 0.35, 0);
  s.lineTo(hw + 0.35, height + 0.35);
  s.lineTo(-hw - 0.35, height + 0.35);
  s.lineTo(-hw - 0.35, 0);
  s.closePath();

  const extrude = new THREE.ExtrudeGeometry(s, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 32,
  });
  return new THREE.Mesh(extrude, material);
}

/* ------------------------------------------------------------------ */
/*  Site Base & Podium                                                 */
/* ------------------------------------------------------------------ */

const SITE = { w: 44, d: 46, r: 8 };
const site = new THREE.Group();
scene.add(site);

// Studio Plinth with soft beveled edge
{
  const shape = roundedRectShape(SITE.w, SITE.d, SITE.r);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.9,
    bevelEnabled: true,
    bevelThickness: 0.25,
    bevelSize: 0.25,
    bevelSegments: 3,
    curveSegments: 48,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingBox();
  geo.translate(0, -geo.boundingBox.max.y, 0);
  const plinth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xeeeae2, roughness: 0.88 }));
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  site.add(plinth);
}

// Lawn on top of plinth
site.add(flatShape(roundedRectShape(SITE.w - 1.8, SITE.d - 1.8, SITE.r - 0.9), M.grass, 0.05));

// White curb boundary
site.add(flatShape(ringShape(SITE.w, SITE.d, SITE.r, SITE.w - 2.0, SITE.d - 2.0, SITE.r - 1.0), M.whiteClean, 0.08));

// Alley street surface (Hẻm)
site.add(flatShape(roundedRectShape(32, 11, 2, 0, 16.5), M.alleyStone, 0.12));

// Alley entrance path connecting from street to building
site.add(flatShape(roundedRectShape(14, 5, 1, 0, 11.5), M.alleyStone, 0.14));

/* ------------------------------------------------------------------ */
/*  Building: Hẻm Nhà Living                                           */
/* ------------------------------------------------------------------ */

const BW = 7.2;   // Width (mặt tiền)
const BD = 18.0;  // Depth
const BH = 17.5;  // Total height (5 levels)
const BASE_Y = 0.15;
const FZ = BD / 2; // Front Z position = 9.0

const building = new THREE.Group();
scene.add(building);

// Main building body & Architectural Envelope
{
  const backDepth = BD - 1.4; // 16.6m (from Z = -9.0 to +7.6)
  const wallThick = 0.28;

  // 1. Left Exterior Wall
  building.add(box(wallThick, BH, backDepth, -BW / 2 + wallThick / 2, BASE_Y + BH / 2, -0.7, M.peachStucco));

  // 2. Right Exterior Wall
  building.add(box(wallThick, BH, backDepth, BW / 2 - wallThick / 2, BASE_Y + BH / 2, -0.7, M.peachStucco));

  // 3. Back Exterior Wall
  building.add(box(BW, BH, wallThick, 0, BASE_Y + BH / 2, -FZ + wallThick / 2, M.peachStucco));

  // 4. Floor Slabs between levels
  const innerW = BW - wallThick * 2;
  // Ground floor slab
  building.add(box(innerW, 0.2, backDepth, 0, BASE_Y + 0.1, -0.7, M.whiteClean));
  // Mezzanine slab (covers rear half Z: -9 to -1.0, leaves central atrium void open!)
  building.add(box(innerW, 0.2, 8.0, 0, BASE_Y + 3.8, -5.0, M.whiteClean));
  // 3rd Floor slab
  building.add(box(innerW, 0.2, backDepth, 0, BASE_Y + 7.2, -0.7, M.whiteClean));
  // 4th Floor slab
  building.add(box(innerW, 0.2, backDepth, 0, BASE_Y + 11.4, -0.7, M.whiteClean));
  // 5th Floor / Rooftop slab
  building.add(box(innerW, 0.25, backDepth, 0, BASE_Y + 15.2, -0.7, M.whiteClean));

  // Upper private enclosure for 4th and 5th floors back volume
  building.add(box(innerW, 6.0, 8.0, 0, BASE_Y + 10.2, -4.5, M.peachSolid));

  // Plinth base under building
  building.add(box(BW + 0.15, 0.35, BD + 0.15, 0, 0.175, 0, M.whiteClean));

  // Floor division cornices on sides and back
  for (const fy of [3.8, 7.2, 11.4, 15.2]) {
    building.add(box(BW + 0.25, 0.12, 0.15, 0, BASE_Y + fy, -FZ - 0.08, M.whiteClean));
    building.add(box(0.15, 0.12, BD + 0.25, -BW / 2 - 0.08, BASE_Y + fy, 0, M.whiteClean));
    building.add(box(0.15, 0.12, BD + 0.25, BW / 2 + 0.08, BASE_Y + fy, 0, M.whiteClean));
  }

  // 5. Add the 3 signature interior spaces inside the building
  const cafeInterior = createCafeInterior(IM, M);
  building.add(cafeInterior);

  const atriumInterior = createAtriumInterior(IM, M);
  building.add(atriumInterior);

  const studioInterior = createStudioInterior(IM, M);
  building.add(studioInterior);
}

// Add street atmosphere details into the alleyway
{
  const streetScene = createStreetDetails(M);
  site.add(streetScene);
}

/* ------------------------------------------------------------------ */
/*  Ground Floor: Front Courtyard, Gate, Breeze Fence & Cafe Entrance   */
/* ------------------------------------------------------------------ */

// Courtyard paved with rustic terracotta tiles
{
  const courtW = BW + 0.4;
  const courtD = 3.6;
  const courtZ = FZ + courtD / 2;
  building.add(flatShape(roundedRectShape(courtW, courtD, 0.3, 0, courtZ), M.terracottaTile, 0.18));

  // Steps down to alley
  building.add(box(courtW, 0.12, 0.5, 0, 0.12, courtZ + courtD / 2 + 0.25, M.whiteClean));
  building.add(box(courtW + 0.2, 0.08, 0.5, 0, 0.04, courtZ + courtD / 2 + 0.7, M.whiteClean));
}

// 1. Organic Curved Entrance Arch & Sage Gate (Right Side)
{
  const gateX = 1.6;
  const gateZ = FZ + 3.2;

  const archGroup = new THREE.Group();
  archGroup.position.set(gateX, BASE_Y, gateZ);

  // Curved entrance portal wall
  const archOuter = box(2.6, 3.2, 0.25, 0, 1.6, 0, M.peachSolid);
  archGroup.add(archOuter);

  // Opening cutout frame
  const portalFrame = box(2.1, 2.7, 0.28, 0, 1.35, 0, M.greenGate, false);
  archGroup.add(portalFrame);

  // Sage green slatted gate doors
  for (const gx of [-0.6, 0.6]) {
    const gateDoor = box(0.9, 1.8, 0.06, gx, 0.9, 0, M.greenGate);
    archGroup.add(gateDoor);
    for (let sy = 0.2; sy < 1.7; sy += 0.14) {
      archGroup.add(box(0.82, 0.03, 0.08, gx, sy, 0, M.whiteClean, false));
    }
  }

  // Curved planter at base of entrance wall
  const planterCurved = box(1.0, 0.45, 0.8, -1.2, 0.22, 0.4, M.peachSolid);
  archGroup.add(planterCurved);
  for (let i = 0; i < 4; i++) {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), M.ivyGreen);
    leaf.scale.set(1.2, 0.8, 1);
    leaf.position.set(-1.2 + rnd(-0.2, 0.2), 0.55 + rnd(0, 0.15), 0.4 + rnd(-0.2, 0.2));
    leaf.castShadow = true;
    archGroup.add(leaf);
  }

  building.add(archGroup);
}

// 2. White Breeze Block Fence Wall (Left Side)
{
  const fenceW = 3.6;
  const fenceH = 1.75;
  const fenceX = -1.8;
  const fenceZ = FZ + 3.2;

  const fence = box(fenceW, fenceH, 0.2, fenceX, BASE_Y + fenceH / 2, fenceZ, M.breezeBlock);
  building.add(fence);
  building.add(box(fenceW + 0.1, 0.08, 0.26, fenceX, BASE_Y + fenceH + 0.04, fenceZ, M.whiteClean));

  for (let px = fenceX - 1.4; px <= fenceX + 1.4; px += 0.7) {
    const pMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), M.ivyGreen);
    pMesh.scale.set(1.1, 0.7, 1);
    pMesh.position.set(px, BASE_Y + 0.25, fenceZ + 0.2);
    pMesh.castShadow = true;
    building.add(pMesh);
  }
}

// 3. Cafe Storefront (Set back at building facade line FZ)
{
  const cafeY = BASE_Y;

  // Left side: Glass coffee display box with wood frame
  const glassW = 3.2;
  const glassH = 2.8;
  const glassX = -1.8;

  building.add(box(glassW, 0.12, 0.3, glassX, cafeY + 0.06, FZ + 0.15, M.woodWarm));
  building.add(box(glassW, 0.12, 0.3, glassX, cafeY + glassH, FZ + 0.15, M.woodWarm));
  building.add(box(0.12, glassH, 0.3, glassX - glassW / 2, cafeY + glassH / 2, FZ + 0.15, M.woodWarm));
  building.add(box(0.12, glassH, 0.3, glassX + glassW / 2, cafeY + glassH / 2, FZ + 0.15, M.woodWarm));

  building.add(box(glassW - 0.1, glassH - 0.1, 0.05, glassX, cafeY + glassH / 2, FZ + 0.15, M.glassClear, false));
  building.add(box(glassW + 0.2, 0.4, 0.6, glassX, cafeY + 0.2, FZ + 0.45, M.whiteClean));

  // Warm interior glow plane behind cafe window
  const cafeGlow = new THREE.Mesh(new THREE.PlaneGeometry(glassW - 0.2, glassH - 0.2), M.windowGlow);
  cafeGlow.position.set(glassX, cafeY + glassH / 2, FZ - 0.1);
  building.add(cafeGlow);

  // Indoor tree visible through glass
  const indoorTree = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), M.ivyGreen);
  indoorTree.position.set(glassX + 0.2, cafeY + 1.8, FZ - 0.8);
  indoorTree.scale.set(0.9, 1.4, 0.9);
  building.add(indoorTree);
  building.add(box(0.1, 1.8, 0.1, glassX + 0.2, cafeY + 0.9, FZ - 0.8, M.woodDark));

  // Projecting "WELCOME" blade sign
  const welcomeSign = box(0.45, 0.3, 0.04, glassX + glassW / 2 + 0.25, cafeY + glassH - 0.3, FZ + 0.3, M.whiteClean);
  building.add(welcomeSign);

  // Right side: Main wooden double doors with breeze block transom
  const doorW = 3.0;
  const doorH = 2.4;
  const doorX = 1.7;

  building.add(box(doorW + 0.2, doorH + 0.7, 0.15, doorX, cafeY + (doorH + 0.7) / 2, FZ + 0.08, M.greenFrame));
  building.add(box(doorW, 0.55, 0.18, doorX, cafeY + doorH + 0.28, FZ + 0.1, M.breezeBlock));
  building.add(box(doorW - 0.1, doorH, 0.08, doorX, cafeY + doorH / 2, FZ + 0.1, M.woodDark));

  // Hanging green ivy / planter box over the coffee entrance
  const planterLedge = box(BW + 0.2, 0.35, 0.45, 0, cafeY + 3.4, FZ + 0.25, M.peachSolid);
  building.add(planterLedge);
  const vines = box(BW + 0.3, 0.55, 0.3, 0, cafeY + 3.25, FZ + 0.4, M.ivyGreen);
  building.add(vines);

  // "COFFEE Hẻm" Glowing Neon Signboard (Textured canvas mesh)
  const neonSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), M.neonSign);
  neonSignMesh.position.set(0, cafeY + 3.65, FZ + 0.42);
  building.add(neonSignMesh);

  // Brass sconces
  for (const sx of [-BW / 2 + 0.4, BW / 2 - 0.4]) {
    const sconce = box(0.12, 0.3, 0.2, sx, cafeY + 2.4, FZ + 0.25, M.metalBrass);
    building.add(sconce);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), M.neonWarm);
    bulb.position.set(sx, cafeY + 2.3, FZ + 0.35);
    building.add(bulb);
  }
}

/* ------------------------------------------------------------------ */
/*  Floor 2 (Mezzanine): Architectural White Staggered Louver Screen   */
/* ------------------------------------------------------------------ */

{
  const mY = BASE_Y + 3.8;
  const mH = 3.2;

  // Solid room cavity behind
  building.add(box(BW - 0.4, mH, 1.4, 0, mY + mH / 2, FZ - 0.7, M.roomInterior));
  building.add(box(BW - 0.6, mH - 0.3, 0.1, 0, mY + mH / 2, FZ - 0.15, M.glassClear, false));

  // Warm glow plane behind mezzanine screen
  const mezGlow = new THREE.Mesh(new THREE.PlaneGeometry(BW - 0.8, mH - 0.4), M.windowGlow);
  mezGlow.position.set(0, mY + mH / 2, FZ - 0.2);
  building.add(mezGlow);

  const cols = 9;
  for (let i = 0; i < cols; i++) {
    const x = -BW / 2 + 0.6 + (i * (BW - 1.2)) / (cols - 1);
    building.add(box(0.06, mH, 0.08, x, mY + mH / 2, FZ + 0.12, M.whiteClean));
  }

  const louverRows = 6;
  for (let r = 0; r < louverRows; r++) {
    const y = mY + 0.4 + (r * (mH - 0.8)) / (louverRows - 1);
    const segs = r % 2 === 0 ? [[-2.5, 1.6], [-0.5, 1.8], [1.5, 1.4]] : [[-1.8, 2.0], [0.6, 2.2]];
    for (const [cx, lw] of segs) {
      building.add(box(lw, 0.06, 0.22, cx, y, FZ + 0.2, M.whiteClean));
    }
  }

  building.add(box(BW + 0.2, 0.22, 0.28, 0, mY + mH, FZ + 0.15, M.whiteClean));
}

/* ------------------------------------------------------------------ */
/*  Floor 3: Two Deep Arched Balconies + Center Pill Breeze Windows    */
/* ------------------------------------------------------------------ */

{
  const f3Y = BASE_Y + 7.2;
  const f3H = 4.0;
  const archW = 2.4;
  const archH = 3.3;
  const archRad = 1.2;

  // Solid side pillars on Floor 3
  building.add(box(0.7, f3H, 1.4, -BW / 2 + 0.35, f3Y + f3H / 2, FZ - 0.7, M.peachSolid));
  building.add(box(0.7, f3H, 1.4, BW / 2 - 0.35, f3Y + f3H / 2, FZ - 0.7, M.peachSolid));
  // Center solid wall between the two balconies
  building.add(box(1.4, f3H, 1.4, 0, f3Y + f3H / 2, FZ - 0.7, M.peachSolid));

  for (const sign of [-1, 1]) {
    const bx = sign * 2.2;

    // Deep recessed balcony floor
    building.add(box(archW, 0.15, 1.4, bx, f3Y + 0.08, FZ - 0.7, M.terracottaTile));
    // Back wall of the recessed balcony
    building.add(box(archW, f3H, 0.15, bx, f3Y + f3H / 2, FZ - 1.4, M.roomInterior));

    // Arched portal frame at front edge
    const archPortal = archMesh(archW, archH, 0.22, archRad, M.peachSolid);
    archPortal.position.set(bx, f3Y + 0.1, FZ - 0.1);
    building.add(archPortal);

    // Fluted glass balustrade
    const balustradeH = 0.95;
    building.add(box(archW - 0.1, balustradeH - 0.1, 0.06, bx, f3Y + balustradeH / 2, FZ + 0.08, M.flutedGlass, false));
    building.add(box(archW + 0.05, 0.08, 0.12, bx, f3Y + balustradeH, FZ + 0.08, M.woodWarm));

    for (let px = bx - 0.95; px <= bx + 0.95; px += 0.3) {
      building.add(box(0.04, balustradeH, 0.04, px, f3Y + balustradeH / 2, FZ + 0.05, M.woodDark));
    }

    // Balcony doors inside the recess
    building.add(box(archW - 0.2, archH - 0.4, 0.06, bx, f3Y + (archH - 0.4) / 2 + 0.1, FZ - 1.3, M.glassClear, false));
    building.add(box(0.08, archH - 0.4, 0.08, bx, f3Y + (archH - 0.4) / 2 + 0.1, FZ - 1.28, M.greenFrame));

    // Warm room glow inside
    const roomGlow = new THREE.Mesh(new THREE.PlaneGeometry(archW - 0.4, archH - 0.6), M.windowGlow);
    roomGlow.position.set(bx, f3Y + archH / 2, FZ - 1.35);
    building.add(roomGlow);
  }

  // Center Feature: Two Tall Capsule / Pill-Shaped Windows with Breeze Blocks
  for (const cx of [-0.42, 0.42]) {
    const pillW = 0.65;
    const pillH = 2.4;
    const pillY = f3Y + 1.4;

    building.add(box(pillW, pillH, 0.35, cx, pillY, FZ - 0.05, M.peachSolid));
    building.add(box(pillW - 0.06, pillH - 0.2, 0.12, cx, pillY, FZ - 0.02, M.breezeBlock));

    const capTop = new THREE.Mesh(new THREE.CylinderGeometry(pillW / 2, pillW / 2, 0.15, 16, 1, false, 0, Math.PI), M.peachSolid);
    capTop.rotation.z = Math.PI;
    capTop.position.set(cx, pillY + pillH / 2 - 0.05, FZ + 0.02);
    building.add(capTop);

    const plant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), M.ivyGreen);
    plant.position.set(cx, pillY - pillH / 2 + 0.35, FZ + 0.12);
    plant.scale.set(1.2, 0.8, 1);
    building.add(plant);
  }

  building.add(box(BW + 0.2, 0.22, 0.28, 0, f3Y + f3H, FZ + 0.15, M.whiteClean));
}

/* ------------------------------------------------------------------ */
/*  Floor 4: Two Grand Arches + Center Breeze Column                   */
/* ------------------------------------------------------------------ */

{
  const f4Y = BASE_Y + 11.4;
  const f4H = 3.8;
  const grandArchW = 3.1;
  const grandArchH = 3.5;
  const grandArchRad = 1.55;

  // Solid side pillars on Floor 4
  building.add(box(0.5, f4H, 1.4, -BW / 2 + 0.25, f4Y + f4H / 2, FZ - 0.7, M.peachSolid));
  building.add(box(0.5, f4H, 1.4, BW / 2 - 0.25, f4Y + f4H / 2, FZ - 0.7, M.peachSolid));

  for (const sign of [-1, 1]) {
    const gx = sign * 1.85;

    // Recessed balcony floor & back wall
    building.add(box(grandArchW, 0.15, 1.4, gx, f4Y + 0.08, FZ - 0.7, M.terracottaTile));
    building.add(box(grandArchW, f4H, 0.15, gx, f4Y + f4H / 2, FZ - 1.4, M.roomInterior));

    // Grand Arch Portal at front
    const archPortal = archMesh(grandArchW, grandArchH, 0.22, grandArchRad, M.peachSolid);
    archPortal.position.set(gx, f4Y + 0.1, FZ - 0.1);
    building.add(archPortal);

    // Fluted glass balustrade
    const balustradeH = 0.95;
    building.add(box(grandArchW - 0.1, balustradeH - 0.1, 0.06, gx, f4Y + balustradeH / 2, FZ + 0.08, M.flutedGlass, false));
    building.add(box(grandArchW + 0.05, 0.08, 0.12, gx, f4Y + balustradeH, FZ + 0.08, M.woodWarm));

    for (let px = gx - 1.3; px <= gx + 1.3; px += 0.32) {
      building.add(box(0.04, balustradeH, 0.04, px, f4Y + balustradeH / 2, FZ + 0.05, M.woodDark));
    }

    // Glass curtain wall set back
    building.add(box(grandArchW - 0.2, grandArchH - 0.3, 0.06, gx, f4Y + (grandArchH - 0.3) / 2 + 0.1, FZ - 1.3, M.glassClear, false));

    const roomGlow4 = new THREE.Mesh(new THREE.PlaneGeometry(grandArchW - 0.4, grandArchH - 0.5), M.windowGlow);
    roomGlow4.position.set(gx, f4Y + grandArchH / 2, FZ - 1.35);
    building.add(roomGlow4);
  }

  // Center divider column with Breeze Blocks & Vertical Vine
  building.add(box(0.55, f4H - 0.2, 0.25, 0, f4Y + f4H / 2, FZ + 0.05, M.breezeBlock));
  for (let vy = f4Y + 0.8; vy < f4Y + f4H - 0.4; vy += 0.7) {
    const vineCluster = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 1), M.ivyGreen);
    vineCluster.position.set(rnd(-0.1, 0.1), vy, FZ + 0.18);
    vineCluster.scale.set(0.9, 1.2, 0.7);
    building.add(vineCluster);
  }
}

/* ------------------------------------------------------------------ */
/*  Rooftop Sky Terrace (Floor 5): Pergola, Bida, Bi Lắc, Bar Counter */
/* ------------------------------------------------------------------ */

{
  const roofY = BASE_Y + BH;

  building.add(flatShape(roundedRectShape(BW + 0.3, BD + 0.3, 0.3), M.terracottaTile, roofY + 0.06));

  const pH = 1.1;
  const pT = 0.22;
  building.add(box(BW, pH, pT, 0, roofY + pH / 2, FZ - pT / 2, M.peachSolid));
  building.add(box(BW, pH, pT, 0, roofY + pH / 2, -FZ + pT / 2, M.peachSolid));
  building.add(box(pT, pH, BD, -BW / 2 + pT / 2, roofY + pH / 2, 0, M.peachSolid));
  building.add(box(pT, pH, BD, BW / 2 - pT / 2, roofY + pH / 2, 0, M.peachSolid));

  // Front Parapet: Overflowing lush green planters
  const roofPlanter = box(BW + 0.1, 0.45, 0.4, 0, roofY + pH + 0.15, FZ + 0.08, M.ivyGreen);
  building.add(roofPlanter);
  for (let vx = -BW / 2 + 0.5; vx <= BW / 2 - 0.5; vx += 0.6) {
    const vineDrop = box(0.45, rnd(0.6, 1.4), 0.15, vx, roofY + pH - rnd(0.2, 0.6), FZ + 0.16, M.ivyGreen);
    building.add(vineDrop);
  }

  // Modern Steel Pergola
  const pergH = 2.85;
  const pergW = BW - 0.8;
  const pergD = 10.5;
  const pergZ = -1.0;

  const colPositions = [
    [-pergW / 2, pergZ - pergD / 2],
    [pergW / 2, pergZ - pergD / 2],
    [-pergW / 2, pergZ],
    [pergW / 2, pergZ],
    [-pergW / 2, pergZ + pergD / 2],
    [pergW / 2, pergZ + pergD / 2],
  ];
  for (const [px, pz] of colPositions) {
    building.add(box(0.14, pergH, 0.14, px, roofY + pergH / 2, pz, M.steelBlack));
  }

  for (const pz of [pergZ - pergD / 2, pergZ, pergZ + pergD / 2]) {
    building.add(box(pergW + 0.3, 0.14, 0.12, 0, roofY + pergH, pz, M.steelBlack));
  }
  for (const px of [-pergW / 2, pergW / 2]) {
    building.add(box(0.12, 0.14, pergD + 0.3, px, roofY + pergH, pergZ, M.steelBlack));
  }

  // Translucent roof canopy
  const canopy = box(pergW + 0.6, 0.06, pergD + 0.6, 0, roofY + pergH + 0.08, pergZ, M.canopyPoly, false);
  canopy.rotation.x = 0.02;
  building.add(canopy);

  // String fairy lights
  for (let i = 0; i <= 6; i++) {
    const lz = pergZ - pergD / 2 + (i * pergD) / 6;
    for (const lx of [-pergW / 2 + 0.2, 0, pergW / 2 - 0.2]) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), M.neonWarm);
      bulb.position.set(lx, roofY + pergH - 0.2, lz);
      building.add(bulb);
    }
  }

  // 1. Foosball Table (Bi Lắc)
  {
    const fbX = 0;
    const fbZ = pergZ + 1.2;
    building.add(box(1.4, 0.4, 0.8, fbX, roofY + 0.75, fbZ, M.woodWarm));
    building.add(box(1.25, 0.04, 0.65, fbX, roofY + 0.9, fbZ, M.ivyGreen));
    for (const [lx, lz] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) {
      building.add(box(0.08, 0.6, 0.08, fbX + lx, roofY + 0.3, fbZ + lz, M.steelBlack));
    }
    for (let r = -0.45; r <= 0.45; r += 0.3) {
      building.add(box(0.03, 0.03, 1.1, fbX + r, roofY + 0.98, fbZ, M.steelBlack));
    }
  }

  // 2. Billiards Table (Bida)
  {
    const biX = 0;
    const biZ = pergZ - 2.8;
    building.add(box(1.8, 0.35, 1.0, biX, roofY + 0.72, biZ, M.woodDark));
    building.add(box(1.6, 0.05, 0.8, biX, roofY + 0.88, biZ, M.ivyGreen));
    for (const [lx, lz] of [[-0.75, -0.4], [0.75, -0.4], [-0.75, 0.4], [0.75, 0.4]]) {
      building.add(box(0.12, 0.58, 0.12, biX + lx, roofY + 0.29, biZ + lz, M.woodDark));
    }
    building.add(box(0.8, 0.15, 0.3, biX, roofY + 2.1, biZ, M.steelBlack));
    const poolLight = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.2, 12, 1, true), M.steelBlack);
    poolLight.position.set(biX, roofY + 1.95, biZ);
    building.add(poolLight);
  }

  // 3. Skyline Bar Counter
  {
    const barZ = FZ - 1.2;
    building.add(box(BW - 2.0, 0.08, 0.55, 0, roofY + 1.05, barZ, M.woodWarm));
    building.add(box(BW - 2.2, 1.0, 0.4, 0, roofY + 0.5, barZ, M.whiteClean));
    for (const bx of [-1.8, -0.9, 0, 0.9, 1.8]) {
      building.add(box(0.06, 0.75, 0.06, bx, roofY + 0.37, barZ + 0.55, M.steelBlack));
      building.add(box(0.35, 0.06, 0.35, bx, roofY + 0.76, barZ + 0.55, M.terracottaTile));
    }
  }

  // 4. Low Coffee Tables & Chairs
  for (const [cx, cz] of [[-2.2, pergZ + 3.4], [2.2, pergZ + 3.4]]) {
    building.add(box(0.8, 0.42, 0.8, cx, roofY + 0.21, cz, M.woodWarm));
    building.add(box(0.45, 0.38, 0.45, cx - 0.65, roofY + 0.25, cz, M.steelBlack));
    building.add(box(0.45, 0.38, 0.45, cx + 0.65, roofY + 0.25, cz, M.steelBlack));
  }

  // 5. Potted Plants on Rooftop
  for (const [px, pz] of [
    [-2.8, pergZ - 4.2], [2.8, pergZ - 4.2],
    [-2.8, pergZ], [2.8, pergZ],
    [-2.8, FZ - 2.0], [2.8, FZ - 2.0]
  ]) {
    building.add(box(0.45, 0.4, 0.45, px, roofY + 0.2, pz, M.peachSolid));
    const pMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), M.ivyGreen);
    pMesh.scale.set(1.0, 1.2, 1.0);
    pMesh.position.set(px, roofY + 0.6, pz);
    pMesh.castShadow = true;
    building.add(pMesh);
  }

  // Staircase penthouse
  building.add(box(2.8, 2.5, 3.2, -1.8, roofY + 1.25, -FZ + 2.2, M.peachStucco));
  building.add(box(3.0, 0.12, 3.4, -1.8, roofY + 2.56, -FZ + 2.2, M.whiteClean));
  building.add(box(0.8, 1.8, 0.06, -1.8, roofY + 0.9, -FZ + 3.83, M.greenFrame));

  // Stainless water tank
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.4, 16), M.steelBlack);
  tank.rotation.z = Math.PI / 2;
  tank.position.set(1.8, roofY + 0.9, -FZ + 2.2);
  building.add(tank);
}

/* ------------------------------------------------------------------ */
/*  Neighboring Shophouses (Nhà phố lân cận trong Hẻm)                 */
/* ------------------------------------------------------------------ */

// Left Neighbor: Classic French-Colonial townhouse
{
  const nW = 7.0;
  const nD = BD - 1.0;
  const nH = 14.5;
  const nX = -BW / 2 - nW / 2 - 0.05;
  const nZ = -0.5;

  const nMesh = box(nW, nH, nD, nX, BASE_Y + nH / 2, nZ, M.neighborClassic);
  scene.add(nMesh);
  scene.add(box(nW + 0.3, 0.25, nD + 0.3, nX, BASE_Y + nH, nZ, M.whiteClean));
  scene.add(box(nW + 0.2, 0.7, 0.2, nX, BASE_Y + nH + 0.35, nZ + nD / 2, M.whiteClean));
}

// Right Neighbor: Contemporary Saigon townhouse
{
  const nW = 6.5;
  const nD = BD - 2.0;
  const nH = 11.8;
  const nX = BW / 2 + nW / 2 + 0.05;
  const nZ = -1.0;

  const nMesh2 = box(nW, nH, nD, nX, BASE_Y + nH / 2, nZ, M.neighborModern);
  scene.add(nMesh2);
  scene.add(box(nW + 0.2, 0.8, nD + 0.2, nX, BASE_Y + nH + 0.4, nZ, M.whiteClean));
}

/* ------------------------------------------------------------------ */
/*  Alley Life: Bougainvillea, Streetlamp, Scooter & Sidewalk Cafe     */
/* ------------------------------------------------------------------ */

// 1. Vibrant Pink Bougainvillea (Hoa giấy hồng)
{
  const bgX = -BW / 2 - 0.8;
  const bgZ = FZ + 3.8;

  scene.add(box(0.9, 0.75, 0.9, bgX, BASE_Y + 0.37, bgZ, M.whiteClean));
  scene.add(box(0.12, 1.8, 0.12, bgX, BASE_Y + 0.9, bgZ, M.woodDark));

  const bLeaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), M.ivyGreen);
  bLeaf.position.set(bgX, BASE_Y + 2.0, bgZ);
  bLeaf.scale.set(1.1, 1.3, 1.1);
  scene.add(bLeaf);

  const flowerGeo = new THREE.IcosahedronGeometry(0.12, 0);
  const flowerMat = M.flowerPink;
  const flowerCount = 36;
  const flowerMesh = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < flowerCount; i++) {
    const fx = bgX + rnd(-0.8, 0.8);
    const fy = BASE_Y + 1.6 + rnd(0, 1.2);
    const fz = bgZ + rnd(-0.8, 0.8);
    m4.setPosition(fx, fy, fz);
    flowerMesh.setMatrixAt(i, m4);
  }
  flowerMesh.instanceMatrix.needsUpdate = true;
  scene.add(flowerMesh);
}

// 2. Vintage Alley Streetlamp
{
  const lampX = 4.8;
  const lampZ = FZ + 4.2;

  scene.add(box(0.14, 4.2, 0.14, lampX, BASE_Y + 2.1, lampZ, M.steelBlack));
  scene.add(box(0.8, 0.08, 0.08, lampX - 0.35, BASE_Y + 4.2, lampZ, M.steelBlack));
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.4, 6), M.steelBlack);
  lantern.position.set(lampX - 0.75, BASE_Y + 4.0, lampZ);
  scene.add(lantern);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), M.neonWarm);
  bulb.position.set(lampX - 0.75, BASE_Y + 3.82, lampZ);
  scene.add(bulb);
}

// 3. Vintage Scooter (Vespa / Cub)
{
  const scX = 3.6;
  const scZ = FZ + 2.4;
  const scGroup = new THREE.Group();
  scGroup.position.set(scX, BASE_Y + 0.15, scZ);
  scGroup.rotation.y = 0.35;

  scGroup.add(box(0.35, 0.4, 0.9, 0, 0.35, 0, M.greenGate));
  scGroup.add(box(0.28, 0.1, 0.55, 0, 0.6, -0.05, M.woodDark));
  const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const w1 = new THREE.Mesh(wheelGeo, M.steelBlack);
  w1.position.set(0, 0.2, 0.4);
  const w2 = new THREE.Mesh(wheelGeo, M.steelBlack);
  w2.position.set(0, 0.2, -0.4);
  scGroup.add(w1, w2);
  scGroup.add(box(0.55, 0.05, 0.05, 0, 0.8, 0.35, M.steelBlack));
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), M.neonWarm);
  light.position.set(0, 0.8, 0.42);
  scGroup.add(light);

  scene.add(scGroup);
}

// 4. Sidewalk Cafe Stools & Low Table
{
  const stX = -4.2;
  const stZ = FZ + 2.6;
  scene.add(box(0.65, 0.48, 0.65, stX, BASE_Y + 0.24, stZ, M.woodWarm));
  scene.add(box(0.3, 0.28, 0.3, stX - 0.55, BASE_Y + 0.14, stZ, M.woodDark));
  scene.add(box(0.3, 0.28, 0.3, stX + 0.55, BASE_Y + 0.14, stZ, M.woodDark));
}

/* ------------------------------------------------------------------ */
/*  Landscaping & Perimeter Tropical Trees                             */
/* ------------------------------------------------------------------ */

const treeSpots = [
  [-16, 12, 1.1],
  [-17, 0, 1.2],
  [-16, -12, 1.0],
  [16, 12, 1.1],
  [17, 0, 1.2],
  [16, -12, 1.0],
  [-10, -18, 0.95],
  [10, -18, 0.95],
  [0, -19, 1.05],
];

const trunkGeo = new THREE.CylinderGeometry(0.18, 0.32, 2.8, 6);
trunkGeo.translate(0, 1.4, 0);
const blobs = [
  new THREE.IcosahedronGeometry(1.6, 1).scale(1, 0.95, 1).translate(0, 3.8, 0),
  new THREE.IcosahedronGeometry(1.2, 1).scale(1, 0.9, 1).translate(-1.1, 3.2, 0.3),
  new THREE.IcosahedronGeometry(1.3, 1).scale(1, 0.9, 1).translate(1.1, 3.3, -0.2),
  new THREE.IcosahedronGeometry(1.0, 1).scale(1, 0.95, 1).translate(0.2, 4.6, 0.1),
];
const leafGeo = mergeGeometries(blobs);
leafGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(leafGeo.attributes.position.count * 3).fill(1), 3));

const treeTrunks = new THREE.InstancedMesh(trunkGeo, M.woodDark, treeSpots.length);
const treeLeaves = new THREE.InstancedMesh(leafGeo, M.ivyGreen, treeSpots.length);
treeTrunks.castShadow = true;
treeTrunks.receiveShadow = true;
treeLeaves.castShadow = true;
treeLeaves.receiveShadow = true;

{
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const col = new THREE.Color();
  treeSpots.forEach(([x, z, s], i) => {
    q.setFromAxisAngle(up, rnd(0, TAU));
    pos.set(x, 0.05, z);
    scl.set(s, s * rnd(0.92, 1.08), s);
    m4.compose(pos, q, scl);
    treeTrunks.setMatrixAt(i, m4);
    treeLeaves.setMatrixAt(i, m4);
    col.setHSL(0.26 + rnd(-0.02, 0.02), 0.46, 0.22 + rnd(0, 0.08), THREE.SRGBColorSpace);
    treeLeaves.setColorAt(i, col);
  });
  treeTrunks.instanceMatrix.needsUpdate = true;
  treeLeaves.instanceMatrix.needsUpdate = true;
  if (treeLeaves.instanceColor) treeLeaves.instanceColor.needsUpdate = true;
  scene.add(treeTrunks, treeLeaves);
}

/* ------------------------------------------------------------------ */
/*  Studio Floor                                                       */
/* ------------------------------------------------------------------ */

{
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), M.studioFloor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.1;
  floor.receiveShadow = true;
  scene.add(floor);
}

/* ------------------------------------------------------------------ */
/*  Camera Presets & Frame-Rate Independent Tweening                   */
/* ------------------------------------------------------------------ */

const VIEWS = {
  // Ngoại thất
  hero: { pos: [38, 30, 48], target: [0, 8.5, 2], fov: 30 },
  front: { pos: [0, 9.5, 46], target: [0, 9.5, 2], fov: 27 },
  top: { pos: [0.01, 68, 2.01], target: [0, 0, 2], fov: 30 },
  rooftop: { pos: [10, 27, 10], target: [0, 18.0, 0], fov: 34 },
  entrance: { pos: [1.8, 3.2, 21], target: [0, 2.4, 9], fov: 32 },

  // Không gian bên trong Hẻm Home
  cafe: { pos: [2.0, 2.1, 7.2], target: [-1.0, 1.6, 4.0], fov: 52 },
  atrium: { pos: [2.0, 1.8, 0.6], target: [-1.0, 2.8, -2.0], fov: 58 },
  studio: { pos: [1.5, 8.8, 7.2], target: [-1.4, 8.3, 3.8], fov: 52 },
  street: { pos: [1.2, 1.6, 21.5], target: [0, 2.4, 9.0], fov: 46 },
};

const VIEW_METAS = {
  hero: { k1: 'Công trình', v1: '5 tầng · 18 m', k2: 'Mặt bằng', v2: '7,2 × 18 m', k3: 'Chức năng', v3: 'Cafe sân vườn · Homestay · Rooftop Bida' },
  front: { k1: 'Mặt đứng', v1: '5 tầng nhà ống', k2: 'Vật liệu', v2: 'Stucco đào · Gạch bông gió', k3: 'Điểm nhấn', v3: 'Vòm cong đào · Cửa con nhộng' },
  top: { k1: 'Mặt bằng', v1: 'Quy hoạch khu đất', k2: 'Kích thước', v2: '44 × 46 m sa bàn', k3: 'Mật độ', v3: 'Nhà phố liền kề hẻm Sài Gòn' },
  rooftop: { k1: 'Sân thượng', v1: 'Tầng 5 · Sky Terrace', k2: 'Tiện ích', v2: 'Bida lỗ · Bi lắc · Quầy bar', k3: 'Kết cấu', v3: 'Pergola thép đen · Mái poly trong mờ' },
  entrance: { k1: 'Cổng vào', v1: 'Lối vào Hẻm Nhà', k2: 'Thiết kế', v2: 'Vòm uốn cong đào · Cổng sage', k3: 'Nhận diện', v3: 'Biển LED COFFEE Hẻm · Hoa giấy' },
  cafe: { k1: 'Tầng 1', v1: 'Cafe & Bar Lounge', k2: 'Nội thất', v2: 'Quầy bar óc chó · Đèn hắt LED', k3: 'Không gian', v3: 'Bàn communal · Tủ sách thư viện' },
  atrium: { k1: 'Trung tâm', v1: 'Giếng trời thông tầng', k2: 'Cảnh quan', v2: 'Cây bàng bục gỗ · Gạch nung', k3: 'Kiến trúc', v3: 'Ban công cong đỏ đô · Cửa tròn' },
  studio: { k1: 'Tầng 3', v1: 'Homestay Living Studio', k2: 'Nội thất', v2: 'Giường bục sồi · Bàn làm việc', k3: 'Góc nhìn', v3: 'Ban công vòm đón nắng · Rèm voan' },
  street: { k1: 'Bên trong Hẻm', v1: 'Hẻm phố Sài Gòn', k2: 'Không gian', v2: 'Lối đi lát đá · Đèn đường', k3: 'Bầu không khí', v3: 'Quán xá yên bình · Xe máy cổ điển' },
};

let camTween = null;
let animFrames = 0;
let controlStarts = 0;

function heroView() {
  if (window.innerWidth / window.innerHeight < 0.82) {
    return { pos: [46, 38, 58], target: [0, 8.5, 2], fov: 38 };
  }
  return VIEWS.hero;
}

function updateMeta(name) {
  const meta = VIEW_METAS[name] || VIEW_METAS.hero;
  const kEls = document.querySelectorAll('.bottom .meta .k');
  const vEls = document.querySelectorAll('.bottom .meta .v');
  if (kEls[0] && vEls[0]) { kEls[0].textContent = meta.k1; vEls[0].textContent = meta.v1; }
  if (kEls[1] && vEls[1]) { kEls[1].textContent = meta.k2; vEls[1].textContent = meta.v2; }
  if (kEls[2] && vEls[2]) { kEls[2].textContent = meta.k3; vEls[2].textContent = meta.v3; }
}

function flyTo(name, duration = 0.9) {
  const v = name === 'hero' ? heroView() : VIEWS[name];
  if (!v) return;
  camTween = {
    t: 0,
    duration: Math.max(0.1, duration),
    fromPos: camera.position.clone(),
    toPos: new THREE.Vector3(...v.pos),
    fromTarget: controls.target.clone(),
    toTarget: new THREE.Vector3(...v.target),
    fromFov: camera.fov,
    toFov: v.fov,
  };
}

function setView(name, btn) {
  if (!btn) {
    btn = document.querySelector(`[data-view="${name}"]`);
  }
  document.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('active', b === btn));
  updateMeta(name);
  flyTo(name, 0.9);
}

document.querySelectorAll('[data-view]').forEach((btn) => {
  btn.addEventListener('click', () => setView(btn.dataset.view, btn));
});

// Tab Switching between Exterior and Interior groups
document.querySelectorAll('[data-tab]').forEach((tabBtn) => {
  tabBtn.addEventListener('click', () => {
    const tab = tabBtn.dataset.tab;
    document.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b === tabBtn));

    const extGroup = document.querySelector('.view-group[data-group="exterior"]');
    const intGroup = document.querySelector('.view-group[data-group="interior"]');

    if (tab === 'interior') {
      if (extGroup) extGroup.style.display = 'none';
      if (intGroup) intGroup.style.display = 'flex';
      setView('cafe');
    } else {
      if (intGroup) intGroup.style.display = 'none';
      if (extGroup) extGroup.style.display = 'flex';
      setView('hero');
    }
  });
});

// Time switch event listeners
document.querySelectorAll('[data-time]').forEach((btn) => {
  btn.addEventListener('click', () => {
    setTimeOfDay(btn.dataset.time);
  });
});

// Clay Mode Toggle
let clay = false;
function setClay(on) {
  clay = on;
  building.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      if (!o.userData._mats) o.userData._mats = o.material;
      const m = o.userData._mats;
      const clayMat = (mat) => {
        if (mat === M.glassClear || mat === M.flutedGlass || mat === M.canopyPoly) return M.clayGlass;
        return M.clay;
      };
      o.material = Array.isArray(m) ? m.map(clayMat) : clayMat(m);
    } else if (o.userData._mats) {
      o.material = o.userData._mats;
    }
  });
}

document.querySelectorAll('[data-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    if (btn.dataset.toggle === 'rotate') {
      controls.autoRotate = on;
    } else if (btn.dataset.toggle === 'clay') {
      setClay(on);
    }
  });
});

controls.addEventListener('start', () => {
  controlStarts++;
  camTween = null;
});

/* ------------------------------------------------------------------ */
/*  Animation Loop with Real Elapsed Delta Time                        */
/* ------------------------------------------------------------------ */

const clock = new THREE.Clock();
const smoothstep = (t) => t * t * (3 - 2 * t);

function animate() {
  requestAnimationFrame(animate);
  animFrames++;
  const dt = Math.min(0.2, clock.getDelta());
  const t = clock.getElapsedTime();

  if (camTween) {
    camTween.t += dt / camTween.duration;
    const k = smoothstep(Math.min(1, camTween.t));
    camera.position.lerpVectors(camTween.fromPos, camTween.toPos, k);
    controls.target.lerpVectors(camTween.fromTarget, camTween.toTarget, k);
    camera.fov = THREE.MathUtils.lerp(camTween.fromFov, camTween.toFov, k);
    camera.updateProjectionMatrix();
    camera.lookAt(controls.target);
    if (camTween.t >= 1) {
      camTween = null;
      controls.update();
    }
  } else {
    controls.update();
  }

  // Subtle pulsing glow for cafe neon and festoon bulbs at night/sunset
  if (currentTime === 'night' || currentTime === 'sunset') {
    const pulse = 1.0 + Math.sin(t * 3.5) * 0.08;
    cafeNeonLight.intensity = TIME_CONFIGS[currentTime].neonInt * pulse;
    rooftopFairyLight.intensity = TIME_CONFIGS[currentTime].fairyInt * (1.0 + Math.cos(t * 2.8) * 0.06);
  }

  renderer.render(scene, camera);
}

/* ------------------------------------------------------------------ */
/*  Resize & Boot                                                      */
/* ------------------------------------------------------------------ */

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('done');
}
setTimeout(hideLoader, 600);

animate();

/* Global model reference for interaction & debugging */
window.__model = {
  scene,
  camera,
  controls,
  renderer,
  building,
  setTimeOfDay,
  flyTo,
  setView,
  setClay,
  toggleClay: () => {
    const btn = document.querySelector('[data-toggle="clay"]');
    if (btn) btn.click();
    else setClay(!clay);
  },
  debug: () => ({ frames: animFrames, starts: controlStarts, tween: !!camTween }),
  snap: (name) => {
    const v = name === 'hero' ? heroView() : VIEWS[name];
    if (!v) return;
    camTween = null;
    camera.position.set(...v.pos);
    controls.target.set(...v.target);
    camera.fov = v.fov;
    camera.updateProjectionMatrix();
    controls.update();
    renderer.render(scene, camera);
    hideLoader();
  },
};
