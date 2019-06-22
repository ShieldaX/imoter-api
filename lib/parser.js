//parseMoter.js
//解析nvshens.com形成结构化数据
'use strict';
const requesto = require('request-promise');
const cheerio = require('cheerio');
const url = require('url');
const _ = require('underscore');

const moterParser = require('./moterParser');
const albumParser = require('./albumParser');

function getPage(url) {
  const options = {
    uri: url,
    transform: function(body){
      return cheerio.load(body);
    }
  };
  return requesto(options);
}

function Delay_Time(ms, flag) {
	if (flag) {
		console.log('waiting for '+ms+'ms');
	};
  return new Promise(resolve => {
      setTimeout(resolve, ms);
  });
}

const instUris = [
  'https://www.nvshens.com/girl/27139/', //元欣
  'https://www.nvshens.com/girl/19912/', //真东爱(中英文名)
  'https://www.nvshens.com/girl/26815/', //Ashley Resch(CUP)
  'https://www.nvshens.com/girl/22162/', //杨晨晨
  'https://www.nvshens.com/girl/27256/', //木木夕Mmx(缺资料)
  'https://www.nvshens.com/girl/27180/', //丸糯糯
  'https://www.nvshens.com/girl/17516/', //末永みゆ(只有一个图集的)
  'https://www.nvshens.com/girl/17565/', //曾莉婷(只有一个图集的)
  'https://www.nvshens.com/girl/16515/' //福滝りり(既有图集又有相册！)
];

const DEFAULT_ALBUM_INIT_PAGE = 'https://www.nvshens.com/gallery/';

const options = moterParser.defaultOptions;

// Generator of moterparsers
async function* seriesMoterParser(moter_ids) {
  try {
  	while (moter_ids.length > 0) {
  		let moter = await moterParser.parse(moterParser.default, moter_ids[0]);
  		moter_ids.splice(0, 1);
  		await Delay_Time(100, true);
  		// console.log(moter);
  		yield moter;
  	};
  } catch(err) {
  	console.log(err);
  } finally {
  	return;
  }
}

// parseAlbumAndItsMoters
// Parse album, then parse relative moter(s) at the same time.
async function parseAlbumAndItsMoters(id) {
  let album = await albumParser.parseAlbum(albumParser.defaultOptions, id);
  let _moters_ids = album.moters;
  let _moters = [];
  for await (let moter of seriesMoterParser(_moters_ids)) {
    // console.log(moter);
    _moters.push(moter);
  }
  console.log(_moters.length);
  return album;
}

// parse('19198');
// [ref] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of

const current_album_id = 30201;
const directions = {up: false, down: true};

async function* generateAlbumParsers(album_ids) {
	try {
		while (album_ids.length > 0) {
			let album = await parseAlbumAndItsMoters(album_ids[0]);
			// 从任务列表中移除已经解析完成的图集任务id
      album_ids.splice(0, 1);
			await Delay_Time(200, true);
			yield album;
		}
	} catch (err) {
		console.log(err);
	}
}

// parseAlbumsInOrder
async function parseAlbumsInOrder(album_ids) {
  let albums = [];
  for await (let album of generateAlbumParsers(album_ids)) {
    albums.push(album);
    // console.log(album);
  }
  console.log(albums.length);
  return albums;
}

async function fetchAlbumlistOnPage(page_url) {
  if (!page_url) {
    page_url = 'https://www.nvshens.com/gallery/';
  }
  let album_ids = [];
  return getPage(page_url)
    .then($ => {
      $('#listdiv ul li').each((index, element) => {
        let link=$('a.caption', element).attr('href');
        album_ids.push(link.match(/\d+/)[0]);
      })
      return album_ids;
    })
    .finally(()=>{
      console.log(album_ids);
    });
}

async function* seriesAlbumPageParser(urls) {
  try {
    while (urls.length > 0) {
      let page = await fetchAlbumlistOnPage(urls[0]);
      // 从任务列表中移除已经解析完成的图集任务id
      urls.splice(0, 1);
      yield page;
      await Delay_Time(2000, true);
    };
  } catch (err) {
    console.log(err);
  }
}

async function parseAlbumPagesInOrder(pages) {
  let _pages = [];
  for await (let page of seriesAlbumPageParser(pages)) {
    let _page = await parseAlbumsInOrder(page);
    _pages.push(_page);
  }
  console.log('==============================');
  console.log('==============================');
  console.log(`${_pages.length} Pages Done!`);
  console.log('==============================');
  console.log('==============================');
  return _pages;
}

async function betchAlbumParser(initPageURL = DEFAULT_ALBUM_INIT_PAGE) {
  let cur_host = 'https://'+url.parse(DEFAULT_ALBUM_INIT_PAGE).host;
  let pages = [];
  getPage(initPageURL)
  .then(($) => {
    let begin = false;
    $('#listdiv div.pagesYY div a').each((index, element) => {
      if ($(element).attr('class') == 'cur') {
        begin = !begin;
        if ($(element).attr('href') == '/gallery/') {
          let link=$(element).attr('href');
          pages.push(cur_host+link);
        }
        return;
      } else if (begin) {
        let link=$(element).attr('href');
        pages.push(cur_host+link);
      }
    });
    // filter repeat urls
    pages = _.union(pages);
    pages.pop();
    pages.pop();
    pages.pop();
    console.log(pages);
  })
  .finally(async ()=>{
    let pageNum = pages.length;
    console.log(pageNum);
    let gotPages = await parseAlbumPagesInOrder(pages);
    console.log(gotPages.length+' compares to '+pageNum);
    // betchAlbumParser(pages[pages.length-1]);
    // if (gotPages.length == pages.length) {
    //   console.log('--============================');
    //   console.log(`${gotPages.length} Pages Done!`);
    //   console.log('--=======New Pages============');
    //   return betchAlbumParser(pages[pages.length-1]);
    // } else {
    //   console.log('==============================');
    //   console.log('============================--');
    //   console.log(`${gotPages.length} Pages Stop!`);
    //   console.log('============================--');
    //   console.log('==============================');
    // }
  })
}

betchAlbumParser();