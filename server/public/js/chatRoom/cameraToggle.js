/*
   CAMERA TOGGLE HANDLER

   This JavaScript code defines an event listener for toggling the camera on and off in a video chat application. It targets the "toggleCamera" button and allows users to enable or disable their camera feed.

   Key functionalities:

   - Listens for clicks on the "toggleCamera" button.
   - Checks if the local stream is available and contains video tracks.
   - Toggles the enabled state of the first video track (camera) in the local stream.
   - Updates the user interface to reflect the camera's status (on or off).
   - Emits an event to notify other users in the chat room about the camera status change using the socket.io library.

   Note: This code assumes the existence of an appropriate HTML button with the id "toggleCamera," as well as integration with the socket.io library for real-time communication in the video chat application.
*/

document.getElementById("toggleCamera").addEventListener("click", function () {
    if (localStream && localStream.getVideoTracks().length > 0) {
        let videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;

        const cameraIcon = document.querySelector("#toggleCamera i.fa-camera");

        if (videoTrack.enabled) {
            console.log("Camera turned on");
            if (localVideoElement) {
                localVideoElement.classList.remove('inactive-video');
                cameraIcon.classList.add('camera-active'); // Add 'camera-active' to the camera icon when the camera is on
            }
        } else {
            console.log("Camera turned off");
            if (localVideoElement) {
                cameraIcon.classList.remove('camera-active'); // Remove 'camera-active' from the camera icon when the camera is off
                localVideoElement.classList.add('inactive-video');
            }
        }

        // Emit an event to notify other users
        socket.emit('camera-toggled', localSocketId, videoTrack.enabled);
    }
});



