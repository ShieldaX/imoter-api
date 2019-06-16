// 依赖注入
// const _ = require('underscore');
const Album = require('../models/album');


/**
 * 读取 查看
 */

exports.show_by_id = async (req, res, next) => {
  console.log('显示一个ID为'+req.params.album_id+'的图集详情：')
  let album = await Album.findById(req.params.album_id);
  if (album) {
    res.json({album});
  };
};

exports.list_by_tag = async (req, res, next) => {
  console.log('显示标签'+req.params.tag_id+'的图集')
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

exports.list_by_moter = async (req, res, next) => {
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

exports.list = (req, res, next) => {
  Album.find({moters: req.params.moter_id}, function(err, albums) {
    if (err) return next(err);
    res.json(albums);
  });
};