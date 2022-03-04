/* Copyright (c) 2021-2022 Nikolas Beisemann */

const browserify = require('browserify');
const src = require('vinyl-source-stream');
const {dest} = require('gulp');
const {copyFileSync} = require('fs');
const {join} = require('path');
const {language} = require('../config');

module.exports = () => {
  copyFileSync(
      join(__dirname, '..', 'src', 'lang', `${language}.json`),
      join(__dirname, '..', 'language.json'),
  );

  return browserify('src/frontend/index.js')
      .transform('uglifyify', {global: true})
      .bundle()
      .pipe(src('resourceer.bundle.js'))
      .pipe(dest('dist/js/'));
};
