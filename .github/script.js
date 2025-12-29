/* =========================================================
   Career Lifeline Scrolly + Background + Audio
   ========================================================= */

/* ---------- Background crossfade intro (images, not video) ---------- */
const bgImgs = Array.from(document.querySelectorAll(".bg-img"));
const flash = document.getElementById("bgFlash");

function flashWhite() {
  flash.classList.add("on");
  setTimeout(() => flash.classList.remove("on"), 180);
}

function showBg(index) {
  bgImgs.forEach((img, i) => img.classList.toggle("is-visible", i === index));
}

function runBackgroundIntro() {
  // Sequence: AF -> CAD1 -> CAD2 -> AF -> CAD1 -> CAD2 -> TECH (sticks)
  const sequence = [0, 1, 2, 0, 1, 2, 3];

  let i = 0;
  const intervalMs = 1200;

  const timer = setInterval(() => {
    i++;
    if (i >= sequence.length) {
      clearInterval(timer);
      // final background remains static (index 3)
      showBg(sequence[sequence.length - 1]);
      return;
    }
    flashWhite();
    showBg(sequence[i]);
  }, intervalMs);
}

/* ---------- Scroll-driven cards (Luma-like pinned stage) ---------- */
const cards = Array.from(document.querySelectorAll(".card"));
const steps = Array.from(document.querySelectorAll(".step"));

function setActiveCard(index) {
  cards.forEach((card, i) => card.classList.toggle("active", i === index));
}

// IntersectionObserver is the clean way to swap content based on what is visible.
// (This is the core technique behind “scrollytelling” sections.) 
const io = new IntersectionObserver(
  (entries) => {
    // choose the most visible entry
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => (b.intersectionRatio - a.intersectionRatio))[0];

    if (!visible) return;

    const index = Number(visible.target.dataset.step);
    if (!Number.isNaN(index)) setActiveCard(index);
  },
  { threshold: [0.35, 0.55, 0.75] }
);

steps.forEach(step => io.observe(step));

/* ---------- Expand/collapse “bubble” details ---------- */
function setExpanded(btn, card, expanded) {
  btn.setAttribute("aria-expanded", String(expanded));
  const details = card.querySelector(".details");
  if (!details) return;

  if (expanded) {
    details.hidden = false;
    card.classList.add("open");
  } else {
    details.hidden = true;
    card.classList.remove("open");
  }
}

cards.forEach((card) => {
  const btn = card.querySelector(".expand");
  const details = card.querySelector(".details");
  if (!btn || !details) return;

  setExpanded(btn, card, false);

  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    setExpanded(btn, card, !expanded);
  });
});

/* ---------- Theme toggle ---------- */
const themeBtn = document.getElementById("themeBtn");
themeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("theme-dark");
});

/* ---------- Mouse trail toggle ---------- */
const trailBtn = document.getElementById("trailBtn");
let trailOn = false;
let dots = [];
let mouseMoveHandler = null;

function enableTrail() {
  trailOn = true;

  // make a small chain of dots
  dots = Array.from({ length: 10 }, () => {
    const d = document.createElement("div");
    d.className = "trail-dot";
    document.body.appendChild(d);
    return { el: d, x: 0, y: 0 };
  });

  let lastX = 0, lastY = 0;

  mouseMoveHandler = (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
    dots[0].x = lastX;
    dots[0].y = lastY;
    dots[0].el.style.opacity = ".9";
  };

  window.addEventListener("mousemove", mouseMoveHandler);

  // animate follow
  function tick() {
    if (!trailOn) return;
    for (let i = 1; i < dots.length; i++) {
      dots[i].x += (dots[i - 1].x - dots[i].x) * 0.25;
      dots[i].y += (dots[i - 1].y - dots[i].y) * 0.25;
      dots[i].el.style.left = `${dots[i].x}px`;
      dots[i].el.style.top = `${dots[i].y}px`;
      dots[i].el.style.opacity = String(Math.max(0, 0.9 - i * 0.08));
    }
    requestAnimationFrame(tick);
  }
  tick();
}

function disableTrail() {
  trailOn = false;
  if (mouseMoveHandler) window.removeEventListener("mousemove", mouseMoveHandler);
  dots.forEach(d => d.el.remove());
  dots = [];
}

trailBtn?.addEventListener("click", () => {
  if (!trailOn) enableTrail();
  else disableTrail();
});

/* ---------- Audio (volume 25%, user gesture to start) ---------- */
// Browsers often block autoplay until a user interacts with the page. 
const audio = document.getElementById("bgAudio");
const volumeSlider = document.getElementById("volumeSlider");
const audioBtn = document.getElementById("audioBtn");

let audioWanted = false;

function syncVolume(v) {
  const vol = Math.min(1, Math.max(0, v));
  audio.volume = vol;
  if (volumeSlider) volumeSlider.value = String(vol);
}

async function tryPlay() {
  try {
    await audio.play();
    audioWanted = true;
    if (audioBtn) audioBtn.textContent = "Pause";
  } catch (err) {
    // Autoplay blocked until click/tap
    audioWanted = false;
    if (audioBtn) audioBtn.textContent = "Play";
  }
}

function pauseAudio() {
  audio.pause();
  audioWanted = false;
  if (audioBtn) audioBtn.textContent = "Play";
}

volumeSlider?.addEventListener("input", (e) => {
  syncVolume(Number(e.target.value));
});

audioBtn?.addEventListener("click", async () => {
  if (audio.paused) await tryPlay();
  else pauseAudio();
});

// Start at 25%
syncVolume(0.25);

// First user interaction: attempt to start audio
window.addEventListener(
  "pointerdown",
  async () => {
    if (audio.paused) await tryPlay();
  },
  { once: true }
);

/* ---------- Kick things off ---------- */
runBackgroundIntro();
setActiveCard(0);
