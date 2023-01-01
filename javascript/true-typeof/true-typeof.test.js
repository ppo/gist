// Poor man's tests 😁
// Usage: node true-typeof.test.js [1]

const trueTypeOf = require('./true-typeof.js');


function test(report=false) {
  // Material for tests.
  class MyClass {
    static staticMethod() {}
  }
  function myFunction() {}
  const foo = 'foo';

  // Define tests to perform.
  const tests = [  // value, expected, value for display
    // Base types OK via `typeof`
    [ undefined,              'undefined',    'undefined'    ],
    [ true,                   'boolean',      'true'         ],
    [ false,                  'boolean',      'false'        ],
    [ '',                     'string',       "''"           ],
    [ 'abc',                  'string',       "'abc'"        ],
    [ `${foo}-bar`,           'string',       '`${foo}-bar`' ],

    // Numbers
    [ 1,                      'integer',      '1'   ],
    [ 1.0,                    'integer',      '1.0' ],
    [ 1.1,                    'float',        '1.1' ],

    // Functions & classes
    [ function() {},          'function',     'function() {}'        ],
    [ myFunction,             'function',     'myFunction'           ],
    [ class A {},             'class',        'class A {}'           ],
    [ MyClass,                'class',        'MyClass'              ],
    [ new MyClass(),          'object',       'new MyClass()'        ],
    [ MyClass.staticMethod,   'function',     'MyClass.staticMethod' ],

    // Base types not OK via `typeof`
    [ null,                   'null',         'null' ],
    [ [],                     'array',        '[]'   ],
    [ {},                     'dictionary',   '{}'   ],

    // Objects of any class
    [ new Set(),              'set',          'new Set()'  ],
    [ new Date(),             'date',         'new Date()' ],
    [ /test/i,                'regexp',       '/test/i' ],
    [ new RegExp('test'),     'regexp',       "new RegExp('test')" ],
    [ new Error(),            'error',        'new Error()'        ],
    [ new TypeError(),        'error',        'new TypeError()'    ],
  ];

  // Perform tests.
  const results = tests.reduce((accumulator, [ value, expected, display ]) => {
    const type = trueTypeOf(value);
    const ok = type === expected;

    accumulator.push([ ok, display, expected, type ]);
    return accumulator;
  }, []);

  // Display results.
  if (report) {
    console.table(
      results.map(([ ok, value, expected, type ]) => {
        const result = ok ? '🟢' : `❌ ${type}`;
        return { result, expected, value };
      }),
      ['result', 'expected', 'value']
    );
  } else {
    results.forEach(([ ok, value, expected, type ], index) => {
      console.assert(ok, `${index}: ${type} !== ${expected}, using: ${value}`);
    });
  }
}


// Execute the test.
const args = process.argv.slice(2);
test(!!args[0]);
