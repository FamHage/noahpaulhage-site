(() => {
  const intro = document.querySelector("[data-intro]");
  if (!intro) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchDevice = matchMedia("(hover: none), (pointer: coarse)").matches;
  const storageKey = "nph-intro-seen-images";
  const notes = ["cut here", "soften seam", "keep", "too harsh", "memory", "trace", "layer", "hand finish", "leave thread", "godet?", "again", "unfinished", "do not clean", "more air", "less structure", "remember this", "wrong scale", "keep the mistake"];
  const metadata = ["PAGE 03", "ARCHIVE 2026", "LOOK 07", "SCAN 14", "NPH / 01", "09.30.26", "STUDY 04", "SAMPLE", "PROCESS"];
  const slides = Array.from({ length: 44 }, (_, index) => ({ id: index + 1, image: `images/touchme/touch me image (${index + 1}).png`, processImage: null, sound: `audio/touchme/touch-sound-${String(index + 1).padStart(2, "0")}.mp3` }));
  const currentImage = intro.querySelector(".homepage-intro__image--current");
  const nextImage = intro.querySelector(".homepage-intro__image--next");
  const processImage = intro.querySelector(".homepage-intro__process");
  const slideshow = intro.querySelector("[data-intro-image]");
  const afterimages = intro.querySelector(".homepage-intro__afterimages");
  const ephemera = intro.querySelector(".homepage-intro__ephemera");
  const scanLight = intro.querySelector(".homepage-intro__scan-light");
  const logo = intro.querySelector(".homepage-intro__logo");
  const soundButton = intro.querySelector("[data-intro-sound]");
  const canvas = intro.querySelector(".homepage-intro__thread");
  const context2d = canvas.getContext("2d");
  const imageCache = new Map();
  const audioCache = new Map();
  let visible = true, audioUnlocked = false, muted = false, audioContext, soundTimer, nextTimer, quietUntil = 0;
  let activeSounds = new Set(), threadPoints = [], trailFrame = 0, holdTimer, hoverTimer, isHolding = false;
  let imageIndex = 0, activeImage = currentImage, queuedImage = nextImage;
  let specialState = Math.random() < .08 ? ["linger", "offset-logo", "harp", "note", "mono", "slow"][Math.floor(Math.random() * 6)] : null;
  let order = buildOrder();

  function shuffle(items) { for (let i = items.length - 1; i; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; } return items; }
  function readSeen() { try { return new Set(JSON.parse(sessionStorage.getItem(storageKey) || "[]")); } catch { return new Set(); } }
  function buildOrder() { const seen = readSeen(), unseen = slides.filter((slide) => !seen.has(slide.id)); if (!unseen.length) { try { sessionStorage.removeItem(storageKey); } catch {} return shuffle([...slides]); } return [...shuffle(unseen), ...shuffle(slides.filter((slide) => seen.has(slide.id)))]; }
  function markSeen(slide) { const seen = readSeen(); seen.add(slide.id); try { sessionStorage.setItem(storageKey, JSON.stringify([...seen])); } catch {} }
  function preloadImage(slide) { if (!slide || imageCache.has(slide.image)) return; const image = new Image(); image.src = slide.image; imageCache.set(slide.image, image); }
  function preloadUpcoming() { for (let i = 1; i <= 3; i += 1) preloadImage(order[(imageIndex + i) % order.length]); }
  function imageDuration() { if (reduceMotion) return 5200; if (specialState === "linger") return 8500 + Math.random() * 3000; if (specialState === "slow") return 6500 + Math.random() * 2600; return 2850 + Math.random() * 1900; }

  function addAfterimage(src) {
    if (reduceMotion || !src) return;
    const ghost = new Image(); ghost.className = "homepage-intro__afterimage"; ghost.src = src; ghost.alt = "";
    ghost.style.setProperty("--ghost-x", `${-1 + Math.random() * 2}vw`); ghost.style.setProperty("--ghost-y", `${-1 + Math.random() * 2}vh`);
    ghost.style.setProperty("--ghost-scale", `${.99 + Math.random() * .025}`); ghost.style.setProperty("--ghost-life", `${1200 + Math.random() * 1800}ms`);
    afterimages.append(ghost); while (afterimages.children.length > 2) afterimages.firstElementChild.remove(); window.setTimeout(() => ghost.remove(), 3400);
  }
  function triggerScanLight() { if (reduceMotion || Math.random() > .12) return; scanLight.classList.remove("is-scanning"); void scanLight.offsetWidth; scanLight.classList.add("is-scanning"); }
  function showNextImage() {
    imageIndex += 1; if (imageIndex >= order.length) { order = buildOrder(); imageIndex = 0; }
    const slide = order[imageIndex]; queuedImage.src = slide.image;
    queuedImage.onload = () => { addAfterimage(activeImage.src); queuedImage.classList.add("is-visible"); activeImage.classList.remove("is-visible"); [activeImage, queuedImage] = [queuedImage, activeImage]; markSeen(slide); preloadUpcoming(); triggerScanLight(); nextTimer = window.setTimeout(showNextImage, imageDuration()); };
  }

  function fadeVolume(audio, from, to, duration, done) { const start = performance.now(); const frame = (now) => { const progress = Math.min(1, (now - start) / duration); audio.volume = Math.max(0, from + (to - from) * progress); if (progress < 1) requestAnimationFrame(frame); else if (done) done(); }; requestAnimationFrame(frame); }
  function panFor(slide) { if ([8, 9, 10].includes(slide.id)) return .22; if ([6, 12, 38].includes(slide.id)) return -.18; if ([4, 5, 31, 37, 41].includes(slide.id)) return 0; return -.16 + Math.random() * .32; }
  function audioFor(slide) {
    if (audioCache.has(slide.sound)) return audioCache.get(slide.sound);
    const audio = new Audio(slide.sound); audio.preload = "auto"; const record = { audio, panner: null };
    if (audioContext) { const source = audioContext.createMediaElementSource(audio); if (audioContext.createStereoPanner) { record.panner = audioContext.createStereoPanner(); source.connect(record.panner).connect(audioContext.destination); } else source.connect(audioContext.destination); }
    audioCache.set(slide.sound, record); return record;
  }
  function currentGain() { return !muted && visible && !document.hidden && Date.now() >= quietUntil ? 1 : 0; }
  function stopSound(record) { if (!activeSounds.has(record)) return; const audio = record.audio; fadeVolume(audio, audio.volume, 0, 850, () => { audio.pause(); audio.currentTime = 0; activeSounds.delete(record); }); }
  function playSound(slide) {
    if (!audioUnlocked || !currentGain() || activeSounds.size >= 3) return;
    const record = audioFor(slide), audio = record.audio; if (record.panner) record.panner.pan.setTargetAtTime(panFor(slide), audioContext.currentTime, .18);
    audio.currentTime = 0; audio.volume = 0; activeSounds.add(record);
    audio.play().then(() => { fadeVolume(audio, 0, .055 + Math.random() * .16, 700); window.setTimeout(() => stopSound(record), 2100 + Math.floor(Math.random() * 3900)); }).catch(() => activeSounds.delete(record));
  }
  function scheduleSoundscape() {
    clearTimeout(soundTimer); if (!audioUnlocked || muted || !visible || document.hidden) return;
    if (Date.now() < quietUntil) { soundTimer = setTimeout(scheduleSoundscape, quietUntil - Date.now() + 80); return; }
    if (Math.random() < .07) { activeSounds.forEach(stopSound); quietUntil = Date.now() + 2000 + Math.random() * 4000; soundTimer = setTimeout(scheduleSoundscape, quietUntil - Date.now() + 80); return; }
    const anchor = specialState === "harp" || Math.random() < .36; playSound(anchor ? slides[Math.random() < .5 ? 3 : 4] : slides[Math.floor(Math.random() * slides.length)]);
    if (Math.random() < .18) setTimeout(() => playSound(slides[Math.floor(Math.random() * slides.length)]), 500 + Math.random() * 1000);
    soundTimer = setTimeout(scheduleSoundscape, 1450 + Math.random() * 3600);
  }
  function unlockSoundscape() { if (audioUnlocked) return; audioUnlocked = true; audioContext = new (window.AudioContext || window.webkitAudioContext)(); audioContext.resume(); soundButton.setAttribute("aria-label", "Mute introduction sound"); soundButton.setAttribute("aria-pressed", "true"); scheduleSoundscape(); }
  function refreshSoundscape() { activeSounds.forEach((record) => { if (!currentGain()) stopSound(record); }); scheduleSoundscape(); }

  function addEphemera(kind) {
    if (reduceMotion || !visible || ephemera.children.length > 1) return;
    const item = document.createElement("span"); item.className = `homepage-intro__${kind}`; item.textContent = kind === "note" ? notes[Math.floor(Math.random() * notes.length)] : metadata[Math.floor(Math.random() * metadata.length)];
    item.style.left = `${Math.random() < .5 ? 5 + Math.random() * 18 : 76 + Math.random() * 15}%`; item.style.top = `${12 + Math.random() * 72}%`; ephemera.append(item); setTimeout(() => item.remove(), kind === "note" ? 6400 : 10000);
  }
  function scheduleEphemera() {
    if (reduceMotion) return;
    setTimeout(function notesLoop() { addEphemera("note"); setTimeout(notesLoop, 9000 + Math.random() * 8000); }, specialState === "note" ? 2500 : 7000 + Math.random() * 6000);
    setTimeout(function marksLoop() { addEphemera("metadata"); setTimeout(marksLoop, 14000 + Math.random() * 12000); }, 4500 + Math.random() * 5000);
  }

  function resizeCanvas() { const rect = intro.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(rect.width * ratio); canvas.height = Math.round(rect.height * ratio); context2d.setTransform(ratio, 0, 0, ratio, 0, 0); }
  function drawTrail() {
    trailFrame = 0; if (reduceMotion || touchDevice || !visible || document.hidden) return;
    const now = performance.now(), rect = intro.getBoundingClientRect(); context2d.clearRect(0, 0, rect.width, rect.height); threadPoints = threadPoints.filter((point) => now - point.time < 2600);
    for (let i = 1; i < threadPoints.length; i += 1) { const previous = threadPoints[i - 1], point = threadPoints[i], age = (now - point.time) / 2600; context2d.strokeStyle = `rgba(65,82,99,${Math.max(0, .2 * (1 - age))})`; context2d.lineWidth = Math.max(.45, 1.1 * (1 - age)); context2d.lineCap = "round"; context2d.beginPath(); context2d.moveTo(previous.x, previous.y); context2d.quadraticCurveTo((previous.x + point.x) / 2, (previous.y + point.y) / 2, point.x, point.y); context2d.stroke(); }
    if (threadPoints.length) trailFrame = requestAnimationFrame(drawTrail);
  }
  function revealProcess() { const slide = order[imageIndex]; processImage.src = slide.processImage || slide.image; intro.classList.add("is-revealing"); }
  function clearReveal() { clearTimeout(holdTimer); clearTimeout(hoverTimer); intro.classList.remove("is-revealing"); isHolding = false; }
  function updateDissolve() { const progress = Math.max(0, Math.min(1, scrollY / Math.max(1, innerHeight * .84))); intro.style.setProperty("--intro-dissolve", progress.toFixed(3)); if (audioUnlocked && progress > .12) refreshSoundscape(); }

  const first = order[imageIndex]; currentImage.src = first.image; currentImage.classList.add("is-visible"); markSeen(first); preloadUpcoming(); nextTimer = setTimeout(showNextImage, imageDuration()); if (specialState === "offset-logo") logo.style.translate = ".5rem -.35rem"; if (specialState === "mono") intro.classList.add("is-monochrome"); scheduleEphemera(); resizeCanvas();
  document.addEventListener("pointerdown", (event) => { if (!event.target.closest("[data-intro-sound]")) unlockSoundscape(); }, { once: true, passive: true });
  document.addEventListener("keydown", (event) => { if (!event.target.closest("[data-intro-sound]")) unlockSoundscape(); }, { once: true });
  ["pointerdown", "keydown"].forEach((eventName) => soundButton.addEventListener(eventName, (event) => event.stopPropagation()));
  soundButton.addEventListener("click", (event) => { event.stopPropagation(); if (!audioUnlocked) { unlockSoundscape(); return; } muted = !muted; soundButton.setAttribute("aria-pressed", String(!muted)); soundButton.setAttribute("aria-label", muted ? "Unmute introduction sound" : "Mute introduction sound"); refreshSoundscape(); });
  slideshow.addEventListener("pointerdown", (event) => { if (event.button && event.pointerType !== "touch") return; isHolding = true; holdTimer = setTimeout(revealProcess, 900); });
  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => slideshow.addEventListener(eventName, clearReveal));
  if (!touchDevice) {
    slideshow.addEventListener("mouseenter", () => { const slide = order[imageIndex]; if (slide.processImage) hoverTimer = setTimeout(revealProcess, 2800); }); slideshow.addEventListener("mouseleave", clearReveal);
    intro.addEventListener("pointermove", (event) => { if (!visible) return; const rect = intro.getBoundingClientRect(); threadPoints.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, time: performance.now() }); if (threadPoints.length > 56) threadPoints.shift(); if (!trailFrame) trailFrame = requestAnimationFrame(drawTrail); const bounds = logo.getBoundingClientRect(), proximity = Math.max(0, 1 - Math.hypot(bounds.left + bounds.width / 2 - event.clientX, bounds.top + bounds.height / 2 - event.clientY) / Math.max(bounds.width, 1)); logo.style.filter = `contrast(${1 + proximity * .035})`; });
  }
  new IntersectionObserver(([entry]) => { visible = entry.intersectionRatio > .2; if (!visible) { threadPoints = []; context2d.clearRect(0, 0, canvas.width, canvas.height); cancelAnimationFrame(trailFrame); trailFrame = 0; } refreshSoundscape(); }, { threshold: [0, .2, .55] }).observe(intro);
  let scrollFrame = 0; addEventListener("scroll", () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updateDissolve(); }); }, { passive: true }); addEventListener("resize", resizeCanvas, { passive: true }); document.addEventListener("visibilitychange", refreshSoundscape); updateDissolve();
})();
