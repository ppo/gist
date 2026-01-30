console.debug('[_utils.js] Version 260130.01');


// BROWSER FEATURES ================================================================================

/**
 * Copy the given value to the clipboard.
 * Requires: `@grant GM_setClipboard`
 *
 * @param {string} value - The value to copy.
 * @param {bool|string} message - Display a snackbar message. `true` = use `value`.
 * @param {integer} timeout - Display duration of the snackbar.
*/
function copyToClipboard(value, message=true, timeout=undefined) {
  console.debug('[copyToClipboard] called');

  GM_setClipboard(value);
  // const e = document.createElement('textarea');
  // e.value = value;
  // document.body.appendChild(e);
  // e.select();

  // document.execCommand('copy');
  // document.body.removeChild(e);

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
    } else {
      console.debug('[copyToClipboard] message !== true', message);
    }

    console.debug('[copyToClipboard] calling snackbar()', message, timeout);
    snackbar(message, timeout);
  } else {
    console.debug('[copyToClipboard] no message', message);
  }
}


/**
 * Triggers download of a file in the browser.
 *
 * @param {string} content - File content
 * @param {string} filename - Filename with extension
 * @param {string} [type] - MIME type (defaults to 'text/plain')
 */
function downloadFile(content, filename, type='text/plain') {
  console.debug('[downloadFile] called');

  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}


// CALENDAR ========================================================================================

/**
 * Creates an ICS file content from event data.
 *
 * @param {Object} data - Event data.
 * @param {string} data.title - Event title.
 * @param {Date|string} data.start - Start date/time, with/without timezone.
 * @param {Date|string} data.end - End date/time, with/without timezone.
 * @param {string} [data.location] - Event location.
 * @param {string} [data.description] - Event description.
 * @param {string} [prodId] - Product identifier. Default: "generic". Format: `-//Company//Product//LanguageCode`.
 * @returns {string} ICS file content.
 */
function createIcs(data, prodId='-//Generic Script//Calendar Event//EN') {
  console.debug('[createIcs] called');

  const ESCAPE_MAP = [
    /\\/g, '\\\\',
    /;/g,  '\\;',
    /,/g,  '\\,',
    /\n/g, '\n',
    /\r/g, '',
  ];

  const generateUID = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
  };

  // Begin calendar
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  // Add timezone definition if timezone is provided
  if (data.timezone) {
    icsContent.push(
      'BEGIN:VTIMEZONE',
      `TZID:${data.timezone}`,
      'END:VTIMEZONE',
    );
  }

  // Begin event
  icsContent.push(
    'BEGIN:VEVENT',
    `UID:${generateUID()}`,
    `DTSTAMP:${formatDateTime('ics-utc')}`,
  );

  // Process fields
  if (data.start)       icsContent.push(`DTSTART;${formatDateTime('ics-tz', data.start)}`);
  if (data.end)         icsContent.push(`DTEND;${formatDateTime('ics-tz', data.end)}`);
  if (data.title)       icsContent.push(`SUMMARY:${replaceMap(data.title, ESCAPE_MAP)}`);
  if (data.location)    icsContent.push(`LOCATION:${replaceMap(data.location, ESCAPE_MAP)}`);
  if (data.description) icsContent.push(`DESCRIPTION:${replaceMap(data.description, ESCAPE_MAP)}`);

  // End event & calendar
  icsContent.push(
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  );

  return icsContent.join('\r\n');
}


// DATE, TIME, TIMEZONE ============================================================================

/**
 * Converts a date to a different timezone, returning a new Date object where the local time
 * represents the time in the target timezone.
 *
 * @param {Date|string} value - Source date value
 * @param {string} timezone - Target timezone ('UTC', 'local', or IANA timezone like 'Europe/Brussels')
 * @returns {Date} New Date object with converted timezone
 * @throws {Error} When invalid date or unsupported timezone is provided
 * @example
 *   switchTimezone(new Date(), 'UTC') // Convert to UTC
 *   switchTimezone('2025-06-04T14:30:00', 'Europe/Brussels') // Convert to Brussels time
 *   switchTimezone(new Date(), 'local') // Keep as local time (no-op)
 */
