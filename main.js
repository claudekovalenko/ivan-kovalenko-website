(() => {
  const S = window.SITE || {};
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), S);

  // ── Fill text from config.js ─────────────────────────────
  document.querySelectorAll("[data-site]").forEach((el) => {
    const v = get(el.dataset.site);
    if (v) el.textContent = v;
  });
  document.getElementById("year").textContent = new Date().getFullYear();

  // ── Podcast player ───────────────────────────────────────
  // The real players are heavy, so show a lightweight card and load the player on tap.
  const pod = S.podcast || {};
  const player = document.getElementById("player");
  const spotify = (pod.spotifyShowUrl || "").match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(show|episode)\/([A-Za-z0-9]+)/);
  const apple = (pod.applePodcastsUrl || "").match(/podcasts\.apple\.com\/(.+)$/);
  const facade = (label, src, cls) => {
    player.innerHTML = `
      <button class="player__facade" type="button" aria-label="Play ${pod.title || "the podcast"} on ${label}">
        <span class="player__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg></span>
        <span class="player__title">${pod.title || "The Podcast"}</span>
        <span class="player__sub">Tap to play episodes on ${label}</span>
      </button>`;
    player.querySelector("button").addEventListener("click", () => {
      player.innerHTML = `<iframe class="${cls}" title="${pod.title || "Podcast"} on ${label}" src="${src}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    }, { once: true });
  };
  if (spotify) {
    const [, type, id] = spotify;
    facade("Spotify", `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`, "");
  } else if (apple) {
    facade("Apple Podcasts", `https://embed.podcasts.apple.com/${apple[1]}`, "player__apple");
  } else {
    player.innerHTML = `<div class="player__empty">Episodes coming soon.</div>`;
  }

  const platforms = document.getElementById("platforms");
  [
    ["Listen on Spotify", pod.spotifyShowUrl, "btn"],
    ["Apple Podcasts", pod.applePodcastsUrl, "btn btn--outline"],
    ["YouTube", pod.youtubeUrl, "btn btn--outline"],
  ].forEach(([label, url, cls]) => {
    if (url) platforms.insertAdjacentHTML("beforeend", `<a class="${cls}" href="${url}" target="_blank" rel="noopener">${label}</a>`);
  });

  // ── Socials & giving ─────────────────────────────────────
  const socials = document.getElementById("socials");
  const names = { instagram: "Instagram", youtube: "YouTube", facebook: "Facebook" };
  Object.entries(S.social || {}).forEach(([k, url]) => {
    if (url) socials.insertAdjacentHTML("beforeend", `<a href="${url}" target="_blank" rel="noopener">${names[k] || k}</a>`);
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

  // ── Nav: border on scroll + mobile menu ──────────────────
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 10);
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
})();
