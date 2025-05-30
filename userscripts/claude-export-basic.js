// ==UserScript==
// @name         Claude Export: Basic
// @description  Export a chat
// @version      250530-01
// @namespace    ppo
// @author       Pascal Polleunus <https://pascal.polleunus.be>
// @match        https://claude.ai/chat/*
// @run-at       context-menu
// ==/UserScript==


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


// HELPERS =========================================================================================

// Extract conversation messages
function extractMessages() {
    const messages = [];

    // Find all message containers
    const messageContainers = document.querySelectorAll('[data-test-render-count]');

    messageContainers.forEach(container => {
      // Check for user message
      const userMessage = container.querySelector('[data-testid="user-message"]');
      if (userMessage) {
        const text = userMessage.textContent.trim();
        if (text) {
          messages.push({ type: 'user', content: text });
        }
        return;
      }

      // Check for Claude message
      const claudeMessage = container.querySelector('.font-claude-message');
      if (claudeMessage) {
        const text = claudeMessage.textContent.trim();
        if (text) {
          messages.push({ type: 'claude', content: text });
        }
      }
    });

    return messages;
}

function formatContent(content) {
 // Create temporary div to parse HTML
 const temp = document.createElement('div');
 temp.innerHTML = content;

 // Get all paragraph elements
 const paragraphs = temp.querySelectorAll('p');

 // Extract text from each paragraph and join with double newlines
 const cleanText = Array.from(paragraphs)
   .map(p => p.textContent.trim())
   .filter(text => text.length > 0)
   .join('\n\n');

 // Fallback to plain text if no paragraphs found
 return cleanText || temp.textContent.trim();
}

function formatMessages(messages) {
  return messages.map(msg => {
    const emoji = msg.type === 'user' ? '🤠' : '🧞‍♂️';
    return `${emoji} ${formatContent(msg.content)}`;
  }).join('\n\n');
}


// MAIN ============================================================================================

(function() {
  'use strict';

  const messages = extractMessages();
  if (messages.length === 0) return;

  copyToClipboard(formatMessages(messages));

})();
