(() => {
  const imageButton = document.querySelector(".touchme-object");
  const image = document.querySelector(".touchme-object__image");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const audioCache = new Map();
  let index = 0;
  let activeAudio = null;
  let changing = false;

  const itemAt = (position) => touchMeItems[position % touchMeItems.length];

  function preload(position) {
    const item = itemAt(position);
    const preview = new Image();
    preview.src = item.image;
    if (!audioCache.has(item.sound)) {
      const audio = new Audio(item.sound);
      audio.preload = "auto";
      audio.volume = 0.25;
      audioCache.set(item.sound, audio);
    }
  }

  function stopAudio(audio) {
    if (!audio) return;
    const start = audio.volume;
    const steps = 8;
    let step = 0;
    const fade = window.setInterval(() => {
      step += 1;
      audio.volume = Math.max(0, start * (1 - step / steps));
      if (step >= steps) {
        window.clearInterval(fade);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0.25;
      }
    }, 32);
  }

  function playCurrentSound() {
    const current = itemAt(index);
    const audio = audioCache.get(current.sound) || new Audio(current.sound);
    audioCache.set(current.sound, audio);
    stopAudio(activeAudio);
    activeAudio = audio;
    audio.currentTime = 0;
    audio.volume = 0.25;
    audio.play().catch(() => {});
  }

  function show(position) {
    const item = itemAt(position);
    image.src = item.image;
    image.alt = item.alt;
    imageButton.setAttribute("aria-label", `Touch image ${item.id}: ${item.description}`);
    preload(position + 1);
    preload(position + 2);
  }

  function advance() {
    if (changing) return;
    changing = true;
    playCurrentSound();
    imageButton.classList.add("is-changing");
    const delay = reduceMotion ? 150 : 280;
    window.setTimeout(() => {
      index = (index + 1) % touchMeItems.length;
      show(index);
      imageButton.classList.remove("is-changing");
      changing = false;
    }, delay);
  }

  show(index);
  preload(index);
  document.documentElement.classList.add("touchme-ready");
  imageButton.addEventListener("click", advance);
})();
