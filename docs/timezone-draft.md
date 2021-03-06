# Draft design of custom time zone API

## Why?

Currently, `Temporal.TimeZone` objects can only be obtained by passing an identifier to the constructor or to `Temporal.TimeZone.from()`.
These identifiers can be:

- an offset string such as `-07:00`, in which case a time zone object is returned with a constant offset, with no daylight saving changes ever;
- an IANA time zone name such as `America/New_York`, in which case a time zone object is returned that will give a different offset depending on the date that it is queried with, which attempts to be historically accurate (within reason) as to the actual time that clocks showed there.

No other identifiers than the ones deemed valid by one of the above two rules (`±HH:MM` or [IsValidTimeZoneName](https://tc39.es/ecma402/#sec-isvalidtimezonename)), are currently permitted.

Custom time zones are a desirable feature because implementations may want to prevent leaking information about what historical revision of the time zone data is present on the host system, or control what information about the host system's current time zone is exposed.
See [issue #273](https://github.com/tc39/proposal-temporal/issues/273).

API users may also want to perform time zone calculations with older, or newer, or more accurate versions of the time zone data than what is present in their implementation.

As an example, the `America/Chicago` time zone in the tzdata database is based on the historical time in Chicago.
Before the year 1883, when the US introduced time zones due to the influence of railroads, Chicago observed the local mean time of GMT-05:50:36.
Other cities in what is now the `America/Chicago` time zone would have observed their own local mean times.
If a user wanted to do accurate calculations for times occurring before 1883 in places in the `America/Chicago` time zone other than Chicago, a custom time zone would be required.
For example, St. Louis's local mean time is GMT-06:00:49.11 ([Byrd, Mary E., 1899, _A Laboratory Manual In Astronomy_, p. 63. Athenaeum Press: Boston.](https://books.google.ca/books?id=Xfg3AAAAMAAJ&pg=PA63))

## Usage of a custom time zone

Like built-in time zones, custom time zones have an `[[Identifier]]`.
In these examples we assume a custom time zone class `StLouisTime` with the identifier `America/St_Louis`.
(See the following section for how such a time zone object would be obtained.)

When parsing an ISO 8601 string, the only places the time zone identifier is taken into account are `Temporal.Absolute.from()` and `Temporal.TimeZone.from()`.

These functions gain an `options` parameter with an `idToTimeZone` option, whose value is a function returning the appropriate time zone object for the `id` passed in, or `null` to indicate that the time zone doesn't exist.

If the option is not given, `Temporal.TimeZone.fromId()` is called.
This is a new static method of `Temporal.TimeZone`.

`Temporal.TimeZone.fromId()` can be monkeypatched by time zone implementors if it is necessary to make new time zones available globally.
The expectation is that it would rarely be necessary to do so, because if you have implemented a custom time zone for a particular calculation, you probably don't need it to be available globally.

> **FIXME:** Note that there is an issue open regarding this behaviour for calendars: [#294](https://github.com/tc39/proposal-temporal/issues/294)

```javascript
function idToTimeZone(id) {
  if (id === 'America/St_Louis')
    return new StLouisTime();
  return Temporal.TimeZone.fromId(id);
}

Temporal.Absolute.from('1820-04-01T18:16:25-06:00[America/St_Louis]', { idToTimeZone })
  // returns the Absolute corresponding to 1820-04-02T00:17:14.110Z

Temporal.TimeZone.from('1820-04-01T18:16:25-06:00[America/St_Louis]', { idToTimeZone })
  // returns a new StLouisTime instance
```

> **FIXME:** Passing a custom time zone's identifier to the built-in `Temporal.TimeZone` constructor currently doesn't work: `new Temporal.TimeZone('America/St_Louis')` throws.
> However, this must change, because implementations would need to call `super(id)` to set the _[[Identifier]]_ and _[[InitializedTemporalTimeZone]]_ internal slots.
> Maybe we need to only throw if `new.target === Temporal.TimeZone`?

In order to lock down any leakage of information about the host system's time zone database, one would monkeypatch the `Temporal.TimeZone.fromId()` function which performs the built-in mapping, change the list of allowed time zones that `Temporal.TimeZone` iterates through, and replace `Temporal.now.timeZone()` to avoid exposing the current time zone.
Or just replace the `Temporal.TimeZone` class and `Temporal.now` object altogether:

```javascript
// For example, to allow only offset time zones:

TemporalTimeZone_fromId = Temporal.TimeZone.fromId;
Temporal.TimeZone.fromId = function (id) {
  if (/^[+-]\d{2}:?\d{2}$/.test(id) || id === 'UTC')
    return TemporalTimeZone_fromId(id);
  return null;
}
Temporal.TimeZone[Symbol.iterator] = function* () { return null; }
Temporal.now.timeZone = function () { return Temporal.TimeZone.fromId('UTC'); }

// or, to replace the built-in implementation altogether:

Temporal.TimeZone = LockedDownTimeZoneImplementation;
Temporal.now = lockedDownNowObject;
```

## Implementation of a custom time zone

### TimeZone interface

```javascript
class Temporal.TimeZone {
  /** Sets the [[Identifier]] internal slot to @id, and creates the
   * [[InitializedTemporalTimeZone]] internal slot. A subclassed custom
   * time zone must chain up to this constructor. */
  constructor(id : string) : Temporal.TimeZone;

  // Methods that a subclassed custom time zone must implement

  /** Given an absolute instant returns this time zone's corresponding
   * UTC offset, in nanoseconds (signed). */
  getOffsetAtInstant(absolute : Temporal.Absolute) : number;

  /** Given the calendar/wall-clock time, returns an array of 0, 1, or
   * 2 absolute instants that are possible points on the timeline
   * corresponding to it. In getAbsoluteFor(), one of these will be
   * selected, depending on the disambiguation option. */
  possibleInstants(dateTime : Temporal.DateTime) : array<Temporal.Absolute>;

  /** Returns an iterator of all following offset transitions, starting
   * from @startingPoint. */
  *getTransitions(startingPoint : Temporal.Absolute) : iterator<Temporal.Absolute>;

  // API methods that a subclassed custom time zone doesn't need to touch

  get name() : string;
  getDateTimeFor(absolute : Temporal.Absolute) : Temporal.DateTime;
  getAbsoluteFor(
      dateTime : Temporal.DateTime,
      options?: object
  ) : Temporal.Absolute;
  getOffsetFor(absolute : Temporal.Absolute) : string;
  toString() : string;
  toJSON() : string;

  static from(item : any, options?: object) : Temporal.TimeZone;
  static fromId(id: string) : Temporal.TimeZone;
  static [Symbol.iterator]() : iterator<Temporal.TimeZone>;
}
```

All the methods that custom time zones inherit from `Temporal.TimeZone` are implemented in terms of `getOffsetAtInstant()`, `possibleInstants()`, and the value of the _[[Identifier]]_ internal slot.
For example, `getOffsetFor()` and `getDateTimeFor()` call `getOffsetAtInstant()`, and `getAbsoluteFor()` calls both.

> **FIXME:** These names are not very good.
> Help is welcome in determining the color of this bike shed.

Alternatively, a custom time zone doesn't have to be a subclass of `Temporal.TimeZone`.
In this case, it can be a plain object, which must implement `getOffsetAtInstant()`, `possibleInstants()`, and `toString()`.

> **FIXME:** This means we have to remove any checks for the _[[InitializedTemporalTimeZone]]_ slot in all APIs, so that plain objects can use them with e.g. `Temporal.TimeZone.prototype.getOffsetFor.call(plainObject, absolute)`.

> **FIXME:** `Temporal.TimeZone` is supposed to be an iterable through all time zones known to the implementation, but what do we do about custom time zones there?

## Show Me The Code

Here's what it could look like to implement the built-in offset-based time zones as custom time zones.
The `MakeDate`, `MakeDay`, and `MakeTime` functions are as in the [ECMA-262 specification](https://tc39.es/ecma262/#sec-overview-of-date-objects-and-definitions-of-abstract-operations), except that instead of milliseconds, `MakeDate` and `MakeDay` return BigInt-typed nanoseconds, and `MakeTime` returns Number-typed nanoseconds.
(This example leaves out all the type checking, range checking, and error handling, just to show the bare bones.)

```javascript
class OffsetTimeZone extends Temporal.TimeZone {
  #offsetNs;
  constructor(sign = 1, h = 0, min = 0, s = 0, ms = 0, µs = 0, ns = 0) {
    const offsetNs = MakeTime(h, min, s, ms, µs, ns);
    if (sign === -1 && offsetNs === 0) sign = 1;  // "-00:00" is "+00:00"
    const hourString = `${h}`.padStart(2, '0');
    const minuteString = `${min}`.padStart(2, '0');
    const name = `${sign < 0 ? '-' : '+'}${hourString}:${minuteString}`;
    super(name);
    this.#offsetNs = sign * offsetNs;
  }

  getOffsetAtInstant(/* absolute */) {
    return this.#offsetNs; // offset is always the same
  }

  possibleInstants(dateTime) {
    const iso = dateTime.getISOFields();
    const epochNs = MakeDate(
      MakeDay(iso.year, iso.month, iso.day),
      MakeTime(iso.hour, iso.minute, iso.second, iso.millisecond, iso.microsecond, iso.nanosecond)
    );
    return [Temporal.Absolute(epochNs + BigInt(this.#offsetNs))];
  }

  *getTransitions() {
    return null; // no transitions ever
  }

  static fromId(id) {
    const match = /^([+-])(\d{2}):?(\d{2})$/.exec(id);
    if (match) {
      const [, sign, hours, minutes] = result;
      return new OffsetTimeZone(sign === '-' ? -1 : 1, +hours, +minutes, 0, 0, 0, 0);
    }
    return Temporal.TimeZone.fromId(id);
  }
}
```
