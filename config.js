//config.js

var pkg = require('./package.json');

var config = {
  debug: true,
  name: 'iMoter API Server',
  description: 'For iMoter App',
  keywords: 'girls beauty model',
  version: pkg.version,

  db: 'mongodb://127.0.0.1/imoter_db_dev',
  db_name: 'imoter_db_dev',
  session_secret: 'imoter_db_dev_tobe_protext',
  auth_cookie_name: 'imoter_io',
  port: 3000,
};

module.exports = config;
module.exports.config = config;
