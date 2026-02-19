// ==UserScript==
// @name         Copy Clean URL
// @description  Copy the clean URL to clipboard.
// @version      260219.02
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


// HELPERS =========================================================================================

function getCleanUrl() {
  console.debug(`[${GM_info.script.name}][getCleanUrl] called`);

  let match;
  const specialSite = getSpecialSite();

  const url = new URL(window.location.href);
  url.hash = '';

  switch (specialSite) {
    case 'ALIEXPRESS': url.search = ''; break;
    case 'AMAZON': return amazon_getCleanUrl();
    case 'YOUTUBE': return youtube_getVideoUrl();
  }

  console.debug(`[${GM_info.script.name}][getCleanUrl] return:`, url);
  return url.toString();
}


// MAIN ============================================================================================

function main() {
  console.debug(`[${GM_info.script.name}][main] called`);

  const result = getCleanUrl();

  console.debug(`[${GM_info.script.name}][main] result:`, result);
  copyToClipboard(result);
}


GM_registerMenuCommand(GM_info.script.name, main);
