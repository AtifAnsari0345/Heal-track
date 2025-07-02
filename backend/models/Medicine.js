const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide medicine name'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Please provide brand name'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide price']
    },
    description: {
        type: String,
        required: [true, 'Please provide description']
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: 0
    },
    deliveryTime: {
        type: String,
        required: [true, 'Please provide delivery time']
    },
    type: {
        type: String,
        enum: ['otc', 'prescription', 'supplement'],
        default: 'otc'
    }
});

module.exports = mongoose.model('Medicine', medicineSchema);