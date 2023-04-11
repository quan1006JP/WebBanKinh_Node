const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Contact schema
const ContactSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: Boolean, default: false },
    dateSend: { type: Date, default: Date.now, timezoneOffset: 420 }
});

module.exports = mongoose.model('Contact', ContactSchema);