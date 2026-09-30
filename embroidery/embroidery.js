(() => {
  const pieces = window.EMBROIDERY || [];
  const page = document.querySelector(".embroidery-page");
  const image = document.querySelector("[data-embroidery-image]");
  const index = document.querySelector("[data-embroidery-index]");
  const current = document.querySelector("[data-current]");
  const total = document.querySelector("[data-total]");
  const card = document.querySelector("[data-embroidery-card]");
  const fields = ["title", "detail", "material", "technique", "placement", "context"];
  let currentIndex = 0;
  total.textContent = pieces.length;

  const closeCard = () => { card.hidden = true; };
  const openCard = (hotspot) => {
    fields.forEach((field) => { document.querySelector(`[data-card-${field}]`).textContent = hotspot[field]; });
    card.hidden = false;
  };
  const render = () => {
    const piece = pieces[currentIndex];
    current.textContent = currentIndex + 1;
    image.src = piece.image;
    image.alt = piece.alt;
    index.replaceChildren();
    closeCard();
    piece.hotspots.forEach((hotspot) => {
      const button = document.createElement("button");
      const buttonImage = document.createElement("img");
      button.type = "button";
      button.className = "artwork-index__item";
      button.style.left = `${hotspot.x}%`;
      button.style.top = `${hotspot.y}%`;
      button.style.width = `${hotspot.width}%`;
      button.setAttribute("aria-label", hotspot.title);
      buttonImage.src = hotspot.buttonImage;
      buttonImage.alt = "";
      button.append(buttonImage);
      button.addEventListener("click", () => openCard(hotspot));
      index.append(button);
    });
  };
  const move = (direction) => { currentIndex = (currentIndex + direction + pieces.length) % pieces.length; render(); };
  document.querySelector(".gallery-arrow--previous").addEventListener("click", () => move(-1));
  document.querySelector(".gallery-arrow--next").addEventListener("click", () => move(1));
  document.querySelector(".index-card__close").addEventListener("click", closeCard);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCard();
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });
  page.addEventListener("click", (event) => { if (event.target === page && !card.hidden) closeCard(); });
  render();
})();
