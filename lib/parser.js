//parse.js
//解析nvshens.com形成结构化数据

var requesto = require('request-promise');
var cheerio = require('cheerio');
var url = require('url');

instUris = [
  'https://www.nvshens.com/girl/27139/', //元欣
  'https://www.nvshens.com/girl/19912/', //真东爱(中英文名)
  'https://www.nvshens.com/girl/26815/', //Ashley Resch(CUP)
  'https://www.nvshens.com/girl/22162/', //杨晨晨
  'https://www.nvshens.com/girl/27256/', //木木夕Mmx(缺资料)
  'https://www.nvshens.com/girl/27180/' //丸糯糯
];

var options = {
  transform: function (body) {
    return cheerio.load(body);
  }
};

options.uri = instUris[3];

//解析模特主页
var parseMoter = function (spec_options) {
  // 初始化模特实例
  var moter = { id: spec_options.uri.match(/(\d+)/)[0] };
  // 到指定页面抓取模特信息
  requesto(spec_options)
    .then(($) => {
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
      return moter;
    })
    .catch((err) => {
      console.log(err);
    });
};
// parseMoter(options)

var demo_album_uris = [
  'https://www.nvshens.com/girl/27256/', //木木夕Mmx(缺资料)
  'https://www.nvshens.com/g/30113/'
];

// options.uri = demo_album_uris[1];
//https://www.nvshens.com/g/30113/
//解析图集详情
var parseAlbum = function (spec_options) {
  var id = spec_options.uri.match(/\/g\/(\d+)/);
  // var album = { id: id[0] };
  if (id) {
    var album = { id: id[1] };
  } else {
    // console.log('不是正确的图集URI');
    throw new Error('Invalid Album URI: without album id');
    return;
  };
  // 到指定页面抓取图集信息
  requesto(spec_options)
    .then(($) => {
      //图集标题
      let title = $('h1#htilte').text();
      album.title = title;
      album.tags = [];
      //图集的显式标签
      $('li', 'ul#utag').each(function(index, el) {
        let tag=$(el).text();
        album.tags.push(tag);
      });
      //图集简介expert/bio
      album.excerpt = $('#ddesc').text();
      //创建情况
      let create_info = $('#dinfo').text();
      //创建时间
      album.created = new Date(create_info.match(/\d{4}\/\d+\/\d+/)[0]);
      //图片数量
      album.pieces = Number(create_info.match(/包含(\d+)张照片/)[1]);
      //浏览量
      album.views = Number(create_info.match(/被浏览了\s?(\d+)\s?次/)[1]);
      console.log(album);
      return album;
    })
    .catch((err) => {
      console.log(err);
    });
};
// parseAlbum(options);

// 获取指定模特的图集列表
var parse_albumlist_of_moter = function(spec_options, moterid) {
  var cur_host = url.parse(spec_options.uri).host;
  if (moterid) { // URI overwrite by given moterid
    spec_options.uri = 'https://'+cur_host+'/girl/'+moterid;
    console.log('Url Overwrite To: '+spec_options.uri);
  };
  requesto(spec_options)
    .then(($) => {
      //对于一些图集数量巨大的模特，先判断是否有专门的图解列表页
      let has_album_page = $('span.archive_more').text();
      if (has_album_page) {
        //然后改变页面调用自身继续解析
        let album_page_path = $('a', 'span.archive_more').attr('href');
        spec_options.uri = 'https://'+cur_host+album_page_path;
        // console.log('重定向至专门页: '+spec_options.uri);
        return parse_albumlist_of_moter(spec_options);
      };
      let albumlist = [];
      let list_selector = '#post > div:nth-child(8) > div > div.post_entry > ul > li';
      let list_anchor = $('#post > div:nth-child(8) > div > div.box_entry_title > div').text();
      if (!list_anchor) {list_selector = '#photo_list > ul > li'}; //切换li标签选择器
      //源图集组
      $(list_selector).each(function(index, el) {
        let link=$('a', el).attr('href');
        albumlist.push(link.match(/\d+/)[0]);
      });
      console.log(albumlist);
      return albumlist;
    })
    .catch((err) => {
      console.log(err);
    });
};
// parse_albumlist_of_moter(options);

module.exports.parseMoter = parseMoter;
module.exports.parseAlbum = parseAlbum;
// module.exports.parseAlbumList = parseAlbumList;