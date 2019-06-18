// 依赖注入
// const _ = require('underscore');
const Gallery = require('../models/gallery');


/**
 * 读取 查看
 */

exports.show_by_moter_id = async (req, res, next) => {
  console.log('显示一个ID为'+req.params.moter_id+'的图集详情：')
  let album = await Gallery.find({moter: req.params.moter_id});
  if (album) {
    res.json({album});
  };
};