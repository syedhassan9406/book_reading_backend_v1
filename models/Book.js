const mongoose = require('mongoose');

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    googleBooksId: {
      type: String,
      unique: true,
      sparse: true,
    },
    author: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    pages: {
      type: Number,
      required: true,
      default: 193,
    },
    language: {
      type: String,
      required: true,
      default: 'English',
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
