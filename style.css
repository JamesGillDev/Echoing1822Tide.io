(() => {
  const snapRoot = document.getElementById("snapRoot");

  // ----- Intro overlay -----
  const introOverlay = document.getElementById("introOverlay");
  const introVideo = document.getElementById("introVideo");

  function hideIntro() {
    if (!introOverlay) return;
    introOverlay.classList.add("hidden");
    window.setTimeout(() => introOverlay.remove(), 650);
  }

  // Autoplay is generally allowed only if muted; we keep it muted. 
  if (introVideo) {
    introVideo.addEventListener("ended", hideIntro);
    introVideo.addEventListener("error", hideIntro);

    // If the video never loads, fail open after 2.5s
    window.setTimeout(() => {
      if (document.body.contains(introOverlay)) hideIntro();
    }, 2500);
  } else {
    hideIntro();
  }

  // ----- Music (single track) -----
  const bgMusic = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");
  const musicVol = document.getElementById("musicVol");

  if (bgMusic && musicVol) {
    bgMusic.volume = Number(musicVol.value || 0.25);
    musicVol.addEventListener("input", () => {
      bgMusic.volume = Number(musicVol.value);
    });
  }

  async function toggleMusic() {
    if (!bgMusic || !musicToggle) return;

    if (bgMusic.paused) {
      try {
        await bgMusic.play();
        musicToggle.textContent = "Music: ON";
        musicToggle.setAttribute("aria-pressed", "true");
      } catch {
        // You requested the old autoplay-blocked toast be removed, so we stay silent here.
      }
    } else {
      bgMusic.pause();
      musicToggle.textContent = "Music: OFF";
      musicToggle.setAttribute("aria-pressed", "false");
    }
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", toggleMusic);
  }

  // ----- Scroll snap backgrounds + arrows -----
  const sections = Array.from(document.querySelectorAll(".snapSection"));

  function setSectionBackgroundVars(section) {
    const bgA = section.getAttribute("data-bg");
    const bgB = section.getAttribute("data-bg2");

    section.style.setProperty("--bgA", bgA ? `url("${bgA}")` : "none");
    section.style.setProperty("--bgB", bgB ? `url("${bgB}")` : "none");
  }

  sections.forEach(setSectionBackgroundVars);

  // Use IntersectionObserver to:
  // 1) highlight nav
  // 2) trigger bg swap (Experience: AirForce_Emblem.png -> CADdets_1.png while staying in same section)
  const navLinks = Array.from(document.querySelectorAll(".sectionNav__link"));

  function setActiveNav(id) {
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const section = entry.target;
      const id = section.id;
      setActiveNav(id);

      // background swap behavior when entering a section that has bg2
      const hasBg2 = Boolean(section.getAttribute("data-bg2"));
      section.classList.remove("swapBg");
      if (hasBg2) {
        window.setTimeout(() => {
          // still in DOM and likely still in view
          section.classList.add("swapBg");
        }, 650);
      }
    });
  }, { root: snapRoot, threshold: 0.6 });

  sections.forEach(s => io.observe(s));

  // Scroll cue + arrows: go to next section
  function scrollToNext(fromSection) {
    const nextSel = fromSection.getAttribute("data-next");
    if (!nextSel) return;
    const next = document.querySelector(nextSel);
    if (!next) return;
    next.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Click handlers for cue/arrow
  document.querySelectorAll("[data-scroll-next]").forEach(el => {
    const section = el.closest(".snapSection");
    if (!section) return;

    el.addEventListener("click", () => scrollToNext(section));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        scrollToNext(section);
      }
    });
  });

  // Also: make arrow-only elements work
  document.querySelectorAll(".scrollArrowOnly").forEach(el => {
    const section = el.closest(".snapSection");
    if (!section) return;

    el.addEventListener("click", () => scrollToNext(section));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        scrollToNext(section);
      }
    });
  });

  // ----- Hidden Screensaver Sequence -----
  const eggBtn = document.getElementById("easterEgg");
  const modal = document.getElementById("screensaverModal");
  const ssVideo = document.getElementById("ssVideo");
  const ssAudio = document.getElementById("ssAudio");

  const CLOSE_SELECTORS = "[data-close]";
  function qsAll(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function openModal() {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "hidden"; // body already hidden; snapRoot scrolls
    stopScreensaver();
  }

  if (modal) {
    qsAll(CLOSE_SELECTORS, modal).forEach(el => el.addEventListener("click", closeModal));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  // Fade helpers
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  function fadeOpacity(el, from, to, ms) {
    return new Promise(resolve => {
      const start = performance.now();
      function tick(now) {
        const t = clamp01((now - start) / ms);
        const v = from + (to - from) * t;
        el.style.opacity = String(v);
        if (t >= 1) resolve();
        else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  function fadeAudio(audio, from, to, ms) {
    return new Promise(resolve => {
      const start = performance.now();
      function tick(now) {
        const t = clamp01((now - start) / ms);
        const v = from + (to - from) * t;
        audio.volume = clamp01(v);
        if (t >= 1) resolve();
        else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  let screensaverRunning = false;

  async function playStep({ videoSrc, audioSrc, fadeInMs, fadeOutMs, audioLeadMs = 0, videoFadeInDelayMs = 0 }) {
    if (!ssVideo || !ssAudio) return;

    // Load sources
    ssVideo.src = videoSrc;
    ssVideo.load();

    ssAudio.src = audioSrc;
    ssAudio.load();

    ssVideo.style.opacity = "0";
    ssAudio.volume = 0;

    // Start audio first if requested (3rd iteration: hear audio before video appears)
    await ssAudio.play().catch(() => {});
    if (audioLeadMs > 0) {
      await fadeAudio(ssAudio, 0, 0.85, Math.min(650, fadeInMs));
      await new Promise(r => setTimeout(r, audioLeadMs));
    }

    // Start video
    await ssVideo.play().catch(() => {});
    if (videoFadeInDelayMs > 0) await new Promise(r => setTimeout(r, videoFadeInDelayMs));

    // Fade in visuals + audio (if audio not already led in)
    if (audioLeadMs === 0) {
      await Promise.all([
        fadeOpacity(ssVideo, 0, 1, fadeInMs),
        fadeAudio(ssAudio, 0, 0.85, fadeInMs),
      ]);
    } else {
      await fadeOpacity(ssVideo, 0, 1, fadeInMs);
    }

    // Wait until near the end of the video, then fade out
    const safetyMs = 250;
    const durationMs = isFinite(ssVideo.duration) ? (ssVideo.duration * 1000) : 8000;
    const waitMs = Math.max(0, durationMs - fadeOutMs - safetyMs);
    await new Promise(r => setTimeout(r, waitMs));

    await Promise.all([
      fadeOpacity(ssVideo, 1, 0, fadeOutMs),
      fadeAudio(ssAudio, ssAudio.volume, 0, fadeOutMs),
    ]);

    ssVideo.pause();
    ssAudio.pause();
  }

  async function runScreensaverSequence() {
    if (screensaverRunning) return;
    screensaverRunning = true;

    openModal();

    // Step 1: Screensaver_1.mp4 + Travel_through_space.mp3 then fade out quick
    await playStep({
      videoSrc: "assets/screensavers/Screensaver_1.mp4",
      audioSrc: "assets/screensavers/Travel_through_space.mp3",
      fadeInMs: 450,
      fadeOutMs: 450,
    });
    if (!screensaverRunning) return;

    // Step 2: quick fade in video+audio for Screensaver_2 + Blender_Hyperspace_Jump
    await playStep({
      videoSrc: "assets/screensavers/Screensaver_2.mp4",
      audioSrc: "assets/screensavers/Blender_Hyperspace_Jump.mp3",
      fadeInMs: 450,
      fadeOutMs: 450,
    });
    if (!screensaverRunning) return;

    // Step 3: 5s fade in video; fast fade in audio; audio heard before beach is seen
    await playStep({
      videoSrc: "assets/screensavers/Screensaver_3.mp4",
      audioSrc: "assets/screensavers/Alien_Beach_Waves.mp3",
      fadeInMs: 5000,              // slow video fade-in
      fadeOutMs: 650,
      audioLeadMs: 700,            // audio begins before video is visible
      videoFadeInDelayMs: 0
    });

    // Done
    closeModal();
  }

  function stopScreensaver() {
    screensaverRunning = false;
    if (ssVideo) {
      ssVideo.pause();
      ssVideo.removeAttribute("src");
      ssVideo.load();
      ssVideo.style.opacity = "0";
    }
    if (ssAudio) {
      ssAudio.pause();
      ssAudio.removeAttribute("src");
      ssAudio.load();
      ssAudio.volume = 0;
    }
  }

  if (eggBtn) {
    eggBtn.addEventListener("click", runScreensaverSequence);
  }

})();
