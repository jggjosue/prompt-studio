import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// DOM Selectors
const container = document.getElementById('scene');
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const widgetList = document.getElementById('widget-list');
const tableBody = document.getElementById('kpi-table-body');
const insightTitle = document.getElementById('insight-title');
const insightText = document.getElementById('insight-text');
const timeline = document.getElementById('timeline');
const timelineVal = document.getElementById('timeline-value');

// Markets Sim DOM
const tickerPrice = document.getElementById('ticker-price');
const tradeAmount = document.getElementById('trade-amount');
const tradeLeverage = document.getElementById('trade-leverage');
const btnBuy = document.getElementById('btn-buy');
const btnSell = document.getElementById('btn-sell');
const tradeFeed = document.getElementById('trade-feed');

// Portfolio DOM
const slideEquities = document.getElementById('slide-equities');
const slideBonds = document.getElementById('slide-bonds');
const slideCrypto = document.getElementById('slide-crypto');
const slideCash = document.getElementById('slide-cash');
const valEquities = document.getElementById('val-equities');
const valBonds = document.getElementById('val-bonds');
const valCrypto = document.getElementById('val-crypto');
const valCash = document.getElementById('val-cash');
const allocTotal = document.getElementById('alloc-total');
const btnRebalance = document.getElementById('btn-rebalance');
const statReturn = document.getElementById('stat-return');
const statSharpe = document.getElementById('stat-sharpe');
const statBeta = document.getElementById('stat-beta');
const statVar = document.getElementById('stat-var');

// Risk DOM
const btnStressLow = document.getElementById('btn-stress-low');
const btnStressMed = document.getElementById('btn-stress-med');
const btnStressHigh = document.getElementById('btn-stress-high');

// Forecast DOM
const slideGrowth = document.getElementById('slide-growth');
const slideYears = document.getElementById('slide-years');
const slideConfidence = document.getElementById('slide-confidence');
const valGrowth = document.getElementById('val-growth');
const valYears = document.getElementById('val-years');
const valConfidence = document.getElementById('val-confidence');
const valProjHigh = document.getElementById('val-proj-high');
const valProjMed = document.getElementById('val-proj-med');
const valProjLow = document.getElementById('val-proj-low');

// Navbar toggle state
menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Smooth scrolling for links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    mobileMenu.classList.remove('open');
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// Sticky Navbar Background
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(6, 9, 19, 0.85)';
    navbar.style.padding = '0.75rem 0';
  } else {
    navbar.style.background = 'rgba(13, 20, 38, 0.45)';
    navbar.style.padding = '1.25rem 0';
  }
});

// Check reduced motion
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// KPI Dataset
const kpis = [
  { id: 'revenue', label: 'Revenue', current: 18.4, previous: 16.2, unit: 'M', color: 0x8b5cf6, insight: 'Revenue climbs due to enterprise expansion and stronger renewals.' },
  { id: 'margin', label: 'Gross Margin', current: 67.5, previous: 63.1, unit: '%', color: 0x10b981, insight: 'Margin rises from infrastructure efficiencies and better deal mix.' },
  { id: 'opex', label: 'Operating Cost', current: 5.8, previous: 6.3, unit: 'M', color: 0xf59e0b, insight: 'Operating costs decline while customer support automation improves.' },
  { id: 'cashflow', label: 'Free Cash Flow', current: 4.2, previous: 2.9, unit: 'M', color: 0x3b82f6, insight: 'Cash flow improves as collection cycles shorten over two quarters.' }
];

// Three.js Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060913);
scene.fog = new THREE.FogExp2(0x060913, 0.025);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false; // Disable zoom to let page scroll work smoothly
controls.maxDistance = 45;
controls.minDistance = 4;
controls.target.set(0, 1, 0);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
mainLight.position.set(10, 20, 15);
scene.add(mainLight);

const accentLight1 = new THREE.PointLight(0x8b5cf6, 6, 30);
accentLight1.position.set(-6, 4, 3);
scene.add(accentLight1);

const accentLight2 = new THREE.PointLight(0xf59e0b, 6, 30);
accentLight2.position.set(6, 4, 3);
scene.add(accentLight2);

// SCENE OBJECTS CREATION

// 1. Home Core Object (Golden-Purple Node Grid)
const homeGroup = new THREE.Group();
homeGroup.position.set(0, 1, 0);
scene.add(homeGroup);

