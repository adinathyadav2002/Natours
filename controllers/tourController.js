const multer = require('multer');
const sharp = require('sharp');

const factoryController = require('./factoryController');
const Tour = require('../models/tourModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

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
// for arrays of more than one image
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// for more than one image
// upload.array('images', 5);  -- req.files

// for one image
// upload.single('photo')      -- req.file

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg `;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1300)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];

  // Wating all the promises so we get all the images correctly from req.body.images
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}`;

      await sharp(file.buffer)
        .resize(2000, 1300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);

      req.body.images.push(fileName);
    }),
  );

  next();
});

exports.aliasTopFiveCheap = (req, res, next) => {
  // TODO: ALWAYS REMEMBER ENDPOINTS SHOULD BE STRING
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getToursData = factoryController.getAll(Tour);
exports.getTourData = factoryController.getOne(Tour, { path: 'reviews' });
exports.postTourData = factoryController.createOne(Tour);
exports.deleteTourData = factoryController.deleteOne(Tour);

exports.modifyTourData = catchAsync(async function (req, res, next) {
  // console.log(req.params);
  // TODO: we have to run validators again when we update the tour
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) return next(new AppError('No Tour found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.getTourStats = catchAsync(async function (req, res, next) {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        totalTours: { $sum: 1 },
        totalQuantity: { $sum: '$ratingsQuantity' },
        averageRating: { $avg: '$ratingsAverage' },
        averagePrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
    {
      $sort: { averagePrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(202).json({
    status: 'successful',
    data: {
      stats,
    },
  });
});

exports.getTourPlan = catchAsync(async function (req, res, next) {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    // TO SORT DESC -1
    {
      $sort: { numTourStarts: -1 },
    },
    // ADD FIELDS
    {
      $addFields: {
        month: '$_id',
      },
    },
    // IF WE WANT TO HIDE SOME FIELD
    {
      $project: {
        _id: 0,
      },
    },
    {
      $limit: 12,
    },
    // {
    //   $sort: '$numTourStarts',
    // },
  ]);

  if (!plan.length)
    return next(
      new AppError(`Monthly plan has not been decided for the ${year}.`, 404),
    );

  res.status(202).json({
    status: 'successful',
    length: plan.length,
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
      ),
      400,
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    message: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
      ),
      400,
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    message: 'success',
    data: {
      distances,
    },
  });
});

/**********************************************************************************/
// Instead writing same code in each Controller file
// we refactored our that code using factoryController

// // using middleware to check for correct id
// exports.getToursData = catchAsync(async function (req, res, next) {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   const tours = await features.query;

//   if (!tours) return next(new AppError('No Tours found!', 404));

//   // ANOTHER WAY TO SPECIFY ENDPOINTS
//   // const tours = await Tour.find()
//   //   .where('duration')
//   //   .equals(5)
//   //   .where('difficulty')
//   //   .equals('easy');

//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// exports.getTourData = catchAsync(async function (req, res, next) {
//   const tour = await Tour.findById(req.params.id).populate('review');
//   if (!tour) return next(new AppError('No Tour found with that ID', 404));
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
//   // console.log(req.params);
//   // const { id } = req.params;
//   // const tour = tours.find((item) => item._id === id);
// });

// // NO NEED BECAUSE FORM VALIDATION WILL BE DONE BY MONGODB
// // exports.checkTourData = function (req, res, next) {
// //   const obj = req.body;
// //   if (!('name' in obj) || !('difficulty' in obj) || !('duration' in obj)) {
// //     return res.status(400).json({
// //       status: 'error',
// //       message: 'sent incorrect request!',
// //     });
// //   }
// //   next();
// // };

// exports.postTourData = catchAsync(async function (req, res, next) {
//   // app.use(express.json());
//   //
//   // without above midleware it is undefined
//   // console.log(req.body);
//   // const newId = tours[tours.length - 1]._id + 1;
//   // /* eslint-disable-next-line prefer-object-spread */
//   // const newTour = Object.assign({ _id: newId }, req.body);
//   // tours.push(newTour);
//   // fs.writeFile(
//   //   `${__dirname}/div-data/data/tours.json`,
//   //   JSON.stringify(tours),
//   //   (err) => {
//   //     res.status(201).json({
//   //       status: 'success',
//   //       data: {
//   //         tour: newTour,
//   //       },
//   //     });
//   //   },
//   // );

//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

// exports.deleteTourData = catchAsync(async function (req, res, next) {
//   const tour = await Tour.deleteOne({ _id: req.params.id });

//   if (!tour) return new AppError('No Tour found with that ID', 404);
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });

//   // console.log(req.params);
// });

/**********************************************************************************/

/**********************************************************************************/
// SOME EXTRA PART TO LEARN
// WHEN WE WANT TO READ FOR FILE
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`),
// );

// exports.checkId = function (req, res, next, val) {
//   const { id } = req.params;
//   const tour = tours.find((item) => item._id === id);
//   if (!tour) {
//     res.status(404).json({
//       status: 'error',
//       message: 'Incorrect index',
//     });
//     return;
//   }
//   next();
// };
/**********************************************************************************/
