//user.js

/**
 * Module dependencies.
 */
var validator = require('validator');
var mongoose = require('mongoose');
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose');

/**
 * 定义用户模式
 */
var UserSchema = new Schema({
  // 注册邮箱
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  // 用户的标签列表（数组嵌入）- Array of String
  //tags: [String]
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
  var isEmail = validator.isEmail(email);
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
var passportOpts = {
  usernameField: 'email',
  selectFields: 'email'
};

// UserSchema.plugin(passportLocalMongoose, passportOpts);
UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model('User', UserSchema);