const sphereGeo = new THREE.IcosahedronGeometry(2.5, 2);
const wireframeMat = new THREE.MeshBasicMaterial({
  color: 0x8b5cf6,
  wireframe: true,
  transparent: true,
  opacity: 0.25
});
const homeSphereWire = new THREE.Mesh(sphereGeo, wireframeMat);
homeGroup.add(homeSphereWire);

const pointsMat = new THREE.PointsMaterial({
  color: 0xf59e0b,
  size: 0.12,
  transparent: true,
  opacity: 0.9
});
const homeSpherePoints = new THREE.Points(sphereGeo, pointsMat);
homeGroup.add(homeSpherePoints);

// Glowing Orbiting Rings
const ringGeo1 = new THREE.RingGeometry(3.5, 3.55, 64);
const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
ring1.rotation.x = Math.PI / 2;
homeGroup.add(ring1);

const ringGeo2 = new THREE.RingGeometry(4.0, 4.05, 64);
const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
ring2.rotation.y = Math.PI / 4;
homeGroup.add(ring2);


// 2. Dashboard KPI Bars
const dashGroup = new THREE.Group();
dashGroup.position.set(-8, 0, -3);
scene.add(dashGroup);

// Floor grid for dashboard
const gridHelperDash = new THREE.GridHelper(6, 12, 0x8b5cf6, 0x22314e);
gridHelperDash.position.y = -0.5;
dashGroup.add(gridHelperDash);

const barGeometry = new THREE.BoxGeometry(0.7, 1, 0.7);
const dashboardBars = [];

kpis.forEach((kpi, idx) => {
  const barMat = new THREE.MeshStandardMaterial({
    color: kpi.color,
    roughness: 0.2,
    metalness: 0.8,
    emissive: kpi.color,
    emissiveIntensity: 0.15
  });
  const barMesh = new THREE.Mesh(barGeometry, barMat);
  barMesh.position.set((idx - 1.5) * 1.4, 0, 0);
  dashGroup.add(barMesh);
  dashboardBars.push({ mesh: barMesh, kpi });
});


// 3. Markets 3D Candlesticks
const marketGroup = new THREE.Group();
marketGroup.position.set(8, 0, -3);
scene.add(marketGroup);

const gridHelperMarket = new THREE.GridHelper(6, 12, 0x10b981, 0x22314e);
gridHelperMarket.position.y = -0.5;
marketGroup.add(gridHelperMarket);

const candlesData = [
  { isBull: true, o: 1.0, c: 2.2, h: 2.6, l: 0.6 },
  { isBull: false, o: 2.2, c: 1.5, h: 2.5, l: 1.2 },
  { isBull: true, o: 1.5, c: 2.8, h: 3.2, l: 1.0 },
  { isBull: true, o: 2.8, c: 3.5, h: 3.8, l: 2.4 },
  { isBull: false, o: 3.5, c: 2.1, h: 3.6, l: 1.8 },
  { isBull: true, o: 2.1, c: 3.9, h: 4.2, l: 1.9 }
];
const candlestickMeshes = [];

candlesData.forEach((data, idx) => {
  const candleGroup = new THREE.Group();
  candleGroup.position.set((idx - 2.5) * 1.0, 0, 0);
  
  const bodyH = Math.abs(data.c - data.o);
  const bodyY = (data.o + data.c) / 2;
  const color = data.isBull ? 0x10b981 : 0xef4444;
  
  // Body Mesh
  const bodyGeo = new THREE.BoxGeometry(0.4, bodyH, 0.4);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.25,
    roughness: 0.1
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = bodyY;
  candleGroup.add(bodyMesh);

  // Wick Mesh (line)
  const wickGeo = new THREE.CylinderGeometry(0.04, 0.04, data.h - data.l, 8);
  const wickMat = new THREE.MeshBasicMaterial({ color: color });
  const wickMesh = new THREE.Mesh(wickGeo, wickMat);
  wickMesh.position.y = (data.h + data.l) / 2;
  candleGroup.add(wickMesh);

  marketGroup.add(candleGroup);
  candlestickMeshes.push(candleGroup);
});


// 4. Portfolio Donut Segment Torus
const portfolioGroup = new THREE.Group();
portfolioGroup.position.set(0, 1.5, 10);
scene.add(portfolioGroup);

