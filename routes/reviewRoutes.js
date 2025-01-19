const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// to user params from previous routes
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.getReviewsData,
  )
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.setTourAndUser,
    reviewController.postReviewData,
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.getReviewData,
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.updateReviewData,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.deleteReviewData,
  );

module.exports = router;
