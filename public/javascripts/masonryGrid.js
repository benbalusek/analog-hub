"use strict";

// Masonry grid
document.addEventListener("DOMContentLoaded", function () {
  const grid = document.querySelector(".grid");
  window.masonry = new Masonry(grid, {
    itemSelector: ".grid-item",
    gutter: 20,
    columnWidth: ".grid-item",
    percentPosition: true,
  });
});
