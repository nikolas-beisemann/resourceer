/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {watch} = require('gulp');

module.exports = (cmd) => {
  const watchChanges = () => {
    watch([
      'src/**/*.js',
      'spec/**/*.js',
      'tasks/*.js',
      'gulpfile.js',
    ], cmd);
  };
  return watchChanges;
};
