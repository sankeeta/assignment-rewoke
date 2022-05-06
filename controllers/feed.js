const fs = require('fs');
const path = require('path');

const {validationResult} = require('express-validator');
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.getPosts = (req,res,next)=>{
    const currentPage = req.query.page || 1;
    const limit = 5;
    let offset = (currentPage - 1) * limit;
    let totalItems;
    Post.count()
      .then((count) => {
        totalItems = count;
        return Post.find(['post.id as postId','post.content','post.image','post.created_at','user.name'],{},{'user':'user_id'},null,limit,offset)
      })
      .then(posts => {
        res.status(200).json({
          message: 'Fetched posts successfully.',
          posts: posts,
          totalItems: totalItems
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
    
} 
exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error();
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    if (!req.file) {
      const error = new Error('No image found.');
      error.statusCode = 422;
      throw error;
    }
    const imageUrl = req.file.path.replace("\\" ,"/");
    const content = req.body.content;
    let creator;
    console.log('req.userId : ',req.userId)
    const post = new Post(content, imageUrl,req.userId);
    post
      .save()
      .then(result => {
        res.status(201).json({
          message: 'Post created successfully!'
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
};

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error();
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = req.file.path.replace("\\","/");
    }
    if (!imageUrl) {
      const error = new Error('No file selected.');
      error.statusCode = 422;
      throw error;
    }
    Post.findById(postId)
      .then(post => {
          console.log('POST : ',post);
        if (!post) {
          const error = new Error('Could not find post.');
          error.statusCode = 404;
          throw error;
        }
        if (post.user_id.toString() !== req.userId) {
          const error = new Error('Not authorized!');
          error.statusCode = 403;
          throw error;
        }
        if (imageUrl !== post.image) {
          clearImage(post.image);
        }
        return Post.updateOne(postId,{content :  content,image : imageUrl});
      })
      .then(result => {
        res.status(200).json({ message: 'Post updated!'});
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };
  
  exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
      .then(post => {
        if (!post) {
          const error = new Error('Could not find post.');
          error.statusCode = 404;
          throw error;
        }
        if (post.user_id.toString() !== req.userId) {
          const error = new Error('Not authorized!');
          error.statusCode = 403;
          throw error;
        }
        // Check logged in user
        clearImage(post.image);
        return Post.delete(postId);
      })
      .then(result => {
        res.status(200).json({ message: 'Post deleted' });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  exports.getComments = (req,res,next)=>{
    const postId = req.params.postId;
    const currentPage = req.query.page || 1;
    const limit = 5;
    let offset = (currentPage - 1) * limit;
    let totalItems;
    Comment.count()
      .then((count) => {
        totalItems = count;
        return Comment.find(['comments.id as commentsId','comments.comment','comments.post_id as postId','comments.created_at','user.name'],{post_id:postId},{'user':'user_id'},null,limit,offset)
      })
      .then(comments => {
        res.status(200).json({
          message: 'Fetched comments successfully.',
          comments: comments,
          totalItems: totalItems
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
    
} 

exports.createComment = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error();
      error.statusCode = 422;
      error.data = errors.array();
      error.message = error.data[0].msg;
      throw error;
    }
    const comment_text = req.body.comment;
    const postId = req.params.postId;
    const comment = new Comment(comment_text,req.userId,postId);
    comment
      .save()
      .then(result => {
        res.status(201).json({
          message: 'Comment posted'
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
};

exports.deleteComment = (req, res, next) => {
    const commentId = req.params.commentId;
    Comment.findById(commentId)
      .then(comment => {
        if (!comment) {
          const error = new Error('Could not find comment.');
          error.statusCode = 404;
          throw error;
        }
        if (comment.user_id.toString() !== req.userId) {
          const error = new Error('Not authorized!');
          error.statusCode = 403;
          throw error;
        }
        // Check logged in user
        return Comment.delete(commentId);
      })
      .then(result => {
        res.status(200).json({ message: 'Comment deleted' });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
  };
