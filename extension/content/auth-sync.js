// Auth Synchronizer content script for Universal Media Tracker
let currentToken = localStorage.getItem('umt_token');

// Perform initial sync if a token is present on page load
if (currentToken) {
  console.log('[UMT Extension] Initializing automatic token sync...');
  chrome.runtime.sendMessage({ type: 'SYNC_AUTH_TOKEN', token: currentToken });
}

// Monitor LocalStorage periodically to detect dynamic logins or logouts
setInterval(() => {
  const latestToken = localStorage.getItem('umt_token');
  
  if (latestToken && latestToken !== currentToken) {
    currentToken = latestToken;
    console.log('[UMT Extension] Detected login or token update. Syncing credentials...');
    chrome.runtime.sendMessage({ type: 'SYNC_AUTH_TOKEN', token: latestToken });
  } else if (!latestToken && currentToken) {
    currentToken = null;
    console.log('[UMT Extension] Detected logout. Removing credentials from extension...');
    chrome.runtime.sendMessage({ type: 'SYNC_AUTH_TOKEN', token: null });
  }
}, 2000);
