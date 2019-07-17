/**
 * @file 以图集为起点同时解析其麻豆形成结构化数据
 * @author shieldax(shieldax@gmail.com)
 */

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
  'https://www.nvshens.net/girl/27139/', //元欣
  'https://www.nvshens.net/girl/19912/', //真东爱(中英文名)
  'https://www.nvshens.net/girl/26815/', //Ashley Resch(CUP)
  'https://www.nvshens.net/girl/22162/', //杨晨晨
  'https://www.nvshens.net/girl/27256/', //木木夕Mmx(缺资料)
  'https://www.nvshens.net/girl/18229/' //丸糯糯
];

const options = {
  transform: function (body) {
    return cheerio.load(body);
  }
};

const getPage = function (url) {
  const options = {
    uri: url,
    transform: function(body){
      return cheerio.load(body);
    }
  };
  return requesto(options);
};

options.uri = instUris[5];

const demo_album_uris = [
  'https://www.nvshens.net/girl/27256/', //木木夕Mmx(缺资料)
  'https://www.nvshens.net/g/30113/',
  'https://www.nvshens.net/g/29032/', // 20765 尤果圈1月合集释放诱惑(合集)
  'https://www.nvshens.net/g/29711/', // 小青蛙
  'https://www.nvshens.net/g/29604/', // 合辑
  'https://www.nvshens.net/g/19198/' //多人合辑，所属不确定
];

const Delay_Time = function(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
};

options.uri = demo_album_uris[3];

/**
 * Parse album detail
 *
 * @param      {<type>}  opts  The specifier options
 * @param      {string}  albumId      The album identifier
 * @return     {<type>}  { description_of_the_return_value }
 */
const parseAlbum = async (opts, albumId) => {
  //resolve target page link
  let cur_host = url.parse(opts.uri).host;
  albumId = albumId || opts.uri.match(albumRegex)[1];
  let options = {uri: 'https://'+cur_host+'/g/'+albumId};
  options.transform = opts.transform;
  console.log(options.uri);
  var album = {_id: albumId};
  // 到指定页面抓取图集信息
  return requesto(options)
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
      // 数组塌陷
      album.moters = _.union(album.moters);
      // console.log(album.moters);
      // 通过首张图片地址确定资源所属moter_id
      let first_img_src = $('#hgallery').find('img').first().attr('src');
      let moterId = first_img_src.match(galleryRegex)[1];
      // 包含两个以上模特的确保所属moter_id在数组最后
      let moters_num = album.moters.length;
      if(moters_num > 1 && _(album.moters).indexOf(moterId) < (moters_num-1)) {
        let _moters = _(album.moters).without(moterId);
        _moters.push(moterId);
        album.moters = _moters;
      };
      // console.log(album.moters);
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
      return album;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(async () => {
      let _exists = await Album.exists({_id: album._id});
      if (!_exists) {
        console.log(`Album ${album._id} not exists!`);
        let _album = await Album.create(album);
        console.log(_album);
      } else {
        console.log(`Album ${album._id} already exists!`);
      }
    });
};
parseAlbum(options);

/**
 * 依次解析一组图集
 *
 * @param      {<type>}  opts      The options
 * @param      {<type>}  albumIds  The album identifiers
 * @param      {string}  interval  The interval time
 * @return     {<type>}  { description_of_the_return_value }
 */
const parseAlbums = async (opts, albumIds, interval) => {
  let _album, album;
  if (albumIds.length>0) {
    try{
      // 使用await关键字确保每次抓完再抓列表中的下一个
      _album = await parseAlbum(opts, albumIds[0]);
      let _exists = await Album.exists({_id: _album._id});
      if (!_exists) {
        console.log(`Album ${_album._id} not exists!`);
        album = await Album.create(album);
        console.log(_album);
      } else {
        console.log(`Album ${_album._id} already exists!`);
      }
      // console.log(finalalbum);
      // let album = await Album.create(finalalbum);
      console.log(album);
      // 从原始列表中取出已经解析完成的图集
      albumIds.splice(0, 1);
      // 设置间隔时间
      console.log('waiting for '+interval+'ms.')
      await Delay_Time(interval);
      // 继续抓取列表中剩余的图集
      return parseAlbums(opts, albumIds, interval);
    }catch(err){
      console.log(err);
    }
  } else {
    return console.log("Albums All Done");
  }
};

/**
 * 获取指定模特的图集列表
 *
 * @param      {<type>}  opts      The options
 * @param      {string}  moterId   The moter identifier
 * @param      {<type>}  interval  The interval
 * @param      {number}  limit     The limit
 * @return     {<type>}  { description_of_the_return_value }
 */
const parseAlbumList = (opts, moterId, interval, limit) => {
  var cur_host = url.parse(opts.uri).host;
  if (moterId) { // URI overwrite by given moterId
    opts.uri = 'https://'+cur_host+'/girl/'+moterId;
    console.log('Url Overwrite To: '+opts.uri);
  };
  let albumIds = [];
  return requesto(opts)
    .then(($) => {
      //先判断模特是否有专门的图集列表页
      let has_album_page = $('span.archive_more').text();
      if (has_album_page) {
        //然后改变页面目标调用自身继续解析
        let album_page_path = $('a', 'span.archive_more').attr('href');
        opts.uri = 'https://'+cur_host+album_page_path;
        console.log(`重定向至专门页: ${opts.uri}`);
        return parseAlbumList(opts);
      };
      let list_selector = '#post > div:nth-child(8) > div > div.post_entry > ul > li';
      let list_anchor = $('#post > div:nth-child(8) > div > div.box_entry_title > div').text();
      if (!list_anchor) {list_selector = '#photo_list > ul > li'}; //切换li标签选择器
      //源图集组
      $(list_selector).each(function(index, el) {
        let link=$('a', el).attr('href');
        albumIds.push(link.match(/\d+/)[0]);
      });
      // console.log(albumIds);
      // return albumIds;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      interval = interval || 5000;
      let typo = typeof(limit);
      if (limit) {
        if (typo=='number') {
          if (limit && limit>0) { albumIds = albumIds.splice(0, limit); };
        }else if (typo=='object') {
          albumIds = albumIds.splice(limit[0], limit[1]);
        };
      };
      console.log(albumIds);
      parseAlbums(opts, albumIds, interval)
    });
};

// parseAlbumList(options, '18229')

module.exports.defaultOpts = options;
module.exports.parse = parseAlbum;
module.exports.parseAlbumList = parseAlbumList;