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

export class DateTime {
  constructor(
    isoYear,
    isoMonth,
    isoDay,
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0,
    microsecond = 0,
    nanosecond = 0,
    calendar = undefined
  ) {
    isoYear = ES.ToInteger(isoYear);
    isoMonth = ES.ToInteger(isoMonth);
    isoDay = ES.ToInteger(isoDay);
    hour = ES.ToInteger(hour);
    minute = ES.ToInteger(minute);
    second = ES.ToInteger(second);
    millisecond = ES.ToInteger(millisecond);
    microsecond = ES.ToInteger(microsecond);
    nanosecond = ES.ToInteger(nanosecond);
    ES.RejectDateTime(isoYear, isoMonth, isoDay, hour, minute, second, millisecond, microsecond, nanosecond);

    if (calendar === undefined) calendar = ES.GetDefaultCalendar();

    CreateSlots(this);
    SetSlot(this, ISO_YEAR, isoYear);
    SetSlot(this, ISO_MONTH, isoMonth);
    SetSlot(this, ISO_DAY, isoDay);
    SetSlot(this, HOUR, hour);
    SetSlot(this, MINUTE, minute);
    SetSlot(this, SECOND, second);
    SetSlot(this, MILLISECOND, millisecond);
    SetSlot(this, MICROSECOND, microsecond);
    SetSlot(this, NANOSECOND, nanosecond);
    SetSlot(this, CALENDAR, calendar);
  }
  get year() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).year(this);
  }
  get month() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).month(this);
  }
  get day() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).day(this);
  }
  get hour() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, HOUR);
  }
  get minute() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, MINUTE);
  }
  get second() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, SECOND);
  }
  get millisecond() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, MILLISECOND);
  }
  get microsecond() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, MICROSECOND);
  }
  get nanosecond() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, NANOSECOND);
  }
  get dayOfWeek() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).dayOfWeek(this);
  }
  get dayOfYear() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).dayOfYear(this);
  }
  get weekOfYear() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).weekOfYear(this);
  }
  get daysInYear() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).daysInYear(this);
  }
  get daysInMonth() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).daysInMonth(this);
  }
  get isLeapYear() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).isLeapYear(this);
  }
  with(temporalDateTimeLike, options) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const props = ES.ToPartialRecord(temporalDateTimeLike, [
      'day',
      'hour',
      'microsecond',
      'millisecond',
      'minute',
      'month',
      'nanosecond',
      'second',
      'year'
    ]);
    if (!props) {
      throw new RangeError('invalid date-time-like');
    }
    const fields = ES.ToRecord(this, [
      ['day'],
      ['hour'],
      ['microsecond'],
      ['millisecond'],
      ['minute'],
      ['month'],
      ['nanosecond'],
      ['second'],
      ['year']
    ]);
    const newFields = ObjectAssign({}, fields, props);
    const Construct = ES.SpeciesConstructor(this, DateTime);
    const result = GetSlot(this, CALENDAR).dateTimeFromFields(newFields, options, Construct);
    if (!ES.IsTemporalDateTime(result)) throw new TypeError('invalid result');
    return result;
  }
  plus(temporalDurationLike, options) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToArithmeticTemporalDisambiguation(options);
    const duration = ES.ToLimitedTemporalDuration(temporalDurationLike);
    let { year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = this;
    let { years, months, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
    ({ year, month, day } = ES.AddDate(year, month, day, years, months, days, disambiguation));
    let deltaDays = 0;
    ({ deltaDays, hour, minute, second, millisecond, microsecond, nanosecond } = ES.AddTime(
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds
    ));
    day += deltaDays;
    ({ year, month, day } = ES.BalanceDate(year, month, day));
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
    const Construct = ES.SpeciesConstructor(this, DateTime);
    const result = new Construct(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond);
    if (!ES.IsTemporalDateTime(result)) throw new TypeError('invalid result');
    return result;
  }
  minus(temporalDurationLike, options) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const disambiguation = ES.ToArithmeticTemporalDisambiguation(options);
    const duration = ES.ToLimitedTemporalDuration(temporalDurationLike);
    let { year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = this;
    let { years, months, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
    let deltaDays = 0;
    ({ deltaDays, hour, minute, second, millisecond, microsecond, nanosecond } = ES.SubtractTime(
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds
    ));
    days -= deltaDays;
    ({ year, month, day } = ES.SubtractDate(year, month, day, years, months, days, disambiguation));
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
    const Construct = ES.SpeciesConstructor(this, DateTime);
    const result = new Construct(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond);
    if (!ES.IsTemporalDateTime(result)) throw new TypeError('invalid result');
    return result;
  }
  difference(other, options) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalDateTime(other)) throw new TypeError('invalid DateTime object');
    const largestUnit = ES.ToLargestTemporalUnit(options, 'days');
    const [smaller, larger] = [this, other].sort(DateTime.compare);
    let { deltaDays, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = ES.DifferenceTime(
      smaller,
      larger
    );
    let { year, month, day } = larger;
    day += deltaDays;
    ({ year, month, day } = ES.BalanceDate(year, month, day));

    let dateLargestUnit = 'days';
    if (largestUnit === 'years' || largestUnit === 'months') {
      dateLargestUnit = largestUnit;
    }

    let { years, months, days } = ES.DifferenceDate(smaller, { year, month, day }, dateLargestUnit);

    ({ days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = ES.BalanceDuration(
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds,
      largestUnit
    ));

    const Duration = ES.GetIntrinsic('%Temporal.Duration%');
    return new Duration(years, months, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds);
  }
  toString() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    let year = ES.ISOYearString(GetSlot(this, ISO_YEAR));
    let month = ES.ISODateTimePartString(GetSlot(this, ISO_MONTH));
    let day = ES.ISODateTimePartString(GetSlot(this, ISO_DAY));
    let hour = ES.ISODateTimePartString(GetSlot(this, HOUR));
    let minute = ES.ISODateTimePartString(GetSlot(this, MINUTE));
    let second = ES.ISOSecondsString(
      GetSlot(this, SECOND),
      GetSlot(this, MILLISECOND),
      GetSlot(this, MICROSECOND),
      GetSlot(this, NANOSECOND)
    );
    let resultString = `${year}-${month}-${day}T${hour}:${minute}${second ? `:${second}` : ''}`;
    return resultString;
  }
  toLocaleString(...args) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return new Intl.DateTimeFormat(...args).format(this);
  }

  inTimeZone(temporalTimeZoneLike = 'UTC', options) {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const timeZone = ES.ToTemporalTimeZone(temporalTimeZoneLike);
    const disambiguation = ES.ToTimeZoneTemporalDisambiguation(options);
    return timeZone.getAbsoluteFor(this, { disambiguation });
  }
  getDate() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const Date = ES.GetIntrinsic('%Temporal.Date%');
    return new Date(GetSlot(this, ISO_YEAR), GetSlot(this, ISO_MONTH), GetSlot(this, ISO_DAY), GetSlot(this, CALENDAR));
  }
  getYearMonth() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const YearMonth = ES.GetIntrinsic('%Temporal.YearMonth%');
    return new YearMonth(GetSlot(this, ISO_YEAR), GetSlot(this, ISO_MONTH), GetSlot(this, CALENDAR));
  }
  getMonthDay() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const MonthDay = ES.GetIntrinsic('%Temporal.MonthDay%');
    return new MonthDay(GetSlot(this, ISO_MONTH), GetSlot(this, ISO_DAY), GetSlot(this, CALENDAR));
  }
  getTime() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    const Time = ES.GetIntrinsic('%Temporal.Time%');
    return new Time(
      GetSlot(this, HOUR),
      GetSlot(this, MINUTE),
      GetSlot(this, SECOND),
      GetSlot(this, MILLISECOND),
      GetSlot(this, MICROSECOND),
      GetSlot(this, NANOSECOND)
    );
  }
  getFields() {
    if (!ES.IsTemporalDateTime(this)) throw new TypeError('invalid receiver');
    return ES.ToRecord(this, [
      ['day'],
      ['hour'],
      ['microsecond'],
      ['millisecond'],
      ['minute'],
      ['month'],
      ['nanosecond'],
      ['second'],
      ['year']
    ]);
  }

  static from(item, options = undefined) {
    const disambiguation = ES.ToTemporalDisambiguation(options);
    let year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, calendar;
    if (typeof item === 'object' && item) {
      if (ES.IsTemporalDateTime(item)) {
        year = GetSlot(item, ISO_YEAR);
        month = GetSlot(item, ISO_MONTH);
        day = GetSlot(item, ISO_DAY);
        minute = GetSlot(item, MINUTE);
        second = GetSlot(item, SECOND);
        millisecond = GetSlot(item, MILLISECOND);
        microsecond = GetSlot(item, MICROSECOND);
        nanosecond = GetSlot(item, NANOSECOND);
        calendar = GetSlot(item, CALENDAR);
      } else {
        ({ year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = ES.ToRecord(item, [
          ['day'],
          ['hour', 0],
          ['microsecond', 0],
          ['millisecond', 0],
          ['minute', 0],
          ['month'],
          ['nanosecond', 0],
          ['second', 0],
          ['year']
        ]));
        calendar = item.calendar || ES.GetDefaultCalendar();
      }
    } else {
      ({
        year,
        month,
        day,
        hour,
        minute,
        second,
        millisecond,
        microsecond,
        nanosecond
      } = ES.ParseTemporalDateTimeString(ES.ToString(item)));
      calendar = ES.GetDefaultCalendar(); 
    }
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
    const result = new this(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, calendar);
    if (!ES.IsTemporalDateTime(result)) throw new TypeError('invalid result');
    return result;
  }
  static compare(one, two) {
    if (!ES.IsTemporalDateTime(one) || !ES.IsTemporalDateTime(two)) throw new TypeError('invalid DateTime object');
    for (const slot of [ISO_YEAR, ISO_MONTH, ISO_DAY, HOUR, MINUTE, SECOND, MILLISECOND, MICROSECOND, NANOSECOND]) {
      const val1 = GetSlot(one, slot);
      const val2 = GetSlot(two, slot);
      if (val1 !== val2) return ES.ComparisonResult(val1 - val2);
    }
    return ES.ComparisonResult(0);
  }
}
DateTime.prototype.toJSON = DateTime.prototype.toString;

MakeIntrinsicClass(DateTime, 'Temporal.DateTime');
