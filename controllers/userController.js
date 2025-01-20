const User = require('../models/userModel');

const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

const factoryController = require('./factoryController');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUsersData = factoryController.getAll(User);
exports.postUserData = factoryController.createOne(User);
exports.getUserData = factoryController.getOne(User);
exports.deleteUser = factoryController.deleteOne(User);

/*************************************************************************** */
// Instead writing same code in each Controller file
// we refactored our that code using factoryController

// exports.getUsersData = catchAsync(async (req, res) => {
//   const users = await User.find();

//   if (!users) return new AppError('No Tours found!', 404);

//   // internal server error
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

// exports.postUserData = function (req, res) {
//   // internal server error
//   res.status(500).json({
//     status: 'error',
//     message: 'This rout is not defined yet!',
//   });
// };

// exports.getUserData = function (req, res) {
//   // internal server error
//   res.status(500).json({
//     status: 'error',
//     message: 'This rout is not defined yet!',
//   });
// };

// exports.deleteUser = catchAsync(async (req, res, next) => {
//   // 1)  get user
//   await User.findByIdAndUpdate(req.user.id, { active: false });

//   // 2) send response
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

/*************************************************************************** */

exports.modifyUserData = catchAsync(async function (req, res, next) {
  // TODO: SHOULD NOT MODIFY THE PASSWORD OR
  // SHOULD MODIFY ONLY SELECTED FIELDS

  // 1) check if user is updating password or passwordConfirmField
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This rout is not for password updates! Please use /updateMyPassword',
        400,
      ),
    );
  }

  // 2) give user limited field to update and update the fields
  const user = await User.findById(req.user.id);
  const allowedFields = ['name', 'email'];
  Object.keys(req.body).forEach((item) => {
    if (allowedFields.includes(item)) {
      user[item] = req.body[item];
    }
  });

  // 3) render the changes to document
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Data modified successfully!',
    data: {
      user,
    },
  });
});
