# JavaScript `trueTypeOf` Helper

```javascript
    VALUE:          TYPE:
    ------------- - ---------
    undefined     → 'undefined'
    null          → 'null'
    true          → 'boolean'
    false         → 'boolean'
    ''            → 'string'
    'abc'         → 'string'
    `${foo}-bar`  → 'string'
    1             → 'integer'
    1.0           → 'integer'
    1.1           → 'float'
    []            → 'array'
    {}            → 'object'
    new Date()    → 'date'
    /test/i       → 'regexp'
    function() {} → 'function'
    class A {}    → 'class'
```
