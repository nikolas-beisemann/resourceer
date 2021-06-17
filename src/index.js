/* Copyright (c) 2021 Nikolas Beisemann */

const {app} = require('electron');
const translations = require('../language.json');
const createAppWindow = require('./native/window/app');

if (require('electron-squirrel-startup')) {
  app.quit();
} else {
  app.whenReady().then(() => {
    createAppWindow(translations, {page: 'dist/index.html'});
  });
}
