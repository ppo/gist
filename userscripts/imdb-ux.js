// ==UserScript==
// @name         IMDb UX
// @description  Improve IMDb UX.
// @version      250429-01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        https://www.imdb.com/*
// @run-at       document-end
// ==/UserScript==



// SETTINGS ========================================================================================

const PARAM_NAME = 'ref_';


// HELPERS =========================================================================================

function mustCleanCurrentUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.has(PARAM_NAME);
}

function cleanUrl(elem) {
  const url = new URL(elem.href);
  const params = new URLSearchParams(url.search);
  params.delete(PARAM_NAME);
  url.search = params.toString();
  elem.href = url.toString();
}


// MAIN ============================================================================================

(function() {
  'use strict';
  
  if (mustCleanCurrentUrl()) {
    cleanUrl(window.location);
  } else {
    document.querySelectorAll(`a[href*="${PARAM_NAME}="]`).forEach(elem => {
      cleanUrl(elem);
    });
  }

})();
