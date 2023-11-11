function fetchRooms() {
  fetch('/get-rooms')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(rooms => {
          const roomsListDiv = document.getElementById('rooms-list');
          rooms.forEach(room => {
              const roomDiv = document.createElement('div');
              roomDiv.className = 'room';
              roomDiv.style.cursor = 'pointer';
              roomDiv.style.margin = '10px 0';  // Margin for spacing between each room

              const roomName = document.createElement('div');
              roomName.textContent = `Group Name: ${room.name}`;
              roomName.style.marginBottom = '5px';  // Margin for spacing between room name and member count

              const roomMembers = document.createElement('div');
              roomMembers.textContent = `${room.userIds.length} members`;
              roomMembers.style.fontSize = '12px';

              roomDiv.appendChild(roomName);
              roomDiv.appendChild(roomMembers);

              roomDiv.addEventListener('click', () => {
                  window.location.href = `/chatroom?roomId=${room._id}`;
              });

              roomsListDiv.appendChild(roomDiv);
          });
      })
      .catch(error => {
          console.error("Error fetching rooms:", error);
      });
}

fetchRooms();

    
// Initiate Create Room Modal handlers
const initCreateRoomBtn = document.getElementById('init-create-room');
const createRoomModal = document.getElementById('createRoomModal');
const closeCreateRoomModalBtn = document.getElementById('closeCreateRoomModal');
const confirmCreateRoomBtn = document.getElementById('confirmCreateRoom');
const selectedUsersDisplay = document.getElementById('selectedUsersDisplay');
const newRoomNameInput = document.getElementById('newRoomName');

initCreateRoomBtn.addEventListener('click', () => {
    if (selectedUsers.length === 0) {
        alert("No users are selected.");
        return;
    }

    // Show the names of the selected users in the modal
    selectedUsersDisplay.innerHTML = ""; // Clear previous users
    selectedUsers.forEach(userId => {
        const userDiv = document.createElement('div');
        userDiv.textContent = userId; // For now, using userId as display. Modify this as needed.
        selectedUsersDisplay.appendChild(userDiv);
    });

    createRoomModal.style.display = "block"; // Show the modal
});

closeCreateRoomModalBtn.onclick = () => createRoomModal.style.display = "none";

window.onclick = event => {
    if (event.target === createRoomModal) {
        createRoomModal.style.display = "none";
    }
};

confirmCreateRoomBtn.addEventListener('click', () => {
    const roomName = newRoomNameInput.value;
    if (!roomName.trim()) {
        alert("Please provide a room name.");
        return;
    }

    fetch('/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, allowedUsers: selectedUsers })
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => { throw err; });
        }
        return res.json();
    })
    .then(room => {
        fetchRooms();
        createRoomModal.style.display = "none"; // Hide the modal
    })
    .catch(error => {
        console.error("Error creating room:", error);
    });
});
