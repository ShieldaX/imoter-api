//api.js
const express = require('express');
const router = express.Router();

// 加载控制器
const moter = require('../controllers/moter');
const tag = require('../controllers/tag');
const label = require('../controllers/label');
const album = require('../controllers/album');
const gallery = require('../controllers/gallery');

/* GET /api/home?appid=:appid */
router.get('/', (req, res, next) => {
	res.json({
		code: 0,
		msg: "test sucess!"
	});
});

/* GET /api/albums?moter=:moter_id(&limit=:numlimit&skip=:numoffset)  按模特ID返回其图集列表 */
router.get('/albums', album.list);

/* GET /api/album/:album_id 按ID返回某图集 */
//返回一个图集模型（2.0以及附带的标签以便直接按照标签搜索同类图集）
router.get('/albums/:album_id', album.showById);

/* GET /api/gallery/:tag_id 返回便签下的图集列表 */
router.get('/gallery/:tag_id', album.listByTag);

router.get('/gallery', album.listByRegion);

/* GET /api/moters 返回模特列表 */
router.get('/moters', moter.list);
/* GET /api/moter/:moter_id 按ID返回某模特 */
//返回一个模特模型
router.get('/moters/:moter_id', moter.showById);

router.get('/moters/:moter_id/gallery', gallery.showByMoterId);

/* GET /api/tags/:tag_id [Mock]: 按照tag的id返回tag信息 */
router.get('/tags/:tag_id', tag.showById);

/* GET /api/tags?category=:_category 返回某一_category名下的所有tag */
router.get('/tags', tag.listByCategory);

/* GET /api/labels/:label_id [Mock]: 按照label的id返回label信息 */
router.get('/labels/:label_id', label.showById);

/* GET /api/labels?category=:_category 返回某一_category名下的所有label */
router.get('/labels', label.listByCategory);

module.exports = router;