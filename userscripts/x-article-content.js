// ==UserScript==
// @name         X Article Content
// @description  Copy X Article content.
// @version      260219.03
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://x.com/*/status/*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @require      https://cdn.jsdelivr.net/npm/turndown/dist/turndown.min.js
// @require      https://raw.githubusercontent.com/ppo/gist/main/userscripts/_utils.js
// @downloadURL  https://raw.githubusercontent.com/ppo/gist/main/userscripts/x-article-content.js
// @homepageURL  https://github.com/ppo/gist/blob/main/userscripts/x-article-content.js
// @icon         data:image/png;base64,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
// ==/UserScript==
// Userscript Manager: Violentmonkey


// MAIN ============================================================================================

function main() {
  console.debug(`[${GM_info.script.name}][main] called`);

  const article = document.querySelector('article')
  const userElem = article.querySelectorAll('[data-testid="User-Name"] a');
  const user = {
    handle: userElem[1].textContent.replace('@', ''),
    name: userElem[0].textContent,
    url: userElem[0].href,
  };
  const title = article.querySelector('[data-testid="twitter-article-title"]').textContent;
  const content = html2markdown(article.querySelector('[data-testid="longformRichTextComponent"]').innerHTML);
  const dt = article.querySelector('time').dateTime;
  const date = formatDateTime('iso', dt);
  const compactDate = formatDateTime('compact-date', dt);

  const filenameText = cleanFilename(`${user.handle} - ${title}.${compactDate}.html`);

  const result = `${filenameText}
---
url: ${document.location.href}
title: "${title}"
date: ${date}
user:
  handle: ${user.handle}
  name: "${user.name}"
  url: ${user.url}
---

# ${title}

${content}
`;

  console.debug(`[${GM_info.script.name}][main] result:`, result);
  copyToClipboard(result);
}


GM_registerMenuCommand(GM_info.script.name, main);
