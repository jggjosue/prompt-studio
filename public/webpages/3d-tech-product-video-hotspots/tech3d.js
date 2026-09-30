import*as n from"three";import{OrbitControls as j}from"three/addons/controls/OrbitControls.js";const d=[{title:"Integraci\xF3n API REST",video:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",desc:"Demo de integraci\xF3n con la API REST del producto. Endpoints, autenticaci\xF3n y respuestas.",snippet:`const api = new ProductAPI({ token: 'sk-xxx' });

// Listar recursos
const resources = await api.list({
  limit: 50,
  filter: { status: 'active' }
});

// Crear recurso
const created = await api.create({
  name: 'Mi proyecto',
  type: 'production'
});

console.log(created.id);`,sandbox:"https://codesandbox.io/s/example",cam:[-2.2,1.6,2.2],look:[0,.6,0],pos:[-1.2,.6,.8]},{title:"Dashboard en tiempo real",video:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",desc:"Visualiza m\xE9tricas en vivo con el dashboard integrado. WebSockets y gr\xE1ficos interactivos.",snippet:`import { Dashboard } from '@tech/dashboard';

const dash = new Dashboard('#mount', {
  theme: 'dark',
  refresh: 5000
});

dash.addChart('requests', {
  type: 'line',
  data: stream,
  options: { smoothing: true }
});

dash.on('point:click', (p) => {
  console.log('Selected:', p);
});`,sandbox:"https://codesandbox.io/s/example",cam:[2.2,1.6,2.2],look:[0,.6,0],pos:[1.2,.5,.9]},{title:"Autenticaci\xF3n y permisos",video:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",desc:"Flujo completo de autenticaci\xF3n: login, MFA, roles y permisos por recurso.",snippet:`const { Auth } = require('@tech/auth');

const session = await Auth.login({
  email: 'help@prompstudio.com',
  provider: 'oauth2'
});

// Verificar permiso
if (session.can('resources:write')) {
  await api.update(id, changes);
}

// MFA challenge
await Auth.verifyMFA(session, {
  code: userInput
});`,sandbox:"https://codesandbox.io/s/example",cam:[0,2.4,3],look:[0,.6,0],pos:[0,.65,1]}],z=document.getElementById("hs-copy"),G=document.querySelectorAll(".hs-btn"),k=document.getElementById("fallback-toggle"),p=document.getElementById("fallback"),m=document.getElementById("dialog"),$=document.getElementById("close-dialog"),b=document.getElementById("dialog-title"),l=document.getElementById("dialog-video"),S=document.getElementById("snippet-code"),C=document.getElementById("snippet-pre"),v=document.getElementById("copy-snippet"),H=document.getElementById("sandbox-link"),I=document.getElementById("scene-root"),s=new n.Scene;s.background=new n.Color(658448),s.fog=new n.Fog(658448,4,14);const r=new n.PerspectiveCamera(45,window.innerWidth/window.innerHeight,.1,100);r.position.set(0,1.8,4.5);const i=new n.WebGLRenderer({antialias:!0});i.setSize(window.innerWidth,window.innerHeight),i.setPixelRatio(Math.min(window.devicePixelRatio,2)),i.toneMapping=n.ACESFilmicToneMapping,i.shadowMap.enabled=!0,i.shadowMap.type=n.PCFSoftShadowMap,I.appendChild(i.domElement);const c=new j(r,i.domElement);c.enableDamping=!0,c.maxDistance=8,c.minDistance=2,c.target.set(0,.6,0),c.enabled=!1,s.add(new n.AmbientLight(16777215,.3));const h=new n.DirectionalLight(15788256,1.2);h.position.set(3,6,4),h.castShadow=!0,h.shadow.mapSize.set(1024,1024),s.add(h);const L=new n.DirectionalLight(4890367,.3);L.position.set(-3,2,-3),s.add(L);const B=new n.DirectionalLight(16777215,.2);B.position.set(0,-1,-3),s.add(B);const O=new n.MeshStandardMaterial({color:1712688,roughness:.5,metalness:.3}),u=new n.Mesh(new n.CylinderGeometry(.7,.8,.15,32),O);u.position.set(0,.05,0),u.receiveShadow=!0,u.castShadow=!0,s.add(u);const q=new n.MeshStandardMaterial({color:4890367,roughness:.2,metalness:.7,emissive:1723018,emissiveIntensity:.1}),g=new n.Mesh(new n.BoxGeometry(.5,.35,.35),q);g.position.set(0,.3,0),g.castShadow=!0,s.add(g);const W=new n.MeshStandardMaterial({color:2767450,roughness:.4,metalness:.5});for(let e=0;e<4;e+=1){const t=new n.Mesh(new n.SphereGeometry(.03,8,8),W);t.position.set(-.2+e*.13,.3,.18),s.add(t)}const w=new n.Mesh(new n.RingGeometry(.45,.55,48),new n.MeshBasicMaterial({color:4890367,transparent:!0,opacity:.08,side:n.DoubleSide}));w.position.set(0,.01,0),w.rotation.x=-Math.PI/2,s.add(w);const x=[];d.forEach((e,t)=>{const o=new n.Mesh(new n.SphereGeometry(.12,16,16),new n.MeshStandardMaterial({color:4890367,emissive:4890367,emissiveIntensity:.3,transparent:!0,opacity:.8}));o.position.set(e.pos[0],e.pos[1],e.pos[2]),o.userData={hsIndex:t},s.add(o),x.push(o);const a=new n.Mesh(new n.RingGeometry(.15,.2,24),new n.MeshBasicMaterial({color:4890367,transparent:!0,opacity:.15,side:n.DoubleSide}));a.position.copy(o.position),a.lookAt(0,.6,0),s.add(a)});const A=new n.BufferGeometry,F=120,y=new Float32Array(F*3);for(let e=0;e<F;e+=1)y[e*3]=(Math.random()-.5)*8,y[e*3+1]=(Math.random()-.5)*3+.6,y[e*3+2]=(Math.random()-.5)*6;A.setAttribute("position",new n.BufferAttribute(y,3));const M=new n.Points(A,new n.PointsMaterial({color:6992127,size:.02,transparent:!0,opacity:.3}));s.add(M);const D=new n.Raycaster,f=new n.Vector2;function E(e){const t=d[e];b.textContent=t.title,l.src=t.video,l.load(),S.textContent=t.snippet,C.querySelector("code").textContent=t.snippet,window.Prism&&(C.innerHTML=`<code class="language-javascript">${Prism.highlight(t.snippet,Prism.languages.javascript,"javascript")}</code>`),H.href=t.sandbox,z.textContent=`\u{1F3AF} ${t.title} \u2014 ${t.desc}`,window.matchMedia("(prefers-reduced-motion: reduce)").matches?(r.position.set(...t.cam),c.target.set(...t.look)):(gsap.to(r.position,{x:t.cam[0],y:t.cam[1],z:t.cam[2],duration:1.3,ease:"power2.inOut"}),gsap.to(c.target,{x:t.look[0],y:t.look[1],z:t.look[2],duration:1.3,ease:"power2.inOut"})),m.classList.remove("hidden")}i.domElement.addEventListener("click",e=>{const t=i.domElement.getBoundingClientRect();f.x=(e.clientX-t.left)/t.width*2-1,f.y=-((e.clientY-t.top)/t.height)*2+1,D.setFromCamera(f,r);const o=D.intersectObjects(x);o.length&&E(o[0].object.userData.hsIndex)}),G.forEach(e=>{e.addEventListener("click",()=>E(Number(e.dataset.hs)))}),$.addEventListener("click",()=>{m.classList.add("hidden"),l.pause(),l.src=""}),m.addEventListener("click",e=>{e.target===m&&(m.classList.add("hidden"),l.pause(),l.src="")}),v.addEventListener("click",async()=>{const e=d.find((t,o)=>document.querySelector(`[data-hs="${o}"]`)&&b.textContent===d[o].title)?d.find(t=>t.title===b.textContent)?.snippet:S.textContent;if(e)try{await navigator.clipboard.writeText(e),v.textContent="\u2705 Copiado",setTimeout(()=>{v.textContent="\u{1F4CB} Copiar snippet"},2e3)}catch{}}),window.addEventListener("keydown",e=>{e.key>="1"&&e.key<="3"&&E(Number(e.key)-1)});function N(){p.innerHTML="<h2>Tech demos \u2014 Versi\xF3n 2D</h2>";const e=document.createElement("div");e.className="fallback-grid",d.forEach(t=>{const o=document.createElement("article");o.className="fallback-card",o.innerHTML=`
      <h3>${t.title}</h3>
      <video controls preload="metadata" src="${t.video}" crossorigin="anonymous">
        <track kind="captions" srclang="en" label="English" src="assets/subtitles-en.srt">
      </video>
      <p>${t.desc}</p>
      <pre><code class="language-javascript">${t.snippet}</code></pre>
    `,e.appendChild(o)}),p.appendChild(e),window.Prism&&requestAnimationFrame(()=>Prism.highlightAllUnder(p))}k.addEventListener("click",()=>{const e=p.classList.contains("hidden");p.classList.toggle("hidden"),k.textContent=e?"Ocultar fallback":"Fallback 2D"}),N();const V=new IntersectionObserver(e=>{e.forEach(t=>{i.setAnimationLoop(t.isIntersecting?P:null)})},{threshold:.05});V.observe(I);function P(){const e=performance.now()*.001;x.forEach((o,a)=>{const T=d[a];o.position.y=T.pos[1]+Math.sin(e*1.5+a)*.04;const R=1+Math.sin(e*2+a)*.1;o.scale.setScalar(R),o.material.emissiveIntensity=.2+Math.sin(e*2.5+a)*.15}),g.rotation.y=Math.sin(e*.3)*.15,w.scale.setScalar(1+Math.sin(e*.8)*.05);const t=M.geometry.attributes.position.array;for(let o=0;o<t.length;o+=3)t[o+1]+=Math.sin(e+o*.01)*4e-4;M.geometry.attributes.position.needsUpdate=!0,c.update(),i.render(s,r)}window.addEventListener("resize",()=>{r.aspect=window.innerWidth/window.innerHeight,r.updateProjectionMatrix(),i.setSize(window.innerWidth,window.innerHeight)}),P();
