(() => {
  const snapRoot = document.getElementById("snapRoot");

  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* =========================================================
     Music (single track)
     ========================================================= */

  const bgMusic = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");
  const musicVol = document.getElementById("musicVol");

  function syncMusicUI() {
    if (!bgMusic || !musicToggle) return;
    const on = !bgMusic.paused;
    musicToggle.textContent = on ? "Music: ON" : "Music: OFF";
    musicToggle.setAttribute("aria-pressed", on ? "true" : "false");
  }

  if (bgMusic && musicVol) {
    bgMusic.volume = Number(musicVol.value || 0.25);

    musicVol.addEventListener("input", () => {
      bgMusic.volume = Number(musicVol.value);
    });

    bgMusic.addEventListener("play", syncMusicUI);
    bgMusic.addEventListener("pause", syncMusicUI);
    bgMusic.addEventListener("ended", syncMusicUI);
  }

  async function toggleMusic() {
    if (!bgMusic) return;

    if (bgMusic.paused) {
      bgMusic.play();
    } else {
      bgMusic.pause();
    }

    syncMusicUI();
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }

  // Initial label
  syncMusicUI();

  /* =========================================================
     Scroll snapping: click cue + arrow
     Fix: scroll inside snapRoot explicitly (not document)
     ========================================================= */

  const sections = Array.from(document.querySelectorAll(".snapSection"));
  const navLinks = Array.from(document.querySelectorAll(".sectionNav__link"));

  function scrollToSection(section) {
    if (!section) return;

    if (!snapRoot) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    snapRoot.scrollTo({
      top: section.offsetTop,
      behavior: "smooth",
    });
  }

  function scrollToNext(fromSection) {
    const nextSel = fromSection.getAttribute("data-next");
    if (!nextSel) return;
    const next = document.querySelector(nextSel);
    if (!next) return;
    scrollToSection(next);
  }

  document.querySelectorAll("[data-scroll-next]").forEach((el) => {
    const section = el.closest(".snapSection");
    if (!section) return;

    el.addEventListener("click", () => scrollToNext(section));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        scrollToNext(section);
      }
    });
  });

  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      scrollToSection(target);

      history.replaceState(null, "", href);
    });
  });

  /* =========================================================
     Background parallax (~50% slower than content)
     - updates per section using --bgOffset
     ========================================================= */

  let parallaxTicking = false;

  function updateParallax() {
    if (!snapRoot) return;

    const st = snapRoot.scrollTop;

    sections.forEach((sec) => {
      const rel = st - sec.offsetTop;
      const offset = clamp(rel * 0.5, -360, 360);
      sec.style.setProperty("--bgOffset", `${offset}px`);
    });

    parallaxTicking = false;
  }

  if (snapRoot) {
    snapRoot.addEventListener(
      "scroll",
      () => {
        if (parallaxTicking) return;
        parallaxTicking = true;
        requestAnimationFrame(updateParallax);
      },
      { passive: true },
    );

    updateParallax();
  }

  /* =========================================================
     Active section highlighting + Experience background swap
     ========================================================= */

  function setActiveNav(id) {
    navLinks.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === `#${id}`),
    );
  }

  const swapTimers = new WeakMap();

  function clearSwap(section) {
    section.classList.remove("swapBg");
    const t = swapTimers.get(section);
    if (t) window.clearTimeout(t);
    swapTimers.delete(section);
  }

  function scheduleSwap(section) {
    const hasBgB =
      getComputedStyle(section).getPropertyValue("--bgB").trim().length > 0;
    const flagged = section.hasAttribute("data-bg2");
    if (!hasBgB || !flagged) return;

    const t = window.setTimeout(() => {
      section.classList.add("swapBg");
    }, 650);

    swapTimers.set(section, t);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const section = entry.target;
        if (!section || !section.id) return;

        if (entry.isIntersecting) {
          setActiveNav(section.id);
          scheduleSwap(section);
        } else {
          clearSwap(section);
        }
      });
    },
    { root: snapRoot || null, threshold: 0.6 },
  );

  sections.forEach((s) => io.observe(s));

  // === Rotating hero word ===
  const rotatingWords = [
    "Structure",
    "Clarity",
    "Systems",
    "Reliability",
    "Focus",
    "Solutions",
    "Order",
    "Results",
    "Simplicity",
    "Momentum",
  ];
  const rotatingWordSpan = document.getElementById("rotatingWord");
  let rotatingIdx = 0;

  function rotateHeroWord() {
    if (!rotatingWordSpan) return;
    rotatingWordSpan.style.opacity = 0;
    setTimeout(() => {
      rotatingIdx = (rotatingIdx + 1) % rotatingWords.length;
      rotatingWordSpan.textContent = rotatingWords[rotatingIdx];
      rotatingWordSpan.style.opacity = 1;
    }, 350);
  }

  if (rotatingWordSpan) {
    setInterval(rotateHeroWord, 1800);
  }

  // === Image Gallery ===
  const galleryImages = Array.from({ length: 12 }, (_, i) => `assets/beats/${i + 1}_Website.png`);
  let galleryIdx = 0;

  const galleryImg = document.getElementById("galleryImg");
  const galleryPrev = document.getElementById("galleryPrev");
  const galleryNext = document.getElementById("galleryNext");
  const imageGallery = document.getElementById("imageGallery");

  let galleryInterval = null;
  let galleryPaused = false;

  function showGalleryImg(idx) {
    if (!galleryImg) return;
    galleryImg.style.opacity = 0;
    setTimeout(() => {
      galleryImg.src = galleryImages[idx];
      galleryImg.style.opacity = 1;
    }, 250);
  }

  function nextGalleryImg() {
    galleryIdx = (galleryIdx + 1) % galleryImages.length;
    showGalleryImg(galleryIdx);
  }

  function prevGalleryImg() {
    galleryIdx = (galleryIdx - 1 + galleryImages.length) % galleryImages.length;
    showGalleryImg(galleryIdx);
  }

  function startGalleryAutoScroll() {
    if (galleryInterval) clearInterval(galleryInterval);
    galleryInterval = setInterval(() => {
      if (!galleryPaused) nextGalleryImg();
    }, 2000);
  }

  function pauseGalleryAutoScroll() {
    galleryPaused = true;
  }

  function resumeGalleryAutoScroll() {
    galleryPaused = false;
  }

  if (galleryPrev && galleryNext && galleryImg) {
    galleryPrev.addEventListener("click", () => {
      prevGalleryImg();
      pauseGalleryAutoScroll();
    });
    galleryNext.addEventListener("click", () => {
      nextGalleryImg();
      pauseGalleryAutoScroll();
    });

    // Pause auto-scroll on hover/focus, resume on leave/blur
    [galleryImg, galleryPrev, galleryNext, imageGallery].forEach((el) => {
      if (!el) return;
      el.addEventListener("mouseenter", pauseGalleryAutoScroll);
      el.addEventListener("mouseleave", resumeGalleryAutoScroll);
      el.addEventListener("focusin", pauseGalleryAutoScroll);
      el.addEventListener("focusout", resumeGalleryAutoScroll);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        prevGalleryImg();
        pauseGalleryAutoScroll();
      } else if (e.key === "ArrowRight") {
        nextGalleryImg();
        pauseGalleryAutoScroll();
      }
    });

    showGalleryImg(galleryIdx);
    startGalleryAutoScroll();
  }

  // === Screensaver / Easter Egg Logic ===
  const eggBtn = document.getElementById("easterEgg");
  const screensaverModal = document.getElementById("screensaverModal");
  const ssVideo = document.getElementById("ssVideo");
  const ssAudio = document.getElementById("ssAudio");

  if (eggBtn && screensaverModal && ssVideo) {
    // Set your video and audio sources here
    ssVideo.src = "assets/screensaver/screensaver.mp4"; // <-- update path if needed
    ssAudio.src = "assets/screensaver/screensaver.mp3"; // <-- update path if needed

    // Open modal and play screensaver
    eggBtn.addEventListener("click", () => {
      screensaverModal.classList.add("open");
      screensaverModal.setAttribute("aria-hidden", "false");
      ssVideo.currentTime = 0;
      ssAudio.currentTime = 0;
      ssVideo.play();
      ssAudio.play();
    });

    // Close modal and pause screensaver
    function closeScreensaver() {
      screensaverModal.classList.remove("open");
      screensaverModal.setAttribute("aria-hidden", "true");
      ssVideo.pause();
      ssAudio.pause();
    }

    // Close on backdrop or close button
    screensaverModal.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeScreensaver);
    });

    // Optional: close on Escape key
    document.addEventListener("keydown", (e) => {
      if (screensaverModal.classList.contains("open") && e.key === "Escape") {
        closeScreensaver();
      }
    });
  }
})();