function changeTimezone(value, timezone) {
  console.debug('[changeTimezone] called');

 const date = strToDate(value, true);

 if (!timezone || timezone === 'local') return date;

 if (timezone === 'UTC') {
   // Create new Date with UTC values as local time
   return new Date(
     date.getUTCFullYear(),
     date.getUTCMonth(),
     date.getUTCDate(),
     date.getUTCHours(),
     date.getUTCMinutes(),
     date.getUTCSeconds(),
     date.getUTCMilliseconds(),
   );
 }

 // Handle IANA timezones using Intl.DateTimeFormat
 try {
   const formatter = new Intl.DateTimeFormat('en-CA', {
     timeZone: timezone,
     year: 'numeric',
     month: '2-digit',
     day: '2-digit',
     hour: '2-digit',
     minute: '2-digit',
     second: '2-digit',
     hour12: false,
   });

   const parts = formatter.formatToParts(date);
   const partsMap = parts.reduce((acc, part) => {
     acc[part.type] = part.value;
     return acc;
   }, {});

   return new Date(
     parseInt(partsMap.year),
     parseInt(partsMap.month) - 1, // Month is 0-indexed
     parseInt(partsMap.day),
     parseInt(partsMap.hour),
     parseInt(partsMap.minute),
     parseInt(partsMap.second),
   );
 } catch (error) {
    console.debug('[changeTimezone] ERROR:', error);
    throw new Error(`Unsupported timezone: ${timezone}`);
 }
}


/**
 * Formats a date/time value, according to PHP `DateTime::format` conventions.
 *
 * @param {string} format - Format string or predefined format name.
 * @param {Date|string} [value] - Date, time, or date/time value. Default: `now`.
 * @param {string} [timezone] - Target timezone ('UTC', 'local', or IANA timezone).
 * @returns {string} Formatted date/time string.
 * @throws {Error} When invalid date is provided.
 * @see https://www.php.net/manual/en/datetime.format.php
 */
function formatDateTime(format, value, timezone) {
  console.debug('[formatDateTime] called');

  if (!value) return value;

  const predefined = {
    'date':             'Y-m-d',
    'time':             'H:i:s',
    'datetime':         'Y-m-d H:i:s',
    'iso':              'Y-m-dTH:i:sO',
    'compact-date':     'ymd',
    'compact-datetime': 'ymd-Hi',
    'ics':              'YmdTHis',    // For ICS calendar file
    'ics-utc':          'YmdTHisZ',   // For ICS calendar file
    'ics-tz':           'O:YmdTHis',  // For ICS calendar file
  };

  // Use predefined format if exists
  const actualFormat = (predefined[format] || format).replace('c', predefined.iso);

  // Initialize date
  let date = strToDate(value, true);

  // Handle timezone
  if (actualFormat.includes('Z')) timezone = 'UTC';  // Force UTC if format contains `Z`
  if (timezone) date = changeTimezone(date, timezone);

  // Extract all components at once to avoid multiple calls
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const tzOffset = getTimezoneOffset(date);

  // Format mapping
  const formatMap = {
    d: String(day).padStart(2, '0'),      // 01…31 - Day of the month, 2 digits with leading zeros
    j: String(day),                       // 1…31 - Day of the month without leading zeros
    m: String(month).padStart(2, '0'),    // 01…12 - Numeric representation of a month, with leading zeros
    n: String(month),                     // 1…12 - Numeric representation of a month, without leading zeros
    y: String(year).slice(-2),            // 99, 03 - A two digit representation of a year
    Y: String(year),                      // 1999, 2003 - A full numeric representation of a year, at least 4 digits
    H: String(hours).padStart(2, '0'),    // 00…23 - 24-hour format of an hour with leading zeros
    i: String(minutes).padStart(2, '0'),  // 00…59 - Minutes with leading zeros
    s: String(seconds).padStart(2, '0'),  // 00…59 - Seconds with leading zeros
    O: tzOffset,                          // +0200, -0130 - Difference to UTC without colon between hours and minutes
    // c: See above `actualFormat = …`    // ISO 8601 date
  };

  // Format the date
  return actualFormat.split('').map(char => formatMap[char] || char).join('');
}


