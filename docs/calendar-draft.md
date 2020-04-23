# Draft Design of Temporal Calendar API

This doc describes a design for first-class support for non-Gregorian [calendars](https://en.wikipedia.org/wiki/Calendar) in Temporal.  Although most of this document is based on Temporal.Date, most of this applies to Temporal.DateTime, Temporal.YearMonth, Temporal.MonthDay, and Temporal.Time as well.

## Data Model

### Temporal.Date internal slots

Main issue: https://github.com/tc39/proposal-temporal/issues/290

Temporal.Date currently has three internal slots: year, month, and day. (An "internal slot" refers to actual data, as opposed to "properties", which could be computed.)  In this proposal, those slots are renamed to `[[IsoYear]]`, `[[IsoMonth]]`, and `[[IsoDay]]`, and an additional `[[Calendar]]` slot is added.  The calendar slot contains an object implementing the Temporal.Calendar interface, described below.

No matter which calendar system is being represented, the *data model* in Temporal.Date remains indexed in the ISO calendar.  So, for instance, if you wanted to represent the Hebrew date 5 Nisan 5780, the data model would be 2020-03-30, and the calendar would be responsible for mapping that into the corresponding Hebrew fields, as described further down in this document.

This data model makes the simple assumption that the concept of a "day" is a solar day (main issues: [#390](https://github.com/tc39/proposal-temporal/issues/390), [#389](https://github.com/tc39/proposal-temporal/issues/389)).  Most or all modern-use calendars, even those with lunar month cycles, use a solar day (based on sunrise) instead of a lunar day (based of moonrise).  For calendars that do use a lunar day, such as the Hawaiian Moon Calendar, a Temporal.DateTime can be used instead of Temporal.Date when the distinction is important.

### Temporal.DateTime and Temporal.Time internal slots

As with Temporal.Date, all of these types will gain a `[[Calendar]]` slot, and year, month, and day will be renamed `[[IsoYear]]`, `[[IsoMonth]]`, and `[[IsoDay]]`.

### Temporal.YearMonth and Temporal.MonthDay internal slots

Main issue: https://github.com/tc39/proposal-temporal/issues/391

For reasons explained above, using the ISO calendar as the internal data model has many advantages.  However, there are several challenges for these two "incomplete" types: lunar months don't line up with solar months, and not every lunar month occurs in every solar year.  After discussing several data model alternatives, we reached the conclusion that the simplest data model for Temporal.YearMonth and Temporal.MonthDay is to make it share the same data model as Temporal.Date, with the following slots:

Temporal.YearMonth:

- `[[IsoYear]]`
- `[[IsoMonth]]`
- `[[Calendar]]`
- `[[RefIsoDay]]`

Temporal.MonthDay:

- `[[IsoMonth]]`
- `[[IsoDay]]`
- `[[Calendar]]`
- `[[RefIsoYear]]`

For calendars that use ISO-style months, such as Gregorian, Solar Buddhist, and Japanese, "RefIsoDay" and "RefIsoYear" can be ignored.  However, for lunar and lunisolar calendars, such as Hebrew, Saudi Arabian Islamic, and Chinese, these additional fields allow those calendars to disambiguate which YearMonth and MonthDay are being represented.  The fields are called "Ref", or "reference", because they are only used in calendars that need them.

## Temporal.Calendar interface

Main issue: https://github.com/tc39/proposal-temporal/issues/289

The new Temporal.Calendar interface is a mechanism to allow arbitrary calendar systems to be implemented on top of Temporal.  ***Most users will not encounter the Temporal.Calendar interface directly***, unless they are building or using a non-built-in calendar system.

All built-in calendars will be instances of Temporal.Calendar (main issue: [#300](https://github.com/tc39/proposal-temporal/issues/300)), and Temporal.Calendar can be subclassed.  However, an object need not be a subclass of Temporal.Calendar to conform to the interface, which are the string methods listed below.

We had also considered using symbols, but settled on strings after discussion with the plenary (main issue: [#310](https://github.com/tc39/proposal-temporal/issues/310)).

### Methods on the Temporal.Calendar interface

All of the following methods return new Temporal objects.

```javascript
class Temporal.Calendar {

	///////////////////
	//  To/From ISO  //
	///////////////////

	/** Returns the projection of self in the ISO calendar */
	toISO(
		self: Temporal.Date
	) : Temporal.Date;
	// FIXME: -> date.withCalendar(isoCalendar) -> isoCalendar.fromISO(date)?

	/** Returns the projection of isoDate in the custom calendar */
	fromISO(
		isoDate: Temporal.Date
	) : Temporal.Date;
	// FIXME: rename this "project" or something?

	/** Constructs a Temporal.Date from a free-form option bag */
	dateFromFields(
		fields: object,
		constructor: function
	) : Temporal.Date;

	/** Constructs a Temporal.DateTime from a free-form option bag */
	dateTimeFromFields(
		fields: object,
		constructor: function
	) : Temporal.DateTime;

	/** Constructs a Temporal.YearMonth from a free-form option bag */
	yearMonthFromFields(
		fields: object,
		constructor: function
	) : Temporal.YearMonth;

	/** Constructs a Temporal.MonthDay from a free-form option bag */
	monthDayFromFields(
		fields: object
		constructor: function
	) : Temporal.MonthDay;

	/** A string identifier for this calendar */
	id : string;

	//////////////////
	//  Arithmetic  //
	//////////////////

	/** Returns input plus duration according to the calendar rules. */
	plus(
		input: Temporal.Date,
		duration: Temporal.Duration,
		options: /* options bag */,
		constructor: function
	) : Temporal.Date;

	/** Returns input minus duration according to the calendar rules. */
	minus(
		input: Temporal.Date,
		duration: Temporal.Duration,
		options: /* options bag */,
		constructor: function
	) : Temporal.Date;

	/** Returns larger minus smaller, which are dates in the same calendar. */
	difference(
		smaller: Temporal.Date,
		larger: Temporal.Date,
		options: /* options bag */
	) : Temporal.Duration;

	////////////////////////////////////
	//  Accessors:                    //
	//  Semantics defined in date.md  //
	////////////////////////////////////

	year(
		input: Temporal.Date
	) : number;

	month(
		input: Temporal.Date
	) : number;

	day(
		input: Temporal.Date
	) : number;

	dayOfWeek(
		input: Temporal.Date
	) : number;

	weekOfYear(
		input: Temporal.Date
	) : number;

	daysInMonth(
		input: Temporal.Date
	) : number;

	daysInYear(
		input: Temporal.Date
	) : number;

	isLeapYear(
		input: Temporal.Date
	) : boolean;
}
```

The corresponding fields on Temporal.Date.prototype should forward requests to the calendar as discussed in [#291](https://github.com/tc39/proposal-temporal/issues/291):

```javascript
get foo(...args) {
  return this.calendar.foo?.(this, ...args);
}
```


Calendars can add additional *calendar-specific accessors*, such as the year type ("kesidran", "chaser", "maleh") in the Hebrew calendar, and may add conforming accessor methods to Temporal.Date.prototype.

An instance of `MyCalendar` is *expected* to have stateless behavior; i.e., calling a method with the same arguments should return the same result each time.  There would be no mechanism for enforcing that user-land calendars are stateless; the calendar author should test this expectation on their own in order to prevent unexpected behavior such as the lack of round-tripping.

### Enumerable Properties

Main issue: https://github.com/tc39/proposal-temporal/issues/403

If properties of Temporal.Date, etc., are to be enumerable, the calendar should choose which properties to expose.  This operation can cake place in the factory methods of the Temporal.Calendar protocol, such as `.dateFromFields()`.

This is a work in progress, and this document will be updated once we reach consensus on #403.

## Default Calendar

Main issue: https://github.com/tc39/proposal-temporal/issues/292

An open question is what the behavior should be if the programmer does not specify a calendar, or if we should require the programmer to always specify a calendar.  Four choices are on the table:

1. Default to full ISO (Gregorian) calendar.
2. Require the user to explicitly specify the calendar.
3. Default to a partial ISO calendar (explained below).
4. Default to `Intl.defaultCalendar` (a new symbol), or ISO if that field doesn't exist.

### Partial ISO Calendar (Option 3)

A partial ISO calendar would be one implemented as follows:

```javascript
const PartialIsoCalendar = {
	toISO(self) {
		return self;
	},

	fromISO(isoDate) {
		return isoDate;
	},

	id: "iso",

	// ALL OTHER METHODS:
	plus() {
		throw new TypeError("Unsupported operation: full calendar required");
	}
	// Same for minus, etc.
}
```

It would in effect render default Temporal.Date (and Temporal.DateTime) with fewer operations until you specify a calendar.  The following methods/getters would throw:

- .dayOfWeek
- .weekOfYear
- .daysInMonth
- .daysInYear
- .isLeapYear
- .plus() -- *might* be OK if the programmer requests only time units
- .minus() -- *might* be OK if the programmer requests only time units
- .difference() -- *might* be OK if the programmer requests only time units
- .getYearMonth()
- .getMonthDay()

The following methods/getters would still work:

- .with()
- .withTime()
- .toString()
- .toLocaleString()
- .compare()

Although small, this set of operations still covers many of the recipes in the proposed Temporal Cookbook.

To enable the extended set of operations, the user would just use `.withCalendar()`:

```javascript
// Force the Gregorian calendar:
Temporal.Date.from("2019-12-06").withCalendar("gregory").weekOfYear;

// Use a calendar from another source:
Temporal.Date.from("2019-12-06").withCalendar(Intl.defaultCalendar).weekOfYear;
Temporal.Date.from("2019-12-06").withCalendar(request.calendar).weekOfYear;
```

The calendar IDs are less clear.  If the partial ISO calendar used ID `"iso"`, then what would the full ISO calendar use?  ID "gregory" ([why not "gregorian"?](https://github.com/tc39/ecma402/issues/212)) is misleading because there are Gregorian calendars that do not all agree on the same rules for things like weeks of the year.  One solution could be to use a nullish ID like `null` or `""` for the partial ISO calendar and `"iso"` for the full ISO calendar.  Alternatively, "iso8601", the identifier defined by CLDR as "Gregorian calendar using the ISO 8601 calendar week rules", could be the identifier for the full ISO calendar.

### Default Calendar Options: Pros and Cons

| Description | Full ISO (option 1) | No Default (option 2) | Partial ISO (option 3) | User Preference (option 4) |
|-------------|---------------------|-----------------------|------------------------|----------------------------|
| API consistency & predictability | 😃 Consistent and predictable | 😃 Consistent and predictable | 😐 Predictable behavior, but call sites may or may not require an explicit calendar | ☹️ Consistent API, but unpredictable behavior based on user's or server's location |
| Impact on Temporal call sites | 😃 No changes | ☹️ All call sites require extra boilerplate | 🙂 Most* operations work; some require extra boilerplate | 😃 No changes |
| Impact on i18n correctness | ☹️ Programmer needs to know to "opt in" to use the user's calendar preference | 😃 All operations require an explicit choice | 😃 Calendar-sensitive operations require an explicit choice | 🙂 Correct on front end, but programmer needs to know to "opt in" on back end |
| Impact on interoperability | 😃 ISO is the industry standard format | 😃 Explicit choice | 😃 I/O operations operate in the ISO calendar space | ☹️ Temporal objects may not interop with the ISO calendar |

<!--\**See https://github.com/tc39/proposal-temporal/issues/240#issuecomment-557726669*-->

## Temporal.Date API changes

### New Temporal.Date instance methods

The following methods involving ISO conversion would be added:

```javascript
Temporal.Date.prototype.toISO = function(): Temporal.Date {
	const isoDate = this.calendar.toISO(this);
	// assert: isoDate.calendar === Temporal.Calendar.iso
	return isoDate;
}

// Temporal.Date.prototype.with does *not* modify the calendar. A new method
// is added for that:

Temporal.Date.prototype.withCalendar = function(newCalendar: Calendar) {
	const isoDate = this.toISO();  // note: call intrinsic version
	const otherDate = newCalendar.fromISO(isoDate);
	// assert: otherDate.calendar === newCalendar
	return otherDate;
}
```

### ISO strings with calendar hint

This is an open question being discussed in [#293](https://github.com/tc39/proposal-temporal/issues/293).  The issue is that we do not want `toString()` to be lossy by losing the `calendar` field.  One proposal is to append the `Temporal.Calendar.id` field in `[c=ID]` following the date.  For example, `2019-12-06[c=hebrew]` refers to 2019-12-06 projected into the Hebrew calendar.

```javascript
Temporal.Date.prototype.toString = function() {
	let calendarKeyword, isoDate;
	// For Default Calendar Option 3, check for the partial ISO calendar here
	if (/* this.calendar is the ISO calendar */) {
		calendarKeyword = null;
		isoDate = this;
	} else {
		calendarKeyword = this.calendar.id;
		isoDate = this.toISO();  // call intrinsic
	}
	// return an ISO string for isoDate with calendar in brackets:
	// "2019-12-06[c=hebrew]"
}
```

In this scenario, `Temporal.Date.from` would take a new optional `options` argument, with a single field `idToCalendar` specifying a function to map from identifiers to Calendar objects.  If not present, the `Intl.Calendar` namespace will be searched.  Example call site with custom calendars:

```javascript
const fooCalendar = new FooCalendar();

Temporal.Date.from("2019-12-03[c=foo]", {
	idToCalendar: function(id) {
		if (id === "foo") {
			return fooCalendar;
		}
		return null;
	}
});
```

### New behavior of Temporal.Date.from

The exact behavior of this method depends on a few open discussions, but some logic will be passed to the Calendar object in order to project the date into the correct calendar system.

```javascript
Temporal.Date.from = function(thing: string | object, options: object) {
	if (typeof thing === "string") {
		let object = // components of string
		return Temporal.Calendar.iso.dateFromFields(object);
	} else {
		// Get the calendar object, either the default calendar or something based
		// on thing.calendar (string lookup or object)
		let calendar = // ...
		return calendar.dateFromFields(thing);
	}
}
```

Anoter example based on the toISO/fromISO methods (different semantics):

```javascript
Temporal.Date.from = function(thing: string | object, options: object) {
	if (typeof thing === "string") {
		object = // components of string
	}

	const isoDate = // a date in the ISO calendar with fields from object

	if (typeof object.calendar === "string") {
		// Note: Do we want this implicit escape hatch? If a lookup function is provided,
		// maybe it should be treated as 100% authoritative.
		const calendar = options?.idToCalendar?.(object.calendar)
			?? Temporal.Calendar.idToCalendar(id);  // call intrinsic
		if (!calendar) {
			throw new RangeError("Unknown calendar");
		}
		if (calendar[Temporal.Calendar.id] !== object.calendar) {
			throw new RangeError("Calendar IDs do not match")
		}
		return isoDate.withCalendar(calendar);  // call intrinsic
	} else if (object.calendar) {
		return isoDate.withCalendar(object.calendar);  // call intrinsic
	} else {
		return isoDate;
	}
}
```

### Semantics of existing Temporal.Date instance methods

As discussed earlier, Temporal.Date will defer to Temporal.Calendar methods wherever necessary.  Example implementation of selected Temporal.Date methods:

```javascript
Temporal.Date.prototype.plus = function(duration) {
	return this.calendar.plus(this, duration);
}

Temporal.Date.prototype.difference = function(other, options) {
	if (other.calendar !== this.calendar) {
		// Note: call intrinsic versions of these methods
		other = other.toISO().withCalendar(this.calendar);
	}
	return this.calendar.difference(this, other, options);
}

```

## Other Temporal.Date constructors

### Temporal.Absolute.prototype.inTimeZone

The third way to get a Temporal.Date (besides from a string and an object) is to convert it from a Temporal.Absolute.

The API here would depend on the decision for whether to require an explicit default calendar.  If we decide to use a default calendar (options 1, 3, and 4), no API change would be required for this method.  If we decide to require an explicit calendar, then the API would likely be changed as follows:

```javascript
// Default calendar option 2 only
Temporal.Absolute.prototype.inTimeZone = function(timeZone, calendar) {
	const isoDate = // compute the ISO date from the time zone
	return calendar.fromISO(isoDate);
}
```

### Temporal.now

The fourth way to get a Temporal.Date is to get the current time according to the environment (or mocked for SES).

As above, this API depends on whether we decide to use a default calendar.  If we require an explicit calendar, it would be similar to above:

```javascript
Temporal.now.date = function(calendar) {
	const absolute = Temporal.now.absolute();  // use intrinsic
	const timeZone = Temporal.now.timeZone();  // use intrinsic
	return absolute.inTimeZone(timeZone, calendar);  // use intrinsic
}
```

## Changes to other Temporal APIs

All of the following APIs would gain an internal slot for the calendar.

- Temporal.DateTime
- Temporal.Time
- Temporal.YearMonth
- Temporal.MonthDay
