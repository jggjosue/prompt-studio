import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const collection = [
  { name: 'Noir Silk Trench', category: 'Outerwear', material: 'Silk', color: 'Noir', price: '$1,860', status: 'Runway Exclusive', desc: 'Liquid drape with a clean storm-collar silhouette.' },
  { name: 'Ivory Sculpted Gown', category: 'Eveningwear', material: 'Satin', color: 'Ivory', price: '$2,490', status: 'Limited', desc: 'Architectural lines and a soft reflective finish.' },
  { name: 'Graphite Tailored Suit', category: 'Tailoring', material: 'Wool', color: 'Graphite', price: '$1,540', status: 'Available', desc: 'Precision shoulder line with a long editorial stance.' },
  { name: 'Champagne Satin Blazer', category: 'Tailoring', material: 'Satin', color: 'Champagne', price: '$1,220', status: 'Limited', desc: 'A polished layer built for evening arrivals.' },
  { name: 'Crystal Mesh Dress', category: 'Dress', material: 'Organza', color: 'Crystal', price: '$2,980', status: 'Runway Exclusive', desc: 'Transparent shimmer and camera-ready motion.' },
  { name: 'Velvet Evening Coat', category: 'Outerwear', material: 'Velvet', color: 'Midnight', price: '$2,140', status: 'Limited', desc: 'Heavy velvet with a subtle theatrical glow.' },
  { name: 'Minimal Leather Bag', category: 'Accessory', material: 'Leather', color: 'Onyx', price: '$690', status: 'Available', desc: 'Compact form with a polished hardware accent.' },
  { name: 'Runway Signature Boots', category: 'Footwear', material: 'Leather', color: 'Smoke', price: '$980', status: 'Available', desc: 'Sharp toe line and a clean, commanding shaft.' }
];
const looks = [
  { title: 'Opening Look', mood: 'Arrival energy', items: 'Silk trench, leather bag, signature boots', note: 'Strong entrance, minimal jewelry, camera flash ready.' },
  { title: 'Hero Look', mood: 'Center stage', items: 'Sculpted gown, crystal mesh layer, satin heel', note: 'Built to catch light at the runway apex.' },
  { title: 'Evening Look', mood: 'After dark', items: 'Tailored suit, metallic thread shirt, cuff detail', note: 'Quiet power and precise geometry.' },
  { title: 'Editorial Look', mood: 'Magazine cover', items: 'Blazer, organza sleeve, bold liner', note: 'A balanced composition of softness and structure.' },
  { title: 'Closing Look', mood: 'Final walk', items: 'Velvet coat, boots, jewelry stack', note: 'A final silhouette that lingers.' }
];
const fabrics = ['Silk','Velvet','Leather','Wool','Organza','Metallic Thread','Crystal Embellishment','Satin'];
const beauty = ['Clean Skin','Graphic Liner','Sculpted Hair','Metallic Accent','Editorial Glow'];
const notes = [
  'Inspired by architectural silhouettes and evening movement.',
  'Built around the contrast between softness and structure.',
  'Designed for presence, confidence and quiet luxury.',
  'A collection where backstage craft becomes part of the story.'
];
const schedule = [
  ['18:00', 'Guest Arrival', 'Lobby + Front Row'],
  ['18:30', 'Backstage Preview', 'Styling Deck'],
  ['19:00', 'Runway Opening', 'Main Runway'],
  ['19:20', 'Collection Presentation', 'Showroom Stage'],
  ['19:45', 'Designer Notes', 'Notes Wall'],
  ['20:00', 'Private Viewing', 'VIP Lounge'],
  ['20:30', 'VIP Styling Appointments', 'Fitting Room']
];
const vip = ['Early access collections','Private backstage preview','Designer consultation','Reserved front row seating'];
const hotspots = ['Main Runway','Featured Look','Backstage Rack','Makeup Station','Styling Table','Fitting Room','Designer Notes','VIP Viewing','Book Appointment'];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080910);
scene.fog = new THREE.Fog(0x080910, 7, 34);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 2.6, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.getElementById('scene-root').appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.enableDamping = true;
controls.target.set(0, 1.8, 0);
controls.minPolarAngle = 1.05;
controls.maxPolarAngle = 1.25;
controls.rotateSpeed = 0.35;

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const sun = new THREE.DirectionalLight(0xffe3bd, 2.2); sun.position.set(4, 7, 5); scene.add(sun);
const rim = new THREE.PointLight(0xffb87a, 2.8, 20); rim.position.set(-5, 2, -4); scene.add(rim);
const back = new THREE.PointLight(0x7e8bff, 2.2, 24); back.position.set(4, 3, -10); scene.add(back);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 40), new THREE.MeshPhysicalMaterial({ color: 0x11131a, roughness: 0.22, metalness: 0.7, clearcoat: 1 }));
floor.rotation.x = -Math.PI / 2; scene.add(floor);
const runway = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 18), new THREE.MeshPhysicalMaterial({ color: 0x242734, roughness: 0.18, metalness: 0.9, clearcoat: 1 }));
runway.position.set(0, 0.05, -1.5); scene.add(runway);
for (let i=0;i<8;i++){ const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.38,0.8), new THREE.MeshStandardMaterial({color:i%2?0x1a1d27:0x2b2026,roughness:.8})); seat.position.set(i<4?-2.3:2.3,0.2,-6+i*1.6); scene.add(seat); }
const backdrop = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 0.2), new THREE.MeshStandardMaterial({ color: 0x111827, emissive: 0x1b2233, emissiveIntensity: 0.5 }));
backdrop.position.set(0, 2.2, -11); scene.add(backdrop);

