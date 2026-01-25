// ==UserScript==
// @name         Duck Duck Go UX
// @description  Improve Duck Duck Go UX.
// @version      260125.01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://duckduckgo.com/*
// @run-at       document-idle
// @downloadURL  https://raw.githubusercontent.com/ppo/gist/main/userscripts/duckduckgo-ux.js
// @icon         data:image/png;base64,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
// ==/UserScript==
// Userscript Manager: Violentmonkey


// SETTINGS ========================================================================================

const TIMEOUT = 1000;
const MAX_CHECKS = 5;

var numChecks = 0;


// HELPERS =========================================================================================

function checkAds() {
  console.debug(`[${GM_info.script.name}][checkAds] called`);

  numChecks++;
  const ads = document.querySelectorAll('[data-layout="ad"]');
  if (ads.length) {
    hideAds(ads);
  } else if (numChecks < MAX_CHECKS) {
    setTimeout(checkAds, TIMEOUT);
  }
}


function hideAds(ads) {
  console.debug(`[${GM_info.script.name}][hideAds] called`);

  ads.forEach(e => {
    console.debug(`[${GM_info.script.name}][hideAds] hiding`, e);
    e.setAttribute('hidden', true);
  });
}


// MAIN ============================================================================================

function main() {
  console.debug(`[${GM_info.script.name}][main] called`);

  checkAds();
}


(function() { main(); })();