const donutColors = [0x8b5cf6, 0xf59e0b, 0x10b981, 0x3b82f6]; // Equities, Bonds, Crypto, Cash
const donutSegments = [];
let totalAlloc = 100;
let allocValues = [40, 30, 15, 15]; // Match HTML sliders

function update3DPortfolio() {
  // Clear old meshes
  donutSegments.forEach(mesh => portfolioGroup.remove(mesh));
  donutSegments.length = 0;

  let currentAngle = 0;
  allocValues.forEach((val, idx) => {
    const fraction = val / 100;
    if (fraction <= 0) return;
    
    const angleLength = fraction * Math.PI * 2;
    // TorusGeometry(radius, tube, radialSegments, tubularSegments, arc)
    const torusGeo = new THREE.TorusGeometry(2.0, 0.38, 16, 100, angleLength);
    const torusMat = new THREE.MeshStandardMaterial({
      color: donutColors[idx],
      roughness: 0.2,
      metalness: 0.7,
      emissive: donutColors[idx],
      emissiveIntensity: 0.1
    });
    
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    // Rotate to align
    torusMesh.rotation.z = currentAngle;
    portfolioGroup.add(torusMesh);
    donutSegments.push(torusMesh);

    currentAngle += angleLength;
  });
}
update3DPortfolio();


// 5. Risk Undulating Grid (Stress Terrain)
const riskGroup = new THREE.Group();
riskGroup.position.set(-8, -0.5, 10);
scene.add(riskGroup);

const gridW = 20;
const gridH = 20;
const riskGridGeo = new THREE.PlaneGeometry(6, 6, gridW, gridH);
riskGridGeo.rotateX(-Math.PI / 2);

const riskGridMat = new THREE.MeshStandardMaterial({
  color: 0x10b981,
  wireframe: true,
  transparent: true,
  opacity: 0.7,
  side: THREE.DoubleSide
});
const riskGridMesh = new THREE.Mesh(riskGridGeo, riskGridMat);
riskGroup.add(riskGridMesh);

let stressMultiplier = 0.5; // low, med, high


// 6. Forecast 3D Spline Line (Path Curve & confidence band)
const forecastGroup = new THREE.Group();
forecastGroup.position.set(8, 0, 10);
scene.add(forecastGroup);

let growthRate = 0.12;
let simulationYears = 8;
let confidenceWidth = 0.95;

let curveLine = null;
let envelopeMesh = null;

function update3DForecast() {
  if (curveLine) forecastGroup.remove(curveLine);
  if (envelopeMesh) forecastGroup.remove(envelopeMesh);

  const points = [];
  const envelopeUpper = [];
  const envelopeLower = [];
  const numSteps = 20;

  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const x = (t - 0.5) * 6; // Range [-3, 3]
    
    // Growth formula
    const compounding = Math.pow(1 + growthRate, t * simulationYears);
    const y = (compounding - 1) * 0.8; 
    const z = 0;
    
    points.push(new THREE.Vector3(x, y, z));

    // Confidence interval variance
    const variance = t * (confidenceWidth - 0.4) * 1.5;
    envelopeUpper.push(new THREE.Vector3(x, y + variance, z));
    envelopeLower.push(new THREE.Vector3(x, y - variance, z));
  }

  // Draw core path line
  const pathCurve = new THREE.CatmullRomCurve3(points);
  const pathGeo = new THREE.TubeGeometry(pathCurve, 64, 0.07, 8, false);
  const pathMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
  curveLine = new THREE.Mesh(pathGeo, pathMat);
  forecastGroup.add(curveLine);

  // Draw confidence shroud (Plane or custom shape)
  const envGeo = new THREE.BufferGeometry();
  const vertices = [];
  
  for (let i = 0; i < numSteps; i++) {
    const upCurr = envelopeUpper[i];
    const loCurr = envelopeLower[i];
    const upNext = envelopeUpper[i + 1];
    const loNext = envelopeLower[i + 1];

    // Triangle 1
    vertices.push(loCurr.x, loCurr.y, loCurr.z);
    vertices.push(upCurr.x, upCurr.y, upCurr.z);
    vertices.push(upNext.x, upNext.y, upNext.z);

    // Triangle 2
    vertices.push(loCurr.x, loCurr.y, loCurr.z);
    vertices.push(upNext.x, upNext.y, upNext.z);
    vertices.push(loNext.x, loNext.y, loNext.z);
  }

  envGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  envGeo.computeVertexNormals();

  const envMat = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    wireframe: false
  });
  envelopeMesh = new THREE.Mesh(envGeo, envMat);
  forecastGroup.add(envelopeMesh);
}
update3DForecast();


