//gallery.js

/**
 * Module dependencies.
 */
// var validator = require('validator');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const Moter = require('./moter');

//图集范式
const GallerySchema = new Schema({
  moter: {
    type: String,
    ref: 'Moter',
    autopopulate: {select: '_id name'}
  },
  photos: [{
    type: String
  }],
  //浏览量统计
  views: Number,
  //被收藏数目标记
  favorites: {
    type: Number,
    default: 0,
    min: 0
  },
  //创建时间
  created: {
    type: Date,
    default: Date.now
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

// 创建对应的链接
// GallerySchema.pre('save', true, function (next, done) {
//   // const url = this.link;

//   // console.log('链接：' + url);
//   Link.findOne({_id: url}, function (err, link) {
//     next(); // calling next kicks off the next middleware in parallel
//     if (err) { return done(err); };
//     // 系统未收录此链接，需要先创建此链接
//     if (null === link) {
//       console.log('系统未收录此链接，需要先创建此链接');
//       Link.createByURL(url, done);
//     // 链接已存在，直接保存该条目
//     } else {
//       console.log('链接已存在，直接保存该条目');
//       done();
//     }
//   });
// });

/**
 * Validators
 */
// ItemSchema.path('link').validate(function (link) {
//   return validator.isURL(link);
// }, 'Invalid URL format');

/**
 * Statics definition
 */
// find by query and populate
GallerySchema.statics.findByQuery = function (query, callback) {
  return this.find(query, callback)
}

// find by moter id
GallerySchema.statics.findByMoter = function (moter_id, callback) {
  return this.find({moters: moter_id}, callback);
};

/**
 * 删除id对应的图集
 * @param  {String}   id       图集ID
 * @param  {Function} callback 回调函数
 */
GallerySchema.statics.removeById = function (id, callback) {
  this.findOne({id: id}, function (err, item) {
    if (err) return callback(err);
    if (item) {
      // 删除找到的的条目
      item.remove(function(err) {
        if (err) return callback(err);
        // 成功删除
      });
    } else {
      callback(null, 'Gallery unexists');
    }
  });
};

/**
 * Methods
 */

// 资源所属的模特为组中最后一个的ID
GallerySchema.methods.resolve = function () {
  console.log(this.moter);
};

GallerySchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Gallery', GallerySchema);