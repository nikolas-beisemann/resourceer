/* Copyright (c) 2021-2022 Nikolas Beisemann */

module.exports = (tasks) => {
  const ret = {};
  tasks.forEach((name) => {
    ret[name] = require(`./${name}`);
    ret[name].displayName = name;
  });
  return ret;
};
