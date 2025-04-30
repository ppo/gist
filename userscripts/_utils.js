// Shared helpers for userscripts.

function copyToClipboard(value) {
  // Copy the given value to the clipboard.
  // _utils.js / version: 240126-01
  const e = document.createElement('textarea');
  e.value = value;
  document.body.appendChild(e);
  e.select();
  document.execCommand('copy');
}


function dateFormat(value) {
  // Format a date (Date or string) as YYMMDD.
  // _utils.js / version: 240126-02
  if (!value) return;
  const d = new Date(value);
  return d.toISOString().replace(/^(\d{2})(\d{2})-(\d{2})-(\d{2}).*/, '$2$3$4');
}


function findFirstElement(selectors, namespaces) {
  // Find the first element matching a series of selectors, located under a series of namespaces.
  // _utils.js / version: 240126-01
  for (let selector of selectors) {
    for (let namespace of namespaces) {
      let e = document.querySelector(`${namespace} ${selector}`);
      if (e) return e;
    }
  }
}


function sleep(ms, callback) {
  // Wait for the given time (`ms`) then executes the callback.
  // Or return immediately a Promise if no callback provided.
  // _utils.js / version: 240126-01
  const p = new Promise(resolve => setTimeout(resolve, ms));
  return callback ? p.then(callback) : p;
}
