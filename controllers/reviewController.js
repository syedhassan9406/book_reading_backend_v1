const Review = require('../models/Review');
const Book = require('../models/Book');

// @desc    Get all reviews for a book
// @route   GET /api/reviews/:bookId
// @access  Public
const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review for a book
// @route   POST /api/reviews/:bookId
// @access  Private
const createBookReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      book: req.params.bookId,
    });

    if (alreadyReviewed) {
      res.status(400).json({ message: 'Book already reviewed' });
      return;
    }

    const review = new Review({
      user: req.user._id,
      userName: req.user.name,
      book: req.params.bookId,
      rating: Number(rating),
      comment,
    });

    await review.save();
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/review/:id
// @access  Private
const updateBookReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (review.user.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: 'Not authorized to edit this review' });
      return;
    }

    review.rating = Number(rating);
    review.comment = comment || review.comment;

    const updatedReview = await review.save();
    
    // Update book average rating
    await Review.getAverageRating(review.book);

    res.json({ message: 'Review updated successfully', review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/review/:id
// @access  Private
const deleteBookReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (review.user.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: 'Not authorized to delete this review' });
      return;
    }

    const bookId = review.book;
    await review.deleteOne();
    
    // Update book average rating
    await Review.getAverageRating(bookId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBookReviews,
  createBookReview,
  updateBookReview,
  deleteBookReview,
};
