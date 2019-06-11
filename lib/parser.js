//parse.js
//解析nvshens.com形成结构化数据

var requesto = require('request-promise');
var cheerio = require('cheerio');

var options = {
  uri: 'https://www.nvshens.com/girl/27139/',
  // uri: 'https://www.nvshens.com/girl/19912/',
  transform: function (body) {
    return cheerio.load(body);
  }
};

//解析模特主页
var parseMoter = function (spec_options) {
  var moter = {
    id: spec_options.uri.match(/(\d+)/)[0],
  };
  requesto(spec_options)
    .then(($) => {
      //console.log($);
      var info = 'div.res_infobox';
      //源模特名字（组）
      var name = $('.div_h1', info).children('h1').text();
      name = name.replace(')', '').replace(', ', '(').split('('); //转译为name数组
      moter.name = name[0];
      // if (name[1]) {moter.cnname = name[1]};
      // if (name[2]) {moter.enname = name[2]};
      //var tableRegex = /?<birthday>(\d{4}-\d{2}-\d{2})/
      $('td.info_td', info).each(function(index, el) {
        var index=$(this).text(); //中文索引
        var value = $(this).next().text(); //字符串形式的值
        switch (index){
          case '别 名：':
            moter.alias = value;
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
            moter.measure = value;
            break;
          case '出 生：':
            var birth = value.split(/\s/);
            moter.country = birth[0];
            moter.birthplace = birth[1];
            break;
          case '职 业：':
            moter.career = value.split('、');
          case '兴 趣：':
            moter.hobbies = value.split('、');
        };
      });

      //抓取简介expert/bio
      moter.excerpt = $('div.infocontent').find('p').text();
      // var possibleFields = ['别名','生日','血型','身高','体重','三围','出生','职业','兴趣'];
      //抓取打分情况
      moter.score = {
        num: Number($('#span_score').text()),
        votes: Number($('#lbl_score').text())
      };
      console.log(moter);
    })
    .catch((err) => {
      console.log(err);
    });
};

//parseMoter(options)

module.exports.parseMoter = parseMoter;