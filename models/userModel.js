const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter Your name.'],
    unique: true,
    trim: true,
    validate: {
      validator: function (val) {
        return !val.split('').some((letter) => {
          if (
            (letter >= 'A' && letter <= 'Z') ||
            (letter >= 'a' && letter <= 'z') ||
            letter === ' '
          )
            return false;
          return true;
        });
      },
      message: 'User name must only contain characters',
    },
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Please enter your mail.'],
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please enter password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
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

  // sometime jwt token exicutes first and passwordChangeAt take
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
  // higher the value of salt more will the security and speed will be slow
  // Salt Rounds	Security	        Speed
  // 8	          Low	              Fast
  // 10	          Medium	          Moderate
  // 12	          High	            Slower but secure
  // 14+	        Very High	        Very slow
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
    // convert it into minutes
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// instance method
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
