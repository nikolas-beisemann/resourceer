/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {src} = require('gulp');
const eslint = require('gulp-eslint');

module.exports = () => {
  return src([
    'gulpfile.js',
    'config.js',
    'tasks/*.js',
    'src/**/*.js',
    'spec/**/*.js',
    'functional/**/*.js',
  ])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
};
