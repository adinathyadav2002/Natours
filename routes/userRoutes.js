const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.post(
  '/updatePassword',
  authController.protect,
  authController.updatePassword,
);

// app.post('/api/v1/tours', postTourData);
// app.get('/api/v1/tours', getToursData);

router
  .route('/:id')
  .get(authController.protect, userController.getUserData)
  .patch(authController.protect, userController.modifyUserData)
  .delete(authController.protect, userController.deleteUser);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getUsersData,
  )
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    userController.postUserData,
  );

module.exports = router;
