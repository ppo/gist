// Shared helpers for userscripts.


function copyToClipboard(value) {
  // Copies the given value to the clipboard.
  // _utils.js / version: 24012601
  let e = document.createElement('textarea');
  e.value = value;
  document.body.appendChild(e);
  e.select();
  document.execCommand('copy');
}


function dateFormat(value) {
  // Formats a date (Date or string) as YYMMDD.
  // _utils.js / version: 24012601
  let d = new Date(value);
  return [d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate()].reduce(
    (accumulator, chunk) => accumulator + `0${chunk}`.slice(-2),
    ''
  );
}


function findFirstElement(selectors, namespaces) {
  // Finds the first element matching a series of selectors, located under a series of namespaces.
  // _utils.js / version: 24012601
  for (let selector of selectors) {
    for (let namespace of namespaces) {
      let e = document.querySelector(`${namespace} ${selector}`);
      if (e) return e;
    }
  }
}


function sleep(ms, callback) {
  // Waits for the given time then executes the callback
  // Or returns immediately a Promise if no callback provided.
  // _utils.js / version: 24012601
  let p = new Promise(resolve => setTimeout(resolve, ms));
  return callback ? p.then(callback) : p;
}