const bodyMeshes = [];
function addFigure(x,z,c=0xd2d0d7){ const figure = new THREE.Mesh(new THREE.CapsuleGeometry(.23,1.05,5,12), new THREE.MeshStandardMaterial({color:c,roughness:.35,metalness:.25})); figure.position.set(x,1.05,z); scene.add(figure); bodyMeshes.push(figure); return figure; }
[-3,-1,1,3].forEach((x,i)=>addFigure(x,-5.2+i*.8,i%2?0xb8b9c5:0xe4d0bc));
const hoverCards = [];
function addCard(x,y,z,color=0xf0e6da){ const card = new THREE.Mesh(new THREE.PlaneGeometry(1.2,.8), new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .05 })); card.position.set(x,y,z); card.lookAt(0,1.4,0); scene.add(card); hoverCards.push(card); return card; }
addCard(-2.8,2.1,-2.4,0x201821); addCard(2.4,2.0,-4.2,0x1e2530); addCard(0.2,1.8,-8.2,0x2b2120);
const hotspotsData = [
  ['Main Runway', new THREE.Vector3(0, 1.5, -1.2)],
  ['Featured Look', new THREE.Vector3(-2.4, 1.8, -3.4)],
  ['Backstage Rack', new THREE.Vector3(2.5, 1.9, -5.5)],
  ['Makeup Station', new THREE.Vector3(-2.1, 1.7, -7.3)],
  ['Styling Table', new THREE.Vector3(0.8, 1.6, -8.4)],
  ['Fitting Room', new THREE.Vector3(2.4, 1.6, -9.5)],
  ['Designer Notes', new THREE.Vector3(-1.8, 1.9, -10.4)],
  ['VIP Viewing', new THREE.Vector3(2.4, 1.8, -11.4)],
  ['Book Appointment', new THREE.Vector3(0, 1.2, -13.2)]
];
const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let hovered = null; let activeFocus = null; let targetCamera = camera.position.clone(); let targetLook = controls.target.clone(); let guided = false;
const menuToggle = document.getElementById('menu-toggle'); const topbar = document.querySelector('.topbar'); const modal = document.getElementById('modal'); const modalTitle = document.getElementById('modal-title'); const modalBody = document.getElementById('modal-body'); const modalKicker = document.getElementById('modal-kicker'); const modalMeta = document.getElementById('modal-meta');

