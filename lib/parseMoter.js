//parseMoter.js
//解析nvshens.com形成结构化数据

const requesto = require('request-promise');
const cheerio = require('cheerio');
const url = require('url');
const Moter = require('../models/moter');
const db = require('../models/db');

const instUris = [
  'https://www.nvshens.com/girl/27139/', //元欣
  'https://www.nvshens.com/girl/19912/', //真东爱(中英文名)
  'https://www.nvshens.com/girl/26815/', //Ashley Resch(CUP)
  'https://www.nvshens.com/girl/22162/', //杨晨晨
  'https://www.nvshens.com/girl/27256/', //木木夕Mmx(缺资料)
  'https://www.nvshens.com/girl/27180/', //丸糯糯
  'https://www.nvshens.com/girl/17516/', //末永みゆ(只有一个图集的)
  'https://www.nvshens.com/girl/17565/' //曾莉婷(只有一个图集的)
];

const options = {
  transform: function (body) {
    return cheerio.load(body);
  }
};

options.uri = instUris[5];

//解析模特主页
const parseMoter = function (spec_options) {
  // 初始化模特实例
  let moter = new Moter({_id: spec_options.uri.match(/(\d+)/)[0]});
  var moter = {_id: spec_options.uri.match(/(\d+)/)[0]};
  // 到指定页面抓取模特信息
  requesto(spec_options)
    .then(async ($) => {
      let info = 'div.res_infobox';
      //模特名字（组）
      let name = $('.div_h1', info).children('h1').text();
      name = name.replace(')', '').replace(', ', '(').split('('); //转译为name数组
      moter.name = name[0];
      moter.names = {};
      if (name[1]) {moter.names.cn = name[1]};
      if (name[2]) {moter.names.en = name[2]};
      //模特信息(依次对应提取每一条信息并暂存)
      // let possibleFields = ['别名','生日','血型','身高','体重','三围','出生','职业','兴趣'];
      $('td.info_td', info).each(function(index, element) {
        let field = $(element).text(); //中文索引
        let value = $(element).next().text(); //字符串形式的值
        switch (field){
          case '别 名：':
            moter.names.alias = value;
            break;
          case '生 日：':
            moter.birthday = new Date(value);
            break;
          case '血 型：':
            moter.blood = value;
            break;
          case '身 高：':
            moter.height = Number(value);
            break;
          case '体 重：':
            moter.weight = Number(value.match(/(\d+)\sKG$/)[1]);
            break;
          case '三 围：':
            //[REF] http://englishnotes.lofter.com/post/1a46c8_155ba94
            // http://tools.jb51.net/regex/create_reg
            let cup = value.match(/\(([A-K])/);
            if (cup) {moter.cup = cup[1]};
            let measureStr = value.replace(/\([A-K]+\)/, '');
            let measureG = measureStr.match(/B(?<bust>\d+)\sW(?<waist>\d+)\sH(?<hips>\d+)/).groups;
            moter.measure = {};
            moter.measure.bust = Number(measureG.bust);
            moter.measure.waist = Number(measureG.waist);
            moter.measure.hips = Number(measureG.hips);
            break;
          case '出 生：':
            let birthInfo = value.split(/\s/);
            moter.country = birthInfo[0];
            moter.birthplace = birthInfo[1];
            break;
          case '职 业：':
            moter.career = value.split('、');
          case '兴 趣：':
            moter.hobbies = value.split('、');
        };
      });

      //模特简介expert/bio
      moter.bio = $('div.infocontent').find('p').text();
      //模特打分情况
      moter.score = {
        count: Number($('#span_score').text()),
        votes: Number($('#lbl_score').text())
      };
      console.log(moter);
      let _moter = await Moter.create(moter);
      console.log(_moter);
      return _moter;
    })
    .catch((err) => {
      console.log(err);
    });
};
parseMoter(options)

module.exports.parseMoter = parseMoter;