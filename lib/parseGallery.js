//parseGallery.js
//解析特定女神的相册形成结构化数据

const requesto = require('request-promise');
const cheerio = require('cheerio');
const url = require('url');
const _ = require('underscore');
// const db = require('../models/db');
// const Gallery = require('../models/gallery');

const moterRegex = /\/girl\/(\d+)/;
const galleryRegex = /\/gallery\/(\w*)/;
const albumRegex = /\/g\/(\d+)/;
const potoRegex = /\/photo\/(.+)/;

const instUris = [
  'https://www.nvshens.com/girl/27139/', //元欣
  'https://www.nvshens.com/girl/19912/', //真东爱(中英文名)
  'https://www.nvshens.com/girl/26815/', //Ashley Resch(CUP)
  'https://www.nvshens.com/girl/22162/', //杨晨晨
  'https://www.nvshens.com/girl/27256/', //木木夕Mmx(缺资料)
  'https://www.nvshens.com/girl/27180/', //丸糯糯
  'https://www.nvshens.com/girl/17516/', //末永みゆ(只有一个图集的)
  'https://www.nvshens.com/girl/17565/gallery', //曾莉婷(只有一个图集的)
  'https://www.nvshens.com/girl/16416/gallery' //王心恬
];

const options = {
  transform: function (body) {
    return cheerio.load(body);
  }
};

options.uri = instUris[8];

const demo_album_uris = [
  'https://www.nvshens.com/girl/17565/gallery', //木木夕Mmx(缺资料)
  'https://www.nvshens.com/g/30113/',
  'https://www.nvshens.com/g/29032' // 20765 尤果圈1月合集释放诱惑(合集)
];

const Delay_Time = function(ms) {
  return new Promise(function(resolve) {
      setTimeout(resolve, ms);
  } )
};

const parseGalleryPage = ($, gallery) => {
  let list_selector = 'div.pic_img_gallery.ad-thumbs ul li';
  $(list_selector).each(function(index, el) {
    let link=$('a', el).attr('href');
    gallery.photos.push(link.match(potoRegex)[1]);
  });
};

const parseGalleryPages = async (spec_options, gallery, interval) => {
  var cur_host = url.parse(spec_options.uri).host;
  await requesto(spec_options)
    .then(async ($) => {
      parseGalleryPage($, gallery);
      //判断是否有下一页继续
      let next_page = $('#gallery h1').find('a').last();
      if (next_page.text().match('后')) {
        //然后改变页面调用自身继续解析
        let album_page_path = next_page.attr('href');
        spec_options.uri = 'https://'+cur_host+album_page_path;
        console.log('重定向至下一页: '+spec_options.uri);
        await Delay_Time(interval);
        await parseGalleryPages(spec_options, gallery, interval);
      };
      // console.log(gallery.photos);
      // return album_ids;
    });
};

// 解析指定模特的相册
const parseGallery = async (spec_options, moter_id, interval) => {
  interval = interval || 5000;
  // 构建相册模型
  let gallery = {};
  var cur_host = url.parse(spec_options.uri).host;
  if (moter_id) { // URI overwrite by given moter_id
    spec_options.uri = 'https://'+cur_host+'/girl/'+moter_id+'/gallery';
    console.log('Url Overwrite To: '+spec_options.uri);
  };
  gallery.moter = spec_options.uri.match(moterRegex)[1];
  // console.log(gallery.moter);
  gallery.photos = [];
  requesto(spec_options)
    .then(async ($) => {
      parseGalleryPage($, gallery);
      //判断是否有下一页
      let next_page = $('#gallery h1').find('a').last();
      if (next_page.text().match('后')) {
        //然后改变页面调用页面解析器继续解析
        let album_page_path = next_page.attr('href');
        spec_options.uri = 'https://'+cur_host+album_page_path;
        console.log('重定向至下一页: '+spec_options.uri);
        await Delay_Time(interval);
        await parseGalleryPages(spec_options, gallery, interval);
      };
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(async () => {
      console.log(gallery);
      // let _gallery = await Gallery.create(gallery);
      // console.log(_gallery);
    });
};

parseGallery(options);

module.exports.defaultOptions = options;