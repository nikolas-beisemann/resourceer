/* Copyright (c) 2021 Nikolas Beisemann */

const {dialog} = require('electron');
const {readFile} = require('fs');
const {extname} = require('path');

const jsonFilter = (lang) => {
  return [
    {
      name: lang.electron.projectFiles,
      extensions: ['res'],
    },
    {
      name: lang.electron.allFiles,
      extensions: ['*'],
    },
  ];
};
const pdfFilter = (lang) => {
  return [
    {
      name: lang.electron.pdfFiles,
      extensions: ['pdf'],
    },
  ];
};

exports.open = (lang, cb) => {
  const filters = jsonFilter(lang);
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters,
  }).then((obj) => {
    if (!obj.canceled) {
      readFile(obj.filePaths[0], 'utf8', (err, data) => {
        if (!err) {
          cb({name: obj.filePaths[0], data});
        }
      });
    }
  });
};

exports.save = (lang, type, cb) => {
  const filters = (type === 'json' ? jsonFilter(lang) : pdfFilter(lang));
  dialog.showSaveDialog({filters}).then((obj) => {
    if (!obj.canceled) {
      if (extname(obj.filePath) === '') {
        cb(`${obj.filePath}.${filters[0].extensions[0]}`);
      } else {
        cb(obj.filePath);
      }
    }
  });
};

exports.discard = (lang) => {
  const btn = dialog.showMessageBoxSync({
    message: lang.electron.discardChanges,
    type: 'warning',
    buttons: [lang.electron.abort, lang.electron.continue],
    defaultId: 0,
    title: lang.electron.unsavedChanges,
  });
  return (btn !== 0);
};
