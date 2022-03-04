/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {CalendarWeek} = require('../util/calendar-week');
const catmullRom = require('../util/catmull-rom');

const wfMod = 13 / 11;

exports.Assessor = class {
  /**
   * Create new assessor.
   * @param {Object} adapter - Adapter to use for database access.
   */
  constructor(adapter) {
    this.adapter = adapter;
  }

  /**
   * Create curve for a single timeline.
   * @param {Object} timeline - Timeline object.
   * @return {Object} Computed curve with sum.
   */
  _createCurve(timeline) {
    const allocations = this.adapter.read('allocations', ['date', 'amount'],
        {timeline: timeline.id});
    const validAllocations = [];
    allocations.forEach((allocation) => {
      try {
        const date = new CalendarWeek(allocation.date);
        const amount = parseFloat(allocation.amount.replace(',', '.'));
        if (date.asInt >= timeline.startDate.asInt &&
            date.asInt <= timeline.endDate.asInt &&
            !isNaN(amount)) {
          validAllocations.push([date.asInt, amount]);
        }
      } catch (e) {}
    });
    if (validAllocations.length > 1) {
      const nAllocs = validAllocations.length;
      validAllocations.sort((a, b) => a[0] - b[0]);
      if (validAllocations[0][0] > timeline.startDate.asInt) {
        validAllocations.unshift([timeline.startDate.asInt, 0]);
      }
      if (validAllocations[nAllocs - 1][0] < timeline.endDate.asInt) {
        validAllocations.push([timeline.endDate.asInt, 0]);
      }
      const curve = catmullRom(validAllocations);
      const labels = CalendarWeek.range(timeline.startDate, timeline.endDate);
      let curveSum = 0;
      const curveData = curve.map((y, idx) => {
        curveSum += y;
        return {x: labels[idx], y};
      });
      return {
        sum: curveSum * 5,
        data: curveData,
      };
    }
    return {sum: 0, data: []};
  }

  /**
   * Create curves for tasks of a single timeline.
   * @param {Object} timeline - Timeline object.
   * @return {Array} Computed curves.
   */
  _createTaskCurves(timeline) {
    const tasks = this.adapter.read('tasks', ['start', 'end', 'amount'],
        {timeline: timeline.id});
    const curves = [];
    tasks.forEach((task) => {
      try {
        const start = new CalendarWeek(task.start);
        const end = new CalendarWeek(task.end);
        const amount = parseFloat(task.amount.replace(',', '.'));
        if (CalendarWeek.duration(start, end) > 0 &&
            start.asInt >= timeline.startDate.asInt &&
            end.asInt <= timeline.endDate.asInt &&
            !isNaN(amount)) {
          const labels = CalendarWeek.range(start, end);
          curves.push({
            sum: amount,
            data: labels.map((label) => {
              return {x: label, y: ((amount / 5) * wfMod) / labels.length};
            }),
          });
        }
      } catch (e) {}
    });

    return curves;
  }

  /**
   * Meld curves of several timelines into one.
   * @param {Array} timelines - Objects with dates for valid timelines.
   * @param {Object} startDate - CalendarWeek instance.
   * @param {Object} endDate - CalendarWeek instance.
   * @param {bool} excludeTasks - Whether to exclude tasks from calculation.
   * @return {Object} Melded curve with sums and averages.
   */
  _meldCurves(timelines, startDate, endDate, excludeTasks) {
    const curve = [];
    const tlCurves = [];
    let tlSum = 0;
    let taskSum = 0;

    if (startDate === undefined || endDate === undefined) {
      return {
        timelineTotal: 0,
        timelineAverage: 0,
        taskTotal: 0,
        taskAverage: 0,
        curve,
      };
    }

    timelines.forEach((timeline) => {
      tlCurves.push({idx: -1, curve: this._createCurve(timeline)});
      tlSum += tlCurves[tlCurves.length - 1].curve.sum;
      if (!excludeTasks) {
        const taskCurves = this._createTaskCurves(timeline);
        taskCurves.forEach((taskCurve) => {
          tlCurves.push({idx: -1, curve: taskCurve});
          taskSum += taskCurve.sum;
        });
      }
    });
    const labels = CalendarWeek.range(startDate, endDate);
    labels.forEach((label) => {
      let val = 0;
      tlCurves.forEach((c) => {
        if (c.idx === -1 && c.curve.data.length > 0 &&
            c.curve.data[0].x === label) {
          c.idx = 0;
        }
        if (c.idx !== -1 && c.idx < c.curve.data.length) {
          val += c.curve.data[c.idx].y;
          ++c.idx;
        }
      });
      curve.push({x: label, y: val});
    });

    return {
      timelineTotal: Math.round(tlSum / wfMod),
      timelineAverage: ((tlSum / 5) / curve.length).toFixed(2),
      taskTotal: Math.round(taskSum / wfMod),
      taskAverage: ((taskSum / 5) / curve.length).toFixed(2),
      curve,
    };
  }

  /**
   * Meld start and end dates of several timelines into one.
   * @param {Array} timelines - IDs of timelines to meld.
   * @param {bool} excludeTasks - Whether to exclude tasks from calculation.
   * @return {Object} Melded timeline.
   */
  _meldTimelines(timelines, excludeTasks) {
    let startDate = undefined;
    let endDate = undefined;
    const validTimelines = [];

    timelines.forEach((id) => {
      const row = this.adapter.read('timelines', ['startDate', 'endDate'],
          {id})[0];
      let rowStart = undefined;
      let rowEnd = undefined;
      try {
        rowStart = new CalendarWeek(row.startDate);
        rowEnd = new CalendarWeek(row.endDate);

        if (CalendarWeek.duration(rowStart, rowEnd) > 0) {
          validTimelines.push({id, startDate: rowStart, endDate: rowEnd});
          if (startDate === undefined || rowStart.asInt < startDate.asInt) {
            startDate = rowStart;
          }
          if (endDate === undefined || rowEnd.asInt > endDate.asInt) {
            endDate = rowEnd;
          }
        }
      } catch (e) {}
    });
    return {startDate, endDate, ...this._meldCurves(validTimelines,
        startDate, endDate, excludeTasks)};
  }

  /**
   * Create summary for timelines.
   * @param {Array} timelines - IDs of timelines to use for summary.
   * @param {bool} [excludeTasks] - Whether to exclude tasks from calculation.
   * @return {Object} Summary results.
   */
  summary(timelines, excludeTasks) {
    const meldedTimeline = this._meldTimelines(timelines,
        excludeTasks === undefined ? false : excludeTasks);
    if (meldedTimeline.startDate === undefined ||
        meldedTimeline.endDate === undefined) {
      return {
        runtime: 'N/A',
        numQuarters: 0,
        quarters: [],
        total: {
          duration: 'N/A',
          allocated: 'N/A',
          workforce: 'N/A',
          timelineAllocated: 'N/A',
          timelineWorkforce: 'N/A',
          taskAllocated: 'N/A',
          taskWorkforce: 'N/A',
        },
        curve: [],
        start: 'N/A',
        end: 'N/A',
      };
    }
    const runtime = CalendarWeek.duration(meldedTimeline.startDate,
        meldedTimeline.endDate);
    const numQuarters = CalendarWeek.numQuarters(meldedTimeline.startDate,
        meldedTimeline.endDate);
    const quarters = [];
    let k;
    let idx = 0;
    let totalAllocated = 0;
    for (k = 0; k < numQuarters; ++k) {
      const quarter = CalendarWeek.quarter(meldedTimeline.startDate,
          meldedTimeline.endDate, k);
      let l;
      quarter.allocated = 0;
      for (l = 0; l < quarter.duration; ++l) {
        quarter.allocated += meldedTimeline.curve[idx].y / wfMod;
        ++idx;
      }
      quarter.allocated = Math.round(quarter.allocated * 5);
      totalAllocated += quarter.allocated;
      quarter.duration *= 5;
      quarter.workforce = quarter.allocated / quarter.duration;
      quarter.workforce = (quarter.workforce * wfMod).toFixed(2);
      quarters.push(quarter);
    }

    const curveLength = meldedTimeline.curve.length;
    const start = curveLength > 0 ?
        meldedTimeline.curve[0].x : 'N/A';
    const end = curveLength > 0 ?
        meldedTimeline.curve[curveLength - 1].x : 'N/A';

    let workforce = totalAllocated / (runtime * 5);
    workforce = (workforce * wfMod).toFixed(2);
    return {
      runtime,
      numQuarters,
      quarters,
      total: {
        duration: runtime * 5,
        allocated: totalAllocated,
        workforce,
        timelineAllocated: meldedTimeline.timelineTotal,
        timelineWorkforce: meldedTimeline.timelineAverage,
        taskAllocated: meldedTimeline.taskTotal,
        taskWorkforce: meldedTimeline.taskAverage,
      },
      curve: meldedTimeline.curve,
      start,
      end,
    };
  }
};
