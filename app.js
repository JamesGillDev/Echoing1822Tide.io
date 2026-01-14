/* =========================================================
   Career Lifeline — James Gill
   Drop-in app.js for GitHub Pages (static)
   ========================================================= */

"use strict";

/** 1) UPDATE THESE LINKS ONCE (no hunting through HTML) */
const CONFIG = {
  linkedInUrl: "https://www.linkedin.com/in/james-e-gill",

  // Audio playlist (make sure these paths exist exactly)
  audioPlaylist: [
    "assets/audio/I_am_me.mp3",
    "assets/audio/Alien-Beach-Waves.mp3",
    "assets/audio/Travel-through-space.mp3",
    "assets/audio/Blender-Hyperspace-Jump.mp3",
  ],

  // Screensavers (single-player overlay)
  screensavers: [
    "assets/video/Screensaver-1.mp4",
    "assets/video/Screensaver-4.mp4",
    "assets/video/Alien-Beach-Waves.mp4",
  ],

  // “Beats” images used as floating objects
  beatsImages: [
    "assets/beats/1_Website.png",
    "assets/beats/2_Website.png",
    "assets/beats/3_Website.png",
    "assets/beats/4_Website.png",
    "assets/beats/5_Website.png",
    "assets/beats/6_Website.png",
    "assets/beats/7_Website.png",
    "assets/beats/8_Website.png",
    "assets/beats/9_Website.png",
    "assets/beats/10_Website.png",
    "assets/beats/11_Website.png",
    "assets/beats/12_Website.png",
  ],

  // Starting volume (professional)
  startVolume: 0.20, // 20%

  // Auto-scroll speed (px per frame-ish)
  autoScrollSpeed: 0.55,
};

/** 2) Scene items (text + images) — tuned to feel “back → front” */
const SCENE_ITEMS = [
  // Text bubbles
  {
    kind: "text",
    title: "USAF → Cloud App Dev",
    text: "20 years of mission-critical ops discipline, now building software that stays reliable under pressure.",
    x: -260, y: -160, z: -900
  },
  {
    kind: "text",
    title: "Human-first, not hype-first",
    text: "UX-aware engineering: clean flows, predictable behavior, and zero nonsense when it matters.",
    x: 260, y: -40, z: -750
  },
  {
    kind: "text",
    title: "Projects matter",
    text: "I build. I ship. I iterate. Portfolio isn’t a vibe—it's receipts.",
    x: -220, y: 110, z: -620
  },

  // Image bubbles (beats)
  { kind: "img", title: "Project Snapshot", text: "Floating visuals (beats folder).", imgIndex: 0, x: 260, y: 160, z: -980 },
  { kind: "img", title: "Project Snapshot", text: "Click bubbles for details.", imgIndex: 1, x: -280, y: 260, z: -820 },
  { kind: "img", title: "Project Snapshot", text: "This is the “Luma-like” scroll fly-through.", imgIndex: 2, x: 220, y: 320, z: -700 },

  // More text, more depth
  {
    kind: "text",
    title: "Reliability is a design choice",
    text: "I care about failure modes, edge cases, and what happens at 2am on a Sunday.",
    x: -320, y: 420, z: -920
  },
  {
    kind: "text",
    title: "MSSA journey",
    text: "Training hard, building tools, and leveling up into professional software engineering.",
    x: 240, y: 520, z: -780
  },

  // More images later in the scroll
  { kind: "img", title: "Project Snapshot", text: "More visuals as you go.", imgIndex: 3, x: -220, y: 620, z: -1020 },
  { kind: "img", title: "Project Snapshot", text: "Swap these to anything you want.", imgIndex: 4, x: 260, y: 720, z: -860 },
];

const $ = (sel) => document.querySelector(sel);

const sceneEl = $("#scene");
const scrollRoot = $("#scrollRoot");

const btnTheme = $("#btnTheme");
const btnTrail = $("#btnTrail");
const btnAutoScroll = $("#btnAutoScroll");
const btnAudio = $("#btnAudio");
const vol = $("#vol");
const hudHint = $("#hudHint");