function openModal({ kicker, title, body, meta = [] }) { modalKicker.textContent = kicker; modalTitle.textContent = title; modalBody.textContent = body; modalMeta.innerHTML = meta.map((m)=>`<span>${m}</span>`).join(''); modal.classList.remove('hidden'); }
function closeModal(){ modal.classList.add('hidden'); }
document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

menuToggle.addEventListener('click', ()=>{ const open = topbar.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(open)); });

const collectionGrid = document.getElementById('collection-grid');
const looksGrid = document.getElementById('looks-grid');
const fabricGrid = document.getElementById('fabric-grid');
const beautyGrid = document.getElementById('beauty-grid');
const designerGrid = document.getElementById('designer-grid');
const timeline = document.getElementById('timeline');
const vipGrid = document.getElementById('vip-grid');
const hotspotRow = document.getElementById('hotspot-row');
const stylingPreview = document.getElementById('styling-preview');
let stylingIndex = 0; let savedLook = null;

hotspots.forEach((name)=>{ const btn=document.createElement('button'); btn.className='hotspot'; btn.textContent=name; btn.addEventListener('click',()=>focusArea(name)); hotspotRow.appendChild(btn); });
collection.forEach((item)=>{ const el=document.createElement('article'); el.className='card reveal glass'; el.innerHTML=`<h3>${item.name}</h3><p>${item.category} · ${item.material} · ${item.color}</p><p>${item.desc}</p><p><strong>${item.price}</strong> · ${item.status}</p><div class="hero-actions"><button class="secondary">View Look</button><button class="secondary">Add to Wishlist</button></div>`; const [view,wish] = el.querySelectorAll('button'); view.addEventListener('click',()=>focusArea(item.name)); wish.addEventListener('click',()=>{ wish.textContent='Saved'; wish.classList.add('primary'); }); collectionGrid.appendChild(el); });
looks.forEach((look)=>{ const el=document.createElement('article'); el.className='card reveal glass'; el.innerHTML=`<h3>${look.title}</h3><p>${look.mood}</p><p>${look.items}</p><p>${look.note}</p><button class="secondary">Open Look</button>`; el.querySelector('button').addEventListener('click',()=>openModal({ kicker:'Featured Look', title:look.title, body:`Mood: ${look.mood}. Styling note: ${look.note}`, meta:[look.items,'Cinematic reveal','3D preview'] })); looksGrid.appendChild(el); });
fabrics.forEach((name)=>{ const el=document.createElement('article'); el.className='card reveal glass'; el.innerHTML=`<h3>${name}</h3><p>${name} texture, photographed for sheen, fall and depth.</p><button class="secondary">View Texture</button>`; el.querySelector('button').addEventListener('click',()=>openModal({ kicker:'Fabric Detail', title:name, body:`A tactile material study focused on ${name.toLowerCase()} surface behavior, reflected highlights and movement under runway light.`, meta:['Texture zoom','Material study','Premium finish'] })); fabricGrid.appendChild(el); });
beauty.forEach((name)=>{ const el=document.createElement('article'); el.className='card reveal glass'; el.innerHTML=`<h3>${name}</h3><p>Beauty direction for the show, built around polished skin and editorial contrast.</p><button class="secondary">View Beauty Direction</button>`; el.querySelector('button').addEventListener('click',()=>focusArea(name)); beautyGrid.appendChild(el); });
notes.forEach((text)=>{ const el=document.createElement('article'); el.className='card reveal glass'; el.innerHTML=`<h3>Studio Note</h3><p>${text}</p><button class="secondary">Read Full Concept</button>`; el.querySelector('button').addEventListener('click',()=>openModal({ kicker:'Designer Notes', title:'Full Concept', body:'The show moves from the public showroom into a controlled backstage system where tailoring, beauty, accessories and light become part of one narrative. It is designed as a luxury editorial journey with commerce-ready CTAs.', meta:['Concept narrative','Backstage story','Editorial luxury'] })); designerGrid.appendChild(el); });
schedule.forEach(([time,title,location])=>{ const el=document.createElement('article'); el.className='timeline-item reveal'; el.innerHTML=`<div class="eyebrow">${time}</div><strong>${title}</strong><p>${location}</p><button class="secondary">View Details</button>`; el.querySelector('button').addEventListener('click',()=>openModal({ kicker:'Runway Schedule', title, body:`${time} at ${location}. This block is part of the curated runway timeline and can be used for private access or backstage coordination.`, meta:[time, location, 'Editorial timeline'] })); timeline.appendChild(el); });
vip.forEach((item)=>{ const el=document.createElement('article'); el.className='card reveal glass'; el.innerHTML=`<h3>${item}</h3><p>Private access designed to convert interest into appointment-led bookings.</p>`; vipGrid.appendChild(el); });
const stylingSets = [
  ['Ivory Sculpted Gown','Crystal Mesh Dress','Runway Signature Boots','Minimal Leather Bag'],
  ['Graphite Tailored Suit','Champagne Satin Blazer','Minimal Leather Bag','Runway Signature Boots'],
  ['Velvet Evening Coat','Noir Silk Trench','Minimal Leather Bag','Crystal Mesh Dress']
];
function renderStyling(){ const set = stylingSets[stylingIndex % stylingSets.length]; stylingPreview.innerHTML = `<div><p class="eyebrow">Current Look</p><h3>${set[0]}</h3><p>${set.slice(1).join(' · ')}</p><span class="saved-chip">${savedLook ? 'Saved look active' : 'Ready to save'}</span></div>`; }
document.getElementById('change-styling').addEventListener('click',()=>{ stylingIndex += 1; renderStyling(); focusArea('Styling Table'); });
document.getElementById('save-look').addEventListener('click',()=>{ savedLook = `Look ${stylingIndex + 1}`; renderStyling(); openModal({ kicker:'Wishlist', title:'Look Saved', body:'The styling combination has been saved to your premium shortlist.', meta:[savedLook,'Wishlist updated','Fashion concierge'] }); });
document.getElementById('view-outfit').addEventListener('click',()=>openModal({ kicker:'Full Outfit', title:'Complete Styling Breakdown', body:'Main garment, shoes, bag, jewelry and accessory stack displayed together for a curated final check before booking.', meta:['Head-to-toe preview','Outfit composition','Ready for booking'] }));
renderStyling();

