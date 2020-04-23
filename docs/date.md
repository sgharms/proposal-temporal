# Temporal.Date

A `Temporal.Date` represents a calendar date.
"Calendar date" refers to the concept of a date as expressed in everyday usage, independent of any time zone.
For example, it could be used to represent an event on a calendar which happens during the whole day no matter which time zone it's happening in.

`Temporal.Date` refers to the whole of a specific day; if you need to refer to a specific time on that day, use `Temporal.DateTime`.
A `Temporal.Date` can be converted into a `Temporal.DateTime` by combining it with a `Temporal.Time` using the `withTime()` method.

`Temporal.YearMonth` and `Temporal.MonthDay` carry less information than `Temporal.Date` and should be used when complete information is not required.

## Constructor

### **new Temporal.Date**(_isoYear_: number, _isoMonth_: number, _isoDay_: number) : Temporal.Date

**Parameters:**
- `isoYear` (number): A year.
- `isoMonth` (number): A month, ranging between 1 and 12 inclusive.
- `isoDay` (number): A day of the month, ranging between 1 and 31 inclusive.

**Returns:** a new `Temporal.Date` object.

Use this constructor if you have the correct parameters for the date already as individual number values.
Otherwise, `Temporal.Date.from()`, which accepts more kinds of input and allows disambiguation behaviour, is probably more convenient.

