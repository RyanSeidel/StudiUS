const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
    name: String,
    isGroup: Boolean,
    createAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
    messagesIds: [mongoose.Schema.Types.ObjectId],
    userIds: [mongoose.Schema.Types.ObjectId],
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;
