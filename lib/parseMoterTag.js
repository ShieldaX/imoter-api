//parseMoterLabel.js
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

// 解析出TAG对应的详情介绍并返回结果(以备保存)
async function parseMoterTag(spec_options, tag){
  //resolve target page link
  let cur_host = url.parse(spec_options.uri).host;
  let options = {uri: 'https://'+cur_host+'/tag/'+tag._id};
  options.transform = spec_options.transform;
  // console.log(options.uri);
  await requesto(options)
  .then(($) => {
    // tag.desc = $('#ddesc').text();
    let countxt = $('#post_rank > div:nth-child(5) > div > div.box_entry_title > div').text();
    console.log(countxt);
  })
  .catch((err) => {
    console.log(err);
  });
  return tag;
};

// 依次解析列表中的TAG任务
async function parseMoterTags(spec_options, tags, interval){
  let finaltag;
  if (tags.length > 0) {
    try{
      // 使用await关键字确保每次抓完再抓列表中的下一个
      finaltag = await parseMoterTag(spec_options, tags[0]);
      console.log(finaltag);
      // let tag = await Label.create(finaltag);
      // console.log(tag);
      // 从原始列表中取出已经解析完成的TAG
      tags.splice(0, 1);
      // 设置间隔时间
      await Delay_Time(interval);
      // 继续抓取列表中剩余的TAG
      return parseMoterTags(spec_options, tags, interval);
    }catch(err){
      console.log(err);
    };
  }else{
    return console.log("All Done");
  };
};

//一次性抓取所有TAG作为任务列表
const parseMoterTagList = (spec_options, interval, limit) => {
  let categories = 'profession region character aura nature band feature'.split(' ');
  let tags = [];
  requesto(spec_options)
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
    // console.log(tags);
    //使用limit控制抓取范围
    interval = interval || 5000;
    let typo = typeof(limit);
    if (limit) {
      if (typo=='number') {
        if (limit && limit>0) { tags = tags.splice(0, limit); };
      }else if (typo=='object') {
        tags = tags.splice(0, limit);
      };
    };
    console.log(tags);
    // return parseMoterTags(spec_options, tags, interval);
  });
};

options.uri = 'https://www.nvshens.com/tag/'
parseMoterTagList(options, 2000);

module.exports.defaultOptions = options;
module.exports.parseMoterTagList = parseMoterTagList;