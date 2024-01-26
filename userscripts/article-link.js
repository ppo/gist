// ==UserScript==
// @name         Article Link
// @description  Create a Markdown string with information about the article, and copy it to the clipboard.
// @icon         data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔗</text></svg>
// @version      24012602
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://*/*
// @run-at       context-menu
// ==/UserScript==


// DOCUMENTATION ===================================================================================

// USAGE: Go to the article page. Execute this userscript.
//
// FORMAT:
//   - [Title of the article](https://example.com/slug) (YYMMDD)
//   - [Title of the article](https://example.com/slug)
//
// USERSCRIPTS MANAGER:
//   [Tampermonkey](https://www.tampermonkey.net/)
//   Update URL: https://raw.githubusercontent.com/ppo/gist/HEAD/userscripts/article-link.js


// CONSTANTS =======================================================================================

const NAMESPACES = ['main', 'article', 'section', ''];
const HEADING_TAGS = ['h1', 'h2'];
const TIME_TAGS = ['time'];


// SHARED HELPERS ==================================================================================

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


// LOCAL HELPERS ===================================================================================

function getHeading() {
  let e = findFirstElement(HEADING_TAGS, NAMESPACES);
  if (e) return e.innerText.trim();
}

function getTime() {
  let e = findFirstElement(TIME_TAGS, NAMESPACES);
  if (e) return dateFormat(e.dateTime);
}


// MAIN ============================================================================================

(function() {
  'use strict';

  let title = window.getSelection().toString().trim() || getHeading();
  if (!title) {
    alert('Article title not found. Select it.');
  } else {
    let url = window.location.href;
    let date = getTime();
    let result = `[${title}](${url})` + (date ? ` (${date})` : '');
    copyToClipboard(result);
  }

})();
