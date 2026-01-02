/* app.js — Career Lifeline scrollytelling (GSAP + ScrollTrigger)
   Drop this file next to index.html, style.css, and your assets. */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  const bgLayers = Array.from($("#bg").querySelectorAll(".bg-layer"));
  const bubblesEl = $("#bubbles");
  const spacerEl = $("#spacer");
  const fallbackList = $("#fallbackList");

  const hero = $("#hero");
  const tapToStart = $("#tapToStart");

  const bgm = $("#bgm");
  const playBtn = $("#playBtn");
  const vol = $("#vol");

  const themeBtn = $("#themeBtn");
  const trailBtn = $("#trailBtn");

  const vaultHotspot = $("#vaultHotspot");
  const vault = $("#vault");
  const vaultClose = $("#vaultClose");
  const vaultVideo = $("#vaultVideo");
  const vaultMeta = $("#vaultMeta");
  const prevVid = $("#prevVid");
  const nextVid = $("#nextVid");

  // Assets (same folder as index.html)
  const BG_ORDER = [
    "AirForce_Emblem.png",
    "CADdets_Retro.png",
    "CADdets_1.png",
    "Tech_Career.png",
  ];

  const IMAGE_FILES = Array.from({ length: 12 }, (_, i) => `${i + 1}_Website.png`);

  const VIDEOS = [
    "Screensaver-1.mp4",
    "Screensaver-4.mp4",
    "Screensaver-5.mp4",
    "Alien-Beach-Waves.mp4",
  ];

  // Text beats (edit freely)
  const TEXT_BEATS = [
    "Mission-ready mindset. Built under pressure. Built to last.",
    "From the flightline to the cloud. Same discipline—new tools.",
    "Reliable software, not fragile demos.",
    "Azure-first thinking. Deploy, monitor, improve—repeat.",
    "I design for humans. Clear flows. Less friction.",
    "Security is the baseline. Validate inputs. Defend the edges.",
    "I turn chaos into structure. Systems, checklists, and clean execution.",
    "Calm under load. When things break, I debug—not panic.",
    "Small releases. Big momentum.",
    "Projects that prove it. Real apps, real commits, real lessons.",
    "Let’s build something dependable.",

    "Build it clean. Keep it maintainable.",
    "C# / .NET developer. OOP, SOLID habits, readable code.",
    "Cloud-minded by default. Logs, monitoring, failure modes.",
    "APIs that behave. Clear contracts, validation, predictable errors.",
    "Data that makes sense. Practical modeling, clean JSON, sane persistence.",
    "Performance with purpose. Fast enough—and understandable.",
    "Security baked in. Inputs guarded. Outputs encoded.",
    "Automation-friendly workflows. Fewer “works on my machine” moments.",
    "I ship in increments. Iterate without breaking everything.",
    "Bugs are just clues. Trace, isolate, fix, prevent.",
    "Operational discipline. Uptime thinking, not just feature thinking.",
    "Give me a problem worth owning.",

    "Human-centered systems. Built for real people.",
    "Clarity beats clever. Every time.",
    "Design that reduces stress. Especially under pressure.",
    "Information that flows. The user always knows where they are.",
    "Friction is the enemy. Remove it.",
    "Accessibility isn’t optional. Contrast, structure, keyboard sanity.",
    "Proof over opinions. Test, learn, iterate.",
    "Strong defaults. Simple paths. Fewer wrong turns.",
    "Design + engineering together. One product brain.",
    "Make the next step obvious.",
    "Build trust through consistency.",
    "Good experiences feel effortless. That’s the goal.",
  ];

  function buildBeats() {
    const beats = [];
    let imgIdx = 0;

    for (let i = 0; i < TEXT_BEATS.length; i++) {
      // sprinkle an image roughly every 3 text beats, up to 12 images
      if (i !== 0 && i % 3 === 1 && imgIdx < IMAGE_FILES.length) {
        beats.push({ type: "img", src: `./${IMAGE_FILES[imgIdx++]}` });
      }
      beats.push({ type: "text", text: TEXT_BEATS[i] });
    }

    while (imgIdx < IMAGE_FILES.length) {
      beats.push({ type: "img", src: `./${IMAGE_FILES[imgIdx++]}` });
    }

    return beats;
  }

  const BEATS = buildBeats();

  // Fallback list (if GSAP fails)
  BEATS.forEach((b) => {
    const li = document.createElement("li");
    li.textContent = b.type === "img" ? b.src.replace("./", "") : b.text;
    fallbackList.appendChild(li);
  });

  // Theme toggle
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("theme-light");
  });

  // Mouse trail (optional)
  let trailOn = false;
  let trailDot = null;

  function onMove(e) {
    if (!trailDot) return;
    trailDot.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
  }

  function setTrail(on) {
    trailOn = on;
    if (!trailOn) {
      if (trailDot) trailDot.remove();
      trailDot = null;
      window.removeEventListener("pointermove", onMove);
      return;
    }
    trailDot = document.createElement("div");
    trailDot.style.cssText = `
      position: fixed; left: 0; top: 0;
      width: 10px; height: 10px; border-radius: 999px;
      background: rgba(34,211,238,0.65);
      pointer-events: none; z-index: 60;
      transform: translate(-999px,-999px);
    `;
    document.body.appendChild(trailDot);
    window.addEventListener("pointermove", onMove, { passive: true });
  }

  trailBtn.addEventListener("click", () => setTrail(!trailOn));

  // Audio (autoplay may be blocked by browser policy)
  vol.addEventListener("input", () => {
    bgm.volume = Number(vol.value);
  });

  playBtn.addEventListener("click", async () => {
    try {
      bgm.volume = Number(vol.value);
      if (bgm.paused) {
        await bgm.play();
        playBtn.textContent = "Pause";
      } else {
        bgm.pause();
        playBtn.textContent = "Play";
      }
    } catch {
      tapToStart.hidden = false;
      tapToStart.focus();
    }
  });

  tapToStart.addEventListener("click", async () => {
    try {
      bgm.volume = Number(vol.value);
      await bgm.play();
      playBtn.textContent = "Pause";
      tapToStart.hidden = true;
    } catch {}
  });

  (async () => {
    try {
      bgm.volume = Number(vol.value);
      await bgm.play();
      playBtn.textContent = "Pause";
    } catch {
      tapToStart.hidden = false;
    }
  })();

  // Video vault (hidden hotspot)
  let vidIdx = 0;

  function setVideo(i) {
    vidIdx = (i + VIDEOS.length) % VIDEOS.length;
    vaultVideo.src = `./${VIDEOS[vidIdx]}`;
    vaultMeta.textContent = `${VIDEOS[vidIdx]} (${vidIdx + 1}/${VIDEOS.length})`;
    vaultVideo.play().catch(() => {});
  }

  function openVault() {
    vault.hidden = false;
    setVideo(vidIdx);
  }
  function closeVault() {
    vault.hidden = true;
    vaultVideo.pause();
  }

  vaultHotspot.addEventListener("click", openVault);
  vaultClose.addEventListener("click", closeVault);
  prevVid.addEventListener("click", () => setVideo(vidIdx - 1));
  nextVid.addEventListener("click", () => setVideo(vidIdx + 1));
  vault.addEventListener("click", (e) => {
    if (e.target === vault) closeVault();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "v") {
      if (vault.hidden) openVault();
      else closeVault();
    }
  });

  // Background preload + setup
  function preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function initBackground() {
    for (let i = 0; i < bgLayers.length; i++) {
      bgLayers[i].src = `./${BG_ORDER[i]}`;
    }
    await Promise.all(BG_ORDER.map((f) => preloadImage(`./${f}`)));

    bgLayers.forEach((l) => (l.style.opacity = "0"));
    bgLayers[0].style.opacity = "1";
  }

  function setBackgroundByProgress(p) {
    // transitions in first ~35% then holds final image
    const phase = 0.35;
    const q = Math.min(1, Math.max(0, p / phase));
    const n = bgLayers.length;

    const x = q * (n - 1);
    const i = Math.floor(x);
    const t = x - i;

    bgLayers.forEach((l) => (l.style.opacity = "0"));

    if (i >= n - 1) {
      bgLayers[n - 1].style.opacity = "1";
      return;
    }

    bgLayers[i].style.opacity = String(1 - t);
    bgLayers[i + 1].style.opacity = String(t);
  }

  // GSAP scrollytelling
  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) {
      console.warn("GSAP/ScrollTrigger not found. Falling back to static list.");
      return;
    }

    document.body.classList.add("js-on");
    gsap.registerPlugin(ScrollTrigger);

    bubblesEl.innerHTML = "";
    const nodes = BEATS.map((beat, i) => {
      const el = document.createElement("div");
      el.className = "bubble" + (beat.type === "img" ? " bubble--img" : "");
      el.style.zIndex = String(10 + i);

      if (beat.type === "img") {
        const img = document.createElement("img");
        img.loading = "lazy";
        img.decoding = "async";
        img.alt = "";
        img.src = beat.src;
        el.appendChild(img);
      } else {
        const t = document.createElement("div");
        t.className = "bubbleText";
        t.textContent = beat.text;
        el.appendChild(t);
      }

      bubblesEl.appendChild(el);
      return el;
    });

    const spots = [
      { x: -380, y: -200 },
      { x:  380, y: -200 },
      { x: -420, y:  140 },
      { x:  420, y:  150 },
      { x:    0, y: -260 },
      { x:    0, y:  240 },
      { x: -120, y:   30 },
      { x:  120, y:   10 },
    ];

    const rnd = (min, max) => min + Math.random() * (max - min);

    // This is the key to “5–7 bubbles at once”
    const STAGGER = 0.50;  // start a new bubble every 0.5s
    const LIFE = 3.00;     // each bubble lives about 3s

    const master = gsap.timeline({ defaults: { ease: "power2.out" } });

    // hero fades out after scroll begins
    master.to(hero, { autoAlpha: 0, duration: 0.9 }, 0.4);

    nodes.forEach((el, i) => {
      const spot = spots[i % spots.length];
      const x0 = spot.x + rnd(-90, 90);
      const y0 = spot.y + rnd(-70, 70);

      const x1 = x0 + rnd(-110, 110);
      const y1 = y0 + rnd(-90, 90);

      const baseScale = rnd(0.85, 1.15);
      const start = 0.8 + i * STAGGER;

      master.fromTo(
        el,
        { autoAlpha: 0, x: x0, y: y0 + 40, scale: baseScale * 0.78, filter: "blur(8px)" },
        { autoAlpha: 1, x: x0, y: y0, scale: baseScale, filter: "blur(0px)", duration: 0.55 },
        start
      );

      master.to(el, { x: x1, y: y1, duration: LIFE - 1.10, ease: "none" }, start + 0.55);

      master.to(
        el,
        {
          autoAlpha: 0,
          scale: baseScale * 1.25,
          x: x1 + rnd(-80, 80),
          y: y1 - rnd(40, 120),
          filter: "blur(10px)",
          duration: 0.55,
          ease: "power2.in",
        },
        start + LIFE - 0.55
      );
    });

    const scrollScreens = Math.max(12, Math.ceil(BEATS.length * 0.7));
    spacerEl.style.height = `${scrollScreens * 100}vh`;

    const st = ScrollTrigger.create({
      trigger: "#scrollArea",
      start: "top top",
      end: () => `+=${window.innerHeight * scrollScreens}`,
      scrub: 1.0,
      pin: ".stage",
      animation: master,
      anticipatePin: 1,
      onUpdate: (self) => setBackgroundByProgress(self.progress),
    });

    window.addEventListener("resize", () => st.refresh());
  }

  (async () => {
    await initBackground();
    initGSAP();
  })();
})();
