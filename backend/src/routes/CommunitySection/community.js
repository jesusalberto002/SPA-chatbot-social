const express = require('express');
const communityController = require('../../controllers/Users/CommunitySection/community');
const postController = require('../../controllers/Users/CommunitySection/post');
const postCommentController = require('../../controllers/Users/CommunitySection/comment');
const exploreController = require('../../controllers/Users/CommunitySection/explore');
const popularController = require('../../controllers/Users/CommunitySection/popular');
const reportController = require('../../controllers/Users/CommunitySection/report');
const chatController = require('../../controllers/Users/chat');
const HaivenAIController = require('../../controllers/Users/HaivenAI');

const upload = require('../../middleware/uploadMiddleware'); // Assuming you have a file upload middleware

const router = express.Router();

// Routes for communities
router.post('/join/:communityId', communityController.joinCommunity);
router.delete('/leave/:communityId', communityController.leaveCommunity);

router.post('/create', upload.single('bannerImage'), communityController.createCommunity);
router.put('/edit/:communityId', upload.single('bannerImage'), communityController.editCommunity);
router.delete('/delete/:communityId', communityController.deleteCommunity);
router.get('/user-communities', communityController.getUserCommunities);
router.get('/get-data/:communityId', communityController.getCommunityDataById);
router.get('/search', communityController.searchCommunities);
router.get('/user-feed', communityController.getJoinedCommunitiesFeed);

// Routes to create a post in a community
router.post('/post/create/:communityId', upload.single('postImage'), postController.createPost);
router.post('/post/vote/:postId', postController.voteOnPost);
router.post('/post/react/:postId', postController.togglePostReaction);
router.delete('/post/delete/:postId', postController.deletePost);

// Routes to create a comment on a post
router.post('/post/comment/create/:postId', postCommentController.createComment);
router.delete('/post/comment/delete/:commentId', postCommentController.deleteComment);
router.post('/post/comment/reply/:parentCommentId', postCommentController.createReply);
router.post('/post/comment/react/:commentId', postCommentController.toggleCommentReaction);
router.post('/post/comment/vote/:commentId', postCommentController.voteOnComment);
router.get('/post/comment/get/:postId', postCommentController.getPostComments);
router.post('/post/comment/ask-haiven/:postId', HaivenAIController.askHaivenInCommunity);

// Routes to fecth data for explore page
router.get('/explore/by-tag/:tag', exploreController.getCommunitiesByTag);
router.get('/explore/recommended-communities', exploreController.getRecommendedCommunities);
router.get('/explore/most-active', communityController.getMostActiveCommunities);
router.get('/explore/top-communities', communityController.getTopCommunities);

// Routes to fetch popular data for popular page
router.get('/popular/popular-tags', popularController.getPopularTags);
router.get('/popular/trending-posts', popularController.getTrendingPosts);
router.get('/popular/trending-communities', popularController.getTrendingCommunities);

router.post('/report', reportController.createReport);

module.exports = router;