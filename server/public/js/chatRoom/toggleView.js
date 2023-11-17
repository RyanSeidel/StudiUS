/*
   CHAT VIEW TOGGLE FUNCTION

   This JavaScript code defines a function named 'toggleView' responsible for toggling between chat and participants views on a web page. It controls the display of elements associated with each view and updates button styles accordingly.

   Key components and functionalities:

   - The 'toggleView' function takes a 'view' parameter (either 'chat' or 'participants') and toggles the visibility of elements associated with that view while updating button styles to indicate the active view.

   - Elements such as 'chatBoxContainer,' 'participantsContainer,' 'msgBottom,' 'chatBtn,' and 'participantsBtn' are selected and their display properties are adjusted based on the 'view' parameter.

   - The function initializes with the chat view ('toggleView('chat')') as the active view.

   Note: To use this code, you should have corresponding HTML elements with matching IDs, CSS styles for button states, and additional code that triggers the 'toggleView' function based on user interactions, such as clicking buttons or tabs to switch between views.
*/

function toggleView(view) {
  const chatBoxContainer = document.getElementById('chat-box-container');
  const participantsContainer = document.getElementById('participants-container');
  const msgBottom = document.getElementsByClassName('msg-bottom')[0];
  const chatBtn = document.getElementById('chatBtn');
  const participantsBtn = document.getElementById('participantsBtn');

  if (view === 'chat') {
      chatBoxContainer.style.display = 'flex'; // Show chat box container
      participantsContainer.style.display = 'none'; // Hide participants container
      msgBottom.style.display = 'flex'; // Show msg-bottom
      chatBtn.classList.add('active-btn');
      participantsBtn.classList.remove('active-btn');
  } else if (view === 'participants') {
      chatBoxContainer.style.display = 'none'; // Hide chat box container
      participantsContainer.style.display = 'flex'; // Show participants container
      msgBottom.style.display = 'none'; // Hide msg-bottom
      chatBtn.classList.remove('active-btn');
      participantsBtn.classList.add('active-btn');
  }
}

// Initialize with chat view active
toggleView('chat');
