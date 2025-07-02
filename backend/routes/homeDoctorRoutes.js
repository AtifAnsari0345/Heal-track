const express = require('express');
const { getAllDoctors, bookHomeVisit, getMyHomeVisits, addHomeDoctor } = require('../controllers/homeDoctorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/doctors', getAllDoctors);

// Protected routes
router.use(protect);
router.post('/book', bookHomeVisit);
router.get('/my-visits', getMyHomeVisits);

// Admin routes (for testing purposes)
router.post('/add-doctor', addHomeDoctor);

module.exports = router;