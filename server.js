const mongoose = require('mongoose');

const dotEnv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotEnv.config({ path: './config.env' });

const app = require('./app');

// console.log(app.get('env'));

// shows all the environment variable
// console.log(process.env);

const port = 2000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASEPASS);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// .then(() => {
//   console.log('database connected to application');
// });

// OUR NATOURS WILL FOLLOW MVC ARCHITECTURE (MODEL, VIEW, CONTROLLERS)
// MODEL : WHICH ARE RELATED TO BUSINESS IMPLEMENTATION
// CONTROLLERS : WHICH HANDLE THE CODE
// VIEW : INTERFACE FOR THE USER
