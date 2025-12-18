// Shared helpers for userscripts.

/**
 * Converts a date to a different timezone, returning a new Date object
 * where the local time represents the time in the target timezone
 * @param {Date|string} value - Source date value
 * @param {string} timezone - Target timezone ('UTC', 'local', or IANA timezone like 'Europe/Brussels')
 * @returns {Date} New Date object with converted timezone
 * @throws {Error} When invalid date or unsupported timezone is provided
 * @updated 250604
 * @example
 * switchTimezone(new Date(), 'UTC') // Convert to UTC
 * switchTimezone('2025-06-04T14:30:00', 'Europe/Brussels') // Convert to Brussels time
 * switchTimezone(new Date(), 'local') // Keep as local time (no-op)
 */
function changeTimezone(value, timezone) {
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
     date.getUTCMilliseconds()
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
     hour12: false
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
     parseInt(partsMap.second)
   );
 } catch (error) {
   throw new Error(`Unsupported timezone: ${timezone}`);
 }
}


/**
 * Copy the given value to the clipboard.
 * @param {string} value - The value to copy.
 * @param {bool|string} message - Display a snackbar message. `true` = use `value`.
 * @param {integer} timeout - Display duration of the snackbar.
*/
function copyToClipboard(value, message=true, timeout=undefined) {
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


/**
 * Creates an ICS file content from event data.
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


// DEPRECATED, see `formatDateTime`
function dateFormat(value) {
  // Format a date (Date or string) as YYMMDD.
  // _utils.js / version: 240126-02
  if (!value) return;
  const d = new Date(value);
  return d.toISOString().replace(/^(\d{2})(\d{2})-(\d{2})-(\d{2}).*/, '$2$3$4');
}


/**
 * Triggers download of a file in the browser.
 * version: 250604
 * @param {string} content - File content
 * @param {string} filename - Filename with extension
 * @param {string} [type] - MIME type (defaults to 'text/plain')
 */
function downloadFile(content, filename, type='text/plain') {
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


function findFirstElement(selectors, namespaces) {
  // Find the first element matching a series of selectors, located under a series of namespaces.
  // _utils.js / version: 240126-01
  for (let selector of selectors) {
    for (let namespace of namespaces) {
      let e = document.querySelector(`${namespace} ${selector}`);
      if (e) return e;
    }
  }
}


/**
 * Formats a date/time value, according to PHP `DateTime::format` conventions.
 * @param {string} format - Format string or predefined format name.
 * @param {Date|string} [value] - Date, time, or date/time value. Default: `now`.
 * @param {string} [timezone] - Target timezone ('UTC', 'local', or IANA timezone).
 * @returns {string} Formatted date/time string.
 * @throws {Error} When invalid date is provided.
 * @see https://www.php.net/manual/en/datetime.format.php
 * @updated 250604
 */
function formatDateTime(format, value, timezone) {
  const predefined = {
    'date':     'Y-m-d',
    'time':     'H:i:s',
    'datetime': 'Y-m-d H:i:s',
    'iso':      'Y-m-dTH:i:sO',
    'ics':      'YmdTHis',    // For ICS calendar file
    'ics-utc':  'YmdTHisZ',   // For ICS calendar file
    'ics-tz':   'O:YmdTHis',  // For ICS calendar file
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
 * @param {Date|string} [value] - Time or date/time value. Default: `now`.
 * @returns {string} Timezone offset string as `sHHMM` (s = sign = +/-).
 * @throws {Error} When invalid time is provided.
 * @updated 250604
 */
function getTimezoneOffset(value) {
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


/**
 * Applies multiple string replacements using a map of pattern-replacement pairs.
 * @param {string} text - Text to process.
 * @param {Array} replacements - Flat array of [pattern, replacement, …].
 * @returns {string} Text with all replacements applied.
 */
function replaceMap(text, replacements) {
  if (!text) return '';

  let result = text;
  for (let i = 0; i < replacements.length; i += 2) {
    const pattern = replacements[i];
    const replacement = replacements[i + 1];
    result = result.replace(pattern, replacement);
  }

  return result;
}


function sleep(ms, callback) {
  // Wait for the given time (`ms`) then executes the callback.
  // Or return immediately a Promise if no callback provided.
  // _utils.js / version: 240126-01
  const p = new Promise(resolve => setTimeout(resolve, ms));
  return callback ? p.then(callback) : p;
}


function slugify(value) {
  // Generate a slug based on the given value.
  // _utils.js / version: 250514-01
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/&/g, '-and-')    // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')  // Remove all non-word chars except -
    .replace(/\-\-+/g, '-');   // Replace multiple - with single -
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


function strToDate(value, withTime=false) {
  const date = value ? new Date(value) : new Date();
  if (withTime && isNaN(date.getTime())) {
    throw new Error(`Value doesn't include a time: ${value}`);
  }
  return date;
}


function waitForElement(selector, callback, timeout=2000) {
  // Usage: waitForElement('.selector', e => { … });

  const elem = document.querySelector(selector);
  if (elem) {
    callback(elem);
  } else {
    setTimeout(() => { waitForElement(selector, callback, timeout); }, timeout);
  }
}
