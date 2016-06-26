#!/usr/bin/env node
const spawn = require('child_process').spawn;
const task = process.argv[2];
const args = process.argv.slice(3);
const fs = require('fs');
const path = require('path');

if (!task) {
  return console.log(fs.readdirSync(`${__dirname}/js/cli`).filter(file => {
    return fs.statSync(path.join(`${__dirname}/js/cli`, file)).isDirectory();
  }).filter(file => {
    return file !== '.git';
  }).filter(file => {
    return file !== 'node_modules';
  }).join('\n'));
}

const runner = spawn(`${__dirname}/js/cli/${task}/index`, args, {
  stdio: 'inherit'
});
