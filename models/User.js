const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const readingProgressSchema = mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    status: {
      type: String,
      enum: ['all', 'reading', 'finished'],
      default: 'all',
    },
    completedPages: {
      type: Number,
      default: 0,
    },
    totalPages: {
      type: Number,
      default: 193,
    },
    currentChapter: {
      type: String,
      default: 'Chapter 1',
    },
  },
  { _id: false }
);

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    profilePic: {
      type: String,
      default: 'profilePic2.jpg',
    },
    library: [readingProgressSchema],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
