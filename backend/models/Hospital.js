const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide hospital name'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  address: {
    type: String,
    required: [true, 'Please provide hospital address']
  },
  phone: {
    type: String,
    required: [true, 'Please provide contact number']
  },
  hasAmbulance: {
    type: Boolean,
    default: false
  },
  operatingHours: {
    type: String,
    required: [true, 'Please provide operating hours']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for geospatial queries
hospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);