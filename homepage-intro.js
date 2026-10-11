(() => {
  const intro = document.querySelector("[data-intro]");
  if (!intro) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slides = [1, 5, 9, 14, 18, 23, 29, 34, 40, 44].map((id) => ({
    image: `images/touchme/touch me image (${id}).png`
  }));
  const soundSources = [
    "audio/touchme/touch-sound-04.mp3",
    "audio/touchme/touch-sound-05.mp3",
    "audio/touchme/touch-sound-10.mp3",
    "audio/touchme/touch-sound-11.mp3"
  ];
  const currentImage = intro.querySelector(".homepage-intro__image--current");
  const nextImage = intro.querySelector(".homepage-intro__image--next");
  const soundButton = intro.querySelector("[data-intro-sound]");
  const imageCache = new Map();
  const audioPool = new Map();
  let activeImage = currentImage;
  let standbyImage = nextImage;
  let index = 0;
  let running = true;
  let audioUnlocked = false;
  let muted = false;
  let activeAudio = null;
  let slideTimer = 0;
  let soundTimer = 0;

  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  let order = shuffle([...slides]);

  function preload(slide) {
    if (!slide || imageCache.has(slide.image)) return;
    const image = new Image();
    image.src = slide.image;
    imageCache.set(slide.image, image);
  }

  function preloadUpcoming() {
    preload(order[(index + 1) % order.length]);
    preload(order[(index + 2) % order.length]);
  }

  function duration() {
    if (reduceMotion) return 3600;
    const chance = Math.random();
    if (chance < .22) return 700 + Math.random() * 500;
    if (chance < .86) return 1800 + Math.random() * 1000;
    return 3500 + Math.random() * 1500;
  }

  function queueNext() {
    clearTimeout(slideTimer);
    if (!running || document.hidden) return;
    slideTimer = setTimeout(showNext, duration());
  }

  function showNext() {
    index += 1;
    if (index >= order.length) {
      order = shuffle([...slides]);
      index = 0;
    }
    const next = order[index];
    standbyImage.onload = () => {
      standbyImage.onload = null;
      standbyImage.classList.add("is-visible");
      activeImage.classList.remove("is-visible");
      [activeImage, standbyImage] = [standbyImage, activeImage];
      preloadUpcoming();
      queueNext();
    };
    standbyImage.src = next.image;
    if (standbyImage.complete) standbyImage.onload();
  }

  function audioFor(source) {
    if (audioPool.has(source)) return audioPool.get(source);
    const audio = new Audio(source);
    audio.preload = "metadata";
    audioPool.set(source, audio);
    return audio;
  }

  function stopAudio() {
    if (!activeAudio) return;
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }

  function playSound() {
    if (!running || !audioUnlocked || muted || document.hidden) return;
    stopAudio();
    const source = soundSources[Math.floor(Math.random() * soundSources.length)];
    const audio = audioFor(source);
    activeAudio = audio;
    audio.volume = source.endsWith("05.mp3") ? .16 : .12;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    const hold = 2400 + Math.random() * 2200;
    setTimeout(() => { if (activeAudio === audio) stopAudio(); }, hold);
  }

  function scheduleSound() {
    clearTimeout(soundTimer);
    if (!running || !audioUnlocked || muted || document.hidden) return;
    if (Math.random() > .58) playSound();
    soundTimer = setTimeout(scheduleSound, 3400 + Math.random() * 5200);
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    soundButton.setAttribute("aria-pressed", "true");
    soundButton.setAttribute("aria-label", "Mute introduction sound");
    scheduleSound();
  }

  function updateSoundButton() {
    soundButton.setAttribute("aria-pressed", String(!muted && audioUnlocked));
    soundButton.setAttribute("aria-label", muted ? "Unmute introduction sound" : "Mute introduction sound");
  }

  currentImage.src = order[0].image;
  currentImage.classList.add("is-visible");
  preloadUpcoming();
  queueNext();

  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("[data-intro-sound]")) unlockAudio();
  }, { once: true, passive: true });
  document.addEventListener("keydown", (event) => {
    if (!event.target.closest("[data-intro-sound]")) unlockAudio();
  }, { once: true });
  ["pointerdown", "keydown"].forEach((eventName) => soundButton.addEventListener(eventName, (event) => event.stopPropagation()));
  soundButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!audioUnlocked) unlockAudio();
    else muted = !muted;
    if (muted) stopAudio();
    updateSoundButton();
    scheduleSound();
  });

  new IntersectionObserver(([entry]) => {
    running = entry.intersectionRatio > .25;
    if (running) {
      queueNext();
      scheduleSound();
    } else {
      clearTimeout(slideTimer);
      clearTimeout(soundTimer);
      stopAudio();
    }
  }, { threshold: [.25] }).observe(intro);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(slideTimer);
      clearTimeout(soundTimer);
      stopAudio();
    } else if (running) {
      queueNext();
      scheduleSound();
    }
  });
})();
