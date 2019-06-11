//link.js
var url = require('url');
var read = require('../lib/capture').read;
var mongoose = require('mongoose');

// 链接模式
var LinkSchema = new mongoose.Schema({
  // 原始链接地址
  _id: {
    type: String,
    trim: true,
    required: true
  },
  // 标题
  title: String,
  // 摘要文字
  excerpt: String,
  // 缩略图URL
  thumb: String
  // TODO: 关键字、推荐标签
});

/**
 * Statics definition
 */

LinkSchema.static('createByURL', function (link, done) {
  console.log('创建链接：' + link);
  var Link = this; // Link model
  // Async task to gather link meta data
  var readOptions = {
    //overrideCharset: 'GBK',
    //disableEncoding: true
  };
  read(link, readOptions, function (err, data) {
    if (err) return done(err);
    Link.create( // 链接实例
      {
        _id: link,
        title: data.title,
        excerpt: data.description
      },
      function(error, link) {
        if (error) return done(error);
        console.log('链接 ' + link._id + ' 已创建。');
        done();
      }
    );
  });
});

/**
 * Virtual
 */

// Domain
LinkSchema.virtual('hostname').get(function () {
  var hostname = url.parse(this._id).hostname;
  // 默认去除wwww
  var levels = hostname.split('.');
  if (levels.length > 2 && levels[0] == 'www') {
    levels.shift();
    hostname = levels.join('.');
  }
  return hostname;
});

LinkSchema.virtual('favicon').get(function () {
  var parsed = url.parse(this._id);
  var domain = parsed.protocol + '//' + parsed.host;
  // 使用外部服务生成favicon地址
  return 'http://statics.dnspod.cn/proxy_favicon/_/favicon?domain=' + domain;
  //return 'http://g.etfv.co/' + domain + '?defaulticon=lightpng';
});

// URL alias
LinkSchema.virtual('url').get(function () {
  return this._id;
});

LinkSchema.set('toJSON', {virtuals: true});
LinkSchema.set('toObject', {virtuals: true});

module.exports = mongoose.model('Link', LinkSchema);
