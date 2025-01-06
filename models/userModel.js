const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please Enter Your name.'],
    unique: true,
    trim: true,
    validate: [validator.isAlpha, 'User name must only contain characters'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    require: [true, 'Please enter your mail.'],
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'Please enter password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please confirm your password!'],
    // this will check on CREATE or SAVE of document
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  //sometime jwt toke exicutes first and passwordChangeAt take
  // time to save in database
  // our validator will not validate this case if jwt is created before
  // password change so we subtract 1sec
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function (next) {
  // if password is not changed then just return
  if (!this.isModified('password')) return next();

  // encrypt the password with salt of 12 (salt dpt strenth of encription)
  this.password = await bcrypt.hash(this.password, 12);

  // delete passwordConfirm from fields
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.checkCorrectPassword = async function (
  candidatePassword,
  userpassword,
) {
  return await bcrypt.compare(candidatePassword, userpassword);
};

userSchema.methods.checkPasswordChanged = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// query middleware to hide non-active accounts
userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
