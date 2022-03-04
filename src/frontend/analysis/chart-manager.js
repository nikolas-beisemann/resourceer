/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {Assessor} = require('./assessor');
const {CalendarWeek} = require('../util/calendar-week');

exports.ChartManager = class {
  /**
   * Create new chart manager.
   * @param {Object} adapter - Adapter to use for database access.
   * @param {Object} lang - Language pack to use for localization.
   */
  constructor(adapter, lang) {
    this.adapter = adapter;
    this.lang = lang;
    this.assessor = new Assessor(adapter);
    this.activeProject = 0;
    this.activeTimeline = 0;
    this._chartData = {
      labels: [],
      datasets: [],
      options: {
        plugins: {
          autocolors: false,
          annotation: {
            annotations: {},
          },
        },
      },
    };
    this._buildChartData();
  }

  /** Rebuild chart data. */
  _buildChartData() {
    this._buildSummaries();

    this._chartData.labels = this._buildLabels();

    this._chartData.datasets = [];
    this._buildGlobalDataset();
    this._buildProjectDataset();
    this._buildTimelineDataset();

    this._chartData.options.plugins.annotation.annotations = {};
    this._buildAnnotations();
  }

  /** Compute data for charts. */
  _buildSummaries() {
    let ids = this.adapter.read('timelines', ['id']).map((tl) => tl.id);
    this.globalSummary = this.assessor.summary(ids);
    this.globalSummary.label = this.lang.total;
    if (this.activeProject !== 0) {
      ids = this.adapter.read('timelines', ['id'],
          {project: this.activeProject}).map((tl) => tl.id);
      this.projectSummary = this.assessor.summary(ids);
      this.projectSummary.label = this.adapter.read('projects', ['name'],
          {id: this.activeProject})[0].name;
    } else {
      this.projectSummary = undefined;
    }
    if (this.activeTimeline !== 0) {
      this.timelineSummary = this.assessor.summary([this.activeTimeline]);
      this.timelineSummary.label = this.adapter.read('timelines', ['name'],
          {id: this.activeTimeline})[0].name;
    } else {
      this.timelineSummary = undefined;
    }
  }

  /**
   * Compute labels for current view.
   * @return {Array} Labels.
   */
  _buildLabels() {
    let start = this.globalSummary.start;
    let end = this.globalSummary.end;
    if (this.timelineSummary !== undefined) {
      start = this.timelineSummary.start;
      end = this.timelineSummary.end;
    } else if (this.projectSummary !== undefined) {
      start = this.projectSummary.start;
      end = this.projectSummary.end;
    }

    try {
      const cwStart = new CalendarWeek(start);
      const cwEnd = new CalendarWeek(end);

      return CalendarWeek.range(cwStart, cwEnd);
    } catch (e) {}
    return [];
  }

  /**
   * Trim a larger curve into current view.
   * @param {Array} curve - Curve to be trimmed.
   * @return {Array} Trimmed curve.
   */
  _trimCurve(curve) {
    const trimmedCurve = [];
    const nLabels = this._chartData.labels.length;
    if (nLabels > 0) {
      let k = 0;
      let copy = false;
      while (k < curve.length) {
        if (curve[k].x === this._chartData.labels[0]) {
          copy = true;
        }
        if (copy) {
          trimmedCurve.push(curve[k]);
        }

        if (curve[k].x === this._chartData.labels[nLabels - 1]) {
          break;
        }
        ++k;
      }
    }
    return trimmedCurve;
  }

  /** Build global dataset. */
  _buildGlobalDataset() {
    if (this.globalSummary !== undefined) {
      if (this.projectSummary !== undefined) {
        this._chartData.datasets.push({
          type: 'bar',
          label: this.globalSummary.label,
          data: this._trimCurve(this.globalSummary.curve),
          borderColor: 'rgba(255, 99, 132, 0.2)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        });
      } else {
        this._chartData.datasets.push({
          type: 'line',
          label: this.globalSummary.label,
          data: this.globalSummary.curve,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgb(255, 99, 132)',
        });
      }
    }
  }

  /** Build project dataset. */
  _buildProjectDataset() {
    if (this.projectSummary !== undefined) {
      this._chartData.datasets.push({
        type: 'line',
        label: this.projectSummary.label,
        data: this._trimCurve(this.projectSummary.curve),
        borderColor: '#264653',
        backgroundColor: '#264653',
      });
    }
  }

  /** Build timeline dataset. */
  _buildTimelineDataset() {
    if (this.timelineSummary !== undefined) {
      this._chartData.datasets.push({
        type: 'line',
        label: this.timelineSummary.label,
        data: this.timelineSummary.curve,
        borderColor: '#2a9d8f',
        backgroundColor: '#2a9d8f',
      });
    }
  }

  /** Build annotations from milestones. */
  _buildAnnotations() {
    if (this.timelineSummary !== undefined) {
      const milestones = this.adapter.read('milestones', ['name', 'dueDate'],
          {timeline: this.activeTimeline});
      const annotations =
          this._chartData.options.plugins.annotation.annotations;
      milestones.forEach((milestone, idx) => {
        try {
          const date = new CalendarWeek(milestone.dueDate);
          const start = new CalendarWeek(this.timelineSummary.start);
          const end = new CalendarWeek(this.timelineSummary.end);
          if (CalendarWeek.duration(start, date) > 0 &&
              CalendarWeek.duration(date, end) > 0) {
            annotations[`milestone${idx}`] = {
              type: 'line',
              xMin: date.asString,
              xMax: date.asString,
              borderColor: '#2a9d8f',
              borderWidth: 2,
              label: {
                content: milestone.name,
                enabled: true,
                position: 'start',
              },
            };
          }
        } catch (e) {}
      });
    }
  }

  /**
   * To be used when switching projects.
   * @param {int} id - Active project, or 0 if none.
   */
  activateProject(id) {
    this.activeProject = id;
    this.activeTimeline = 0;
    this._buildChartData();
  }

  /**
   * To be used when switching timelines.
   * @param {int} id - Active timeline, or 0 if none.
   */
  activateTimeline(id) {
    this.activeTimeline = id;
    this._buildChartData();
  }

  /** To be used when the database has updated. */
  recalculate() {
    this._buildChartData();
  }

  /** Cached chart data. */
  get chartData() {
    return this._chartData;
  }
};
