const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array();
    error.message = error.data[0].msg;
    throw error;
  }
  console.log('reQ : ',req.body);
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then(hash => {
      console.log('hash : ',hash)
      const user = new User(name,email,hash);
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'User registered sucessfully!', userId: result.id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array();
    error.message = error.data[0].msg;
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  let fetchedUser;
  User.findOne({email:email})
    .then(user => {
      if (!user) {
        const error = new Error('No user found with this email address');
        error.statusCode = 401;
        throw error;
      }
      fetchedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Invalid credentials!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: fetchedUser.email,
          userId: fetchedUser.id.toString()
        },
        'thisissecretforjwttoken',
        { expiresIn: '3h' }
      );
      res.status(200).json({ token: token, userId: fetchedUser.id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
