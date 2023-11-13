function toggleView(view) {
  const chatBox = document.getElementById('chat-box');
  const msgBottom = document.getElementsByClassName('msg-bottom')[0];
  const chatBtn = document.getElementById('chatBtn');
  const participantsBtn = document.getElementById('participantsBtn');

  if (view === 'chat') {
      chatBox.style.display = 'block'; // Show chat box
      msgBottom.style.display = 'flex'; // Show msg-bottom div
      chatBtn.classList.add('active-btn');
      participantsBtn.classList.remove('active-btn');
  } else if (view === 'participants') {
      chatBox.style.display = 'none'; // Hide chat box
      msgBottom.style.display = 'none'; // Hide msg-bottom div
      chatBtn.classList.remove('active-btn');
      participantsBtn.classList.add('active-btn');
  }
}

// Initialize with chat view active
toggleView('chat');
