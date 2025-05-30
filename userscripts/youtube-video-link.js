// ==UserScript==
// @name         YouTube Video Link
// @description  Create a Markdown string with information about the video, and copy it to the clipboard.
// @icon         data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📺</text></svg>
// @version      250528-02
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://www.youtube.com/watch?*
// @run-at       context-menu
// ==/UserScript==


// DOCUMENTATION ===================================================================================

// USAGE: Go to the YouTube video page › Userscript.
//
// FORMAT:
//   [Title of the video](https://youtu.be/video-id) (YYMMDD, 00:00, YT:[Channel Name](channel-url))
//
// USERSCRIPTS MANAGER:
//   [Tampermonkey](https://www.tampermonkey.net/)
//   Update URL: https://raw.githubusercontent.com/ppo/gist/HEAD/userscripts/youtube-video-link.js


// CONSTANTS =======================================================================================

const KEEP_UPPERCASE = [
  '3D', 'AI', 'BMW', 'CNC', 'DIY', 'HQ', 'HVAC', 'RV', 'VW',
];


// SHARED HELPERS ==================================================================================

function copyToClipboard(value, message=true, timeout=undefined) {
  // Copy the given value to the clipboard.
  // _utils.js / version: 250430-01
  const e = document.createElement('textarea');
  e.value = value;
  document.body.appendChild(e);
  e.select();

  document.execCommand('copy');
  document.body.removeChild(e);

  if (message) {
    if (message === true) {
      message = document.createElement('div');

      const heading = document.createElement('p');
      heading.style = 'font-weight: bold; margin-bottom: 1rem';
      heading.textContent = 'Value copied to clipboard:';
      message.appendChild(heading);

      const pre = document.createElement('pre');
      pre.textContent = value;
      message.appendChild(pre);

      message = message.innerHTML;
    }
    snackbar(message, timeout);
  }
}

function dateFormat(value) {
  // Format a date (Date or string) as YYMMDD.
  // _utils.js / version: 240126-02
  if (!value) return;
  const d = new Date(value);
  return d.toISOString().replace(/^(\d{2})(\d{2})-(\d{2})-(\d{2}).*/, '$2$3$4');
}

function snackbar(message, timeout=2000) {
  // Display a temporary message.
  // Or fixed until clicked if `!timeout`.
  // _utils.js / version: 250528-01

  try {
    // Fix for error "Requires 'TrustedHTML' assignment"
    // Source: https://github.com/Tampermonkey/tampermonkey/issues/1334#issuecomment-927277844
    window.trustedTypes.createPolicy('default', {createHTML: (string, sink) => string})

    const elem = document.createElement('div');
    elem.innerHTML = message;
    Object.assign(elem.style, {
      all: 'initial',
      backgroundColor: '#ffca28',
      border: '3px solid #fff',
      boxShadow: 'rgba(0, 0, 0, 0.5) 3px 6px 12px',
      color: '#000',
      fontFamily: 'sans-serif',
      left: '50%',
      maxHeight: '75%',
      maxWidth: '75%',
      minWidth: '250px',
      overflow: 'auto',
      padding: '1rem 1.25rem',
      position: 'fixed',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '9999',
    });
    document.body.appendChild(elem);

    const destroy = () => { document.body.removeChild(elem); };
    elem.addEventListener('click', destroy);
    if (timeout) setTimeout(destroy, timeout);
  } catch {}
}


// LOCAL HELPERS ===================================================================================

function getVideoUrl() {
  const e = document.querySelector('ytd-watch-metadata');
  const videoId = e.getAttribute('video-id').trim();
  const url = new URL(`https://youtu.be/${videoId}`);
  return `${url.origin}${url.pathname}`;
}

function getChannelInfo() {
  const e = document.querySelector('#owner .ytd-channel-name a');
  return { name: e.textContent.trim(), url: e.href };
}

function getTitle() {
  const e = document.querySelector('ytd-watch-metadata #title h1 yt-formatted-string');
  let title = e.textContent;
  title = title.replace(/ +/g, s => ' '); // Remove multiple spaces.
  return title.trim();
}

function getDate() {
  let e, value;
  try {
    e = document.querySelector('#info-strings yt-formatted-string.ytd-video-primary-info-renderer');
    value = e.textContent.replace('Premiered', '').trim();
    value = dateFormat(value);
    console.log('value 1:', value);
  } catch {
    value = null;
  }

  if (!value) {
    e = document.querySelector('meta[itemprop="datePublished"]');
    value = e.getAttribute('content');
    value = dateFormat(value);
    console.log('value 2:', value);
  }

  return value || '?';
}

function getDuration() {
  const e = document.querySelector('ytd-player .ytp-time-duration');
  return e.textContent.trim();
}

function isUpperCase(value) {
  return value === value.toUpperCase();
}

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
}

function mustConvertUpperCase(value) {
  return value.length > 1 &&
    isUpperCase(value) &&
    KEEP_UPPERCASE.indexOf(value) === -1;
}

function convertUpperCaseWords(value) {
  return value.replace(/\b[A-Z]+\b/g, match =>  mustConvertUpperCase(match) ? toTitleCase(match) : match);
}


// MAIN ============================================================================================

(function() {
  'use strict';

  const videoUrl = getVideoUrl();
  const channel = getChannelInfo();
  const title = convertUpperCaseWords(getTitle());
  const date = getDate();
  const duration = getDuration();

  const result = `[${title}](${videoUrl}) (${date}, ${duration}, YouTube:[${channel.name}](${channel.url}))`;
  copyToClipboard(result);

})();
