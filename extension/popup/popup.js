// Popup interface logic for Universal Media Tracker Extension
const DEFAULT_API_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const tokenInput = document.getElementById('token');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const successMsg = document.getElementById('successMsg');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const webAppLink = document.getElementById('webAppLink');

  // Load saved credentials from storage
  const settings = await chrome.storage.local.get(['umt_token', 'umt_api_url']);
  
  if (settings.umt_api_url) {
    apiUrlInput.value = settings.umt_api_url;
    // Update dashboard link dynamically if user has a custom frontend host
    const baseDomain = settings.umt_api_url.replace(':5000', ':3000').replace('/api', '');
    webAppLink.href = baseDomain;
  } else {
    apiUrlInput.value = DEFAULT_API_URL;
  }

  if (settings.umt_token) {
    tokenInput.value = settings.umt_token;
    // If settings are present, automatically test connection
    await testConnection(settings.umt_api_url || DEFAULT_API_URL, settings.umt_token);
  }

  // Handle Save Settings Action
  saveBtn.addEventListener('click', async () => {
    let apiUrl = apiUrlInput.value.trim() || DEFAULT_API_URL;
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }
    const token = tokenInput.value.trim();

    await chrome.storage.local.set({
      umt_api_url: apiUrl,
      umt_token: token
    });

    // Update Web App link
    const baseDomain = apiUrl.replace(':5000', ':3000').replace('/api', '');
    webAppLink.href = baseDomain;

    // Show success visual indicator
    successMsg.style.display = 'block';
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 2500);

    // Test connection with new credentials
    await testConnection(apiUrl, token);
  });

  // Handle Manual Connection Test Action
  testBtn.addEventListener('click', async () => {
    let apiUrl = apiUrlInput.value.trim() || DEFAULT_API_URL;
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }
    const token = tokenInput.value.trim();
    
    statusDot.className = 'dot';
    statusText.innerText = 'Testing...';
    
    await testConnection(apiUrl, token);
  });

  // Connection testing core routine
  async function testConnection(apiUrl, token) {
    if (!token) {
      statusDot.className = 'dot error';
      statusText.innerText = 'No Token Saved';
      return;
    }

    try {
      // Health check endpoint requires checking connectivity
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.database === 'connected') {
          statusDot.className = 'dot connected';
          statusText.innerText = 'Connected';
        } else {
          statusDot.className = 'dot error';
          statusText.innerText = 'DB Connection Failed';
        }
      } else {
        statusDot.className = 'dot error';
        statusText.innerText = `Error: HTTP ${response.status}`;
      }
    } catch (err) {
      console.error('[Popup Test Connection Failed]:', err);
      statusDot.className = 'dot error';
      statusText.innerText = 'Cannot Reach Server';
    }
  }
});
