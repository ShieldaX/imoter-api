//parseMoter.js
//解析nvshens.com形成结构化数据
const moterParser = require('./moterParser');
const albumParser = require('./albumParser');

const Delay_Time = function(ms) {
  return new Promise(function(resolve) {
      setTimeout(resolve, ms);
  } )
};

const instUris = [
  'https://www.nvshens.com/girl/27139/', //元欣
  'https://www.nvshens.com/girl/19912/', //真东爱(中英文名)
  'https://www.nvshens.com/girl/26815/', //Ashley Resch(CUP)
  'https://www.nvshens.com/girl/22162/', //杨晨晨
  'https://www.nvshens.com/girl/27256/', //木木夕Mmx(缺资料)
  'https://www.nvshens.com/girl/27180/', //丸糯糯
  'https://www.nvshens.com/girl/17516/', //末永みゆ(只有一个图集的)
  'https://www.nvshens.com/girl/17565/', //曾莉婷(只有一个图集的)
  'https://www.nvshens.com/girl/16515/' //福滝りり(既有图集又有相册！)
];

const options = moterParser.defaultOptions;

// moterParser.parseMoter(options, '16416');
const parse = async (id)=>{
	let album = await albumParser.parseAlbum(albumParser.defaultOptions, id);
	console.log(album);
	let _moters_ids = album.moters;
	_moters_ids.map(async (moter_id)=>{
		let moter = await moterParser.parse(moterParser.default, moter_id);
		console.log(moter);
		await Delay_Time(5000);
	});
};

parse('19198');