// ==UserScript==
// @name         YouTube Video Link
// @description  Create a Markdown string with information about the video, and copy it to the clipboard.
// @icon         data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📺</text></svg>
// @version      24072701
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


// SHARED HELPERS ==================================================================================

function copyToClipboard(value) {
  // Copies the given value to the clipboard.
  // _utils.js / version: 24012601
  const e = document.createElement('textarea');
  e.value = value;
  document.body.appendChild(e);
  e.select();
  document.execCommand('copy');
}

function dateFormat(value) {
  // Formats a date (Date or string) as YYMMDD.
  // _utils.js / version: 24012602
  if (!value) return;
  const d = new Date(value);
  return d.toISOString().replace(/^(\d{2})(\d{2})-(\d{2})-(\d{2}).*/, '$2$3$4');
}



// LOCAL HELPERS ===================================================================================

function getVideoUrl() {
  const e = document.querySelector('ytd-watch-metadata');
  const videoId = e.getAttribute('video-id').trim();
  const url = new URL(`https://youtu.be/${videoId}`);
  return `${url.origin}${url.pathname}`;
}

function getChannelInfo() {
  const e = document.querySelector('ytd-video-owner-renderer ytd-channel-name a');
  return { name: e.textContent.trim(), url: e.href };
}

function getTitle() {
  const e = document.querySelector('ytd-watch-metadata #title h1 yt-formatted-string');
  let title = e.textContent;
  // title = title.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()); // Title case.
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

function convertUpperCaseWords(value) {
  let words = value.split(' ');
  words = words.map(word => isUpperCase(word) ? toTitleCase(word) : word);
  return words.join(' ');
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
