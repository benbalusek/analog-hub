"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Masonry
  let grid = document.querySelector(".grid");
  let msnry = new Masonry(grid, {
    itemSelector: ".grid-item",
    gutter: 20,
    percentPosition: true,
  });

  // Infinite Scroll
  let infScroll = new InfiniteScroll(grid, {
    path: ".pagination__next",
    append: ".grid-item",
    outlayer: msnry,
    status: ".page-load-status",
    history: false,
  });

  // Ensure new items are laid out by Masonry
  infScroll.on("append", function () {
    msnry.layout();
  });
});
