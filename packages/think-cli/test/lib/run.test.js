const {test, before, after} = require('node:test');
const path = require('path')
const inquirer = require('inquirer')
const helper = require('think-helper')
const Run = require('../../lib/run.js')
const targetDir = 'tmp'
const targetName = 'think-cli-unit-test-local-multi-module'
const cachePath = path.join(__dirname, '../', '.think-templates', targetName)
const appPath = path.join(__dirname, '../', targetDir, targetName)

const answers = {
  name: targetName,
  author: 'Berwin <liubowen.niubi@gmail.com>',
  description: 'think-cli unit test',
  defaultModule: 'home'
}

before(() => {
  inquirer.prompt = (questions) => {
    const _answers = {}
    for (var i = 0; i < questions.length; i++) {
      const key = questions[i].name
      _answers[key] = answers[key]
    }
    return Promise.resolve(_answers)
  }
})

test('should generate project ', async t => {
  await new Promise((resolve, reject) => {
    const run = new Run({
      template: 'think-template/standard',
      targetPath: appPath,
      options: {
        name: targetName,
        command: 'new',
        maps: 'new.default',
        context: {
          actionPrefix: './',
          ROOT_PATH: appPath,
          APP_NAME: targetName
        }
      },
      done(error, files, options) {
        if (error) {
          reject(error);
          return;
        }
        t.assert.strictEqual(validateFiles(Object.keys(files), options.maps), true);
        resolve();
      }
    });
    run.start();
  });
})

after(t => {
  return helper
    .rmdir(cachePath)
    .then(_ => helper.rmdir(appPath))
    .catch(e => {})
})

function validateFiles(files, maps) {
  return maps.every(mapping => {
    return files.some(filePath => new RegExp('^' + mapping[1]).test(filePath))
  })
}
