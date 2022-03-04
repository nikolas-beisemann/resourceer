/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {BrowserWindow, shell} = require('electron');

module.exports = (parent) => {
  const win = new BrowserWindow({
    width: 600,
    height: 430,
    center: true,
    parent,
  });
  win.removeMenu();
  win.loadFile('dist/about.html');
  win.on('ready-to-show', () => {
    win.webContents.setZoomFactor(1.0);
  });
  win.webContents.on('will-navigate', (event, arg) => {
    shell.openExternal(arg);
    event.preventDefault();
  });
};
