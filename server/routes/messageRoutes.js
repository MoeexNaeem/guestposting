const express = require('express');
const router = express.Router();
const { sendMessage, getOrderMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, sendMessage);
router.route('/:orderId').get(protect, getOrderMessages);

module.exports = router;