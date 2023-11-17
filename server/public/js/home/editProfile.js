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

let cropper;
document.getElementById('imageUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profilePicPreview').src = e.target.result;
            if (cropper) {
                cropper.destroy();
            }
            cropper = new Cropper(document.getElementById('profilePicPreview'), {
                aspectRatio: 1,  // For a square crop box
                viewMode: 1,
                // other options as per your requirement
            });
        };
        reader.readAsDataURL(file);
    }
});


document.getElementById('submitChangesBtn').addEventListener('click', async () => {
    const newName = document.getElementById('nameInput').value;
    
    // Check if the name is too long
    if (newName.length > 32) {
        document.getElementById('nameError').textContent = 'Name is too long (maximum 32 characters).';
        return; // Prevent form submission
    } else {
        document.getElementById('nameError').textContent = ''; // Clear any previous error message
    }

    const formDataForProfile = new FormData();
    formDataForProfile.append('name', newName); // Append user name

    // Check if the cropper has an image and it's changed
    if (cropper && document.getElementById('imageUpload').files.length > 0) {
        cropper.getCroppedCanvas({
            width: 64,
            height: 64
        }).toBlob(async (blob) => {
            formDataForProfile.append('image', blob); // Append image blob if it's changed
            await submitProfileUpdate(formDataForProfile);
        });
    } else {
        // If the image isn't changed or doesn't exist, submit only the name change
        await submitProfileUpdate(formDataForProfile);
    }
});


async function submitProfileUpdate(formData) {
    try {
        const response = await fetch('/upload-profile-pic', {
            method: 'POST',
            body: formData
        });
        const responseData = await response.json();
        if (responseData.success) {
            location.reload(); // Refresh the page on successful update
        } else {
            throw new Error(responseData.error);
        }
    } catch (error) {
        console.error("Error updating profile:", error);
    }
}

