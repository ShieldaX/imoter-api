//parseTag.js
//解析nvshens.com形成结构化数据

const requesto = require('request-promise');
const cheerio = require('cheerio');
const url = require('url');
const Tag = require('../models/tag');
const db = require('../models/db');

// default setting
const options = {
  transform: function (body) {
    return cheerio.load(body);
  }
};

const Delay_Time = function(ms) {
  return new Promise(function(resolve) {
      setTimeout(resolve, ms);
  } )
};

const HOST_URI = 'https://www.nvshens.net';

// 解析出TAG对应的详情介绍并返回结果
async function parseTag(
  opts = {uri: HOST_URI, transform: options.transform},
  tag) {
  //resolve target page link
  opts.uri = `${opts.uri}/gallery/${tag._id}`;
  // console.log(options.uri);
  await requesto(opts)
  .then(($) => {
    tag.desc = $('#ddesc').text();
  })
  .catch((err) => {
    console.log(err);
  });
  return tag;
};

// 依次解析列表中的TAG任务
async function parseTags(opts, tags, interval) {
  let finalTag;
  if (tags.length > 0) {
    try{
      // 使用await关键字确保每次抓完再抓列表中的下一个
      finalTag = await parseTag(opts, tags[0]);
      console.log(finalTag);
      let tag = await Tag.create(finalTag);
      // console.log(tag);
      // 从原始列表中取出已经解析完成的TAG
      tags.splice(0, 1);
      // 延迟时间
      await Delay_Time(interval);
      // 继续抓取列表中剩余的TAG
      return parseTags(opts, tags, interval);
    }catch(err){
      console.log(err);
    };
  }else{
    return console.log("All Tags Done");
  };
};

//抓取(所有)TAG作为任务列表
const getTagList = (opts, interval=5000, limit) => {
  let categories = 'region style body role publisher scene magazine'.split(' ');
  let tags = [];
  requesto(opts)
  .then(($) => {
    $('.tag_div').each((index, element) => {
      $(element).find('li a').each((i, el) => {
        let tag = {
          _id: $(el).attr('href').split('/')[2],
          name: $(el).text(),
          category: categories[index]
        };
        tags.push(tag);
      });
    });
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    if (limit) { //使用limit控制抓取范围
      let typo = typeof(limit);
      if (typo=='number') {
        if (limit && limit>0) { tags = tags.splice(0, limit); };
      }else if (typo=='object') {
        tags = tags.splice(limit[0], limit[1]);
      };
    };
    console.log(tags);
    return parseTags(opts, tags, interval);
  });
};

options.uri = 'https://www.nvshens.net/gallery/'
// getTagList(options, 5000);

module.exports.defaultOpts = options;
module.exports.getTagList = getTagList;