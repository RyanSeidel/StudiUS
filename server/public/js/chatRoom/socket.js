
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
            { urls: "stun:18.117.68.27:3478" },
            {
                urls: "turn:18.117.68.27:3478",
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
        videoContainer.appendChild(video);
    }
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.controls = true;

    if (userId === localSocketId) {
        video.muted = true;
        localVideoElement = video; // Store the local video element
    } else {
        video.muted = false;
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
