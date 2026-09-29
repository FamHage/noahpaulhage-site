(() => {
  const { looks, houseCodes, process } = window.ARCHIVE;
  const app = document.querySelector("#app"), nav = [...document.querySelectorAll("nav a")];
  let lookIndex = 0, touchStart = 0, opener = null;
  document.querySelector("#year").textContent = new Date().getFullYear();
  const route = () => location.hash.replace("#", "") || "work";
  const esc = value => String(value).replace(/[&<>\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[char]));
  const preload = () => [looks[(lookIndex + 1) % looks.length], looks[(lookIndex - 1 + looks.length) % looks.length]].forEach(look => { const image = new Image(); image.src = look.heroImage; });
  const changeLook = direction => { lookIndex = (lookIndex + direction + looks.length) % looks.length; showLook(); };
  const openDetail = (detail, source) => {
    opener = source;
    const dialog = document.createElement("dialog"); dialog.className = "detail-dialog";
    dialog.innerHTML = `<article class="detail-panel" aria-labelledby="detail-title"><header class="panel-header"><div><p class="eyebrow">Detail note</p><h2 id="detail-title">${esc(detail.title)}</h2></div><button class="panel-close" type="button" aria-label="Close detail">×</button></header><img class="detail-image" src="${detail.image}" alt="Placeholder detail image for ${esc(detail.title)}" loading="lazy"><dl class="metadata"><dt>Component</dt><dd>${esc(detail.component)}</dd><dt>Collection</dt><dd>${esc(looks[lookIndex].collection)}</dd><dt>Materials</dt><dd>${esc(detail.materials)}</dd></dl><section class="panel-section"><h3>Construction</h3><p>${esc(detail.construction)}</p></section><section class="panel-section"><h3>Description</h3><p>${esc(detail.description)}</p></section><section class="panel-section"><h3>Context</h3><p>${esc(detail.context)}</p></section></article>`;
    document.body.append(dialog); dialog.showModal();
    dialog.querySelector(".panel-close").onclick = () => dialog.close();
    dialog.addEventListener("close", () => { dialog.remove(); opener?.focus(); }); dialog.querySelector(".panel-close").focus();
  };
  const addHelper = stage => {
    const helper = document.createElement("aside"); helper.className = "hotspot-helper";
    helper.innerHTML = "Development helper: click the image to copy coordinates.<code>x: —, y: —</code>"; stage.append(helper);
    stage.onclick = event => { if (event.target.closest("button")) return; const box = stage.getBoundingClientRect(); const x = ((event.clientX - box.left) / box.width * 100).toFixed(1), y = ((event.clientY - box.top) / box.height * 100).toFixed(1); helper.querySelector("code").textContent = `x: ${x}, y: ${y}`; };
  };
  const showLook = () => {
    const look = looks[lookIndex];
    app.innerHTML = `<section class="slideshow" aria-label="Fashion look slideshow"><div class="look-stage" id="look-stage"><img class="look-image" src="${look.heroImage}" alt="${esc(look.heroAlt)}" fetchpriority="high"><span class="placeholder-note">Placeholder image — replace with approved work</span><div class="look-caption"><p>${esc(look.collection)}</p><h1>${esc(look.title)}</h1></div>${look.details.map(detail => `<button class="hotspot" style="left:${detail.x}%;top:${detail.y}%" data-detail="${detail.id}" aria-label="Open detail: ${esc(detail.title)}" title="${esc(detail.title)}"></button>`).join("")}</div><div class="slideshow-controls"><button type="button" data-prev aria-label="Previous look">←</button><span class="look-counter">${String(lookIndex + 1).padStart(2,"0")} / ${String(looks.length).padStart(2,"0")}</span><button type="button" data-next aria-label="Next look">→</button></div></section>`;
    app.querySelector("[data-prev]").onclick = () => changeLook(-1); app.querySelector("[data-next]").onclick = () => changeLook(1);
    app.querySelectorAll("[data-detail]").forEach(button => button.onclick = () => openDetail(look.details.find(detail => detail.id === button.dataset.detail), button));
    const stage = app.querySelector("#look-stage"); stage.ontouchstart = event => { touchStart = event.changedTouches[0].screenX; }; stage.ontouchend = event => { const delta = event.changedTouches[0].screenX - touchStart; if (Math.abs(delta) > 45) changeLook(delta > 0 ? -1 : 1); };
    if (["localhost", "127.0.0.1"].includes(location.hostname)) addHelper(stage); preload();
  };
  const page = (title, intro, body, extra = "") => `<section class="archive-page ${extra}"><p class="eyebrow">Noah Paul Hage</p><h1>${title}</h1><p class="page-intro">${intro}</p><hr class="rule">${body}</section>`;
  const showPage = view => {
    if (view === "house-codes") app.innerHTML = page("House Codes", "A living index of recurring ideas. Each entry is a placeholder awaiting verified text and images.", `<div class="codes">${houseCodes.map(([title, text]) => `<article class="code"><span class="code-mark" aria-hidden="true"></span><h2>${title}</h2><p>${text}</p></article>`).join("")}</div>`);
    else if (view === "process") app.innerHTML = page("Process", "A quiet space for approved documentation of making, testing, fitting and material development.", `<div class="process-grid">${process.map(([title, text]) => `<article class="process-card"><h2>${title}</h2><p>${text}</p></article>`).join("")}</div>`);
    else if (view === "about") app.innerHTML = page("About", "Noah Paul Hage is a fashion designer with an interest in expressive silhouettes, thoughtful construction, and the possibilities held within every material. This archive will grow as approved work and writing are added.", "", "about-page");
    else showLook();
  };
  const render = () => { const current = route(); nav.forEach(link => link.toggleAttribute("aria-current", link.getAttribute("href") === `#${current}`)); showPage(current); };
  window.addEventListener("hashchange", render);
  document.addEventListener("keydown", event => { if (route() === "work" && !document.querySelector("dialog[open]")) { if (event.key === "ArrowLeft") changeLook(-1); if (event.key === "ArrowRight") changeLook(1); } });
  render();
})();
