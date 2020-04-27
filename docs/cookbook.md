# Temporal Cookbook

## Overview

<!-- toc -->

## Running the cookbook files

Running cookbook files: see instructions in ../polyfill/README.md

## Frequently Asked Questions

These are some of the most common tasks that people ask questions about on StackOverflow with legacy Date.
Here's how they would look using Temporal.

### Current date and time

How to get the current date and time in the local time zone?

```javascript
{{cookbook/getCurrentDate.mjs}}
```

### Unix timestamp

How to get a Unix timestamp?

```javascript
{{cookbook/getTimeStamp.mjs}}
```

## Converting between Temporal types and legacy Date

### Absolute from legacy Date

Map a legacy ECMAScript Date instance into a Temporal.Absolute instance corresponding to the same instant in absolute time.

```javascript
{{cookbook/absoluteFromLegacyDate.mjs}}
```

## Construction

### Time zone object from name

`Temporal.TimeZone.from()` can convert an IANA time zone name into a `Temporal.TimeZone` object.

```javascript
{{cookbook/getTimeZoneObjectFromIanaName.mjs}}
```

### Calendar input element

You can use Temporal objects to set properties on a calendar control.
Here is an example using an HTML `<input type="date">` element with any day beyond “today” disabled and not selectable.

<input type="date" id="calendar-input">

<script type="text/javascript">
{{cookbook/calendarInput.js}}
</script>

```javascript
{{cookbook/calendarInput.js}}
```

## Serialization

### Zoned instant from instant and time zone

Use the optional parameter of `Temporal.Absolute.prototype.toString()` to map a Temporal.Absolute instance and a time zone name into a string serialization of the local time in that zone corresponding to the instant in absolute time.

Without the parameter, `Temporal.Absolute.prototype.toString()` gives a serialization in UTC time.
Using the parameter is useful if you need your serialized strings to be in a specific time zone.

```javascript
{{cookbook/getParseableZonedStringAtInstant.mjs}}
```

## Sorting

Each Temporal type has a `compare()` static method, which can be passed to `Array.prototype.sort()` as the compare function in order to sort an array of Temporal types.

### Sort DateTimes

Sort a list of `Temporal.DateTime`s, for example in order to get a conference schedule in the correct order.
Sorting other Temporal types would work exactly the same way as this.

```javascript
{{cookbook/getSortedLocalDateTimes.mjs}}
```

### Sort ISO date/time strings

Sort a list of ISO 8601 date/time strings, for example to place log entries in order.

```javascript
{{cookbook/sortAbsoluteInstants.mjs}}
```

## Time zone conversion

### Preserving absolute instant

Map a zoned date and time of day into a string serialization of the local time in a target zone at the corresponding instant in absolute time.
This could be used when converting user-input date-time values between time zones.

```javascript
{{cookbook/getParseableZonedStringWithLocalTimeInOtherZone.mjs}}
```

### Daily occurrence in local time

Similar to the previous recipe, calculate the absolute times of a daily occurrence that happens at a particular local time in a particular time zone.

```javascript
{{cookbook/calculateDailyOccurrence.mjs}}
```

### UTC offset for a zoned event, as a string

Use `Temporal.TimeZone.getOffsetFor()` to map a `Temporal.Absolute` instance and a time zone into the UTC offset at that instant in that time zone, as a string.

```javascript
{{cookbook/getUtcOffsetStringAtInstant.mjs}}
```

### UTC offset for a zoned event, as a number of seconds

It's a bit more complicated to do the above mapping as a number of seconds instead of a string.

```javascript
{{cookbook/getUtcOffsetSecondsAtInstant.mjs}}
```

### Offset between two time zones at an instant

With a small variation on the previous recipe we can map a `Temporal.Absolute` instance and two time zones into the signed difference of UTC offsets between those time zones at that instant, as a number of seconds.

```javascript
{{cookbook/getUtcOffsetDifferenceSecondsAtInstant.mjs}}
```

## Arithmetic

### How many days until a future date

