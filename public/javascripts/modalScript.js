"use strict";

document.addEventListener("DOMContentLoaded", function () {
  let currentClickedImg = null;
  const gridContainer = document.querySelector(".grid");

  //////////////////////////////////////////////////////////////////////
  // Hide modal
  photoModal.addEventListener("hidden.bs.modal", function () {
    const commentBox = document.querySelector("#comment");
    if (commentBox) {
      commentBox.value = "";
    }
  });

  //////////////////////////////////////////////////////////////////////
  // Delegate click event from the grid container
  gridContainer.addEventListener("click", function (event) {
    const target = event.target;
    currentClickedImg = target;
    updateModalContent(target);
  });

  //////////////////////////////////////////////////////////////////////
  // Update modal content
  function updateModalContent(img) {
    const photoId = img.getAttribute("data-bs-photo-id");
    const title = img.getAttribute("alt");
    const description = img.getAttribute("data-bs-description");
    const location = img.getAttribute("data-bs-location");
    const author = img.getAttribute("data-bs-author");
    const authorId = img.getAttribute("data-bs-author-id");
    const likeCount = img.getAttribute("data-bs-like-count");
    const isLiked = img.getAttribute("data-bs-is-liked") === "true";
    const commentsData = img.getAttribute("data-bs-comments-data");

    const modalTitle = document.querySelector(".photo-title");
    const modalTitleLink = document.querySelector(".title-link");
    const modalDescription = document.querySelector(".photo-description");
    const modalLocation = document.querySelector(".photo-location");
    const modalAuthor = document.querySelector(".photo-author");
    const modalAuthorLink = document.querySelector(".author-link");
    const modalLikeButton = document.querySelector(".like-button");

    modalTitle.textContent = title;
    modalTitleLink.href = `/photos/${photoId}`;
    modalDescription.textContent = description;
    modalLocation.textContent = location;
    modalAuthor.textContent = author;
    modalAuthorLink.href = `/${authorId}`;
    modalLikeButton.innerHTML = isLiked
      ? `<i class="fa-solid fa-heart"></i> ${likeCount}`
      : `<i class="fa-regular fa-heart"></i> ${likeCount}`;
    modalLikeButton.setAttribute("data-photo-id", photoId);

    const modalLikeForm = document.querySelector(".like-form");
    modalLikeForm.setAttribute("data-photo-id", photoId);
    if (commentsData) {
      updateComments(commentsData);
    }
    let imagesData = [];
    try {
      imagesData = JSON.parse(img.getAttribute("data-bs-images"));
    } catch (error) {
      console.error("Parsing error in imagesData:", error);
    }
    updateCarousel(imagesData);
  }

  //////////////////////////////////////////////////////////////////////
  // Update comments
  function updateComments(commentsData) {
    const commentsSection = document.querySelector(".comments-section");
    commentsSection.innerHTML = "";

    const comments = JSON.parse(commentsData).reverse();
    comments.forEach((comment) => {
      const commentDiv = document.createElement("div");
      commentDiv.classList.add("mb-3");

      const commentText = document.createElement("p");
      commentText.textContent = comment.text;
      commentText.classList.add("d-inline");

      const authorLink = document.createElement("a");
      authorLink.href = `/${comment.authorId}`;

      const authorName = document.createElement("h6");
      authorName.classList.add("text-muted", "d-inline");
      authorName.textContent = ` -${comment.author}`;

      authorLink.appendChild(authorName);
      commentDiv.appendChild(commentText);
      commentDiv.appendChild(authorLink);
      commentsSection.appendChild(commentDiv);
    });
  }

  //////////////////////////////////////////////////////////////////////
  // Update carousel
  function updateCarousel(imagesData) {
    const carouselInner = document.querySelector(
      "#photoCarousel .carousel-inner"
    );
    const carousel = document.querySelector("#photoCarousel");
    carouselInner.innerHTML = "";

    // remove existing controls before adding new ones to avoid duplicates
    const existingControls = carousel.querySelectorAll(
      ".carousel-control-prev, .carousel-control-next"
    );
    existingControls.forEach((control) => control.remove());

    imagesData.forEach((image, index) => {
      const carouselItem = document.createElement("div");
      carouselItem.className = `carousel-item ${index === 0 ? "active" : ""}`;
      carouselItem.setAttribute("data-bs-dismiss", "modal");

      const imageWrapper = document.createElement("div");
      imageWrapper.className = "image-wrapper";

      const imgElement = document.createElement("img");
      imgElement.src = image.url;
      imgElement.className = "d-block w-100 img-fluid max-height-img";
      imgElement.alt = "Full Screen Photo";

      imageWrapper.appendChild(imgElement);
      carouselItem.appendChild(imageWrapper);
      carouselInner.appendChild(carouselItem);
    });

    // add carousel controls if there are more than one image
    if (imagesData.length > 1) {
      const prevButton = document.createElement("button");
      prevButton.className = "carousel-control-prev";
      prevButton.type = "button";
      prevButton.setAttribute("data-bs-target", "#photoCarousel");
      prevButton.setAttribute("data-bs-slide", "prev");
      prevButton.innerHTML =
        '<span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span>';

      const nextButton = document.createElement("button");
      nextButton.className = "carousel-control-next";
      nextButton.type = "button";
      nextButton.setAttribute("data-bs-target", "#photoCarousel");
      nextButton.setAttribute("data-bs-slide", "next");
      nextButton.innerHTML =
        '<span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span>';

      carousel.appendChild(prevButton);
      carousel.appendChild(nextButton);
    }
  }

  //////////////////////////////////////////////////////////////////////
  // Function to attach click listeners to images
  function attachClickListenersToImages() {
    document.querySelectorAll(".grid-item img").forEach((img) => {
      img.removeEventListener("click", handleImageClick);
      img.addEventListener("click", handleImageClick);
    });
  }

  //////////////////////////////////////////////////////////////////////
  // Handle image click to open and set modal
  function handleImageClick() {
    updateModalContent(this);
  }

  //////////////////////////////////////////////////////////////////////
  // Attach click listeners to images
  attachClickListenersToImages();

  //////////////////////////////////////////////////////////////////////
  // Like Button
  document.querySelector(".like-form").addEventListener("submit", function (e) {
    e.preventDefault();

    if (typeof currentUser === "undefined" || !currentUser) {
      window.location.href = "/login";
      return;
    }

    const photoId = this.getAttribute("data-photo-id");

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
        const likeButton = this.querySelector(".like-button");
        likeButton.innerHTML = data.isLiked
          ? `<i id="heart" class="fa-solid fa-heart"> ${data.updatedLikeCount}</i>`
          : `<i id="heart" class="fa-regular fa-heart"> ${data.updatedLikeCount}</i>`;

        if (currentClickedImg) {
          currentClickedImg.setAttribute(
            "data-bs-is-liked",
            data.isLiked.toString()
          );
          currentClickedImg.setAttribute(
            "data-bs-like-count",
            data.updatedLikeCount.toString()
          );
        }
      })
      .catch((error) => console.error("Error:", error));
  });

  //////////////////////////////////////////////////////////////////////
  // Comment Form
  document
    .querySelector(".comment-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      if (typeof currentUser === "undefined" || !currentUser) {
        window.location.href = "/login";
        return;
      }

      const photoId = currentClickedImg.getAttribute("data-bs-photo-id");
      const commentText = document.querySelector("#comment").value;

      try {
        const response = await fetch(`/photos/${photoId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({ comment: { text: commentText } }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        addCommentToUI(data.comment);
        updateCommentsDataOnImage(currentClickedImg, data.comment);

        document.querySelector("#comment").value = "";
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    });

  //////////////////////////////////////////////////////////////////////
  // Function to update comments data attribute on the image element
  function updateCommentsDataOnImage(imgElement, newComment) {
    let commentsData = JSON.parse(
      imgElement.getAttribute("data-bs-comments-data") || "[]"
    );
    commentsData.push({
      text: newComment.text,
      author: newComment.author,
      authorId: newComment.authorId,
    });
    imgElement.setAttribute(
      "data-bs-comments-data",
      JSON.stringify(commentsData)
    );
  }

  //////////////////////////////////////////////////////////////////////
  // Add comment to modal
  function addCommentToUI(comment) {
    const commentsSection = document.querySelector(".comments-section");
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("mb-3");
    const commentHTML = `
    <p class="d-inline">${comment.text}</p>
    <a href="${comment.authorId}">
      <h6 class="d-inline text-muted"> -${comment.author}</h6>
    </a>
  `;
    commentDiv.innerHTML = commentHTML;
    if (commentsSection.firstChild) {
      commentsSection.insertBefore(commentDiv, commentsSection.firstChild);
    } else {
      // If there are no comments, just append the new comment
      commentsSection.appendChild(commentDiv);
    }
  }
});
