function toggleView(view) {
  const chatBox = document.getElementById('chat-box');
  const participantsList = document.getElementById('participants-list');
  const msgBottom = document.getElementsByClassName('msg-bottom')[0]; // Get the msg-bottom div
  const chatBtn = document.getElementById('chatBtn');
  const participantsBtn = document.getElementById('participantsBtn');

  if (view === 'chat') {
      chatBox.style.display = 'block'; // Show chat box
      participantsList.style.display = 'none'; // Hide participants list
      msgBottom.style.display = 'block'; // Show msg-bottom div
      chatBtn.classList.add('active-btn');
      participantsBtn.classList.remove('active-btn');
  } else {
      chatBox.style.display = 'none'; // Hide chat box
      participantsList.style.display = 'block'; // Show participants list
      msgBottom.style.display = 'none'; // Hide msg-bottom div
      chatBtn.classList.remove('active-btn');
      participantsBtn.classList.add('active-btn');
  }
}

// Initialize with chat view active
toggleView('chat');
