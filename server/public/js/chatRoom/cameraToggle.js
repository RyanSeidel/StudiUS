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

        if (videoTrack.enabled) {
            console.log("Camera turned on");
            if (localVideoElement) localVideoElement.classList.remove('inactive-video');
        } else {
            console.log("Camera turned off");
            if (localVideoElement) localVideoElement.classList.add('inactive-video');
        }

        // Emit an event to notify other users
        socket.emit('camera-toggled', localSocketId, videoTrack.enabled);
    }
});

