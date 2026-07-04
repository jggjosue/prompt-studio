(function(){const L=[["Midnight Signal","Lena Cross","France","Thriller","108 min","Premiere"],["The Last Frame","Diego Maren","Mexico","Drama","96 min","Competition"],["City of Glass","Nora Vale","Japan","Sci-Fi","124 min","Premiere"],["Echoes of Tomorrow","Iris Kwon","South Korea","Drama","112 min","Competition"],["Silent Harbor","Amir Solis","Canada","Mystery","88 min","Short Film"],["Neon Orchard","Tara Leone","Italy","Romance","101 min","Premiere"],["The Paper Moon","Hana Becker","Germany","Documentary","77 min","Documentary"],["After the Rain","Jonas Reed","Brazil","Drama","90 min","Competition"]],S=[["Red Carpet First Look","02:14","Festival Intro"],["Midnight Signal Trailer","01:58","Thriller"],["Awards Night Teaser","01:05","Gala"],["Official Selection Reel","02:33","Montage"],["Press Day Snapshot","01:19","Media"],["Closing Reception Promo","01:47","Networking"]],x=[["10:00","Opening Screening","Grand Theater","Premiere"],["12:00","Documentary Spotlight","Documentary Hall","Docs"],["14:00","Short Film Competition","Indie Screening Room","Competition"],["16:00","Director Q&A","Q&A Stage","Talkback"],["18:00","Red Carpet Premiere","Main Entrance","Gala"],["20:00","Awards Night","Awards Stage","Ceremony"],["22:00","Closing Reception","Networking Lounge","Social"]],k=[["Grand Theater","1,200 seats","Dolby Atmos, 4K projection"],["Indie Screening Room","320 seats","Intimate premieres and shorts"],["Documentary Hall","260 seats","Panel-friendly projection"],["Outdoor Cinema","500 seats","Night screenings under the sky"],["Press Lounge","80 seats","Interview and media check-in"],["Director Q&A Stage","140 seats","Talkbacks and live discussion"]],j=[["Best Feature Film","Top narrative feature of the year."],["Best Short Film","A sharp, unforgettable short-form voice."],["Best Documentary","Outstanding nonfiction storytelling."],["Best Director","Vision, control, and cinematic rhythm."],["Best Cinematography","Light, movement, composition."],["Audience Choice Award","The crowd\u2019s favorite selection."],["Emerging Talent Award","Breakthrough work from new voices."]],P=[["Elena Moreau","Film Director","Craft-first storyteller with a love for tension and atmosphere."],["Marco Silva","Cinematographer","Focuses on texture, movement, and luminous framing."],["Aisha Bennett","Producer","Champions bold production design and audience reach."],["Kenji Tanaka","Screenwriter","Looks for sharp dialogue and structural elegance."],["Sofia Hart","Festival Curator","Builds selection arcs that feel contemporary and resonant."]],v={modalOpen:!1,saved:new Set},n=t=>document.querySelector(t),h=n("#festivalCanvas"),d=n("#modal"),C=n("#modalBody"),u=n("#toast");function r(t){u.textContent=t,u.classList.add("show"),clearTimeout(r._t),r._t=setTimeout(()=>u.classList.remove("show"),1800)}function c(t){C.innerHTML=t,d.classList.add("open"),d.setAttribute("aria-hidden","false"),v.modalOpen=!0}function w(){d.classList.remove("open"),d.setAttribute("aria-hidden","true"),v.modalOpen=!1}function D(){n("#filmGrid").innerHTML=L.map(([t,e,i,m,l,p])=>`
      <article class="film-card card glass">
        <div class="poster"></div>
        <h3>${t}</h3>
        <div class="meta">${e} \xB7 ${i}</div>
        <div class="meta">${m} \xB7 ${l} \xB7 ${p}</div>
        <p class="meta">A premium festival selection designed to feel editorial, atmospheric, and award-ready.</p>
        <div class="actions">
          <button class="btn btn-ghost js-view-film" data-title="${t}" data-director="${e}" data-country="${i}" data-genre="${m}" data-duration="${l}" data-status="${p}">View Film</button>
          <button class="btn btn-accent js-watch-trailer" data-title="${t}">Watch Trailer</button>
        </div>
      </article>
    `).join(""),n("#trailerGrid").innerHTML=S.map(([t,e,i])=>`
      <article class="card glass">
        <div class="poster"></div>
        <h3>${t}</h3>
        <div class="meta">${e} \xB7 ${i}</div>
        <button class="btn btn-ghost action js-play-trailer" data-title="${t}">Play Trailer</button>
      </article>
    `).join(""),n("#scheduleList").innerHTML=x.map(([t,e,i,m],l)=>`
      <article class="timeline-item glass">
        <div class="time">${t}</div>
        <div>
          <h3>${e}</h3>
          <p>${i} \xB7 ${m}</p>
        </div>
        <div class="actions">
          <button class="btn btn-ghost js-view-details" data-title="${e}" data-room="${i}">View Details</button>
          <button class="btn btn-accent js-add-agenda" data-index="${l}">Add to Agenda</button>
        </div>
      </article>
    `).join(""),n("#venueGrid").innerHTML=k.map(([t,e,i])=>`
      <article class="venue-card card glass">
        <h3>${t}</h3>
        <div class="meta">${e}</div>
        <p class="meta">${i}</p>
        <button class="btn btn-ghost action js-view-venue" data-name="${t}">View Venue</button>
      </article>
    `).join(""),n("#awardGrid").innerHTML=j.map(([t,e])=>`
      <article class="card glass">
        <h3>\u2726 ${t}</h3>
        <p class="meta">${e}</p>
        <button class="btn btn-ghost action js-view-nominees" data-name="${t}">View Nominees</button>
      </article>
    `).join(""),n("#juryGrid").innerHTML=P.map(([t,e,i])=>`
      <article class="jury-card card glass">
        <h3>${t}</h3>
        <div class="meta">${e}</div>
        <p class="meta">${i}</p>
        <button class="btn btn-ghost action js-read-bio" data-name="${t}" data-role="${e}" data-bio="${i}">Read Bio</button>
      </article>
    `).join(""),n("#ticketGrid").innerHTML=[["Day Pass","$39","Single-day screenings and lounges"],["Full Festival Pass","$129","All screenings and awards night"],["Premiere Night Ticket","$59","Red carpet entrance and premiere"],["Student Pass","$24","Discounted access with ID"],["VIP Red Carpet Pass","$199","Priority seating and lounge access"],["Industry Pass","$249","Press room, Q&A, and networking"]].map(([t,e,i])=>`
      <article class="ticket-card card glass">
        <h3>${t}</h3>
        <div class="ticket-price">${e}</div>
        <p class="meta">${i}</p>
        <button class="btn btn-accent js-buy-ticket" data-name="${t}">Buy Ticket</button>
      </article>
    `).join("")}function A(){document.body.addEventListener("click",t=>{const e=t.target.closest("button, a");e&&(e.matches("[data-scroll]")&&document.querySelector(e.dataset.scroll)?.scrollIntoView({behavior:"smooth",block:"start"}),e.id==="enterFestival"&&G(),e.classList.contains("js-view-film")&&c(`<h2>${e.dataset.title}</h2><p>${e.dataset.director} \xB7 ${e.dataset.country} \xB7 ${e.dataset.genre} \xB7 ${e.dataset.duration} \xB7 ${e.dataset.status}</p><p>A preview panel with festival notes, selection rationale, and visual treatment for the film card.</p>`),(e.classList.contains("js-watch-trailer")||e.classList.contains("js-play-trailer"))&&c(`<h2>${e.dataset.title}</h2><p>Trailer playback simulated for the premium festival presentation.</p><div style="height:220px;border-radius:24px;background:radial-gradient(circle at center, rgba(240,200,107,.24), rgba(0,0,0,.92) 62%), linear-gradient(135deg, rgba(156,28,61,.55), rgba(19,17,27,.95));display:grid;place-items:center;margin-top:16px">Play Trailer</div>`),e.classList.contains("js-view-details")&&c(`<h2>${e.dataset.title}</h2><p><strong>Location:</strong> ${e.dataset.room}</p><p>Expanded session details, seating notes, and agenda visibility for this block in the timeline.</p>`),e.classList.contains("js-add-agenda")&&(e.textContent="Saved",e.classList.add("saved"),r("Added to agenda")),e.classList.contains("js-view-venue")&&c(`<h2>${e.dataset.name}</h2><p>Venue spotlight with projection, capacity, and spatial notes for the festival map.</p>`),e.classList.contains("js-view-nominees")&&c(`<h2>${e.dataset.name}</h2><p>Nominee list simulated for the award category and screening context.</p>`),e.classList.contains("js-read-bio")&&c(`<h2>${e.dataset.name}</h2><p>${e.dataset.role}</p><p>${e.dataset.bio}</p>`),e.classList.contains("js-buy-ticket")&&(r(`${e.dataset.name} selected`),c(`<h2>${e.dataset.name}</h2><p>Ticket checkout modal. Availability confirmed and purchase path ready.</p>`)),e.classList.contains("action")&&r(e.textContent.trim()))}),n("#navToggle").addEventListener("click",()=>n("#nav").classList.toggle("open")),n("#modalClose").addEventListener("click",w),d.addEventListener("click",t=>{t.target===d&&w()}),n("#contactForm").addEventListener("submit",t=>{t.preventDefault(),r("You are on the festival list"),t.target.reset()})}function G(){r("Entering the festival"),window.gsap&&(gsap.fromTo(".hero-canvas-wrap",{scale:.96,filter:"blur(4px)"},{scale:1,filter:"blur(0px)",duration:.9,ease:"power2.out"}),gsap.to(".hero-badge,.floating-card",{y:-10,stagger:.06,duration:.6,yoyo:!0,repeat:1,ease:"power1.inOut"}))}function F(){const t=new IntersectionObserver(e=>{e.forEach(i=>{i.isIntersecting&&i.target.classList.add("visible")})},{threshold:.16});document.querySelectorAll(".reveal").forEach(e=>t.observe(e))}function B(){const t=new THREE.Scene;t.fog=new THREE.Fog(591629,6,18);const e=new THREE.PerspectiveCamera(45,1,.1,100);e.position.set(0,2.4,8);const i=new THREE.WebGLRenderer({antialias:!0,alpha:!0});i.setPixelRatio(Math.min(window.devicePixelRatio,2)),i.setSize(h.clientWidth,h.clientHeight),i.outputEncoding=THREE.sRGBEncoding,h.appendChild(i.domElement);const m=new THREE.AmbientLight(16766888,.45),l=new THREE.DirectionalLight(16773583,1.2);l.position.set(4,7,5);const p=new THREE.PointLight(10230845,1.5,20);p.position.set(-3,1.5,2);const E=new THREE.PointLight(15779947,1.4,18);E.position.set(3,1.2,-2),t.add(m,l,p,E);const g=new THREE.Mesh(new THREE.PlaneGeometry(16,36),new THREE.MeshStandardMaterial({color:8066869,roughness:.65,metalness:.1}));g.rotation.x=-Math.PI/2,g.position.y=-1.2,t.add(g);const b=new THREE.Mesh(new THREE.BoxGeometry(8,1.2,4),new THREE.MeshStandardMaterial({color:1118232,metalness:.25,roughness:.6}));b.position.set(0,-.6,-8),t.add(b);const y=new THREE.Mesh(new THREE.BoxGeometry(6.5,1.2,.4),new THREE.MeshStandardMaterial({color:15779947,emissive:4337408,emissiveIntensity:.8}));y.position.set(0,4.2,-8.5),t.add(y);const T=new THREE.Mesh(new THREE.PlaneGeometry(5.4,3.1),new THREE.MeshStandardMaterial({color:16052198,emissive:16777215,emissiveIntensity:.3}));T.position.set(0,1.5,-9.1),t.add(T);const $=[];for(let a=-3;a<=3;a+=1.5){const s=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,2.4,16),new THREE.MeshStandardMaterial({color:15779947,metalness:.8,roughness:.2}));s.position.set(a,-.1,1.5),t.add(s),$.push(s)}const M=[];for(let a=0;a<8;a++){const s=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.7),new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.95-a*.08,.5,.5),emissive:2230287,emissiveIntensity:.4,side:THREE.DoubleSide}));s.position.set(Math.cos(a)*4,.2+a%3*.5,-2-a*.8),s.rotation.y=(a%2?1:-1)*.35,t.add(s),M.push(s)}const R=[];for(let a=0;a<3;a++)for(let s=-4;s<=4;s+=1){const f=new THREE.Mesh(new THREE.BoxGeometry(.35,.45,.35),new THREE.MeshStandardMaterial({color:2365476,roughness:.85}));f.position.set(s*.6,-.95+a*.18,-4.5-a*.8),t.add(f),R.push(f)}let o=0;function H(){o+=.008,requestAnimationFrame(H),e.position.x=Math.sin(o*.8)*.5,e.position.y=2.35+Math.sin(o*1.6)*.08,e.position.z=8-Math.cos(o*.6)*.25,e.lookAt(0,.5,-4.5),M.forEach((a,s)=>{a.position.y+=Math.sin(o*1.5+s)*.002,a.rotation.z=Math.sin(o+s)*.08}),$.forEach((a,s)=>a.rotation.y=Math.sin(o*1.2+s)*.06),R.forEach((a,s)=>a.scale.y=1+Math.sin(o*2+s*.2)*.03),i.render(t,e)}H(),window.addEventListener("resize",()=>{const a=h.clientWidth,s=h.clientHeight;e.aspect=a/s,e.updateProjectionMatrix(),i.setSize(a,s)})}D(),A(),F(),B()})();
