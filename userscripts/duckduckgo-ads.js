// ==UserScript==
// @name         DuckDuckGo Ads
// @description  Hide ads.
// @version      24051501
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        https://duckduckgo.com/*
// @run-at       document-end
// ==/UserScript==


(function() {
  'use strict';

  setTimeout(function() {
    document.querySelectorAll('[data-layout="ad"]').forEach(e => {
      e.setAttribute('hidden', true);
    });
  }, 1000);

})();
