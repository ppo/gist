// Adding these to `Object.prototype` is a bit useless as…
//   Object.prototype is the only object in the core JavaScript language that has immutable
//   prototype — the prototype of Object.prototype is always null and not changeable.
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object#description
//
// Object.defineProperty(Object.prototype, 'map', {
//   value: function(…) { … }
// });


function objectMap(obj, mapper) {
  return Object.entries(obj).map(([key, value]) => mapper(key, value));
}


function objectReduce(obj, initialAccumulator, reducer) {
  return Object.entries(obj).reduce(
    (accumulator, [key, value]) => reducer(accumulator, key, value),
    initialAccumulator
  );
}
