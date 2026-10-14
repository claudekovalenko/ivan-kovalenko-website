(() => {
  const S = window.SITE || {};
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), S);

  // ── Fill text from config.js ─────────────────────────────
  document.querySelectorAll("[data-site]").forEach((el) => {
    const v = get(el.dataset.site);
    if (v) el.textContent = v;
  });
  if (S.name) document.title = `${S.name} — Ministry & Podcast`;
  document.getElementById("year").textContent = new Date().getFullYear();

  // ── Spotify embed ────────────────────────────────────────
  const pod = S.podcast || {};
  const player = document.getElementById("player");
  const match = (pod.spotifyShowUrl || "").match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(show|episode)\/([A-Za-z0-9]+)/);
  const apple = (pod.applePodcastsUrl || "").match(/podcasts\.apple\.com\/(.+)$/);
  const listenLinks = document.querySelectorAll("[data-spotify-link]");
  const pointListenAt = (url, label) => listenLinks.forEach((a) => {
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    if (label) a.querySelector("[data-listen-label]").textContent = label;
  });
  if (match) {
    const [, type, id] = match;
    player.innerHTML = `<iframe title="${pod.title || "Podcast"} on Spotify" src="https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    pointListenAt(pod.spotifyShowUrl);
  } else if (apple) {
    player.innerHTML = `<iframe class="player__apple" title="${pod.title || "Podcast"} on Apple Podcasts" src="https://embed.podcasts.apple.com/${apple[1]}?theme=dark" allow="autoplay *; encrypted-media *; clipboard-write" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" loading="lazy"></iframe>`;
    pointListenAt(pod.applePodcastsUrl, "Listen now");
  } else {
    player.innerHTML = `
      <div class="player__empty">
        <h3>Episodes coming soon</h3>
        <p>Add your Spotify or Apple Podcasts show link in <code>config.js</code> and the player appears here.</p>
      </div>`;
  }

  const platforms = document.getElementById("platforms");
  [
    ["Spotify", pod.spotifyShowUrl, "btn btn--spotify"],
    ["Apple Podcasts", pod.applePodcastsUrl, "btn btn--ghost"],
    ["YouTube", pod.youtubeUrl, "btn btn--ghost"],
  ].forEach(([label, url, cls]) => {
    if (!url) return;
    platforms.insertAdjacentHTML("beforeend", `<li><a class="${cls}" href="${url}" target="_blank" rel="noopener">${label}</a></li>`);
  });

  // ── Socials & giving ─────────────────────────────────────
  const socials = document.getElementById("socials");
  const names = { instagram: "Instagram", youtube: "YouTube", facebook: "Facebook" };
  Object.entries(S.social || {}).forEach(([k, url]) => {
    if (url) socials.insertAdjacentHTML("beforeend", `<li><a href="${url}" target="_blank" rel="noopener">${names[k] || k}</a></li>`);
  });
  if (S.givingUrl) {
    document.getElementById("give").hidden = false;
    document.getElementById("give-link").href = S.givingUrl;
  }

  // ── Contact form → opens the visitor's email app ─────────
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!S.email) {
        note.textContent = "The contact form isn't set up yet. Please check back soon!";
        return;
      }
      const d = new FormData(form);
      if (!d.get("name") || !d.get("message")) {
        note.textContent = "Please add your name and a message.";
        return;
      }
      const subject = `${d.get("topic")} — from ${d.get("name")}`;
      location.href = `mailto:${S.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(d.get("message"))}`;
      note.textContent = "Opening your email app… thank you for reaching out!";
  });

  // ── Nav: background on scroll + mobile menu ──────────────
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector(".nav__toggle");
  const links = document.getElementById("nav-links");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", open);
    links.classList.toggle("is-open", open);
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("is-open");
    }
  });

  // ── Waveform bars ────────────────────────────────────────
  const wave = document.getElementById("wave");
  const bars = innerWidth < 600 ? 28 : 40;
  for (let i = 0; i < bars; i++) {
    const b = document.createElement("i");
    const center = 1 - Math.abs(i - bars / 2) / (bars / 2);
    b.style.setProperty("--h", `${Math.round(30 + center * 55 + Math.random() * 15)}%`);
    b.style.animationDelay = `${(-Math.random() * 1.4).toFixed(2)}s`;
    b.style.animationDuration = `${(1 + Math.random() * 0.8).toFixed(2)}s`;
    wave.appendChild(b);
  }

  // ── Scroll reveal ────────────────────────────────────────
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      }
    }),
    { threshold: 0.15 }
  );
  document.querySelectorAll(".cards .reveal").forEach((el, i) => el.style.setProperty("--d", `${i * 0.12}s`));
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // ── Twinkling starfield in the hero ──────────────────────
  const canvas = document.getElementById("stars");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  let stars = [];
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((canvas.offsetWidth * canvas.offsetHeight) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight * 0.85,
      r: Math.random() * 1.2 + 0.2,
      p: Math.random() * Math.PI * 2,
      s: 0.5 + Math.random() * 1.5,
    }));
  };
  const draw = (t) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const st of stars) {
      const a = 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(st.p + (t / 1000) * st.s));
      ctx.fillStyle = `rgba(255, 240, 210, ${a})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();
