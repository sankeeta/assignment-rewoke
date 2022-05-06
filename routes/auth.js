const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        
        return User.find({email:value}).then((user) => {
            console.log('user : ',user);
            if (user.length) {
                return Promise.reject('E-Mail address already exists!');
            }
        }).catch(err => {
            console.log(err)
            throw new Error(err);
        });
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 5 }),
    body('name')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.signup
);

router.post('/login',[
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail(),
    body('password')
      .trim()
      .not()
      .isEmpty()
  ], authController.login);

module.exports = router;
