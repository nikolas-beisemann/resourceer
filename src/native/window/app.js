/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {BrowserWindow, shell, ipcMain} = require('electron');
const {join} = require('path');
const {writeFile} = require('fs');
const createMenu = require('./menu');
const dialog = require('./dialog');
const openUserGuide = require('./user-guide');
const openAbout = require('./about');

module.exports = (lang, opts) => {
  let win = undefined;

  let currentFile = '';
  let dirty = false;

  let zoom = 1.0;
  let fullscreen = false;

  const saveFile = (arg) => {
    if (arg !== undefined) {
      currentFile = arg;
    }
    win.webContents.send('save-request');
    ipcMain.once('save-reply', (event, arg) => {
      writeFile(currentFile, arg, (err) => {
        if (!err) {
          dirty = false;
          win.webContents.send('clean-request');
        }
      });
    });
  };

  ipcMain.on('dirty-request', () => {
    dirty = true;
  });

  createMenu(lang, {
    onOpen() {
      if (dirty && !dialog.discard(lang)) {
        return;
      }
      dialog.open(lang, (file) => {
        currentFile = file.name;
        dirty = false;
        win.webContents.send('title-request', currentFile);
        win.webContents.send('load-request', file.data);
      });
    },
    onSave() {
      if (currentFile === '') {
        dialog.save(lang, 'json', (filename) => {
          saveFile(filename);
        });
      } else {
        saveFile();
      }
    },
    onSaveAs() {
      dialog.save(lang, 'json', (filename) => {
        saveFile(filename);
      });
    },
    onExport() {
      dialog.save(lang, 'pdf', (filename) => {
        win.webContents.printToPDF({}).then((data) => {
          writeFile(filename, data, () => {});
        });
      });
    },

    onZoomIn() {
      if (zoom < 5.0) {
        zoom *= 1.1;
      }
      win.webContents.setZoomFactor(zoom);
    },
    onZoomOut() {
      if (zoom > 0.3) {
        zoom *= 0.91;
      }
      win.webContents.setZoomFactor(zoom);
    },
    onZoomReset() {
      zoom = 1.0;
      win.webContents.setZoomFactor(zoom);
    },
    onFullscreen() {
      fullscreen = !fullscreen;
      win.setFullScreen(fullscreen);
    },

    onUserGuide() {
      openUserGuide(win);
    },
    onAbout() {
      openAbout(win);
    },
  });

  win = new BrowserWindow({
    minWidth: 600,
    webPreferences: {
      preload: join(__dirname, '..', 'renderer', 'preload.js'),
      contextIsolation: true,
    },
  });
  win.loadFile(opts.page);
  win.on('ready-to-show', (e) => {
    win.webContents.setZoomFactor(zoom);
    win.webContents.send('title-request', lang.electron.newFile);
  });
  win.on('close', (e) => {
    if (dirty && !dialog.discard(lang)) {
      e.preventDefault();
    }
  });

  win.webContents.on('will-navigate', (event, arg) => {
    shell.openExternal(arg);
    event.preventDefault();
  });

  return win;
};
