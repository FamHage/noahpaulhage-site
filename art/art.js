(() => {
  const artworks = window.ARTWORKS || [];
  const artworkImage = document.querySelector("[data-artwork-image]");
  const artworkIndex = document.querySelector("[data-artwork-index]");
  const current = document.querySelector("[data-current]");
  const total = document.querySelector("[data-total]");
  const card = document.querySelector("[data-index-card]");
  const cardImage = document.querySelector("[data-card-image]");
  const cardTitle = document.querySelector("[data-card-title]");
  let currentIndex = 0;

  total.textContent = artworks.length;

  const closeCard = () => { card.hidden = true; };
  const showCard = (item) => {
    cardImage.src = item.image;
    cardImage.alt = item.title;
    cardTitle.textContent = item.title;
    card.hidden = false;
  };

  const render = () => {
    const artwork = artworks[currentIndex];
    current.textContent = currentIndex + 1;
    artworkImage.src = artwork.image;
    artworkImage.alt = artwork.alt;
    artworkIndex.replaceChildren();
    closeCard();

    artwork.indexItems.forEach((item) => {
      const button = document.createElement("button");
      const image = document.createElement("img");
      button.type = "button";
      button.className = "artwork-index__item";
      button.style.left = `${item.x}%`;
      button.style.top = `${item.y}%`;
      button.style.width = `${item.width}%`;
      button.setAttribute("aria-label", item.title);
      image.src = item.image;
      image.alt = "";
      button.append(image);
      button.addEventListener("click", () => showCard(item));
      artworkIndex.append(button);
    });
  };

  const move = (direction) => {
    currentIndex = (currentIndex + direction + artworks.length) % artworks.length;
    render();
  };

  document.querySelector(".gallery-arrow--previous").addEventListener("click", () => move(-1));
  document.querySelector(".gallery-arrow--next").addEventListener("click", () => move(1));
  document.querySelector(".index-card__close").addEventListener("click", closeCard);
  render();
})();
