/*
   ROOM MANAGEMENT JAVASCRIPT

   This JavaScript code is responsible for managing room-related functionalities on a web page. It includes functionalities for fetching, rendering, and interacting with rooms, such as displaying room information, editing rooms, leaving rooms, and creating new rooms.

   Key components and functionalities:

   - The 'fetchRooms' function sends a request to the server to fetch a list of rooms and displays them on the web page. It also includes the ability to edit rooms, leave rooms, and navigate to chat rooms.

   - Event listeners are added to various elements, such as buttons and modals, to handle user interactions. For example, there are event listeners for clicking on room buttons, the "Unselect All" button, creating rooms, and closing modals.

   - The code manages selected users for creating new rooms and includes functionality for displaying selected users, validating room names, and creating new rooms.

   Note: To use this code, you should have corresponding HTML elements with matching IDs and a server endpoint for fetching and managing room data. CSS styles may also be needed for the visual presentation of rooms and user interface components.
*/

function toggleRoomType(selectedType) {
    const gameButton = document.getElementById('selectGame');
    const peersButton = document.getElementById('selectPeers');

    gameButton.classList.toggle('selected', selectedType === 'game');
    peersButton.classList.toggle('selected', selectedType === 'peers');

    // Adding console log for debugging
    console.log(`Room type selected: ${selectedType}`);
}

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

                const activeParticipants = document.createElement('div');
                activeParticipants.className = 'active-participants';
                activeParticipants.id = `active-participants-${room._id}`; // Unique ID for each room
                activeParticipants.textContent = `Active: ${room.activeParticipants || 0}`;

                roomInfo.appendChild(roomName);
                roomInfo.appendChild(roomOwner);
                roomInfo.appendChild(roomMembers);
                roomInfo.appendChild(activeParticipants); // Add this line

                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.flexDirection = 'row';

                const goButton = document.createElement('button');
                goButton.textContent = 'Go';
                goButton.className = 'go-button'; // Add a class for styling
                goButton.addEventListener('click', () => {
                    window.location.href = `/chatroom?roomId=${room._id}`;
                });

                
                if (room.ownerId === currentUserId) {  
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.className = 'edit-button'; // Add a class for styling
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
                                promoteButton.addEventListener('click', () => {
                                    const userInput = prompt(`Type '${userName}' to confirm promoting them to room owner:`);
                                    if (userInput === userName) {
                                        fetch('/promote-user', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ roomId: room._id, username: userName }) // Using username instead of user ID
                                        })
                                        .then(response => {
                                            if (response.ok) {
                                                console.log('User promoted successfully');
                                
                                                // Close the edit room modal if it's open
                                                const editRoomModal = document.getElementById('editRoomModal');
                                                if (editRoomModal) {
                                                    editRoomModal.style.display = 'none';
                                                }
                                
                                                // Refresh the room list
                                                fetchRooms();
                                            } else {
                                                console.error('Error promoting user');
                                            }
                                        })
                                        .catch(error => console.error('Error:', error));
                                    }
                                });
                                
                                 // Set the initial state of room type buttons
                                const currentRoomType = room.type; // Assuming 'type' is a property of your room object
                                toggleRoomType(currentRoomType);

                                // Add event listeners to room type buttons
                                document.getElementById('selectGame').addEventListener('click', () => toggleRoomType('game'));
                                document.getElementById('selectPeers').addEventListener('click', () => toggleRoomType('peers'));
                                
                        
                                const removeButton = document.createElement('button');
                                removeButton.textContent = 'X';
                                removeButton.className = 'remove-button'; // Add a class for styling
                                removeButton.addEventListener('click', () => {
                                    const userInput = prompt(`Type '${userName}' to confirm removing them from the room:`);
                                    if (userInput === userName) {
                                        fetch('/remove-user-from-room', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ roomId: room._id, username: userName })
                                        })
                                        .then(response => {
                                            if (response.ok) {
                                                console.log('User removed successfully');
                                
                                                // Close the edit room modal if it's open
                                                const editRoomModal = document.getElementById('editRoomModal');
                                                if (editRoomModal) {
                                                    editRoomModal.style.display = 'none';
                                                }
                                
                                                // Refresh the room list
                                                fetchRooms();
                                            } else {
                                                console.error('Error removing user');
                                            }
                                        })
                                        .catch(error => console.error('Error:', error));
                                    }
                                });                           
                                
                                innerButtonContainer.appendChild(promoteButton);
                                innerButtonContainer.appendChild(removeButton);
                                memberItem.appendChild(innerButtonContainer);
                        
                                roomMembersList.appendChild(memberItem);
                            }
                        });

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

                        
                    });
                    buttonContainer.appendChild(editButton);
                    buttonContainer.appendChild(goButton);
                } else {
                    const leaveButton = document.createElement('button');
                    leaveButton.textContent = 'Leave';
                    leaveButton.className = 'leave-button'; // Add a class for styling
                    leaveButton.style.marginRight = '5px';
                    leaveButton.addEventListener('click', () => {
                        const isConfirmed = window.confirm(`Are you sure you want to leave this room?`);
                        if (isConfirmed) {
                            fetch('/leave-room', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ roomId: room._id }) // Only send the room ID
                            })
                            .then(response => {
                                if (response.ok) {
                                    console.log('Left the room successfully');
                                    fetchRooms(); // Refresh the room list
                                } else {
                                    console.error('Error leaving the room');
                                }
                            })
                            .catch(error => console.error('Error:', error));
                        }
                    });
                    
                    
                    buttonContainer.appendChild(leaveButton);
                    buttonContainer.appendChild(goButton);
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
const roomNameError = document.getElementById('roomNameError');



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
    roomNameError.textContent = ""; // Clear any previous error message
});

closeCreateRoomModalBtn.onclick = () => {
    createRoomModal.style.display = 'none';
    roomNameError.textContent = ''; // Clear any previous error message
    clearSelectedUsers(); // Clear the selected users when the modal is closed
};

confirmCreateRoomBtn.addEventListener('click', () => {
    console.log("Confirm button clicked"); // Debugging log

    const roomName = newRoomNameInput.value;
    
    // Check if the room name is too long
    if (roomName.length > 32) {
        roomNameError.textContent = 'Name is too long (maximum 32 characters).';
        return;
    } else {
        roomNameError.textContent = ''; // Clear the error message
    }

    // Check if the room name is empty
    if (!roomName.trim()) {
        roomNameError.textContent = "Please provide a room name.";
        return;
    } else {
        roomNameError.textContent = ""; // Clear the error message
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
        // Display the error message in the "roomNameError" div
        roomNameError.textContent = "Error creating room: " + error.message;
    })
    .finally(() => {
        console.log("Hiding modal"); // Debugging log
        createRoomModal.style.display = "none"; // Hide the modal
    });
});
