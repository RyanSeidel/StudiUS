document.getElementById("toggleCamera").addEventListener("click", function () {
  if (localStream && localStream.getVideoTracks().length > 0) {
      let videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;

      // Assuming localVideo is the video element showing the local stream
      if (videoTrack.enabled) {
          console.log("Camera turned on");
          localVideo.classList.remove('inactive-video'); // Show video by setting opacity to normal
      } else {
          console.log("Camera turned off");
          localVideo.classList.add('inactive-video'); // Hide video by setting opacity to 0
      }
  }
});
