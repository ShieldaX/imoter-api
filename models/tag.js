//tag.js

/**
 * Module dependencies.
 */
var validator = require('validator');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//对标签进行分类
var types = {
  values: 'beauty country style publisher body megazine scene role'.split(' '),
  message: 'enum validator failed for path `{PATH}` with value `{VALUE}`'
};

//标签分类图源范式
var TagSchema = new Schema({
  //专辑的分类标签名称发布专辑的出版商、平台或者原始图源的名称
  name: {
    type: String,
    required: true
  },
  //发行商、图源或标签的文字简介
  desc: {
    type: String
  },
  //对标签进行分类，发布专辑的出版商、平台或者原始图源等
  type: {
    type: String,
    enum: types,
    default: 'beauty'
  },
  //特殊标签二级分类
  belongs: {
    type: String
  },
  // 创建时间
  created: {
    type: Date,
    default: Date.now,
    select: false
  },
  // 更新时间
  updated: {
    type: Date,
    default: Date.now,
    select: false
  },
    //状态：上线online（默认）or 下线offline
  online: {
    type: Boolean,
    default: 'true'
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
 * Statics definition
 */

/**
 * 删除name对应的条目
 * @param  {String}   spec_name       条目名称
 * @param  {Function} callback 回调函数
 */
TagSchema.statics.removeByName = function (spec_name, callback) {
  this.findOne({name: spec_name}, function (err, item) {
    if (err) return callback(err);
    if (item) {
      // 删除找到的的条目
      item.remove(function(err) {
        if (err) return callback(err);
        // 成功删除
      });
    } else {
      callback(null, 'tag unexists');
    }
  });
};

/**
 * Methods 定义实例方法
 */


module.exports = mongoose.model('Tag', TagSchema);