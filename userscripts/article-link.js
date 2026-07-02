// ==UserScript==
// @name         Article Link
// @description  Create a Markdown string with information about the article, and copy it to the clipboard.
// @version      260702.09
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


let specialSite = null;


// HELPERS =========================================================================================

function formatResult(title) {
  console.debug(`[${GM_info.script.name}][formatResult] called; title:`, title);

  const url = window.location.href.replace(/\?$/, '');
  const date = getDate();
  const price = getPrice();
  const info = formatInfo([date, price]);
  const priceInfo = formatInfo([price]);

  let result = `[${title}](${url})${info}`;
  let e;

  switch (specialSite) {
    case 'AMAZON':
      const cleanUrl = amazon_getCleanUrl();
      result = `[Amazon] [${title}](${cleanUrl})${priceInfo}`;
      break;

    case 'DECATHLON':
      let tldSuffix = getTldSuffix();
      result = `[Decathlon${tldSuffix}] [${title}](${url})${priceInfo}`;
      break;

    case 'GITHUB':
      const link = `[${title}](${url})`;
      e = document.querySelector('.Layout-sidebar .about-margin h2 + p');
      result = e ? `**${link}:** ${e.innerText.trim()}` : `**${link}**`;
      break;

    case 'IKEA': result = `[IKEA] [${title}](${url})${priceInfo}`; break;
    case 'WIKIPEDIA': result = `[${title}](${url})`; break;
  }

  console.debug(`[${GM_info.script.name}][formatResult] return:`, result);
  return result;
}


function getPrice() {
  console.debug(`[${GM_info.script.name}][getPrice] called`);

  let e;
  let price;

  switch (specialSite) {
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
      e = document.querySelector('#pip-buy-module-content .pip-price__sr-text');
      price = e?.textContent.replace('Price ', '');
      break;
  }

  price = price ? formatPrice(price) : null;

  console.debug(`[${GM_info.script.name}][getPrice] return:`, price);
  return price;
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


function getTitle() {
  console.debug(`[${GM_info.script.name}][getTitle] called`);

  let e;
  let title;

  switch (specialSite) {
    case 'AMAZON': e = document.getElementById('productTitle'); break;

    case 'DECATHLON':
      title = document.querySelector('h1.vp-title-m')?.textContent.trim();
      const brand = document.querySelector('.product-info__brand .vp-title-s')?.textContent.trim();
      if (brand) title = `${titleCase(brand, true)} ${title}`;
      break;

    case 'GITHUB':
      const e = document.querySelector('article .markdown-heading h1.heading-element')
        || document.querySelector('#repo-title-component a');
      break;

    case 'IKEA': e = document.querySelector('#pip-buy-module-content h1'); break;
    case 'WIKIPEDIA': e = document.querySelector('#firstHeading > span'); break;
    case 'YOUTUBE': e = youtube_getTitle(); break;

    default: e = findFirstElement(HEADING_SELECTORS, NAMESPACES);
  }

  if (!title && e) title = e.textContent.trim();
  title = title || null;

  console.debug(`[${GM_info.script.name}][getTitle] return:`, title);
  return title;
}


// MAIN ============================================================================================

function main() {
  console.debug(`[${GM_info.script.name} v${GM_info.script.version}][main] called`);

  specialSite = getSpecialSite();

  const title = window.getSelection().toString().trim() || getTitle();
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
