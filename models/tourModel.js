const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    // name: String,
    // rating: Number,
    // price: Number,

    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      trim: true,
      maxlength: ['40', 'A Tour must have at most 40 characters'],
      minlength: ['10', 'A Tour must have at least 10 characters'],
      // to check name contains only characters or letters not space
      validate: {
        validator: function (val) {
          return validator.isAlpha(val.replace(/\s/g, ''));
        },
      },
      message: 'Tour name must only contain characters',
    },
    duration: {
      type: Number,
      required: [true, 'A Tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a group size'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A Tour rating must be greater than 1'],
      max: [5, 'A Tour rating must be less than 5'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    price: {
      type: Number,
      required: [true, 'A Tour should have a price'],
    },
    priceDiscount: {
      type: Number,
      // custom validator
      validate: {
        validator: function (val) {
          // TODO: This point to current document on NEW document creation
          return val < this.price;
        },
        message: 'Discount price need to be less than ({VALUE})',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // to hide from user
      select: false,
    },
    startDates: [Date],
    secreteTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // geoJSON must have type and co-ordinates
      type: {
        // this is schema option
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    // embedded documents
    locations: [
      {
        type: {
          // this is schema option
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  // needed to show virtual properties
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// VIRTUAL PROPERTIES (properties which are not in database)
// we calculate them when we get data from database
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: run only on save() and create()

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embedded code for guides in Tour
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(
//     async (guideID) => await User.findById(guideID),
//   );
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

tourSchema.post('save', function (doc, next) {
  // console.log(doc);
  next();
});

// regular expression to all the methods that starts with find

// this is Query middleware
// tourSchema.pre(/^find/, function (next) {
//   this;
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secreteTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  // console.log(doc);
  // console.log(
  //   `The time taken to execute this query is ${Date.now() - this.start}`,
  // );
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  // console.log(this.pipeline());
  this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

// const testTour = new Tour({
//   name: 'The Forest Hikers',
//   price: 599,
// });

// to save the instance to model
// testTour.save();
module.exports = Tour;
