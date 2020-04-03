'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const server_1 = require('./server');
const config_1 = require('./utils/config');
server_1.app.listen(config_1.PORT, () =>
  console.log(`Listening at port ${config_1.PORT}`)
);
