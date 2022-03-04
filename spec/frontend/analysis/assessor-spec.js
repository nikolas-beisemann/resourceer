/* Copyright (c) 2021 Nikolas Beisemann */

const {Assessor} = require('../../../src/frontend/analysis/assessor');

describe('assessor', () => {
  let adapter;
  let tl1;
  let tl2;
  let tl3;
  let assessor;

  beforeEach(() => {
    adapter = require('../../../src/frontend/database/adapter-memory').adapter;
    const proj1 = adapter.create('projects', {name: 'Project1'});
    const proj2 = adapter.create('projects', {name: 'Project2'});
    tl1 = adapter.create('timelines', {
      project: proj1,
      name: 'Timeline1',
      startDate: '1/21',
      endDate: '52/21',
    });
    tl2 = adapter.create('timelines', {
      project: proj1,
      name: 'Timeline2',
      startDate: '4/21',
      endDate: '4/22',
    });
    tl3 = adapter.create('timelines', {
      project: proj2,
      name: 'Timeline3',
      startDate: '10/21',
      endDate: '40/21',
    });
    adapter.create('milestones', {
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
    assessor = new Assessor(adapter);
  });

  it('shall create summary for timeline', () => {
    const summary = assessor.summary([tl1]);
    expect(summary.runtime).toBe(52);
    expect(summary.numQuarters).toBe(4);
    expect(summary.quarters.length).toBe(4);
    let k;
    let durSum = 0;
    let allocSum = 0;
    const lowerExpA = [60, 90, 70, 40];
    const upperExpA = [90, 120, 100, 70];
    const lowerExpW = [1.2, 1.4, 1.2, 0.8];
    const upperExpW = [1.5, 1.7, 1.5, 1.1];
    for (k = 0; k < 4; ++k) {
      expect(summary.quarters[k].label).toBe(`Q${k + 1}/21`);
      expect(summary.quarters[k].duration).toBe(65);
      expect(summary.quarters[k].allocated).toBeGreaterThan(lowerExpA[k]);
      expect(summary.quarters[k].allocated).toBeLessThan(upperExpA[k]);
      expect(summary.quarters[k].workforce).toBeGreaterThan(lowerExpW[k]);
      expect(summary.quarters[k].workforce).toBeLessThan(upperExpW[k]);
      durSum += summary.quarters[k].duration;
      allocSum += summary.quarters[k].allocated;
    }
    expect(summary.total.duration).toBe(durSum);
    expect(summary.total.allocated).toBe(allocSum);
    expect(summary.total.workforce).toBeGreaterThan(1.2);
    expect(summary.total.workforce).toBeLessThan(1.5);
    expect(summary.total.timelineAllocated).toBeGreaterThan(250);
    expect(summary.total.timelineAllocated).toBeLessThan(260);
    expect(summary.total.timelineWorkforce).toBeGreaterThan(1.1);
    expect(summary.total.timelineWorkforce).toBeLessThan(1.2);
    expect(summary.total.taskAllocated).toBe(42);
    expect(summary.total.taskWorkforce).toBeGreaterThan(0.15);
    expect(summary.total.taskWorkforce).toBeLessThan(0.25);
    expect(summary.curve.length).toBe(52);
    expect(summary.curve[0].x).toBe('1/21');
    expect(summary.curve[0].y).toBeGreaterThan(1);
    expect(summary.curve[0].y).toBeLessThan(1.1);
    expect(summary.curve[summary.curve.length - 1].x).toBe('52/21');
    expect(summary.curve[summary.curve.length - 1].y).toBe(0.8);
  });

  it('shall create summary for multiple timelines', () => {
    const summary = assessor.summary([tl1, tl2, tl3]);
    expect(summary.runtime).toBe(56);
    expect(summary.numQuarters).toBe(5);
    expect(summary.quarters.length).toBe(5);
    expect(summary.total.duration).toBe(56*5);
    expect(summary.curve.length).toBe(56);
    expect(summary.curve[0].x).toBe('1/21');
    expect(summary.curve[0].y).toBeGreaterThan(1);
    expect(summary.curve[0].y).toBeLessThan(1.1);
    expect(summary.curve[summary.curve.length - 1].x).toBe('4/22');
    expect(summary.curve[summary.curve.length - 1].y).toBe(0);
  });

  it('shall handle invalid requests', () => {
    const summary = assessor.summary([]);
    expect(summary.runtime).toBe('N/A');
    expect(summary.numQuarters).toBe(0);
    expect(summary.quarters.length).toBe(0);
    expect(summary.total.duration).toBe('N/A');
    expect(summary.total.allocated).toBe('N/A');
    expect(summary.total.workforce).toBe('N/A');
    expect(summary.total.timelineAllocated).toBe('N/A');
    expect(summary.total.timelineWorkforce).toBe('N/A');
    expect(summary.total.taskAllocated).toBe('N/A');
    expect(summary.total.timelineWorkforce).toBe('N/A');
  });

  it('shall provide start and end date literals', () => {
    const summary = assessor.summary([tl1]);
    expect(summary.start).toBe('1/21');
    expect(summary.end).toBe('52/21');
  });
  it('shall provide N/A as date literals when invalid', () => {
    const summary = assessor.summary([]);
    expect(summary.start).toBe('N/A');
    expect(summary.end).toBe('N/A');
  });
});
