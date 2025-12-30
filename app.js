(() => {
  // --- Elements
  const steps = Array.from(document.querySelectorAll(".step"));
  const cards = Array.from(document.querySelectorAll(".card"));
  const bgLayers = Array.from(document.querySelectorAll(".bg-layer"));
  const audio = document.getElementById("bgMusic");
  const playPauseBtn = document.getElementById("playPause");
  const volume = document.getElementById("volume");
  const themeToggle = document.getElementById("themeToggle");
  const trailToggle = document.getElementById("trailToggle");
  let secretBtn = document.getElementById("secretBtn");

  // Restore hidden debug button if missing
  if (!secretBtn) {
    secretBtn = document.createElement("button");
    secretBtn.className = "secret";
    secretBtn.id = "secretBtn";
    secretBtn.type = "button";
    secretBtn.setAttribute("aria-label", "Debug toggle");
    secretBtn.textContent = "•";
    document.querySelector(".controls").appendChild(secretBtn);
  }

  // --- State
  let activeIndex = 0;

  // --- Background switching
  function setBackground(bgIndex) {
    bgLayers.forEach(layer => {
      layer.classList.toggle("is-visible", Number(layer.dataset.bg) === bgIndex);
    });
  }

  // --- Card switching with cinematic position
  function setActive(index) {
    activeIndex = index;
    cards.forEach((card, i) => {
      card.classList.toggle("is-active", i === index);
      if (i === index) {
        // Cinematic position
        const pos = steps[i].dataset.pos || "center";
        let x = 0, y = 0;
        if (pos === "left") x = -140;
        if (pos === "right") x = 140;
        if (pos === "leftFar") x = -180;
        if (pos === "rightFar") x = 180;
        if (pos === "up") y = -80;
        if (pos === "down") y = 80;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
      }
    });
    // Background
    const bgIndex = Number(steps[index].dataset.bg ?? 0);
    setBackground(bgIndex);
  }

  // Set initial state
  setActive(0);

  // --- Scroll observer (drives the scrollytelling)
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const idx = Number(visible.target.dataset.step);
      if (!Number.isNaN(idx)) setActive(idx);
    },
    { threshold: [0.25, 0.5, 0.75] }
  );
  steps.forEach(step => observer.observe(step));

  // --- Audio controls & autoplay
  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
  });
  audio.volume = Number(volume.value);

  async function tryAutoplay() {
    try {
      await audio.play();
      playPauseBtn.textContent = "Pause";
    } catch (err) {
      playPauseBtn.textContent = "Play";
      // Most browsers require user gesture, so fallback to manual play
    }
  }
  tryAutoplay();

  playPauseBtn.addEventListener("click", async () => {
    try {
      if (audio.paused) {
        await audio.play();
        playPauseBtn.textContent = "Pause";
      } else {
        audio.pause();
        playPauseBtn.textContent = "Play";
      }
    } catch (err) {
      playPauseBtn.textContent = "Play";
      alert("Audio couldn't start. Double-check the MP3 filename/path and try again.");
    }
  });

  audio.addEventListener("pause", () => { playPauseBtn.textContent = "Play"; });
  audio.addEventListener("play", () => { playPauseBtn.textContent = "Pause"; });

  // --- Theme toggle
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("theme-alt");
  });

  // --- Mouse trail
  let dot = document.querySelector(".trail-dot");
  if (!dot) {
    dot = document.createElement("div");
    dot.className = "trail-dot";
    document.body.appendChild(dot);
  }
  let trailOn = false;
  trailToggle.addEventListener("click", () => {
    trailOn = !trailOn;
    document.body.classList.toggle("trail-on", trailOn);
  });
  window.addEventListener("mousemove", (e) => {
    if (!trailOn) return;
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
  });

  // --- Hidden debug toggle
  secretBtn.addEventListener("click", () => {
    document.body.classList.toggle("debug");
  });
})();