const btnLinkedIn = $("#btnLinkedIn");
const btnLinkedIn2 = $("#btnLinkedIn2");

const secretHotspot = $("#secretHotspot");

/** Modal */
const detailModal = $("#detailModal");
const detailClose = $("#detailClose");
const detailTitle = $("#detailTitle");
const detailBody = $("#detailBody");

/** Screensavers */
const ssOverlay = $("#ssOverlay");
const ssVideo = $("#ssVideo");
const btnCloseSS = $("#btnCloseSS");
const btnPrevSS = $("#btnPrevSS");
const btnNextSS = $("#btnNextSS");
const btnToggleSSMute = $("#btnToggleSSMute");
const ssLabel = $("#ssLabel");

/** Mouse trail */
const trailRoot = $("#trail");

let themeIndex = 0;
const themes = ["night", "retro", "sand"];

let trailOn = false;
let autoScrollOn = false;
let autoScrollRAF = 0;

/** Audio state */
let audio = null;
let audioIndex = 0;
let audioWanted = true; // user wants autoplay
let audioUnlocked = false;

function setHint(msg, timeoutMs = 2200) {
  hudHint.textContent = msg;
  if (timeoutMs > 0) {
    window.clearTimeout(setHint._t);
    setHint._t = window.setTimeout(() => (hudHint.textContent = ""), timeoutMs);
  }
}

/* ---------------------------
   Link wiring
---------------------------- */
function wireLinks() {
  if (CONFIG.linkedInUrl && CONFIG.linkedInUrl.startsWith("http")) {
    btnLinkedIn.href = CONFIG.linkedInUrl;
    btnLinkedIn2.href = CONFIG.linkedInUrl;
  } else {
    // Keep clickable but obvious
    btnLinkedIn.href = "#contact";
    btnLinkedIn2.href = "#contact";
    setHint("Paste your LinkedIn URL in app.js → CONFIG.linkedInUrl", 5000);
  }
}

/* ---------------------------
   Build 3D scene DOM
---------------------------- */
const bubbles = [];

function createBubble(item) {
  const el = document.createElement("div");
  el.className = "bubble";
  el.tabIndex = 0;

  const t = document.createElement("div");
  t.className = "title";
  t.textContent = item.title || "—";

  const p = document.createElement("p");
  p.className = "text";
  p.textContent = item.text || "";

  el.appendChild(t);
  el.appendChild(p);

  if (item.kind === "img") {
    const img = document.createElement("img");
    img.className = "img";
    const src = CONFIG.beatsImages[item.imgIndex] || CONFIG.beatsImages[0] || "";
    img.src = src;
    img.alt = item.title || "Project image";
    img.loading = "lazy";
    el.appendChild(img);
  }

  el.addEventListener("click", () => openDetail(item));
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openDetail(item);
  });

  sceneEl.appendChild(el);
  bubbles.push({ el, item });
}

function buildScene() {
  sceneEl.innerHTML = "";
  bubbles.length = 0;
  SCENE_ITEMS.forEach(createBubble);
}

/* ---------------------------
   3D transform update
---------------------------- */
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function updateScene() {
  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const t = scrollY / maxScroll; // 0..1

  // Map scroll progress into a “camera” moving forward
  // Bigger cameraZ means items approach the viewer
  const cameraAdvance = t * 1200; // tune this
  const cameraY = t * 1100;

  for (const b of bubbles) {
    const it = b.item;

    // Each item has a base x/y/z.
    // We move camera forward through Z and down through Y.
    const x = it.x;
    const y = it.y - cameraY;
    const z = it.z + cameraAdvance;

    // When z gets close to 0, it’s “near the viewer”
    const near = clamp(1 - Math.abs(z) / 1200, 0, 1);
    const opacity = clamp(near * 1.15, 0.08, 1);

    // Scale a bit as it comes forward, but DO NOT explode
    const scale = 0.86 + near * 0.28;

    // Keep centered at viewport mid; offsets stored in CSS vars for hover
    b.el.style.setProperty("--x", `${x}px`);
    b.el.style.setProperty("--y", `${y}px`);
    b.el.style.setProperty("--z", `${z}px`);
    b.el.style.opacity = opacity.toFixed(3);

    b.el.style.transform =
      `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) scale(${scale})`;
  }

  requestAnimationFrame(updateScene);
}

