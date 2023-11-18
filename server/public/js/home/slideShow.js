document.addEventListener('DOMContentLoaded', function () {
  let slideIndex = 0;
  const slides = document.querySelectorAll('.slide-image');
  let currentlySelectedIndex = null; // Variable to keep track of the currently selected slide index
  showSlides(slideIndex);

  // Next/previous controls
  document.querySelector('.left-arrow').addEventListener('click', function () {
      showSlides(slideIndex -= 1);
  });

  document.querySelector('.right-arrow').addEventListener('click', function () {
      showSlides(slideIndex += 1);
  });

  // Function to toggle selection of a slide
  function toggleSelection(slide, index) {
      if (currentlySelectedIndex !== null && currentlySelectedIndex !== index) {
          // If another slide is already selected, prevent selection
          console.log("Please unselect the current slide before selecting another.");
          return;
      }

      slide.classList.toggle('selected');
      if (slide.classList.contains('selected')) {
          currentlySelectedIndex = index; // Update the currently selected index
          if (index === 0) {
              console.log('Peer');
          } else if (index === 1) {
              console.log('Game');
          }
      } else {
          currentlySelectedIndex = null; // Reset the currently selected index
      }
  }

  // Add click event listeners to each slide
  slides.forEach((slide, index) => {
      slide.addEventListener('click', function () {
          toggleSelection(slide, index);
          showSlides(index);
      });
  });

  function showSlides(n) {
      let slides = document.querySelectorAll('.slide');
      let captions = document.querySelectorAll('.slide-text');
      
      if (n >= slides.length) {
          slideIndex = 0;
      }
      if (n < 0) {
          slideIndex = slides.length - 1;
      }

      // Hide all slides and captions
      for (let i = 0; i < slides.length; i++) {
          slides[i].style.display = 'none';
          captions[i].style.display = 'none';
      }

      // Show the current slide and its caption
      slides[slideIndex].style.display = 'block';
      captions[slideIndex].style.display = 'block';
  }
});
