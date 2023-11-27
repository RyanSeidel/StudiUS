/*
   VIDEO CHAT AND MESSAGING FUNCTIONALITY

   This JavaScript code handles video chat and messaging functionality within a web application. It utilizes WebRTC for video streaming and socket.io for real-time communication.

   Key components and functionalities:

   - Establishes a connection to a WebSocket server using 'socket.io'.
   - Retrieves the 'roomId' and 'name' from URL parameters.
   - Sets up local video streaming and user media permissions.
   - Manages peer connections for video streaming with 'RTCPeerConnection'.
   - Handles the exchange of offers, answers, and ICE candidates.
   - Displays video streams in a designated container.
   - Manages user camera toggling.
   - Handles real-time text messaging with 'socket.on'.
   - Updates the participant list based on 'participants-updated' events.

   Note: This code assumes the existence of corresponding HTML elements, CSS styles, and a WebSocket server configured to handle WebRTC and messaging interactions. It may require additional integration and setup to function within a specific web application.
*/

const socket = io();
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("roomId");
    const videoContainer = document.getElementById('video-container'); // Ensure you have a container for video elements
    let localStream;
    let localVideoElement;


    let localSocketId;

    const ROOM_NAME = new URLSearchParams(window.location.search).get('room'); // Get the room name from URL
    const myPeerConnections = {};

    // Configuration for the STUN and TURN servers
    const configuration = {
        iceServers: [
            { urls: "stun:18.119.159.73:3478" },
            {
                urls: "turn:18.119.159.73:3478",
                username: "test",
                credential: "password"
            }
        ]
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localStream = stream;
    addVideoStream(stream, localSocketId);

    // issue we need to not use socket.id this is GARBAGE

    localSocketId = socket.id; 
    console.log("Connected with socket ID:", localSocketId);

    socket.emit('join-room', roomId, localSocketId, name);
    
    socket.on('user-connected', userId => {
      console.log('User connected:', userId);
      const peerConnection = createPeerConnection(userId);
      myPeerConnections[userId] = peerConnection;
    });

    socket.on('offer', handleReceiveOffer);
    socket.on('answer', handleReceiveAnswer);
    socket.on('ice-candidate', handleNewICECandidateMsg);
  })
  .catch(e => {
    console.error('Failed to get local stream:', e);
  });

  socket.on('user-disconnected', userId => {
    console.log(`User disconnected: ${userId}`);
    if (myPeerConnections[userId]) {
      myPeerConnections[userId].close();
      delete myPeerConnections[userId];
      console.log(`Peer connection for user ${userId} closed.`);
    }
  
    const videoElement = document.querySelector(`[data-peer-id="${userId}"]`);
    if (videoElement) {
      videoElement.remove();
      console.log(`Video for user ${userId} removed.`);
    } else {
      console.log(`No video element found for user ${userId}.`);
    }
  });
  

  function createPeerConnection(userId) {
    // Configuration for the STUN and TURN servers
    const configuration = {
      iceServers: [
        { urls: "stun:18.119.159.73:3478" },
        {
          urls: "turn:18.119.159.73:3478",
          username: "test",
          credential: "password"
        }
      ]
    };
  
    const peerConnection = new RTCPeerConnection(configuration);

  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit('ice-candidate', event.candidate.toJSON(), userId);
    }
  };

  peerConnection.ontrack = event => {
    const remoteStream = event.streams[0];
    addVideoStream(remoteStream, userId); // Pass the userId associated with this stream
  };
  

  peerConnection.createOffer()
    .then(offer => peerConnection.setLocalDescription(offer))
    .then(() => {
      socket.emit('offer', peerConnection.localDescription.toJSON(), userId);
    })
    .catch(e => {
      console.error('Offer creation error:', e);
    });

  return peerConnection;
}

function handleReceiveOffer(offer, from) {
  const peerConnection = createPeerConnection(from);
  myPeerConnections[from] = peerConnection;
  
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    .then(() => peerConnection.createAnswer())
    .then(answer => peerConnection.setLocalDescription(answer))
    .then(() => {
      socket.emit('answer', peerConnection.localDescription.toJSON(), from);
    })
    .catch(e => {
      console.error('Answer handling error:', e);
    });
}

function handleReceiveAnswer(answer, from) {
  const peerConnection = myPeerConnections[from];
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    .catch(e => {
      console.error('Answer setting error:', e);
    });
}

function handleNewICECandidateMsg(candidate, from) {
  const peerConnection = myPeerConnections[from];
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => {
      console.error('ICE candidate error:', e);
    });
}

function addVideoStream(stream, userId) {
  let video = videoContainer.querySelector(`[data-peer-id="${userId}"]`);
  if (!video) {
      video = document.createElement('video');
      video.dataset.peerId = userId;
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.controls = true;

      if (userId === "screen-sharing") {
          video.classList.add("screen-sharing-video"); // Add a specific class for screen sharing
      }

      videoContainer.appendChild(video);

      if (userId === localSocketId) {
          video.muted = true;
      } else {
          video.muted = false;
      }
  } else {
      video.srcObject = stream;
  }
}





  // Define the function to remove the video element associated with the user
