//api.js
const express = require('express');
const router = express.Router();

// 加载控制器
const moter = require('../controllers/moter');
const tag = require('../controllers/tag');
const album = require('../controllers/album');

/* GET /api/home?appid=:appid */
router.get('/', (req, res, next) => {
	res.json({
		code: 0,
		msg: "test sucess!"
	});
});

/* GET /api/album/:album_id 按ID返回某图集 */
//返回一个图集模型（2.0以及附带的标签以便直接按照标签搜索同类图集）
router.get('/albums/:album_id', album.show_by_id);

/* GET /api/gallery/:tag_id 返回便签下的图集列表 */
router.get('/gallery/:tag_id', album.list_by_tag);

/* GET /api/albums?moter=:moter_id(&limit=:numlimit&skip=:numoffset)  按模特ID返回其图集列表 */
router.get('/albums', album.list_by_moter);

/* GET /api/moters 返回模特列表 */

/* GET /api/moter/:moter_id 按ID返回某模特 */
//返回一个模特模型
router.get('/moters/:moter_id', moter.show_by_id);

/* GET /api/tags/:tag_id [Mock]: 按照tag的id返回tag信息 */
router.get('/tags/:tag_id', tag.show_by_id);

/* GET /api/tags?category=:_category 返回某一_category名下的所有tag */
router.get('/tags', tag.list_by_category);

module.exports = router;