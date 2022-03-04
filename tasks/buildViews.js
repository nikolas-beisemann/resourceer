/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {src, dest} = require('gulp');
const pug = require('gulp-pug');

module.exports = () => {
  const {language} = require('../config');
  const translations = require(`../src/lang/${language}.json`);
  const {version} = require('../package.json');

  return src('src/frontend/pug/*.pug')
      .pipe(pug({locals: {...translations, version}}))
      .pipe(dest('dist/'));
};
