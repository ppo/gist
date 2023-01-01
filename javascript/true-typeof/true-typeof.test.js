// Poor man's tests 😁

const test = (report=false) => {
  class MyClass {
    static staticMethod() {}
  }
  function myFunction() {}
  const foo = 'foo';

  const EXCEPTION = 8;  // See in tests...

  const tests = [  // id, expected, value
    // Base types OK via `typeof`
    [  01,  'undefined',   undefined             ],
    [  02,  'boolean',     true                  ],
    [  03,  'boolean',     false                 ],
    [  04,  'string',      ''                    ],
    [  05,  'string',      'abc'                 ],
    [  06,  'string',      `${foo}-bar`          ],

    // Numbers
    [  07,  'integer',     1                     ],
    [  08,  'integer',     1.0                   ],  // EXCEPTION below...
    [  09,  'float',       1.1                   ],

    // Functions & classes
    [  11,  'function',    function() {}         ],
    [  12,  'function',    myFunction            ],
    [  13,  'class',       class A {}            ],
    [  14,  'class',       MyClass               ],
    [  15,  'object',      new MyClass()         ],
    [  16,  'function',    MyClass.staticMethod  ],

    // Base types not OK via `typeof`
    [  17,  'null',        null                  ],
    [  18,  'array',       []                    ],
    [  19,  'dictionary',  {}                    ],

    // Any class implementing `Object.prototype.toString()`
    [  20,  'set',         new Set()             ],
    [  21,  'date',        new Date()            ],
    [  22,  'regexp',      /test/i               ],
    [  23,  'regexp',      new RegExp('test')    ],
    [  24,  'error',       new Error()           ],
    [  25,  'error',       new TypeError()       ],
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
      if (id === EXCEPTION) value = value.toFixed(1);  // EXCEPTION

      if (ok) console.log(`🟢 ${id}: ${expected} →`, value);
      else console.log(`❌ ${id}: ${expected} !== ${type} →`, value);
    });
    console.groupEnd();
  }
};
