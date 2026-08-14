const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from leaving multiple reviews for the same book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Static method to get avg rating and update Book rating
reviewSchema.statics.getAverageRating = async function (bookId) {
  const obj = await this.aggregate([
    {
      $match: { book: bookId },
    },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('Book').findByIdAndUpdate(bookId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
      });
    } else {
      await mongoose.model('Book').findByIdAndUpdate(bookId, {
        rating: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.book);
});

// Call getAverageRating after remove
reviewSchema.post('remove', function () {
  this.constructor.getAverageRating(this.book);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
