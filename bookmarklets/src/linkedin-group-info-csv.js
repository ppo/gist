// Scrape info about the current LinkedIn group.
//
// USAGE: Go to the LinkedIn Group page. Execute this bookmarklet.
//
// Columns: Name, URL, Description, Members.


function g(s, p) {
  p = p || document;
  e = p.querySelector(s);
  return e ? e.textContent.trim() : '';
}

d=[];
d.push(g('h1.groups-entity__name > span'));  // Name
d.push(window.location.href);  // URL
d.push(g('.groups-guest-view__truncate span'));  // Description
d.push(g('section.groups-header__container > div div.mt1').replace(' members', '').replace(/[^0-9]/g, ''));  // Members

e = document.createElement('textarea');
e.value = d.join('\t');
console.log(e.value);
document.body.appendChild(e);
e.select();
document.execCommand('copy');
