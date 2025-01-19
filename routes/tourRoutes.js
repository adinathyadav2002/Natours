const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// middleware to check ID of user
// router.param('id', tourController.checkId);

// GENERAL RULE
// Place specific routes (e.g., /top-5-cheap, /best-tours, etc.) before general routes (e.g., /:id).
// Express matches routes in the order they are defined in your code.

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getTourPlan);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopFiveCheap, tourController.getToursData);

router
  .route('/:id')
  .get(tourController.getTourData)
  .delete(
    authController.protect,
    authController.restrictTo('lead-guide', 'admin'),
    tourController.deleteTourData,
  )
  .patch(tourController.modifyTourData);

// OR

// app
//   .route('/api/v1/tours/:id')
//   .get(getTourData)
//   .delete(deleteTourData)
//   .patch(modifyTourData);

// app.post('/api/v1/tours', postTourData);
// app.get('/api/v1/tours', getToursData);

router
  .route('/')
  .get(authController.protect, tourController.getToursData)
  .post(tourController.postTourData);
// .post(tourController.checkTourData, tourController.postTourData);
//   using multiple middleware

// Insted of doing this use express to handle nested routes
// router
//   .route('/:tourID/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.postReviewData,
//   );

router.use('/:tourID/reviews', reviewRouter);
module.exports = router;
