const express = require('express');
const { 
  getHospitals, 
  getNearbyHospitals, 
  getHospitalById,
  createHospital 
} = require('../controllers/hospitalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getHospitals);
router.get('/nearby', getNearbyHospitals);
router.get('/:id', getHospitalById);

// Protected routes
router.post('/', protect, createHospital);

module.exports = router;