// routes/auth.js
const express = require('express');
const { registerUser, authUser, updateUserStatus } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.put('/status', protect, updateUserStatus);

module.exports = router;
