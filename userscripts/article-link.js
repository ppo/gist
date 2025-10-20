// ==UserScript==
// @name         Article Link
// @description  Create a Markdown string with information about the article, and copy it to the clipboard.
// @icon         data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔗</text></svg>
// @version      251020-01
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

function snackbar(message, timeout=2000) {
  // Display a temporary message.
  // Or fixed until clicked if `!timeout`.
  // _utils.js / version: 250528-01

  try {
    // Fix for error "Requires 'TrustedHTML' assignment"
    // Source: https://github.com/Tampermonkey/tampermonkey/issues/1334#issuecomment-927277844
    window.trustedTypes.createPolicy('default', {createHTML: (string, sink) => string})

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
  } catch {}
}


// LOCAL HELPERS ===================================================================================

function checkSpecialSite() {
  if (window.location.host.includes('amazon.'))       specialSite = 'AMAZON';
  if (window.location.host.includes('github.com'))    specialSite = 'GITHUB';
  if (window.location.host.includes('ikea.com'))      specialSite = 'IKEA';
  if (window.location.host.includes('wikipedia.org')) specialSite = 'WIKIPEDIA';
}

function formatResult(url, title, date) {
  let result = `[${title}](${url})` + (date ? ` (${date})` : '');
  const today = new Date().toISOString().replaceAll('-', '').substr(2, 6);
  let price;

  switch (specialSite) {
    case 'AMAZON':
      price = document.querySelector('#tp-tool-tip-subtotal-price-value .a-offscreen').textContent.replace(',', '.').trim();
      const cleanUrl = getAmazonCleanUrl();
      result = `[Amazon] [${title}](${cleanUrl}) ${price} (${today})`;
      break;
    case 'GITHUB':
      const about = document.querySelector('.Layout-sidebar .about-margin h2 + p').innerText.trim();
      result = `GitHub: [${title}](${url}) • ${about}`;
      break;
    case 'IKEA':
      price = document.querySelector('#pip-buy-module-content .pip-price__sr-text').textContent.replace('Price ', '').replace(',', '.').trim();
      result = `[IKEA] [${title}](${url}) ${price} (${today})`;
      break;
    case 'WIKIPEDIA': result = `⍵:[${title}](${url})`; break;
  }

  return result;
}

// Copy from `copy-clean-url.js`
function getAmazonCleanUrl() {
  const RE_AMAZON_PRODUCT_ID = [ /\/dp\/([A-Z0-9]+)/, /\/gp\/product\/([A-Z0-9]+)/ ];
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  let match;
  RE_AMAZON_PRODUCT_ID.forEach(regex => {
    if (match) return;
    match = window.location.pathname.match(regex);
  });
  if (match) {
    url.pathname = `/dp/${match[1]}`;
  }
  return url.toString();
}

function getHeading() {
  let e;

  switch (specialSite) {
    case 'AMAZON': e = document.getElementById('productTitle'); break;
    case 'GITHUB':
      e = document.querySelector('article .markdown-heading h1.heading-element');
      if (!e) e = document.querySelector('#repo-title-component a');
      break;
    case 'IKEA': e = document.querySelector('#pip-buy-module-content h1'); break;
    case 'WIKIPEDIA': e = document.querySelector('#firstHeading > span'); break;
    default: e = findFirstElement(HEADING_SELECTORS, NAMESPACES);
  }

  // if (e) return e.innerText.trim();
  if (e) return e.textContent.trim();
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
    const url = window.location.href.replace(/\?$/, '');
    const date = getTime();
    const result = formatResult(url, title, date);
    copyToClipboard(result);
  }

})();
