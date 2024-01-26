// ==UserScript==
// @name         Article Link
// @description  Create a Markdown string with information about the article, and copy it to the clipboard.
// @icon         data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔗</text></svg>
// @version      24012601
// @namespace    ppo
// @author       ppo
// @match        *://*/*
// @run-at       context-menu
// ==/UserScript==

// USAGE: Go to the article page. Execute this userscript.
//
// FORMAT:
//   - [Title of the article](https://example.com/slug) (YYMMDD)
//   - [Title of the article](https://example.com/slug)
//
// USERSCRIPTS MANAGER:
//   [Tampermonkey](https://www.tampermonkey.net/)
//   Update URL: https://raw.githubusercontent.com/ppo/gist/HEAD/userscripts/article-link.js

function dateFormat(value) {
  let d = new Date(value);
  return [d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate()].reduce(
    (accumulator, chunk) => accumulator + `0${chunk}`.slice(-2),
    ''
  );
}

function findElement(tags) {
  for (let tag of tags) {
    for (let namespace of ['main', 'article', 'section', '']) {
      let e = document.querySelector(`${namespace} ${tag}`);
      if (e) return e;
    }
  }
}

function getHeading() {
  let e = findElement(['h1', 'h2']);
  if (e) return e.innerText.trim();
}

function getTime() {
  let e = findElement(['time']);
  if (e) return dateFormat(e.dateTime);
}

function copyToClipboard(value) {
  let e = document.createElement('textarea');
  e.value = value;
  document.body.appendChild(e);
  e.select();
  document.execCommand('copy');
}

(function() {
  'use strict';

  let title = window.getSelection().toString().trim() || getHeading();
  if (!title) alert('Article title not found. Select it.');
  else {
    let url = window.location.href;
    let date = getTime();
    let result = `[${title}](${url})` + (date ? ` (${date})` : '');
    copyToClipboard(result);
  }

})();
