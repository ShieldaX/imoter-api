//parseMoter.js
//解析nvshens.com形成结构化数据
const moterParser = require('./parseMoter');

const instUris = [
  'https://www.nvshens.com/girl/27139/', //元欣
  'https://www.nvshens.com/girl/19912/', //真东爱(中英文名)
  'https://www.nvshens.com/girl/26815/', //Ashley Resch(CUP)
  'https://www.nvshens.com/girl/22162/', //杨晨晨
  'https://www.nvshens.com/girl/27256/', //木木夕Mmx(缺资料)
  'https://www.nvshens.com/girl/27180/', //丸糯糯
  'https://www.nvshens.com/girl/17516/', //末永みゆ(只有一个图集的)
  'https://www.nvshens.com/girl/17565/' //曾莉婷(只有一个图集的)
];

const options = moterParser.defaultOptions;

moterParser.parseMoter(options, '27139');