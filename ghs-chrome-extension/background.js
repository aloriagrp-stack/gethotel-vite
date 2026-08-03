// GHS Chrome Extension - Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('[GHS Chrome Extension] Installed successfully!');
});

// Listener for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SCRAPE_PAGE') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'EXTRACT_HOTEL_DATA' }, (response) => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response);
          }
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found.' });
      }
    });
    return true; // Asynchronous response
  }
});
