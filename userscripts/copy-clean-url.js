// ==UserScript==
// @name         Copy Clean URL
// @description  Copy the clean URL to clipboard.
// @version      261105.01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://*/*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @require      https://raw.githubusercontent.com/ppo/gist/main/userscripts/_utils.js
// @downloadURL  https://raw.githubusercontent.com/ppo/gist/main/userscripts/copy-clean-url.js
// @homepageURL  https://github.com/ppo/gist/blob/main/userscripts/copy-clean-url.js
// ==/UserScript==
// Userscript Manager: Violentmonkey


// MAIN ============================================================================================

function main() {
  debug('main');

  const url = getCleanUrl();

  debug('main', 'result', url);
  copyToClipboard(url);
}


GM_registerMenuCommand(GM_info.script.name, main);
