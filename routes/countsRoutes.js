const express = require('express');
const router = express.Router();
const countsController = require('../controllers/countsController');

router.get('/users', countsController.getUsersCount);
router.get('/posts', countsController.getPostsCount);
router.post('/post', countsController.getUserPostCount);
router.get('/users/compare', countsController.getUsersCompareCount);
router.get('/posts/compare', countsController.getPostsCompareCount);

module.exports = router;