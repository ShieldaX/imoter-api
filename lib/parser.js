/**
 * @file 以图集为起点同时解析其麻豆形成结构化数据
 * @author shieldax(shieldax@gmail.com)
 */

'use strict';
const requesto = require('request-promise');
const cheerio = require('cheerio');
const url = require('url');
const _ = require('underscore');

const moterParser = require('./moterParser');
const albumParser = require('./albumParser');

/**
 * 封装好的页面请求，默认用Cheerio预加载回文
 * @param  {String} url 待请求的目标链接
 * @return {Promise}     可执行的Request请求
 */
function getPage(url) {
  const options = {
    uri: url,
    transform: function(body){
      return cheerio.load(body);
    }
  };
  return requesto(options);
}

/**
 * 设置延迟时间，减少并发
 * @param  {Number} ms   等待毫秒数
 * @param  {Boolean} flag 是否在控制台显示等待讯息
 * @return {Promise}      待执行的时间延迟
 */
function wait(ms, flag) {
	if (flag) {
		console.log('waiting for '+ms+'ms');
	}
  return new Promise(resolve => {
      setTimeout(resolve, ms);
  });
}

/**
 * 默认图集起始页面的链接地址
 * @type {String}
 */
const DEFAULT_ALBUM_INIT_PAGE = 'https://www.nvshens.net/gallery/';

/**
 * 解析一系列麻豆
 * @param {Array} moterIds      待解析的麻豆索引
 * @yield {Object} 解析完成的麻豆实例
 */
async function* seriesMoterParser(moterIds) {
  try {
  	while (moterIds.length > 0) {
  		let moter = await moterParser.parse(moterParser.defaultOpts, moterIds[0]);
  		moterIds.splice(0, 1);
  		await wait(100, true);
  		yield moter;
  	};
  } catch(err) {
  	console.log(err);
  }
}

/**
 * 解析一个图集的同时解析其所属的麻豆
 * @param  {String} id 需要解析的图集索引
 * @return {Object}    解析完成的图集
 */
async function parseAlbumAndItsMoters(id) {
  let album = await albumParser.parse(albumParser.defaultOpts, id);
  let _moters_ids = album.moters;
  let _moters = [];
  for await (let moter of seriesMoterParser(_moters_ids)) {
    // console.log(moter);
    _moters.push(moter);
  }
  return album;
}

// [ref] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of

/**
 * 解析图集列表中的索引
 * @param {Array} albumIds      需要解析的图解索引列表
 * @yield {Object} 解析完成的图集实例
 */
async function* generateAlbumParsers(albumIds) {
	try {
		while (albumIds.length > 0) {
			let album = await parseAlbumAndItsMoters(albumIds[0]);
			// 从任务列表中移除已经解析完成的图集任务id
      albumIds.splice(0, 1);
			await wait(200, true);
			yield album;
		}
	} catch (err) {
		console.log(err);
	}
}

/**
 * 按循序解析图集列表
 * @param  {Array} albumIds 图集索引列表
 * @return {Array}          解析完成的图解列表
 */
async function parseAlbumsInOrder(albumIds) {
  let albums = [];
  for await (let album of generateAlbumParsers(albumIds)) {
    albums.push(album);
    // console.log(album);
  }
  console.log(albums.length);
  return albums;
}

/**
 * 图集页面解析器
 * @param  {String} pageURL 图集页面链接
 * @return {Array}          图集索引列表
 */
async function fetchAlbumlistOnPage(pageURL = DEFAULT_ALBUM_INIT_PAGE) {
  let albumIds = [];
  return getPage(pageURL)
    .then($ => {
      $('#listdiv ul li').each((index, element) => {
        let link=$('a.caption', element).attr('href');
        albumIds.push(link.match(/\d+/)[0]);
      })
      return albumIds;
    })
    .finally(()=>{
      console.log(albumIds);
    });
}

/**
 * 生成系列图集页面解析器
 * @param {Array} urls          图集页面链接列表
 * @yield {Array} 单图集页面的（所有）图集索引列表
 */
async function* seriesAlbumPageParser(urls) {
  try {
    while (urls.length > 0) {
      let page = await fetchAlbumlistOnPage(urls[0]);
      // 从任务列表中移除已经解析完成的图集页面链接
      urls.splice(0, 1);
      yield page;
      await wait(2000, true);
    };
  } catch (err) {
    console.log(err);
  }
}

/**
 * 解析多个图集页内（所有）图集
 * @param  {Array} pages 按页面分组的图集索引列表
 * @return {Array}       解析完的图集实例（按页面分组）列表
 */
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

/**
 * 批量有序（从新到旧）地解析图集页
 * @param  {String} initPageURL 起始页码
 */
async function spawnAlbumParser(initPageURL = DEFAULT_ALBUM_INIT_PAGE) {
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
      console.log('--=======Target Pages============');
      console.log(pages);
    })
    .finally(async ()=>{
      let pageCount = pages.length;
      let lastest_page_url = pages[pages.length-1]
      let page_num = lastest_page_url.match(/(\d+).html$/)
      // console.log(pageCount);
      let parsedPages = await parseAlbumPagesInOrder(pages);
      console.log(parsedPages.length+' compares to '+pageCount);
      // spawnAlbumParser(pages[pages.length-1]);
      if (parsedPages.length == pageCount) {
        console.log('--============================');
        console.log(`${parsedPages.length} Pages Done!`);
        if (page_num) {
          page_num = page_num[1];
          console.log(`${page_num} Pages in totally Done!`);
          if (page_num < 30) {
            // return spawnAlbumParser(lastest_page_url);
          }
        }
      } else {
        console.log('==============================');
        console.log('============================--');
        console.log(`${parsedPages.length} Pages Stop!`);
        console.log('============================--');
        console.log('==============================');
      }
    })
}

spawnAlbumParser('https://www.nvshens.net/gallery/6.html');