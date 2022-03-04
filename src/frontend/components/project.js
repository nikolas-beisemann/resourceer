/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {Assessor} = require('../analysis/assessor');
const Vue = require('vue');
const $ = require('jquery');

const componentProject = (adapter, language) => {
  const assessor = new Assessor(adapter);
  return {
    props: [
      'id',
    ],
    data() {
      const {name} = adapter.read('projects', ['name'], {id: this.id})[0];
      const tls = [...adapter.read('timelines', ['id', 'name'],
          {project: this.id})];
      return {
        name,
        editable: false,
        active: 0,
        timelines: tls,
        timelineEditable: false,
        confirmDelete: false,
        confirmTimelineDelete: false,
        summary: assessor.summary(tls.map((tl) => tl.id)),
      };
    },
    watch: {
      id(newId) {
        const {name} = adapter.read('projects', ['name'], {id: newId})[0];
        this.name = name;
        this.editable = false;
        this.active = 0;
        this.timelines = [...adapter.read('timelines', ['id', 'name'],
            {project: this.id})];
        this.timelineEditable = false;
        this.confirmDelete = false;
        this.confirmTimelineDelete = false;
        this.summary = assessor.summary(this.timelines.map((tl) => tl.id));
      },
    },
    methods: {
      titleEdit() {
        this.editable = true;
        Vue.nextTick(() => {
          $('#project-title').focus();
        });
      },
      titleUpdate() {
        this.editable = false;
        adapter.update('projects', {name: this.name}, {id: this.id});
        this.$emit('titleUpdate', this.$event, this.id, this.name);
      },
      titleLeave() {
        this.editable = false;
      },
      selectTimeline(timeline) {
        if (this.active !== timeline.id) {
          this.active = timeline.id;
          this.confirmTimelineDelete = false;
          this.$emit('selectTimeline', this.$event, this.active);
        }
      },
      createTimeline() {
        const id = adapter.create('timelines',
            {project: this.id, name: language.newTimeline});
        if (id !== undefined) {
          this.timelines.push({id, name: language.newTimeline});
          this.active = id;
          this.$emit('selectTimeline', this.$event, this.active);
        }
      },
      timelineEdit() {
        this.timelineEditable = true;
        Vue.nextTick(() => {
          $('#timeline-title').focus();
        });
      },
      timelineUpdate(timeline) {
        this.timelineEditable = false;
        adapter.update('timelines', {name: timeline.name}, {id: timeline.id});
      },
      timelineLeave() {
        this.timelineEditable = false;
      },
      askedToDelete() {
        this.confirmDelete = true;
      },
      deleteMe() {
        adapter.delete('projects', {id: this.id});
        timelineIds = adapter.read('timelines', ['id'], {project: this.id});
        adapter.delete('timelines', {project: this.id});
        timelineIds.forEach((timeline) => {
          adapter.delete('milestones', {timeline: timeline.id});
          adapter.delete('allocations', {timeline: timeline.id});
          adapter.delete('tasks', {timeline: timeline.id});
        });
        this.$emit('deleteProject');
        this.confirmDelete = false;
      },
      doNotDelete() {
        this.confirmDelete = false;
      },
      timelineAskDelete() {
        this.confirmTimelineDelete = true;
      },
      timelineDelete() {
        adapter.delete('timelines', {id: this.active});
        adapter.delete('milestones', {timeline: this.active});
        adapter.delete('allocations', {timeline: this.active});
        adapter.delete('tasks', {timeline: this.active});
        this.active = 0;
        this.$emit('selectTimeline', this.$event, this.active);
        this.confirmTimelineDelete = false;
        this.timelines = [...adapter.read('timelines', ['id', 'name'],
            {project: this.id})];
        this.timelineEditable = false;
      },
      timelineKeep() {
        this.confirmTimelineDelete = false;
      },
      showSummary() {
        this.active = 0;
        this.summary = assessor.summary(this.timelines.map((tl) => tl.id));
        this.$emit('selectTimeline', this.$event, this.active);
      },
      recalculate() {
        this.$emit('recalculate');
      },
    },
    emits: [
      'titleUpdate',
      'deleteProject',
      'recalculate',
      'selectTimeline',
    ],
    template: '#component-project',
  };
};

exports.component = componentProject;
