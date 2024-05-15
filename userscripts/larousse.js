// ==UserScript==
// @name         Larousse
// @description  Remove blocking modal
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @version      231231
// @namespace    ppo
// @author       ppo
// @match        https://*.larousse.fr
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  setTimeout(function() {
    document.getElementById('poool-widget').remove();
    document.querySelector('[style^="filter"]').style.filter = null;
  }, 1000);
})();
