// 依赖注入
// const _ = require('underscore');
const Label = require('../models/Label');


/**
 * 读取 查看
 */

exports.show_by_id = async (req, res, next) => {
  console.log('显示一个ID为'+req.params.label_id+'的标签详情：')
  let label = await Label.findById(req.params.label_id);
  if (label) {
    res.json(label);
  };
};

exports.list_by_category = async (req, res, next) => {
  console.log('显示分类为'+req.query.category+'的标签：')
  let labels = await Label.find({category: req.query.category}, '_id name');
  if (labels) {
    res.json({labels});
  };
};