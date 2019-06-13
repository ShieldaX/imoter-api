//moter.js

/**
 * Module dependencies.
 */
// const validator = require('validator');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema define.
 */
//模特范式
const MoterSchema = new Schema({
  //记录来自图源的编号
  id: {
    type: String,
    unique: true
  },
  //模特信息
  //名字
  name: {
    type: String,
    require: true
  },
  names: {
    alias: String,
    cn: String,
    en: String
  },
  //生日
  birthday: Date,
  //血型
  blood: String,
  //身材
  height: Number,
  weight: Number,
  measure: {
    bust: Number,
    waist: Number,
    hips: Number
  },
  cup: String,
  country: String,
  birthplace: String,
  career: [String],
  hobbies: [String],
  //评分统计
  scores: {
    count: Number,
    votes: Number
  },
  //简介
  bio: String,
  //被关注数目标记(热度)
  follows: {
    type: Number,
    default: 0，
    min: 0,
  },
  //出道
  debuted: Date,
  //引退
  retired: Date,
  //创建时间
  created: {
    type: Date,
    default: Date.now
    select: false
  },
  //更新时间
  updated: {
    type: Date,
    default: Date.now,
    select: false
  },
  //状态：上线online（默认）or 下线offline
  _online: {
    type: Boolean,
    default: true
  }
});


/**
 * Middlewares
 */

// ItemSchema.pre('save', function (next) {
//   this.updated = Date.now();
//   next();
// });


/**
 * Validators
 */

/**
 * Virtuals
 */

//年龄
// MoterSchema.virtual('age').get(function () {
//   let year = this.birth.year;
//   let age = 2019 - year;
//   return age;
// });


/**
 * Statics definition
 */

/**
 * 删除id对应的模特
 * @param  {String}   id       模特ID
 * @param  {Function} callback 回调函数
 */
MoterSchema.statics.removeById = function (id, callback) {
  this.findOne({id: id}, function (err, item) {
    if (err) return callback(err);
    if (item) {
      // 删除找到的的条目
      item.remove(function(err) {
        if (err) return callback(err);
        // 成功删除
      });
    } else {
      callback(null, 'moter unexists');
    }
  });
};

/**
 * Methods
 */


module.exports = mongoose.model('Moter', MoterSchema);