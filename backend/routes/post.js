const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getPosts, getPostById, createPost, updatePost, deletePost, likePost, getRecommendedPosts } = require('../controllers/postController');
const upload = require('../middlewares/upload');
const { authenticate } = require('../middlewares/auth');
const { handleValidation } = require('../middlewares/validation');


router.get('/', getPosts);
router.get('/recommendations', getRecommendedPosts);
router.get('/:id', getPostById);
router.post('/', authenticate, upload.array('images', 5), [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  handleValidation
], createPost);
router.put('/:id', authenticate, upload.array('images', 5), [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  handleValidation
], updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, likePost);

module.exports = router;



