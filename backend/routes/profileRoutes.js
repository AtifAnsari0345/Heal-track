const express = require('express');
const { getMyProfile, createProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/me', getMyProfile);
router.post('/', createProfile);
router.put('/', updateProfile);

module.exports = router;