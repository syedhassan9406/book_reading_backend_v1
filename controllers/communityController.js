const Discussion = require('../models/Discussion');

// @desc    Get all discussions/book clubs
// @route   GET /api/community
// @access  Public
const getDiscussions = async (req, res) => {
  try {
    const { isBookClub, category } = req.query;
    let query = {};

    if (isBookClub !== undefined) {
      query.isBookClub = isBookClub === 'true';
    }

    if (category) {
      query.category = category;
    }

    const discussions = await Discussion.find(query)
      .populate('user', 'profilePic')
      .populate('comments.user', 'profilePic')
      .sort({ createdAt: -1 });

    const formattedDiscussions = discussions.map((disc) => {
      const discObj = disc.toObject();
      discObj.userProfilePic = disc.user ? disc.user.profilePic : '';
      discObj.user = disc.user ? disc.user._id : discObj.user;

      if (discObj.comments) {
        discObj.comments = discObj.comments.map((c) => {
          c.userProfilePic = c.user ? c.user.profilePic : '';
          c.user = c.user ? c.user._id : c.user;
          return c;
        });
      }
      return discObj;
    });

    res.json(formattedDiscussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single discussion details by ID
// @route   GET /api/community/:id
// @access  Public
const getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('user', 'profilePic')
      .populate('comments.user', 'profilePic');

    if (discussion) {
      const discObj = discussion.toObject();
      discObj.userProfilePic = discussion.user ? discussion.user.profilePic : '';
      discObj.user = discussion.user ? discussion.user._id : discObj.user;

      if (discObj.comments) {
        discObj.comments = discObj.comments.map((c) => {
          c.userProfilePic = c.user ? c.user.profilePic : '';
          c.user = c.user ? c.user._id : c.user;
          return c;
        });
      }
      res.json(discObj);
    } else {
      res.status(404).json({ message: 'Discussion not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new discussion or book club
// @route   POST /api/community
// @access  Private
const createDiscussion = async (req, res) => {
  const { title, content, category, isBookClub, clubName } = req.body;

  try {
    const discussion = new Discussion({
      user: req.user._id,
      userName: req.user.name,
      title,
      content,
      category: category || 'General',
      isBookClub: isBookClub === true || isBookClub === 'true',
      clubName,
    });

    if (discussion.isBookClub) {
      // Creator is automatically a member
      discussion.members.push(req.user._id);
    }

    const createdDiscussion = await discussion.save();
    res.status(201).json(createdDiscussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or unlike a discussion post
// @route   PUT /api/community/:id/like
// @access  Private
const likeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (discussion) {
      const alreadyLikedIdx = discussion.likes.findIndex(
        (id) => id.toString() === req.user._id.toString()
      );

      if (alreadyLikedIdx > -1) {
        // Unlike
        discussion.likes.splice(alreadyLikedIdx, 1);
      } else {
        // Like
        discussion.likes.push(req.user._id);
      }

      await discussion.save();
      res.json({ likes: discussion.likes });
    } else {
      res.status(404).json({ message: 'Discussion not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment/reply to discussion
// @route   POST /api/community/:id/comment
// @access  Private
const addDiscussionComment = async (req, res) => {
  const { content } = req.body;

  try {
    const discussion = await Discussion.findById(req.params.id);

    if (discussion) {
      const comment = {
        user: req.user._id,
        userName: req.user.name,
        content,
      };

      discussion.comments.push(comment);
      await discussion.save();

      res.status(201).json(discussion);
    } else {
      res.status(404).json({ message: 'Discussion not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a book club
// @route   PUT /api/community/:id/join
// @access  Private
const joinBookClub = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (discussion) {
      if (!discussion.isBookClub) {
        res.status(400).json({ message: 'This discussion is not a book club' });
        return;
      }

      const alreadyMember = discussion.members.includes(req.user._id);

      if (alreadyMember) {
        res.status(400).json({ message: 'Already a member of this club' });
        return;
      }

      discussion.members.push(req.user._id);
      await discussion.save();

      res.json({ message: 'Joined book club successfully', members: discussion.members });
    } else {
      res.status(404).json({ message: 'Book club not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  likeDiscussion,
  addDiscussionComment,
  joinBookClub,
};
