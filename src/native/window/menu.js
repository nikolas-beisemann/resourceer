/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {Menu} = require('electron');

module.exports = (lang, opts) => {
  const onEvent = (opts, name) => {
    return () => {
      if (opts !== undefined) {
        if (opts[`on${name}`] !== undefined) {
          opts[`on${name}`]();
        }
      }
    };
  };

  const menu = Menu.buildFromTemplate([
    {
      label: lang.electron.file,
      submenu: [
        {
          label: lang.electron.open,
          accelerator: 'Ctrl+O',
          click: onEvent(opts, 'Open'),
        },
        {
          label: lang.electron.save,
          accelerator: 'Ctrl+S',
          click: onEvent(opts, 'Save'),
        },
        {
          label: lang.electron.saveAs,
          accelerator: 'F12',
          click: onEvent(opts, 'SaveAs'),
        },
        {
          label: lang.electron.export,
          accelerator: 'F10',
          click: onEvent(opts, 'Export'),
        },
        {
          label: lang.electron.quit,
          role: 'quit',
        },
      ],
    },
    {
      label: lang.electron.view,
      submenu: [
        {
          label: lang.electron.zoomIn,
          accelerator: 'Ctrl+Plus',
          click: onEvent(opts, 'ZoomIn'),
        },
        {
          label: lang.electron.zoomOut,
          accelerator: 'Ctrl+Shift+-',
          click: onEvent(opts, 'ZoomOut'),
        },
        {
          label: lang.electron.zoomReset,
          accelerator: 'Ctrl+0',
          click: onEvent(opts, 'ZoomReset'),
        },
        {
          label: lang.electron.fullscreen,
          accelerator: 'F11',
          click: onEvent(opts, 'Fullscreen'),
        },
      ],
    },
    {
      label: lang.electron.help,
      submenu: [
        {
          label: lang.electron.userGuide,
          accelerator: 'F1',
          click: onEvent(opts, 'UserGuide'),
        },
        {
          label: lang.electron.about,
          accelerator: 'Ctrl+F1',
          click: onEvent(opts, 'About'),
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
};
