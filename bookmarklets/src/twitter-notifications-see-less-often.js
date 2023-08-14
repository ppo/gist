// Mark Twitter's suggestion notifications as "See less often".
//
// USAGE: https://twitter.com/notifications › Bookmarklet
//
// AUTOMATION: Using the extension "User JavaScript and CSS"
//   As content is dynamically loaded, the execution of this code must be delayed (for 5s).
//   Wrap this code in `setTimeout(function () { … }, 5000);`.
//   Extension: https://chrome.google.com/webstore/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld

items = document.querySelectorAll('div[aria-haspopup="menu"][aria-label="More"]');

items.forEach(function (e, i) {
  setTimeout(function () {
    ii = i + 1;
    console.log('Processing ' + ii + '/' + items.length);

    e.click();
    try {
      let m = document.querySelector('div[role="menuitem"]');
      let s = m.querySelector('span');
      if (s && s.textContent == 'See less often') { m.click(); }
      let c = m.closest('div[role="menu"]').parentElement.firstChild;
      if (c) { c.click(); }
    } catch {}

    if (ii == items.length) alert('👍 All notifications marked as "see less often".');
  }, 1000);
});