/* ---------------------------
   Detail modal
---------------------------- */
function openDetail(item) {
  detailTitle.textContent = item.title || "Details";
  const parts = [];

  parts.push(`<p>${escapeHtml(item.text || "")}</p>`);

  if (item.kind === "img") {
    const src = CONFIG.beatsImages[item.imgIndex] || "";
    if (src) {
      parts.push(`<img src="${src}" alt="${escapeHtml(item.title || "Image")}" style="width:100%;border-radius:14px;border:1px solid rgba(255,255,255,.10);margin-top:10px;" />`);
    }
  }

  parts.push(`<p class="muted" style="margin-top:12px;">Tip: This is where we can expand your “growth & adventure” story with short milestone write-ups.</p>`);

  detailBody.innerHTML = parts.join("");
  detailModal.setAttribute("aria-hidden", "false");
}

function closeDetail() {
  detailModal.setAttribute("aria-hidden", "true");
  detailBody.innerHTML = "";
}

detailClose.addEventListener("click", closeDetail);
detailModal.addEventListener("click", (e) => {
  if (e.target === detailModal) closeDetail();
});

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------------------
   Screensavers (single player)
---------------------------- */
let ssIndex = 0;

function openSS() {
  ssOverlay.setAttribute("aria-hidden", "false");
  loadSS(ssIndex);
}

function closeSS() {
  ssOverlay.setAttribute("aria-hidden", "true");
  try { ssVideo.pause(); } catch {}
}

function loadSS(i) {
  if (!CONFIG.screensavers.length) return;

  ssIndex = (i + CONFIG.screensavers.length) % CONFIG.screensavers.length;
  const src = CONFIG.screensavers[ssIndex];
  ssLabel.textContent = `${src.split("/").pop()} (${ssIndex + 1}/${CONFIG.screensavers.length})`;

  ssVideo.src = src;
  ssVideo.loop = true;
  ssVideo.muted = false;
  ssVideo.volume = 0.45;

  // Video autoplay usually allowed if muted, but we want sound inside overlay.
  // We'll try; if blocked, user can press play in the video controls.
  ssVideo.play().catch(() => {
    ssVideo.controls = true;
    setHint("Video controls enabled (browser blocked autoplay in overlay).", 3000);
  });
}

btnCloseSS.addEventListener("click", closeSS);
btnPrevSS.addEventListener("click", () => loadSS(ssIndex - 1));
btnNextSS.addEventListener("click", () => loadSS(ssIndex + 1));
btnToggleSSMute.addEventListener("click", () => {
  ssVideo.muted = !ssVideo.muted;
  btnToggleSSMute.textContent = ssVideo.muted ? "Unmute" : "Mute";
});

secretHotspot.addEventListener("click", openSS);

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "v") {
    const open = ssOverlay.getAttribute("aria-hidden") === "false";
    open ? closeSS() : openSS();
  }
  if (e.key === "Escape") {
    closeSS();
    closeDetail();
  }
});

/* ---------------------------
   Theme + Mouse trail + Auto scroll
---------------------------- */
btnTheme.addEventListener("click", () => {
  themeIndex = (themeIndex + 1) % themes.length;
  document.body.setAttribute("data-theme", themes[themeIndex]);
  setHint(`Theme: ${themes[themeIndex]}`);
});

function clearTrail() {
  trailRoot.innerHTML = "";
}

