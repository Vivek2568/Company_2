const Post = require('../models/Post');
const { verifyToken } = require('../utils/auth');
const sanitizeHtml = require('sanitize-html');
const path = require('path');

const User = require('../models/User');
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 9, search, categories, tags, author, followed } = req.query;

    // Determine if the requester is the same as the author (to show drafts)
    let requesterId = null;
    let followingIds = [];
    try {
      const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
      const payload = token ? verifyToken(token) : null;
      requesterId = payload?.userId || null;
      if (followed && requesterId) {
        const currentUser = await User.findById(requesterId);
        followingIds = currentUser?.following?.map(id => id.toString()) || [];
      }
    } catch (e) {
      requesterId = null;
    }

    // Default query: only published posts
    let query = { status: 'published' };

    // If author filter is present, add it. If requester is the same author, allow all statuses for that author.
    if (author) {
      query.author = author;
      if (requesterId && requesterId.toString() === author.toString()) {
        // remove status filter for author's own view
        delete query.status;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Handle multiple categories (comma-separated)
    if (categories) {
      const categoryArray = categories.split(',').filter(c => c.trim());
      if (categoryArray.length > 0) {
        query.categories = { $in: categoryArray };
      }
    }

    // Handle multiple tags (comma-separated or array)
    if (tags) {
      const tagsArray = Array.isArray(tags) 
        ? tags.filter(t => typeof t === 'string' && t.trim())
        : tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagsArray.length > 0) {
        query.tags = { $in: tagsArray };
      }
    }

    if (followed && followingIds.length > 0) {
      query.author = { $in: followingIds };
    }

    const posts = await Post.find(query)
      .populate('author', 'username')
      .populate('categories', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);
    res.json({ posts, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    console.error('getPosts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('categories', 'name');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Allow author to see their drafts
    if (post.status !== 'published') {
      const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
      const payload = token ? verifyToken(token) : null;
      if (!payload || payload.userId.toString() !== post.author._id.toString()) {
        return res.status(404).json({ message: 'Post not found' });
      }
    }

    res.json(post);
  } catch (error) {
    console.error('getPostById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, categories, tags, status } = req.body;
    // sanitize HTML content to prevent XSS
    const cleanContent = sanitizeHtml(content || '', {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'u', 's']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'title'],
        a: ['href', 'name', 'target']
      },
      allowedSchemesByTag: {
        img: ['http', 'https', 'data']
      }
    });
    let images = [];
    if (req.files && req.files.length > 0) {
      // Store only the filename - the frontend will use /uploads/{filename}
      images = req.files.map(file => path.basename(file.path));
    }
    // Accept tags as comma-separated string or array, filter out empty
    let tagsArray = [];
    if (Array.isArray(tags)) {
      tagsArray = tags.filter(t => typeof t === 'string' && t.trim() !== '').map(t => t.trim());
    } else if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    const post = new Post({
      title,
      content: cleanContent,
      author: req.user.id,
      categories,
      tags: tagsArray,
      status,
      images
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('createPost error:', error);
    // Provide the error message in the response for easier debugging during development
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // only the author may update their post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    const { title, content, categories, tags, status } = req.body;
    post.title = title || post.title;
    post.content = content ? sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'u', 's']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'title'],
        a: ['href', 'name', 'target']
      },
      allowedSchemesByTag: {
        img: ['http', 'https', 'data']
      }
    }) : post.content;
    post.categories = categories || post.categories;
    
    // Process tags same way as createPost
    let tagsArray = [];
    if (Array.isArray(tags)) {
      tagsArray = tags.filter(t => typeof t === 'string' && t.trim() !== '').map(t => t.trim());
    } else if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (tags) {
      tagsArray = Object.values(tags).map(t => String(t).trim()).filter(Boolean);
    }
    post.tags = tagsArray.length > 0 ? tagsArray : post.tags;
    post.status = status || post.status;
    if (req.files && req.files.length > 0) {
      post.images = req.files.map(file => path.basename(file.path));
    }
    await post.save();
    res.json(post);
  } catch (error) {
    console.error('updatePost error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // only the author may delete their post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('deletePost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user.id;
    const index = post.likes.findIndex((id) => id.toString() === userId.toString());
    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(userId);
      // ensure a user can't both like and dislike
      const dIndex = post.dislikes.findIndex((id) => id.toString() === userId.toString());
      if (dIndex > -1) post.dislikes.splice(dIndex, 1);
    }
    await post.save();
    // return minimal data to client
    res.json({ id: post._id, likes: post.likes.length });
  } catch (error) {
    console.error('likePost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecommendedPosts = async (req, res) => {
  try {
    const { postId, limit = 3 } = req.query;
    
    // Get current post to get author and categories
    const currentPost = await Post.findById(postId)
      .populate('author', '_id')
      .populate('categories', '_id');
    
    if (!currentPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get published posts by same author (excluding current post)
    const sameAuthorPosts = await Post.find({
      author: currentPost.author._id,
      status: 'published',
      _id: { $ne: postId }
    })
      .populate('author', 'username _id')
      .populate('categories', 'name')
      .populate('tags', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get published posts in same categories (excluding current post and posts by same author)
    const categoryIds = currentPost.categories.map(c => c._id);
    const sameCategoryPosts = await Post.find({
      categories: { $in: categoryIds },
      status: 'published',
      _id: { $ne: postId },
      author: { $ne: currentPost.author._id }
    })
      .populate('author', 'username _id')
      .populate('categories', 'name')
      .populate('tags', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      sameAuthor: sameAuthorPosts,
      sameCategory: sameCategoryPosts
    });
  } catch (error) {
    console.error('getRecommendedPosts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost, likePost, getRecommendedPosts };
