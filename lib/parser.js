//parse.js
//解析nvshens.com形成结构化数据

var requesto = require('request-promise');
var cheerio = require('cheerio');

instUris = [
  'https://www.nvshens.com/girl/27139/', //元欣
  'https://www.nvshens.com/girl/19912/', //真东爱(中英文名)
  'https://www.nvshens.com/girl/26815/', //Ashley Resch(CUP)
  'https://www.nvshens.com/girl/22162/', //杨晨晨
  'https://www.nvshens.com/girl/27256/' //木木夕Mmx(缺资料)
];

var options = {
  uri: instUris[3],
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
      if (name[1]) {moter.cnname = name[1]};
      if (name[2]) {moter.enname = name[2]};
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
            //[REF] http://englishnotes.lofter.com/post/1a46c8_155ba94
            // http://tools.jb51.net/regex/create_reg
            var cup = value.match(/\(([A-K])/);
            if (cup) {moter.cup = cup[1]};
            var measureStr = value.replace(/\([A-K]+\)/, '');
            var measureG = measureStr.match(/B(?<bust>\d+)\sW(?<waist>\d+)\sH(?<hips>\d+)/).groups;
            moter.measure = {};
            moter.measure.bust = Number(measureG.bust);
            moter.measure.waist = Number(measureG.waist);
            moter.measure.hips = Number(measureG.hips);
            // console.log(measure);
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

parseMoter(options)

module.exports.parseMoter = parseMoter;