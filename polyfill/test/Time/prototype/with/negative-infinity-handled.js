// Copyright (C) 2020 Igalia, S.L. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
description: Temporal.Time.prototype.with handles a property bag if any value is -Infinity
esid: sec-temporal.time.prototype.with
---*/

const instance = new Temporal.Time(12, 34, 56, 987, 654, 321);

// constrain

let result = instance.with({ hour: -Infinity }, { disambiguation: 'constrain' });
assert.sameValue(result.hour, 0);
assert.sameValue(result.minute, 34);
assert.sameValue(result.second, 56);
assert.sameValue(result.millisecond, 987);
assert.sameValue(result.microsecond, 654);
assert.sameValue(result.nanosecond, 321);
result = instance.with({ minute: -Infinity }, { disambiguation: 'constrain' });
assert.sameValue(result.hour, 12);
assert.sameValue(result.minute, 0);
assert.sameValue(result.second, 56);
assert.sameValue(result.millisecond, 987);
assert.sameValue(result.microsecond, 654);
assert.sameValue(result.nanosecond, 321);
result = instance.with({ second: -Infinity }, { disambiguation: 'constrain' });
assert.sameValue(result.hour, 12);
assert.sameValue(result.minute, 34);
assert.sameValue(result.second, 0);
assert.sameValue(result.millisecond, 987);
assert.sameValue(result.microsecond, 654);
assert.sameValue(result.nanosecond, 321);
result = instance.with({ millisecond: -Infinity }, { disambiguation: 'constrain' });
assert.sameValue(result.hour, 12);
assert.sameValue(result.minute, 34);
assert.sameValue(result.second, 56);
assert.sameValue(result.millisecond, 0);
assert.sameValue(result.microsecond, 654);
assert.sameValue(result.nanosecond, 321);
result = instance.with({ microsecond: -Infinity }, { disambiguation: 'constrain' });
assert.sameValue(result.hour, 12);
assert.sameValue(result.minute, 34);
assert.sameValue(result.second, 56);
assert.sameValue(result.millisecond, 987);
assert.sameValue(result.microsecond, 0);
assert.sameValue(result.nanosecond, 321);
result = instance.with({ nanosecond: -Infinity }, { disambiguation: 'constrain' });
assert.sameValue(result.hour, 12);
assert.sameValue(result.minute, 34);
assert.sameValue(result.second, 56);
assert.sameValue(result.millisecond, 987);
assert.sameValue(result.microsecond, 654);
assert.sameValue(result.nanosecond, 0);

// balance

assert.throws(RangeError, () => instance.with({ hour: -Infinity }, { disambiguation: 'balance' }));
assert.throws(RangeError, () => instance.with({ minute: -Infinity }, { disambiguation: 'balance' }));
assert.throws(RangeError, () => instance.with({ second: -Infinity }, { disambiguation: 'balance' }));
assert.throws(RangeError, () => instance.with({ millisecond: -Infinity }, { disambiguation: 'balance' }));
assert.throws(RangeError, () => instance.with({ microsecond: -Infinity }, { disambiguation: 'balance' }));
assert.throws(RangeError, () => instance.with({ nanosecond: -Infinity }, { disambiguation: 'balance' }));

// reject

assert.throws(RangeError, () => instance.with({ hour: -Infinity }, { disambiguation: 'reject' }));
assert.throws(RangeError, () => instance.with({ minute: -Infinity }, { disambiguation: 'reject' }));
assert.throws(RangeError, () => instance.with({ second: -Infinity }, { disambiguation: 'reject' }));
assert.throws(RangeError, () => instance.with({ millisecond: -Infinity }, { disambiguation: 'reject' }));
assert.throws(RangeError, () => instance.with({ microsecond: -Infinity }, { disambiguation: 'reject' }));
assert.throws(RangeError, () => instance.with({ nanosecond: -Infinity }, { disambiguation: 'reject' }));

let calls = 0;
const obj = {
  valueOf() {
    calls++;
    return -Infinity;
  }
};

result = instance.with({ hour: obj }, { disambiguation: 'constrain' });
assert.sameValue(calls, 1, "it fetches the primitive value");
result = instance.with({ minute: obj }, { disambiguation: 'constrain' });
assert.sameValue(calls, 2, "it fetches the primitive value");
result = instance.with({ second: obj }, { disambiguation: 'constrain' });
assert.sameValue(calls, 3, "it fetches the primitive value");
result = instance.with({ millisecond: obj }, { disambiguation: 'constrain' });
assert.sameValue(calls, 4, "it fetches the primitive value");
result = instance.with({ microsecond: obj }, { disambiguation: 'constrain' });
assert.sameValue(calls, 5, "it fetches the primitive value");
result = instance.with({ nanosecond: obj }, { disambiguation: 'constrain' });
assert.sameValue(calls, 6, "it fetches the primitive value");

assert.throws(RangeError, () => instance.with({ hour: obj }, { disambiguation: 'balance' }));
assert.sameValue(calls, 7, "it fails after fetching the primitive value");
assert.throws(RangeError, () => instance.with({ minute: obj }, { disambiguation: 'balance' }));
assert.sameValue(calls, 8, "it fails after fetching the primitive value");
assert.throws(RangeError, () => instance.with({ second: obj }, { disambiguation: 'balance' }));
assert.sameValue(calls, 9, "it fails after fetching the primitive value");
assert.throws(RangeError, () => instance.with({ millisecond: obj }, { disambiguation: 'balance' }));
assert.sameValue(calls, 10, "it fails after fetching the primitive value");
assert.throws(RangeError, () => instance.with({ microsecond: obj }, { disambiguation: 'balance' }));
assert.sameValue(calls, 11, "it fails after fetching the primitive value");
assert.throws(RangeError, () => instance.with({ nanosecond: obj }, { disambiguation: 'balance' }));
assert.sameValue(calls, 12, "it fails after fetching the primitive value");

assert.throws(RangeError, () => instance.with({ hour: obj }, { disambiguation: 'reject' }));
assert.sameValue(calls, 13, "it fails after fetching the primitive value");
assert.throws(RangeError, () => instance.with({ minute: obj }, { disambiguation: 'reject' }));
assert.sameValue(calls, 14, "it fails after fetching the primitive value");
assert.throws(RangeError, () => instance.with({ second: obj }, { disambiguation: 'reject' }));
assert.sameValue(calls, 15, "it fails after fetching the primitive value");
assert.throws(RangeError, () => instance.with({ millisecond: obj }, { disambiguation: 'reject' }));
assert.sameValue(calls, 16, "it fails after fetching the primitive value");
assert.throws(RangeError, () => instance.with({ microsecond: obj }, { disambiguation: 'reject' }));
assert.sameValue(calls, 17, "it fails after fetching the primitive value");
assert.throws(RangeError, () => instance.with({ nanosecond: obj }, { disambiguation: 'reject' }));
assert.sameValue(calls, 18, "it fails after fetching the primitive value");
