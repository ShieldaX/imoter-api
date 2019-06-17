//parseLabel.js
//解析nvshens.com形成结构化数据

const requesto = require('request-promise');
const cheerio = require('cheerio');
const url = require('url');
const _ = require('underscore');
const Label = require('../models/label');
// const db = require('../models/db');

const moterRegex = /\/girl\/(\d+)/;
const galleryRegex = /\/gallery\/(\w*)/;
const albumRegex = /\/g\/(\d+)/;

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


// 解析出Label对应的详情介绍并返回结果(以备保存)
async function parseLabel(spec_options, tag){
  //resolve target page link
  let cur_host = url.parse(spec_options.uri).host;
  let options = {uri: 'https://'+cur_host+'/tag/'+tag._id};
  options.transform = spec_options.transform;
  // console.log(options.uri);
  let count, page_num;
  return requesto(options)
  .then(($) => {
    // tag.desc = $('#ddesc').text();
    let countxt = $('#post_rank > div:nth-child(5) > div > div.box_entry_title > div').text();
    count = Number(countxt.match(/\((\d+)位\)/)[1]);
    console.log(count);
    // return count;
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(()=>{
    page_num = Math.ceil(count/20);
    console.log(tag._id+' 共计'+page_num+'页');
    let uri = options.uri;
    _.times(page_num, async (n)=> {
      n = n+1;
      let _options = {uri: uri+((n>1) ? '/'+n+'.html' : '')};
      _options.transform = spec_options.transform;
      // uri = _options.uri+((n>1) ? '/'+n+'.html' : '');
      console.log(_options.uri);
      requesto(_options)
      .then(($)=>{
        let moter_id = $('#listdiv').find('li.beautyli a').attr('href').match(moterRegex)[1];
        console.log(moter_id);
      });
    });
  });
  // return tag;
};

// 依次解析任务列表中的Label
async function parseLabels(spec_options, tags, interval){
  let finaltag;
  if (tags.length > 0) {
    try{
      // 使用await关键字确保每次抓完再抓列表中的下一个
      finaltag = await parseLabel(spec_options, tags[0]);
      // console.log(finaltag);
      // let tag = await Label.create(finaltag);
      // console.log(tag);
      // 从原始列表中取出已经解析完成的Label
      tags.splice(0, 1);
      // 设置间隔时间
      await Delay_Time(interval);
      // 继续抓取列表中剩余的Label
      return parseLabels(spec_options, tags, interval);
    }catch(err){
      console.log(err);
    };
  }else{
    return console.log("All Done");
  };
};

//一次性抓取所有TAG作为总的任务列表
const parseLabelList = (spec_options, interval, limit) => {
  // 分类
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
    //分派解析任务
    console.log(tags);
    parseLabels(spec_options, tags, interval);
  });
};

options.uri = 'https://www.nvshens.com/tag/'
parseLabelList(options, 5000);

module.exports.defaultOptions = options;
module.exports.parseLabelList = parseLabelList;