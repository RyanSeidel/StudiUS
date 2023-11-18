document.addEventListener('DOMContentLoaded', function () {
  let slideIndex = 0;
  const slides = document.querySelectorAll('.slide-image');
  showSlides(slideIndex);

  // Next/previous controls
  document.querySelector('.left-arrow').addEventListener('click', function () {
    showSlides(slideIndex -= 1);
  });

  document.querySelector('.right-arrow').addEventListener('click', function () {
    showSlides(slideIndex += 1);
  });

  // Function to toggle selection of a slide
  function toggleSelection(slide) {
    slide.classList.toggle('selected');
  }

  // Add click event listeners to each slide
  slides.forEach((slide, index) => {
    slide.addEventListener('click', function () {
      toggleSelection(slide); // Toggle the selected class on the div
      showSlides(index);
    });
  });

  function showSlides(n) {
    if (n >= slides.length) {
      slideIndex = 0;
    }
    if (n < 0) {
      slideIndex = slides.length - 1;
    }

    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = 'none';
    }

    slides[slideIndex].style.display = 'block';
  }
});
