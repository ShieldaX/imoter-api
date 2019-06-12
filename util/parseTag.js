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

var parseTag = (spec_options, tags) => {
  tag = tags[0];
  //resolve target page link
  var cur_host = url.parse(spec_options.uri).host;
  var options = {uri: 'https://'+cur_host+'/gallery/'+tag.id};
  options.transform = spec_options.transform;
  // console.log(options.uri);
  requesto(options)
  .then(($) => {
    tag.desc = $('#ddesc').text();
    // console.log(tag);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    return tag;
  });
};

async function parseTags(spec_options, tags){
  let finaltag;
  try{
    finaltag = await parseTag(spec_options, tags);
  }catch(err){
    console.log(err);
  };
  tags = tags.splice(0, 1);
  console.log(tags);
  if (tags.length > 0) {
    // return parseTags(spec_options, tags);
  }else{
    return "all done"
  };
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
        var tagId = href.split('/')[2];
        var tagName = $(el).text();
        tag.id = tagId;
        tag.name = tagName;
        tags.push(tag);
      });
    });
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    console.log(tags);
    parseTags(spec_options, tags);
  });
};

options.uri = 'https://www.nvshens.com/gallery/'
parseTagList(options);

module.exports.parseTag = parseTag;