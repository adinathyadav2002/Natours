const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router
  .route('/:id')
  .get(userController.getUserData)
  .delete(userController.deleteUserData)
  .patch(userController.modifyUserData);

// app.post('/api/v1/tours', postTourData);
// app.get('/api/v1/tours', getToursData);
router
  .route('/')
  .get(userController.getUsersData)
  .post(userController.postUserData);

module.exports = router;
