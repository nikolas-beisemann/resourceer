/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {ChartManager} = require('../../../src/frontend/analysis/chart-manager');

describe('chart-manager', () => {
  let adapter;
  let chartManager;
  let proj1;
  let tl1;
  let ms1;

  beforeEach(() => {
    const {Adapter} = require('../../../src/frontend/database/adapter-memory');
    adapter = new Adapter({
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
    proj1 = adapter.create('projects', {name: 'Project1'});
    const proj2 = adapter.create('projects', {name: 'Project2'});
    tl1 = adapter.create('timelines', {
      project: proj1,
      name: 'Timeline1',
      startDate: '1/21',
      endDate: '52/21',
    });
    const tl2 = adapter.create('timelines', {
      project: proj1,
      name: 'Timeline2',
      startDate: '4/21',
      endDate: '4/22',
    });
    const tl3 = adapter.create('timelines', {
      project: proj2,
      name: 'Timeline3',
      startDate: '10/21',
      endDate: '40/21',
    });
    ms1 = adapter.create('milestones', {
      timeline: tl1,
      name: 'Milestone1',
      dueDate: '10/21',
    });
    adapter.create('milestone', {
      timeline: tl2,
      name: 'Milestone2',
      dueDate: '30/21',
    });
    adapter.create('allocations', {
      timeline: tl1,
      date: '1/21',
      amount: '0,5',
    });
    adapter.create('allocations', {
      timeline: tl1,
      date: '26/21',
      amount: '1,5',
    });
    adapter.create('allocations', {
      timeline: tl1,
      date: '52/21',
      amount: '0,8',
    });
    adapter.create('allocations', {
      timeline: tl2,
      date: '8/21',
      amount: '1',
    });
    adapter.create('allocations', {
      timeline: tl2,
      date: '1/22',
      amount: '0,7',
    });
    adapter.create('allocations', {
      timeline: tl3,
      date: '20/21',
      amount: '2',
    });
    adapter.create('allocations', {
      timeline: tl3,
      date: '40/21',
      amount: '1',
    });
    adapter.create('tasks', {
      timeline: tl1,
      name: 'Task1',
      start: '1/21',
      end: '20/21',
      amount: '50',
    });
    adapter.create('tasks', {
      timeline: tl3,
      name: 'Task2',
      start: '12/21',
      end: '20/21',
      amount: '150',
    });
    chartManager = new ChartManager(adapter, {total: ''});
  });

  it('shall create chart data without active project', () => {
    expect(chartManager.chartData.labels.length).toBe(56);
    expect(chartManager.chartData.datasets.length).toBe(1);
  });

  it('shall create two charts when project is selected', () => {
    chartManager.activateProject(proj1);
    expect(chartManager.chartData.labels.length).toBe(56);
    expect(chartManager.chartData.datasets.length).toBe(2);
  });

  it('shall create three charts when timeline is selected', () => {
    chartManager.activateProject(proj1);
    chartManager.activateTimeline(tl1);
    expect(chartManager.chartData.labels.length).toBe(52);
    expect(chartManager.chartData.datasets.length).toBe(3);
  });

  it('shall allow to deselect timelines', () => {
    chartManager.activateProject(proj1);
    chartManager.activateTimeline(tl1);
    chartManager.activateTimeline(0);
    expect(chartManager.chartData.datasets.length).toBe(2);
  });

  it('shall allow to deselect projects', () => {
    chartManager.activateProject(proj1);
    chartManager.activateProject(0);
    expect(chartManager.chartData.datasets.length).toBe(1);
  });

  it('shall update on database change', () => {
    adapter.update('timelines', {endDate: '52/22'}, {id: tl1});
    chartManager.recalculate();
    expect(chartManager.chartData.labels.length).toBe(104);
  });

  it('shall create annotations on timeline view', () => {
    chartManager.activateProject(proj1);
    chartManager.activateTimeline(tl1);
    const annotations =
        chartManager.chartData.options.plugins.annotation.annotations;
    expect(annotations.milestone0.xMin).toBe('10/21');
    expect(annotations.milestone0.label.content).toBe('Milestone1');
  });

  it('shall not create annotations on project view', () => {
    chartManager.activateProject(proj1);
    const annotations =
        chartManager.chartData.options.plugins.annotation.annotations;
    expect(annotations.milestone0).toBe(undefined);
  });

  it('shall not create annotations on global view', () => {
    const annotations =
        chartManager.chartData.options.plugins.annotation.annotations;
    expect(annotations.milestone0).toBe(undefined);
  });

  it('shall use uniform milestone labels', () => {
    adapter.update('milestones', {dueDate: '02/21'}, {id: ms1});
    chartManager.recalculate();
    chartManager.activateProject(proj1);
    chartManager.activateTimeline(tl1);
    const annotations =
        chartManager.chartData.options.plugins.annotation.annotations;
    expect(annotations.milestone0.xMin).toBe('2/21');
  });
});