function focusArea(name){
  activeFocus = name;
  guided = true;
  const focus = hotspotsData.find(([label])=>label===name);
  if(focus){
    targetLook.copy(focus[1]);
    targetCamera.set(focus[1].x, focus[1].y + 1.5, focus[1].z + 6.2);
    openModal({ kicker:'Canvas Focus', title:name, body:`The 3D camera is now emphasizing ${name.toLowerCase()}. Use the scroll narrative to continue through runway and backstage transitions.`, meta:['Camera focus','3D hotspot','Scroll storytelling'] });
  } else if(name === 'Styling Table'){
    targetCamera.set(0, 2.2, 4.8);
    targetLook.set(0, 1.3, -7.6);
  } else if(name === 'backstage-rack'){
    targetCamera.set(2.8, 2.1, 2.4);
    targetLook.set(2.2, 1.5, -5.5);
  } else if(name === 'makeup'){
    targetCamera.set(-2.6, 2, 0.8);
    targetLook.set(-2, 1.5, -7.2);
  } else if(name === 'styling'){
    targetCamera.set(0.7, 2.0, 3.2);
    targetLook.set(0.5, 1.3, -8.2);
  } else if(name === 'fitting'){
    targetCamera.set(2.7, 2.0, 1.4);
    targetLook.set(2.2, 1.5, -9.4);
  } else {
    targetCamera.set(0, 2.4, 9);
    targetLook.set(0, 1.6, -6);
  }
}
document.querySelectorAll('[data-action="enter-backstage"]').forEach((btn)=>btn.addEventListener('click',()=>focusArea('Main Runway')));
document.querySelectorAll('[data-action="book-appointment"]').forEach((btn)=>btn.addEventListener('click',()=>focusArea('Book Appointment')));
document.querySelectorAll('.action-card').forEach((card)=>card.addEventListener('click',()=>focusArea(card.dataset.focus)));
document.getElementById('booking-form').addEventListener('submit',(e)=>{ e.preventDefault(); openModal({ kicker:'Booking Request', title:'Request Sent', body:'Your private viewing request has been prepared. A concierge-style confirmation flow is simulated on this page.', meta:['Private viewing','Designer consultation','VIP appointment'] }); });

