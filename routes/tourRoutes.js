const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('lead-guide', 'admin', 'guide'),
    tourController.getTourPlan,
  );

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
  .patch(
    authController.protect,
    authController.restrictTo('lead-guide', 'admin'),
    tourController.modifyTourData,
  );

// ****************************************************************************
// OR

// app
//   .route('/api/v1/tours/:id')
//   .get(getTourData)
//   .delete(deleteTourData)
//   .patch(modifyTourData);

// app.post('/api/v1/tours', postTourData);
// app.get('/api/v1/tours', getToursData);
// ****************************************************************************

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within/:233/center/:34.0200392,-118.7413821/unit/:mi

router.route('/distance/:latlng/unit/:unit').get(tourController.getDistance);

router
  .route('/')
  .get(tourController.getToursData)
  .post(
    authController.protect,
    authController.restrictTo('lead-guide', 'admin'),
    tourController.postTourData,
  );

router.use('/:tourID/reviews', reviewRouter);
module.exports = router;

// ****************************************************************************

// middleware to check ID of user
// router.param('id', tourController.checkId);

// GENERAL RULE
// Place specific routes (e.g., /top-5-cheap, /best-tours, etc.) before general routes (e.g., /:id).
// Express matches routes in the order they are defined in your code.

// ****************************************************************************

// Insted of doing this use express to handle nested routes
// router
//   .route('/:tourID/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.postReviewData,
//   );

// ****************************************************************************
