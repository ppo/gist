// Return whether a value is truly empty.
const isEmpty = (value) => (
  (!value && value !== 0 && value !== false)
  || (Array.isArray(value) && value.length === 0)
  || (isObject(value) && Object.keys(value).length === 0)
  || (typeof value.size === 'number' && value.size === 0)

  // `WeekMap.length` is supposed to exist!?
  || (typeof value.length === 'number' && typeof value !== 'function' && value.length === 0)
);


// Return where a value is truly an object.
// Source: https://levelup.gitconnected.com/javascript-check-if-a-variable-is-an-object-and-nothing-else-not-an-array-a-set-etc-a3987ea08fd7
const isObject = (value) => Object.prototype.toString.call(value) === '[object Object]';


module.exports = { isEmpty, isObject };
