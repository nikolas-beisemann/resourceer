/* Copyright (c) 2021 Nikolas Beisemann */

const {Builder, By, until, Key} = require('selenium-webdriver');
const {pathToFileURL} = require('url');

describe('check-summaries', () => {
  let driver;
  let originalTimeout;

  beforeEach(async () => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    driver = await new Builder().forBrowser('firefox').build();
  });
  afterEach(async () => {
    await driver.quit();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  const checkSummary = async (expected) => {
    if (expected.num !== undefined) {
      const num = await driver.wait(until.elementLocated(By.css(
          '#summary-t1 tr:nth-child(1) td')), 1000);
      expect(await num.getText()).toBe(expected.num);
    }
    if (expected.start !== undefined) {
      const start = await driver.wait(until.elementLocated(By.css(
          '#summary-t1 tr:nth-child(2) td')), 1000);
      expect(await start.getText()).toBe(expected.start);
    }
    if (expected.end !== undefined) {
      const end = await driver.wait(until.elementLocated(By.css(
          '#summary-t1 tr:nth-child(3) td')), 1000);
      expect(await end.getText()).toBe(expected.end);
    }
    if (expected.runtime !== undefined) {
      const runtime = await driver.wait(until.elementLocated(By.css(
          '#summary-t1 tr:nth-child(4) td')), 1000);
      expect(await runtime.getText()).toBe(expected.runtime);
    }
    if (expected.workdays !== undefined) {
      const workdays = await driver.wait(until.elementLocated(By.css(
          '#summary-t1 tr:nth-child(5) td')), 1000);
      expect(await workdays.getText()).toBe(expected.workdays);
    }
    if (expected.numQuarters !== undefined) {
      const numQuarters = await driver.wait(until.elementLocated(By.css(
          '#summary-t1 tr:nth-child(6) td')), 1000);
      expect(await numQuarters.getText()).toBe(expected.numQuarters);
    }

    if (expected.timeline !== undefined) {
      const timeline = await driver.wait(until.elementLocated(By.css(
          '#summary-t2 tbody tr:nth-child(1) td:nth-child(2)')), 1000);
      expected.timeline(await timeline.getText());
    }
    if (expected.task !== undefined) {
      const task = await driver.wait(until.elementLocated(By.css(
          '#summary-t2 tbody tr:nth-child(2) td:nth-child(2)')), 1000);
      expected.task(await task.getText());
    }
    if (expected.sum !== undefined) {
      const sum = await driver.wait(until.elementLocated(By.css(
          '#summary-t2 tbody tr:nth-child(3) td:nth-child(2)')), 1000);
      expected.sum(await sum.getText());
    }
  };

  const createProject = async () => {
    const btn = await driver.wait(until.elementLocated(By.css(
        '#projects .bi-plus-square')), 1000);
    await btn.click();
  };
  const selectProject = async (n) => {
    const btn = await driver.wait(until.elementLocated(By.css(
        `#projects li:nth-child(${n})`)), 1000);
    await btn.click();
  };
  const createTimeline = async (start, end) => {
    const btn = await driver.wait(until.elementLocated(By.css(
        '#timelines .bi-plus-square')), 1000);
    await btn.click();
    const startField = await driver.wait(until.elementLocated(By.css(
        '#timeline-start-date')), 1000);
    await startField.sendKeys(start, Key.ENTER);
    const endField = await driver.wait(until.elementLocated(By.css(
        '#timeline-end-date')), 1000);
    await endField.sendKeys(end, Key.ENTER);
  };
  const selectTimeline = async (n) => {
    const btn = await driver.wait(until.elementLocated(By.css(
        `#timelines button:nth-child(${n + 1}`)), 1000);
    await btn.click();
  };
  const createAlloc = async (date, amount) => {
    const btn = await driver.wait(until.elementLocated(By.css(
        '#timeline-alloc-collapse .bi-plus-square')), 1000);
    await btn.click();
    const dateField = await driver.wait(until.elementLocated(By.css(
        '#timeline-alloc-collapse tbody tr:last-child td:nth-child(1) input')),
    1000);
    await dateField.sendKeys(date, Key.ENTER);
    const amountField = await driver.wait(until.elementLocated(By.css(
        '#timeline-alloc-collapse tbody tr:last-child td:nth-child(2) input')),
    1000);
    await amountField.sendKeys(amount, Key.ENTER);
  };
  const createTask = async (start, end, amount) => {
    const btn = await driver.wait(until.elementLocated(By.css(
        '#timeline-task-collapse .bi-plus-square')), 1000);
    await btn.click();
    const startField = await driver.wait(until.elementLocated(By.css(
        '#timeline-task-collapse tbody tr:last-child td:nth-child(1) input')),
    1000);
    await startField.sendKeys(start, Key.ENTER);
    const endField = await driver.wait(until.elementLocated(By.css(
        '#timeline-task-collapse tbody tr:last-child td:nth-child(2) input')),
    1000);
    await endField.sendKeys(end, Key.ENTER);
    const amountField = await driver.wait(until.elementLocated(By.css(
        '#timeline-task-collapse tbody tr:last-child td:nth-child(4) input')),
    1000);
    await amountField.sendKeys(amount, Key.ENTER);
  };

  it('shall provide overall and project summaries', async () => {
    // Alice hits up the front page, and wants to view summaries provided for
    // her projects.
    await driver.get(pathToFileURL('dist/index.html'));

    // She is greeted with an empty overall summary page.
    await checkSummary({
      num: '0',
      start: 'N/A',
      end: 'N/A',
      runtime: 'N/A',
      workdays: 'N/A',
      numQuarters: '0',
      timeline: (val) => expect(val).toBe('N/A'),
      task: (val) => expect(val).toBe('N/A'),
      sum: (val) => expect(val).toBe('N/A'),
    });

    // She creates a project and is greeted with an empty project summary page.
    await createProject();
    await checkSummary({
      num: '0',
      start: 'N/A',
      end: 'N/A',
      runtime: 'N/A',
      workdays: 'N/A',
      numQuarters: '0',
      timeline: (val) => expect(val).toBe('N/A'),
      task: (val) => expect(val).toBe('N/A'),
      sum: (val) => expect(val).toBe('N/A'),
    });

    // She creates two timelines and fills them with some data.
    await createTimeline('1/21', '52/21');
    await createAlloc('1/21', '0,5');
    await createAlloc('40/21', '3');
    await createAlloc('52/21', '0,8');
    await createTask('1/21', '20/21', '60');

    await createTimeline('20/21', '19/22');
    await createAlloc('20/21', '1');
    await createAlloc('10/22', '0,5');
    await createTask('10/22', '19/22', '100');

    // Switching back to the project summary she can see that the changes are
    // merged.
    await selectTimeline(0);
    await checkSummary({
      num: '2',
      start: '1/21',
      end: '19/22',
      runtime: '71',
      workdays: '355',
      numQuarters: '6',
      timeline: (val) => expect(parseInt(val)).toBeGreaterThan(0),
      task: (val) => expect(val).toBe('160'),
      sum: (val) => expect(parseInt(val)).toBeGreaterThan(160),
    });

    // She creates a second project and repeats the process.
    await createProject();
    await createTimeline('1/22', '52/22');
    await createAlloc('1/22', '1');
    await createAlloc('52/22', '2');
    await createTask('1/22', '10/22', '100');
    await selectTimeline(0);
    await checkSummary({
      num: '1',
      start: '1/22',
      end: '52/22',
      runtime: '52',
      workdays: '260',
      numQuarters: '4',
      task: (val) => expect(val).toBe('100'),
      sum: (val) => expect(parseInt(val)).toBeGreaterThan(100),
    });

    // She switches to the overall summary by deselecting the current project,
    // and verifies that it merges the data of her two projects.
    await selectProject(2);
    await checkSummary({
      num: '2',
      start: '1/21',
      end: '52/22',
      runtime: '104',
      workdays: '520',
      numQuarters: '8',
      task: (val) => expect(val).toBe('260'),
      sum: (val) => expect(parseInt(val)).toBeGreaterThan(260),
    });
  });
});
