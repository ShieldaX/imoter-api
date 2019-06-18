// 依赖注入
// const _ = require('underscore');
const Moter = require('../models/moter');


/**
 * 读取 查看
 */

exports.show_by_id = async (req, res, next) => {
  console.log('显示一个ID为'+req.params.moter_id+'的模特详情：')
  let moter = await Moter.findById(req.params.moter_id);
  if (moter) {
    res.json({moter});
  };
};

exports.list_by_label = async (req, res, next) => {
  console.log('显示标签为'+req.params.label_id+'的模特')
  let skip = req.query.skip || 0;
  let limit = req.query.limit || 0;
  let moters = await Moter.find({labels: req.params.label_id}, '_id name career', { autopopulate: false })
    .skip(Number(skip))
    .limit(Number(limit));
  if (moters) {
    console.log('共计：'+moters.length+'位');
    res.json({moters});
  };
};