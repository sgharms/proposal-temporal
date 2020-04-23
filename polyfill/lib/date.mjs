import { ES } from './ecmascript.mjs';
import { MakeIntrinsicClass } from './intrinsicclass.mjs';
import {
  ISO_YEAR,
  ISO_MONTH,
  ISO_DAY,
  HOUR,
  MINUTE,
  SECOND,
  MILLISECOND,
  MICROSECOND,
  NANOSECOND,
  CALENDAR,
  CreateSlots,
  GetSlot,
  SetSlot
} from './slots.mjs';

const ObjectAssign = Object.assign;

export class Date {
  constructor(isoYear, isoMonth, isoDay, calendar = undefined) {
    isoYear = ES.ToInteger(isoYear);
    isoMonth = ES.ToInteger(isoMonth);
    isoDay = ES.ToInteger(isoDay);
    ES.RejectDate(isoYear, isoMonth, isoDay);

    if (calendar === undefined) calendar = ES.GetDefaultCalendar();

    CreateSlots(this);
    SetSlot(this, ISO_YEAR, isoYear);
    SetSlot(this, ISO_MONTH, isoMonth);
    SetSlot(this, ISO_DAY, isoDay);
    SetSlot(this, CALENDAR, calendar);
  }
  get year() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).year(this);
  }
  get month() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).month(this);
  }
  get day() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).day(this);
  }
  get dayOfWeek() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).dayOfWeek(this);
  }
  get dayOfYear() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).dayOfYear(this);
  }
  get weekOfYear() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).weekOfYear(this);
  }
  get daysInYear() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).daysInYear(this);
  }
  get daysInMonth() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).daysInMonth(this);
  }
  get isLeapYear() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).isLeapYear(this);
  }
  with(temporalDateLike = {}, options) {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    const props = ES.ToPartialRecord(temporalDateLike, ['day', 'month', 'year']);
    if (!props) {
      throw new RangeError('invalid date-like');
    }
    const fields = ES.ToRecord(this, [['day'], ['month'], ['year']]);
    const newFields = ObjectAssign({}, fields, props);
    const Construct = ES.SpeciesConstructor(this, Date);
    const result = GetSlot(this, CALENDAR).dateFromFields(newFields, options, Construct);
    if (!ES.IsTemporalDate(result)) throw new TypeError('invalid result');
    return result;
  }
  plus(temporalDurationLike, options) {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    const duration = ES.ToLimitedTemporalDuration(temporalDurationLike);
    const Construct = ES.SpeciesConstructor(this, Date);
    const result = GetSlot(this, CALENDAR).plus(this, duration, options, Construct);
    if (!ES.IsTemporalDate(result)) throw new TypeError('invalid result');
    return result;
  }
  minus(temporalDurationLike, options) {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    const duration = ES.ToLimitedTemporalDuration(temporalDurationLike);
    const Construct = ES.SpeciesConstructor(this, Date);
    const result = GetSlot(this, CALENDAR).minus(this, duration, options, Construct);
    if (!ES.IsTemporalDate(result)) throw new TypeError('invalid result');
    return result;
  }
  difference(other, options) {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalDate(other)) throw new TypeError('invalid Date object');
    const calendar = GetSlot(this, CALENDAR);
    if (GetSlot(other, CALENDAR) !== calendar) throw new TypeError('calendars must match');
    const [smaller, larger] = [this, other].sort(Date.compare);
    return calendar.difference(smaller, larger, options);
  }
  toString() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    let year = ES.ISOYearString(GetSlot(this, ISO_YEAR));
    let month = ES.ISODateTimePartString(GetSlot(this, ISO_MONTH));
    let day = ES.ISODateTimePartString(GetSlot(this, ISO_DAY));
    let resultString = `${year}-${month}-${day}`;
    return resultString;
  }
  toLocaleString(...args) {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    return new Intl.DateTimeFormat(...args).format(this);
  }
  withTime(temporalTime) {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalTime(temporalTime)) throw new TypeError('invalid Temporal.Time object');
    const year = GetSlot(this, ISO_YEAR);
    const month = GetSlot(this, ISO_MONTH);
    const day = GetSlot(this, ISO_DAY);
    const calendar = GetSlot(this, CALENDAR);
    const hour = GetSlot(temporalTime, HOUR);
    const minute = GetSlot(temporalTime, MINUTE);
    const second = GetSlot(temporalTime, SECOND);
    const millisecond = GetSlot(temporalTime, MILLISECOND);
    const microsecond = GetSlot(temporalTime, MICROSECOND);
    const nanosecond = GetSlot(temporalTime, NANOSECOND);
    const DateTime = ES.GetIntrinsic('%Temporal.DateTime%');
    return new DateTime(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, calendar);
  }
  getYearMonth() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    const YearMonth = ES.GetIntrinsic('%Temporal.YearMonth%');
    const fields = ES.ToRecord(this, [['month'], ['year']]);
    return GetSlot(this, CALENDAR).yearMonthFromFields(fields, {}, YearMonth);
  }
  getMonthDay() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    const MonthDay = ES.GetIntrinsic('%Temporal.MonthDay%');
    const fields = ES.ToRecord(this, [['day'], ['month']]);
    return GetSlot(this, CALENDAR).monthDayFromFields(fields, {}, MonthDay);
  }
  getFields() {
    if (!ES.IsTemporalDate(this)) throw new TypeError('invalid receiver');
    const fields = ES.ToRecord(this, [['day'], ['month'], ['year']]);
    fields.calendar = GetSlot(this, CALENDAR);
    return fields;
  }
  static from(item, options = undefined) {
    const disambiguation = ES.ToTemporalDisambiguation(options);
    let year, month, day, calendar;
    if (typeof item === 'object' && item) {
      if (ES.IsTemporalDate(item)) {
        year = GetSlot(item, ISO_YEAR);
        month = GetSlot(item, ISO_MONTH);
        day = GetSlot(item, ISO_DAY);
        calendar = GetSlot(item, CALENDAR);
      } else {
        // Intentionally alphabetical
        ({ year, month, day } = ES.ToRecord(item, [['day'], ['month'], ['year']]));
        calendar = item.calendar || ES.GetDefaultCalendar();
      }
    } else {
      ({ year, month, day } = ES.ParseTemporalDateString(ES.ToString(item)));
      calendar = ES.GetDefaultCalendar();
    }
    ({ year, month, day } = ES.RegulateDate(year, month, day, disambiguation));
    const result = new this(year, month, day, calendar);
    if (!ES.IsTemporalDate(result)) throw new TypeError('invalid result');
    return result;
  }
  static compare(one, two) {
    if (!ES.IsTemporalDate(one) || !ES.IsTemporalDate(two)) throw new TypeError('invalid Date object');
    return ES.CompareDate(one, two);
  }
}
Date.prototype.toJSON = Date.prototype.toString;

MakeIntrinsicClass(Date, 'Temporal.Date');
