// ==UserScript==
// @name         Article Link
// @description  Create a Markdown string with information about the article, and copy it to the clipboard.
// @icon         data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔗</text></svg>
// @version      250225-01
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

const NAMESPACES = ['main', 'article', 'section', 'body'];
const HEADING_SELECTORS = ['h1', 'h2'];
const TIME_SELECTORS = [
  'time',
  '[data-testid="storyPublishDate"]', // Medium
];
const HEAD_TIME_SELECTORS = ['meta[itemprop="dateModified"]', 'meta[itemprop="datePublished"]'];


// GLOBALS =========================================================================================

let specialSite = null;


// SHARED HELPERS ==================================================================================

function copyToClipboard(value) {
  // Copies the given value to the clipboard.
  // _utils.js / version: 24012601
  const e = document.createElement('textarea');
  e.value = value;
  document.body.appendChild(e);
  e.select();
  document.execCommand('copy');
}

function dateFormat(value) {
  // Formats a date (Date or string) as YYMMDD.
  // _utils.js / version: 24012602
  if (!value) return;
  const d = new Date(value);
  d.setHours(12); // Fix: UTC date shift.
  return d.toISOString().replace(/^(\d{2})(\d{2})-(\d{2})-(\d{2}).*/, '$2$3$4');
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

function checkSpecialSite() {
  if (/^.*wikipedia\.org$/.test(window.location.host)) {
    specialSite = 'WIKIPEDIA';
  }
}

function formatResult(url, title, date) {
  let result = `[${title}](${url})` + (date ? ` (${date})` : '');

  switch (specialSite) {
    case 'WIKIPEDIA': result = `⍵:[${title}](${url})`; break;
  }

  return result;
}

function getHeading() {
  let e;

  switch (specialSite) {
    case 'WIKIPEDIA': e = document.querySelector('#firstHeading > span'); break;
    default: e = findFirstElement(HEADING_SELECTORS, NAMESPACES);
  }

  if (e) return e.innerText.trim();
}

function getTime() {
  let e;

  e = findFirstElement(HEAD_TIME_SELECTORS, ['head']);
  if (e) return dateFormat(e.getAttribute('content'));

  e = findFirstElement(TIME_SELECTORS, NAMESPACES);
  if (e) return dateFormat(e.dateTime || e.innerText.trim());
}


// MAIN ============================================================================================

(function() {
  'use strict';

  checkSpecialSite();
  const title = window.getSelection().toString().trim() || getHeading();
  if (!title) {
    alert('Article title not found. Select it.');
  } else {
    const url = window.location.href;
    const date = getTime();
    const result = formatResult(url, title, date);
    copyToClipboard(result);
  }

})();
