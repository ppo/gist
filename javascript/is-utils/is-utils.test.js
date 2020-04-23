// Poor man's tests 😁

const test = () => {
  const run = (label, values, expected) => {
    const length = values.length;
    console.group(`${label} (${length} tests)`);
    values.map((v, i) => { console.assert(isEmpty(v) === expected, `${i}: ${v}`); });
    console.groupEnd();
  };

  const empty = [
    null, undefined, NaN, '', {}, [],
    new Set(), new Set([]), new Map(), new Map([]),
  ];
  const notEmpty = [
    ' ', 'a', 0, 1, -1, false, true, {a: 1}, [0],
    new Set([0]), new Map([['a', 1]]), new WeakMap().set({}, 1),
    new Date(), /a/, new RegExp(), () => {},
  ];
  const shouldBeEmpty = [ {undefined: undefined}, new Map([[]]) ];

  run('EMPTY', empty, true);
  run('NOT EMPTY', notEmpty, false);
  run('SHOULD BE EMPTY', shouldBeEmpty, true);
};