// ==UserScript==
// @name         Copy Clean URL
// @description  Copy the clean URL to clipboard.
// @version      260703.01
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
  console.debug(`[${GM_info.script.name} v${GM_info.script.version}][main] called`);

  const url = getCleanUrl();

  console.debug(`[${GM_info.script.name}][main] url:`, url);
  copyToClipboard(url);
}


GM_registerMenuCommand(GM_info.script.name, main);
