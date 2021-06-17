/* Copyright (c) 2021 Nikolas Beisemann */

// eslint should not complain about the unused variables, because we need the
// files to be packaged by browserify. this only happens if we require them.
/* eslint-disable no-unused-vars */
const bootstrap = require('bootstrap/dist/js/bootstrap');
/* eslint-enable no-unused-vars */

const {adapter} = require('./database/adapter-memory.js');
const translations = require('../../language.json');
const {Assessor} = require('./analysis/assessor');
const {ChartManager} = require('./analysis/chart-manager');
const Vue = require('vue');
const Chart = require('chart.js');
const chartAnnotations = require('chartjs-plugin-annotation');
Chart.register(chartAnnotations);

let assessor = new Assessor(adapter);
let chartManager = new ChartManager(adapter, translations);
const chart = new Chart('visual', {data: {labels: [], datasets: []}});
const updateChart = () => {
  chart.data.labels = [...chartManager.chartData.labels];
  chart.data.datasets = [...chartManager.chartData.datasets];
  chart.options = {...chartManager.chartData.options};
  chart.update('none');
};
updateChart();

const Resourceer = {
  data() {
    if (adapter.onReload !== undefined) {
      adapter.onReload(() => {
        this.active = 0;
        this.projects = [...adapter.read('projects', ['id', 'name'])];
        assessor = new Assessor(adapter);
        chartManager = new ChartManager(adapter, translations);
        updateChart();
        const tls = adapter.read('timelines', ['id']).map((row) => row.id);
        this.summary = assessor.summary(tls);
      });
    }
    const ids = adapter.read('timelines', ['id']).map((row) => row.id);
    return {
      active: 0,
      projects: [...adapter.read('projects', ['id', 'name'])],
      summary: assessor.summary(ids),
    };
  },
  methods: {
    selectProject(id) {
      if (this.active !== id) {
        this.active = id;
        chartManager.activateProject(this.active);
      } else {
        this.active = 0;
        chartManager.activateProject(this.active);
        const ids = adapter.read('timelines', ['id']).map((row) => row.id);
        this.summary = assessor.summary(ids);
      }
      updateChart();
    },
    createProject() {
      const id = adapter.create('projects', {name: translations.newProject});
      if (id !== undefined) {
        this.projects.push({id, name: translations.newProject});
        this.active = id;
        chartManager.activateProject(this.active);
        updateChart();
      }
    },
    updateProject(e, id, name) {
      this.projects.forEach((project) => {
        if (project.id === id) {
          project.name = name;
        }
      });
    },
    deletedProject() {
      this.projects = [...adapter.read('projects', ['id', 'name'])];
      this.active = 0;
      chartManager.activateProject(this.active);
      updateChart();
    },
    selectTimeline(e, id) {
      chartManager.activateTimeline(id);
      updateChart();
    },
    recalculate() {
      chartManager.recalculate();
      updateChart();
    },
  },
};

const resourceer = Vue.createApp(Resourceer);
resourceer.component('project',
    require('./components/project').component(adapter, translations));
resourceer.component('timeline',
    require('./components/timeline').component(adapter, translations));
resourceer.component('milestone',
    require('./components/milestone').component(adapter, translations));
resourceer.component('allocation',
    require('./components/allocation').component(adapter, translations));
resourceer.component('task',
    require('./components/task').component(adapter, translations));
resourceer.mount('#app');

if (window.native !== undefined) {
  const api = window.native;
  api.onLoad((arg) => {
    adapter.restore(arg);
  });
  api.onSave(() => {
    return adapter.dump([
      'projects',
      'timelines',
      'milestones',
      'allocations',
      'tasks',
    ]);
  });
  adapter.onDirty(() => {
    api.dirty();
  });
  api.onClean(() => {
    adapter.setClean();
  });
}
