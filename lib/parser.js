//parse.js
//解析nvshens.com形成结构化数据

var requesto = require('request-promise');
var cheerio = require('cheerio');

var options = {
  uri: 'https://www.nvshens.com/girl/22162/',
  transform: function (body) {
    return cheerio.load(body);
  }
};

//解析模特主页
var parseMoter = function (spec_options) {
  //var selectIdReg = new RegExp('$');
  var moter = {
    id: spec_options.uri.match(/(\d+)/)[0],
  };
  requesto(spec_options)
    .then(($) => {
      //console.log($);
      var info = 'div.res_infobox';
      //源模特名字（组）
      moter.name = $('.div_h1', info).children('h1').text();
      console.log(moter.name);
      $('td.info_td', info).each(function(index, el) {
        var item=$(this).text();
        if (item == '年 龄：') {
          moter.age = $(this).next().text();
          console.log($(this).next().text());
        };
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

parseMoter(options)
