// Background script for Neptune Keyboard Sounds
// Handles extension lifecycle and communication

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on install
    browser.storage.sync.set({
      enabled: true,
      soundPack: 'nkcream2',
      volume: 0.5
    });
  }
});

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getSettings') {
    browser.storage.sync.get(['enabled', 'soundPack', 'volume']).then(sendResponse);
    return true; // Keep channel open for async response
  }
});