const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// to user params from previous routes
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getReviewsData)
  .post(
    authController.restrictTo('admin', 'user'),
    reviewController.setTourAndUser,
    reviewController.postReviewData,
  );

router
  .route('/:id')
  .get(reviewController.getReviewData)
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReviewData,
  )
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReviewData,
  );

module.exports = router;
