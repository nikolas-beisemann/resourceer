/* Copyright (c) 2021 Nikolas Beisemann */

const catmullRom = require('../../../src/frontend/util/catmull-rom');

describe('catmull-rom', () => {
  it('exposes createCurve function', () => {
    expect(typeof catmullRom).toBe('function');
  });
  it('returns an array', () => {
    const ret = catmullRom([]);
    expect(Array.isArray(ret)).toBe(true);
  });
  it('returns an empty array when less than 2 points are given', () => {
    const points = [];
    let k;
    for (k = 0; k < 2; ++k) {
      const ret = catmullRom(points);
      expect(ret.length).toBe(0);
      points.push([k, 0]);
    }
  });
  it('returns an array containing the y-vals if valid', () => {
    const points = [[0, 1], [1, 2]];
    const ret = catmullRom(points);
    expect(ret.length).toBe(2);
    expect(ret[0]).toBe(1);
    expect(ret[1]).toBe(2);
  });
  it('returns a curve for distant points going through each point', () => {
    const points = [[0, 1], [5, 3], [10, 0]];
    const ret = catmullRom(points);
    expect(ret.length).toBe(11);
    expect(ret[0]).toBe(1);
    expect(ret[5]).toBe(3);
    expect(ret[10]).toBe(0);
  });
});
