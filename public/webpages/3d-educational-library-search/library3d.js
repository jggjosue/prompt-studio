(function(){"use strict";const m=[{title:"Introduction to Data Science",type:"Books",category:"Science",level:"University",meta:"320 pages \xB7 MIT Press",description:"A guided path into data thinking, analytics, and evidence-based decision making.",tags:["data","science","books"]},{title:"World History Visual Guide",type:"Articles",category:"History",level:"High School",meta:"18 min read \xB7 Illustrated",description:"Timeline-led exploration of major civilizations, movements, and turning points.",tags:["history","articles","visual"]},{title:"Algebra Practice Workbook",type:"Worksheets",category:"Mathematics",level:"Middle School",meta:"84 exercises \xB7 PDF",description:"Structured drills for equations, functions, and problem solving.",tags:["math","worksheet","practice"]},{title:"Creative Writing Essentials",type:"Courses",category:"Literature",level:"All Levels",meta:"6 modules \xB7 Self-paced",description:"Build voice, structure, and confidence with prompts, critiques, and examples.",tags:["writing","course","creativity"]},{title:"Physics Experiments for Students",type:"Videos",category:"Science",level:"High School",meta:"12 videos \xB7 Lab demos",description:"Short experiments that translate concepts into visible classroom demonstrations.",tags:["physics","video","experiments"]},{title:"English Grammar Toolkit",type:"Study Guides",category:"Languages",level:"Grade Level",meta:"Compact guide \xB7 ESL ready",description:"Clear rules, examples, and revision templates for fluency and exam prep.",tags:["grammar","guide","languages"]},{title:"AI for Beginners",type:"Books",category:"Technology",level:"University",meta:"240 pages \xB7 Intro level",description:"A friendly primer on machine learning, models, and real-world applications.",tags:["ai","technology","books"]},{title:"Teacher Lesson Plan Library",type:"Teachers",category:"Personal Development",level:"Teachers",meta:"120 templates \xB7 Shared packs",description:"Ready-made lesson structures, rubrics, and collaborative planning assets.",tags:["teachers","planning","resources"]}],x=["Science","Mathematics","History","Literature","Technology","Art","Languages","Business","Health","Engineering","Social Studies","Personal Development"],I=["Exam Preparation","Chapter Summaries","Practice Questions","Flashcards","Reading Notes","Research Templates"],P=["Lesson Plans","Classroom Activities","Worksheets","Assessment Rubrics","Presentation Slides","Student Reading Lists"],B=[{name:"Free Student Access",price:"$0",features:"Basic search, saved list, and a limited library view.",resources:"120 resources",support:"Community support"},{name:"Student Plus",price:"$9",featured:!0,features:"Unlimited search, study guides, and personalized suggestions.",resources:"1,200 resources",support:"Priority email support"},{name:"Teacher Toolkit",price:"$19",features:"Lesson packs, rubrics, reading lists, and classroom bundles.",resources:"2,000 resources",support:"Teacher support chat"},{name:"School Library Pro",price:"$49",features:"Team access, analytics, and shared resource governance.",resources:"Unlimited resources",support:"Dedicated account help"}],C=[{label:"Resources Saved",value:12,suffix:"",progress:88},{label:"Courses Viewed",value:6,suffix:"",progress:63},{label:"Study Guides Opened",value:4,suffix:"",progress:52},{label:"Weekly Learning Goal",value:80,suffix:"%",progress:80},{label:"Teacher Packs Created",value:3,suffix:"",progress:41}],r={filter:"All",query:"",saved:new Set(["AI for Beginners","Teacher Lesson Plan Library"]),currentPreview:m[0],recommendationsSeed:0},a={header:document.querySelector(".site-header"),menuToggle:document.getElementById("menu-toggle"),searchInput:document.getElementById("search-input"),searchBtn:document.getElementById("search-btn"),clearSearchBtn:document.getElementById("clear-search-btn"),results:document.getElementById("search-results"),categoryGrid:document.getElementById("category-grid"),studyGuideGrid:document.getElementById("study-guide-grid"),teacherGrid:document.getElementById("teacher-grid"),recommendationRail:document.getElementById("recommendation-rail"),statsGrid:document.getElementById("stats-grid"),pricingGrid:document.getElementById("pricing-grid"),preview:document.getElementById("reading-preview"),refreshRecommendations:document.getElementById("refresh-recommendations"),buildPackBtn:document.getElementById("build-pack-btn"),modal:document.getElementById("resource-modal"),modalClose:document.getElementById("modal-close"),modalContent:document.getElementById("modal-content"),canvas:document.getElementById("library-canvas")};let i,l,u,o,G=[],b=[],A=null,q=new THREE.Clock;function W(){i=new THREE.Scene,i.fog=new THREE.Fog(528671,8,28),l=new THREE.PerspectiveCamera(42,a.canvas.clientWidth/a.canvas.clientHeight,.1,100),l.position.set(0,2.8,10.5),u=new THREE.WebGLRenderer({canvas:a.canvas,antialias:!0,alpha:!0}),u.setPixelRatio(Math.min(window.devicePixelRatio,2)),u.setSize(a.canvas.clientWidth,a.canvas.clientHeight,!1),u.toneMapping=THREE.ACESFilmicToneMapping;const e=new THREE.AmbientLight(16777215,1.2);i.add(e);const t=new THREE.DirectionalLight(16773592,2.2);t.position.set(-2,8,8),i.add(t);const n=new THREE.PointLight(9221631,1.8,30);n.position.set(4,2,6),i.add(n);const s=new THREE.PointLight(9696711,1.6,24);s.position.set(-4,2,2),i.add(s),o=new THREE.Group,i.add(o);const d=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:1056819,roughness:1}));d.rotation.x=-Math.PI/2,d.position.y=-.9,i.add(d);const p=new THREE.Mesh(new THREE.BoxGeometry(28,12,.5),new THREE.MeshStandardMaterial({color:859185,roughness:1}));p.position.set(0,4.5,-8),i.add(p);const Q=new THREE.MeshStandardMaterial({color:2176338,roughness:.8});for(let g=0;g<4;g++){const w=new THREE.Mesh(new THREE.BoxGeometry(12,.12,.3),Q);w.position.set(0,-.2+g*1.8,-2.2),G.push(w),o.add(w);for(let v=0;v<10;v++){const f=new THREE.Mesh(new THREE.BoxGeometry(.3,1.1,.18),new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL((g*10+v)/40,.55,.56),roughness:.55}));f.position.set(-5.3+v*1.1,.65+g*1.8,-2),f.rotation.y=.08*Math.sin(v),b.push(f),o.add(f)}}const M=new THREE.Mesh(new THREE.BoxGeometry(5.8,.45,2.2),new THREE.MeshStandardMaterial({color:7099192,roughness:.7}));M.position.set(0,-.1,1.8),o.add(M);const H=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.8,.12),new THREE.MeshStandardMaterial({color:664118,emissive:1457503,emissiveIntensity:.7}));H.position.set(0,2,1.4),o.add(H);const k=new THREE.Mesh(new THREE.SphereGeometry(.46,32,32),new THREE.MeshStandardMaterial({color:9696711,emissive:9696711,emissiveIntensity:.8}));k.position.set(-2.8,2.4,2.4),o.add(k);const E=new THREE.Mesh(new THREE.CylinderGeometry(.04,.6,2.2,18,1,!0),new THREE.MeshStandardMaterial({color:15908723,transparent:!0,opacity:.35,side:THREE.DoubleSide}));E.position.set(2.8,2.6,2.2),E.rotation.x=Math.PI,o.add(E)}function T(){const e=q.getElapsedTime();b.forEach((t,n)=>{t.position.y+=Math.sin(e*1.1+n)*.0015,t.rotation.z=Math.sin(e*.8+n)*.02}),o.rotation.y=Math.sin(e*.12)*.08,l.position.x=Math.sin(e*.08)*.15,u.render(i,l),A=requestAnimationFrame(T)}function c(e){a.modalContent.innerHTML=e,a.modal.classList.remove("hidden")}function R(){a.modal.classList.add("hidden")}function j(e){const t=r.saved.has(e.title);return`
      <article class="card">
        <p class="meta-tag">${e.type}</p>
        <h3>${e.title}</h3>
        <div class="meta-row">
          <span class="meta-tag">${e.category}</span>
          <span class="meta-tag">${e.level}</span>
          <span class="meta-tag">${e.meta}</span>
        </div>
        <p>${e.description}</p>
        <div class="button-row">
          <button class="button secondary" data-view="${e.title}">View Resource</button>
          <button class="button ghost" data-save="${e.title}">${t?"Saved":"Save"}</button>
        </div>
      </article>`}function h(){const e=r.query.toLowerCase(),t=m.filter(n=>{const s=r.filter==="All"||n.type===r.filter,d=`${n.title} ${n.description} ${n.category} ${n.level} ${n.tags.join(" ")}`.toLowerCase(),p=!e||d.includes(e);return s&&p});a.results.innerHTML=t.length?t.map(j).join(""):'<div class="card"><h3>No results yet</h3><p>Try a different keyword or choose another filter.</p></div>'}function D(){a.categoryGrid.innerHTML=x.map(e=>`
      <article class="card">
        <p class="meta-tag">Category</p>
        <h3>${e}</h3>
        <p>Curated academic resources, books, and guided paths for ${e.toLowerCase()} learners.</p>
        <div class="meta-row">
          <span class="meta-tag">${Math.floor(80+Math.random()*140)} resources</span>
        </div>
        <button class="button secondary" data-category="${e}">Open Category</button>
      </article>
    `).join("")}function F(){a.studyGuideGrid.innerHTML=I.map(e=>`
      <article class="card">
        <h3>${e}</h3>
        <p>Practical structure for revision, note taking, and test readiness.</p>
        <button class="button secondary" data-guide="${e}">Open Guide</button>
      </article>
    `).join("")}function V(){a.teacherGrid.innerHTML=P.map(e=>`
      <article class="card">
        <h3>${e}</h3>
        <p>Built for lesson planning, classroom workflow, and student support.</p>
        <button class="button secondary" data-teacher="${e}">View Teacher Resource</button>
      </article>
    `).join("")}function $(){const e=m.slice().sort(()=>.5-Math.random()).slice(0,5),t=["Recommended for Students","Recommended for Teachers","Trending This Week","Continue Learning","New Resources"];a.recommendationRail.innerHTML=t.map((n,s)=>`
      <article class="recommendation-card">
        <h3>${n}</h3>
        <p>${e[s].title}</p>
        <div class="meta-row">
          <span class="meta-tag">${e[s].type}</span>
          <span class="meta-tag">${e[s].category}</span>
        </div>
        <button class="button secondary" data-view="${e[s].title}">View Resource</button>
      </article>
    `).join("")}function z(){a.statsGrid.innerHTML=C.map(e=>`
      <article class="stat-card">
        <h3>${e.label}</h3>
        <div class="metric-value" data-count="${e.value}" data-suffix="${e.suffix}">0${e.suffix}</div>
        <div class="progress"><span style="width:${e.progress}%"></span></div>
      </article>
    `).join(""),N()}function O(){a.pricingGrid.innerHTML=B.map(e=>`
      <article class="pricing-card ${e.featured?"featured":""}">
        <p class="meta-tag">${e.featured?"Most Popular":"Access Plan"}</p>
        <h3>${e.name}</h3>
        <div class="price">${e.price}</div>
        <p>${e.features}</p>
        <div class="meta-row">
          <span class="meta-tag">${e.resources}</span>
          <span class="meta-tag">${e.support}</span>
        </div>
        <button class="button primary" data-plan="${e.name}">Choose Plan</button>
      </article>
    `).join("")}function y(e=r.currentPreview){a.preview.innerHTML=`
      <div class="preview-title">${e.title}</div>
      <p>${e.description}</p>
      <div class="meta-row">
        <span class="meta-tag">${e.type}</span>
        <span class="meta-tag">${e.level}</span>
        <span class="meta-tag">${e.meta}</span>
      </div>
      <div class="preview-list">
        <div><strong>Summary</strong><span>High-level overview</span></div>
        <div><strong>Index</strong><span>${e.category}</span></div>
        <div><strong>Time</strong><span>${e.type==="Videos"?"12 min":"5 min preview"}</span></div>
      </div>
      <div class="button-row">
        <button class="button primary" data-start-reading="${e.title}">Start Reading</button>
        <button class="button secondary" data-add-list="${e.title}">Add to List</button>
        <button class="button ghost" data-share="${e.title}">Share Resource</button>
      </div>`}function N(){document.querySelectorAll(".metric-value").forEach(e=>{const t=Number(e.dataset.count||0),n=e.dataset.suffix||"";let s=0;const d=Math.max(1,Math.ceil(t/30)),p=()=>{s=Math.min(t,s+d),e.textContent=`${s}${n}`,s<t&&requestAnimationFrame(p)};p()})}function Y(e,t){c(`<h2>${t}</h2><p>This simulated action is ready for the premium library flow.</p>`)}document.addEventListener("click",e=>{const t=e.target.closest("[data-view],[data-save],[data-category],[data-guide],[data-teacher],[data-plan],[data-start-reading],[data-add-list],[data-share]");if(!t)return;const n=t.dataset.view||t.dataset.category||t.dataset.guide||t.dataset.teacher||t.dataset.plan||t.dataset.startReading||t.dataset.addList||t.dataset.share;if(t.dataset.view){const s=m.find(d=>d.title===t.dataset.view);r.currentPreview=s||r.currentPreview,y(),c(`<h2>${s.title}</h2><p>${s.description}</p><p><strong>Type:</strong> ${s.type} | <strong>Level:</strong> ${s.level}</p>`);return}if(t.dataset.save){r.saved.has(t.dataset.save)?r.saved.delete(t.dataset.save):r.saved.add(t.dataset.save),h(),y();return}if(t.dataset.category){r.filter="All",r.query=t.dataset.category,a.searchInput.value=t.dataset.category,h(),y(m.find(s=>s.category===t.dataset.category)||r.currentPreview);return}if(t.dataset.guide){c(`<h2>${t.dataset.guide}</h2><p>A guided study flow with checkpoints, examples, and quick review prompts.</p>`);return}if(t.dataset.teacher){c(`<h2>${t.dataset.teacher}</h2><p>Teacher-ready materials with classroom-first structure and flexible delivery.</p>`);return}if(t.dataset.plan){c(`<h2>${t.dataset.plan}</h2><p>Plan selected. Continue from Contact to complete the access request.</p>`);return}if(t.dataset.startReading){c(`<h2>Start Reading</h2><p>${t.dataset.startReading} is now open in a simulated preview reader.</p>`);return}if(t.dataset.addList){c(`<h2>Added to List</h2><p>${t.dataset.addList} has been saved to your reading list.</p>`);return}t.dataset.share&&c(`<h2>Share Resource</h2><p>A shareable link has been prepared for ${t.dataset.share}.</p>`)}),a.searchBtn.addEventListener("click",()=>{if(r.query=a.searchInput.value.trim(),!r.query){c("<h2>Search library</h2><p>Please enter a topic, author, course, or guide to see results.</p>");return}h()}),a.clearSearchBtn.addEventListener("click",()=>{r.query="",a.searchInput.value="",h()}),a.searchInput.addEventListener("input",()=>{r.query=a.searchInput.value.trim()}),a.searchInput.addEventListener("keydown",e=>{e.key==="Enter"&&a.searchBtn.click()}),document.querySelectorAll("[data-filter]").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll("[data-filter]").forEach(t=>t.classList.remove("is-active")),e.classList.add("is-active"),r.filter=e.dataset.filter,h()})}),document.querySelectorAll("[data-scroll]").forEach(e=>{e.addEventListener("click",()=>document.querySelector(e.dataset.scroll)?.scrollIntoView({behavior:"smooth",block:"start"}))}),document.querySelectorAll('[data-action="enter-library"]').forEach(e=>{e.addEventListener("click",()=>{window.scrollTo({top:document.getElementById("search").offsetTop-80,behavior:"smooth"}),l.position.set(0,2.2,7.2),o.rotation.y+=.3})}),a.refreshRecommendations.addEventListener("click",()=>{r.recommendationsSeed+=1,$()}),a.buildPackBtn.addEventListener("click",()=>{c("<h2>Class Resource Pack</h2><p>Your simulated pack includes lesson plans, activities, worksheets, and reading lists curated for a classroom unit.</p>")}),a.menuToggle.addEventListener("click",()=>{const e=a.header.classList.toggle("nav-open");a.menuToggle.setAttribute("aria-expanded",String(e))}),a.modal.addEventListener("click",e=>{e.target===a.modal&&R()}),a.modalClose.addEventListener("click",R);const U=new IntersectionObserver(e=>{e.forEach(t=>{t.isIntersecting&&t.target.classList.add("is-visible")})},{threshold:.16});document.querySelectorAll(".reveal").forEach(e=>U.observe(e));function S(){if(!u||!l)return;const e=a.canvas.clientWidth,t=a.canvas.clientHeight;l.aspect=e/t,l.updateProjectionMatrix(),u.setSize(e,t,!1)}window.addEventListener("resize",S);function L(){W(),h(),D(),F(),V(),$(),z(),O(),y(),T(),S()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",L):L()})();
