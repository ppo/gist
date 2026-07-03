// ==UserScript==
// @name         IMDb Watchlist Entry
// @description  Generate entry for my watchlist.
// @version      260703.01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://www.imdb.com/*
// @run-at       document-idle
// @require      https://raw.githubusercontent.com/ppo/gist/main/userscripts/_utils.js
// @downloadURL  https://raw.githubusercontent.com/ppo/gist/main/userscripts/imdb-watchlist-entry.js
// @homepageURL  https://github.com/ppo/gist/blob/main/userscripts/imdb-watchlist-entry.js
// @icon         data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAUFBQkGCQkJCQwTDg4MDg4ZEg4SEBcOEBAXEBcXEBQXFBQaFxMTFxoUFxgjGBwZHxoYIRgjGCMiIiQnKCMXJzUBCQkFCQkJDAkJEyEXDhoiHAwYKSIoGiIkIiIZLCIoISIUIyIaHx8aGhwYHCIaJCQjDhkkIRcvGRoXIiEnHxckKv/AABEIAEwATAMBIgACEQEDEQH/xACLAAEAAgMBAQAAAAAAAAAAAAAABggCAwcFARAAAQMDAwIDBgYDAAAAAAAAAQACAwQFEQYSIQcTMTayFDJBUXGRFSIjUnXCc3SxAQEAAgMBAQAAAAAAAAAAAAAAAwQBAgUGBxEAAQQBAgQEBwAAAAAAAAAAAAECAxExBBIFEyFhBiJBcSQyM1JygcH/2gAMAwEAAhEDEQA/AOzIiL5WeiCIiAIiIAiIgCIiAIi4B1J6m3TTV3joaQRGN0UR/OwuOXkhWNLw2XWS8mGt1K4jknbE3c7GDv6KuHUPqvdtOXWSipREYxHERvYScvGT8Qt+purFwt1nsdbTiMzVjJDIC3LRs44GVbb4W1jmwuSqf8vXtfUjXiESK9F9MliEVcrf1Vu1Rpu43Zwi71PUwsaNh2YfjORlRkdYNU+xfiPYhNP3dnc7fG7xx763b4R1jlclt6Lys+vYwvEokrONxbNFwO99Vq1mm7feaSNjJZpzG9jhvYNoOcLpegb7Pf7PSV1Vt7ku/O0bW8OIVWbguogh58lVuWHvaEjdUx7tjc1uJiiIqZKFT3rh5kg/wQeoq4SqD1uic7UcJAJAgg9RXa4Cvxy/i4qaz6P7Q0dSrcLnq5lKc/qsp/QoLRukvcUFBIMC309Y4H7yepdX1NGTr2gOON9J6V4dhsZpbjq/LeKekrgPh75wF3odYjNLEi5RjHt91tv9Kborkd3VUU8yzeSL3/vU39Vsj8hy/wAkPSlnieNE3pu05NbTf1UbF/I08bKKd+91X3DJjjGMAKVI1e6Tb6TI9fZEaY3UiX9tEkuXkS2fyE3/ABy8u60VTbbDY7jFWTZlfMBEHbWRbCSCzCkl/tVTRaHtMU0Za99a92wjnDg/CjF9u3tNgsdsEEokhfM7JZhrw8kDZ81iFyvrZ1bzX3jHmD0rOdqFxdGV8txs9sqZzuklgjLnfMqSqLaIo5aKyWuCZu17KeMOafEKUrxGoRvPl2YtaOsy9jbyFi6NruS0H6gFZIorNjHttJztGfnhO23ngc+PHiskS1Bh2meG0fYJ2WftH2CzRNyg+OaHeIB+oysDCw4y0Hb4cDj6LYiWoCIiAIiIAiIgCIiAIiIAiIgP/9k=
// ==/UserScript==
// Userscript Manager: Violentmonkey


// MAIN ============================================================================================

function main() {
  console.debug(`[${GM_info.script.name} v${GM_info.script.version}][main] called`);

  const url = getCleanUrl();
  const title = document.querySelector('h1')?.textContent.trim();
  const year = document.querySelector('h1+ul a[href*="releaseinfo"]')?.textContent.trim();
  const slug = slugify(`${title}-${year}`);
  const result = `{ slug: '${slug}', imdb: '${url}' },`;

  console.debug(`[${GM_info.script.name}] result:`, result);
  copyToClipboard(result);
}


(function() { main(); })();
