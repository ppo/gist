// ==UserScript==
// @name         Gmail Clean Print
// @description  Remove the email header to print only the body part.
// @icon         data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📧</text></svg>
// @version      24012602
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://mail.google.com/mail/*&view=pt&*
// @run-at       context-menu
// ==/UserScript==


// DOCUMENTATION ===================================================================================

// USAGE: Gmail › Open email › Print › Cancel › Userscript.
//
// USERSCRIPTS MANAGER:
//   [Tampermonkey](https://www.tampermonkey.net/)
//   Update URL: https://raw.githubusercontent.com/ppo/gist/HEAD/userscripts/gmail-clean-print.js


// MAIN ============================================================================================

(function() {
  'use strict';

  [
    'body > div > table',
    'body > div > hr',
    'body > div > div > table:nth-child(1)',
    'body > div > div > hr',
    'body > div > div > table.message > tbody > tr:nth-child(1)',
    'body > div > div > table.message > tbody > tr:nth-child(2)',
  ].reverse().forEach((s) => {
    document.querySelector(s).remove();
  });

  window.print();

})();
