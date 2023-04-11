const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const saltRounds = 10;

var jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    maxlength: 500,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else next();
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), "secretToken");
  user.token = token;
  user.save().then((user, err) => {
    if (err) return cb(null, err);
    cb(user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;
  jwt.verify(token, "secretToken", function (err, decoded) {
    user
      .findOne({ _id: decoded, token: token })
      .then((user) => {
        if (user) return cb(null, user);
      })
      .catch((err) => {
        if (err) return cb(err);
      });
  });
};
const User = mongoose.model("User", userSchema);

module.exports = { User };
