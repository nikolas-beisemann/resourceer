/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {ipcRenderer, contextBridge} = require('electron');

let dirty = false;
let title = '';

const updateTitle = (arg) => {
  if (arg !== undefined) {
    title = arg;
  }
  const tag = document.getElementsByTagName('title')[0];
  const flag = (dirty ? '*' : '');
  tag.innerHTML = `Resourceer - ${title} ${flag}`;
};
const setDirty = (val) => {
  dirty = val;
  updateTitle();
};

ipcRenderer.on('title-request', (event, arg) => {
  updateTitle(arg);
});

contextBridge.exposeInMainWorld('native', {
  onLoad(fun) {
    ipcRenderer.on('load-request', (event, arg) => {
      setDirty(false);
      fun(arg);
    });
  },
  onSave(fun) {
    ipcRenderer.on('save-request', () => {
      ipcRenderer.send('save-reply', fun());
    });
  },
  dirty() {
    setDirty(true);
    ipcRenderer.send('dirty-request');
  },
  onClean(fun) {
    ipcRenderer.on('clean-request', () => {
      setDirty(false);
      fun();
    });
  },
});
