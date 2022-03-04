/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {Builder, By, until, Key} = require('selenium-webdriver');
const {pathToFileURL} = require('url');

describe('create-project', () => {
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

  const clickNewProject = async () => {
    const createProject = await driver.wait(until.elementLocated(By.css(
        '#projects.nav > li > a.bi-plus-square')), 1000);
    await createProject.click();
  };
  const editProjectTitle = async (title) => {
    const editProject = await driver.wait(until.elementLocated(By.css(
        'h1 > .bi-pencil-square')), 1000);
    await editProject.click();
    const projectTitleEdit = await driver.wait(until.elementLocated(By.css(
        '#project-title')), 1000);
    await projectTitleEdit.sendKeys(Key.CONTROL + 'a', Key.DELETE);
    await projectTitleEdit.sendKeys(title, Key.ENTER);
  };

  const clickNewTimeline = async () => {
    const createTimeline = await driver.wait(until.elementLocated(By.css(
        '#timelines.nav > button > span.bi-plus-square')), 1000);
    await createTimeline.click();
  };
  const editTimelineTitle = async (title) => {
    const editTimeline = await driver.wait(until.elementLocated(By.css(
        '#timelines.nav > button.active > span > .bi-pencil-square')), 1000);
    await editTimeline.click();
    const timelineTitleEdit = await driver.wait(until.elementLocated(By.css(
        '#timeline-title')), 1000);
    await timelineTitleEdit.sendKeys(Key.CONTROL + 'a', Key.DELETE);
    await timelineTitleEdit.sendKeys(title, Key.ENTER);
  };

  const editTimelineStartDate = async (date) => {
    const startDate = await driver.wait(until.elementLocated(By.css(
        '#timeline-start-date')), 1000);
    await startDate.sendKeys(Key.CONTROL + 'a', Key.DELETE);
    await startDate.sendKeys(date, Key.ENTER);
  };
  const editTimelineEndDate = async (date) => {
    const endDate = await driver.wait(until.elementLocated(By.css(
        '#timeline-end-date')), 1000);
    await endDate.sendKeys(Key.CONTROL + 'a', Key.DELETE);
    await endDate.sendKeys(date, Key.ENTER);
  };

  const editDescription = async (content) => {
    const descriptionEdit = await driver.wait(until.elementLocated(By.css(
        '#timeline-desc-collapse p > .bi-pencil-square')), 1000);
    await descriptionEdit.click();
    const descriptionEditor = await driver.wait(until.elementLocated(By.css(
        '#mdeditor')), 1000);
    await descriptionEditor.sendKeys(Key.CONTROL + 'a', Key.DELETE);
    await descriptionEditor.sendKeys(content, Key.TAB);
  };

  const addMilestone = async (date, name) => {
    const milestoneAdd = await driver.wait(until.elementLocated(By.css(
        '#timeline-ms-collapse tr > td .bi-plus-square')), 1000);
    await milestoneAdd.click();
    const milestoneDate = await driver.wait(until.elementLocated(By.css(
        '#timeline-ms-collapse tbody tr:last-child td:nth-child(1) > input')),
    1000);
    await milestoneDate.sendKeys(Key.CONTROL + 'a', Key.DELETE);
    await milestoneDate.sendKeys(date, Key.ENTER);
    const milestoneName = await driver.wait(until.elementLocated(By.css(
        '#timeline-ms-collapse tbody tr:last-child td:nth-child(2) > input')),
    1000);
    await milestoneName.sendKeys(Key.CONTROL + 'a', Key.DELETE);
    await milestoneName.sendKeys(name, Key.ENTER);
  };

  const addAllocation = async (date, amount) => {
    const allocationAdd = await driver.wait(until.elementLocated(By.css(
        '#timeline-alloc-collapse tr > td .bi-plus-square')), 1000);
    await allocationAdd.click();
    const allocationDate = await driver.wait(until.elementLocated(By.css(
        '#timeline-alloc-collapse tbody tr:last-child td:nth-child(1) input')),
    1000);
    await allocationDate.sendKeys(Key.CONTROL + 'a', Key.DELETE);
    await allocationDate.sendKeys(date, Key.ENTER);
    const allocationAmount = await driver.wait(until.elementLocated(By.css(
        '#timeline-alloc-collapse tbody tr:last-child td:nth-child(2) input')),
    1000);
    await allocationAmount.sendKeys(Key.CONTROL + 'a', Key.DELETE);
    await allocationAmount.sendKeys(amount, Key.ENTER);
  };

  const addTask = async (start, end, name, amount) => {
    const taskAdd = await driver.wait(until.elementLocated(By.css(
        '#timeline-task-collapse tr > td .bi-plus-square')), 1000);
    await taskAdd.click();
    let k;
    const arr = [start, end, name, amount];
    for (k = 0; k < arr.length; ++k) {
      const val = arr[k];
      const idx = k + 1;

      const taskField = await driver.wait(until.elementLocated(By.css(
          `#timeline-task-collapse tbody tr:last-child
          td:nth-child(${idx}) > input`)), 1000);
      await taskField.sendKeys(Key.CONTROL + 'a', Key.DELETE);
      await taskField.sendKeys(val, Key.ENTER);
    }
  };

  it('shall allow to create a new project', async () => {
    // Alice hits up the front page and checks out the title. She can see that
    // she indeed landed on the project resource manager she was looking for.
    await driver.get(pathToFileURL('dist/index.html'));
    expect(await driver.getTitle()).toContain('Resourceer');

    // She notices the button to create new projects, and clicks it. She can
    // see the new project being created, as indicated by the title on top.
    await clickNewProject();
    let projectTitle = await driver.wait(until.elementLocated(By.tagName(
        'h1')), 1000);
    expect(await projectTitle.getText()).toContain('Neues Projekt');

    // Since the default name is not very speaking, she wants to change the
    // project name to something she identify when coming back.
    await editProjectTitle('World Domination');
    projectTitle = await driver.wait(until.elementLocated(By.tagName(
        'h1')), 1000);
    expect(await projectTitle.getText()).toContain('World Domination');

    // She creates a second project that she wants to address later, so she
    // does not forget.
    await clickNewProject();
    await editProjectTitle('Space Flight');
    projectTitle = await driver.wait(until.elementLocated(By.tagName(
        'h1')), 1000);
    expect(await projectTitle.getText()).toContain('Space Flight');

    // Alice switches back to her world domination project, and is pleased to
    // notice that the title has updated as well.
    const worldDomination = await driver.wait(until.elementLocated(By.css(
        '#projects.nav > li:first-child > a')), 1000);
    expect(await worldDomination.getText()).toContain('World Domination');
    await worldDomination.click();
    projectTitle = await driver.wait(until.elementLocated(By.tagName(
        'h1')), 1000);
    expect(await projectTitle.getText()).toContain('World Domination');

    // She wants to create a new timeline for her world domination project. She
    // verifies that the timeline is being created and active by the
    // timeline configuration available.
    await clickNewTimeline();
    await editTimelineTitle('Planning Phase');
    let timelineTitle = await driver.wait(until.elementLocated(By.css(
        '#timelines.nav > button.active')), 1000);
    expect(await timelineTitle.getText()).toContain('Planning Phase');

    // She creates a second timeline that she wants to address later, so she
    // does not forget.
    await clickNewTimeline();
    await editTimelineTitle('Execution Phase');
    timelineTitle = await driver.wait(until.elementLocated(By.css(
        '#timelines.nav > button.active')), 1000);
    expect(await timelineTitle.getText()).toContain('Execution Phase');

    // Alice switches back to her planning phase timeline.
    let planningPhase = await driver.wait(until.elementLocated(By.css(
        '#timelines.nav > button:nth-child(2)')), 1000);
    await planningPhase.click();
    timelineTitle = await driver.wait(until.elementLocated(By.css(
        '#timelines.nav > button.active')), 1000);
    expect(await timelineTitle.getText()).toContain('Planning Phase');

    // She enters a start and end date for her timeline. She checks that the
    // values are persisted by switching between timelines.
    await editTimelineStartDate('0121');
    // After seeing that the application has detected a typo in her input, she
    // corrects this problem
    const validationOutput = await driver.wait(until.elementLocated(By.css(
        '.text-danger')), 1000);
    expect(await validationOutput.getText()).toContain(
        'Start: Ungültiges Datumsformat');
    await editTimelineStartDate('01/21');
    await editTimelineEndDate('52/21');
    const executionPhase = await driver.wait(until.elementLocated(By.css(
        '#timelines.nav > button:nth-child(2)')), 1000);
    await executionPhase.click();
    planningPhase = await driver.wait(until.elementLocated(By.css(
        '#timelines.nav > button:nth-child(2)')), 1000);
    await planningPhase.click();
    const startDate = await driver.wait(until.elementLocated(By.css(
        '#timeline-start-date')), 1000);
    expect(await startDate.getAttribute('value')).toBe('01/21');
    const endDate = await driver.wait(until.elementLocated(By.css(
        '#timeline-end-date')), 1000);
    expect(await endDate.getAttribute('value')).toBe('52/21');

    // Alice wants to leave some notes on her project to be reminded of them
    // later. She uses markdown syntax to make her notes presentable.
    await editDescription('* Find some books\n* Consult with Pinky');
    const mdDescription = await driver.wait(until.elementLocated(By.css(
        '#description-content')), 1000);
    const mdDescriptionContent = await mdDescription.getAttribute('innerHTML');
    expect(mdDescriptionContent).toContain('Find some books');
    expect(mdDescriptionContent).toContain('Consult with Pinky');
    expect(mdDescriptionContent).toContain('<ul>');
    expect(mdDescriptionContent).toContain('<li>');

    // She creates two milestones for her planning phase.
    await addMilestone('05/21', 'First draft');
    await addMilestone('30/21', 'Final draft');

    // ...and two allocations
    await addAllocation('05/21', '2.5');
    await addAllocation('30/21', '5');

    // ...and two tasks
    await addTask('01/21', '15/21', 'Build Deathray', '100');
    await addTask('01/21', '20/21', 'Steal Moon', '40');

    // She checks the amount of resources she needs for her project and exits
    // the application happily.
    const summaryRuntime = await driver.wait(until.elementLocated(By.css(
        '#timeline-sum-collapse table:nth-child(1) tr:nth-child(1) td')),
    1000);
    expect(await summaryRuntime.getText()).toBe('52');
    const summaryNumQuarters = await driver.wait(until.elementLocated(By.css(
        '#timeline-sum-collapse table:nth-child(1) tr:nth-child(2) td')),
    1000);
    expect(await summaryNumQuarters.getText()).toBe('4');
    let k;
    for (k = 0; k < 4; ++k) {
      const summaryQLabel = await driver.wait(until.elementLocated(By.css(
          `#timeline-sum-collapse table:nth-child(2) tbody tr:nth-child(${k+1})
          td:nth-child(1)`)), 1000);
      expect(await summaryQLabel.getText()).toBe(`Q${k+1}/21`);
      const summaryQRuntime = await driver.wait(until.elementLocated(By.css(
          `#timeline-sum-collapse table:nth-child(2) tbody tr:nth-child(${k+1})
          td:nth-child(2)`)), 1000);
      expect(await summaryQRuntime.getText()).toBe('65');
    }
    const summaryTotalRuntime = await driver.wait(until.elementLocated(By.css(
        `#timeline-sum-collapse table:nth-child(2) tfoot tr:nth-child(3)
        td:nth-child(2)`)), 1000);
    expect(await summaryTotalRuntime.getText()).toBe('260');
  });
});