/**
 * Returns the difference to UTC without colon between hours and minutes.
 *
 * @param {Date|string} [value] - Time or date/time value. Default: `now`.
 * @returns {string} Timezone offset string as `sHHMM` (s = sign = +/-).
 * @throws {Error} When invalid time is provided.
 */
function getTimezoneOffset(value) {
  console.debug('[getTimezoneOffset] called');

  // Initialize date
  const date = strToDate(value, true);

  // Difference between value in UTC and local timezone.
  // Positive/negative means local is behind/ahead UTC. Ex: -600 = UTC+10.
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const offsetMinutes = String(absOffset % 60).padStart(2, '0');
  return `${sign}${offsetHours}${offsetMinutes}`;
}


function strToDate(value, withTime=false) {
  console.debug('[strToDate] called');

  const date = value ? new Date(value) : new Date();
  if (withTime && isNaN(date.getTime())) {
    throw new Error(`Value doesn't include a time: ${value}`);
  }
  return date;
}


// DOM =============================================================================================

function createCssStyle(css) {
  console.debug('[createCssStyle] called');

  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  document.getElementsByTagName('head')[0].appendChild(style);
}


// Find the first element matching a series of selectors, located under a series of namespaces.
function findFirstElement(selectors, namespaces) {
  console.debug('[findFirstElement] called');

  for (let selector of selectors) {
    for (let namespace of namespaces) {
      let e = document.querySelector(`${namespace} ${selector}`);
      if (e) return e;
    }
  }
}


function hide(elem) {
  console.debug('[hide] called');

  elem.style.display = 'none';
}


// Usage: waitForElement('.selector', e => { … });
function waitForElement(selector, callback, timeout=2000) {
  console.debug('[waitForElement] called');

  const elem = document.querySelector(selector);
  if (elem) {
    callback(elem);
  } else {
    setTimeout(() => { waitForElement(selector, callback, timeout); }, timeout);
  }
}


// STRING ==========================================================================================

/**
 * Applies multiple string replacements using a map of pattern-replacement pairs.
 *
 * @param {string} text - Text to process.
 * @param {Array} replacements - Flat array of [pattern, replacement, …].
 * @returns {string} Text with all replacements applied.
 */
function replaceMap(text, replacements) {
  console.debug('[replaceMap] called');

  if (!text) return '';

  let result = text;
  for (let i = 0; i < replacements.length; i += 2) {
    const pattern = replacements[i];
    const replacement = replacements[i + 1];
    result = result.replace(pattern, replacement);
  }

  return result;
}


// Generate a slug based on the given value.
function slugify(value) {
  console.debug('[slugify] called');

  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/&/g, '-and-')    // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')  // Remove all non-word chars except -
    .replace(/\-\-+/g, '-');   // Replace multiple - with single -
}


// UI ==============================================================================================

const SNACKBAR_CSS = {
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
};


// Display a temporary message – or fixed until clicked if `!timeout`.
function snackbar(message, timeout=2000) {
  console.debug('[snackbar] called');

  try {
    // Fix for error "Requires 'TrustedHTML' assignment"
    // Source: https://github.com/Tampermonkey/tampermonkey/issues/1334#issuecomment-927277844
    window.trustedTypes.createPolicy('default', { createHTML: (string, sink) => string });
  } catch (error) {
    console.debug('[snackbar] createPolicy() ERROR:', error);
  }

  try {
    const elem = document.createElement('div');
    elem.innerHTML = message;
    Object.assign(elem.style, SNACKBAR_CSS);
    document.body.appendChild(elem);
    console.debug('[snackbar] DOM updated', elem);

    const destroy = () => { document.body.removeChild(elem); };
    elem.addEventListener('click', destroy);
    if (timeout) setTimeout(destroy, timeout);
  } catch (error) {
    console.debug('[snackbar] ERROR:', error);
  }
}


// ALL UPPERCASE WORDS TO TITLE CASE ===============================================================

const KEEP_UPPERCASE = [
  '3D', 'AI', 'BMW', 'CEO', 'CNC', 'CTO', 'DIY', 'HQ', 'HVAC', 'IA', 'MCP', 'OS', 'PC', 'RAG',
  'RV', 'USB', 'VW',
];


function toTitleCase(value) {
  console.debug('[toTitleCase] called');

  return value.charAt(0).toUpperCase() + value.substring(1).toLowerCase();
}


