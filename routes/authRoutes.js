const express = require('express');
const multer = require('multer');
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  uploadProfilePic,
  deleteUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

router.post('/profile/upload', protect, upload.single('profilePic'), uploadProfilePic);

module.exports = router;