All values are given as reckoned in the [ISO 8601 calendar](https://en.wikipedia.org/wiki/ISO_8601#Dates).
Together, `isoYear`, `isoMonth`, and `isoDay` must represent a valid date in that calendar.

The range of allowed values for this type is exactly enough that calling [`getDate()`](./datetime.html#getDate) on any valid `Temporal.DateTime` will succeed.
If `isoYear`, `isoMonth`, and `isoDay` form a date outside of this range, then `constrain` mode will clamp the date to the limit of the allowed range.
Both `balance` and `reject` mode will throw a `RangeError` in this case.

Usage examples:
```javascript
// Pi day in 2020
date = new Temporal.Date(2020, 3, 14)  // => 2020-03-14
```

## Static methods

### Temporal.Date.**from**(_thing_: any, _options_?: object) : Temporal.Date

**Parameters:**
- `thing`: The value representing the desired date.
- `options` (optional object): An object with properties representing options for constructing the date.
  The following options are recognized:
  - `disambiguation` (string): How to deal with out-of-range values in `thing`.
    Allowed values are `constrain`, `balance`, and `reject`.
    The default is `constrain`.

**Returns:** a new `Temporal.Date` object.

This static method creates a new `Temporal.Date` object from another value.
If the value is another `Temporal.Date` object, a new object representing the same date is returned.
If the value is any other object, it must have `year`, `month`, and `day` properties, and a `Temporal.Date` will be constructed from them.

Any non-object value is converted to a string, which is expected to be in ISO 8601 format.
Any time or time zone part is optional and will be ignored.
If the string isn't valid according to ISO 8601, then a `RangeError` will be thrown regardless of the value of `disambiguation`.

The `disambiguation` option works as follows:
- In `constrain` mode (the default), any out-of-range values are clamped to the nearest in-range value.
- In `balance` mode, any out-of-range values are resolved by balancing them with the next highest unit.
- In `reject` mode, the presence of out-of-range values will cause the function to throw a `RangeError`.

Example usage:
```javascript
date = Temporal.Date.from('2006-08-24');  // => 2006-08-24
date = Temporal.Date.from('2006-08-24T15:43:27');  // => 2006-08-24
date = Temporal.Date.from('2006-08-24T15:43:27Z');  // => 2006-08-24
date = Temporal.Date.from('2006-08-24T15:43:27+01:00[Europe/Brussels]');
  // => 2006-08-24
date === Temporal.Date.from(date)  // => true

date = Temporal.Date.from({year: 2006, month: 8, day: 24});  // => 2006-08-24
date = Temporal.Date.from(Temporal.DateTime.from('2006-08-24T15:43:27'));
  // => same as above; Temporal.DateTime has year, month, and day properties

// Different disambiguation modes
date = Temporal.Date.from({ year: 2001, month: 13, day: 1 }, { disambiguation: 'constrain' })
  // => 2001-12-01
date = Temporal.Date.from({ year: 2001, month: -1, day: 1 }, { disambiguation: 'constrain' })
  // => 2001-01-01
date = Temporal.Date.from({ year: 2001, month: 13, day: 1 }, { disambiguation: 'balance' })
  // => 2002-01-01
date = Temporal.Date.from({ year: 2001, month: 0, day: 1 }, { disambiguation: 'balance' });
  // => 2000-12-01
date = Temporal.Date.from({ year: 2001, month: -1, day: 1 }, { disambiguation: 'balance' })
  // => 2000-11-01
date = Temporal.Date.from({ year: 2001, month: 13, day: 1 }, { disambiguation: 'reject' })
  // throws
date = Temporal.Date.from({ year: 2001, month: -1, day: 1 }, { disambiguation: 'reject' })
  // throws
```

### Temporal.Date.**compare**(_one_: Temporal.Date, _two_: Temporal.Date) : number

**Parameters:**
- `one` (`Temporal.Date`): First date to compare.
- `two` (`Temporal.Date`): Second date to compare.

**Returns:** &minus;1, 0, or 1.

Compares two `Temporal.Date` objects.
Returns an integer indicating whether `one` comes before or after or is equal to `two`.
- &minus;1 if `one` comes before `two`;
- 0 if `one` and `two` are the same;
- 1 if `one` comes after `two`.

This function can be used to sort arrays of `Temporal.Date` objects.
For example:
```javascript
one = Temporal.Date.from('2006-08-24');
two = Temporal.Date.from('2015-07-14');
three = Temporal.Date.from('1930-02-18');
sorted = [one, two, three].sort(Temporal.Date.compare);
sorted.join(' ');  // => 1930-02-18 2006-08-24 2015-07-14
```

## Properties

### date.**year** : number

### date.**month** : number

### date.**day** : number

The above read-only properties allow accessing each component of the date individually.

Usage examples:
```javascript
date = Temporal.Date.from('2006-08-24');
date.year   // => 2006
date.month  // => 8
date.day    // => 24
```

### date.**dayOfWeek** : number

The `dayOfWeek` read-only property gives the weekday number that the date falls on.
The weekday number is defined as in the ISO 8601 standard: a value between 1 and 7, inclusive, with Monday being 1, and Sunday 7.
For an overview, see [ISO 8601 on Wikipedia](https://en.wikipedia.org/wiki/ISO_8601#Week_dates).

Usage example:
```javascript
date = Temporal.Date.from('2006-08-24');
['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][date.dayOfWeek - 1]  // => THU
```

### date.**dayOfYear** : number

The `dayOfYear` read-only property gives the ordinal day of the year that the date falls on.
This is a value between 1 and 365, or 366 in a leap year.

Usage example:
```javascript
date = Temporal.Date.from('2006-08-24');
// ISO ordinal date
console.log(date.year, date.dayOfYear);  // 2006 236
```

### date.**weekOfYear** : number

The `weekOfYear` read-only property gives the ISO week number of the date.
This is normally a value between 1 and 52, but in a few cases it can be 53 as well.
ISO week 1 is the week containing the first Thursday of the year.
For more information on ISO week numbers, see for example the Wikipedia article on [ISO week date](https://en.wikipedia.org/wiki/ISO_week_date).

Usage example:
```javascript
date = Temporal.Date.from('2006-08-24');
// ISO week date
console.log(date.year, date.weekOfYear, date.dayOfWeek);  // 2006 34 4
```

### date.**daysInMonth** : number

The `daysInMonth` read-only property gives the number of days in the month that the date falls in.
This is 28, 29, 30, or 31, depending on the month and whether the year is a leap year.

Usage example:
```javascript
// Attempt to write some mnemonic poetry
const monthsByDays = {};
for (let month = 1; month <= 12; month++) {
    const date = Temporal.now.date().with({month});
    monthsByDays[date.daysInMonth] = (monthsByDays[date.daysInMonth] || []).concat(date);
}

const strings = monthsByDays[30].map(date => date.toLocaleString('en', {month: 'long'}));
// Shuffle to improve poem as determined empirically
strings.unshift(strings.pop());
const format = new Intl.ListFormat('en');
const poem = `Thirty days hath ${format.format(strings)}`;

console.log(poem);
```

### date.**daysInYear** : number

The `daysInYear` read-only property gives the number of days in the year that the date falls in.
This is 365 or 366, depending on whether the year is a leap year.

Usage example:
```javascript
date = Temporal.now.date();
percent = date.dayOfYear / date.daysInYear;
`The year is ${percent.toLocaleString('en', {style: 'percent'})} over!`
// example output: "The year is 10% over!"
```

### date.**isLeapYear** : boolean

The `leapYear` read-only property tells whether the year that the date falls in is a leap year or not.
Its value is `true` if the year is a leap year, and `false` if not.

Usage example:
```javascript
// Is this year a leap year?
date = Temporal.now.date();
date.leapYear  // example output: true
// Is 2100 a leap year? (no, because it's divisible by 100 and not 400)
date.with({year: 2100}).leapYear  // => false
```

## Methods

### date.**with**(_dateLike_: object, _options_?: object) : Temporal.Date

**Parameters:**
- `dateLike` (object): an object with some or all of the properties of a `Temporal.Date`.
- `options` (optional object): An object with properties representing options for the operation.
  The following options are recognized:
  - `disambiguation` (string): How to deal with out-of-range values.
    Allowed values are `constrain`, `balance`, and `reject`.
    The default is `constrain`.

**Returns:** a new `Temporal.Date` object.

This method creates a new `Temporal.Date` which is a copy of `date`, but any properties present on `dateLike` override the ones already present on `date`.

Since `Temporal.Date` objects are immutable, use this method instead of modifying one.

Usage example:
```javascript
date = Temporal.Date.from('2006-08-24');
// What's the first of the following month?
date.with({day: 1, month: date.month + 1}, { disambiguation: 'balance' })  // => 2006-09-01
```

### date.**plus**(_duration_: object, _options_?: object) : Temporal.Date

**Parameters:**
- `duration` (object): A `Temporal.Duration` object or a duration-like object.
- `options` (optional object): An object with properties representing options for the addition.
  The following options are recognized:
  - `disambiguation` (optional string): How to deal with additions that result in out-of-range values.
    Allowed values are `constrain` and `reject`.
    The default is `constrain`.

**Returns:** a new `Temporal.Date` object which is the date indicated by `date` plus `duration`.

This method adds `duration` to `date`, returning a date that is in the future relative to `date`.

The `duration` argument is an object with properties denoting a duration, such as `{ days: 5 }`, or a `Temporal.Duration` object.

Some additions may be ambiguous, because months have different lengths.
For example, adding one month to August 31 would result in September 31, which doesn't exist.
For these cases, the `disambiguation` option tells what to do:
- In `constrain` mode (the default), out-of-range values are clamped to the nearest in-range value.
- In `reject` mode, an addition that would result in an out-of-range value fails, and a `RangeError` is thrown.

Additionally, if the result is outside the range of dates that `Temporal.Date` can represent, then `constrain` mode will clamp the result to the allowed range.
The `reject` mode will throw a `RangeError` in this case.

Usage example:
```javascript
date = Temporal.Date.from('2006-08-24');
date.plus({years: 20, months: 4})  // => 2026-12-24

date = Temporal.Date.from('2019-01-31')
date.plus({ months: 1 })  // => 2019-02-28
date.plus({ months: 1 }, { disambiguation: 'reject' })  // => throws
```

### date.**minus**(_duration_: object, _options_?: object) : Temporal.Date

**Parameters:**
- `duration` (object): A `Temporal.Duration` object or a duration-like object.
- `options` (optional object): An object with properties representing options for the subtraction.
  The following options are recognized:
  - `disambiguation` (string): How to deal with subtractions that result in out-of-range values.
    Allowed values are `constrain` and `reject`.
    The default is `constrain`.

**Returns:** a new `Temporal.Date` object which is the date indicated by `date` minus `duration`.

This method subtracts `duration` from `date`, returning a date that is in the past relative to `date`.

The `duration` argument is an object with properties denoting a duration, such as `{ days: 5 }`, or a `Temporal.Duration` object.

Some subtractions may be ambiguous, because months have different lengths.
For example, subtracting one month from July 31 would result in June 31, which doesn't exist.
For these cases, the `disambiguation` option tells what to do:
- In `constrain` mode (the default), out-of-range values are clamped to the nearest in-range value.
- In `reject` mode, an addition that would result in an out-of-range value fails, and a `RangeError` is thrown.

Additionally, if the result is outside the range of dates that `Temporal.Date` can represent, then `constrain` mode will clamp the result to the allowed range.
The `reject` mode will throw a `RangeError` in this case.

Usage example:
```javascript
date = Temporal.Date.from('2006-08-24');
date.minus({years: 20, months: 4})  // => 1986-04-24

date = Temporal.Date.from('2019-03-31')
date.minus({ months: 1 })  // => 2019-02-28
date.minus({ months: 1 }, { disambiguation: 'reject' })  // => throws
```

### date.**difference**(_other_: Temporal.Date, _options_?: object) : Temporal.Duration

**Parameters:**
- `other` (`Temporal.Date`): Another date with which to compute the difference.
- `options` (optional object): An object with properties representing options for the operation.
  The following options are recognized:
  - `largestUnit` (optional string): The largest unit of time to allow in the resulting `Temporal.Duration` object.
    Valid values are `'years'`, `'months'`, and `'days'`.
    The default is `days`.

**Returns:** a `Temporal.Duration` representing the difference between `date` and `other`.

This method computes the difference between the two dates represented by `date` and `other`, and returns it as a `Temporal.Duration` object.
The difference is always positive, no matter the order of `date` and `other`, because `Temporal.Duration` objects cannot represent negative durations.

The `largestUnit` option controls how the resulting duration is expressed.
The returned `Temporal.Duration` object will not have any nonzero fields that are larger than the unit in `largestUnit`.
A difference of two years will become 24 months when `largestUnit` is `"months"`, for example.
However, a difference of two months will still be two months even if `largestUnit` is `"years"`.

By default, the largest unit in the result is days.
This is because months and years can be different lengths depending on which month is meant and whether the year is a leap year.
Unlike other Temporal types, hours and lower are not allowed, because the data model of `Temporal.Date` doesn't have that accuracy.

Usage example:
```javascript
date = Temporal.Date.from('2006-08-24');
other = Temporal.Date.from('2019-01-31');
date.difference(other)                            // => P4543D
date.difference(other, { largestUnit: 'years' })  // => P12Y5M7D

// If you really need to calculate the difference between two Dates in
// hours, you can eliminate the ambiguity by explicitly choosing the
// point in time from which you want to reckon the difference. For
// example, using midnight:
midnight = Temporal.Time.from('00:00');
date.withTime(midnight).difference(other.withTime(midnight), { largestUnit: 'hours' })
  // => PT109032H
```

### date.**toString**() : string

**Returns:** a string in the ISO 8601 date format representing `date`.

This method overrides the `Object.prototype.toString()` method and provides a convenient, unambiguous string representation of `date`.
The string can be passed to `Temporal.Date.from()` to create a new `Temporal.Date` object.

Example usage:
```js
date = Temporal.Date.from('2006-08-24');
date.toString();  // => 2006-08-24
```

### date.**toLocaleString**(_locales_?: string | array&lt;string&gt;, _options_?: object) : string

**Parameters:**
- `locales` (optional string or array of strings): A string with a BCP 47 language tag with an optional Unicode extension key, or an array of such strings.
- `options` (optional object): An object with properties influencing the formatting.

**Returns:** a language-sensitive representation of `date`.

This method overrides `Object.prototype.toLocaleString()` to provide a human-readable, language-sensitive representation of `date`.

The `locales` and `options` arguments are the same as in the constructor to [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat).

Example usage:
```js
date = Temporal.Date.from('2006-08-24');
date.toLocaleString();  // => example output: 8/24/2006
date.toLocaleString('de-DE');  // => example output: 24.8.2006
date.toLocaleString('de-DE', { weekday: 'long' });  // => Donnerstag, 24.8.2006
date.toLocaleString('en-US-u-nu-fullwide');  // => ８/２４/２００６
```

### date.**toJSON**() : string

**Returns:** a string in the ISO 8601 date format representing `date`.

This method is the same as `date.toString()`.
It is usually not called directly, but it can be called automatically by `JSON.stringify()`.

The reverse operation, recovering a `Temporal.Date` object from a string, is `Temporal.Date.from()`, but it cannot be called automatically by `JSON.parse()`.
If you need to rebuild a `Temporal.Date` object from a JSON string, then you need to know the names of the keys that should be interpreted as `Temporal.Date`s.
In that case you can build a custom "reviver" function for your use case.

Example usage:
```js
const student = {
  id: 429,
  name: 'Emilia Connor',
  birthDate: Temporal.Date.from('1997-09-08'),
};
const str = JSON.stringify(student, null, 2);
console.log(str);
// =>
// {
//   "id": 429,
//   "name": "Emilia Connor",
//   "birthDate": "1997-09-08"
// }

// To rebuild from the string:
function reviver(key, value) {
  if (key.endsWith('Date'))
    return Temporal.Date.from(value);
  return value;
}
JSON.parse(str, reviver);
```

### date.**withTime**(_time_: Temporal.Time) : Temporal.DateTime

**Parameters:**
- `time` (`Temporal.Time`): A time of day on `date`.

**Returns:** a `Temporal.DateTime` object that represents the wall-clock time `time` on the calendar date `date`.

This method can be used to convert `Temporal.Date` into a `Temporal.DateTime`, by supplying the time of day to use.
The converted object carries a copy of all the relevant fields of `date` and `time`.

This is exactly equivalent to [`time.withDate(date)`](./time.html#withDate).

Usage example:
```javascript
date = Temporal.Date.from('2006-08-24');
time = Temporal.Time.from('15:23:30.003');
date.withTime(time)  // => 2006-08-24T15:23:30.003
```

### date.**getYearMonth**() : Temporal.YearMonth

**Returns:** a `Temporal.YearMonth` object that is the same as the year and month of `date`.

### date.**getMonthDay**() : Temporal.MonthDay

**Returns:** a `Temporal.MonthDay` object that is the same as the month and day of `date`.

The above two methods can be used to convert `Temporal.Date` into a `Temporal.YearMonth` or `Temporal.MonthDay` respectively.
The converted object carries a copy of all the relevant fields of `date` (for example, in `getYearMonth()`, the `year` and `month` properties are copied.)

Usage example:
```javascript
date = Temporal.Date.from('2006-08-24');
date.getYearMonth()  // => 2006-08
date.getMonthDay()  // => 08-24
```

### date.**getFields**() : { year: number, month: number, day: number }

**Returns:** a plain object with properties equal to the fields of `date`.

This method can be used to convert a `Temporal.Date` into a record-like data structure.
It returns a new plain JavaScript object, with all the fields as enumerable, writable, own data properties.

Note that if using a different calendar from ISO 8601, these will be the calendar-specific values.
To get the ISO 8601 values, use `date.getISOFields()`.

Usage example:
```javascript
date = Temporal.Date.from('2006-08-24');
Object.assign({}, date).day  // => undefined
Object.assign({}, date.getFields()).day  // => 24
```