function enableTrail() {
  clearTrail();
  // Create a few persistent dots
  for (let i = 0; i < 10; i++) {
    const dot = document.createElement("div");
    dot.className = "trail-dot";
    trailRoot.appendChild(dot);
  }
  const dots = Array.from(trailRoot.querySelectorAll(".trail-dot"));
  let idx = 0;

  const onMove = (e) => {
    if (!trailOn) return;
    const dot = dots[idx % dots.length];
    idx++;
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
    dot.style.opacity = "0.9";
    window.setTimeout(() => { dot.style.opacity = "0.0"; }, 220);
  };

  window.addEventListener("mousemove", onMove);
  enableTrail._off = () => window.removeEventListener("mousemove", onMove);
}

btnTrail.addEventListener("click", () => {
  trailOn = !trailOn;
  if (trailOn) {
    enableTrail();
    setHint("Mouse trail: ON");
  } else {
    if (enableTrail._off) enableTrail._off();
    clearTrail();
    setHint("Mouse trail: OFF");
  }
});

function tickAutoScroll() {
  if (!autoScrollOn) return;

  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const next = (window.scrollY || 0) + CONFIG.autoScrollSpeed;

  if (next >= maxScroll - 1) {
    // Stop at bottom (don’t loop unless you want it)
    autoScrollOn = false;
    btnAutoScroll.textContent = "Auto Scroll";
    setHint("Reached bottom. Auto-scroll stopped.");
    return;
  }

  window.scrollTo({ top: next, behavior: "auto" });
  autoScrollRAF = requestAnimationFrame(tickAutoScroll);
}

btnAutoScroll.addEventListener("click", () => {
  autoScrollOn = !autoScrollOn;
  btnAutoScroll.textContent = autoScrollOn ? "Auto Scroll: ON" : "Auto Scroll";
  setHint(autoScrollOn ? "Auto-scroll: ON" : "Auto-scroll: OFF");
  if (autoScrollOn) {
    cancelAnimationFrame(autoScrollRAF);
    autoScrollRAF = requestAnimationFrame(tickAutoScroll);
  }
});

/* ---------------------------
   Audio: autoplay attempt + auto-unlock on any interaction
---------------------------- */
function ensureAudio() {
  if (audio) return;

  audio = new Audio();
  audio.preload = "auto";
  audio.loop = true;
  audio.volume = CONFIG.startVolume;

  vol.value = String(CONFIG.startVolume);

  audio.src = CONFIG.audioPlaylist[audioIndex] || "";
}

function playAudio() {
  ensureAudio();
  audioWanted = true;

  // Attempt play
  return audio.play().then(() => {
    audioUnlocked = true;
    btnAudio.textContent = "Music: ON";
    setHint(`Music: ON (${Math.round(audio.volume * 100)}%)`);
  }).catch(() => {
    // Autoplay likely blocked until a gesture.
    btnAudio.textContent = "Music (blocked)";
    setHint("Browser blocked autoplay. Scroll/click/any key will unlock sound.", 4200);
    return Promise.resolve(false);
  });
}

function pauseAudio() {
  if (!audio) return;
  audioWanted = false;
  audio.pause();
  btnAudio.textContent = "Music";
  setHint("Music: OFF");
}

btnAudio.addEventListener("click", () => {
  // manual toggle for user control, but autoplay logic is still present
  ensureAudio();
  if (audio.paused) playAudio();
  else pauseAudio();
});

vol.addEventListener("input", () => {
  ensureAudio();
  audio.volume = Number(vol.value);
});

/** Autoplay request on load */
function initAutoplay() {
  ensureAudio();

  // Try immediately
  playAudio();

  // If blocked, unlock automatically on first interaction (not “play button only”)
  const unlock = () => {
    if (!audioWanted) return;
    playAudio();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("scroll", unlock, { passive: true });
  };

  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  window.addEventListener("scroll", unlock, { passive: true, once: true });
}

/* ---------------------------
   Init
---------------------------- */
function init() {
  wireLinks();
  buildScene();
  requestAnimationFrame(updateScene);

  initAutoplay();

  // Small tip so you can verify the “hidden” hotspot still exists
  setHint("Tip: Press V for screensavers. Volume starts low.", 4200);
}

document.addEventListener("DOMContentLoaded", init);
