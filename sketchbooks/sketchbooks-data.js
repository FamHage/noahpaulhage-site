(() => {
  const pages = Array.from({ length: 35 }, (_, index) => {
    const pageNumber = index + 1;
    const filename = pageNumber >= 10 && pageNumber < 35 ? `0${pageNumber}` : String(pageNumber).padStart(2, "0");
    return { image: `../images/sketchbooks/sketchbook-${filename}.png`, alt: `Sketchbook 1, page ${pageNumber}`, title: "Untitled sketchbook page", pageNumber, date: "Undated", medium: "Mixed media on paper", process: "Layered drawing, collage, thread, and paper construction.", context: "From Sketchbook 1.", notes: "Archival entry in progress." };
  });
  window.SKETCHBOOKS = [{ id: "sketchbook-01", title: "Sketchbook 1", thumbnail: "../images/sketchbooks/scroll bottom left - sketchbook 1.png", pages }];
})();
