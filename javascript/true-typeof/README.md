# JavaScript `trueTypeOf` Helper

**Return the true type of a value.**

**Types:**

- `undefined`, `null`
- `boolean`, `string`
- `integer`, `float`
- `array`, `dictionary`
- `function`, `class`, `object`
- `<classname>` (in lowercase)


```javascript
  // Base types OK via `typeof`
  undefined             → 'undefined'
  true                  → 'boolean'
  false                 → 'boolean'
  ''                    → 'string'
  'abc'                 → 'string'
  `${foo}-bar`          → 'string'

  // Numbers
  1                     → 'integer'
  1.0                   → 'integer'
  1.1                   → 'float'

  // Functions & classes
  function() {}         → 'function'
  myFunction            → 'function'
  class A {}            → 'class'
  MyClass               → 'class'
  new MyClass()         → 'object'
  MyClass.staticMethod  → 'function'

  // Base types not OK via `typeof`
  null                  → 'null'
  []                    → 'array'
  {}                    → 'dictionary'

  // Any class implementing `Object.prototype.toString()`
  new Set()             → 'set'
  new Date()            → 'date'
  /test/i               → 'regexp'
  new RegExp('test')    → 'regexp'
  new Error()           → 'error'
  new TypeError()       → 'error'
```
