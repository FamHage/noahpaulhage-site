(() => {
  const looks = window.LOOKS || [];
  const page = document.querySelector(".looks-page");
  const image = document.querySelector("[data-look-image]");
  const index = document.querySelector("[data-look-index]");
  const current = document.querySelector("[data-current]");
  const total = document.querySelector("[data-total]");
  const card = document.querySelector("[data-look-card]");
  const fields = ["title", "garment", "material", "construction", "collection", "context"];
  let currentIndex = 0;
  total.textContent = looks.length;

  const closeCard = () => { card.hidden = true; };
  const openCard = (hotspot) => {
    fields.forEach((field) => { document.querySelector(`[data-card-${field}]`).textContent = hotspot[field]; });
    card.hidden = false;
  };
  const render = () => {
    const look = looks[currentIndex];
    current.textContent = currentIndex + 1;
    image.src = look.image;
    image.alt = look.alt;
    index.replaceChildren();
    closeCard();
    look.hotspots.forEach((hotspot) => {
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
  const move = (direction) => { currentIndex = (currentIndex + direction + looks.length) % looks.length; render(); };
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
