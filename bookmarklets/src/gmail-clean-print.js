// Remove the email header to print only the body part.
// USAGE: Gmail › Open email › Print › Cancel › Bookmarklet

[
  'body > div > table',
  'body > div > hr',
  'body > div > div > table:nth-child(1)',
  'body > div > div > hr',
  'body > div > div > table.message > tbody > tr:nth-child(1)',
  'body > div > div > table.message > tbody > tr:nth-child(2)',
].reverse().forEach((s) => { document.querySelector(s).remove(); });

window.print();