// Trading Simulation Particles
const particles = [];
function spawnTradeParticle(isLong, amount) {
  const pCount = Math.min(25, Math.floor(amount / 100) + 5);
  const color = isLong ? 0x10b981 : 0xef4444;

  const pGeo = new THREE.SphereGeometry(0.08, 6, 6);
  const pMat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.9
  });

  for (let i = 0; i < pCount; i++) {
    const pMesh = new THREE.Mesh(pGeo, pMat);
    // Position near the market candlestick console center (8, 0, -3)
    pMesh.position.set(
      8 + (Math.random() - 0.5) * 1.5,
      0 + (Math.random() - 0.5) * 1.5,
      -3 + (Math.random() - 0.5) * 1.5
    );
    
    scene.add(pMesh);
    particles.push({
      mesh: pMesh,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        Math.random() * 0.08 + 0.02, // float upwards
        (Math.random() - 0.5) * 0.05
      ),
      life: 1.0,
      decay: Math.random() * 0.02 + 0.01
    });
  }
}


// CAMERA FLIGHT COORDINATES PER SECTION
const cameraFlights = [
  { // Home
    camPos: new THREE.Vector3(0, 6, 12),
    target: new THREE.Vector3(0, 1, 0)
  },
  { // Dashboard
    camPos: new THREE.Vector3(-8, 5, 5),
    target: new THREE.Vector3(-8, 1.5, -3)
  },
  { // Markets
    camPos: new THREE.Vector3(8, 4, 5),
    target: new THREE.Vector3(8, 1, -3)
  },
  { // Portfolio
    camPos: new THREE.Vector3(0, 8, 16),
    target: new THREE.Vector3(0, 1.5, 10)
  },
  { // Risk
    camPos: new THREE.Vector3(-8, 6, 16),
    target: new THREE.Vector3(-8, 0, 10)
  },
  { // Forecast
    camPos: new THREE.Vector3(8, 5, 16),
    target: new THREE.Vector3(8, 1, 10)
  },
  { // Reports (Overview Pull-Back)
    camPos: new THREE.Vector3(0, 24, 28),
    target: new THREE.Vector3(0, 2, 3)
  },
  { // Pricing
    camPos: new THREE.Vector3(-4, 22, 26),
    target: new THREE.Vector3(0, 3, 3)
  },
  { // Contact
    camPos: new THREE.Vector3(4, 22, 26),
    target: new THREE.Vector3(0, 3, 3)
  }
];

// Determine active flight targets from scroll
const sectionElements = [
  document.getElementById('home'),
  document.getElementById('dashboard'),
  document.getElementById('markets'),
  document.getElementById('portfolio'),
  document.getElementById('risk'),
  document.getElementById('forecast'),
  document.getElementById('reports'),
  document.getElementById('pricing'),
  document.getElementById('contact')
];

let targetCamPos = new THREE.Vector3(0, 6, 12);
let targetLookAt = new THREE.Vector3(0, 1, 0);

function handleScrollFlight() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollRatio = scrollTop / (docHeight || 1);

  // Find active section
  let activeIdx = 0;
  const viewportHeight = window.innerHeight;
  
  sectionElements.forEach((el, idx) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // If the top of the section is visible in the middle of the viewport
    if (rect.top <= viewportHeight / 2) {
      activeIdx = idx;
    }
  });

  // Smoothly set navbar active links
  document.querySelectorAll('.nav-link').forEach((link, idx) => {
    link.classList.toggle('active', idx === activeIdx);
  });

  // Calculate interpolation between activeIdx and nextIdx
  let currentSectionTop = 0;
  let nextSectionTop = docHeight;
  
  if (sectionElements[activeIdx]) {
    currentSectionTop = sectionElements[activeIdx].offsetTop - 80;
  }
  if (activeIdx < sectionElements.length - 1 && sectionElements[activeIdx + 1]) {
    nextSectionTop = sectionElements[activeIdx + 1].offsetTop - 80;
  }

  const sectionHeight = nextSectionTop - currentSectionTop;
  const progress = sectionHeight > 0 ? (scrollTop - currentSectionTop) / sectionHeight : 0;
  const clampedProgress = Math.max(0, Math.min(progress, 1));

  const startFlight = cameraFlights[activeIdx];
  const endFlight = cameraFlights[Math.min(activeIdx + 1, cameraFlights.length - 1)];

  if (startFlight && endFlight) {
    targetCamPos.lerpVectors(startFlight.camPos, endFlight.camPos, clampedProgress);
    targetLookAt.lerpVectors(startFlight.target, endFlight.target, clampedProgress);
  }
}
window.addEventListener('scroll', handleScrollFlight);
window.addEventListener('resize', handleScrollFlight);


