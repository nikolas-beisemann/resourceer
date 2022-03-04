/* Copyright (c) 2021-2022 Nikolas Beisemann */

const {CalendarWeek} = require('../util/calendar-week');

const componentAllocation = (adapter, language) => {
  return {
    props: [
      'id',
      'startDate',
      'endDate',
    ],
    data() {
      const fields = adapter.read('allocations', ['date', 'amount'],
          {id: this.id})[0];
      return {
        ...fields,
        validation: {
          dateInvalid: false,
          amountInvalid: false,
          messages: {
            dateMessage: '',
            amountMessage: '',
          },
        },
      };
    },
    watch: {
      id(newId) {
        const fields = adapter.read('allocations', ['date', 'amount'],
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
      updateDate() {
        adapter.update('allocations', {date: this.date}, {id: this.id});
        this.validate();
      },
      updateAmount() {
        adapter.update('allocations', {amount: this.amount}, {id: this.id});
        this.validate();
      },
      validate() {
        this.validation.dateInvalid = false;
        this.validation.amountInvalid = false;
        this.validation.messages.dateMessage = '';
        this.validation.messages.amountMessage = '';

        let dateCw = null;
        if (this.date.length !== 0) {
          try {
            dateCw = new CalendarWeek(this.date);
          } catch (e) {
            this.validation.dateInvalid = true;
            this.validation.messages.dateMessage =
                language.validation.invalidDate;
          }
        }

        if (dateCw !== null) {
          try {
            const startCw = new CalendarWeek(this.startDate);
            const endCw = new CalendarWeek(this.endDate);
            if (CalendarWeek.duration(startCw, dateCw) <= 0 ||
                CalendarWeek.duration(dateCw, endCw) <= 0) {
              this.validation.dateInvalid = true;
              this.validation.messages.dateMessage =
                  language.validation.dateOutOfRange;
            }
          } catch (e) {
            this.validation.dateInvalid = true;
            this.validation.messages.dateMessage =
                language.validation.invalidRange;
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
    template: '#component-allocation',
  };
};

exports.component = componentAllocation;
