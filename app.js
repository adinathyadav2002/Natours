const express = require('express');
// http request logger
const morgan = require('morgan');

// sub-routers
const usersRouter = require('./routes/userRoutes');
const toursRouter = require('./routes/tourRoutes');

// error handling
const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// middleware is group of functions that will run in req and res cycle
// every middleware get the access of req, res, next
// middleware to parse incoming JSON data from the request body.
app.use(express.json());

// used to print req on console
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// custom middleware
// if middleware is defined after sending the response
// then it will not run so position of middleware in code important
app.use((req, res, next) => {
  console.log(req.headers);
  next(); // it is compulsory to call next
});

// app.get("/", (req, res) => {
//   res
//     .status(200)
//     .json({ message: "hello from the server side", name: "adinath" });
// });

// app.post("/", (req, res) => {
//   res.send("this is response from the root endpoint....");
// });

// ************************************************************
// refactoring code
// ************************************************************

// question mark is for optional id part
// app.get('/api/v1/tours/:id/:x/:y?', callbackfunction)
// We use put to modify all the data
// we use patch to modify some part of data

// app.get('/api/v1/tours/:id', getTourData);
// app.delete('/api/v1/tours/:id', deleteTourData);
// app.patch('/api/v1/tours/:id', modifyTourData);

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

// TODO: to handle all the url which do not match upside url's
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 404,
  //   message: `Can't fetch ${req.originalUrl}`,
  // });
  // next();

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);

  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Express automatically recognizes middleware with four parameters (err, req, res, next) as an error handler.
// This middleware will be triggered whenever next(err) is called, either explicitly or implicitly by Express.
app.use(globalErrorHandler);

module.exports = app;
