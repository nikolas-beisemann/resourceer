/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {src, dest, parallel} = require('gulp');
const plantuml = require('node-plantuml');
const fs = require('fs');
const {join, extname, basename} = require('path');

const buildAsciidoc = () => {
  const asciidoctor = require('@asciidoctor/gulp-asciidoctor');
  return src('doc/dev_guide/**/index.adoc')
      .pipe(asciidoctor())
      .pipe(dest('dev_guide'));
};
const copyAssets = () => {
  fs.mkdirSync(join(__dirname, '..', 'dev_guide', 'assets'), {
    recursive: true,
  });
  const pumlDir = join(__dirname, '..', 'doc', 'dev_guide', 'puml');
  fs.readdirSync(pumlDir).forEach((file) => {
    if (extname(file) === '.puml') {
      const data = fs.readFileSync(join(pumlDir, file), 'utf8');
      const gen = plantuml.generate(data, {format: 'png'});
      const outfile = join(__dirname, '..', 'dev_guide', 'assets',
          `${basename(file, '.puml')}.png`);
      gen.out.pipe(fs.createWriteStream(outfile));
    }
  });

  return src('doc/dev_guide/assets/**/*')
      .pipe(dest('dev_guide/assets/'));
};

module.exports = parallel(buildAsciidoc, copyAssets);
