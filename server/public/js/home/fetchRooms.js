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
            roomsListDiv.innerHTML = ''; // Clear existing rooms

            rooms.forEach(room => {
                const roomDiv = document.createElement('div');
                roomDiv.className = 'room';
                roomDiv.style.cursor = 'pointer';
                roomDiv.style.margin = '10px 0';
                roomDiv.style.display = 'flex';
                roomDiv.style.justifyContent = 'space-between';

                const roomInfo = document.createElement('div');
                roomInfo.style.display = 'flex';
                roomInfo.style.flexDirection = 'column';

                const roomName = document.createElement('div');
                roomName.textContent = `Group Name: ${room.name}`;
                roomName.style.marginBottom = '5px';

                const roomOwner = document.createElement('div');
                roomOwner.textContent = `Owner: ${room.ownerName}`;
                roomOwner.style.fontSize = '12px';
                roomOwner.style.marginBottom = '5px';

                const roomMembers = document.createElement('div');
                roomMembers.textContent = `Members: ${room.userNames.length}`;
                roomMembers.style.fontSize = '12px';

                roomInfo.appendChild(roomName);
                roomInfo.appendChild(roomOwner);
                roomInfo.appendChild(roomMembers);

                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.flexDirection = 'row';

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.style.marginRight = '5px';
                editButton.addEventListener('click', () => {
                    const editRoomModal = document.getElementById('editRoomModal');
                    editRoomModal.style.display = 'block';

                    document.getElementById('editRoomName').value = room.name;
                    const roomMembersList = document.getElementById('roomMembersList');
                    roomMembersList.innerHTML = '';

                    const ownerElement = document.createElement('div');
                    ownerElement.textContent = `Owner: ${room.ownerName}`;
                    roomMembersList.appendChild(ownerElement);

                    const membersHeading = document.createElement('h4');
                    membersHeading.textContent = 'Members:';
                    roomMembersList.appendChild(membersHeading);

                    room.userNames.forEach((userName, index) => {
                        if (userName !== room.ownerName) {
                            const memberItem = document.createElement('div');
                            memberItem.style.display = 'flex';
                            memberItem.style.justifyContent = 'space-between';
                            memberItem.style.alignItems = 'center';
                    
                            const memberName = document.createElement('span');
                            memberName.textContent = `${index + 1}. ${userName}`;
                            memberItem.appendChild(memberName);
                    
                            const innerButtonContainer = document.createElement('div');
                    
                            const promoteButton = document.createElement('button');
                            promoteButton.textContent = 'Promote';
                            promoteButton.className = 'promote-button'; // Add a class for styling
                            // Add logic for promoteButton click event
                    
                            const removeButton = document.createElement('button');
                            removeButton.textContent = 'X';
                            removeButton.className = 'remove-button'; // Add a class for styling
                            // Add logic for removeButton click event
                    
                            innerButtonContainer.appendChild(promoteButton);
                            innerButtonContainer.appendChild(removeButton);
                            memberItem.appendChild(innerButtonContainer);
                    
                            roomMembersList.appendChild(memberItem);
                        }
                    });
                    

                    if (room.ownerId === currentUserId) {
                        const deleteRoomButton = document.createElement('button');
                        deleteRoomButton.textContent = 'Delete Room';
                        deleteRoomButton.className = 'delete-room-button'; // Add a class for the delete button
                        deleteRoomButton.addEventListener('click', () => {
                            const isConfirmed = window.confirm(`Are you sure you want to delete '${room.name}'?`);
                            if (isConfirmed) {
                                fetch('/delete-room', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ roomId: room._id })
                                })
                                .then(response => {
                                    if (response.ok) {
                                        editRoomModal.style.display = 'none';
                                        fetchRooms();
                                    } else {
                                        console.error('Error deleting room');
                                    }
                                })
                                .catch(error => console.error('Error:', error));
                            }
                        });
                        roomMembersList.appendChild(deleteRoomButton);
                    }
                    
                });

                const leaveButton = document.createElement('button');
                leaveButton.textContent = 'Leave';
                leaveButton.style.marginRight = '5px';
                // Add logic for leaveButton click event

                const goButton = document.createElement('button');
                goButton.textContent = 'Go';
                goButton.addEventListener('click', () => {
                    window.location.href = `/chatroom?roomId=${room._id}`;
                });

                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(goButton);
                if (room.ownerId !== currentUserId) {
                    buttonContainer.appendChild(leaveButton);
                }

                roomDiv.appendChild(roomInfo);
                roomDiv.appendChild(buttonContainer);

                roomsListDiv.appendChild(roomDiv);
            });
        })
        .catch(error => {
            console.error("Error fetching rooms:", error);
        });
}

fetchRooms();



// Close the modal when the close button is clicked
document.getElementById('closeEditRoomModal').addEventListener('click', () => {
    document.getElementById('editRoomModal').style.display = 'none';
});

// Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == document.getElementById('editRoomModal')) {
        document.getElementById('editRoomModal').style.display = 'none';
    }
};


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

    // Fetch user names based on selected user IDs
    fetch('/get-user-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers })
    })
    .then(response => response.json())
    .then(userNames => {
        selectedUsersDisplay.innerHTML = ""; // Clear previous users

        userNames.forEach((userName, index) => {
            const userDiv = document.createElement('div');
            userDiv.style.display = 'flex';
            userDiv.style.alignItems = 'center';
            userDiv.style.justifyContent = 'space-between';

            // Display user name
            const userNameText = document.createElement('span');
            userNameText.textContent = userName;
            userDiv.appendChild(userNameText);

            // Create the remove button
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'X';
            removeBtn.className = 'remove-button'; // Add a class for styling
            removeBtn.style.marginLeft = '10px';
            removeBtn.addEventListener('click', () => {
                // Remove the user from the array and the display
                selectedUsers.splice(index, 1);
                userDiv.remove();
            });

            userDiv.appendChild(removeBtn);
            selectedUsersDisplay.appendChild(userDiv);
        });
    })
    .catch(error => {
        console.error("Error fetching user names:", error);
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
    console.log("Confirm button clicked"); // Debugging log

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
        console.log("Room created, calling fetchRooms()"); // Debugging log
        fetchRooms(); // Refresh the rooms list
    })
    .catch(error => {
        console.error("Error creating room:", error);
    })
    .finally(() => {
        console.log("Hiding modal"); // Debugging log
        createRoomModal.style.display = "none"; // Hide the modal
    });
});
