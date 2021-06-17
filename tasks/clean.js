/* Copyright (c) 2021 Nikolas Beisemann */

const fs = require('fs');
const path = require('path');

module.exports = (cb) => {
  fs.rmSync(path.join(__dirname, '..', 'dist'), {
    recursive: true,
    force: true,
  });
  fs.rmSync(path.join(__dirname, '..', 'dev_guide'), {
    recursive: true,
    force: true,
  });
  cb();
};