document.querySelectorAll('.reveal').forEach((el)=>{ new IntersectionObserver(([entry])=>{ if(entry.isIntersecting) el.classList.add('in'); }, { threshold: .1 }).observe(el); });

window.addEventListener('scroll',()=>{ const p = Math.min(scrollY / (document.body.scrollHeight - innerHeight), 1); const z = 10 - p * 22; camera.position.lerp(new THREE.Vector3(Math.sin(p*2)*1.4, 2.4 + Math.sin(p*3)*.2, z), 0.04); controls.target.lerp(new THREE.Vector3(Math.sin(p*1.2)*.8, 1.6, -p*12), 0.06); runway.rotation.y = Math.sin(p*3) * 0.05; });
renderer.domElement.addEventListener('pointermove',(e)=>{ const r = renderer.domElement.getBoundingClientRect(); pointer.x = ((e.clientX-r.left)/r.width)*2-1; pointer.y = -((e.clientY-r.top)/r.height)*2+1; raycaster.setFromCamera(pointer, camera); const hits = raycaster.intersectObjects([...hoverCards]); hovered = hits[0]?.object ?? null; document.body.style.cursor = hovered ? 'pointer' : 'default'; });
renderer.domElement.addEventListener('click',()=>{ if(hovered) openModal({ kicker:'3D Detail', title:'Interactive Object', body:'This object is part of the curated runway/backstage scene and can be used as a storytelling anchor for product, styling or booking.', meta:['Hover hotspot','Cinematic object','Interactive canvas'] }); });

const clock = new THREE.Clock();
function animate(){
  const t = clock.getElapsedTime();
  bodyMeshes.forEach((mesh,i)=>{ mesh.rotation.y = Math.sin(t + i) * 0.12; mesh.position.y = 1.05 + Math.sin(t*1.8 + i) * 0.05; });
  hoverCards.forEach((mesh,i)=>{ mesh.rotation.z = Math.sin(t*.7 + i) * .08; mesh.position.y = mesh.userData.baseY ?? mesh.position.y; });
  hotspotsData.forEach(([,v],i)=>{ });
  rim.intensity = 2.4 + Math.sin(t*2.2) * .4;
  back.intensity = 2 + Math.cos(t*1.5) * .3;
  if(guided){ camera.position.lerp(targetCamera, 0.04); controls.target.lerp(targetLook, 0.05); }
  controls.update(); renderer.render(scene, camera); requestAnimationFrame(animate);
}
window.addEventListener('resize',()=>{ camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
window.addEventListener('keydown',(e)=>{ if(e.key === 'Escape') closeModal(); });
hotspotsData.forEach(([label, vec], idx)=>{ const pin = new THREE.Mesh(new THREE.SphereGeometry(.09,16,16), new THREE.MeshStandardMaterial({color:idx%2?0xd9b47d:0xd8968c, emissive:0x22160f, emissiveIntensity:.8})); pin.position.copy(vec); scene.add(pin); });
animate();
