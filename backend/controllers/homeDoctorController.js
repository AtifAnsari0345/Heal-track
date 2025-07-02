const HomeDoctor = require('../models/HomeDoctor');
const HomeVisit = require('../models/HomeVisit');

module.exports = {
  // Get all home doctors
  getAllDoctors: async (req, res) => {
    try {
      // Remove the isAvailable filter to show all doctors
      const doctors = await HomeDoctor.find({});
      
      res.status(200).json({
        success: true,
        count: doctors.length,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Book a home visit
  bookHomeVisit: async (req, res) => {
    try {
      const visitData = {
        user: req.user.id,
        doctor: req.body.doctorId,
        reason: req.body.reason,
        visitDate: req.body.visitDate,
        visitTime: req.body.visitTime,
        address: req.body.address,
        notes: req.body.notes
      };

      const visit = await HomeVisit.create(visitData);

      res.status(201).json({
        success: true,
        data: visit,
        message: 'Home visit scheduled successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get user's home visits
  getMyHomeVisits: async (req, res) => {
    try {
      const visits = await HomeVisit.find({ user: req.user.id })
        .populate('doctor', 'name rating address')
        .sort({ visitDate: 1, visitTime: 1 });

      res.status(200).json({
        success: true,
        count: visits.length,
        data: visits
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Add a new home doctor (admin only)
  addHomeDoctor: async (req, res) => {
    try {
      const doctor = await HomeDoctor.create(req.body);

      res.status(201).json({
        success: true,
        data: doctor,
        message: 'Home doctor added successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};