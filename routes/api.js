//api.js
const express = require('express');
const router = express.Router();

/* GET /api/ */
router.get('/', (req, res, next) => {
	res.json({
		code: 0,
		msg: "test sucess!"
	});
});

/* GET /api/album 返回图集列表？ */

/* GET /api/album/:album_id 按ID返回某图集 */
//返回一个图集模型（2.0以及附带的标签以便直接按照标签搜索同类图集）

/* GET /api/moter 返回模特列表 */

/* GET /api/moter/:moter_id 按ID返回某模特 */
//返回一个模特模型

/* GET /api/albums/:moter_id?page=:page_num  按模特ID返回其图集列表 */
//2.0加入分页功能

/* GET /api/moter/:moter_id/album

module.exports = router;