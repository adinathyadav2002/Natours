const User = require('../models/userModel');

const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

exports.getUsersData = catchAsync(async (req, res) => {
  const users = await User.find();

  if (!users) return new AppError('No Tours found!', 404);

  // internal server error
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.postUserData = function (req, res) {
  // internal server error
  res.status(500).json({
    status: 'error',
    message: 'This rout is not defined yet!',
  });
};
exports.getUserData = function (req, res) {
  // internal server error
  res.status(500).json({
    status: 'error',
    message: 'This rout is not defined yet!',
  });
};
exports.deleteUserData = function (req, res) {
  // internal server error
  res.status(500).json({
    status: 'error',
    message: 'This rout is not defined yet!',
  });
};
exports.modifyUserData = catchAsync(async function (req, res) {
  const user = await User.findOne({ id: req.params.id });

  if (!user) {
    return new AppError('No User found with that ID!', 404);
  }

  // internal server error
  res.status(500).json({
    status: 'error',
    message: 'This rout is not defined yet!',
  });
});
