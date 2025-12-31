/* global gsap, ScrollTrigger */
(() => {
  if (!window.gsap || !window.ScrollTrigger) {
    console.warn("GSAP/ScrollTrigger not loaded. Check CDN access.");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // ---------- CONFIG ----------
  // Background sequence (1→2→3→4, then stays on 4)
  const bgLayers = Array.from(document.querySelectorAll(".bg-layer"));

  // Your card images (safe if 11/12 don't exist yet)
  const cards = [
    { src: "./1_Website.png" },
    { src: "./2_Website.png" },
    { src: "./3_Website.png" },
    { src: "./4_Website.png" },
    { src: "./5_Website.png" },
    { src: "./6_Website.png" },
    { src: "./7_Website.png" },
    { src: "./8_Website.png" },
    { src: "./9_Website.png" },
    { src: "./10_Website.png" },
    { src: "./11_Website.png" },
    { src: "./12_Website.png" }
  ];

  // “Sprinkle” bubbles between/around cards (Career Lifeline + proof)
  // Keep these as ONE sentence each, like Luma beats.
  const bubbles = [
    "Mission-ready mindset. Built under pressure. Built to last.",
    "From the flightline to the cloud. Same discipline—new tools.",
    "2005–2025: U.S. Air Force. Electrical Power Production + Ops leadership.",
    "Program & project management: $4.6M across 55 locations.",
    "Budgets and logistics across 55 global sites valued at $361M.",
    "23 emergency events. 1,950 work orders. 621 facilities supported.",
    "Built a Job Safety Program for 2,500 personnel.",
    "I ship in increments. Iterate without breaking everything.",
    "Cloud-minded by default: logs, monitoring, failure modes.",
    "APIs that behave. Clear contracts. Predictable errors.",
    "Automation-friendly workflows. Fewer “works on my machine” moments.",
    "AZ-900 + AI-900 certified. AZ-204 in progress.",
    "MSSA CAD: building real apps, then improving them on purpose.",
    "Projects: Battleship Web Game, Bolt Master, Training Tracker.",
    "Calm under load. When things break, I debug—not panic.",
    "Clarity beats clever. Every time.",
    "Accessibility isn’t optional. Contrast, structure, keyboard sanity.",
    "Security baked in. Inputs guarded. Outputs encoded.",
    "Build trust through consistency.",
    "Let’s build something dependable."
  ];

  // How many bubbles you want “visible-ish” at once (effect comes from overlap)
  const BUBBLE_SPACING = 0.35;   // smaller = more overlap (more bubbles on screen)
  const BUBBLE_LIFE = 2.2;       // total life of a bubble in timeline units
  const CARD_LIFE = 2.4;

  // ---------- DOM BUILD ----------
  const cardsHost = document.getElementById("cards");
  const bubblesHost = document.getElementById("bubbles");

  // Create card elements
  const cardEls = cards.map((c) => {
    const wrap = document.createElement("div");
    wrap.className = "card";
    const img = document.createElement("img");
    img.src = c.src;
    img.alt = "";
    wrap.appendChild(img);
    cardsHost.appendChild(wrap);
    return wrap;
  });

  // Seeded RNG for stable positions across reloads
  function mulberry32(seed) {
    return function() {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(1822);

  function pickPos() {
    // Keep things centered-ish like Luma: around the middle, not the corners.
    // Values are percentage of viewport.
    const cx = 50, cy = 52;
    const dx = (rand() - 0.5) * 70; // spread left/right
    const dy = (rand() - 0.5) * 55; // spread up/down
    const x = Math.max(12, Math.min(88, cx + dx));
    const y = Math.max(16, Math.min(86, cy + dy));
    return { x, y };
  }

  // Create bubble elements
  const bubbleEls = bubbles.map((txt) => {
    const el = document.createElement("div");
    el.className = "bubble";
    el.textContent = txt;
    const { x, y } = pickPos();
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    bubblesHost.appendChild(el);
    return el;
  });

  // ---------- GSAP TIMELINE ----------
  const tl = gsap.timeline({ defaults: { ease: "none" } });

  // Initial states
  gsap.set(bgLayers[0], { opacity: 1 });
  bgLayers.slice(1).forEach(l => gsap.set(l, { opacity: 0 }));

  gsap.set(cardEls, { opacity: 0, scale: 0.96, y: 20 });
  gsap.set(bubbleEls, { opacity: 0, scale: 0.85 });

  // Fade hero out as we begin
  tl.to(".hero", { opacity: 0, duration: 1.1 }, 0.35);

  // Background crossfades (1→2→3→4, then stay)
  // times chosen to finish transition early, then keep last static.
  tl.to(bgLayers[1], { opacity: 1, duration: 1.0 }, 0.9);
  tl.to(bgLayers[0], { opacity: 0, duration: 1.0 }, 0.9);

  tl.to(bgLayers[2], { opacity: 1, duration: 1.0 }, 2.0);
  tl.to(bgLayers[1], { opacity: 0, duration: 1.0 }, 2.0);

  tl.to(bgLayers[3], { opacity: 1, duration: 1.0 }, 3.1);
  tl.to(bgLayers[2], { opacity: 0, duration: 1.0 }, 3.1);

  // Helpers: animate a bubble in/out with overlap
  function bubbleAnim(el, at) {
    const peak = 1.0 + (rand() * 0.45); // vary size
    tl.fromTo(
      el,
      { opacity: 0, scale: 0.78, y: 16 },
      { opacity: 1, scale: peak, y: 0, duration: 0.55, ease: "power2.out" },
      at
    );
    tl.to(
      el,
      { opacity: 0, scale: peak * 0.92, y: -18, duration: 0.70, ease: "power2.in" },
      at + (BUBBLE_LIFE - 0.70)
    );
  }

  // Helper: animate a card in/out (centered)
  function cardAnim(el, at) {
    tl.fromTo(
      el,
      { opacity: 0, scale: 0.93, y: 28 },
      { opacity: 1, scale: 1.0, y: 0, duration: 0.55, ease: "power2.out" },
      at
    );
    tl.to(
      el,
      { opacity: 0, scale: 1.05, y: -26, duration: 0.70, ease: "power2.in" },
      at + (CARD_LIFE - 0.70)
    );
  }

  // Build the “sprinkle” pattern:
  // - continuous bubble stream (overlapping -> 5–7 visible)
  // - every few bubbles, show a card
  let t = 1.2;

  bubbleEls.forEach((bEl, i) => {
    bubbleAnim(bEl, t);
    // Every 2–3 bubbles, drop in a card (if available)
    if (i % 2 === 0) {
      const cardIndex = Math.floor(i / 2);
      if (cardEls[cardIndex]) {
        cardAnim(cardEls[cardIndex], t + 0.15);
      }
    }
    t += BUBBLE_SPACING;
  });

  // Extra hold at end so last background stays visible
  tl.to({}, { duration: 1.2 });

  // ---------- SCROLLTRIGGER WIRING ----------
  const total = tl.duration();
  const scrollPx = Math.max(6500, Math.ceil(total * 1100));

  document.documentElement.style.setProperty("--scroll-len", `${scrollPx}px`);

  ScrollTrigger.create({
    trigger: "#scrolly",
    start: "top top",
    end: () => `+=${scrollPx}`,
    pin: "#stage",
    scrub: 1,
    animation: tl,
    invalidateOnRefresh: true
  });

  // ---------- AUDIO ----------
  // NOTE: Autoplay is blocked until user interacts.
  // Your filename has spaces -> use URL encoding for the space:
  // "I, am...me.mp3" becomes "I,%20am...me.mp3"
  const audio = new Audio("./I,%20am...me.mp3");
  audio.loop = true;

  const playBtn = document.getElementById("playBtn");
  const vol = document.getElementById("vol");

  vol.addEventListener("input", () => { audio.volume = Number(vol.value); });
  audio.volume = Number(vol.value);

  function setPlayLabel() {
    playBtn.textContent = audio.paused ? "Play" : "Pause";
  }

  playBtn.addEventListener("click", async () => {
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
      setPlayLabel();
    } catch (e) {
      console.warn("Audio blocked until user gesture:", e);
      setPlayLabel();
    }
  });

  setPlayLabel();

  // ---------- “HIDDEN” MEDIA BUTTON ----------
  const secretBtn = document.getElementById("secretBtn");
  const mediaPanel = document.getElementById("mediaPanel");
  const closeMedia = document.getElementById("closeMedia");

  function openPanel(){ mediaPanel.hidden = false; }
  function closePanel(){ mediaPanel.hidden = true; }

  secretBtn.addEventListener("click", openPanel);
  closeMedia.addEventListener("click", closePanel);
  mediaPanel.addEventListener("click", (e) => {
    if (e.target === mediaPanel) closePanel();
  });

  // Optional: press "m" to toggle panel
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "m") {
      mediaPanel.hidden ? openPanel() : closePanel();
    }
  });

  // ---------- QUICK TOGGLES (placeholders) ----------
  document.getElementById("themeBtn").addEventListener("click", () => {
    // You can wire this to swap CSS variables or body classes later.
    document.body.classList.toggle("theme-alt");
  });

  document.getElementById("trailBtn").addEventListener("click", () => {
    // You can wire your mouse trail effect back in here later.
    console.log("Mouse trail toggle clicked.");
  });

})();
