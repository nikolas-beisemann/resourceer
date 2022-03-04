/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {src, dest, parallel} = require('gulp');
const {language} = require('../config');

const buildAsciidoc = () => {
  const asciidoctor = require('@asciidoctor/gulp-asciidoctor');
  return src(`doc/user_guide/${language}/**/index.adoc`)
      .pipe(asciidoctor())
      .pipe(dest('dist/user_guide/'));
};
const copyAssets = () => {
  return src(`doc/user_guide/${language}/assets/**/*`)
      .pipe(dest('dist/user_guide/assets/'));
};

module.exports = parallel(buildAsciidoc, copyAssets);
