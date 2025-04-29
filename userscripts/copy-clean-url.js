// ==UserScript==
// @name         Copy Clean URL
// @description  Copy the clean URL to clipboard.
// @version      250429-01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://*/*
// @run-at       context-menu
// ==/UserScript==


// SETTINGS ========================================================================================

const RE_AMAZON_PRODUCT_ID = /\/dp\/([A-Z0-9]+)/;
const RE_YOUTUBE_VIDEO_ID = /\/watch\?v=([^&]+)/;


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


// HELPERS =========================================================================================

function checkSpecialSite() {
  if (window.location.host.includes('amazon.'))     specialSite = 'AMAZON';
  if (window.location.host.includes('youtube.com')) specialSite = 'YOUTUBE';
}

function getCleanUrl() {
  let match;

  switch (specialSite) {
    case 'AMAZON':
      match = window.location.pathname.match(RE_AMAZON_PRODUCT_ID);
      if (match) {
        const url = new URL(window.location.href);
        url.pathname = `/dp/${match[1]}`;
        url.search = '';
        return url.toString();
      }
      break;

    case 'YOUTUBE':
      match = window.location.href.match(RE_YOUTUBE_VIDEO_ID);
      if (match) {
        const url = new URL(window.location.href);
        url.host = 'youtu.be'
        url.pathname = match[1];
        url.search = '';
        return url.toString();
      }
      break;
  }

  return window.location.href;
}


// MAIN ============================================================================================

(function() {
  'use strict';

  checkSpecialSite();
  copyToClipboard(getCleanUrl());

})();
