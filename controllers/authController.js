const dotenv = require("dotenv");
const User = require('../models/User');
const Discussion = require('../models/Discussion');
const generateToken = require('../utils/generateToken');
const cloudinary = require('cloudinary').v2;
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.name && req.body.name !== user.name) {
        const newName = req.body.name;
        user.name = newName;

        // Bulk update userName in discussions created by the user
        await Discussion.updateMany(
          { user: user._id },
          { userName: newName }
        );

        // Bulk update userName in comments created by the user
        await Discussion.updateMany(
          { 'comments.user': user._id },
          { $set: { 'comments.$[elem].userName': newName } },
          { arrayFilters: [{ 'elem.user': user._id }] }
        );
      }
      user.email = req.body.email || user.email;

      // Handle password changes securely
      if (req.body.password) {
        if (!req.body.currentPassword) {
          res.status(400).json({ message: 'Current password is required to change password' });
          return;
        }
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
          res.status(400).json({ message: 'Current password is incorrect' });
          return;
        }
        user.password = req.body.password;
      }

      if (req.body.profilePic !== undefined) {
        user.profilePic = req.body.profilePic;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload user profile picture
// @route   POST /api/auth/profile/upload
// @access  Private
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'book_reading_app_profiles' },
      async (error, result) => {
        if (error) {
          res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
          return;
        }

        try {
          const user = await User.findById(req.user._id);
          if (user) {
            user.profilePic = result.secure_url;
            const updatedUser = await user.save();

            res.json({
              _id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              profilePic: updatedUser.profilePic,
              isAdmin: updatedUser.isAdmin,
              token: generateToken(updatedUser._id),
            });
          } else {
            res.status(404).json({ message: 'User not found' });
          }
        } catch (dbError) {
          res.status(500).json({ message: dbError.message });
        }
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/auth/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const userId = req.user._id;

      // 1. Delete all discussions created by this user
      await Discussion.deleteMany({ user: userId });

      // 2. Remove all comments created by this user from all discussions
      await Discussion.updateMany(
        { 'comments.user': userId },
        { $pull: { comments: { user: userId } } }
      );

      // 3. Delete the user record
      await User.deleteOne({ _id: userId });

      res.json({ message: 'User account and all linked data deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  uploadProfilePic,
  deleteUserProfile,
};
