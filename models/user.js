//user.js

/**
 * Module dependencies.
 */
const validator = require('validator');
const mongoose = require('mongoose');
const Schema = mongoose.Schema
// const passportLocalMongoose = require('passport-local-mongoose');

/**
 * 定义用户模式
 */
const UserSchema = new Schema({
  phone: {  //优先手机号注册
    type: String,
    // required: true,
    trim: true
  },
  email: {  //注册邮箱
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    // required: true,
  },
  password: {
    type: String,
    required: true
  },
  // 用户列表（数组嵌入）- Array of String
  following: [String], // 关注模特列表
  favorites: [String], // 收藏图集列表

  isVip: {  // VIP状态
    type: Boolean,
    default: false
  },
  //状态：上线online（默认）or 下线offline
  _online: {
    type: Boolean,
    default: true
  }
});

/* 对标签时进行排序
UserSchema.path('tags').set(function (tags) {
  return tags.sort();
});

UserSchema.path('tags').get(function (tags) {
  return tags.sort();
});

UserSchema.pre('save', function (next) {
  this.tags = this.tags.sort();
  next();
});
*/

/**
 * Validators
 */
UserSchema.path('email').validate(function(email) {
  let isEmail = validator.isEmail(email);
  return isEmail;
}, 'Invalid email format');

/**
 * Indexes
 */

/**
 * Middleware
 */

/**
 * Statics definition
 */

UserSchema.statics.findByEmail = function (email, callback) {
  return this.findOne({email: email}, callback);
};

/**
 * Methods definition
 */


/**
 * Plugins
 */

// Passport plugin
const passportOpts = {
  usernameField: 'email',
  selectFields: 'email'
};

// UserSchema.plugin(passportLocalMongoose, passportOpts);
// UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model('User', UserSchema);