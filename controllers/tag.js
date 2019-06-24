// 依赖注入
// const _ = require('underscore');
const Tag = require('../models/tag');


/**
 * 读取 查看
 */

exports.showById = async (req, res, next) => {
  console.log('显示一个ID为'+req.params.tag_id+'的标签详情：')
  let tag = await Tag.findById(req.params.tag_id);
  if (tag) {
    res.json(tag);
  };
};

exports.listByCategory = async (req, res, next) => {
  console.log('显示分类为'+req.query.category+'的标签：')
  let tags = await Tag.find({category: req.query.category}, '_id name');
  if (tags) {
    res.json({tags});
  };
};