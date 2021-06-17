/* Copyright (c) 2021 Nikolas Beisemann */

const {CalendarWeek} = require('../util/calendar-week');

const componentMilestone = (adapter, language) => {
  return {
    props: [
      'id',
      'startDate',
      'endDate',
    ],
    data() {
      const fields = adapter.read('milestones', ['name', 'dueDate'],
          {id: this.id})[0];
      return {
        ...fields,
        validation: {
          dueDateInvalid: false,
          messages: [],
        },
      };
    },
    watch: {
      id(newId) {
        const fields = adapter.read('milestones', ['name', 'dueDate'],
            {id: this.id})[0];
        Object.assign(this, fields);
        this.validate();
      },
      startDate() {
        this.validate();
      },
      endDate() {
        this.validate();
      },
    },
    mounted() {
      this.validate();
    },
    methods: {
      updateDueDate() {
        adapter.update('milestones', {dueDate: this.dueDate}, {id: this.id});
        this.validate();
      },
      updateName() {
        adapter.update('milestones', {name: this.name}, {id: this.id});
        this.$emit('recalculate');
      },
      validate() {
        this.validation.dueDateInvalid = false;
        this.validation.messages = [];

        let dueCw = null;
        if (this.dueDate.length !== 0) {
          try {
            dueCw = new CalendarWeek(this.dueDate);
          } catch (e) {
            this.validation.dueDateInvalid = true;
            this.validation.messages.push(language.validation.invalidDate);
          }
        }

        if (dueCw !== null) {
          try {
            const startCw = new CalendarWeek(this.startDate);
            const endCw = new CalendarWeek(this.endDate);
            if (CalendarWeek.duration(startCw, dueCw) <= 0 ||
                CalendarWeek.duration(dueCw, endCw) <= 0) {
              this.validation.dueDateInvalid = true;
              this.validation.messages.push(
                  language.validation.dateOutOfRange);
            }
          } catch (e) {
            this.validation.dueDateInvalid = true;
            this.validation.messages.push(language.validation.invalidRange);
          }
        }
        this.$emit('recalculate');
      },
      deleteMe() {
        this.$emit('delete', this.$event, this.id);
      },
    },
    emits: [
      'delete',
      'recalculate',
    ],
    template: '#component-milestone',
  };
};

exports.component = componentMilestone;
