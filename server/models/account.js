// This code defines a Mongoose schema for an account object, creates a Mongoose model named "Account" based on that schema, and 
// exports it as a module for use in other parts of the application.

const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    provider: String,
    providerAccountId: String,
    refresh_token: String,
    access_token: String,
    expires_at: Number,
    token_type: String,
    scope: String,
    id_token: String,
    session_state: String,
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
