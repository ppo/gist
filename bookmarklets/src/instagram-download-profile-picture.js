// Download the profile picture of the current account.
//
// USAGE: Instagram profile page › Bookmarklet
//
// Download Filename: <handle>.YYMMDD-HHSSMM-000Z.jpg


function download(img, filename) {
  fetch(img.src)
  .then(r => r.blob())
  .then(b => {
    a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

// Profile page or post detail page
h = document.querySelector('main[role="main"] header section h2');
if (h) {
  h = h.textContent;
} else {
  h = document.querySelector('main[role="main"] header a').textContent;
  alert('The profile picture is better on the main profile page. Redirecting now… Then run this again.');
  navigation.navigate('https://www.instagram.com/' + h + '/');
}

img = document.querySelector('main[role="main"] header span[role="link"] img');
t = (new Date()).toISOString().replace(/[-:]/g, '').replace(/[T\.]/g, '-');
download(img, h + '.' + t + '.jpg');