function removeVideoStream(userId) {
    const videoElement = videoContainer.querySelector(`[data-peer-id="${userId}"]`);
    if (videoElement) {
      videoElement.remove();
    }
  }


  // Other users toggling their camera
socket.on('camera-toggled', (userId, isCameraOn) => {
  if (userId !== localSocketId) { // Check if the toggle event is from a remote user
      const videoElement = document.querySelector(`[data-peer-id="${userId}"]`);
      if (videoElement) {
          videoElement.style.display = isCameraOn ? '' : 'none'; // Show or hide the video element
      }
  }
});






  // Handle the 'participants-updated' event
  socket.on('participants-updated', (participants) => {
    const participantsList = document.getElementById('participants-list');
    participantsList.innerHTML = ''; // Clear existing list

    participants.forEach(participant => {
        const participantDiv = document.createElement('div');
        participantDiv.textContent = participant.userName;
        participantsList.appendChild(participantDiv);
    });
});

let isScreenSharing = false; // State to track screen sharing

function toggleScreenSharing() {
  if (isScreenSharing) {
      stopScreenSharing();
  } else {
      startScreenSharing();
  }
}

function startScreenSharing() {
  navigator.mediaDevices.getDisplayMedia({ video: true }).then(stream => {
      localStream = stream;
      const screenSharingId = "screen-sharing";

      addVideoStream(stream, screenSharingId);
      moveVideoToLeftScreen(screenSharingId);

      socket.emit('screen-sharing-started', localSocketId, roomId);

      isScreenSharing = true;
      updateShareButton();
  }).catch(e => {
      console.error('Failed to get screen stream:', e);
  });
}


function stopScreenSharing() {
  if (localStream && localStream.getTracks) {
      localStream.getTracks().forEach(track => track.stop());
  }

  // Replace screen sharing with the original video stream
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localStream = stream;
      updateVideoStream(stream, localSocketId);

      removeScreenSharingFromLeftScreen();

      isScreenSharing = false;
      updateShareButton();
  }).catch(e => {
      console.error('Failed to revert to camera stream:', e);
  });
}

function removeScreenSharingFromLeftScreen() {
  const leftScreen = document.querySelector('.left-screen');
  const screenSharingElement = leftScreen.querySelector(`[data-peer-id="screen-sharing"]`);
  if (screenSharingElement) {
      leftScreen.removeChild(screenSharingElement);
  }
}

function updateShareButton() {
  const shareScreenButton = document.getElementById("shareScreenButton");
  shareScreenButton.textContent = isScreenSharing ? "Stop Sharing Screen" : "Share Screen";
}

document.getElementById("shareScreenButton").addEventListener("click", toggleScreenSharing);

function updateVideoStream(stream, userId) {
    const videoElement = videoContainer.querySelector(`[data-peer-id="${userId}"]`);
    if (videoElement) {
        videoElement.srcObject = stream;
    }

    if (myPeerConnections[userId]) {
        const peerConnection = myPeerConnections[userId];
        const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
            sender.replaceTrack(stream.getVideoTracks()[0]);
        }
    }
}

function moveVideoToLeftScreen(userId) {
  const videoElement = videoContainer.querySelector(`[data-peer-id="${userId}"]`);
  if (videoElement) {
      const leftScreen = document.querySelector('.left-screen');
      if (!leftScreen) {
          console.error("Left screen element not found!");
          return;
      }
      leftScreen.appendChild(videoElement);
      console.log("Moved video to left screen:", videoElement);
  } else {
      console.error("Video element not found for user:", userId);
  }
}

socket.on("receiveMessage", (message) => {
  const chatBoxContainer = document.getElementById("chat-box-container");
  const messageDiv = document.createElement("div");
  const senderInfoDiv = document.createElement("div");

  if (message.senderName === name) {
      messageDiv.classList.add("current-user-message");
      senderInfoDiv.classList.add("sender-info-current-user");
  } else {
      messageDiv.classList.add("other-user-message");
      senderInfoDiv.classList.add("sender-info-other-user");
  }

  if (message.body.startsWith("<img")) {
      messageDiv.innerHTML = message.body;
  } else {
      messageDiv.textContent = message.body;
  }

  const currentTime = new Date().toLocaleTimeString();
  senderInfoDiv.textContent = `${message.senderName} - ${currentTime}`;

  // Append message and sender info directly to chatBoxContainer
  chatBoxContainer.insertBefore(messageDiv, chatBoxContainer.firstChild);
  chatBoxContainer.insertBefore(senderInfoDiv, chatBoxContainer.firstChild);


  chatBoxContainer.scrollTop = chatBoxContainer.scrollHeight;

});
