(() => {
  const intro = document.querySelector("[data-intro]");
  if (!intro) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slides = Array.from({ length: 44 }, (_, index) => ({
    image: `images/touchme/touch me image (${index + 1}).png`,
    sound: `audio/touchme/touch-sound-${String(index + 1).padStart(2, "0")}.mp3`
  }));
  const currentImage = intro.querySelector(".homepage-intro__image--current");
  const nextImage = intro.querySelector(".homepage-intro__image--next");
  const soundButton = intro.querySelector("[data-intro-sound]");
  const imageCache = new Map();
  const audioCache = new Map();
  let order = shuffle([...slides]);
  let imageIndex = 0;
  let activeImage = currentImage;
  let queuedImage = nextImage;
  let audioUnlocked = false;
  let muted = false;
  let introVisible = true;
  let activeSounds = new Set();
  let soundTimer;

  function shuffle(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
    }
    return items;
  }

  function preloadImage(item) {
    if (imageCache.has(item.image)) return;
    const image = new Image();
    image.src = item.image;
    imageCache.set(item.image, image);
  }

  function preloadUpcoming() {
    for (let offset = 1; offset <= 3; offset += 1) {
      preloadImage(order[(imageIndex + offset) % order.length]);
    }
  }

  function imageDuration() {
    return reduceMotion ? 5200 : 2850 + Math.floor(Math.random() * 1900);
  }

  function showNextImage() {
    imageIndex += 1;
    if (imageIndex >= order.length) {
      order = shuffle([...slides]);
      imageIndex = 0;
    }
    const item = order[imageIndex];
    queuedImage.src = item.image;
    queuedImage.onload = () => {
      queuedImage.classList.add("is-visible");
      activeImage.classList.remove("is-visible");
      const previous = activeImage;
      activeImage = queuedImage;
      queuedImage = previous;
      preloadUpcoming();
      window.setTimeout(showNextImage, imageDuration());
    };
  }

  function fadeVolume(audio, from, to, duration, done) {
    const started = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      audio.volume = Math.max(0, from + (to - from) * progress);
      if (progress < 1) requestAnimationFrame(step);
      else if (done) done();
    };
    requestAnimationFrame(step);
  }

  function stopSound(audio) {
    if (!activeSounds.has(audio)) return;
    const start = audio.volume;
    fadeVolume(audio, start, 0, 850, () => {
      audio.pause();
      audio.currentTime = 0;
      activeSounds.delete(audio);
    });
  }

  function currentGain() {
    return !muted && introVisible && !document.hidden ? 1 : 0;
  }

  function playSound(item) {
    if (!audioUnlocked || !currentGain() || activeSounds.size >= 3) return;
    const audio = audioCache.get(item.sound) || new Audio(item.sound);
    audioCache.set(item.sound, audio);
    audio.preload = "auto";
    audio.currentTime = 0;
    audio.volume = 0;
    activeSounds.add(audio);
    audio.play().then(() => {
      const target = 0.055 + Math.random() * 0.16;
      fadeVolume(audio, 0, target, 700);
      window.setTimeout(() => stopSound(audio), 2100 + Math.floor(Math.random() * 3900));
    }).catch(() => activeSounds.delete(audio));
  }

  function scheduleSoundscape() {
    window.clearTimeout(soundTimer);
    if (!audioUnlocked || muted || !introVisible || document.hidden) return;
    const anchor = Math.random() < 0.36;
    const item = anchor ? slides[Math.random() < 0.5 ? 3 : 4] : slides[Math.floor(Math.random() * slides.length)];
    playSound(item);
    if (Math.random() < 0.18) {
      window.setTimeout(() => playSound(slides[Math.floor(Math.random() * slides.length)]), 500 + Math.random() * 1000);
    }
    soundTimer = window.setTimeout(scheduleSoundscape, 1450 + Math.random() * 3600);
  }

  function unlockSoundscape() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    soundButton.setAttribute("aria-label", "Mute introduction sound");
    soundButton.setAttribute("aria-pressed", "true");
    scheduleSoundscape();
  }

  function refreshSoundscape() {
    for (const audio of activeSounds) {
      if (!currentGain()) stopSound(audio);
    }
    scheduleSoundscape();
  }

  const first = order[imageIndex];
  currentImage.src = first.image;
  currentImage.classList.add("is-visible");
  preloadUpcoming();
  window.setTimeout(showNextImage, imageDuration());

  const unlockEvents = ["pointerdown", "keydown"];
  const unlockFromInteraction = (event) => {
    if (event.target.closest && event.target.closest("[data-intro-sound]")) return;
    unlockSoundscape();
  };
  unlockEvents.forEach((eventName) => document.addEventListener(eventName, unlockFromInteraction, { once: true, passive: eventName === "pointerdown" }));

  soundButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!audioUnlocked) {
      unlockSoundscape();
      return;
    }
    muted = !muted;
    soundButton.setAttribute("aria-pressed", String(!muted));
    soundButton.setAttribute("aria-label", muted ? "Unmute introduction sound" : "Mute introduction sound");
    refreshSoundscape();
  });

  new IntersectionObserver(([entry]) => {
    introVisible = entry.intersectionRatio > 0.35;
    refreshSoundscape();
  }, { threshold: [0, 0.35, 0.7] }).observe(intro);

  document.addEventListener("visibilitychange", refreshSoundscape);
})();
