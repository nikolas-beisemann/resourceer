/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {src, dest, series} = require('gulp');

const packageCss = () => {
  return src([
    'node_modules/bootstrap/dist/css/bootstrap.min.css*',
    'node_modules/bootstrap-icons/font/bootstrap-icons.*',
  ])
      .pipe(dest('dist/css/'));
};

const packageFonts = () => {
  return src([
    'node_modules/bootstrap-icons/font/fonts/*',
  ])
      .pipe(dest('dist/css/fonts/'));
};

module.exports = series(packageCss, packageFonts);
