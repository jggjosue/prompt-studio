(function () {
  const filmData = [
    ["Midnight Signal", "Lena Cross", "France", "Thriller", "108 min", "Premiere"],
    ["The Last Frame", "Diego Maren", "Mexico", "Drama", "96 min", "Competition"],
    ["City of Glass", "Nora Vale", "Japan", "Sci-Fi", "124 min", "Premiere"],
    ["Echoes of Tomorrow", "Iris Kwon", "South Korea", "Drama", "112 min", "Competition"],
    ["Silent Harbor", "Amir Solis", "Canada", "Mystery", "88 min", "Short Film"],
    ["Neon Orchard", "Tara Leone", "Italy", "Romance", "101 min", "Premiere"],
    ["The Paper Moon", "Hana Becker", "Germany", "Documentary", "77 min", "Documentary"],
    ["After the Rain", "Jonas Reed", "Brazil", "Drama", "90 min", "Competition"],
  ];

  const trailerData = [
    ["Red Carpet First Look", "02:14", "Festival Intro"],
    ["Midnight Signal Trailer", "01:58", "Thriller"],
    ["Awards Night Teaser", "01:05", "Gala"],
    ["Official Selection Reel", "02:33", "Montage"],
    ["Press Day Snapshot", "01:19", "Media"],
    ["Closing Reception Promo", "01:47", "Networking"],
  ];

  const scheduleData = [
    ["10:00", "Opening Screening", "Grand Theater", "Premiere"],
    ["12:00", "Documentary Spotlight", "Documentary Hall", "Docs"],
    ["14:00", "Short Film Competition", "Indie Screening Room", "Competition"],
    ["16:00", "Director Q&A", "Q&A Stage", "Talkback"],
    ["18:00", "Red Carpet Premiere", "Main Entrance", "Gala"],
    ["20:00", "Awards Night", "Awards Stage", "Ceremony"],
    ["22:00", "Closing Reception", "Networking Lounge", "Social"],
  ];

  const venueData = [
    ["Grand Theater", "1,200 seats", "Dolby Atmos, 4K projection"],
    ["Indie Screening Room", "320 seats", "Intimate premieres and shorts"],
    ["Documentary Hall", "260 seats", "Panel-friendly projection"],
    ["Outdoor Cinema", "500 seats", "Night screenings under the sky"],
    ["Press Lounge", "80 seats", "Interview and media check-in"],
    ["Director Q&A Stage", "140 seats", "Talkbacks and live discussion"],
  ];

  const awardData = [
    ["Best Feature Film", "Top narrative feature of the year."],
    ["Best Short Film", "A sharp, unforgettable short-form voice."],
    ["Best Documentary", "Outstanding nonfiction storytelling."],
    ["Best Director", "Vision, control, and cinematic rhythm."],
    ["Best Cinematography", "Light, movement, composition."],
    ["Audience Choice Award", "The crowd’s favorite selection."],
    ["Emerging Talent Award", "Breakthrough work from new voices."],
  ];

  const juryData = [
    ["Elena Moreau", "Film Director", "Craft-first storyteller with a love for tension and atmosphere."],
    ["Marco Silva", "Cinematographer", "Focuses on texture, movement, and luminous framing."],
    ["Aisha Bennett", "Producer", "Champions bold production design and audience reach."],
    ["Kenji Tanaka", "Screenwriter", "Looks for sharp dialogue and structural elegance."],
    ["Sofia Hart", "Festival Curator", "Builds selection arcs that feel contemporary and resonant."],
  ];

  const state = { modalOpen: false, saved: new Set() };
  const $ = (s) => document.querySelector(s);
  const canvasHost = $("#festivalCanvas");
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  const toast = $("#toast");

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function openModal(content) {
    modalBody.innerHTML = content;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    state.modalOpen = true;
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    state.modalOpen = false;
  }

  function buildCards() {
    $("#filmGrid").innerHTML = filmData.map(([title, director, country, genre, duration, status]) => `
      <article class="film-card card glass">
        <div class="poster"></div>
        <h3>${title}</h3>
        <div class="meta">${director} · ${country}</div>
        <div class="meta">${genre} · ${duration} · ${status}</div>
        <p class="meta">A premium festival selection designed to feel editorial, atmospheric, and award-ready.</p>
        <div class="actions">
          <button class="btn btn-ghost js-view-film" data-title="${title}" data-director="${director}" data-country="${country}" data-genre="${genre}" data-duration="${duration}" data-status="${status}">View Film</button>
          <button class="btn btn-accent js-watch-trailer" data-title="${title}">Watch Trailer</button>
        </div>
      </article>
    `).join("");

    $("#trailerGrid").innerHTML = trailerData.map(([title, duration, category]) => `
      <article class="card glass">
        <div class="poster"></div>
        <h3>${title}</h3>
        <div class="meta">${duration} · ${category}</div>
        <button class="btn btn-ghost action js-play-trailer" data-title="${title}">Play Trailer</button>
      </article>
    `).join("");

    $("#scheduleList").innerHTML = scheduleData.map(([time, title, room, category], i) => `
      <article class="timeline-item glass">
        <div class="time">${time}</div>
        <div>
          <h3>${title}</h3>
          <p>${room} · ${category}</p>
        </div>
        <div class="actions">
          <button class="btn btn-ghost js-view-details" data-title="${title}" data-room="${room}">View Details</button>
          <button class="btn btn-accent js-add-agenda" data-index="${i}">Add to Agenda</button>
        </div>
      </article>
    `).join("");

    $("#venueGrid").innerHTML = venueData.map(([name, capacity, projection]) => `
      <article class="venue-card card glass">
        <h3>${name}</h3>
        <div class="meta">${capacity}</div>
        <p class="meta">${projection}</p>
        <button class="btn btn-ghost action js-view-venue" data-name="${name}">View Venue</button>
      </article>
    `).join("");

    $("#awardGrid").innerHTML = awardData.map(([name, desc]) => `
      <article class="card glass">
        <h3>✦ ${name}</h3>
        <p class="meta">${desc}</p>
        <button class="btn btn-ghost action js-view-nominees" data-name="${name}">View Nominees</button>
      </article>
    `).join("");

    $("#juryGrid").innerHTML = juryData.map(([name, role, bio]) => `
      <article class="jury-card card glass">
        <h3>${name}</h3>
        <div class="meta">${role}</div>
        <p class="meta">${bio}</p>
        <button class="btn btn-ghost action js-read-bio" data-name="${name}" data-role="${role}" data-bio="${bio}">Read Bio</button>
      </article>
    `).join("");

    $("#ticketGrid").innerHTML = [
      ["Day Pass", "$39", "Single-day screenings and lounges"],
      ["Full Festival Pass", "$129", "All screenings and awards night"],
      ["Premiere Night Ticket", "$59", "Red carpet entrance and premiere"],
      ["Student Pass", "$24", "Discounted access with ID"],
      ["VIP Red Carpet Pass", "$199", "Priority seating and lounge access"],
      ["Industry Pass", "$249", "Press room, Q&A, and networking"],
    ].map(([name, price, benefits]) => `
      <article class="ticket-card card glass">
        <h3>${name}</h3>
        <div class="ticket-price">${price}</div>
        <p class="meta">${benefits}</p>
        <button class="btn btn-accent js-buy-ticket" data-name="${name}">Buy Ticket</button>
      </article>
    `).join("");
  }

  function bindActions() {
    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("button, a");
      if (!btn) return;
      if (btn.matches("[data-scroll]")) {
        document.querySelector(btn.dataset.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (btn.id === "enterFestival") {
        animateEntrance();
      }
      if (btn.classList.contains("js-view-film")) {
        openModal(`<h2>${btn.dataset.title}</h2><p>${btn.dataset.director} · ${btn.dataset.country} · ${btn.dataset.genre} · ${btn.dataset.duration} · ${btn.dataset.status}</p><p>A preview panel with festival notes, selection rationale, and visual treatment for the film card.</p>`);
      }
      if (btn.classList.contains("js-watch-trailer") || btn.classList.contains("js-play-trailer")) {
        openModal(`<h2>${btn.dataset.title}</h2><p>Trailer playback simulated for the premium festival presentation.</p><div style="height:220px;border-radius:24px;background:radial-gradient(circle at center, rgba(240,200,107,.24), rgba(0,0,0,.92) 62%), linear-gradient(135deg, rgba(156,28,61,.55), rgba(19,17,27,.95));display:grid;place-items:center;margin-top:16px">Play Trailer</div>`);
      }
      if (btn.classList.contains("js-view-details")) {
        openModal(`<h2>${btn.dataset.title}</h2><p><strong>Location:</strong> ${btn.dataset.room}</p><p>Expanded session details, seating notes, and agenda visibility for this block in the timeline.</p>`);
      }
      if (btn.classList.contains("js-add-agenda")) {
        btn.textContent = "Saved";
        btn.classList.add("saved");
        showToast("Added to agenda");
      }
      if (btn.classList.contains("js-view-venue")) {
        openModal(`<h2>${btn.dataset.name}</h2><p>Venue spotlight with projection, capacity, and spatial notes for the festival map.</p>`);
      }
      if (btn.classList.contains("js-view-nominees")) {
        openModal(`<h2>${btn.dataset.name}</h2><p>Nominee list simulated for the award category and screening context.</p>`);
      }
      if (btn.classList.contains("js-read-bio")) {
        openModal(`<h2>${btn.dataset.name}</h2><p>${btn.dataset.role}</p><p>${btn.dataset.bio}</p>`);
      }
      if (btn.classList.contains("js-buy-ticket")) {
        showToast(`${btn.dataset.name} selected`);
        openModal(`<h2>${btn.dataset.name}</h2><p>Ticket checkout modal. Availability confirmed and purchase path ready.</p>`);
      }
      if (btn.classList.contains("action")) showToast(btn.textContent.trim());
    });

    $("#navToggle").addEventListener("click", () => $("#nav").classList.toggle("open"));
    $("#modalClose").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    $("#contactForm").addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("You are on the festival list");
      e.target.reset();
    });
  }

  function animateEntrance() {
    showToast("Entering the festival");
    if (window.gsap) {
      gsap.fromTo(".hero-canvas-wrap", { scale: .96, filter: "blur(4px)" }, { scale: 1, filter: "blur(0px)", duration: .9, ease: "power2.out" });
      gsap.to(".hero-badge,.floating-card", { y: -10, stagger: .06, duration: .6, yoyo: true, repeat: 1, ease: "power1.inOut" });
    }
  }

  function setupReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, { threshold: .16 });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  }

  function createScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x09070d, 6, 18);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 2.4, 8);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvasHost.clientWidth, canvasHost.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    canvasHost.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffd7a8, .45);
    const key = new THREE.DirectionalLight(0xfff1cf, 1.2);
    key.position.set(4, 7, 5);
    const red = new THREE.PointLight(0x9c1c3d, 1.5, 20);
    red.position.set(-3, 1.5, 2);
    const gold = new THREE.PointLight(0xf0c86b, 1.4, 18);
    gold.position.set(3, 1.2, -2);
    scene.add(ambient, key, red, gold);

    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(16, 36), new THREE.MeshStandardMaterial({ color: 0x7b1735, roughness: .65, metalness: .1 }));
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.y = -1.2;
    scene.add(carpet);

    const stage = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 4), new THREE.MeshStandardMaterial({ color: 0x111018, metalness: .25, roughness: .6 }));
    stage.position.set(0, -0.6, -8);
    scene.add(stage);

    const marquee = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.2, 0.4), new THREE.MeshStandardMaterial({ color: 0xf0c86b, emissive: 0x422f00, emissiveIntensity: .8 }));
    marquee.position.set(0, 4.2, -8.5);
    scene.add(marquee);

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.1), new THREE.MeshStandardMaterial({ color: 0xf4efe6, emissive: 0xffffff, emissiveIntensity: .3 }));
    screen.position.set(0, 1.5, -9.1);
    scene.add(screen);

    const posts = [];
    for (let i = -3; i <= 3; i += 1.5) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 2.4, 16), new THREE.MeshStandardMaterial({ color: 0xf0c86b, metalness: .8, roughness: .2 }));
      post.position.set(i, -0.1, 1.5);
      scene.add(post);
      posts.push(post);
    }

    const floating = [];
    for (let i = 0; i < 8; i++) {
      const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.7), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(.95 - i * .08, .5, .5), emissive: 0x22080f, emissiveIntensity: .4, side: THREE.DoubleSide }));
      poster.position.set(Math.cos(i) * 4, 0.2 + (i % 3) * .5, -2 - i * .8);
      poster.rotation.y = (i % 2 ? 1 : -1) * .35;
      scene.add(poster);
      floating.push(poster);
    }

    const seats = [];
    for (let row = 0; row < 3; row++) {
      for (let seat = -4; seat <= 4; seat += 1) {
        const chair = new THREE.Mesh(new THREE.BoxGeometry(.35, .45, .35), new THREE.MeshStandardMaterial({ color: 0x241824, roughness: .85 }));
        chair.position.set(seat * .6, -0.95 + row * .18, -4.5 - row * .8);
        scene.add(chair);
        seats.push(chair);
      }
    }

    let t = 0;
    function animate() {
      t += .008;
      requestAnimationFrame(animate);
      camera.position.x = Math.sin(t * .8) * .5;
      camera.position.y = 2.35 + Math.sin(t * 1.6) * .08;
      camera.position.z = 8 - Math.cos(t * .6) * .25;
      camera.lookAt(0, .5, -4.5);
      floating.forEach((m, i) => {
        m.position.y += Math.sin(t * 1.5 + i) * .002;
        m.rotation.z = Math.sin(t + i) * .08;
      });
      posts.forEach((m, i) => m.rotation.y = Math.sin(t * 1.2 + i) * .06);
      seats.forEach((m, i) => m.scale.y = 1 + Math.sin(t * 2 + i * .2) * .03);
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
      const w = canvasHost.clientWidth;
      const h = canvasHost.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  buildCards();
  bindActions();
  setupReveal();
  createScene();
})();
