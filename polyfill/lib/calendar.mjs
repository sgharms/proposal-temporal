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

export class Japanese extends Iso8601 {
  constructor() {
    super('japanese');
  }
  // taken from https://github.com/unicode-org/cldr/blob/master/common/supplemental/supplementalData.xml#L4310-L4546
  static #eraStartDates = [
    '645-6-19',
    '650-2-15',
    '672-1-1',
    '686-7-20',
    '701-3-21',
    '704-5-10',
    '708-1-11',
    '715-9-2',
    '717-11-17',
    '724-2-4',
    '729-8-5',
    '749-4-14',
    '749-7-2',
    '757-8-18',
    '765-1-7',
    '767-8-16',
    '770-10-1',
    '781-1-1',
    '782-8-19',
    '806-5-18',
    '810-9-19',
    '824-1-5',
    '834-1-3',
    '848-6-13',
    '851-4-28',
    '854-11-30',
    '857-2-21',
    '859-4-15',
    '877-4-16',
    '885-2-21',
    '889-4-27',
    '898-4-26',
    '901-7-15',
    '923-4-11',
    '931-4-26',
    '938-5-22',
    '947-4-22',
    '957-10-27',
    '961-2-16',
    '964-7-10',
    '968-8-13',
    '970-3-25',
    '973-12-20',
    '976-7-13',
    '978-11-29',
    '983-4-15',
    '985-4-27',
    '987-4-5',
    '989-8-8',
    '990-11-7',
    '995-2-22',
    '999-1-13',
    '1004-7-20',
    '1012-12-25',
    '1017-4-23',
    '1021-2-2',
    '1024-7-13',
    '1028-7-25',
    '1037-4-21',
    '1040-11-10',
    '1044-11-24',
    '1046-4-14',
    '1053-1-11',
    '1058-8-29',
    '1065-8-2',
    '1069-4-13',
    '1074-8-23',
    '1077-11-17',
    '1081-2-10',
    '1084-2-7',
    '1087-4-7',
    '1094-12-15',
    '1096-12-17',
    '1097-11-21',
    '1099-8-28',
    '1104-2-10',
    '1106-4-9',
    '1108-8-3',
    '1110-7-13',
    '1113-7-13',
    '1118-4-3',
    '1120-4-10',
    '1124-4-3',
    '1126-1-22',
    '1131-1-29',
    '1132-8-11',
    '1135-4-27',
    '1141-7-10',
    '1142-4-28',
    '1144-2-23',
    '1145-7-22',
    '1151-1-26',
    '1154-10-28',
    '1156-4-27',
    '1159-4-20',
    '1160-1-10',
    '1161-9-4',
    '1163-3-29',
    '1165-6-5',
    '1166-8-27',
    '1169-4-8',
    '1171-4-21',
    '1175-7-28',
    '1177-8-4',
    '1181-7-14',
    '1182-5-27',
    '1184-4-16',
    '1185-8-14',
    '1190-4-11',
    '1199-4-27',
    '1201-2-13',
    '1204-2-20',
    '1206-4-27',
    '1207-10-25',
    '1211-3-9',
    '1213-12-6',
    '1219-4-12',
    '1222-4-13',
    '1224-11-20',
    '1225-4-20',
    '1227-12-10',
    '1229-3-5',
    '1232-4-2',
    '1233-4-15',
    '1234-11-5',
    '1235-9-19',
    '1238-11-23',
    '1239-2-7',
    '1240-7-16',
    '1243-2-26',
    '1247-2-28',
    '1249-3-18',
    '1256-10-5',
    '1257-3-14',
    '1259-3-26',
    '1260-4-13',
    '1261-2-20',
    '1264-2-28',
    '1275-4-25',
    '1278-2-29',
    '1288-4-28',
    '1293-8-5',
    '1299-4-25',
    '1302-11-21',
    '1303-8-5',
    '1306-12-14',
    '1308-10-9',
    '1311-4-28',
    '1312-3-20',
    '1317-2-3',
    '1319-4-28',
    '1321-2-23',
    '1324-12-9',
    '1326-4-26',
    '1329-8-29',
    '1331-8-9',
    '1334-1-29',
    '1336-2-29',
    '1340-4-28',
    '1346-12-8',
    '1370-7-24',
    '1372-4-1',
    '1375-5-27',
    '1379-3-22',
    '1381-2-10',
    '1384-4-28',
    '1387-8-22',
    '1387-8-23',
    '1389-2-9',
    '1390-3-26',
    '1394-7-5',
    '1428-4-27',
    '1429-9-5',
    '1441-2-17',
    '1444-2-5',
    '1449-7-28',
    '1452-7-25',
    '1455-7-25',
    '1457-9-28',
    '1460-12-21',
    '1466-2-28',
    '1467-3-3',
    '1469-4-28',
    '1487-7-29',
    '1489-8-21',
    '1492-7-19',
    '1501-2-29',
    '1504-2-30',
    '1521-8-23',
    '1528-8-20',
    '1532-7-29',
    '1555-10-23',
    '1558-2-28',
    '1570-4-23',
    '1573-7-28',
    '1592-12-8',
    '1596-10-27',
    '1615-7-13',
    '1624-2-30',
    '1644-12-16',
    '1648-2-15',
    '1652-9-18',
    '1655-4-13',
    '1658-7-23',
    '1661-4-25',
    '1673-9-21',
    '1681-9-29',
    '1684-2-21',
    '1688-9-30',
    '1704-3-13',
    '1711-4-25',
    '1716-6-22',
    '1736-4-28',
    '1741-2-27',
    '1744-2-21',
    '1748-7-12',
    '1751-10-27',
    '1764-6-2',
    '1772-11-16',
    '1781-4-2',
    '1789-1-25',
    '1801-2-5',
    '1804-2-11',
    '1818-4-22',
    '1830-12-10',
    '1844-12-2',
    '1848-2-28',
    '1854-11-27',
    '1860-3-18',
    '1861-2-19',
    '1864-2-20',
    '1865-4-7',
    '1868-9-8',
    '1912-7-30',
    '1926-12-25',
    '1989-1-8',
    '2019-5-1'
  ];

  // C locale era names, taken from
  // https://github.com/unicode-org/icu/blob/master/icu4c/source/data/locales/root.txt#L1582-L1818
  // lowercased, asciified, and clarifying dates removed.
  // This is what API consumers pass in as the value of the 'era' field.
  // Otherwise, we'd have to introduce some era numbering system, which (as far
  // as I can tell from Wikipedia) the calendar doesn't have, so would be
  // non-standard and confusing, requiring API consumers to figure out "now what
  // number is the Reiwa (current) era?" My understanding is also that this
  // starting point for eras (0645-06-19) is not the only possible one, since
  // there are unofficial eras before that.
  // https://en.wikipedia.org/wiki/Japanese_era_name
  static eraIds = [
    'taika',
    'hakuchi',
    'hakuho',
    'shucho',
    'taiho',
    'keiun',
    'wado',
    'reiki',
    'yoro',
    'jinki',
    'tenpyo',
    'tenpyo-kampo',
    'tenpyo-shoho',
    'tenpyo-hoji',
    'tenpyo-jingo',
    'jingo-keiun',
    'hoki',
    'ten-o',
    'enryaku',
    'daido',
    'konin',
    'tencho',
    'jowa',
    'kajo',
    'ninju',
    'saiko',
    'ten-an',
    'jogan',
    'gangyo',
    'ninna',
    'kanpyo',
    'shotai',
    'engi',
    'encho',
    'johei',
    'tengyo',
    'tenryaku',
    'tentoku',
    'owa',
    'koho',
    'anna',
    'tenroku',
    "ten'en",
    'jogen',
    'tengen',
    'eikan',
    'kanna',
    'eien',
    'eiso',
    'shoryaku',
    'chotoku',
    'choho',
    'kanko',
    'chowa',
    'kannin',
    'jian',
    'manju',
    'chogen',
    'choryaku',
    'chokyu',
    'kantoku',
    'eisho',
    'tengi',
    'kohei',
    'jiryaku',
    'enkyu',
    'shoho',
    'shoryaku',
    'eiho',
    'otoku',
    'kanji',
    'kaho',
    'eicho',
    'jotoku',
    'kowa',
    'choji',
    'kasho',
    'tennin',
    'ten-ei',
    'eikyu',
    "gen'ei",
    'hoan',
    'tenji',
    'daiji',
    'tensho',
    'chosho',
    'hoen',
    'eiji',
    'koji',
    "ten'yo",
    'kyuan',
    'ninpei',
    'kyuju',
    'hogen',
    'heiji',
    'eiryaku',
    'oho',
    'chokan',
    'eiman',
    "nin'an",
    'kao',
    'shoan',
    'angen',
    'jisho',
    'yowa',
    'juei',
    'genryaku',
    'bunji',
    'kenkyu',
    'shoji',
    'kennin',
    'genkyu',
    "ken'ei",
    'jogen',
    'kenryaku',
    'kenpo',
    'jokyu',
    'joo',
    'gennin',
    'karoku',
    'antei',
    'kanki',
    'joei',
    'tenpuku',
    'bunryaku',
    'katei',
    'ryakunin',
    "en'o",
    'ninji',
    'kangen',
    'hoji',
    'kencho',
    'kogen',
    'shoka',
    'shogen',
    "bun'o",
    'kocho',
    "bun'ei",
    'kenji',
    'koan',
    'shoo',
    'einin',
    'shoan',
    'kengen',
    'kagen',
    'tokuji',
    'enkyo',
    'ocho',
    'showa',
    'bunpo',
    'geno',
    'genko',
    'shochu',
    'karyaku',
    'gentoku',
    'genko',
    'kenmu',
    'engen',
    'kokoku',
    'shohei',
    'kentoku',
    'bunchu',
    'tenju',
    'koryaku',
    'kowa',
    'genchu',
    'meitoku',
    'kakei',
    'koo',
    'meitoku',
    'oei',
    'shocho',
    'eikyo',
    'kakitsu',
    "bun'an",
    'hotoku',
    'kyotoku',
    'kosho',
    'choroku',
    'kansho',
    'bunsho',
    'onin',
    'bunmei',
    'chokyo',
    'entoku',
    'meio',
    'bunki',
    'eisho',
    'taiei',
    'kyoroku',
    'tenbun',
    'koji',
    'eiroku',
    'genki',
    'tensho',
    'bunroku',
    'keicho',
    'genna',
    "kan'ei",
    'shoho',
    'keian',
    'joo',
    'meireki',
    'manji',
    'kanbun',
    'enpo',
    'tenna',
    'jokyo',
    'genroku',
    'hoei',
    'shotoku',
    'kyoho',
    'genbun',
    'kanpo',
    'enkyo',
    "kan'en",
    'horeki',
    'meiwa',
    "an'ei",
    'tenmei',
    'kansei',
    'kyowa',
    'bunka',
    'bunsei',
    'tenpo',
    'koka',
    'kaei',
    'ansei',
    "man'en",
    'bunkyu',
    'genji',
    'keio',
    'meiji',
    'taisho',
    'showa',
    'heisei',
    'reiwa'
  ];

  static #findEra = function(date) {
    const index = this.#eraStartDates.findIndex((dateStr) => {
      const startDate = ES.ToTemporalDate(dateStr);
      return ES.CompareDate(date, startDate) < 0;
    });
    if (index === 0) return 0;
    return index - 1;
  };

  era(date) {
    return Japanese.#findEra(date);
  }
  year(date) {
    const era = Japanese.#findEra(date);
    const startDate = Japanese.#eraStartDates[era];
    return GetSlot(date, ISO_YEAR) - GetSlot(startDate, ISO_YEAR);
  }
}

MakeIntrinsicClass(Calendar, 'Temporal.Calendar');
