const mongoose = require('mongoose');
const fs = require('fs');
// module that loads environment variables from a .env file into process.env
const dotEnv = require('dotenv');

//TOUR MODEL
const Tour = require('../../models/tourModel');

dotEnv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASEPASS);
// console.log(process.env);

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const importData = async function () {
  try {
    await Tour.create(tours);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

const deleteData = async function () {
  try {
    await Tour.deleteMany();
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();
