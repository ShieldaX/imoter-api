// 依赖注入
// const _ = require('underscore');
const Album = require('../models/album');
const Moter = require('../models/moter');
const Tag = require('../models/tag');


/**
 * 读取 查看
 */

exports.showById = async (req, res, next) => {
  console.log('显示一个ID为'+req.params.album_id+'的图集详情：')
  let album = await Album.findById(req.params.album_id);
  if (album) {
    res.json({album});
  };
};

// TODO: 搜索某个地区的麻豆（们）的图集，兼容洲际，国际，地区
exports.listByRegion = async (req, res, next) => {
  let _country = req.query.region;
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 0;
  // Pick moters of `_country`
  let _countryTag = await Tag.findById(_country, '_id name');
  if (_countryTag) {
    _country = _countryTag.name;
  }
  console.log(`显示地区为${_country}的图集`);
  let _moters = await Moter.find({country: _country}, '_id', {autopopulate: false});
  let moters = _moters.map(moter => moter._id);
  console.log(moters);
  let albums = await Album.find({moters: {$in: moters}}, '_id title', { autopopulate: false })
    .skip(Number(skip))
    .limit(Number(limit));
  console.log('套图共计：'+albums.length+'册');
  res.json({albums});
};

exports.listByTag = async (req, res, next) => {
  let tag_id = req.params.tag_id;
  console.log(`显示标签${tag_id}的图集`);
  let tag = await Tag.findById(req.params.tag_id, '_id category');
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 0;
  let albums = await Album.find({tags: req.params.tag_id}, '_id title', { autopopulate: false })
    .skip(Number(skip))
    .limit(Number(limit));
  if (albums) {
    console.log('套图共计：'+albums.length+'册');
    res.json({albums});
  };
};

exports.listByMoter = async (req, res, next) => {
  console.log('显示模特'+req.query.moter+'的图集')
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 0;
  let albums = await Album.find({moters: req.query.moter}, '_id title', { autopopulate: false })
    .skip(Number(skip))
    .limit(Number(limit));
  if (albums) {
    console.log('套图共计：'+albums.length+'册');
    res.json({albums});
  };
};

// co(function*() {
//   const cursor = Album.find().cursor();
//   for (let doc = yield cursor.next(); doc != null; doc = yield cursor.next()) {
//     console.log(doc);
//   }
// });

exports.list = async (req, res, next) => {
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 0;
  let queryBy = {};
  let _query;
  if (req.query.moter) {
    _query = {moters: req.query.moter};
  }
  try {
    let albums = await Album.find(_query, '', {autopopulate: false})
      .sort({created: -1})
      .select('_id title')
      .skip(Number(skip))
      .limit(Number(limit));
    res.json({albums});
  } catch(err) {
    console.log(err);
    next(err);
  }
};