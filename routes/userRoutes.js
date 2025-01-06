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
  .route('/')
  .get(authController.protect, userController.getUserData)
  .delete(authController.protect, userController.deleteUser)
  .patch(authController.protect, userController.modifyUserData);

router
  .route('/all')
  .get(userController.getUsersData)
  .post(userController.postUserData);
module.exports = router;
