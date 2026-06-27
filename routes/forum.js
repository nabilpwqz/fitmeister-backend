const express = require('express');
const ForumPost = require('../models/ForumPost');
const { authGuard, roleGuard } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 8 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await ForumPost.countDocuments();
    const posts = await ForumPost.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ posts, page: Number(page), total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ post });
  } catch (error) {
    next(error);
  }
});

router.post('/', authGuard, roleGuard(['trainer', 'admin']), async (req, res, next) => {
  try {
    const { title, description, image } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description are required.' });
    const post = await ForumPost.create({
      title,
      description,
      image,
      authorId: req.user.id,
      authorName: req.user.name || 'Trainer',
      authorRole: req.user.role
    });
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/vote', authGuard, async (req, res, next) => {
  try {
    const { type } = req.body;
    if (!['like', 'dislike'].includes(type)) return res.status(400).json({ message: 'Vote type invalid.' });
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    const userId = req.user.id;
    const alreadyLiked = post.likes.includes(userId);
    const alreadyDisliked = post.dislikes.includes(userId);
    if (type === 'like') {
      if (!alreadyLiked) post.likes.push(userId);
      post.dislikes = post.dislikes.filter((id) => String(id) !== String(userId));
    } else {
      if (!alreadyDisliked) post.dislikes.push(userId);
      post.likes = post.likes.filter((id) => String(id) !== String(userId));
    }
    await post.save();
    res.json({ post });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/comments', authGuard, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required.' });
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    post.comments.push({ userId: req.user.id, userName: req.user.name, text });
    await post.save();
    res.status(201).json({ comments: post.comments });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authGuard, roleGuard(['admin']), async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    await post.deleteOne();
    res.json({ message: 'Post deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