// INTERACTIVE CONTROLS IMPLEMENTATION

// Dashboard Widget Generation
let activeKpiId = null;

function kpiDelta(kpi) {
  return (((kpi.current - kpi.previous) / kpi.previous) * 100).toFixed(1);
}

function formatValue(kpi, value) {
  return `${value.toFixed(1)}${kpi.unit}`;
}

function selectWidget(kpiId) {
  activeKpiId = kpiId;
  const kpi = kpis.find(k => k.id === kpiId);
  if (!kpi) return;

  insightTitle.textContent = `${kpi.label} Summary`;
  insightText.textContent = kpi.insight;

  document.querySelectorAll('.widget-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === kpiId);
  });

  // Highlight active 3D bar specifically
  dashboardBars.forEach(b => {
    if (b.kpi.id === kpiId) {
      b.mesh.scale.set(1.3, 1.3, 1.3);
      b.mesh.material.emissiveIntensity = 0.55;
    } else {
      b.mesh.scale.set(1, 1, 1);
      b.mesh.material.emissiveIntensity = 0.15;
    }
  });
}

function renderDashboardUI() {
  widgetList.innerHTML = '';
  tableBody.innerHTML = '';

  kpis.forEach(kpi => {
    const delta = Number(kpiDelta(kpi));
    const cls = delta >= 0 ? 'up' : 'down';
    const sign = delta >= 0 ? '+' : '';

    const btn = document.createElement('button');
    btn.className = 'widget-item';
    btn.type = 'button';
    btn.dataset.id = kpi.id;
    btn.innerHTML = `
      <span class="kpi-name">${kpi.label}</span>
      <span class="kpi-val">${formatValue(kpi, kpi.current)}</span>
      <span class="kpi-delta ${cls}">${sign}${delta}% vs Q1</span>
    `;
    btn.addEventListener('click', () => selectWidget(kpi.id));
    widgetList.appendChild(btn);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${kpi.label}</td>
      <td>${formatValue(kpi, kpi.current)}</td>
      <td>${formatValue(kpi, kpi.previous)}</td>
      <td class="kpi-delta ${cls}">${sign}${delta}%</td>
    `;
    tableBody.appendChild(row);
  });
}

function scrubData(percent) {
  dashboardBars.forEach(({ mesh, kpi }) => {
    const val = kpi.previous + (kpi.current - kpi.previous) * percent;
    // Scale bar height dynamically
    const h = Math.max(0.4, (val / 20) * 4.0);
    mesh.scale.y = h;
    mesh.position.y = -0.5 + h / 2;
  });
}

timeline.addEventListener('input', () => {
  const percent = Number(timeline.value) / 100;
  timelineVal.textContent = `${timeline.value}% (${percent === 1 ? 'Q2 Complete' : 'Scrubbing'})`;
  scrubData(percent);
});


// Markets Sim Trading Code
let currentPrice = 67240.50;
let tradeLogs = [];

function addLog(type, text) {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  tradeFeed.appendChild(entry);
  tradeFeed.scrollTop = tradeFeed.scrollHeight;
}

btnBuy.addEventListener('click', () => {
  const amt = Number(tradeAmount.value);
  const lev = tradeLeverage.value;
  currentPrice += (amt * 0.005) * Math.random();
  tickerPrice.textContent = `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  spawnTradeParticle(true, amt);
  addLog('buy', `BUY ORDER EXEC: $${amt} at 1 XBT = $${currentPrice.toFixed(2)} (${lev}x)`);
});

btnSell.addEventListener('click', () => {
  const amt = Number(tradeAmount.value);
  const lev = tradeLeverage.value;
  currentPrice -= (amt * 0.005) * Math.random();
  tickerPrice.textContent = `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  spawnTradeParticle(false, amt);
  addLog('sell', `SELL ORDER EXEC: $${amt} at 1 XBT = $${currentPrice.toFixed(2)} (${lev}x)`);
});

// Mock index price tick fluctuation
setInterval(() => {
  const change = (Math.random() - 0.5) * 35;
  currentPrice += change;
  tickerPrice.textContent = `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  
  if (change > 15) {
    tickerPrice.className = "ticker-val text-success";
  } else if (change < -15) {
    tickerPrice.className = "ticker-val text-danger";
  }
}, 3000);


// Portfolio Weights Adjustment Code
function calculatePortfolioStats() {
  const eq = allocValues[0];
  const fi = allocValues[1];
  const cr = allocValues[2];
  const cs = allocValues[3];

  // Mock calculations based on formulas
  const expReturn = (eq * 0.12 + fi * 0.04 + cr * 0.25 + cs * 0.02) / 100;
  const sharpe = (expReturn - 0.035) / ( (eq * 0.15 + fi * 0.05 + cr * 0.45 + cs * 0.01) / 100 || 1 );
  const beta = (eq * 1.3 + fi * 0.2 + cr * 1.8 + cs * 0) / 100;
  const var95 = (eq * 0.045 + fi * 0.01 + cr * 0.12 + cs * 0.0) / 100;

  statReturn.textContent = `${(expReturn * 100).toFixed(2)}%`;
  statSharpe.textContent = sharpe.toFixed(2);
  statBeta.textContent = beta.toFixed(2);
  statVar.textContent = `${(var95 * 100).toFixed(2)}%`;
}

function handleAllocChange() {
  const eq = Number(slideEquities.value);
  const fi = Number(slideBonds.value);
  const cr = Number(slideCrypto.value);
  const cs = Number(slideCash.value);

  const total = eq + fi + cr + cs;
  allocValues = [eq, fi, cr, cs];
  
  valEquities.textContent = `${eq}%`;
  valBonds.textContent = `${fi}%`;
  valCrypto.textContent = `${cr}%`;
  valCash.textContent = `${cs}%`;
  allocTotal.textContent = `${total}%`;

  if (total !== 100) {
    allocTotal.className = "text-danger";
  } else {
    allocTotal.className = "text-success";
  }

  calculatePortfolioStats();
  update3DPortfolio();
}

slideEquities.addEventListener('input', handleAllocChange);
slideBonds.addEventListener('input', handleAllocChange);
slideCrypto.addEventListener('input', handleAllocChange);
slideCash.addEventListener('input', handleAllocChange);

btnRebalance.addEventListener('click', () => {
  // Reset to Max Sharpe weights
  slideEquities.value = 50;
  slideBonds.value = 25;
  slideCrypto.value = 20;
  slideCash.value = 5;
  handleAllocChange();
  addLog('system', "PORTFOLIO REBALANCED: Optimal Sharpe weight allocation computed.");
});


// Risk Stress levels Terrain updates
function setStress(multiplier, activeBtn) {
  stressMultiplier = multiplier;
  document.querySelectorAll('.btn-stress').forEach(b => b.classList.remove('active'));
  activeBtn.classList.add('active');

  if (multiplier === 0.5) {
    riskGridMesh.material.color.setHex(0x10b981);
  } else if (multiplier === 1.2) {
    riskGridMesh.material.color.setHex(0xf59e0b);
  } else {
    riskGridMesh.material.color.setHex(0xef4444);
    // Camera shake effect on stress Black Swan
    if (!isReducedMotion) {
      const originalY = camera.position.y;
      let shakeCount = 0;
      const shake = setInterval(() => {
        camera.position.y += (Math.random() - 0.5) * 0.15;
        shakeCount++;
        if (shakeCount > 15) {
          clearInterval(shake);
          camera.position.y = originalY;
        }
      }, 50);
    }
  }
}

btnStressLow.addEventListener('click', (e) => setStress(0.5, e.currentTarget));
btnStressMed.addEventListener('click', (e) => setStress(1.2, e.currentTarget));
btnStressHigh.addEventListener('click', (e) => setStress(2.5, e.currentTarget));


// Forecast Projections Controls
function handleForecastChange() {
  growthRate = Number(slideGrowth.value) / 100;
  simulationYears = Number(slideYears.value);
  confidenceWidth = Number(slideConfidence.value) / 100;

  valGrowth.textContent = `${slideGrowth.value}%`;
  valYears.textContent = `${simulationYears} Years`;
  valConfidence.textContent = `${slideConfidence.value}%`;

  // Update mock readout calculations
  const baseVal = 18.4; // starting cash
  const medianYield = baseVal * Math.pow(1 + growthRate, simulationYears);
  const variance = medianYield * (confidenceWidth - 0.3) * 0.4;
  const highYield = medianYield + variance;
  const lowYield = Math.max(1.0, medianYield - variance);

  valProjHigh.textContent = `$${highYield.toFixed(1)}M`;
  valProjMed.textContent = `$${medianYield.toFixed(1)}M`;
  valProjLow.textContent = `$${lowYield.toFixed(1)}M`;

  update3DForecast();
}

slideGrowth.addEventListener('input', handleForecastChange);
slideYears.addEventListener('input', handleForecastChange);
slideConfidence.addEventListener('input', handleForecastChange);


// Download / Form handlers
document.querySelectorAll('.btn-download').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const reportName = e.currentTarget.dataset.report;
    alert(`Generating & Downloading: ${reportName} (Mock PDF)`);
    // Flash background light
    accentLight1.intensity = 18;
    setTimeout(() => { accentLight1.intensity = 6; }, 200);
  });
});

