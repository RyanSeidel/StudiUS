// Array to keep track of selected users
let selectedUsers = [];
let allUsers = [];  // Store all users for filtering

// Fetch users and populate them with buttons
fetch('/users')
    .then(response => response.json())
    .then(users => {
        allUsers = users;
        renderUsers(allUsers);

        const userSearchInput = document.getElementById('userSearch');
        userSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredUsers = allUsers.filter(user => user.name.toLowerCase().includes(searchTerm));
            renderUsers(filteredUsers);
        });
    });

    function renderUsers(users) {
        const usersDiv = document.getElementById('users-for-room');
        usersDiv.innerHTML = '';  // Clear current users
        
        users.forEach(user => {
            const button = document.createElement('button');
    
            // Create an img element for the user's image
            const img = document.createElement('img');
            img.src = user.image;
            img.alt = `${user.name}'s Profile Image`;
            img.style.width = '30px';
            img.style.height = '30px';
            img.style.borderRadius = '15px';
            img.style.marginRight = '10px';
    
            // Append the image to the button before the text
            button.appendChild(img);
    
            // Add user name after the image
            const userNameTextNode = document.createTextNode(user.name);
            button.appendChild(userNameTextNode);
    
            // Check if the user is already selected
            if (selectedUsers.includes(user._id)) {
                button.classList.add('selected');
            }
    
            button.addEventListener('click', () => {
                // Toggle the 'selected' class on the button
                button.classList.toggle('selected');
    
                // Toggle user selection in the selectedUsers array
                if (selectedUsers.includes(user._id)) {
                    selectedUsers = selectedUsers.filter(userId => userId !== user._id);
                } else {
                    selectedUsers.push(user._id);
                }
            });
    
            usersDiv.appendChild(button);
        });
    }

    document.getElementById('unselectAllButton').addEventListener('click', () => {
      selectedUsers = [];
      const selectedButtons = document.querySelectorAll('#users-for-room button.selected');
      selectedButtons.forEach(button => {
          button.classList.remove('selected');
      });
  });
  
    