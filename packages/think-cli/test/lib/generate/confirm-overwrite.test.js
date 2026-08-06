const {default: test} = require('ava');
const inquirer = require('inquirer');
const confirmOverwrite = require('../../../lib/generate/confirm-overwrite.js');

test('file already exists. Continue? yes', async t => {
  inquirer.prompt = generatePrompt({ok: true})
  const run = confirmOverwrite('test');
  await runCommand(run, {
    [__filename]: {}
  });
  t.pass();
});

test('file already exists. Continue? no', async t => {
  inquirer.prompt = generatePrompt({ok: false})
  const run = confirmOverwrite('test');
  let callbackCalled = false;
  run({
    [__filename]: {}
  }, null, () => {
    callbackCalled = true;
  })

  console.log(' Here should print "Abort the operation": ');
  await new Promise(resolve => setImmediate(resolve));
  t.false(callbackCalled);
});

test('The new command should be skipped', async t => {
  const run = confirmOverwrite('new');

  await runCommand(run, {
    [__filename]: {}
  });
  t.pass();
});

function runCommand(run, files) {
  return new Promise((resolve, reject) => {
    run(files, null, error => error ? reject(error) : resolve());
  });
}

function generatePrompt(answers) {
  return (questions) => {
    const _answers = {}
    for (var i = 0; i < questions.length; i++) {
      const key = questions[i].name
      _answers[key] = answers[key]
    }
    return Promise.resolve(_answers)
  }
}
