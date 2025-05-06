// ==UserScript==
// @name         Copy Clean URL
// @description  Copy the clean URL to clipboard.
// @version      250505-01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://*/*
// @run-at       context-menu
// ==/UserScript==


// SETTINGS ========================================================================================

const RE_AMAZON_PRODUCT_ID = [ /\/dp\/([A-Z0-9]+)/, /\/gp\/product\/([A-Z0-9]+)/ ];
const RE_YOUTUBE_VIDEO_ID = /\/watch\?v=([^&]+)/;


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

function snackbar(message, timeout=2000) {
  // Display a temporary message.
  // Or fixed until clicked if `!timeout`.
  // _utils.js / version: 250430-01
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
      RE_AMAZON_PRODUCT_ID.forEach(regex => {
        if (match) return;
        match = window.location.pathname.match(regex);
      });
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
