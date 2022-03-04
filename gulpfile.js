/* Copyright (c) 2021-2022 Nikolas Beisemann */

// There is a weird issue when using Jasmine along with Asciidoctor: when
// @asciidoctor/core has been required, new Jasmine() breaks. It is not clear
// whether that is Jasmine's or Asciidoctor's fault, but as a workaround the
// tasks have been arranged so that tasks using Jasmine are no longer also
// using Asciidoctor.

const tasks = require('./tasks')([
  'clean',
  'buildViews',
  'staticAnalysis',
  'unitTests',
  'watchChanges',
  'bundle',
  'functionalTests',
  'packageStaticFiles',
  'buildDevGuide',
  'buildUserGuide',
]);
const {series} = require('gulp');

exports.build = series(
    tasks.clean,
    tasks.buildViews,
    tasks.bundle,
    tasks.packageStaticFiles,
    tasks.buildUserGuide,
);
exports.unittests = series(
    tasks.staticAnalysis,
    tasks.unitTests,
);
exports.tests = series(
    exports.unittests,
    tasks.buildViews,
    tasks.bundle,
    tasks.packageStaticFiles,
    tasks.functionalTests,
);
exports.unitdev = tasks.watchChanges(exports.unittests);
exports.docs = series(
    tasks.buildDevGuide,
    tasks.buildUserGuide,
);
exports.clean = tasks.clean;
exports.default = series(
    exports.tests,
    tasks.watchChanges(exports.unittests),
);
