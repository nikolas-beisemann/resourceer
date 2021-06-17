/* Copyright (c) 2021 Nikolas Beisemann */

const {Adapter} = require('../../../src/frontend/database/adapter-memory');

describe('adapter-memory', () => {
  let adapter;
  beforeEach(() => {
    adapter = new Adapter({
      projects: ['name'],
    });
  });

  it('shall create for valid tables', () => {
    expect(adapter.create('projects', {})).not.toBe(undefined);
    expect(adapter.create('invalid', {})).toBe(undefined);
  });

  it('shall return empty list for projects on fresh adapter', () => {
    const ids = adapter.read('projects', ['id']);
    expect(ids.length).toBe(0);
  });

  it('shall return list of created projects', () => {
    const projectsCreated = [];
    let k;
    for (k = 0; k < 5; ++k) {
      projectsCreated.push({
        id: adapter.create('projects', {name: `P${k}`}),
        name: `P${k}`,
      });
    }
    const projects = adapter.read('projects', ['id', 'name']);
    expect(projects.length).toBe(projectsCreated.length);
    const cmpFn = (a, b) => a.id - b.id;
    expect(projects.sort(cmpFn)).toEqual(projectsCreated.sort(cmpFn));
  });

  it('shall be able to filter projects', () => {
    let k;
    for (k = 0; k < 5; ++k) {
      adapter.create('projects', {name: `P${k%2}`});
    }
    const row = adapter.read('projects', ['name'], {id: 1})[0];
    expect(row.name).toBe('P0');
    expect(adapter.read('projects', ['id'], {id: 10}).length).toBe(0);
    expect(adapter.read('projects', ['id'], {name: 'P0'}).length).toBe(3);
  });

  it('shall be able to update projects', () => {
    let k;
    for (k = 0; k < 5; ++k) {
      adapter.create('projects', {name: `P${k%2}`});
    }

    expect(adapter.update('projects', {name: 'Foo'}, {id: 2})).toBe(1);
    const row = adapter.read('projects', ['id', 'name'], {id: 2})[0];
    expect(row.id).toBe(2);
    expect(row.name).toBe('Foo');

    expect(adapter.update('projects', {name: 'Bar'}, {name: 'P0'})).toBe(3);
    for (k = 0; k < 3; ++k) {
      const {name} = adapter.read('projects', ['name'], {id: k * 2 + 1})[0];
      expect(name).toBe('Bar');
    }

    expect(adapter.update('projects', {name: 'All'})).toBe(5);
    for (k = 0; k < 5; ++k) {
      const {name} = adapter.read('projects', ['name'], {id: k + 1})[0];
      expect(name).toBe('All');
    }

    expect(adapter.update('projects', {name: 'Invalid'}, {id: 10})).toBe(0);
  });

  it('shall be able to delete projects', () => {
    let k;
    for (k = 0; k < 5; ++k) {
      adapter.create('projects', {name: `P${k%2}`});
    }

    expect(adapter.delete('projects', {id: 2})).toBe(1);
    expect(adapter.read('projects', ['id'], {id: 2}).length).toBe(0);
    expect(adapter.read('projects', ['id']).length).toBe(4);

    expect(adapter.delete('projects', {name: 'P0'})).toBe(3);
    expect(adapter.read('projects', ['id']).length).toBe(1);

    expect(adapter.delete('projects')).toBe(1);
    expect(adapter.read('projects', ['id']).length).toBe(0);
  });

  it('shall mark dirty on create', () => {
    let dirty = false;
    adapter.onDirty(() => dirty = true);
    adapter.create('projects', {name: 'Foo'});
    expect(dirty).toBe(true);
  });
  it('shall mark dirty on update', () => {
    let dirty = false;
    adapter.onDirty(() => dirty = true);
    adapter.create('projects', {name: 'Foo'}, true);
    expect(dirty).toBe(false);
    adapter.update('projects', {name: 'Bar'});
    expect(dirty).toBe(true);
  });
  it('shall mark dirty on delete', () => {
    let dirty = false;
    adapter.onDirty(() => dirty = true);
    adapter.create('projects', {name: 'Foo'}, true);
    expect(dirty).toBe(false);
    adapter.delete('projects');
    expect(dirty).toBe(true);
  });
  it('shall allow to mark clean', () => {
    let dirty = false;
    adapter.create('projects', {name: 'Foo'});
    adapter.onDirty(() => dirty = true);
    adapter.create('projects', {name: 'Foo'});
    expect(dirty).toBe(false);
    adapter.setClean();
    adapter.create('projects', {name: 'Foo'});
    expect(dirty).toBe(true);
  });

  it('shall allow to dump empty contents into string', () => {
    expect(JSON.parse(adapter.dump(['projects']))).toEqual({projects: []});
  });
  it('shall allow to dump non-empty contents into string', () => {
    adapter.create('projects', {name: 'Foo'});
    adapter.create('projects', {name: 'Bar'});
    const dump = JSON.parse(adapter.dump(['projects']));
    const names = [];
    for (const proj of dump.projects) {
      expect(proj.id).not.toBe(undefined);
      expect(proj.name).not.toBe(undefined);
      names.push(proj.name);
    }
    expect(names).toEqual(['Foo', 'Bar']);
  });

  it('shall clear database on restore from empty string', () => {
    adapter.create('projects', {name: 'Foo'});
    adapter.restore('{"projects":[]}');
    expect(adapter.read('projects', ['id'], {name: 'Foo'}).length).toBe(0);
  });
  it('shall clear database on restore from non-empty string', () => {
    adapter.create('projects', {name: 'Foo'});
    adapter.restore('{"projects": [{"id": 1, "name": "Bar"}]}');
    expect(adapter.read('projects', ['id'], {name: 'Foo'}).length).toBe(0);
  });
  it('shall restore databse contents from string', () => {
    adapter.restore('{"projects": [{"id": 1, "name": "Bar"}]}');
    const rows = adapter.read('projects', ['id'], {name: 'Bar'});
    expect(rows.length).toBe(1);
    expect(rows[0].id).toBe(1);
  });
  it('shall notify on restore', () => {
    let reload = false;
    adapter.onReload(() => reload = true);
    adapter.restore('{"projects": []}');
    expect(reload).toBe(true);
  });
});
