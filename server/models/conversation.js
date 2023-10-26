// This code defines a Mongoose schema for a conversation object, creates a Mongoose model named "Conversation" based on that schema, and exports it as a module for use in other parts of the application.

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    name: String,
    isGroup: Boolean,
    createAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
    messagesIds: [mongoose.Schema.Types.ObjectId],
    userIds: [mongoose.Schema.Types.ObjectId],
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
