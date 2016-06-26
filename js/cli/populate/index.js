#!/usr/bin/env node

const fs = require('fs');
const spawnSync = require('child_process').spawnSync;
const wft = require('../lib/writeFromTemplate');

const genTemplate = name => {
  if (!name) throw new Error('prismatik ecs template NAME_GOES_HERE');

  wft(__dirname + '/skel.json.mustache', 'taskdef.json', {name: name});

  console.log("Starter task def written to taskdef.json. Take a look, and when you're ready for it to be pushed to ECS run `prismatik ecs create taskdef.json`");
};

const createTaskDef = (family, service, cluster, count) => {
  if (!family || !service) throw new Error('prismatik ecs create FAMILY SERVICE');

  const inpath = process.cwd() + '/taskdef.json';
  const exists = fs.existsSync(inpath);
  if (!exists) throw new Error('No taskdef.json file found');

  spawnSync('aws', ['ecs', 'register-task-definition', '--region', 'ap-southeast-2', '--family', family, '--cli-input-json', 'file://'+inpath], {stdio: 'inherit'});

  spawnSync('aws', ['ecs', 'create-service', '--region', 'ap-southeast-2', '--cluster', cluster, '--service-name', service, '--task-definition', family, '--desired-count', count], {stdio: 'inherit'});
};

const args = process.argv.slice(3);

switch (process.argv[2]) {
  case 'create':
    createTaskDef.apply(null, args);
    break;
  case 'template':
    genTemplate.apply(null, args);
    break;
  default:
    console.log('prismatik ecs template NAME');
    console.log('prismatik ecs create FAMILY SERVICE CLUSTER COUNT');
}
