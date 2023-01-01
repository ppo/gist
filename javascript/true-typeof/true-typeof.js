// Return the true type of a value.
// Types:
//     undefined, null
//     boolean, string
//     integer, float
//     array, dictionary
//     function, class, object
//     <classname> (in lowercase)

const trueTypeOf = (value) => {
  const type = typeof value;

  if (type === 'number') {
    if (Number.isInteger(value)) return 'integer';
    return 'float';
  }
  if (type === 'function') {
    if (/^\s*class\s+/.test(value.toString())) return 'class';
    return 'function';
  }
  if (type !== 'object') return type;
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value.constructor.name === 'Object') return 'dictionary';
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};


module.exports = trueTypeOf;
