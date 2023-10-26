
// This code defines a Mongoose schema for a message object, creates a Mongoose model named "Message" based on that schema, and exports it as a module for use in other parts of the application.

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    body: String,
    image: String,
    createdAt: { type: Date, default: Date.now },
    seenIds: [mongoose.Schema.Types.ObjectId],
    conversationId: mongoose.Schema.Types.ObjectId,
    senderId: mongoose.Schema.Types.ObjectId,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
