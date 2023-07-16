// USAGE: Spotify › Profile › Receipts › Bookmarklet
// Or go to this URL and click the bookmarklet:
//   https://www.spotify.com/account/subscription/receipt/

// 🤔 Is that legal?
// I’m not actually changing the content, just fixing the print layout 🤷‍♂️


l = document.querySelector('header[role=banner] .mh-brand-wrapper svg').parentNode.cloneNode(true);
l.setAttribute('style', 'width:135px;margin-bottom:50px');
l.querySelector('g').setAttribute('style', 'fill:#1ed760');

[
  'header[role=banner]',
  'div[role=main] > div',
  'div[role=main] > div > div',
  'footer#mh-footer',
].forEach((s) => { document.querySelector(s).remove(); });

document.querySelector('div[role=main] > div > div > div').prepend(l);

window.print();
