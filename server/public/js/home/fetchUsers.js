/*
   USER SELECTION AND FILTERING JAVASCRIPT

   This JavaScript code is responsible for managing user selection and filtering on a web page. It includes functionalities for fetching a list of users from a server, displaying them with buttons, allowing users to search for specific users, selecting/unselecting users, and tracking selected users in an array.

   Key components and functionalities:

   - An array named 'selectedUsers' is used to keep track of selected user IDs.
   - An array named 'allUsers' is used to store all users fetched from the server for filtering.

   - The code fetches users from the server using a fetch request and populates the 'allUsers' array. It then calls the 'renderUsers' function to display the users as buttons.

   - The 'renderUsers' function renders user buttons with their images and names, allowing users to be selected or unselected by clicking the buttons.

   - Event listeners are added to the user search input field to filter users based on the search term and to user buttons for toggling user selection.

   - An event listener is also added to an "Unselect All" button, which clears the 'selectedUsers' array and unselects all user buttons.

   Note: To use this code, you should have corresponding HTML elements with matching IDs and a server endpoint for fetching user data. CSS styles may also be needed for the visual presentation of user buttons.
*/


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
            img.style.width = '64px';
            img.style.height = '64px';
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
  
    