const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Please provide your full name']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please provide your date of birth']
  },
  gender: {
    type: String,
    required: [true, 'Please select your gender'],
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Please select your blood group'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide your phone number']
  },
  address: {
    type: String,
    required: [true, 'Please provide your address']
  },
  medicalHistory: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', profileSchema);