// Create a Mardown text with all the information about the video and copy it to the clipboard.
// FORMAT: [Title of the video](https://youtu.be/video-id) (YYMMDD, 00:00, YT:[Channel Name](channel-url))
// USAGE: YouTube video page › Bookmarklet

id = document.querySelector('#primary ytd-watch-metadata').getAttribute('video-id');
c = document.querySelector('#channel-name yt-formatted-string.ytd-channel-name a');
cn = c.textContent;
cu = c.href;
t = document.querySelector('#title h1 yt-formatted-string').textContent;
d = document.querySelector('#info-strings yt-formatted-string.ytd-video-primary-info-renderer').textContent;
l = document.querySelector('.ytp-time-duration').textContent;

u = new URL('https://youtu.be/'+id);
u = u.origin + u.pathname;
d = new Date(d).toISOString().replace(/^(\d{2})(\d{2})-(\d{2})-(\d{2}).*/, '$2$3$4');

e = document.createElement('textarea');
e.value = `[${t}](${u}) (${d}, ${l}, YT:[${cn}](${cu}))`;
document.body.appendChild(e);
e.select();
document.execCommand('copy');
