const express = require('express');
const { getMyAppointments, createAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getMyAppointments);
router.post('/', createAppointment);

module.exports = router;