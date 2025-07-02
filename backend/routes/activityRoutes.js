const express = require('express');
const { getMyActivities, addActivity, deleteActivity, clearAllActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', getMyActivities);
router.post('/', addActivity);
router.delete('/:id', deleteActivity);
router.delete('/', clearAllActivities); // Add this route for clearing all activities

module.exports = router;