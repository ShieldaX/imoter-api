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