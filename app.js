const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
// const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

const hpp = require('hpp');

// sub-routers
const viewRouter = require('./routes/viewRoutes');
const usersRouter = require('./routes/userRoutes');
const toursRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// error handling
const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());
// middleware is group of functions that will run in req and res cycle
// every middleware get the access of req, res, next
// middleware to parse incoming JSON data from the request body.
// BODY PARSER
app.use(express.json({ limit: '10kb' }));
// COOKIE PARSER so we can use (req.cookie.jwt) because req.header.cookies is string
app.use(cookieParser());
// FORM ELEMENT VALUES PARSER
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NOSQL query injection "email": { $gt : ""}
app.use(mongoSanitize());
// Data sanitization against XSS (unwanted html in form)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'difficulty',
      'prize',
    ],
  }),
);

// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!',
//   keyGenerator: (req) => req.ip,
//   proxy: true,
// });

// app.use('/api', limiter);

app.use(compression());

// used to print req on console
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// custom middleware
// if middleware is defined after sending the response
// then it will not run so position of middleware in code important
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://cdnjs.cloudflare.com;",
  );
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

app.use('/', viewRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);

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
