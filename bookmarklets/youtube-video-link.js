javascript:id=document.querySelector('#primary ytd-watch-metadata').getAttribute('video-id');c=document.querySelector('#channel-name yt-formatted-string.ytd-channel-name a');cn=c.textContent;cu=c.href;t=document.querySelector('#title h1 yt-formatted-string').textContent.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());d=document.querySelector('#info-strings yt-formatted-string.ytd-video-primary-info-renderer').textContent;l=document.querySelector('.ytp-time-duration').textContent;u=new URL(%60https://youtu.be/${id}%60);u=%60${u.origin}${u.pathname}%60;d=new Date(d).toISOString().replace(/^(\d{2})(\d{2})-(\d{2})-(\d{2}).*/, '$2$3$4');e=document.createElement('textarea');e.value=%60[${t}](${u}) (${d}, ${l}, YT:[${cn}](${cu}))%60;document.body.appendChild(e);e.select();document.execCommand('copy');
