// Copyright (C) 2020 Igalia, S.L. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-temporal.date.prototype.getfields
includes: [compareArray.js]
---*/

let called = 0;

const constructorArguments = [
  [2000, 5, 2]
];

class MyDate extends Temporal.Date {
  constructor(year, month, day) {
    assert.compareArray([year, month, day], constructorArguments.shift(), "constructor arguments");
    ++called;
    super(year, month, day);
  }
}

const instance = MyDate.from("2000-05-02");
assert.sameValue(called, 1);

const result = instance.getFields();
assert.sameValue(result.year, 2000, "year result");
assert.sameValue(result.month, 5, "month result");
assert.sameValue(result.day, 2, "day result");
assert.sameValue(called, 1);
assert.sameValue(Object.getPrototypeOf(result), Object.prototype);
