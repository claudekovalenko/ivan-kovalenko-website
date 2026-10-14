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
  // The real players are heavy, so show a lightweight card and load the player on tap.
  const facade = (label, src, cls) => {
    player.innerHTML = `
      <button class="player__facade" type="button" aria-label="Load the ${label} player">
        <span class="player__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg></span>
        <span class="player__title">${pod.title || "The Podcast"}</span>
        <span class="player__sub">Tap to play episodes · ${label}</span>
      </button>`;
    player.querySelector("button").addEventListener("click", () => {
      player.innerHTML = `<iframe class="${cls}" title="${pod.title || "Podcast"} on ${label}" src="${src}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    }, { once: true });
  };
  if (match) {
    const [, type, id] = match;
    facade("Spotify", `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`, "");
    pointListenAt(pod.spotifyShowUrl);
  } else if (apple) {
    facade("Apple Podcasts", `https://embed.podcasts.apple.com/${apple[1]}?theme=dark`, "player__apple");
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

  // ── Starfield in the hero: drawn once, no animation loop ──
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  const drawStars = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(160, Math.round((w * h) / 9000));
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = `rgba(255, 240, 210, ${0.25 + Math.random() * 0.6})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h * 0.85, Math.random() * 1.2 + 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  let lastWidth = innerWidth;
  addEventListener("resize", () => {
    if (innerWidth !== lastWidth) {
      lastWidth = innerWidth;
      drawStars();
    }
  });
  drawStars();
})();
