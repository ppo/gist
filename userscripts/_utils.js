_VERSION = '261109.01';
_DEBUG_PREFIX = `[Utils v${_VERSION}]`

console.debug(`${_DEBUG_PREFIX} Loaded`);


// Global variables;
var DEBUG = false;
var KNOWN_SITE;
var KNOWN_SITE_CONFIG = {};


// Features for known sites.
const F_URL_SEARCH = 2**0;  // Remove URL search params.
const F_DATE       = 2**1;  // Page contains date.
const F_PRICE      = 2**2;  // Page contains price.
const F_PREFIX     = 2**3;  // Include site name as prefix.

const KNOWN_SITES_CONFIG = {
  ALIEXPRESS: { name: 'AliExpress', host: 'aliexpress.com',          prefix: true, features: F_PRICE },
  AMAZON:     { name: 'Amazon',     host: 'amazon.',                 prefix: true, features: F_PRICE },
  DECATHLON:  { name: 'Decathlon',  host: 'decathlon.',              prefix: true, features: F_PRICE },
  GITHUB:     { name: 'GitHub',     host: 'github.com',              prefix: null, features: 0       },
  IKEA:       { name: 'IKEA',       host: 'ikea.com',                prefix: true, features: F_PRICE },
  IMDB:       { name: 'IMDb',       host: 'imdb.com',                prefix: null, features: 0       },
  PUBMED:     { name: 'PubMed',     host: 'pubmed.ncbi.nlm.nih.gov', prefix: true, features: F_DATE  },
  WIKIPEDIA:  { name: 'Wikipedia',  host: 'wikipedia.org',           prefix: '⍵',  features: 0       },
  YOUTUBE:    { name: 'YouTube',    host: 'youtube.com',             prefix: null, features: F_DATE  },
}

const KEEP_UPPERCASE = [
  '3D', 'AI', 'BMW', 'CEO', 'CNC', 'CTO', 'DCF', 'DIY', 'GPS', 'GPX', 'HQ', 'HVAC', 'IA', 'LWB',
  'MCP', 'MYOG', 'OS', 'PC', 'RAG', 'RV', 'SWB', 'UL', 'USB', 'VW',
];

const AMAZON_PRODUCT_ID_REGEXES = [
  /\/dp\/([A-Z0-9]+)/,
  /\/gp\/product\/([A-Z0-9]+)/,
];
const RE_AMAZON_PRODUCT_ID = /\/(dp|gp\/product)\/([A-Z0-9]+)/;
const RE_AMAZON_SEO_URL = /\/[^\/]+\/(dp|gp\/product)\/[A-Z0-9]+\//;

const IMDB_UNCLEAN_PARAM = 'ref_';
const RE_IMDB_MOVIE_ID = /\/title\/([^\/]+)/;

const RE_YOUTUBE_VIDEO_ID = /\/(watch\?v=|shorts\/)([^&]+)/;

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


// GENERAL =========================================================================================

function isArray(value) {
  return Array.isArray(value);
}


function isObject(value) {
  return value && value.constructor.name === 'Object';
}


function setDebug(value) {
  DEBUG = value === undefined ? !DEBUG : Boolean(value);
}


