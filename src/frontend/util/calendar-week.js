/* Copyright (c) 2021 Nikolas Beisemann */

/** Represents a calendar week */
const cw = class CW {
  /**
   * Create calendar week.
   * @param {(string|int)} a - String of format 'CW/YY', or week as integer.
   * @param {int} [b] - Year as integer, only used with week as integer.
   */
  constructor(a, b) {
    if (a === undefined) {
      this._constructEmpty();
    } else if (b === undefined) {
      this._constructFromString(a);
    } else {
      this._constructFromInt(a, b);
    }
  }

  /** Constructs empty calendar week object */
  _constructEmpty() {
    this._year = 0;
    this._week = 0;
  }

  /**
   * Extract year and week from string.
   * @param {string} tStr - String of format 'CW/YY'.
   */
  _constructFromString(tStr) {
    const parts = tStr.split('/');
    if (parts.length !== 2) {
      throw new Error(`invalid calendar week: "${tStr}"`);
    }
    this._constructFromInt(parts[0], parts[1]);
  }

  /**
   * Validate year and week.
   * @param {int} week - Week, between 1 and 52.
   * @param {int} year - Year, cannot be negative.
   */
  _constructFromInt(week, year) {
    const w = parseInt(week);
    const y = parseInt(year);
    if (isNaN(w) || w < 1 || w > 52 || isNaN(y) || y < 0) {
      throw new Error(`invalid calendar week: "${week}/${year}"`);
    }
    this._year = y;
    this._week = w;
  }

  /** Return calendar week. */
  get week() {
    return this._week;
  }
  /** Return calendar year. */
  get year() {
    return this._year;
  }

  /** Return an ordinal representation, e.g. for sorting. */
  get asInt() {
    return 52 * this._year + (this._week - 1);
  }
  /** Return a string representation of format 'CW/YY'. */
  get asString() {
    return `${this._week}/${this._year}`;
  }

  /**
   * Calculate duration between objects t1 and t2.
   * @param {CW} t1 - Start date.
   * @param {CW} t2 - End date.
   * @return {int} Duration in weeks, can be negative, but not zero.
   */
  static duration(t1, t2) {
    const d = t2.asInt - t1.asInt;
    if (d < 0) {
      return d - 1;
    } else {
      return d + 1;
    }
  }

  /**
   * Construct from ordinal representation.
   * @param {int} x - Number as returned by asInt().
   * @return {CW} Calendar week object
   */
  static fromInt(x) {
    const year = Math.floor(x / 52);
    const week = (x % 52) + 1;
    return new CW(week, year);
  }

  /**
   * Generate range of labels for given time frame.
   * @param {CW} t1 - Start date.
   * @param {CW} t2 - End date.
   * @return {string[]} Array of string representations.
   */
  static range(t1, t2) {
    const t1Int = t1.asInt;
    const t2Int = t2.asInt;
    // handle edge cases
    if (t1Int > t2Int) {
      return [];
    }
    if (t1Int === t2Int) {
      return [t1.asString];
    }

    const labels = [];
    let k;
    for (k = t1Int; k <= t2Int; ++k) {
      labels.push(CW.fromInt(k).asString);
    }
    return labels;
  }

  /**
   * Calculate number of quarters within given time frame.
   * @param {CW} t1 - Start date.
   * @param {CW} t2 - End date.
   * @return {int} Number of quarters.
   */
  static numQuarters(t1, t2) {
    const t1Int = t1.asInt;
    const t2Int = t2.asInt;
    if (t1Int > t2Int) {
      return 0;
    }

    let ret = 1;
    let k;
    for (k = t1Int + 1; k <= t2Int; ++k) {
      // each quarter is 13 weeks long
      if (k % 13 === 0) {
        ++ret;
      }
    }
    return ret;
  }

  /**
   * Return information about a quarter within given time frame.
   * @param {CW} t1 - Start date.
   * @param {CW} t2 - End date.
   * @param {int} idx - Quarter index, zero indexed.
   * @return {Object} Contains label and duration in weeks of the quarter.
   */
  static quarter(t1, t2, idx) {
    if (idx < 0 || idx >= CW.numQuarters(t1, t2)) {
      return {};
    }

    const t1Int = t1.asInt;
    const t2Int = t2.asInt;

    const start = t1Int + idx * 13;
    const nQ = Math.floor((start % 52) / 13);
    const nY = Math.floor(start / 52);
    const qStart = nY * 52 + nQ * 13;
    const calcStart = qStart < t1Int ? t1Int : qStart;
    const calcEnd = qStart + 13 > t2Int ? t2Int : qStart + 12;

    return {
      label: `Q${nQ + 1}/${nY}`,
      duration: calcEnd - calcStart + 1,
    };
  }
};

exports.CalendarWeek = cw;
