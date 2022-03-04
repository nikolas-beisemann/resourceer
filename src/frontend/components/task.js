/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {CalendarWeek} = require('../util/calendar-week');

const componentTask = (adapter, language) => {
  return {
    props: [
      'id',
      'startDate',
      'endDate',
    ],
    data() {
      const fields = adapter.read('tasks',
          ['name', 'start', 'end', 'amount'], {id: this.id})[0];
      return {
        ...fields,
        validation: {
          startInvalid: false,
          endInvalid: false,
          amountInvalid: false,
          messages: {
            startMessage: '',
            endMessage: '',
            amountMessage: '',
          },
        },
      };
    },
    watch: {
      id(newId) {
        const fields = adapter.read('tasks',
            ['name', 'start', 'end', 'amount'], {id: this.id})[0];
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
      updateStart() {
        adapter.update('tasks', {start: this.start}, {id: this.id});
        this.validate();
      },
      updateEnd() {
        adapter.update('tasks', {end: this.end}, {id: this.id});
        this.validate();
      },
      updateName() {
        adapter.update('tasks', {name: this.name}, {id: this.id});
      },
      updateAmount() {
        adapter.update('tasks', {amount: this.amount}, {id: this.id});
        this.validate();
      },
      validate() {
        this.validation.startInvalid = false;
        this.validation.endInvalid = false;
        this.validation.amountInvalid = false;
        this.validation.messages.startMessage = '';
        this.validation.messages.endMessage = '';
        this.validation.messages.amountMessage = '';

        let sCw = null;
        if (this.start.length !== 0) {
          try {
            sCw = new CalendarWeek(this.start);
          } catch (e) {
            this.validation.startInvalid = true;
            this.validation.messages.startMessage =
                language.validation.invalidDate;
          }
        }
        let eCw = null;
        if (this.end.length !== 0) {
          try {
            eCw = new CalendarWeek(this.end);
          } catch (e) {
            this.validation.endInvalid = true;
            this.validation.messages.endMessage =
                language.validation.invalidDate;
          }
        }

        if (sCw !== null && eCw !== null) {
          if (CalendarWeek.duration(sCw, eCw) <= 0) {
            this.validation.startInvalid = true;
            this.validation.endInvalid = true;
            this.validation.messages.startMessage =
                language.validation.invalidTaskRange;
            this.validation.messages.endMessage =
                language.validation.invalidTaskRange;
          } else {
            try {
              const startCw = new CalendarWeek(this.startDate);
              const endCw = new CalendarWeek(this.endDate);
              if (CalendarWeek.duration(startCw, sCw) <= 0) {
                this.validation.startInvalid = true;
                this.validation.messages.startMessage =
                    language.validation.dateOutOfRange;
              }
              if (CalendarWeek.duration(eCw, endCw) <= 0) {
                this.validation.endInvalid = true;
                this.validation.messages.endMessage =
                    language.validation.dateOutOfRange;
              }
            } catch (e) {
              this.validation.startInvalid = true;
              this.validation.endInvalid = true;
              this.validation.messages.startMessage =
                  language.validation.invalidRange;
              this.validation.messages.endMessage =
                  language.validation.invalidRange;
            }
          }
        }

        if (this.amount.length !== 0) {
          if (isNaN(parseFloat(this.amount))) {
            this.validation.amountInvalid = true;
            this.validation.messages.amountMessage =
                language.validation.invalidValue;
          }
        }

        this.$emit('recalculate');
      },
      deleteMe() {
        this.$emit('delete', this.$event, this.id);
      },
    },
    emits: [
      'recalculate',
      'delete',
    ],
    template: '#component-task',
  };
};

exports.component = componentTask;
