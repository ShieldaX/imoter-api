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

var parseTag = (spec_options, tag) => {
  requesto(spec_options)
  .then(($) => {
    tag.desc = $('#ddesc').text();
    console.log(tag);
  })
  .catch((err) => {
    console.log(err);
  });
};

var parseTagList = (spec_options) => {
  var cur_host = url.parse(spec_options.uri).host;
  var types = 'country style body role publisher scene megazine'.split(' ');
  var tags = [];
  requesto(spec_options)
  .then(($) => {
    $('.tag_div').each((index, element) => {
      $(element).find('li a').each((i, el) => {
        var tag = {};
        tag.type = types[index];
        var href = $(el).attr('href')
        //reslove tag detail url
        var options = {uri: 'https://'+cur_host+href};
        options.transform = spec_options.transform // make a copy
        var tagId = href.split('/')[2];
        var tagName = $(el).text();
        tag.id = tagId;
        tag.name = tagName;
        tags.push(tag);
        parseTag(options, tag);
      });
    });
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    // console.log(tags);
  });
};

options.uri = 'https://www.nvshens.com/gallery/'
parseTagList(options);

module.exports.parseTag = parseTag;