// models/Client.js

const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    company: {
        type: String,
    },
    status: {
        type: String,
        enum: ['new', 'pending', 'won', 'unreachable'],
        required: true,
    },
    address: {
        type: String,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
