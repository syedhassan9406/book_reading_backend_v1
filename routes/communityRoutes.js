const express = require('express');
const {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  likeDiscussion,
  addDiscussionComment,
  joinBookClub,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getDiscussions)
  .post(protect, createDiscussion);

router.route('/:id')
  .get(getDiscussionById);

router.route('/:id/like')
  .put(protect, likeDiscussion);

router.route('/:id/comment')
  .post(protect, addDiscussionComment);

router.route('/:id/join')
  .put(protect, joinBookClub);

module.exports = router;
