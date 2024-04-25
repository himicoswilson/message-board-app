const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/create', postController.createPost);
router.get('/post/:id', postController.getPost);
router.get('/newest', postController.getNewestPost);
router.get('/page/:page', postController.getPagePosts);
router.put('/edit/:id', postController.editPost);
router.get('/get_edit/:id', postController.getEditPost);
router.get('/history/:id', postController.getHistoryPost);
router.post('/like', postController.likePost)
router.post('/like_num', postController.updateLikeNum)
router.put('/delete/:id', postController.deletePost);

module.exports = router;
