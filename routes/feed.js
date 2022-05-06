const express = require('express');
const {body} = require('express-validator')
const feedController = require('../controllers/feed')
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/posts',isAuth,feedController.getPosts);

router.post('/post',
isAuth,
[
    body('content').trim().isLength({min:20,max:250})
    .withMessage('Text content size should be between 20 to 250')
],feedController.createPost);

router.put(
    '/post/:postId',
    isAuth,
    [
        body('content').trim().isLength({min:20,max:250})
        .withMessage('Text content size should be between 20 to 250')
    ],
    feedController.updatePost
  );

router.delete('/post/:postId', isAuth, feedController.deletePost);
 
router.get('/post/comments/:postId',isAuth,feedController.getComments);

router.post('/post/comment/:postId',
isAuth,
[
    body('comment').trim().isLength({min:1,max:250})
    .withMessage('Text content size should be between 1 to 250')
],feedController.createComment);

router.delete('/post/comment/:commentId', isAuth, feedController.deleteComment);

module.exports = router;