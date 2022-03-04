/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {Builder, By, until} = require('selenium-webdriver');
const {pathToFileURL} = require('url');

describe('delete-artifacts', () => {
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

  it('shall allow to delete artifacts', async () => {
    // Alice hits up the front page, and wants to check out how easy it is to
    // delete the artifacts she creates.
    await driver.get(pathToFileURL('dist/index.html'));

    // She creates a new project
    const createProject = await driver.wait(until.elementLocated(By.css(
        '#projects .bi-plus-square')), 1000);
    await createProject.click();
    // ... and some artifacts
    const createTimeline = await driver.wait(until.elementLocated(By.css(
        '#timelines .bi-plus-square')), 1000);
    await createTimeline.click();
    const createMilestone = await driver.wait(until.elementLocated(By.css(
        '#timeline-ms-collapse .bi-plus-square')), 1000);
    await createMilestone.click();
    const createAlloc = await driver.wait(until.elementLocated(By.css(
        '#timeline-alloc-collapse .bi-plus-square')), 1000);
    await createAlloc.click();
    const createTask = await driver.wait(until.elementLocated(By.css(
        '#timeline-task-collapse .bi-plus-square')), 1000);
    await createTask.click();

    // She notices the delete button next to milestones, allocations, and
    // tasks. She clicks each one, and sees the entries disappear.
    const deleteMilestone = await driver.wait(until.elementLocated(By.css(
        '#timeline-ms-collapse .bi-x-square')), 1000);
    await deleteMilestone.click();
    const milestoneBody = await driver.wait(until.elementLocated(By.css(
        '#timeline-ms-collapse tbody tr td')), 1000);
    expect(await milestoneBody.getText()).toContain('keine Meilensteine');
    const deleteAlloc = await driver.wait(until.elementLocated(By.css(
        '#timeline-alloc-collapse .bi-x-square')), 1000);
    await deleteAlloc.click();
    const allocBody = await driver.wait(until.elementLocated(By.css(
        '#timeline-alloc-collapse tbody tr td')), 1000);
    expect(await allocBody.getText()).toContain('keine Prädiktionen');
    const deleteTask = await driver.wait(until.elementLocated(By.css(
        '#timeline-task-collapse .bi-x-square')), 1000);
    await deleteTask.click();
    const taskBody = await driver.wait(until.elementLocated(By.css(
        '#timeline-task-collapse tbody tr td')), 1000);
    expect(await taskBody.getText()).toContain('keine Beauftragungen');

    // She also finds the timeline delete button, and sees the confirmation
    // query on clicking it.
    const deleteTimeline = await driver.wait(until.elementLocated(By.css(
        '#timelines .bi-x-square')), 1000);
    await deleteTimeline.click();
    // She first selects "no"; the timeline stays visible.
    const noDeleteTimeline = await driver.wait(until.elementLocated(By.css(
        '.alert .btn-primary')), 1000);
    await noDeleteTimeline.click();
    let timelineLabel = await driver.wait(until.elementLocated(By.css(
        '#timelines button:nth-child(2) span')), 1000);
    expect(await timelineLabel.getText()).toContain('Neue Zeitschiene');
    // Then she really deletes the timeline and it disappears.
    await deleteTimeline.click();
    const doDeleteTimeline = await driver.wait(until.elementLocated(By.css(
        '.alert .btn-danger')), 1000);
    await doDeleteTimeline.click();
    timelineLabel = await driver.wait(until.elementLocated(By.css(
        '#timelines button:nth-child(2) span')), 1000);
    expect(await timelineLabel.getText()).not.toContain('Neue Zeitschiene');

    // She does the same thing for the project.
    const deleteProject = await driver.wait(until.elementLocated(By.css(
        'h1 .bi-x-square')), 1000);
    await deleteProject.click();
    // Pressing "no".
    const noDeleteProject = await driver.wait(until.elementLocated(By.css(
        '.alert .btn-primary')), 1000);
    await noDeleteProject.click();
    const projectLabel = await driver.wait(until.elementLocated(By.css(
        'h1')), 1000);
    expect(await projectLabel.getText()).toContain('Neues Projekt');
    // Really deleting.
    await deleteProject.click();
    const doDeleteProject = await driver.wait(until.elementLocated(By.css(
        '.alert .btn-danger')), 1000);
    await doDeleteProject.click();
    const appContent = await driver.wait(until.elementLocated(By.css(
        '#app')), 1000);
    expect(await appContent.getAttribute('innerHTML')).not.toContain(
        'Neues Projekt');
  });
});
