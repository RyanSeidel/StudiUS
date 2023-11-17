
    // Assuming you have already established a connection to the Socket.io server
    const socket = io();

    socket.on('global-participants-updated', (data) => {
        console.log("Received global participant update:", data);

        const { roomId, count } = data;

        // Find the element for this room's active participant count
        const participantCountElement = document.getElementById(`active-participants-${roomId}`);
        if (participantCountElement) {
            console.log(`Updating participant count for room ${roomId} to ${count}`);
            participantCountElement.textContent = `Active: ${count}`;
        } else {
            console.log(`Participant count element not found for room ${roomId}`);
        }
    });
