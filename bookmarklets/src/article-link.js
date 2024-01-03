// Create a Markdown string with information about the article, and copy it to the clipboard.
//
// USAGE: Go to the article page. Execute this bookmarklet.
//
// Format:
//   - [Title of the article](https://example.com/slug) (YYMMDD)
//   - [Title of the article](https://example.com/slug)


function f(S) {
  let D = new Date(S);
  return [D.getUTCFullYear(), D.getUTCMonth()+1, D.getUTCDate()].reduce((A, C) => A + `0${C}`.slice(-2), '');
}
function g(W) {
  TS = W == 'h' ? ['h1', 'h2'] : ['time'];
  for (T of TS) {
    for (P of ['main', 'article', 'section', '']) {
      E = document.querySelector(`${P} ${T}`);
      if (E) return W == 'h' ? E.innerText.trim() : f(E.dateTime);
    }
  }
}

t = window.getSelection().toString().trim() || g('h');
if (!t) alert('Article title not found. Select it.');
else {
  u = window.location.href;
  d = g('t');

  e = document.createElement('textarea');
  e.value = `[${t}](${u})` + (d ? ` (${d})` : '');
  document.body.appendChild(e);
  e.select();
  document.execCommand('copy');
}
