// audioMetering.js
function startAudioMetering(stream, meterElementId) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function updateAudioMeter() {
      analyser.getByteFrequencyData(dataArray);

      let values = 0;
      let length = dataArray.length;
      for (let i = 0; i < length; i++) {
          values += dataArray[i];
      }

      const volume = Math.floor(values / length);
      document.getElementById(meterElementId).querySelector('div').style.width = `${volume}%`;
      requestAnimationFrame(updateAudioMeter);
  }

  updateAudioMeter();
}


// Get modal and elements
let modal = document.getElementById("settingsModal");
let btn = document.getElementById("settingsBtn");
let span = document.getElementsByClassName("close")[0];
let microphoneSelect = document.getElementById("microphoneList");

// Open the modal
btn.onclick = function() {
    populateMicrophones();
    if (localStream && localStream.getAudioTracks().length > 0) {
        startAudioMetering(localStream, 'audioMeterModal');
    } else {
        console.error("No audio tracks available in localStream.");
    }
    modal.style.display = "block";
}

microphoneSelect.addEventListener('change', function() {
    const selectedDeviceId = this.value;
    navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedDeviceId } })
        .then(stream => {
            localStream = stream;
            startAudioMetering(localStream, 'audioMeterModal');
            console.log("Change has been confirmed"); // Added this line
        })
        .catch(error => {
            console.error("Error accessing the selected microphone", error);
        });
});



// Close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// Close the modal if clicked outside content
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Function to populate microphone list
function populateMicrophones() {
    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        let microphoneList = document.getElementById("microphoneList");
        microphoneList.innerHTML = ''; // Clear existing options

        const currentAudioTrack = localStream && localStream.getAudioTracks()[0];
        const currentDeviceId = currentAudioTrack && currentAudioTrack.getSettings().deviceId;

        devices.forEach(device => {
            if (device.kind === "audioinput") {
                let option = document.createElement("option");
                option.value = device.deviceId;
                option.text = device.label || 'Microphone ' + (microphoneList.length + 1);
                if (device.deviceId === currentDeviceId) {
                    option.selected = true;
                }
                microphoneList.appendChild(option);
            }
        });
    })
    .catch(err => {
        console.error("Error populating microphones:", err);
    });
}
