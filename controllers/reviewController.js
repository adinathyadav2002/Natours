const catchAsync = require('../utilities/catchAsync');
const Review = require('../models/reviewModel');
const AppError = require('../utilities/appError');
const factoryController = require('./factoryController');

exports.getReviewsData = catchAsync(async (req, res, next) => {
  // This will allow get request on /tour/:tourID/reviews
  let filter = {};
  if (req.params.tourID) filter = { tour: req.params.tourID };

  const reviews = await Review.find(filter);

  if (!reviews) return next(new AppError('Reviews not found!', 404));

  res.status(200).json({
    message: 'success',
    data: {
      reviews,
    },
  });
});

exports.setTourAndUser = (req, res, next) => {
  // This it to allow nested routes on /tour/:tourID/reviews
  if (!req.body.tour) req.body.tour = req.params.tourID;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.postReviewData = factoryController.createOne(Review);
exports.updateReviewData = factoryController.updateOne(Review);
exports.deleteReviewData = factoryController.deleteOne(Review);
exports.getReviewData = factoryController.getOne(Review);
