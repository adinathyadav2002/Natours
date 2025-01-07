// review, rating , createdAt,ref to tour, ref to user

const mongoose = require('mongoose');

const reviewModel = new mongoose.Schema({
  review: {
    type: String,
  },
  rating: {
    type: Number,
    required: [true, 'A review must have a rating.'],
    min: [1, 'A review rating must be greater than 1.'],
    max: [5, 'A review rating must be less than 5.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = reviewModel;
