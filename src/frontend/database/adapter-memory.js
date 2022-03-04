/* Copyright (c) 2021-2022 Nikolas Beisemann */

const Adapter = class {
  /**
   * Create in memory store
   * @param {Object} cfg - Table configuration
   */
  constructor(cfg) {
    Object.keys(cfg).forEach((table) => {
      this[table] = [];
      this[`${table}Id`] = 0;
      this[`${table}Fields`] = cfg[table];
    });
    this._dirty = false;
  }

  /** Mark database dirty. */
  _setDirty() {
    if (!this._dirty) {
      this._dirty = true;
      if (this._onDirty !== undefined) {
        this._onDirty();
      }
    }
  }

  /**
   * Create row in table.
   * @param {string} table - Target table.
   * @param {Object} attrs - Attributes to write to table.
   * @param {bool} [keepClean] - Whether to mark dirty on creation.
   * @return {int} Id of row, or undefined if creation fails.
   */
  create(table, attrs, keepClean) {
    if (keepClean === undefined || !keepClean) {
      this._setDirty();
    }
    const obj = {};
    if (table in this) {
      obj.id = ++this[`${table}Id`];
      this[`${table}Fields`].forEach((field) => {
        obj[field] = (field in attrs ? attrs[field] : '');
      });
      this[table].push(obj);
    }
    return obj.id;
  }

  /**
   * Filter rows in table.
   * @param {string} table - Target table.
   * @param {Object} where - Attributes to filter by.
   * @param {Object} [cb] - Callback for found row.
   * @return {Array} List of matching rows.
   */
  _filter(table, where, cb) {
    const rows = [];
    if (table in this) {
      let k;
      for (k = 0; k < this[table].length; ++k) {
        const row = this[table][k];
        let ok = true;
        if (where !== undefined) {
          let l;
          const keys = Object.keys(where);
          for (l = 0; l < keys.length; ++l) {
            const key = keys[l];
            if (!(key in row && row[key] === where[key])) {
              ok = false;
              break;
            }
          }
        }
        if (ok) {
          if (cb !== undefined) {
            cb(row, k);
          }
          rows.push(row);
        }
      }
    }
    return rows;
  }

  /**
   * Read rows from table.
   * @param {string} table - Target table.
   * @param {Array} attrs - List of attributes to export.
   * @param {Object} [where] - Attributes to filter by.
   * @return {Array} List of matching rows.
   */
  read(table, attrs, where) {
    const ret = [];
    this._filter(table, where, (row) => {
      const elem = {};
      attrs.forEach((key) => {
        if (key in row) {
          elem[key] = row[key];
        }
      });
      ret.push({...elem});
    });
    return ret;
  }

  /**
   * Update rows from table.
   * @param {string} table - Target table.
   * @param {Object} attrs - Attributes to update.
   * @param {Object} [where] - Attributes to filter by.
   * @return {int} Number of updated rows.
   */
  update(table, attrs, where) {
    this._setDirty();
    let numRows = 0;
    this._filter(table, where, (row) => {
      ++numRows;
      Object.keys(attrs).forEach((key) => {
        if (key in row) {
          row[key] = attrs[key];
        }
      });
    });
    return numRows;
  }

  /**
   * Delete rows from table.
   * @param {string} table - Target table.
   * @param {Object} [where] - Attributes to filter by.
   * @return {int} Number of deleted rows.
   */
  delete(table, where) {
    this._setDirty();
    const idxList = [];
    this._filter(table, where, (row, idx) => {
      idxList.unshift(idx);
    });
    idxList.forEach((idx) => {
      this[table].splice(idx, 1);
    });

    return idxList.length;
  }

  /**
   * Dump database content into JSON string.
   * @param {Array} tables - Tables to dump.
   * @return {string} JSON string with table contents.
   */
  dump(tables) {
    const obj = {};
    for (const table of tables) {
      obj[table] = this[table];
      obj[`${table}Id`] = this[`${table}Id`];
    }
    return JSON.stringify(obj);
  }

  /**
   * Restore database content from JSON string.
   * @param {string} cfg - JSON string with table contents.
   */
  restore(cfg) {
    this._dirty = false;
    const obj = JSON.parse(cfg);
    for (const table of Object.keys(obj)) {
      this[table] = obj[table];
      this[`${table}Id`] = obj[`${table}Id`];
    }
    if (this._onReload !== undefined) {
      this._onReload();
    }
  }

  /**
   * Install a hook to be called when database is restored.
   * @param {Object} fun - Callback.
   */
  onReload(fun) {
    this._onReload = fun;
  }

  /**
   * Install a hook to be called when the database is marked dirty.
   * @param {Object} fun - Callback.
   */
  onDirty(fun) {
    this._onDirty = fun;
  }

  /** Mark database clean. */
  setClean() {
    this._dirty = false;
  }
};

exports.Adapter = Adapter;

exports.adapter = new Adapter({
  projects: [
    'name',
  ],
  timelines: [
    'project',
    'name',
    'startDate',
    'endDate',
    'description',
  ],
  milestones: [
    'timeline',
    'name',
    'dueDate',
  ],
  allocations: [
    'timeline',
    'date',
    'amount',
  ],
  tasks: [
    'timeline',
    'name',
    'start',
    'end',
    'amount',
  ],
});
