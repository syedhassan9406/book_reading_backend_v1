const express = require('express');
const {
  getBookReviews,
  createBookReview,
  updateBookReview,
  deleteBookReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/:bookId')
  .get(getBookReviews)
  .post(protect, createBookReview);

router.route('/review/:id')
  .put(protect, updateBookReview)
  .delete(protect, deleteBookReview);

module.exports = router;
