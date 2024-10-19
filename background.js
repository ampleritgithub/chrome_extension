chrome.runtime.onInstalled.addListener(() => {
  console.log('Chat with Websites extension installed. Service worker active.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'wake_up') {
    console.log('Service worker is active and responding.');
    sendResponse({ success: true });
  } else if (message.action === 'process_content') {
    console.log('Processing content in the background:', message.content);
    sendResponse({ success: true, data: 'Content processed in background' });
  } else {
    console.log('Unknown action:', message.action);
    sendResponse({ success: false, error: 'Unknown action' });
  }
});