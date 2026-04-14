const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  getUserStats,
  getUserActivities,
  updateUserSettings
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);
router.get('/stats', protect, getUserStats);
router.get('/activities', protect, getUserActivities);
router.put('/settings', protect, updateUserSettings);

module.exports = router;