document.querySelectorAll('.btn-price').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const tier = e.currentTarget.dataset.tier;
    alert(`Subscribed to: ${tier} workspace workspace model simulated.`);
  });
});

document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert("Beta credentials generated! Check your institutional inbox shortly.");
  // Light flash effect
  accentLight2.intensity = 18;
  setTimeout(() => { accentLight2.intensity = 6; }, 200);
});


// ANIMATION LOOP

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;

  // 1. Rotate Home Node Core
  if (!isReducedMotion) {
    homeGroup.rotation.y = time * 0.05;
    homeGroup.rotation.x = Math.sin(time * 0.03) * 0.15;
    
    ring1.rotation.z += 0.002;
    ring2.rotation.z -= 0.003;
  }

  // 2. Animate Dashboard Bars (Gentle pulse hover)
  dashboardBars.forEach((bar, idx) => {
    if (activeKpiId === bar.kpi.id) {
      const wobble = Math.sin(time * 3 + idx) * 0.05;
      bar.mesh.rotation.y += 0.015;
      bar.mesh.scale.set(1.2 + wobble, 1.2 + wobble, 1.2 + wobble);
    } else {
      bar.mesh.rotation.y = 0;
    }
  });

  // 3. Fluctuate Market Candlesticks
  if (!isReducedMotion) {
    candlestickMeshes.forEach((mesh, idx) => {
      mesh.position.y = Math.sin(time * 0.8 + idx) * 0.08;
    });
  }

  // 4. Rotate Portfolio Torus
  if (!isReducedMotion) {
    portfolioGroup.rotation.y = time * 0.12;
    portfolioGroup.rotation.z = Math.sin(time * 0.05) * 0.1;
  }

  // 5. Undulate Risk stress terrain
  if (riskGridGeo) {
    const positions = riskGridGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      // Sin wave formula to simulate volatility terrain
      const y = Math.sin(x * 1.5 + time * 1.8) * Math.cos(z * 1.5 + time * 1.2) * 0.22 * stressMultiplier;
      positions.setY(i, y);
    }
    positions.needsUpdate = true;
  }

  // Handle Simulated trading particles update
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.mesh.position.add(p.velocity);
    p.life -= p.decay;
    p.mesh.material.opacity = p.life;
    if (p.life <= 0) {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
      particles.splice(i, 1);
    }
  }

  // Camera lerping to targets (Flights)
  if (!isReducedMotion) {
    camera.position.lerp(targetCamPos, 0.065);
    controls.target.lerp(targetLookAt, 0.065);
  } else {
    // Instant jump for reduced motion users
    camera.position.copy(targetCamPos);
    controls.target.copy(targetLookAt);
  }

  controls.update();
  renderer.render(scene, camera);
}

// Window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialization
renderDashboardUI();
scrubData(0);
handleForecastChange();
handleScrollFlight();
animate();
