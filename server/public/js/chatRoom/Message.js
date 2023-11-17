/*
   DEBOUNCE FUNCTION FOR MESSAGE SENDING

   This JavaScript code defines a debounce function that helps manage the sending of messages in a chat application. It ensures that the sendMessage function is called with a delay, preventing multiple rapid calls when a user presses the Enter key repeatedly.

   Key functionalities:

   - Implements a debounce function that delays the execution of a given function.
   - Listens for the "Enter" key press in the message input field.
   - Checks if an image is attached to the message input.
   - Sends the message (with or without an image) to the chat room using the socket.io library.
   - Handles clearing the input field and resetting the image preview after sending.

   Note: This code assumes the existence of appropriate HTML elements for message input and image attachment, as well as integration with the socket.io library for real-time chat functionality.
*/

function debounce(func, delay) {
    let debounceTimer;
    return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
}

const debouncedSendMessage = debounce(sendMessage, 300); // Apply debounce

document.getElementById("message-input").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default Enter key action
        const imageInput = document.getElementById("image-input");
        if (imageInput.files.length > 0) {
            debouncedSendMessage(); // Use debounced function
        } else {
            debouncedSendMessage(); // Use debounced function
        }
    }
});

function sendMessage() {
  const input = document.getElementById("message-input");
  const inputValue = input.value.trim();
  const imageInput = document.getElementById("image-input");

  if (imageInput.files.length > 0) {
      const formData = new FormData();
      formData.append("image", imageInput.files[0]);

      fetch("/upload", {
          method: "POST",
          body: formData,
      })
      .then((response) => response.json())
      .then((data) => {
          const imageUrl = data.imageUrl;
          socket.emit("sendMessage", {
              roomId: roomId,
              senderName: name,
              body: `<img src="${imageUrl}" alt="Image" width="150">`,
          });
          imageInput.value = ""; // Clear the image input
          input.style.backgroundImage = 'none'; // Remove the image preview
          input.style.height = '40px'; // Reset the height to original size
          document.querySelector('.clear-preview').style.display = 'none'; // Hide the clear preview button
      });
  } else if (inputValue) {
      socket.emit("sendMessage", {
          roomId: roomId,
          senderName: name,
          body: inputValue,
      });
      input.value = ""; // Clear the input field
  } else {
      alert("Sorry, you didn't type anything or attach an image.");
  }
}
