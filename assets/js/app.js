(() => {
  const search = document.querySelector("[data-paper-search]");
  const papers = Array.from(document.querySelectorAll("[data-paper]"));

  if (search && papers.length > 0) {
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();

      papers.forEach((paper) => {
        const visible = !query || paper.dataset.search.includes(query);
        paper.hidden = !visible;
      });
    });
  }

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const counter = carousel.querySelector("[data-carousel-count]");
    let active = 0;

    const render = () => {
      slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === active);
      });

      if (counter) {
        counter.textContent = (active + 1) + " / " + slides.length;
      }
    };

    if (previous) {
      previous.addEventListener("click", () => {
        active = active === 0 ? slides.length - 1 : active - 1;
        render();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        active = active === slides.length - 1 ? 0 : active + 1;
        render();
      });
    }
  });
})();