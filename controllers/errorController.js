const AppError = require('../utilities/appError');

const handleCastErrorDB = (err) =>
  // 400 is for bad request
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  // 400 is for bad request
  return new AppError(
    `Duplicate field value: ${value[0]}. Please use another value!`,
    400,
  );
};

const handleJwtError = () =>
  new AppError('Invalide token! Please try again!', 401);

const handleValidationErrorDB = (err) => {
  const message = Object.entries(err.errors)
    .map(([, val]) => val.properties.message)
    .join('. ');
  return new AppError(message, 400);
};

const handleJwtTimeExpiredError = () =>
  new AppError('Your token has expired! Please Login again!', 401);

// For development more descriptive error message
const handleDevelopmentError = function (err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// For production less descriptive error message
const handleProductionError = function (err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // 1) log error
    console.error('Error: ', err);

    // 2) send generic error message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    handleDevelopmentError(err, res);
  } else {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
    }

    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }

    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    }

    if (err.name === 'JsonWebTokenError') {
      error = handleJwtError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleJwtTimeExpiredError();
    }
    handleProductionError(error, res);
  }
};
