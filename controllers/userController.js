const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const AppError = require('../utilities/appError');

const factoryController = require('./factoryController');
const catchAsync = require('../utilities/catchAsync');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// TO STORE THE IMAGE DIRECTLY ON TO THE DISK
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// TO STORE THE IMAGE IN THE MEMORY
const multerStorage = multer.memoryStorage();
// cb is same as next()
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // This is asynchronous task
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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

exports.modifyUserData = async function (req, res, next) {
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

  // Only allow 'name' and 'email' fields to be updated
  const allowedFields = ['name', 'email'];
  const filteredBody = {};

  Object.keys(req.body).forEach((field) => {
    if (allowedFields.includes(field)) {
      filteredBody[field] = req.body[field];
    }
  });

  // if there is file of photo then update the photo property
  if (req.file) filteredBody.photo = req.file.filename;

  // Update user directly without triggering validators
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // Return updated document
    runValidators: true, // Ensure validators run for updated fields
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Data modified successfully!',
    data: {
      user,
    },
  });
};

// *******************************************************************************
// ADDITIONAL INFO

// findByIdAndUpdate() directly updates the document without calling .save(), avoiding unnecessary validation for unchanged fields.
// runValidators: true ensures that validation is applied only to the updated fields, preventing unintended errors.
// new: true returns the updated document in the response.

// Model.save() run validators
// if use Model.validate() before Model.save() then it will not run validators

// ex:

/*
var mongoose = require('mongoose');
mongoose.connect('mongodb://user:pass@localhost/mydb');
db = mongoose.connection;

var Schema = mongoose.Schema;

var PartSchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: (v) => v !== 'asdf', // Don't allow name to be 'asdf'
    },
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: (v) => !v.includes(' '), // Don't allow spaces in part number.
    },
  },
});

var ProductSchema = new Schema({
  name: String,
  parts: [PartSchema],
});

var Part = mongoose.model('Part', PartSchema);
var Product = mongoose.model('Product', ProductSchema);

var p1 = new Product({
  name: 'Baseball Bat',
  parts: [
    new Part({ name: 'First part', number: '003344' }),
    new Part({ name: 'Second part', number: '554422' }),
  ],
});

p1.parts.push(new Part({ name: 'No number, so invalid' })); // this one is invalid because no part number is specified (required)
p1.parts.push(new Part({ name: 'asdf', number: 'zzzzzaaaa' }));
p1.parts.push(new Part({ name: 'bbbb', number: 'with a space' })); // This one is invalid because number has spaces.
p1.validate()
  .then(() => {
    console.log('Validation successful');
  })
  .catch((err) => {
    console.log('Validation failed.');
  });
p1.save()
  .then(() => {
    console.log('Saved successfully');
  })
  .catch((err) => {
    console.log('Save ERROR', err);
  });
  */

// *******************************************************************************
