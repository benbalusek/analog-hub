"use strict";

// Like Button
document.addEventListener("DOMContentLoaded", function () {
  const likeForms = document.querySelectorAll(".like-form");
  likeForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      if (currentUser) {
        e.preventDefault();

        const photoId =
          this.querySelector(".like-button").getAttribute("data-photo-id");

        fetch(`/photos/${photoId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({}),
        })
          .then((response) => response.json())
          .then((data) => {
            // update the like button count dynamically based on the server response
            const likeButton = this.querySelector(".like-button");
            likeButton.innerHTML = data.isLiked
              ? `<i id="heart" class="fa-solid fa-heart"> ${data.updatedLikeCount}</i>`
              : `<i id="heart" class="fa-regular fa-heart"> ${data.updatedLikeCount}</i>`;
          })
          .catch((error) => console.error("Error:", error));
      }
    });
  });
});