function mustConvertUpperCase(value) {
  console.debug('[mustConvertUpperCase] called');

  return value.length > 1
    && value === value.toUpperCase()
    && KEEP_UPPERCASE.indexOf(value) === -1;
}


function convertUpperCaseWords(value) {
  console.debug('[convertUpperCaseWords] called');

  return value.replace(/\b[A-Z]+\b/g, match => {
    return mustConvertUpperCase(match) ? toTitleCase(match) : match;
  });
}


// MISC ============================================================================================

function getSpecialSite() {
  console.debug('[getSpecialSite] called');

  if (window.location.host.includes('aliexpress.com')) return 'ALIEXPRESS';
  if (window.location.host.includes('amazon.'))        return 'AMAZON';
  if (window.location.host.includes('github.com'))     return 'GITHUB';
  if (window.location.host.includes('ikea.com'))       return 'IKEA';
  if (window.location.host.includes('wikipedia.org'))  return 'WIKIPEDIA';
  if (window.location.host.includes('youtube.com'))    return 'YOUTUBE';
}


// Wait for the given time (`ms`) then executes the callback.
// Or return immediately a Promise if no callback provided.
function sleep(ms, callback) {
  console.debug('[sleep] called');

  const p = new Promise(resolve => setTimeout(resolve, ms));
  return callback ? p.then(callback) : p;
}


// AMAZON ==========================================================================================

const AMAZON_PRODUCT_ID_REGEXES = [
  /\/dp\/([A-Z0-9]+)/,
  /\/gp\/product\/([A-Z0-9]+)/,
];
const RE_AMAZON_PRODUCT_ID = /\/(dp|gp\/product)\/([A-Z0-9]+)/;
const RE_AMAZON_SEO_URL = /\/[^\/]+\/(dp|gp\/product)\/[A-Z0-9]+\//;


function amazon_getCleanUrl(location) {
  console.debug('[amazon_getCleanUrl] called');

  if (!location) location = window.location;

  const url = new URL(location.href);
  url.hash = '';
  url.search = '';

  const productId = amazon_getProductId();
  if (productId) url.pathname = `/dp/${productId}`;

  return url.toString();
}


function amazon_getProductId(location) {
  console.debug('[amazon_getProductId] called');

  if (!location) location = window.location;
  match = location.pathname.match(RE_AMAZON_PRODUCT_ID);
  return match ? match[2] : null;
}


// YOUTUBE =========================================================================================

const RE_YOUTUBE_VIDEO_ID = /\/(watch\?v=|shorts\/)([^&]+)/;


function youtube_getVideoUrl(location) {
  console.debug('[youtube_getVideoUrl] called');

  if (!location) location = window.location;

  const url = new URL('https://youtu.be/');

  match = location.pathname.match(RE_YOUTUBE_VIDEO_ID);
  if (match) {
    url.pathname = match[2];
  } else {
    const e = document.querySelector('ytd-watch-metadata');
    url.pathname = e.getAttribute('video-id').trim();
  }

  return url.toString();
}


function youtube_getChannelInfo() {
  console.debug('[youtube_getChannelInfo] called');

  const e = document.querySelector('#owner .ytd-channel-name a')
    || document.querySelector('#owner #attributed-channel-name a');
  return { name: e.textContent.trim(), url: e.href };
}


function youtube_getDate() {
  console.debug('[youtube_getDate] called');

  let e, value;
  try {
    e = document.querySelector('#info-strings yt-formatted-string.ytd-video-primary-info-renderer');
    value = e.textContent.replace('Premiered', '').trim();
  } catch {
    value = null;
  }

  if (!value) {
    e = document.querySelector('meta[itemprop="datePublished"]');
    value = e.getAttribute('content');
  }

  return value ? strToDate(value) : null;
}


function youtube_getDuration() {
  console.debug('[youtube_getDuration] called');

  const e = document.querySelector('ytd-player .ytp-time-duration');
  return e.textContent.trim();
}


function youtube_getTitle() {
  console.debug('[youtube_getTitle] called');

  const e = document.querySelector('ytd-watch-metadata #title h1 yt-formatted-string');
  const title = e.textContent.replace(/ +/g, s => ' '); // Remove multiple spaces.
  return title.trim();
}
