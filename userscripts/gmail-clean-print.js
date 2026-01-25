// ==UserScript==
// @name         Gmail Clean Print
// @description  Remove the email headers to print only the body part.
// @version      260125.01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://mail.google.com/mail/*&view=pt&*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @downloadURL  https://raw.githubusercontent.com/ppo/gist/main/userscripts/gmail-clean-print.js
// @icon         https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico
// ==/UserScript==
// Userscript Manager: Violentmonkey

// USAGE:
//   1. Gmail › Open email › Print › Cancel
//   2. Violentmonkey menu › "this script"

function main() {
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
}

GM_registerMenuCommand('Gmail Clean Print', main);
