const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: [true, 'Please provide doctor name']
  },
  specialization: {
    type: String,
    required: [true, 'Please select specialization']
  },
  hospitalName: {
    type: String,
    required: [true, 'Please provide hospital/clinic name']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please select appointment date']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Please select appointment time']
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

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;