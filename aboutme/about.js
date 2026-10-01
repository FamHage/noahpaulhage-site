(() => {
  const about = window.ABOUT_ME || {};
  const scene = document.querySelector(".about-scene");
  const portrait = document.querySelector(".about-portrait");
  const layer = document.querySelector("[data-card-layer]");
  const card = document.querySelector("#about-card");
  const content = document.querySelector("[data-about-card]");
  const closeButton = document.querySelector(".about-card__close");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let opener = null;

  const appendTextSection = (label, text) => {
    if (!text) return;
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    const paragraph = document.createElement("p");
    heading.textContent = label;
    paragraph.textContent = text;
    section.append(heading, paragraph);
    content.append(section);
  };

  const appendMeta = (label, value) => {
    if (!value) return;
    const row = document.createElement("p");
    row.className = "about-card__meta";
    row.innerHTML = `<span>${label}</span>`;
    row.append(document.createTextNode(value));
    content.append(row);
  };

  const render = () => {
    const title = document.createElement("header");
    const name = document.createElement("h1");
    const role = document.createElement("p");
    name.id = "about-card-name";
    name.textContent = about.name || "Noah Paul Hage";
    role.textContent = about.role || "";
    title.append(name, role);
    content.append(title);
    appendTextSection("About", about.about);
    appendTextSection("Backstory", about.backstory);
    appendTextSection("Design philosophy", about.philosophy);
    appendMeta("Location", about.location);
    appendMeta("Education", about.education);
    appendMeta("Experience", about.experience);

    const contactItems = [];
    if (about.email) contactItems.push({ label: "Email", href: `mailto:${about.email}`, external: false });
    if (about.instagram) contactItems.push({ label: "Instagram", href: about.instagram, external: true });
    (about.links || []).forEach((link) => link && link.label && link.href && contactItems.push({ ...link, external: true }));
    if (!contactItems.length) return;

    const contact = document.createElement("nav");
    contact.className = "about-card__contact";
    contact.setAttribute("aria-label", "Contact links");
    contactItems.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;
      if (item.external) {
        link.target = "_blank";
        link.rel = "noreferrer noopener";
      }
      contact.append(link);
    });
    content.append(contact);
  };

  const openCard = () => {
    opener = document.activeElement;
    layer.hidden = false;
    portrait.setAttribute("aria-expanded", "true");
    scene.classList.add("is-card-open");
    window.requestAnimationFrame(() => layer.classList.add("is-open"));
    window.setTimeout(() => card.focus(), reducedMotion ? 0 : 180);
  };

  const closeCard = () => {
    if (layer.hidden) return;
    portrait.setAttribute("aria-expanded", "false");
    scene.classList.remove("is-card-open");
    layer.classList.remove("is-open");
    window.setTimeout(() => { layer.hidden = true; }, reducedMotion ? 0 : 180);
    if (opener && typeof opener.focus === "function") opener.focus();
  };

  portrait.addEventListener("click", openCard);
  closeButton.addEventListener("click", closeCard);
  layer.addEventListener("click", (event) => { if (event.target === layer) closeCard(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeCard(); });
  render();
})();
