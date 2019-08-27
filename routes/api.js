//api.js
const express = require('express');
const router = express.Router();

// 加载控制器
const user = require('../controllers/user');
const moter = require('../controllers/moter');
const tag = require('../controllers/tag');
const label = require('../controllers/label');
const album = require('../controllers/album');
const gallery = require('../controllers/gallery');

/* GET /api/home?appid=:appid */
router.get('/', (req, res, next) => {
	res.json({
		success: true,
		msg: "API server is available now..."
	});
});

router.post('/auth/register', user.register);

router.post('/auth/sign_in', user.sign_in);

/* GET /api/albums?moter=:moter_id(&limit=:numlimit&skip=:numoffset)  (按所属模特ID)返回图集列表 */
// router.get('/albums', user.loginRequired, album.list);
router.get('/albums', album.list);

/* GET /api/albums/:album_id 按ID返回某一个图集 */
router.get('/albums/:album_id', album.showById);

/* GET /api/gallery?region=:given_region [过滤]按所属模特的地区返回图集列表 */
router.get('/galleries', album.listByRegion);

/* GET /api/gallery/:tag_id [过滤]返回特定标签ID下的图集列表 */
router.get('/galleries/:tag_id', album.listByTag);

/* GET /api/moters 返回模特列表（TODO：按模特ID大小排序 300位）*/
router.get('/moters', moter.list);

/* GET /api/moter/:moter_id 按ID返回某模特 */
router.get('/moters/:moter_id', moter.showById);

/* _GET /api/moter/:moter_id [L]返回某模特的相册 */
router.get('/moters/:moter_id/gallery', gallery.showByMoterId);

/* GET /api/tags?category=:_category 返回某一分类下的所有图集标签 */
router.get('/tags', tag.listByCategory);

/* GET /api/tags/search?name=:_name 搜索下的所有图集标签 */
router.get('/tags/search', tag.searchByName);

/* GET /api/tags/:tag_id 按照图集标签ID返回标签 */
router.get('/tags/:tag_id', tag.showById);

/* _GET /api/labels/:label_id 按照模特标签ID返回模特标签 */
router.get('/labels/:label_id', label.showById);

/* _GET /api/labels?category=:_category 返回某分类下的所有模特标签 */
router.get('/labels', label.listByCategory);

module.exports = router;