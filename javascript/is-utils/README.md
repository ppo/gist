# Javascript "is" Utils

- `isEmpty`
- `isObject`


#### `isEmpty` Tests

```javascript
// Empty             Not Empty
null, undefined      true, false
NaN                  0, 1, -1
''                   'a', ' '
{}                   {a: 1}
[]                   [0]
new Set()            new Set([0])
new Set([])
new Map()            new Map([['a', 1]])
new Map([])          new WeakMap().set({}, 1)
                     new Date()
                     /a/, new RegExp()
                     () => {}
```

**Should Be Empty** _(but currently not working)_  
```javascript
{undefined: undefined}
new Map([[]])
```
