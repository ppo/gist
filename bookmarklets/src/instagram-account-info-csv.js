// Scrape info about the current Instagram account.
//
// Columns: Username, URL, Name, Category, Bio, Followers, Posts, Website, Profile Picture URL.


h=window.location.pathname.replaceAll('/', '');
e1=document.querySelector('a[href="/'+h+'/followers/"]');
e2=e1.closest('ul');
e3=e2.nextSibling;

g = e => e ? e.textContent : '';
i = e => e ? e.src : '';

d=[];
d.push(h);  // Username
d.push(window.location.href);  // URL
d.push(g(e3.querySelector('span')));  // Name
d.push(g(e3.querySelector('div:nth-child(2)')));  // Category
d.push(g(e3.querySelector('h1')));  // Bio
d.push(g(e1.querySelector('span > span')).replace(/[^0-9]/g, ''));  // Followers
d.push(g(e2.querySelector('li:first-of-type > span > span')).replace(/[^0-9]/g, ''));  // Posts
d.push(g(e3.querySelector('a[target="_blank"] > span > span')));  // Website
d.push(i(document.querySelector('main[role="main"] header span[role="link"] img')));  // Profile Picture URL

e = document.createElement('textarea');
e.value = d.join('\t');
console.log(e.value);
document.body.appendChild(e);
e.select();
document.execCommand('copy');
alert('👍 CSV data copied to clipboard.');
