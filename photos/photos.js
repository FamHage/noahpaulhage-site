(() => {
  const photos = window.PHOTOS || [];
  const page = document.querySelector(".photos-page");
  const photoImage = document.querySelector("[data-photo-image]");
  const current = document.querySelector("[data-current]");
  const total = document.querySelector("[data-total]");
  const card = document.querySelector("[data-photo-card]");
  const trigger = document.querySelector(".photo-trigger");
  let currentIndex = 0;

  const fields = ["title", "date", "location", "medium", "context"];
  total.textContent = photos.length;

  const closeCard = () => { card.hidden = true; };
  const openCard = () => {
    const photo = photos[currentIndex];
    fields.forEach((field) => { document.querySelector(`[data-card-${field}]`).textContent = photo[field]; });
    card.hidden = false;
  };

  const render = () => {
    const photo = photos[currentIndex];
    current.textContent = currentIndex + 1;
    photoImage.src = photo.image;
    photoImage.alt = photo.alt;
    closeCard();
  };

  const move = (direction) => {
    currentIndex = (currentIndex + direction + photos.length) % photos.length;
    render();
  };

  trigger.addEventListener("click", openCard);
  document.querySelector(".photo-card__close").addEventListener("click", closeCard);
  document.querySelector(".gallery-arrow--previous").addEventListener("click", () => move(-1));
  document.querySelector(".gallery-arrow--next").addEventListener("click", () => move(1));
  page.addEventListener("click", (event) => { if (event.target === page && !card.hidden) closeCard(); });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCard();
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });
  render();
})();
