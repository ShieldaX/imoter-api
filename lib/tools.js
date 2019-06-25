/**
 * @file 自定义工具集
 * @author shieldax(shieldax@gmail.com)
 */

'use strict';
const requesto = require('request-promise');
const cheerio = require('cheerio');
// const url = require('url');
// const _ = require('underscore');

/**
 * 封装好的页面请求，默认用Cheerio预加载回文
 * @param  {String} url 待请求的目标链接
 * @return {Promise}     可执行的Request请求
 */
exports.getPage = function (url) {
  let options = {
    uri: url,
    transform: function(body){
      return cheerio.load(body);
    }
  };
  return requesto(options);
}

/**
 * 设置延迟时间，减少并发
 * @param  {Number} ms   等待毫秒数
 * @param  {Boolean} flag 是否在控制台显示等待讯息
 * @return {Promise}      待执行的时间延迟
 */
exports.wait = function (ms, flag) {
	if (flag) {
		console.log('waiting for '+ms+'ms');
	}
  return new Promise(resolve => {
      setTimeout(resolve, ms);
  });
}