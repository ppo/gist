// ==UserScript==
// @name         Gmail Clean Print
// @description  Remove the email headers to print only the body part.
// @version      260125.01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        *://mail.google.com/mail/*&view=pt&*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @downloadURL  https://raw.githubusercontent.com/ppo/gist/main/userscripts/gmail-clean-print.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IB2cksfwAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+oBGRAEH544yGAAAAUMSURBVGje7ZhbbFRVFIb/tfY5cxFCpQ3S6ECFoQaDxsShBAkhjkOlGqDRpMbEy5MSL2hMTIwUfSCmxicfENSAD8ZIMCG1kiZeYqdtolGw7YsPkhTqJZVAW4JQysyZmb338mGmtmXa0plOiSTzP82cOXP2/6/9rX32OUBZZZVVVlnzEF17oKumpjqo8KQFIgR4IOpwb636cn1fX+ZGGpNeuGaUHyfQVgsKEKHPu6q/WLwd52cM8GO45gFH8LmPabVI7kIAMiLfGbYvbz4zOHAjzCfj/rCPzUF2sA2UM8GAScvvVtPTvnr9c16Ak2tvr9Ip96SfKZwad5+TnwgZkb8N0e7NA38eX0jzme9VIyk6oFyEdGrqb44P0GkMJBN645KduIBsrqx02t0ZmMY8AKREwEQhR6T1TN09LdLQ4C+18f41Df4rr69uIUWtivPNZz0CTgDhWxa5O8aP/RdAIOtmG0CLwABqScBt/sdcbB+KRsKlMj8UjYSX3nGp3R0NNINEaT37+cbadXkBaNLnGRsLQNJa+IjrXcXdI7ENjfM1PxLb0Ogq7vYr1CeMxTQA5IlpwisX1WTWgkAhhrSOxOpa+hvWFIxUf8Ma/0isroUhrQQKecYWVYCJJFYX1mwisIAKKG6uyiwtCKmhaCRclVnaHlDcbAGVmUvZJzczbH6A4cq7wGJAMvdKCICksfDxOFKRxusjE2l0FXf7mOuTxkIKqrYAEAzoivwAHzz2Fdo3vQ3DLpTNFIkUz4jUBDLcSqBQ0tqCq54G48DYfXjq0oP5AbTyIR55Hp8+8gkuVNwJV3vFI6WnIjUUjYSr9DyQIYO/7GK8dnkTDifWIjOpdSf1gIVPC/pXbMGhHUfxa/hRuNorCimXuN5h7h6O1W0fjtVtd5i7XSoOGYcM4qkQdl3agp/SyxEgPWXlca79k6s9jC5ajiP1BzF42yFs7d0P13gw7M55YM9aOEQhsXIcAIiJvSKQ8aBwaGwdPkvWwoDgJwNATb8KTTloNQBB5/2vFI2UFgETmAmsi0HGTCCTDSSzL6N521QRuDo5DVJSEFJS4JrukEFnKoRdl8eRMflb5rkEyEfqAL7e+KZYxw+XSr+Jc5mgobB/7F55Y3QDhm0gh8wcb2SznpS7ycUjr8o3tc/uQ8Y7FVRcMvNBxSBrTh1ZVr3vcHKtzIZMUQHGkfLbDL+/ene8Inkl6hlpCzKD5zEbTECQGZ6RtopE4qGWWNW3QUhBlyy4jCsw5tDJP4a6KmuaPLF7GPB8RaTwZXdkXkLsnq7Kmibq+e38ios6WOh1nGKr98SxYwbAe+dj63t9gg+DimuTc9yQBRUjY+zpNOSl6nhvB9BT/CzOl9/qeG/HmKioZ0xb4DpIMQEBZnjGtI2JimbNz08l6cSVnSfOdlWuakrlkHKnSeHmkEmJ3dNVuappZeeJs6UY2ynVSjKO1MjWuh628tFkpIKKkTb2tCW8uKyjJz4fZBZkBiZrWUdP/GoOqaBiBFUWmauiolnzpVXJA0xBSsvelJa9pURmwRCaAal3s99+WbDXMIybXOUA/5sAQqCbxfRkrxOPlCSDRP//DMQMWAzmrUJpS0fdVOI5x7/objvD4x8xQ1KZBcPOKmLHVRA7/VaaFMN4mVPQcjQvwA9vLT738DuJbUanX4DYWmt1nlEiBwYYWqgAytgha02rnSYAOWRJ29Ow+uO+Z46fQ1lllVVWWWUB+BdeulDdAVQFuwAAAABJRU5ErkJggg==
// ==/UserScript==
// Userscript Manager: Violentmonkey


// USAGE:
//   1. Gmail › Open email › Print › Cancel
//   2. Violentmonkey menu › "this script"


function main() {
  console.debug(`[${GM_info.script.name}][main] called`);

  [
    'body > div > table',
    'body > div > hr',
    'body > div > div > table:nth-child(1)',
    'body > div > div > hr',
    'body > div > div > table.message > tbody > tr:nth-child(1)',
    'body > div > div > table.message > tbody > tr:nth-child(2)',
  ].reverse().forEach((s) => {
    document.querySelector(s).remove();
  });

  window.print();
}


GM_registerMenuCommand(GM_info.script.name, main);