function debug(origin, label=undefined, args=undefined) {
  if (!DEBUG) return;

  if (label === undefined) label = 'called';
  if (label === null) label = '';
  if (label && args) label += ':';
  const message = `[${GM_info.script.name} v${GM_info.script.version}][${origin}] ${label || ''}`.trim();

  const displayType = args
    ? (isObject(args)
      ? (Object.keys(args).length === 1
        ? 'single-key-value'
        : 'grouped-key-value')
      : 'single-value')
    : 'no-args';

  switch (displayType) {
    case 'single-key-value':
      const [key, value] = Object.entries(args)[0];
      console.debug(`${message} ${key} =`, value);
      break;
    case 'grouped-key-value':
      console.group(message);
      for (const [key, value] of Object.entries(args)) {
        console.debug(`${key} =`, value);
      }
      console.groupEnd();
      break;
    case 'single-value':
      console.debug(message, args);
      break;
    case 'no-args':
      console.debug(message);
      break;
  }
}


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
  debug('copyToClipboard', undefined, {value, message, timeout});

  try {
    GM_setClipboard(value);
  } catch (error) {
    debug('copyToClipboard', '"GM_setClipboard()" not availabe, use fallback code');

    const e = document.createElement('textarea');
    e.value = value;
    document.body.appendChild(e);
    e.select();

    document.execCommand('copy');
    document.body.removeChild(e);
  }

  if (message) {
    let messageText = '';
    let messageHtml = null;

    if (message === true) {
      messageHtml = document.createElement('div');

      messageText = 'Value copied to clipboard:';
      const heading = document.createElement('p');
      heading.style = 'font-weight: bold; margin-bottom: 1rem';
      heading.textContent = messageText;
      messageHtml.appendChild(heading);

      messageText += `\n\n${value}`;
      const pre = document.createElement('pre');
      pre.textContent = value;
      messageHtml.appendChild(pre);

      // messageHtml = messageHtml.innerHTML;
    } else {
      messageText = message;
      debug('copyToClipboard', 'message !== true');
    }

    debug('copyToClipboard', 'calling snackbar()');
    snackbar(messageText, messageHtml, timeout);
  } else {
    debug('copyToClipboard', 'no message');
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
  debug('downloadFile', undefined, {content, filename, type});

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


function getSelectedText() {
  debug('getSelectedText');
  const selectedText = window.getSelection().toString().trim() || null;

  debug('getSelectedText', 'return', selectedText);
  return selectedText;
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
  debug('createIcs', undefined, {data, prodId});

  const ESCAPE_MAP = [
    [ /\\/g, '\\\\' ],
    [ /;/g,  '\\;'  ],
    [ /,/g,  '\\,'  ],
    [ /\n/g, '\n'   ],
    [ /\r/g, ''     ],
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
  debug('changeTimezone', undefined, {value, timezone});

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
    debug('changeTimezone', 'ERROR:', error);
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
  debug('formatDateTime', undefined, {format, value, timezone});

  if (!value) value = new Date();

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
  const formatted = actualFormat.split('').map(char => formatMap[char] || char).join('');

  return formatted;
}


function formatDuration(duration) {
  debug('formatDuration', undefined, duration);

  const hours = String(Math.floor(duration / 3600)).padStart(2, '0');
  const minutes = String(Math.floor(duration % 3600 / 60)).padStart(2, '0');
  const seconds = String(duration % 60).padStart(2, '0');

  const formatted = (hours === '00' ? '' : `${hours}:`) + `${minutes}:${seconds}`;

  return formatted;
}


/**
 * Returns the difference to UTC without colon between hours and minutes.
 *
 * @param {Date|string} [value] - Time or date/time value. Default: `now`.
 * @returns {string} Timezone offset string as `sHHMM` (s = sign = +/-).
 * @throws {Error} When invalid time is provided.
 */
function getTimezoneOffset(value) {
  debug('getTimezoneOffset', undefined, value);

  // Initialize date
  const date = strToDate(value, true);

  // Difference between value in UTC and local timezone.
  // Positive/negative means local is behind/ahead UTC. Ex: -600 = UTC+10.
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const offsetMinutes = String(absOffset % 60).padStart(2, '0');

  const timezoneOffset = `${sign}${offsetHours}${offsetMinutes}`;

  return timezoneOffset;
}


// Today as YYMMDD.
function getToday() {
  return new Date().toISOString().replaceAll('-', '').substr(2, 6);
}


function strToDate(value, withTime=false) {
  debug('strToDate', undefined, {value, withTime});

  const date = value ? new Date(value) : new Date();
  if (withTime && isNaN(date.getTime())) {
    throw new Error(`Value doesn't include a time: ${value}`);
  }

  return date;
}


// DOM =============================================================================================

// DEPRECATED: Use `GM_addStyle()` – requires: `@grant GM_addStyle`
function createCssStyle(css) {
  debug('createCssStyle', undefined, css);

  let style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  document.getElementsByTagName('head')[0].appendChild(style);
}


// Find the first element matching a series of selectors, located under a series of namespaces.
function findFirstElement(selectors, namespaces) {
  debug('findFirstElement', undefined, {selectors, namespaces});

  for (let selector of selectors) {
    for (let namespace of namespaces) {
      let e = document.querySelector(`${namespace} ${selector}`);
      if (e) return e;
    }
  }
}


function hideElem(elem) {
  // debug('hideElem', undefined, elem);

  if (elem) elem.style.display = 'none';
}


function hide(selector) {
  // debug('hide', undefined, selector);

  hideElem(document.querySelector(selector));
}


function hideAll(selectors) {
  // debug('hideAll', undefined, selectors);

  for (let selector of selectors) {
    document.querySelectorAll(selector).forEach(e => {
      hideElem(e);
    });
  }
}


// Usage: waitForElement('.selector', e => { … });
function waitForElement(selector, callback, timeout=2000) {
  debug('waitForElement', undefined, {selector, callback, timeout});

  const elem = document.querySelector(selector);
  if (elem) {
    callback(elem);
  } else {
    setTimeout(() => { waitForElement(selector, callback, timeout); }, timeout);
  }
}


// FORMATTERS ======================================================================================

function formatInfo(args) {
  // debug('formatInfo', undefined, args);

  args = args.filter((a) => a);  // Remove falsy items
  const info = args.length > 0 ? ` (${args.join(', ')})` : '';

  // debug('formatInfo', 'return', info);
  return info;
}


function formatPrice(price) {
  // debug('formatPrice', undefined, price);

  if (price) {
    price = price
      .replaceAll(',', '.')
      .replaceAll('&nbsp;', '')
      .replace(/\s/, '')
      .trim();

    // Force the symbol at the end.
    const m = price.match(/[$€£]/);
    if (m) price = `${price.replace(m[0], '')}${m[0]}`;

    // Prepend the date.
    price = `${price}@${getToday()}`;
  }

  // debug('formatPrice', 'return', price);
  return price;
}


// GETTERS =========================================================================================

function getCleanUrl(urlStr=undefined, search=false) {
  debug('getCleanUrl', undefined, {urlStr, search});

  let cleanUrl;
  urlStr = initUrl(urlStr);
  const url = new URL(urlStr);
  const params = new URLSearchParams(url.search);

  url.hash = '';
  if (search) url.search = '';
  if (KNOWN_SITE_CONFIG.features & F_URL_SEARCH) url.search = '';

  switch (KNOWN_SITE) {
    case 'AMAZON':  cleanUrl = amazon_getCleanUrl(); break;
    case 'IMDB':    params.delete(IMDB_UNCLEAN_PARAM); break;
    case 'YOUTUBE': cleanUrl = youtube_getVideoData().url; break;
  }

  if (!search && url.search) url.search = params.toString();
  if (!cleanUrl) cleanUrl = url.toString();

  // debug('getCleanUrl', 'return', cleanUrl);
  return cleanUrl;
}



function getTld() {
  // debug('getTld');

  const tld = window.location.origin.split('.').pop();

  // debug('getTld', 'return', tld);
  return tld;
}


function getTldSuffix(exclude='be') {
  // debug('getTldTitle', undefined, exclude);

  let tld = getTld();
  if (tld === exclude) tld = '';
  if (tld) tld = ` ${tld.toLocaleUpperCase()}`;

  // debug('getTldTitle', 'return', tld);
  return tld;
}


function initUrl(url) {
  // debug('initUrl', undefined, url);

  return url || window.location.href;
}


// TEXT ============================================================================================

// Clean filename string.
function cleanFilename(value) {
  // debug('cleanFilename', undefined, value);

  const REPLACEMENTS = [
    [ /[‘’]/g,     "'"   ],  // Smart single quotes
    [ /[“”«»<>]/g, '"'   ],  // Smart double quotes, guillemets, <>
    [ /[\/\\–—]/g, '-'   ],  // Slashes (/ & \) and long dashes (–, —)
    [ / ?: ?/g,    ' - ' ],  // Colon (:)
    [ /[\x00]/g,   ''    ],  // NUL – just strip
    [ /[""]/g,     "'"   ],  // Double quotes as single quotes
  ];
  return replaceMap(value, REPLACEMENTS);
}


function cleanString(str) {
  // debug('cleanString', undefined, str);

  return str
    .replace(/ +/g, ' ')  // Remove multiple spaces.
    .replace(/ +([:?!])/g, '$1')  // No space before punctuations (rule in French).
    .replace(/([0-9]) ([$€£])/g, '$1$2')  // No space between amount and currency symbol.
    .trim();
}


function cleanUrl(url) {
  // debug('cleanUrl', 'called:', url);

  return url.replace('http://', 'https://');
}


// Convert HTML to Markdown.
// ⚠️ Userscript must require Turndown before this library:
//   @require https://cdn.jsdelivr.net/npm/turndown/dist/turndown.min.js
function html2markdown(html) {
  debug('html2markdown', undefined, html);

  const td = new TurndownService({
    headingStyle: 'atx',       // `#` for headings (default: setext)
    emDelimiter: '_',          // `_` for italic (default)
    bulletListMarker: '-',     // `-` for bullet lists (default)
    codeBlockStyle: 'fenced',  // ``` (default: indented)
  });

  // Fix headings
  td.addRule('headings', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement(content, node) {
      content = content.trim();
      if (!content) return '';
      const level = parseInt(node.nodeName[1]);
      return `\n\n${'#'.repeat(level)} ${content}\n`;
    },
  });

  // Fix links
  td.addRule('link', {
    filter: 'a',
    replacement(content, node) {
      const href = node.getAttribute('href');
      if (!href) return content;
      const title = node.getAttribute('title');
      return title
        ? `[${content}](${href} "${title}")`
        : `[${content}](${href})`;
    },
  });

  // Fix lists
  td.addRule('listItem', {
    filter: 'li',
    replacement(content, node) {
      const clean = content.trim().replace(/\n+/g, '\n  ');
      const isOrdered = node.parentNode.nodeName === 'OL';
      if (isOrdered) {
        const index = Array.from(node.parentNode.children).indexOf(node) + 1;
        return `${index}. ${clean}\n`;
      }
      return `- ${clean}\n`;
    },
  });

  // Fix
  td.addRule('paragraphInListItem', {
    filter(node) { return node.nodeName === 'P' && node.parentNode.nodeName === 'LI'; },
    replacement(content) { return content; },
  });

  const REPLACEMENTS = [
    [ /^([-*+]|\d+\.)\s{2,}/gm, '$1 '   ],  // Remove alignment spaces after list symbol
    [ /\n#/g,                   '\n\n#' ],  // Headings: Add extra line before
    [ /\n(\s*)\[/g,             ' ['    ],  // Links: Remove new line before
    [ /\]\(([^)]+)\)\n(\s*)/g,  ']($1)' ],  // Links: Remove new line after
  ];

  return replaceMap(td.turndown(html), REPLACEMENTS);
}


function html2text(html) {
  // debug('html2text', undefined, html);

  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = (doc.body.textContent || '').replace(/\s+/g, ' ').trim();

  debug('html2text', 'return', text);
  return text;
}


/**
 * Apply multiple string replacements using a map of search-replace pairs.
 *
 * @param {string} text - Text to process.
 * @param {Array} replacements - Array of [ [search, replace]… ].
 * @returns {string} Text with all replacements applied.
 */
function replaceMap(text, replacements) {
  // debug('replaceMap', undefined, {text, replacements});

  let result = '';
  if (text) {
    result = replacements.reduce(
      (t, [search, replace]) => t.replaceAll(search, replace),
      text
    );
  }

  // debug('replaceMap', 'return', result);
  return result;
}


// Generate a slug based on the given value.
function slugify() {
  debug('slugify', undefined, arguments);

  const values = [];
  for (let arg of arguments) {
    if (isObject(arg)) arg = Object.values(arg);
    if (isArray(arg)) arg = arg.join('-');

    values.push(arg);
  }

  return values.join('-')
    .toString()
    .normalize('NFKD').replace(/\p{Diacritic}/gu, '')  // Normalize
    .toLowerCase()
    .trim()
    .replace(/[\s']+/g, '-')   // Replace whitespaces and ' with -
    .replace(/&/g, '-and-')    // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')  // Remove all non-word chars except -
    .replace(/\-\-+/g, '-');   // Replace multiple - with single -
}


// Convert value in Title Case.
// `force` lowercase each word remainder.
function toTitleCase(value, force=false) {
  // debug('toTitleCase', undefined, {value, force});

  if (!value) return value;
  if (force) value = value.toLowerCase();

  value = value.toLowerCase().split(' ').map(word => (
      word.charAt(0).toUpperCase() + word.slice(1)
    )).join(' ');

  // debug('toTitleCase', 'return', value);
  return value;
}


// ALL UPPERCASE WORDS TO TITLE CASE ---------------------------------------------------------------

function mustConvertUpperCase(value) {
  // debug('mustConvertUpperCase', undefined, value);

  return value.length > 1
    && value === value.toUpperCase()
    && KEEP_UPPERCASE.indexOf(value) === -1;
}


function convertUpperCaseWords(value) {
  // debug('convertUpperCaseWords', undefined, value);

  return value.replace(/\b[A-Z]+\b/g, match => {
    return mustConvertUpperCase(match) ? toTitleCase(match) : match;
  });
}


// UI ==============================================================================================

// Display a temporary message – or fixed until clicked if `!timeout`.
function snackbar(messageText, messageHtml, timeout=2000) {
  debug('snackbar', undefined, {messageText, messageHtml, timeout});

  // if (KNOWN_SITE === 'YOUTUBE') {
  //   alert(messageText);
  //   return;
  // }

  // try {
  //   // Fix for error "Requires 'TrustedHTML' assignment"
  //   // Source: https://github.com/Tampermonkey/tampermonkey/issues/1334#issuecomment-927277844
  //   window.trustedTypes.createPolicy('default', { createHTML: (string, sink) => string });
  // } catch (error) {
  //   console.error(`${_DEBUG_PREFIX}[snackbar] createPolicy()`, error);
  // }

  try {
    const elem = document.createElement('div');
    if (messageHtml) {
      elem.appendChild(messageHtml);
    } else {
      elem.innerText = messageText;
    }

    Object.assign(elem.style, SNACKBAR_CSS);
    document.body.appendChild(elem);
    // debug('snackbar', 'DOM updated', elem);

    const destroy = () => { document.body.removeChild(elem); };
    elem.addEventListener('click', destroy);
    if (timeout) setTimeout(destroy, timeout);
  } catch (error) {
    console.error(`${_DEBUG_PREFIX}[snackbar] Cannot create`, error);
  }
}


// MISC ============================================================================================

// Wait for the given time (`ms`) then executes the callback.
// Or return immediately a Promise if no callback provided.
function sleep(ms, callback) {
  debug('sleep', undefined, ms);

  const p = new Promise(resolve => setTimeout(resolve, ms));
  return callback ? p.then(callback) : p;
}


// KNOWN SITES =====================================================================================

// Detect if it's a know site.
function initKnownSite() {
  debug('initKnownSite');

  for (const [key, config] of Object.entries(KNOWN_SITES_CONFIG)) {
    if (window.location.host.includes(config.host)) {
      KNOWN_SITE = key;
      KNOWN_SITE_CONFIG = config;
      break;
    }
  }

  debug('initKnownSite', 'return', {KNOWN_SITE, KNOWN_SITE_CONFIG});
  return KNOWN_SITE;
}


// AMAZON ------------------------------------------------------------------------------------------

function amazon_getCleanUrl(urlStr) {
  debug('amazon_getCleanUrl', undefined, urlStr);

  urlStr = initUrl(urlStr);
  const url = new URL(urlStr);
  url.hash = '';
  url.search = '';

  const productId = amazon_getProductId();
  if (productId) url.pathname = `/dp/${productId}`;

  const cleanUrl = url.toString();

  // debug('amazon_getCleanUrl', 'return', cleanUrl);
  return cleanUrl;
}


function amazon_getProductId(urlStr) {
  debug('amazon_getProductId', undefined, urlStr);

  urlStr = initUrl(urlStr);
  const url = new URL(urlStr);

  match = url.pathname.match(RE_AMAZON_PRODUCT_ID);
  const productId = match ? match[2] : null;

  // debug('amazon_getProductId', 'return', productId);
  return productId;
}


// IMDB --------------------------------------------------------------------------------------------

function imdb_getMovieData() {
  debug('imdb_getMovieData');

  const urlStr = initUrl();
  const match = urlStr.match(RE_IMDB_MOVIE_ID);
  const movieId = match ? match[1] : null;

  const header = document.querySelector('section.ipc-page-section h1').parentElement;
  const mainTitle = header.querySelector('h1')?.textContent.trim();
  const originalTitle = header.querySelector('h1 + div')?.textContent.replace('Original title: ', '').trim();
  const title = originalTitle || mainTitle;
  const titleEn = originalTitle ? mainTitle : null;
  const year = document.querySelector('ul a[href*="/releaseinfo/"]')?.textContent.trim();

  const data = {
    id: movieId,
    url: getCleanUrl(urlStr),
    title,
    titleEn,
    year,
    fullTitle: `${title} (${year})`,
  };

  debug('imdb_getMovieData', 'return', data);
  return data;
}


function imdb_isMoviePage(url) {
  // debug('imdb_isMoviePage', undefined, url);

  urlStr = initUrl(url);
  return RE_IMDB_MOVIE_ID.test(urlStr);
}


// YOUTUBE -----------------------------------------------------------------------------------------

function youtube_getShortVideoUrl(videoId) {
  // debug('youtube_getShortVideoUrl', undefined, videoId);

  return `https://youtu.be/${videoId}`;
}


function youtube_toShortVideoUrl(urlStr) {
  // debug('youtube_toShortVideoUrl', undefined, urlStr);

  urlStr = initUrl(urlStr);
  let shortUrl = null;

  const match = urlStr.match(RE_YOUTUBE_VIDEO_ID);
  if (match) {
    const videoId = match[2];
    shortUrl = youtube_getShortVideoUrl(videoId);
  } else {
    console.error(`${_DEBUG_PREFIX}[youtube_toShortVideoUrl] Not a video URL`, urlStr);
  }

  debug('youtube_toShortVideoUrl', 'return', shortUrl);
  return shortUrl;
}


function youtube_cleanDescription(description) {
  // debug('youtube_cleanDescription', undefined, description);

  return description.trim();
}


function youtube_cleanTitle(title) {
  // debug('youtube_cleanTitle', undefined, title);

  title = cleanString(title);
  title = convertUpperCaseWords(title);
  return title;
}


function youtube_getVideo() {
  debug('youtube_getVideo');

  const player = document.getElementById('movie_player');
  if (!player) {
    console.error(`${_DEBUG_PREFIX}[youtube_getVideo] No video player`, player);
    return;
  }

  const data = player.getPlayerResponse() || { videoDetails: player.getVideoData() };
  debug('youtube_getVideo', null, {data});

  const video = {
    player,
    data,
    videoId: data.videoDetails.videoId || data.videoDetails.video_id,
    videoDetails: data.videoDetails,  // Alternative: `player.getVideoData()`.
    microformat: data.microformat?.playerMicroformatRenderer || {},
    thumbnails: data.microformat?.thumbnail?.thumbnails || [],
  };

  debug('youtube_getVideo', 'return', video);
  return video;
}


function youtube_getVideoData() {
  debug('youtube_getVideoData');

  const video = youtube_getVideo();
  if (!video) {
    debug('youtube_getVideoData', 'youtube_getVideo()', video);
    return;
  }

  const data = {
    id: video.videoId,
    url: youtube_getShortVideoUrl(video.videoId),
    title: youtube_cleanTitle(video.videoDetails.title),
    description: youtube_cleanDescription(video.videoDetails.shortDescription),
    date: new Date(video.microformat.publishDate),
    channel: {
      name: video.videoDetails.author,
      url: cleanUrl(video.microformat.ownerProfileUrl),
    },
    duration: Number(video.videoDetails.lengthSeconds),  // In seconds.
    currentTime: Math.floor(video.player.getCurrentTime()),  // In seconds.
      // Alternative: `document.querySelector('video').currentTime`.
    // thumbnail: video.thumbnails ? video.thumbnails[0].url : null,  // Format: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`.
    humanized: {},  // Defined below.
  };

  data.humanized.date = formatDateTime('compact-date', data.date) || '?';
  data.humanized.duration = formatDuration(data.duration);

  debug('youtube_getVideoData', 'return', data);
  return data;
}


function youtube_isVideoPage(url) {
  // debug('youtube_isVideoPage', undefined, url);

  urlStr = initUrl(url);
  return RE_YOUTUBE_VIDEO_ID.test(urlStr);
}


// COMMON INITIALIZATION ===========================================================================

initKnownSite();
