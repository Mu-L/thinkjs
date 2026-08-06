const Base = require('./base');

module.exports = class DateFileLogger extends Base {
  formatConfig(config) {
    let {level, filename, pattern, alwaysIncludePattern, absolute, layout, mode, numBackups} = config;
    level = level ? level.toUpperCase() : 'ALL';

    return Object.assign({
      appenders: {
        dateFile: {type: 'dateFile', filename, pattern, alwaysIncludePattern, absolute, layout, mode, numBackups}
      },
      categories: {
        default: {appenders: ['dateFile'], level}
      }
    }, config);
  }
};
