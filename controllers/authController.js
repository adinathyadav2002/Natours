const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const AppError = require('../utilities/appError');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const sendEmail = require('../utilities/email');

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.body.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    return next();
  };

exports.signup = catchAsync(async (req, res, next) => {
  // so user will not be able to select role with query
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = createToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) return if the user do not provide complete info
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) return if password or email do not match
  const user = await User.findOne({ email: email }).select('+password');

  // 401 : BAD AUTHENTICATION
  if (!user || !(await user.checkCorrectPassword(password, user.password)))
    return next(new AppError('Password or email is incorrect!'), 401);

  // 3) return token if everything is ok
  const token = createToken(user._id);
  res.status(200).json({
    status: 'sucess',
    token,
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get jwt from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access.'),
    );

  // 2) verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to token no longer exists!', 401),
    );

  // 4) check if user has changed the password
  if (currentUser.checkPasswordChanged(decoded.iat))
    return next(
      new AppError('User recently changed password! Please login again.'),
    );

  req.body.user = currentUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on based email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('There is no user with that email', 404));

  // 2) generate random token
  const resetToken = user.createPasswordResetToken();
  // to save the document that will reflect the changes
  await user.save({ validateBeforeSave: false });

  // 3) send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to ${resetURL}.\n If you don't forgot your password, Please ignore this mail.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(Valid for 10 min)',
      text: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was error sending the email.Try again later!', 500),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // console.log(s);
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired and there is user, then set the password

  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) update passwordChangedAt property for user
  // 4) login the user and send jwt to user

  const token = createToken(user._id);
  res.status(200).json({
    status: 'sucess',
    token,
  });
});
