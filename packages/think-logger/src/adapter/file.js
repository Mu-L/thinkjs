const Base = require('./base');

module.exports = class FileLogger extends Base {
  formatConfig(config) {
    let {level, filename, maxLogSize, backups, absolute, layout, mode} = config;
    level = level ? level.toUpperCase() : 'ALL';

    // combine config for file appender, common config for log4js
    return Object.assign({
      appenders: {
        file: {type: 'file', filename, maxLogSize, backups, absolute, layout, mode}
      },
      categories: {
        default: {appenders: ['file'], level}
      }
    }, config);
  }
};
