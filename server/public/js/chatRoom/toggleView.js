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
