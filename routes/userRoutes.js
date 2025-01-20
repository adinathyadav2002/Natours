const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// middleware to authenticate below routes
// TODO: middlewares run in order
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUserData);

router.post(
  '/updatePassword',

  authController.updatePassword,
);

// app.post('/api/v1/tours', postTourData);
// app.get('/api/v1/tours', getToursData);

router.use(authController.restrictTo('admin'));

router
  .route('/:id')
  .get(userController.getUserData)
  .patch(userController.modifyUserData)
  .delete(userController.deleteUser);

router
  .route('/')
  .get(userController.getUsersData)
  .post(userController.postUserData);

module.exports = router;