An example HTML form inspired by [Days Calculator](https://www.timeanddate.com/date/durationresult.html) on timeanddate.com:

<form action="#how-many-days-until-a-future-date">
  <label>
    Enter future date:
    <input type="date" name="futuredate">
  </label>
  <button>Submit</button>
</form>

<div id="futuredate-results"></div>

<script type="text/javascript">
{
  // Do initialization that doesn't necessarily need to be included in
  // the example; see 'Calendar input element'
  const futureDatePicker = document.querySelector('input[name="futuredate"]');
  const today = Temporal.now.date();
  futureDatePicker.min = today;
  futureDatePicker.value = today.plus({ months: 1 });
}
{{cookbook/futureDateForm.js}}
</script>

```javascript
{{cookbook/futureDateForm.js}}
```

### Unit-constrained duration between now and a past/future zoned event

Map two Temporal.Absolute instances into an ascending/descending order indicator and a Temporal.Duration instance representing the duration between the two instants without using units coarser than specified (e.g., for presenting a meaningful countdown with vs. without using months or days).

```javascript
{{cookbook/getElapsedDurationSinceInstant.mjs}}
```

### Nearest offset transition in a time zone

Map a Temporal.Absolute instance and a Temporal.TimeZone object into a Temporal.Absolute instance representing the nearest following instant at which there is an offset transition in the time zone (e.g., for setting reminders).

```javascript
{{cookbook/getInstantOfNearestOffsetTransitionToInstant.mjs}}
```

### Comparison of an instant to business hours

This example takes a roster of opening and closing times for a business, and maps a localized date and time of day into a time-sensitive state indicator ("opening soon" vs. "open" vs. "closing soon" vs. "closed").

```javascript
{{cookbook/getBusinessOpenStateText.mjs}}
```

### Flight arrival/departure/duration

Map localized trip departure and arrival times into trip duration in units no larger than hours.

```javascript
{{cookbook/getTripDurationInHrMinSec.mjs}}
```

Map localized departure time and duration into localized arrival time.

```javascript
{{cookbook/getLocalizedArrival.mjs}}
```

### Push back a launch date

Add the number of days it took to get an approval, and advance to the start of the following month.

```javascript
{{cookbook/plusAndRoundToMonthStart.mjs}}
```

### Schedule a reminder ahead of matching a record-setting duration

Map a `Temporal.Absolute` instance, a previous-record `Temporal.Duration`, and an advance-notice `Temporal.Duration` into a `Temporal.Absolute` instance corresponding with an absolute instant ahead of the instant at which the previous record will be matched by the specified window.
This could be used for workout tracking, racing (including _long_ and potentially time-zone-crossing races like the Bullrun Rally, Iditarod, Self-Transcendence 3100, and Clipper Round The World), or even open-ended analogs like event-every-day "streaks".

```javascript
{{cookbook/getInstantBeforeOldRecord.mjs}}
```

### Nth weekday of the month

Example of getting a `Temporal.Date` representing the first Tuesday of the given `Temporal.YearMonth`, adaptable to other weekdays.

```javascript
{{cookbook/getFirstTuesdayOfMonth.mjs}}
```

Given a `Temporal.YearMonth` instance and an ISO 8601 ordinal calendar day of the week ranging from 1 (Monday) to 7 (Sunday), return a chronologically ordered array of `Temporal.Date` instances corresponding with every day in the month that is the specified day of the week (of which there will always be either four or five).

```javascript
{{cookbook/getWeeklyDaysInMonth.mjs}}
```

Given a `Temporal.Date` instance, return the count of preceding days in its month that share its day of the week.

```javascript
{{cookbook/countPrecedingWeeklyDaysInMonth.mjs}}
```

### Next weekly occurrence

From a `Temporal.Absolute` instance and a local `Temporal.TimeZone`, get a `Temporal.DateTime` representing the next occurrence of a weekly event that is scheduled on a particular weekday and time in a particular time zone. (For example, "weekly on Thursdays at 08:45 California time").

```javascript
{{cookbook/nextWeeklyOccurrence.mjs}}
```
