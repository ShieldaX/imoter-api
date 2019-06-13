//parse.js
//解析nvshens.com形成结构化数据

var requesto = require('request-promise');
var cheerio = require('cheerio');
var url = require('url');

// default setting
var options = {
  transform: function (body) {
    return cheerio.load(body);
  }
};

var Delay_Time = function(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    } )
};

// 解析出TAG对应的详情介绍并返回结果(以备保存)
async function parseTag(spec_options, tag){
  //resolve target page link
  var cur_host = url.parse(spec_options.uri).host;
  var options = {uri: 'https://'+cur_host+'/gallery/'+tag.id};
  options.transform = spec_options.transform;
  // console.log(options.uri);
  await requesto(options)
  .then(($) => {
    tag.desc = $('#ddesc').text();
    // console.log(tag);
  })
  .catch((err) => {
    console.log(err);
  });
  return tag;
};

// 依次解析列表中的TAG任务
async function parseTags(spec_options, tags, interval){
  var finaltag;
  if (tags.length > 0) {
    try{
      // 使用await关键字确保每次抓完再抓列表中的下一个
      finaltag = await parseTag(spec_options, tags[0]);
      console.log(finaltag);
      // 从原始列表中取出已经解析完成的TAG
      tags.splice(0, 1);
      // 设置间隔时间
      await Delay_Time(interval);
      // 继续抓取列表中剩余的TAG
      parseTags(spec_options, tags, interval);
    }catch(err){
      console.log(err);
    };
  }else{
    return console.log("All Done");
  };
};

//一次性抓取所有TAG作为任务列表
var parseTagList = (spec_options, interval, limit) => {
  var types = 'country style body role publisher scene megazine'.split(' ');
  var tags = [];
  requesto(spec_options)
  .then(($) => {
    $('.tag_div').each((index, element) => {
      $(element).find('li a').each((i, el) => {
        var tag = {
          id: $(el).attr('href').split('/')[2],
          name: $(el).text(),
          type: types[index]
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
    // 抓取完成后(使用splice控制)抓取
    interval = interval || 5000;
    let typo = typeof(limit);
    if (limit) {
      if (typo=='number') {
        if (limit && limit>0) { tags = tags.splice(0, limit); };
      }else if (typo=='object') {
        tags = tags.splice(0, limit)
      };
    };
    console.log(tags);
    parseTags(spec_options, tags, interval);
  });
};

options.uri = 'https://www.nvshens.com/gallery/'
// parseTagList(options, 5000, 6);

module.exports.defaultOptions = options;
module.exports.parseTagList = parseTagList;