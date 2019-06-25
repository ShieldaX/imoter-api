/**
 * @file 标签化麻豆形成结构化数据
 * @author shieldax(shieldax@gmail.com)
 */

const requesto = require('request-promise');
const cheerio = require('cheerio');
const url = require('url');

const db = require('../models/db');
const Label = require('../models/label');

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

async function parsePage(spec_options, label, page_num) {
  console.log(spec_options.uri);
  await requesto(spec_options)
    .then(($)=>{
      $('#listdiv').find('li.beautyli strong a').each((index, element) => {
        let moter = $(element).attr('href').split('/')[2];
        label.moters.push(moter);
      });
    });
  // console.log(label.moters.length);
  // return page_num;
};

async function parsePages(spec_options, label, page_num) {
  let finalLabel;
  let target_page_num = Math.ceil(label.moters.length/20)+1;
  if (target_page_num <= page_num) {
    try{
      //resolve target page link
      let cur_host = url.parse(spec_options.uri).host;
      let options = {uri: 'https://'+cur_host+'/tag/'+label._id+((target_page_num>1) ? '/'+target_page_num+'.html' : '')};
      options.transform = spec_options.transform;
      options.timeout = 10000;
      let interval = 2000;
      console.log("Delay Time "+interval);
      // 使用await关键字确保每次抓完再抓列表中的下一个
      finalLabel = await parsePage(options, label, page_num);
      // 设置间隔时间
      await Delay_Time(interval);
      // 继续抓取列表中剩余的Label
      return parsePages(options, label, page_num);
    }catch(err){
      console.log(err);
    };
  }else{
    // console.log(label.moters.length);
    let _label = await Label.create(label);
    console.log(_label);
    return console.log("Label Pages All Done");
  };
};

// 解析出TAG对应的详情介绍并返回结果(以备保存)
async function parseTag(spec_options, label){
  //resolve target page link
  let cur_host = url.parse(spec_options.uri).host;
  let options = {uri: 'https://'+cur_host+'/tag/'+label._id};
  options.transform = spec_options.transform;
  options.timeout = 10000;
  label.moters = [];
  await requesto(options)
  .then(async ($) => {
    let count_text = $('#post_rank > div:nth-child(5) > div > div.box_entry_title > div').text();
    let count = Number(count_text.match(/\((\d+)位\)/)[1]);
    let page_num = Math.ceil(count/20);
    console.log(label._id+' 共计'+page_num+'页');
    await parsePages(options, label, page_num);
  })
  .catch((err) => {
    console.log(err);
  });
  return label;
};

// 依次解析列表中的TAG任务
async function parseTags(spec_options, tags, interval){
  let finalLabel;
  if (tags.length > 0) {
    try{
      // 使用await关键字确保每次抓完再抓列表中的下一个
      finalLabel = await parseTag(spec_options, tags[0]);
      console.log(finalLabel);
      // let tag = await Tag.create(finalLabel);
      // console.log(tag);
      // 从原始列表中取出已经解析完成的TAG
      tags.splice(0, 1);
      // 设置间隔时间
      await Delay_Time(interval);
      // 继续抓取列表中剩余的TAG
      return parseTags(spec_options, tags, interval);
    }catch(err){
      console.log(err);
    };
  }else{
    return console.log("All Labels Done");
  };
};

//一次性抓取所有TAG作为任务列表
const parseTagList = (spec_options, interval, limit) => {
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
    console.log(tags);
    return parseTags(spec_options, tags, interval);
  });
};

options.uri = 'https://www.nvshens.net/tag/'
parseTagList(options, 5000);