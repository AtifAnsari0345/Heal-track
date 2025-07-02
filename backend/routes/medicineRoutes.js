const express = require('express');
const { getMedicines, searchMedicines, placeOrder } = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getMedicines);
router.get('/search', searchMedicines);
router.post('/order', placeOrder);

module.exports = router;