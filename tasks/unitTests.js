/* Copyright (c) 2021 Nikolas Beisemann */

const {src} = require('gulp');
const jasmine = require('gulp-jasmine');

module.exports = (cb) => {
  return src('spec/**/*spec.js')
      .pipe(jasmine());
};
