const mongoose = require('mongoose');

const homeVisitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HomeDoctor',
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Please provide reason for visit']
  },
  visitDate: {
    type: Date,
    required: [true, 'Please select visit date']
  },
  visitTime: {
    type: String,
    required: [true, 'Please select visit time']
  },
  address: {
    type: String,
    required: [true, 'Please provide address']
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const HomeVisit = mongoose.model('HomeVisit', homeVisitSchema);
module.exports = HomeVisit;