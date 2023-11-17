/*
   AUDIO METERING AND MICROPHONE SETTINGS HANDLING

   This JavaScript code defines functions for audio metering and microphone settings handling in a web application. It primarily focuses on monitoring audio levels and providing user controls for microphone selection and toggling.

   Key functionalities:

   1. `startAudioMetering(stream, meterElementId)`: Initializes audio metering using the Web Audio API to monitor audio levels from a specified audio stream. It continuously updates the audio metering display within a specified HTML element.

   2. Event listener for the DOMContentLoaded event: Initializes the microphone settings modal and populates the microphone selection dropdown when the page loads.

   3. Event listener for opening the microphone settings modal: Starts audio metering if an audio stream is available and displays the modal for microphone settings.

   4. Event listener for changing the selected microphone: Updates the selected microphone and restarts audio metering with the new microphone.

   5. Event listener for toggling the microphone on/off: Allows users to enable or mute the microphone and updates the microphone icon accordingly.

   6. Function `populateMicrophones()`: Enumerates available audio input devices (microphones), populates the microphone selection dropdown, and sets the current microphone as the selected option.

   Note: This code assumes the existence of corresponding HTML elements, such as modals, buttons, and dropdowns, and it integrates with the Web Audio API for audio metering and the MediaDevices API for microphone selection. Additionally, it assumes the use of the localStream variable for audio stream management.
*/

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


document.addEventListener('DOMContentLoaded', (event) => {

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



document.getElementById("toggleMicrophone").addEventListener("click", function () {
    const microphoneIcon = this.querySelector('i');
    if (localStream && localStream.getAudioTracks().length > 0) {
        let audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        if (audioTrack.enabled) {
            console.log("Microphone activated");
            microphoneIcon.classList.add('microphone-active');
        } else {
            console.log("Microphone muted");
            microphoneIcon.classList.remove('microphone-active');
        }
    }
});

});
