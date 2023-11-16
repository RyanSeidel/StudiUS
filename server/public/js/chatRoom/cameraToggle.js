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

