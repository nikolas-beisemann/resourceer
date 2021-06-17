/* Copyright (c) 2021 Nikolas Beisemann */

const {src} = require('gulp');
const jasmine = require('gulp-jasmine');

module.exports = () => {
  return src('functional/**/*story.js')
      .pipe(jasmine());
};
