// ==UserScript==
// @name         X Article Content
// @description  Copy X Article content.
// @version      260219.01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://x.com/*/status/*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @require      https://cdn.jsdelivr.net/npm/turndown/dist/turndown.min.js
// @require      https://raw.githubusercontent.com/ppo/gist/main/userscripts/_utils.js?260219.01
// @downloadURL  https://raw.githubusercontent.com/ppo/gist/main/userscripts/x-article-content.js
// @homepageURL  https://github.com/ppo/gist/blob/main/userscripts/x-article-content.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAEz0lEQVR4nL3WgVniSBiH8f9UYDpQKzBUcKECoYKLFQgVXKwAqECtgGwFZisgVHC5DkIH9343NxsTQBLAfZ/n98RdRjIzDKCTFGODoZUY4Xf0ilRNK8wgW4Bl/1hgaC/I9L1lkv5C6B2p/s8hVEj6A0Mbo9D3lMrvfmiLGL9yCN3JH4sbWHMs0S2R9IFQJX+UalyzGBuEtkjUuY/D52ZYwKoxRolumdov6wozXKsYH4hg7ZDowFwcuuV4hFVihEPZYw8IjVHo8iLY5GOEbA4l9nLoFqFSc5RekGm/GIWacTXuYddL2iBG6AlvOpLDoSZYI3RsB2ZYIJRjinN7RaqmF2T6Iodj2WQeYVXyi6jRrVD702uKHEPL1H5fvSPViRyOFaHELawVZugWodJlRymV3/3QFjFO5vBVifwbKjRFjm4TrBEq5N/UfYqxQWiLRD03wOFUSzzDqnEPu3Z7k/QnQnMs8VUxPhDB2iGRf+V75XCqCCVuYeWYoluEEmFcjREqHS7CBnfy7ZDIP0fvHPqUyO9UaI4luiVqjyt0+ChFsHExQk9408Ac+pap+ZSoMUKl/TI146w5lvjcK1I1HRrTqyELsEo8wLKfRziUPRbGWTbO/s9a4hmhd6Q6M4chxdgg9IJM+9m4Qs1HawlbRCq/+6GfSHRBDkPL1D4iNjGbYLcZFgjlmCC0RSJ/HM/unAVYhZpv30p+EYcmUqgZ97kdYlS6sHMXcCe/6zewVpihW4RKzThrh0T+9y/O4dxmWCA0RY5uE6wR+gH7v6t0yQKsQs0RqXEPu3Z7U/tbeoxCV8jhkiJUao5Ijim6RShxC6vS8ffNoC5dgDXBGqE5luiWyH/7hnJMcVHXWIBlk3mEVWOESvst8YzQFDnO7loLiFCpOUolRjiUPfYAq8Y97HpWDtdqgjVCL8i0X4wNQjmmOCuHaxTBzneMz41QotsMC4TmWGJw11rAGhN0q+QXUaNbofZHsI2rNLBrLOAVqZp+4g+EVpih2538q3MDq5D/fhiUwyWl8gsI/cAEmdp/8E2Ro9sEa4TmWKJ3lyxggs833yKRPw5WiQdYNe5h1245HhEaoUSvHM4pxgciWDvcqT3BGBuEckzRLUKJW1j28wi9chhahL9hV2uHRP7G3TK1j9IcS3RL5Dck9IJMPXIYUgS7UYzQFDmOVah5U9cYodJ+SzwjZONKfNnQBXwgUdMT3vR1d/ITuYFlP9vkDmWPPcCq5MfVOJpD316RqmmFGfpk4xYIvSDTfjE2CJ28h0Of7EkWCL0j1bAKNUfJGqFEtxk+32uMQkdyOFUqv/uhLRKdeGkPFKFS+yiNUaNboWaxlfxiD407uYAYH4hg/YMYNc5pgjVCK8zQ7U5+gTewckyxl8Ox7uTPYwRrh0T+iS8pxyNCYxTab4I1QlPkaOVwqAi28zFCYxS6vAiVmt2tcQ+7dsvxCKvG3jiHQ9nkEzU94U3XK5G/RyiH7XC3CCVuYeVojXPo9opUTSvMcO2WeEboCW/aL1F7sXPY7/6Xw+dmWCD0jlTfU4QSt7BqjFBpvyWeYdX4Nc4hlMrvfmiLRP4XvqtE7d3tWyH/nvy1gBj2RBGs3zH5UKb2H3x9m2NpC4jxgQjWDon8y/u7sns9YGijfwFNZCRwbtSEeAAAAABJRU5ErkJggg==
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
