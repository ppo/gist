// ==UserScript==
// @name         Article Link
// @description  Create a Markdown string with information about the article, and copy it to the clipboard.
// @version      260703.01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://*/*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @require      https://raw.githubusercontent.com/ppo/gist/main/userscripts/_utils.js
// @downloadURL  https://raw.githubusercontent.com/ppo/gist/main/userscripts/article-link.js
// @homepageURL  https://github.com/ppo/gist/blob/main/userscripts/article-link.js
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


// HELPERS =========================================================================================

function formatResult(title) {
  console.debug(`[${GM_info.script.name}][formatResult] called; title:`, title);

  let infos = [];  // Falsy values are removed in `formatInfo()`.
  let prefix = '';

  const url = getCleanUrl();
  if (KNOWN_SITE_CONFIG.features & F_DATE)   infos.push(getDate());
  if (KNOWN_SITE_CONFIG.features & F_PRICE)  infos.push(getPrice());
  if (KNOWN_SITE_CONFIG.prefix) {
    const sitePrefix = KNOWN_SITE_CONFIG.prefix === true
      ? KNOWN_SITE_CONFIG.name
      : KNOWN_SITE_CONFIG.prefix;
    prefix = `[${sitePrefix}] `;
  }

  switch (KNOWN_SITE) {
    case 'DECATHLON':
      prefix = `[${KNOWN_SITE_CONFIG.name}${getTldSuffix()}] `;
      break;

    case 'GITHUB':
      const e = document.querySelector('.Layout-sidebar .about-margin h2 + p');
      if (e) title = `**${title}:** ${e.innerText.trim()}`;
      break;
  }

  const suffix = formatInfo(infos);
  let result = `${prefix}[${title}](${url})${suffix}`;

  console.debug(`[${GM_info.script.name}][formatResult] return:`, result);
  return result;
}


function getDate() {
  console.debug(`[${GM_info.script.name}][getDate] called`);

  let dt;

  switch (KNOWN_SITE) {
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


function getPrice() {
  console.debug(`[${GM_info.script.name}][getPrice] called`);

  let e;
  let price;

  switch (KNOWN_SITE) {
    case 'AMAZON':
      e = document.querySelector('#tp-tool-tip-subtotal-price-value .a-offscreen')
        || document.querySelector('.slot-price');
      price = e?.textContent;
      break;

    case 'DECATHLON':
      e = document.querySelector('.vp-price-amount');
      price = e?.textContent;
      break;

    case 'IKEA':
      e = document.querySelector('.pipcom-price__sr-text');
      price = e?.textContent.replace('Price ', '');
      break;
  }

  price = price ? formatPrice(price) : null;

  console.debug(`[${GM_info.script.name}][getPrice] return:`, price);
  return price;
}


function getTitle() {
  console.debug(`[${GM_info.script.name}][getTitle] called`);

  let e;
  let title;

  switch (KNOWN_SITE) {
    case 'AMAZON':
      e = document.getElementById('productTitle');
      break;

    case 'DECATHLON':
      title = document.querySelector('h1.vp-title-m')?.textContent.trim();
      const brand = document.querySelector('.product-info__brand .vp-title-s')?.textContent.trim();
      if (brand) title = `${toTitleCase(brand, true)} ${title}`;
      break;

    case 'GITHUB':
      e = document.querySelector('article .markdown-heading h1.heading-element')
        || document.querySelector('#repo-title-component a');
      break;

    case 'IKEA': e = document.querySelector('h1'); break;
    case 'WIKIPEDIA': e = document.querySelector('#firstHeading > span'); break;
    case 'YOUTUBE': ttile = youtube_getTitle(); break;

    default: e = findFirstElement(HEADING_SELECTORS, NAMESPACES);
  }

  if (!title && e) title = e.textContent.trim();
  if (!title) title = null;

  console.debug(`[${GM_info.script.name}][getTitle] return:`, title);
  return title;
}


// MAIN ============================================================================================

function main() {
  console.debug(`[${GM_info.script.name} v${GM_info.script.version}][main] called`);

  const title = getSelectedText() || getTitle();
  if (!title) {
    console.debug(`[${GM_info.script.name}][main] title not found`);
    alert('Article title not found. Select it.');
  } else {
    const result = formatResult(title);

    console.debug(`[${GM_info.script.name}][main] result:`, result);
    copyToClipboard(result);
  }
}


GM_registerMenuCommand(GM_info.script.name, main);
