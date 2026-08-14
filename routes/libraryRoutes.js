const express = require('express');
const {
  getUserLibrary,
  updateBookProgress,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/libraryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getUserLibrary);

router.route('/progress')
  .post(protect, updateBookProgress);

router.route('/wishlist')
  .get(protect, getUserWishlist)
  .post(protect, addToWishlist);

router.route('/wishlist/:bookId')
  .delete(protect, removeFromWishlist);

module.exports = router;
