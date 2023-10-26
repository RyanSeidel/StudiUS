const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    emailVerified: Date,
    image: String,
    hashedPassword: String,
    createAt: { type: Date, default: Date.now },
    updatedAt: Date,
    conversationsIds: [mongoose.Schema.Types.ObjectId],
    seenMessageIds: [mongoose.Schema.Types.ObjectId],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
