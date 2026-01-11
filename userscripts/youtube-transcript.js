// ==UserScript==
// @name         YouTube Transcript
// @description  Copy YouTube Transcript.
// @version      251226-01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://www.youtube.com/watch?*
// @require      https://raw.githubusercontent.com/ppo/gist/refs/heads/master/userscripts/_utils.js
// @run-at       context-menu
// ==/UserScript==


(function() {
  'use strict';

  document.querySelector('button[aria-label="Show transcript"]').click();
  waitForElement('ytd-transcript-renderer', (elem) => {
    const lines = [];
    elem.querySelectorAll('#content #body #segments-container .segment-text').forEach(elem => {
      lines.push(elem.textContent.trim());
    });

    const result = lines.join('\n');

    console.log(result);
    copyToClipboard(result);
  });

})();
