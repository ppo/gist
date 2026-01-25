// ==UserScript==
// @name         Article Link
// @description  Create a Markdown string with information about the article, and copy it to the clipboard.
// @version      260125.01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://*/*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @require      https://raw.githubusercontent.com/ppo/gist/main/userscripts/_utils.js
// @downloadURL  https://raw.githubusercontent.com/ppo/gist/main/userscripts/article-link.js
// ==/UserScript==
// Userscript Manager: Violentmonkey


// USAGE:
//   If a text is selected, it's used as title.

// RESULT FORMAT:
//   - [Title of the article](https://example.com/slug) (YYMMDD)
//   - [Title of the article](https://example.com/slug)


// 🔴 Not working
// const SHORTCUT = 'a-l';
// const MENU_NAME = GM_info.script.name + (SHORTCUT ? ` (${VM.shortcut.reprShortcut(SHORTCUT)})` : '');
// GM_registerMenuCommand(MENU_NAME, main);
// if (SHORTCUT) VM.shortcut.register(SHORTCUT, main);


// SETTINGS ========================================================================================

const NAMESPACES = ['main', 'article', 'section', 'body'];
const HEADING_SELECTORS = ['h1', 'h2'];
const TIME_SELECTORS = [
  'time',
  '[data-testid="storyPublishDate"]', // Medium
];
const HEAD_TIME_SELECTORS = [
  'meta[itemprop="dateModified"]',
  'meta[itemprop="datePublished"]',
];


let specialSite = null;


// HELPERS =========================================================================================

function formatResult(url, title, date) {
  console.debug(`[${GM_info.script.name}][formatResult] called`);

  let result = `[${title}](${url})` + (date ? ` (${date})` : '');
  const today = new Date().toISOString().replaceAll('-', '').substr(2, 6);
  let price;

  switch (specialSite) {
    case 'AMAZON':
      price = document.querySelector('#tp-tool-tip-subtotal-price-value .a-offscreen').textContent.replace(',', '.').trim();
      const cleanUrl = amazon_getCleanUrl();
      result = `[Amazon] [${title}](${cleanUrl}) ${price} (${today})`;
      break;
    case 'GITHUB':
      const about = document.querySelector('.Layout-sidebar .about-margin h2 + p').innerText.trim();
      result = `**[${title}](${url}):** ${about}`;
      break;
    case 'IKEA':
      price = document.querySelector('#pip-buy-module-content .pip-price__sr-text').textContent.replace('Price ', '').replace(',', '.').trim();
      result = `[IKEA] [${title}](${url}) ${price} (${today})`;
      break;
    case 'WIKIPEDIA': result = `[${title}](${url})`; break;
  }

  console.debug(`[${GM_info.script.name}][formatResult] return:`, result);
  return result;
}


function getTitle() {
  console.debug(`[${GM_info.script.name}][getTitle] called`);

  let e;

  switch (specialSite) {
    case 'AMAZON': e = document.getElementById('productTitle'); break;
    case 'GITHUB':
      e = document.querySelector('article .markdown-heading h1.heading-element');
      if (!e) e = document.querySelector('#repo-title-component a');
      break;
    case 'IKEA': e = document.querySelector('#pip-buy-module-content h1'); break;
    case 'WIKIPEDIA': e = document.querySelector('#firstHeading > span'); break;
    case 'YOUTUBE': e = youtube_getTitle(); break;
    default: e = findFirstElement(HEADING_SELECTORS, NAMESPACES);
  }

  const title = e ? e.textContent.trim() : null;

  console.debug(`[${GM_info.script.name}][getTitle] return:`, title);
  return title;
}


function getDate() {
  console.debug(`[${GM_info.script.name}][getDate] called`);

  let dt;

  switch (specialSite) {
    case 'YOUTUBE': dt = youtube_getDate(); break;
    default:
      let e;
      e = findFirstElement(HEAD_TIME_SELECTORS, ['head']);
      if (e) {
        dt = e.getAttribute('content');
      } else {
        e = findFirstElement(TIME_SELECTORS, NAMESPACES);
        if (e) dt = e.dateTime || e.innerText.trim();
      }
      break;
  }

  dt = dt ? formatDateTime('compact-date', dt) : null;

  console.debug(`[${GM_info.script.name}][getDate] return:`, dt);
  return dt;
}


// MAIN ============================================================================================

function main() {
  console.debug(`[${GM_info.script.name}][main] called`);

  specialSite = getSpecialSite();

  const title = window.getSelection().toString().trim() || getTitle();
  if (!title) {
    console.debug(`[${GM_info.script.name}][main] title not found`);
    alert('Article title not found. Select it.');
  } else {
    const url = window.location.href.replace(/\?$/, '');
    const date = getDate();
    const result = formatResult(url, title, date);

    console.debug(`[${GM_info.script.name}][main] result:`, result);
    copyToClipboard(result);
  }
}


GM_registerMenuCommand(GM_info.script.name, main);
