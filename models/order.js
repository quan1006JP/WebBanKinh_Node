const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    cart: {
        type: Object,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivery', 'Completed'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        timezoneOffset: 420
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;