// Shared helpers for userscripts.

function copyToClipboard(value, message=true, timeout=undefined) {
  // Copy the given value to the clipboard.
  // _utils.js / version: 250430-01
  const e = document.createElement('textarea');
  e.value = value;
  document.body.appendChild(e);
  e.select();

  document.execCommand('copy');
  document.body.removeChild(e);

  if (message) {
    if (message === true) {
      message = document.createElement('div');

      const heading = document.createElement('p');
      heading.style = 'font-weight: bold; margin-bottom: 1rem';
      heading.textContent = 'Value copied to clipboard:';
      message.appendChild(heading);

      const pre = document.createElement('pre');
      pre.textContent = value;
      message.appendChild(pre);

      message = message.innerHTML;
    }
    snackbar(message, timeout);
  }
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


function snackbar(message, timeout=2000) {
  // Display a temporary message.
  // Or fixed until clicked if `!timeout`.
  // _utils.js / version: 250430-01
  const elem = document.createElement('div');
  elem.innerHTML = message;
  Object.assign(elem.style, {
    all: 'initial',
    backgroundColor: '#ffca28',
    border: '3px solid #fff',
    boxShadow: 'rgba(0, 0, 0, 0.5) 3px 6px 12px',
    color: '#000',
    fontFamily: 'sans-serif',
    left: '50%',
    maxHeight: '75%',
    maxWidth: '75%',
    minWidth: '250px',
    overflow: 'auto',
    padding: '1rem 1.25rem',
    position: 'fixed',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '9999',
  });
  document.body.appendChild(elem);

  const destroy = () => { document.body.removeChild(elem); };
  elem.addEventListener('click', destroy);
  if (timeout) setTimeout(destroy, timeout);
}
