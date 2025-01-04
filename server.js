const mongoose = require('mongoose');

const dotEnv = require('dotenv');

dotEnv.config({ path: './config.env' });

const app = require('./app');

// console.log(app.get('env'));

// shows all the environment variable
// console.log(process.env);

const port = 2000;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASEPASS);
// console.log(process.env);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
// .then(() => {
//   console.log('database connected to application');
// });

// OUR NATOURS WILL FOLLOW MVC ARCHITECTURE (MODEL, VIEW, CONTROLLERS)
// MODEL : WHICH ARE RELATED TO BUSINESS IMPLEMENTATION
// CONTROLLERS : WHICH HANDLE THE CODE
// VIEW : INTERFACE FOR THE USER
