/*
   IMAGE PREVIEW BEFORE SENDING MESSAGE

   This JavaScript code is responsible for enabling users to preview images before sending them as messages in a web application's chat functionality.

   Key functionalities:

   - Listens for changes in the file input element for image uploads.
   - Displays a preview of the selected image.
   - Utilizes the FileReader API to read the selected image file.
   - Updates the image preview element with the selected image data.
   - Allows users to review the image before confirming its inclusion in a message.

   Note: This code assumes the existence of corresponding HTML elements and CSS styles for the file input and image preview. It enhances the user experience by providing a visual preview of images before they are sent as messages.
*/

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