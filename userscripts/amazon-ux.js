// ==UserScript==
// @name         Amazon UX
// @description  Improve Amazon UX.
// @version      260128.01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://www.amazon.*/*/dp/*
// @run-at       document-idle
// @require      https://raw.githubusercontent.com/ppo/gist/main/userscripts/_utils.js
// @downloadURL  https://raw.githubusercontent.com/ppo/gist/main/userscripts/amazon-ux.js
// @homepageURL  https://github.com/ppo/gist/blob/main/userscripts/amazon-ux.js
// @icon         data:image/png;base64,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
// ==/UserScript==
// Userscript Manager: Violentmonkey


// HELPERS =========================================================================================

function mustCleanCurrentUrl() {
  console.debug(`[${GM_info.script.name}][mustCleanCurrentUrl] called`);

  if (RE_AMAZON_SEO_URL.test(window.location.pathname)) return true;
  const url = new URL(window.location.href);
  return url.search !== '';
}


// MAIN ============================================================================================

function main() {
  console.debug(`[${GM_info.script.name}][main] called`);

  // Note: If current URL is changed, the page is reloaded.
  if (mustCleanCurrentUrl()) {
    console.debug(`[${GM_info.script.name}][main] mustCleanCurrentUrl === true`);
    window.location = amazon_getCleanUrl(window.location);
  } else {
    console.debug(`[${GM_info.script.name}][main] mustCleanCurrentUrl === false`);
    document.querySelectorAll('a[href*="/dp/"], a[href*="/gp/product/"]').forEach(elem => {
      console.debug(`[${GM_info.script.name}][main] elem:`, elem);
      elem.href = amazon_getCleanUrl(elem.href);
    });
  }
}


(function() { main(); })();
