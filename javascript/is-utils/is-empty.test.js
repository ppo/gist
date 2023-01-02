// Poor man's tests 😁
// Usage: node is-empty.test.js [1]

const { isEmpty } = require('./is-utils.js');


function _runTests(values, expected) {
  return values.reduce((accumulator, [ value, display ]) => {
    const ok = isEmpty(value) === expected;
    accumulator.push([ ok, display ]);
    return accumulator;
  }, []);
}


function _displayResults(heading, results, report) {
  if (report) {
    console.group(heading);
    console.table(
      results.map(([ ok, value ]) => {
        const result = ok ? '🟢' : `❌`;
        return { result, value };
      }),
      ['result', 'value']
    );
    console.groupEnd();
  } else {
    const failed = results.filter(([ ok ]) => !ok);
    if (failed.length) {
      console.group(heading);
      results.forEach(([ ok, value ], index) => {
        console.assert(ok, `${index}: ${value}`);
      });
      console.groupEnd();
    }
  }
}


function test(report=false) {
  // Define tests to perform.
  const empty = [
    [ null,         'null'        ],
    [ undefined,    'undefined'   ],
    [ NaN,          'NaN'         ],
    [ '',           "''"          ],
    [ {},           '{}'          ],
    [ [],           '[]'          ],
    [ new Set(),    'new Set()'   ],
    [ new Set([]),  'new Set([])' ],
    [ new Map(),    'new Map()'   ],
    [ new Map([]),  'new Map([])' ],
  ];
  const notEmpty = [
    [ ' ',                       "''"                       ],
    [ 'a',                       "'a'"                      ],
    [ 0,                         '0'                        ],
    [ 1,                         '1'                        ],
    [ -1,                        '-1'                       ],
    [ false,                     'false'                    ],
    [ true,                      'true'                     ],
    [ {a: 1},                    '{a: 1}'                   ],
    [ [0],                       '[0]'                      ],
    [ new Set([0]),              'new Set([0])'             ],
    [ new Map([['a', 1]]),       "new Map([['a', 1]])"      ],
    [ new WeakMap().set({}, 1),  'new WeakMap().set({}, 1)' ],
    [ new Date(),                'new Date()'               ],
    [ /a/,                       '/a/'                      ],
    [ new RegExp(),              'new RegExp()'             ],
    [ () => {},                  '() => {}'                 ],
  ];
  const shouldBeEmpty = [
    [ {undefined: undefined},  '{undefined: undefined}' ],
    [ new Map([[]]),           'new Map([[]])'          ],
  ];

  // Perform tests.
  const emptyResults = _runTests(empty, true);
  const notEmptyResults = _runTests(notEmpty, false);
  const shouldBeEmptyResults = _runTests(shouldBeEmpty, true);

  // Display results.
  _displayResults('Empty', emptyResults, report);
  _displayResults('Not Empty', notEmptyResults, report);
  _displayResults('Should Be Empty', shouldBeEmptyResults, report);
}


// Execute the test.
const args = process.argv.slice(2);
test(!!args[0]);
