//album.js

/**
 * Module dependencies.
 */
// var validator = require('validator');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const Moter = require('./moter');

//图集范式
const AlbumSchema = new Schema({
  //图源提供的索引
  _id: {
    type: String,
    // unique: true
  },
  //标题
  title: String,
  //简述
  excerpt: String,
  //将资源站的模特索引保证存储在模特数组第一索引位置
  moters: [{
    type: String,
    ref: 'Moter',
    autopopulate: {select: '_id name'}
  }],
  //该图集包含的图片数量
  pieces: Number,
  //标签列表（数组嵌入）
  tags: [{
    type: String,
    ref: 'Tag',
    autopopulate: {select: '_id name'}
  }],
  //浏览量统计
  views: Number,
  //被收藏数目标记
  favorites: {
    type: Number,
    default: 0,
    min: 0,
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
// AlbumSchema.pre('save', true, function (next, done) {
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
AlbumSchema.statics.findByQuery = function (query, callback) {
  return this.find(query, callback)
}

AlbumSchema.statics.findByTitle = function (title, callback) {
  return this.findOne({title: title}, callback)
};

AlbumSchema.statics.findByTag = function (tag, callback) {
  return this.find({tags: tag}, callback)
};

// find by moter id
AlbumSchema.statics.findByMoter = function (moter_id, callback) {
  return this.find({moters: moter_id}, callback);
};

/**
 * 删除id对应的图集
 * @param  {String}   id       图集ID
 * @param  {Function} callback 回调函数
 */
AlbumSchema.statics.removeById = function (id, callback) {
  this.findOne({id: id}, function (err, item) {
    if (err) return callback(err);
    if (item) {
      // 删除找到的的条目
      item.remove(function(err) {
        if (err) return callback(err);
        // 成功删除
      });
    } else {
      callback(null, 'album unexists');
    }
  });
};

/**
 * Methods
 */

// 添加标签
AlbumSchema.methods.addTags = function (tags) {
  tags.forEach(function (tag) {
    this.tags.push(tag);
  });
  this.tags.sort(); // sort alphabetically
};

// 资源所属的模特为组中最后一个的ID
AlbumSchema.methods.resolve = function () {
  console.log(this.moters.last());
};


AlbumSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Album', AlbumSchema);