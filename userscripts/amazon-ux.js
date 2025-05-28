// ==UserScript==
// @name         Amazon UX
// @description  Improve Amazon UX.
// @version      250429-01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        https://www.amazon.fr/*/dp/*
// @run-at       document-end
// ==/UserScript==



// SETTINGS ========================================================================================

const RE_SEO_URL = /\/[^\/]+\/dp\/[A-Z0-9]+\//;
const RE_PRODUCT_ID = /\/dp\/([A-Z0-9]+)/;


// HELPERS =========================================================================================

function mustCleanCurrentUrl() {
  if (RE_SEO_URL.test(window.location.pathname)) return true;

  const url = new URL(window.location.href);
  return url.search !== '';
}

function cleanUrl(elem) {
  if (!RE_SEO_URL.test(elem.pathname)) return;
  
  const match = elem.pathname.match(RE_PRODUCT_ID);
  if (!match) return;

  const url = new URL(elem.href);
  url.pathname = `/dp/${match[1]}`;
  url.search = '';
  elem.href = url.toString();
}


// MAIN ============================================================================================

(function() {
  'use strict';
  
  if (mustCleanCurrentUrl()) {
    console.log('MUST CLEAN');
    cleanUrl(window.location);
  } else {
    console.log('CLEAN LINKS');
    document.querySelectorAll(`a[href*="/dp/"]`).forEach(elem => {
      cleanUrl(elem);
    });
  }

})();
