//label.js

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//对标签进行分类
const categories = {
  values: 'profession region character aura nature band feature'.split(' '),
  message: 'enum validator failed for path `{PATH}` with value `{VALUE}`'
};

//标签分类模特范式
const LabelSchema = new Schema({
  _id: String,
  //美女的分类标签的名称
  name: {
    type: String,
    required: true
  },
  //对标签进行归类
  category: {
    type: String,
    enum: categories
  },
  //状态：上线online（默认）or 下线offline
  _online: {
    type: Boolean,
    default: true
  }
});

// 没有附属关联的文档，关闭versionKey控制
//[REF] https://aaronheckmann.tumblr.com/post/48943525537/mongoose-v3-part-1-versioning
// LabelSchema.set('versionKey', false);

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
LabelSchema.statics.removeByName = function (spec_name, callback) {
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

module.exports = mongoose.model('Label', LabelSchema);