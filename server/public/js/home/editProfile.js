
// Edit Profile Modal handlers
const editProfileModal = document.getElementById("editProfileModal");
const editProfileBtn = document.querySelector(".greeting-button");
const closeBtn = document.getElementsByClassName("close")[0];

// Open the modal
editProfileBtn.onclick = () => editProfileModal.style.display = "block";

// Close the modal
closeBtn.onclick = () => editProfileModal.style.display = "none";

window.onclick = event => {
    if (event.target === editProfileModal) {
        editProfileModal.style.display = "none";
    }
};

// Helper function to handle profile updates
const updateProfile = async (formData) => {
    try {
        const response = await fetch('/update-profile', {
            method: 'POST',
            body: formData
        });
        const responseData = await response.json();
        if (responseData.success) {
            editProfileModal.style.display = "none";
            location.reload();  // Refresh the page
        } else {
            throw new Error(responseData.error);
        }
    } catch(error) {
        console.error("Error updating profile:", error);
    }
};

document.getElementById('saveProfileBtn').addEventListener('click', async () => {
    const newName = document.getElementById('nameInput').value;
    const imageInput = document.getElementById('imageUpload');
    const formDataForProfile = new FormData();
    formDataForProfile.append('name', newName);

    if (imageInput && imageInput.files.length > 0) {
        const formDataForImage = new FormData();
        formDataForImage.append('image', imageInput.files[0]);
        try {
            const imageResponse = await fetch('/upload-profile-pic', {
                method: 'POST',
                body: formDataForImage
            });
            const imageData = await imageResponse.json();
            if (imageData.success) {
                formDataForProfile.append('image', imageData.newImageUrl);
                location.reload();  // Refresh the page
            } else {
                throw new Error(imageData.error);
            }
        } catch(error) {
            console.error("Error uploading image:", error);
            return;
        }
    } else {
        formDataForProfile.append('image', document.getElementById('profilePic').src);
    }

    updateProfile(formDataForProfile);
});

document.getElementById('updateUsernameBtn').addEventListener('click', () => {
    const newName = document.getElementById('nameInput').value;
    const formDataForName = new FormData();
    formDataForName.append('name', newName);
    updateProfile(formDataForName);
});