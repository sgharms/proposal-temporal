import { ES } from './ecmascript.mjs';
import { MakeIntrinsicClass } from './intrinsicclass.mjs';
import { TIMEZONE_ID, EPOCHNANOSECONDS, CreateSlots, GetSlot, SetSlot } from './slots.mjs';
import { ZONES } from './zones.mjs';

import bigInt from 'big-integer';

export class TimeZone {
  constructor(timeZoneIdentifier) {
    CreateSlots(this);
    SetSlot(this, TIMEZONE_ID, ES.GetCanonicalTimeZoneIdentifier(timeZoneIdentifier));
  }
  get name() {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    return String(GetSlot(this, TIMEZONE_ID));
  }
  getOffsetFor(absolute) {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalAbsolute(absolute)) throw new TypeError('invalid Absolute object');
    return ES.GetTimeZoneOffsetString(GetSlot(absolute, EPOCHNANOSECONDS), GetSlot(this, TIMEZONE_ID));
  }
  getDateTimeFor(absolute) {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalAbsolute(absolute)) throw new TypeError('invalid Absolute object');
    const ns = GetSlot(absolute, EPOCHNANOSECONDS);
    const {
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond
    } = ES.GetTimeZoneDateTimeParts(ns, GetSlot(this, TIMEZONE_ID));
    const DateTime = ES.GetIntrinsic('%Temporal.DateTime%');
    return new DateTime(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond);
  }
  getAbsoluteFor(dateTime, options) {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalDateTime(dateTime)) throw new TypeError('invalid DateTime object');
    const disambiguation = ES.ToTimeZoneTemporalDisambiguation(options);

    const Absolute = ES.GetIntrinsic('%Temporal.Absolute%');
    const { year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = dateTime;
    const possibleEpochNs = ES.GetTimeZoneEpochValue(
      GetSlot(this, TIMEZONE_ID),
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond
    );
    if (possibleEpochNs.length === 1) return new Absolute(possibleEpochNs[0]);
    if (possibleEpochNs.length) {
      switch (disambiguation) {
        case 'earlier':
          return new Absolute(possibleEpochNs[0]);
        case 'later':
          return new Absolute(possibleEpochNs[1]);
        case 'reject': {
          throw new RangeError('multiple absolute found');
        }
      }
    }

    const utcns = ES.GetEpochFromParts(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond);
    if (utcns === null) throw new RangeError('DateTime outside of supported range');
    const before = ES.GetTimeZoneOffsetNanoseconds(utcns.minus(bigInt(86400 * 1e9)), GetSlot(this, TIMEZONE_ID));
    const after = ES.GetTimeZoneOffsetNanoseconds(utcns.plus(bigInt(86400 * 1e9)), GetSlot(this, TIMEZONE_ID));
    const nanoseconds = after.minus(before);
    const diff = ES.ToTemporalDurationRecord({ nanoseconds }, 'reject');
    switch (disambiguation) {
      case 'earlier': {
        const earlier = dateTime.minus(diff);
        return this.getAbsoluteFor(earlier, disambiguation);
      }
      case 'later': {
        const later = dateTime.plus(diff);
        return this.getAbsoluteFor(later, disambiguation);
      }
      case 'reject': {
        throw new RangeError('no such absolute found');
      }
    }
  }
  getTransitions(startingPoint) {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalAbsolute(startingPoint)) throw new TypeError('invalid Absolute object');
    let epochNanoseconds = GetSlot(startingPoint, EPOCHNANOSECONDS);
    const Absolute = ES.GetIntrinsic('%Temporal.Absolute%');
    const timeZone = GetSlot(this, TIMEZONE_ID);
    const result = {
      next: () => {
        epochNanoseconds = ES.GetTimeZoneNextTransition(epochNanoseconds, timeZone);
        const done = epochNanoseconds === null;
        const value = epochNanoseconds === null ? null : new Absolute(epochNanoseconds);
        return { done, value };
      }
    };
    if (typeof Symbol === 'function') {
      result[Symbol.iterator] = () => result;
    }
    return result;
  }
  toString() {
    if (!ES.IsTemporalTimeZone(this)) throw new TypeError('invalid receiver');
    return this.name;
  }
  static from(item) {
    let timeZone;
    if (ES.IsTemporalTimeZone(item)) {
      timeZone = GetSlot(item, TIMEZONE_ID);
    } else {
      timeZone = ES.TemporalTimeZoneFromString(ES.ToString(item));
    }
    const result = new this(timeZone);
    if (!ES.IsTemporalTimeZone(result)) throw new TypeError('invalid result');
    return result;
  }
  static [Symbol.iterator]() {
    const iter = ZONES[Symbol.iterator]();
    return {
      next: () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          let { value, done } = iter.next();
          if (done) return { done };
          try {
            value = new TimeZone(value);
            done = false;
            return { done, value };
          } catch (ex) {
            continue;
          }
        }
      }
    };
  }
}

TimeZone.prototype.toJSON = TimeZone.prototype.toString;

MakeIntrinsicClass(TimeZone, 'Temporal.TimeZone');
