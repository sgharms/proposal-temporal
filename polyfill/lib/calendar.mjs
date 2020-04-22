import { ES } from './ecmascript.mjs';
import { MakeIntrinsicClass } from './intrinsicclass.mjs';
import { CALENDAR_ID, ISO_YEAR, ISO_MONTH, ISO_DAY, CreateSlots, GetSlot, SetSlot } from './slots.mjs';

export class Calendar {
  constructor(id) {
    CreateSlots(this);
    SetSlot(this, CALENDAR_ID, id);
  }
  get id() {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR_ID);
  }
  toISO(date) {
    void date;
    throw new Error('not implemented');
  }
  fromISO(date) {
    void date;
    throw new Error('not implemented');
  }
  dateFromFields(fields, options, constructor) {
    void fields;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  dateTimeFromFields(fields, options, constructor) {
    void fields;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  // FIXME: do we need timeFromFields()?
  yearMonthFromFields(fields, options, constructor) {
    void fields;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  monthDayFromFields(fields, options, constructor) {
    void fields;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  plus(date, duration, options, constructor) {
    void date;
    void duration;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  minus(date, duration, options, constructor) {
    void date;
    void duration;
    void options;
    void constructor;
    throw new Error('not implemented');
  }
  difference(one, two, options) {
    void one;
    void two;
    void options;
    throw new Error('not implemented');
  }
  year(date) {
    void date;
    throw new Error('not implemented');
  }
  month(date) {
    void date;
    throw new Error('not implemented');
  }
  day(date) {
    void date;
    throw new Error('not implemented');
  }
  dayOfWeek(date) {
    void date;
    throw new Error('not implemented');
  }
  dayOfYear(date) {
    void date;
    throw new Error('not implemented');
  }
  weekOfYear(date) {
    void date;
    throw new Error('not implemented');
  }
  daysInMonth(date) {
    void date;
    throw new Error('not implemented');
  }
  daysInYear(date) {
    void date;
    throw new Error('not implemented');
  }
  isLeapYear(date) {
    void date;
    throw new Error('not implemented');
  }
  toString() {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR_ID);
  }
  static from(item) {
    return ES.ToTemporalCalendar(item);
  }
  static fromId(id) {
    return ES.GetBuiltinCalendar(id);
  }
}

export class Iso8601 extends Calendar {
  constructor() {
    super('iso8601');
  }
  toISO(date) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalDate(date)) throw new TypeError('invalid Date object');
    return date;
  }
  fromISO(date) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalDate(date)) throw new TypeError('invalid Date object');
    return date;
  }
  dateFromFields(fields, options, constructor) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToTemporalDisambiguation(options);
    let { year, month, day } = fields;
    ({ year, month, day } = ES.RegulateDate(year, month, day, disambiguation));
    return new constructor(year, month, day, this);
  }
  dateTimeFromFields(fields, options, constructor) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToTemporalDisambiguation(options);
    let { year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = fields;
    ({ year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = ES.RegulateDateTime(
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond,
      disambiguation
    ));
    return new constructor(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, this);
  }
  yearMonthFromFields(fields, options, constructor) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToTemporalDisambiguation(options);
    let { year, month } = fields;
    ({ year, month } = ES.RegulateYearMonth(year, month, disambiguation));
    return new constructor(year, month, this, /* refIsoDay = */ 1);
  }
  monthDayFromFields(fields, options, constructor) {
    if (!ES.IsTemporalCalendar(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToTemporalDisambiguation(options);
    let { month, day } = fields;
    ({ month, day } = ES.RegulateMonthDay(month, day, disambiguation));
    return new constructor(month, day, this, /* refIsoYear = */ 1972);
  }
  plus(date, duration, options, constructor) {
    const disambiguation = ES.ToArithmeticTemporalDisambiguation(options);
    let year = this.year(date);
    let month = this.month(date);
    let day = this.day(date);
    const { years, months, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
    const { days } = ES.BalanceDuration(
      duration.days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds,
      'days'
    );
    ({ year, month, day } = ES.AddDate(year, month, day, years, months, days, disambiguation));
    ({ year, month, day } = ES.RegulateDate(year, month, day, disambiguation));
    return new constructor(year, month, day, this);
  }
  minus(date, duration, options, constructor) {
    const disambiguation = ES.ToArithmeticTemporalDisambiguation(options);
    let year = this.year(date);
    let month = this.month(date);
    let day = this.day(date);
    const { years, months, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
    const { days } = ES.BalanceDuration(
      duration.days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds,
      'days'
    );
    ({ year, month, day } = ES.SubtractDate(year, month, day, years, months, days, disambiguation));
    ({ year, month, day } = ES.RegulateDate(year, month, day, disambiguation));
    return new constructor(year, month, day, this);
  }
  difference(smaller, larger, options) {
    const largestUnit = ES.ToLargestTemporalUnit(options, 'days', ['hours', 'minutes', 'seconds']);
    const { years, months, days } = ES.DifferenceDate(smaller, larger, largestUnit);
    const Duration = ES.GetIntrinsic('%Temporal.Duration%');
    return new Duration(years, months, days, 0, 0, 0, 0, 0, 0);
  }
  year(date) {
    return GetSlot(date, ISO_YEAR);
  }
  month(date) {
    return GetSlot(date, ISO_MONTH);
  }
  day(date) {
    return GetSlot(date, ISO_DAY);
  }
  dayOfWeek(date) {
    return ES.DayOfWeek(GetSlot(date, ISO_YEAR), GetSlot(date, ISO_MONTH), GetSlot(date, ISO_DAY));
  }
  dayOfYear(date) {
    return ES.DayOfYear(GetSlot(date, ISO_YEAR), GetSlot(date, ISO_MONTH), GetSlot(date, ISO_DAY));
  }
  weekOfYear(date) {
    return ES.WeekOfYear(GetSlot(date, ISO_YEAR), GetSlot(date, ISO_MONTH), GetSlot(date, ISO_DAY));
  }
  daysInMonth(date) {
    return ES.DaysInMonth(GetSlot(date, ISO_YEAR), GetSlot(date, ISO_MONTH));
  }
  daysInYear(date) {
    return ES.LeapYear(GetSlot(date, ISO_YEAR)) ? 366 : 365;
  }
  isLeapYear(date) {
    return ES.LeapYear(GetSlot(date, ISO_YEAR));
  }
}

MakeIntrinsicClass(Calendar, 'Temporal.Calendar');
