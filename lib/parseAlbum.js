//parseAlbum.js
//解析nvshens.com形成结构化数据

const requesto = require('request-promise');
const cheerio = require('cheerio');
const url = require('url');
const _ = require('underscore');
const db = require('../models/db');
const Album = require('../models/album');

const moterRegex = /\/girl\/(\d+)/;
const galleryRegex = /\/gallery\/(\w*)/;
const albumRegex = /\/g\/(\d+)/;

const instUris = [
  'https://www.nvshens.com/girl/27139/', //元欣
  'https://www.nvshens.com/girl/19912/', //真东爱(中英文名)
  'https://www.nvshens.com/girl/26815/', //Ashley Resch(CUP)
  'https://www.nvshens.com/girl/22162/', //杨晨晨
  'https://www.nvshens.com/girl/27256/', //木木夕Mmx(缺资料)
  'https://www.nvshens.com/girl/27180/' //丸糯糯
];

const options = {
  transform: function (body) {
    return cheerio.load(body);
  }
};

options.uri = instUris[3];

const demo_album_uris = [
  'https://www.nvshens.com/girl/27256/', //木木夕Mmx(缺资料)
  'https://www.nvshens.com/g/30113/',
  'https://www.nvshens.com/g/29032' // 20765 尤果圈1月合集释放诱惑(合集)
];

const Delay_Time = function(ms) {
  return new Promise(function(resolve) {
      setTimeout(resolve, ms);
  } )
};

// options.uri = demo_album_uris[2];
//解析图集详情
const parseAlbum = async (spec_options, album_id) => {
  //resolve target page link
  let cur_host = url.parse(spec_options.uri).host;
  let options = {uri: 'https://'+cur_host+'/g/'+album_id};
  options.transform = spec_options.transform;
  console.log(options.uri);
  var album = { _id: album_id };
  // 到指定页面抓取图集信息
  await requesto(options)
    .then(($) => {
      //图集标题
      let title = $('h1#htilte').text();
      album.title = title;
      album.tags = [];
      album.moters = [];
      //图集的显式标签
      $('li', 'ul#utag').each(function(index, el) {
        let name=$(el).text();
        let href = $(el).find('a').attr('href');
        let _moter = href.match(moterRegex);
        if (_moter) {
          album.moters.push(_moter[1])
        }else{
          let _tag = href.match(galleryRegex);
          album.tags.push(_tag[1]);
        };
      });
      album.moters = _.union(album.moters);
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
      // console.log(album);
      // return album;
    })
    .catch((err) => {
      console.log(err);
    });
    // console.log(album);
  return album;
};
// parseAlbum(options);

const parseAlbums = async (spec_options, album_ids, interval) => {
  let finalalbum;
  if (album_ids.length>0) {
    try{
      // 使用await关键字确保每次抓完再抓列表中的下一个
      finalalbum = await parseAlbum(spec_options, album_ids[0]);
      // console.log(finalalbum);
      let album = await Album.create(finalalbum);
      console.log(album);
      // 从原始列表中取出已经解析完成的图集
      album_ids.splice(0, 1);
      // 设置间隔时间
      console.log('waiting for '+interval+'ms.')
      await Delay_Time(interval);
      // 继续抓取列表中剩余的图集
      return parseAlbums(spec_options, album_ids, interval);
    }catch(err){
      console.log(err);
    };
  } else {
    return console.log("All Done");
  };
};

// 获取指定模特的图集列表
const parseAlbumList = (spec_options, moter_id, interval, limit) => {
  var cur_host = url.parse(spec_options.uri).host;
  if (moter_id) { // URI overwrite by given moter_id
    spec_options.uri = 'https://'+cur_host+'/girl/'+moter_id;
    console.log('Url Overwrite To: '+spec_options.uri);
  };
  let album_ids = [];
  return requesto(spec_options)
    .then(($) => {
      //对于一些图集数量巨大的模特，先判断是否有专门的图解列表页
      let has_album_page = $('span.archive_more').text();
      if (has_album_page) {
        //然后改变页面调用自身继续解析
        let album_page_path = $('a', 'span.archive_more').attr('href');
        spec_options.uri = 'https://'+cur_host+album_page_path;
        // console.log('重定向至专门页: '+spec_options.uri);
        return parseAlbumList(spec_options);
      };
      let list_selector = '#post > div:nth-child(8) > div > div.post_entry > ul > li';
      let list_anchor = $('#post > div:nth-child(8) > div > div.box_entry_title > div').text();
      if (!list_anchor) {list_selector = '#photo_list > ul > li'}; //切换li标签选择器
      //源图集组
      $(list_selector).each(function(index, el) {
        let link=$('a', el).attr('href');
        album_ids.push(link.match(/\d+/)[0]);
      });
      // console.log(album_ids);
      // return album_ids;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      interval = interval || 5000;
      let typo = typeof(limit);
      if (limit) {
        if (typo=='number') {
          if (limit && limit>0) { album_ids = album_ids.splice(0, limit); };
        }else if (typo=='object') {
          album_ids = album_ids.splice(0, limit);
        };
      };
      console.log(album_ids);
      parseAlbums(spec_options, album_ids, interval)
    });
};

parseAlbumList(options);

module.exports.parseAlbum = parseAlbum;
module.exports.parseAlbumList = parseAlbumList;