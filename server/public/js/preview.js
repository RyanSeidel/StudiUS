function displayPreview(input) {
  const file = input.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
          const messageInput = document.getElementById('message-input');
          messageInput.style.backgroundImage = `url(${event.target.result})`;

          // Display the clear preview button
          document.querySelector('.clear-preview').style.display = 'block';

          // Adjust the height of the text box based on the image's height
          const img = new Image();
          img.src = event.target.result;
          img.onload = function() {
              // Adjust the height of the input field if the image is large
              if (img.height > 100) {  // Example: Adjust based on a certain height, you can change this value
                  messageInput.style.height = `${img.height}px`;
              }
          }
      }
      reader.readAsDataURL(file);
  }
}


function clearPreview() {
  const messageInput = document.getElementById('message-input');
  const imageInput = document.getElementById("image-input");
  
  messageInput.style.backgroundImage = 'none';
  messageInput.style.height = '40px'; // Reset the height to original size
  document.querySelector('.clear-preview').style.display = 'none';
  
  imageInput.value = ''; // Clear the file input's value
}