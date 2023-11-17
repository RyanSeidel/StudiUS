const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        minlength: 1, 
        maxlength: 32,
    },
    email: {
        type: String,
        required: true, // Make email field required
        unique: true,
    },
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
