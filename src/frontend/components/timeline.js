/* Copyright (c) 2021 Nikolas Beisemann */

const {CalendarWeek} = require('../util/calendar-week');
const {Assessor} = require('../analysis/assessor');
const Vue = require('vue');
const $ = require('jquery');
const markdown = require('markdown-it')();

const componentTimeline = (adapter, language) => {
  const assessor = new Assessor(adapter);
  return {
    props: [
      'id',
    ],
    data() {
      const fields = adapter.read('timelines',
          ['startDate', 'endDate', 'description'], {id: this.id})[0];
      return {
        ...fields,
        validation: {
          startDateInvalid: false,
          endDateInvalid: false,
          messages: [],
        },
        descriptionEditable: false,
        milestones: [...adapter.read('milestones', ['id'],
            {timeline: this.id})],
        allocations: [...adapter.read('allocations', ['id'],
            {timeline: this.id})],
        tasks: [...adapter.read('tasks', ['id'],
            {timeline: this.id})],
        summary: assessor.summary([this.id]),
      };
    },
    watch: {
      id(newId) {
        const fields = adapter.read('timelines',
            ['startDate', 'endDate', 'description'], {id: this.id})[0];
        Object.assign(this, fields);
        this.validate();
        this.descriptionEditable = false;
        this.milestones = [...adapter.read('milestones', ['id'],
            {timeline: this.id})];
        this.allocations = [...adapter.read('allocations', ['id'],
            {timeline: this.id})];
        this.tasks = [...adapter.read('tasks', ['id'],
            {timeline: this.id})];
        this.summary = assessor.summary([this.id]);
      },
    },
    mounted() {
      this.validate();
    },
    computed: {
      descriptionMarkdown() {
        return markdown.render(this.description);
      },
    },
    methods: {
      startDateUpdate() {
        adapter.update('timelines', {startDate: this.startDate},
            {id: this.id});
        this.validate();
      },
      endDateUpdate() {
        adapter.update('timelines', {endDate: this.endDate}, {id: this.id});
        this.validate();
      },
      validate() {
        this.validation.messages = [];
        this.validation.startDateInvalid = false;
        this.validation.endDateInvalid = false;

        let startCw = null;
        if (this.startDate.length > 0) {
          try {
            startCw = new CalendarWeek(this.startDate);
          } catch (e) {
            this.validation.startDateInvalid = true;
            this.validation.messages.push(language.timeline.start + ': ' +
                language.validation.invalidDate);
          }
        }
        let endCw = null;
        if (this.endDate.length > 0) {
          try {
            endCw = new CalendarWeek(this.endDate);
          } catch (e) {
            this.validation.endDateInvalid = true;
            this.validation.messages.push(language.timeline.end + ': ' +
                language.validation.invalidDate);
          }
        }

        if (startCw !== null && endCw !== null) {
          if (CalendarWeek.duration(startCw, endCw) <= 0) {
            this.validation.startDateInvalid = true;
            this.validation.endDateInvalid = true;
            this.validation.messages.push(language.validation.invalidRange);
          }
        }

        this.recalculate();
      },
      descriptionEdit() {
        this.descriptionEditable = true;
        Vue.nextTick(() => {
          $('#mdeditor').focus();
        });
      },
      descriptionUpdate() {
        this.descriptionEditable = false;
        adapter.update('timelines', {description: this.description},
            {id: this.id});
      },
      descriptionLeave() {
        this.descriptionEditable = false;
      },
      createMilestone() {
        const id = adapter.create('milestones', {timeline: this.id});
        if (id !== undefined) {
          this.milestones.push({id});
        }
      },
      createAllocation() {
        const id = adapter.create('allocations', {timeline: this.id});
        if (id !== undefined) {
          this.allocations.push({id});
        }
      },
      createTask() {
        const id = adapter.create('tasks', {timeline: this.id});
        if (id !== undefined) {
          this.tasks.push({id});
        }
      },
      recalculate() {
        this.summary = assessor.summary([this.id]);
        this.$emit('recalculate');
      },
      deleteMilestone(e, id) {
        adapter.delete('milestones', {id});
        this.milestones = [...adapter.read('milestones', ['id'],
            {timeline: this.id})];
      },
      deleteAllocation(e, id) {
        adapter.delete('allocations', {id});
        this.allocations = [...adapter.read('allocations', ['id'],
            {timeline: this.id})];
        this.summary = assessor.summary([this.id]);
        this.recalculate();
      },
      deleteTask(e, id) {
        adapter.delete('tasks', {id});
        this.tasks = [...adapter.read('tasks', ['id'],
            {timeline: this.id})];
        this.summary = assessor.summary([this.id]);
        this.recalculate();
      },
    },
    emits: [
      'recalculate',
    ],
    template: '#component-timeline',
  };
};

exports.component = componentTimeline;
