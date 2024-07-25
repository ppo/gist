// ==UserScript==
// @name         DuckDuckGo Ads
// @description  Hide ads.
// @version      24060303
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        https://duckduckgo.com/*
// @run-at       document-end
// ==/UserScript==

const TIMEOUT = 1000;
const MAX_CHECKS = 5;

var numChecks = 0;

function hideAds(ads) {
  // console.log('hide ads:', ads);
  ads.forEach(e => {
    e.setAttribute('hidden', true);
  });
}

function checkAds() {
  numChecks++;
  const ads = document.querySelectorAll('[data-layout="ad"]');
  // console.log('[checkAds]', numChecks, ads.length);
  if (ads.length) {
    hideAds(ads);
  } else if (numChecks < MAX_CHECKS) {
    // console.log('settimeout', numChecks);
    setTimeout(checkAds, TIMEOUT);
  }
}

(function() {
  'use strict';

  checkAds();

})();
