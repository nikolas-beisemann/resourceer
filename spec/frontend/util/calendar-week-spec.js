/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {CalendarWeek} = require('../../../src/frontend/util/calendar-week');

describe('calendar-week', () => {
  it('exposes CalendarWeek class', () => {
    expect(typeof CalendarWeek).toBe('function');
    const w = new CalendarWeek();
    expect(w instanceof CalendarWeek).toBe(true);
  });
  it('fails to construct with invalid strings', () => {
    const tries = [
      '',
      '0',
      '0/0',
      '-1/0',
      '1/-1',
      '53/0',
      'a/b',
      'a/0',
      '1/b',
      '1/0/1',
    ];
    let k;
    for (k = 0; k < tries.length; ++k) {
      expect(() => new CalendarWeek(tries[k])).toThrow(
          new Error(`invalid calendar week: "${tries[k]}"`),
      );
    }
  });
  it('constructs with valid strings', () => {
    const tries = [
      '1/0',
      '01/0',
      '52/0',
      '1/21',
      '20/2000',
    ];
    let k;
    for (k = 0; k < tries.length; ++k) {
      expect(typeof new CalendarWeek(tries[k])).toBe('object');
    }
  });
  it('fails to construct with invalid ints', () => {
    const tries = [
      [0, 0],
      [-1, 0],
      [1, -1],
      [53, 0],
    ];
    let k;
    for (k = 0; k < tries.length; ++k) {
      expect(() => new CalendarWeek(tries[k][0], tries[k][1])).toThrow(
          new Error(`invalid calendar week: "${tries[k][0]}/${tries[k][1]}"`),
      );
    }
  });
  it('constructs with valid ints', () => {
    const tries = [
      [1, 0],
      [52, 0],
      [1, 21],
      [20, 2000],
    ];
    let k;
    for (k = 0; k < tries.length; ++k) {
      expect(typeof new CalendarWeek(tries[k][0], tries[k][1])).toBe('object');
    }
  });
  it('allows to get week', () => {
    const w = new CalendarWeek('01/21');
    expect(w.week).toBe(1);
  });
  it('allows to get year', () => {
    const w = new CalendarWeek('01/21');
    expect(w.year).toBe(21);
  });
  it('computes compound int value', () => {
    const w1 = new CalendarWeek('01/21');
    const w2 = new CalendarWeek('02/21');
    const w3 = new CalendarWeek('01/20');
    expect(w1.asInt < w2.asInt).toBe(true);
    expect(w1.asInt > w3.asInt).toBe(true);
    expect(w1.asInt).toBe(w1.asInt);
  });
  it('computes string value', () => {
    const w = new CalendarWeek('01/21');
    expect(w.asString).toBe('1/21');
  });
  it('computes durations in weeks', () => {
    const ranges = [
      [[1, 0], [1, 0], 1],
      [[1, 0], [52, 0], 52],
      [[52, 0], [1, 1], 2],
      [[13, 0], [13, 1], 53],
      [[10, 0], [1, 0], -10],
    ];
    let k;
    for (k = 0; k < ranges.length; ++k) {
      const w1 = new CalendarWeek(ranges[k][0][0], ranges[k][0][1]);
      const w2 = new CalendarWeek(ranges[k][1][0], ranges[k][1][1]);
      expect(CalendarWeek.duration(w1, w2)).toBe(ranges[k][2]);
    }
  });
  it('can construct from compound int value', () => {
    const w = new CalendarWeek('05/22');
    const ci = w.asInt;
    const w2 = CalendarWeek.fromInt(ci);
    expect(w2.asString).toBe('5/22');
  });
  it('generates range of labels', () => {
    const w1 = new CalendarWeek('50/21');
    const w2 = new CalendarWeek('04/22');
    const r = CalendarWeek.range(w1, w2);
    const rCheck = [
      '50/21', '51/21', '52/21',
      '1/22', '2/22', '3/22', '4/22',
    ];
    expect(r).toEqual(rCheck);
  });
  it('computes number of quarters given a range', () => {
    const ranges = [
      [[1, 0], [1, 0], 1],
      [[13, 0], [14, 0], 2],
      [[1, 0], [1, 1], 5],
      [[25, 0], [25, 6], 25],
      [[1, 1], [1, 0], 0],
    ];
    let k;
    for (k = 0; k < ranges.length; ++k) {
      const w1 = new CalendarWeek(ranges[k][0][0], ranges[k][0][1]);
      const w2 = new CalendarWeek(ranges[k][1][0], ranges[k][1][1]);
      expect(CalendarWeek.numQuarters(w1, w2)).toBe(ranges[k][2]);
    }
  });
  it('computes quarter durations given range and index', () => {
    const ranges = [
      [[1, 0], [1, 0], 0, {label: 'Q1/0', duration: 1}],
      [[13, 0], [14, 0], 1, {label: 'Q2/0', duration: 1}],
      [[1, 0], [1, 1], 2, {label: 'Q3/0', duration: 13}],
      [[25, 0], [25, 6], 0, {label: 'Q2/0', duration: 2}],
      [[1, 1], [1, 0], 0, {}],
      [[10, 21], [11, 21], 0, {label: 'Q1/21', duration: 2}],
    ];
    let k;
    for (k = 0; k < ranges.length; ++k) {
      const w1 = new CalendarWeek(ranges[k][0][0], ranges[k][0][1]);
      const w2 = new CalendarWeek(ranges[k][1][0], ranges[k][1][1]);
      const qinfo = CalendarWeek.quarter(w1, w2, ranges[k][2]);
      expect(qinfo).toEqual(ranges[k][3]);
    }
  });
});
