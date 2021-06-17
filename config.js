/* Copyright (c) 2021 Nikolas Beisemann */

const packageJson = require('./package.json');


let resourceer = undefined;
if (packageJson.config !== undefined) {
  resourceer = packageJson.config.resourceer;
}
const lang = (resourceer.language !== undefined ?
    resourceer.language : 'de');

exports.language = lang;
