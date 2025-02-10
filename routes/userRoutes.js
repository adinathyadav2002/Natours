const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logOut);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// middleware to authenticate below routes
// TODO: middlewares run in order
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUserData);
router.delete('/deleteMe', userController.getMe, userController.deleteUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.getMe,
  userController.modifyUserData,
);

router.patch('/updatePassword', authController.updatePassword);

// app.post('/api/v1/tours', postTourData);
// app.get('/api/v1/tours', getToursData);

router.use(authController.restrictTo('admin'));

router.route('/:id').get(userController.getUserData);

router
  .route('/')
  .get(userController.getUsersData)
  .post(userController.postUserData);

module.exports = router;
