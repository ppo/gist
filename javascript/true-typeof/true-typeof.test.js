// Poor man's tests 😁

const test = (report=false) => {
  const foo = 'foo';
  const tests = [
  //  id,  expected,     value
    [ 01,  'undefined',  undefined     ],
    [ 02,  'null',       null          ],
    [ 03,  'boolean',    true          ],
    [ 04,  'boolean',    false         ],
    [ 05,  'string',     ''            ],
    [ 06,  'string',     'abc'         ],
    [ 07,  'string',     `${foo}-bar`  ],
    [ 10,  'integer',    1             ],
    [ 11,  'integer',    1.0           ],  // EXCEPTION below!
    [ 12,  'float',      1.1           ],
    [ 13,  'array',      []            ],
    [ 14,  'object',     {}            ],
    [ 15,  'date',       new Date()    ],
    [ 16,  'regexp',     /test/i       ],
    [ 17,  'function',   function() {} ],
    [ 18,  'class',      class A {}    ],
  ];

  const results = tests.reduce((accumulator, [ id, expected, value ]) => {
    const type = trueTypeOf(value);
    const ok = type === expected;

    if (report) accumulator.push([ id, expected, value, ok, type ]);
    else console.assert(ok, `${id}: ${expected} !== ${type}`);

    return accumulator;
  }, []);

  if (report) {
    console.group('Test Results:');
    results.forEach(([ id, expected, value, ok, type ]) => {
      if (expected === 'string') value = `'${value}'`;
      if (id === 11 && expected === 'integer') value = value.toFixed(1);  // EXCEPTION

      if (ok) console.log(`🟢 ${id}: ${expected} →`, value);
      else console.log(`❌ ${id}: ${expected} !== ${type} →`, value);
    });
    console.groupEnd();
  }
};
