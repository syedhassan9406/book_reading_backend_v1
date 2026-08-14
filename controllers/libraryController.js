const User = require('../models/User');
const Book = require('../models/Book');

// @desc    Get logged in user's library progress
// @route   GET /api/library
// @access  Private
const getUserLibrary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('library.book');
    if (user) {
      res.json(user.library);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update book reading progress (adds to library if not exists)
// @route   POST /api/library/progress
// @access  Private
const updateBookProgress = async (req, res) => {
  const { bookId, status, completedPages, totalPages, currentChapter } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const book = await Book.findById(bookId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Find if book already exists in user library
    const existingProgressIndex = user.library.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (existingProgressIndex > -1) {
      // Update existing
      if (status) user.library[existingProgressIndex].status = status;
      if (completedPages !== undefined) user.library[existingProgressIndex].completedPages = completedPages;
      if (totalPages !== undefined) user.library[existingProgressIndex].totalPages = totalPages;
      if (currentChapter) user.library[existingProgressIndex].currentChapter = currentChapter;
    } else {
      // Add new progress entry
      user.library.push({
        book: bookId,
        status: status || 'all',
        completedPages: completedPages || 0,
        totalPages: totalPages || book.pages || 193,
        currentChapter: currentChapter || 'Chapter 1',
      });
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('library.book');
    res.json(updatedUser.library);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/library/wishlist
// @access  Private
const getUserWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (user) {
      res.json(user.wishlist);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add book to wishlist
// @route   POST /api/library/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  const { bookId } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const book = await Book.findById(bookId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (user.wishlist.includes(bookId)) {
      return res.status(400).json({ message: 'Book already in wishlist' });
    }

    user.wishlist.push(bookId);
    await user.save();

    res.json({ message: 'Book added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove book from wishlist
// @route   DELETE /api/library/wishlist/:bookId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.bookId
    );

    await user.save();
    res.json({ message: 'Book removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserLibrary,
  updateBookProgress,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
};
