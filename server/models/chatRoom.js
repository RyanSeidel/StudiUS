const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
    name: String,
    isGroup: Boolean,
    createAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
    messagesIds: [mongoose.Schema.Types.ObjectId],
    userIds: [mongoose.Schema.Types.ObjectId], // This array includes all members of the room
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Link to your user model
        required: true, // The room must have an owner
    },
    ownerName: String, // Store the owner's name directly in the ChatRoom schema
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;
