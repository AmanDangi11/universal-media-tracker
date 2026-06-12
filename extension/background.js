// Background Service Worker for Universal Media Tracker
const DEFAULT_API_URL = 'http://localhost:5000';

// Listen for messages from content scripts or the popup UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_WATCHLIST') {
    handleCheckWatchlist(message.title, sendResponse);
    return true; // Keep message channel open for async response
  }

  if (message.type === 'ADD_TO_WATCHLIST') {
    handleAddToWatchlist(message.title, sendResponse);
    return true; // Keep message channel open for async response
  }

  if (message.type === 'UPDATE_PROGRESS') {
    handleUpdateProgress(message.progressId, message.episode, sendResponse);
    return true; // Keep message channel open for async response
  }

  if (message.type === 'SYNC_AUTH_TOKEN') {
    chrome.storage.local.set({ umt_token: message.token });
    console.log('[Background] Automatically synchronized auth token from web app.');
    return false;
  }
});

// Helper to fetch server connection settings from storage
async function getSettings() {
  const settings = await chrome.storage.local.get(['umt_token', 'umt_api_url']);
  let apiUrl = settings.umt_api_url || DEFAULT_API_URL;
  if (apiUrl.endsWith('/')) {
    apiUrl = apiUrl.slice(0, -1);
  }
  return {
    token: settings.umt_token || null,
    apiUrl
  };
}

// 1. Check if media exists in user's watchlist
async function handleCheckWatchlist(title, sendResponse) {
  try {
    const { token, apiUrl } = await getSettings();
    if (!token) {
      sendResponse({ exists: false, error: 'Unauthorized: No token found in extension settings.' });
      return;
    }

    const checkUrl = `${apiUrl}/api/watchlist/check?title=${encodeURIComponent(title)}`;
    const response = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    sendResponse(data);
  } catch (error) {
    console.error('[Background] Watchlist check failed:', error);
    sendResponse({ exists: false, error: error.message });
  }
}

// 2. Fetch metadata from AniList GraphQL and Add to Watchlist
async function handleAddToWatchlist(title, sendResponse) {
  try {
    const { token, apiUrl } = await getSettings();
    if (!token) {
      sendResponse({ success: false, error: 'Unauthorized: No token found in extension settings.' });
      return;
    }

    // A. Query AniList public GraphQL API to fetch media metadata
    let coverImage = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60';
    let synopsis = 'No synopsis available.';
    let totalProgress = 12;
    let franchise = `${title} Franchise`;
    let canonicalTitle = title;
    let aniListId = null;

    try {
      const graphQLQuery = `
        query ($search: String) {
          Media (search: $search, type: ANIME) {
            id
            title {
              english
              romaji
            }
            description
            coverImage {
              large
            }
            episodes
          }
        }
      `;

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: graphQLQuery,
          variables: { search: title }
        })
      });

      if (response.ok) {
        const resJson = await response.json();
        const media = resJson?.data?.Media;
        if (media) {
          aniListId = media.id;
          canonicalTitle = media.title.english || media.title.romaji || title;
          franchise = `${media.title.romaji || media.title.english} Franchise`;
          coverImage = media.coverImage?.large || coverImage;
          synopsis = media.description ? media.description.replace(/<[^>]*>/g, '') : synopsis;
          totalProgress = media.episodes || totalProgress;
        }
      }
    } catch (err) {
      console.warn('[Background] AniList GraphQL metadata fetch failed, using fallback:', err);
    }

    // B. Call Express API /api/watchlist/add
    const response = await fetch(`${apiUrl}/api/watchlist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: canonicalTitle,
        type: 'ANIME',
        coverImage,
        synopsis,
        totalProgress,
        progressType: 'episode',
        franchise,
        externalId: aniListId ? `anilist-${aniListId}` : null
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const addResult = await response.json();

    // Show badge flash confirmation
    await showActionBadge('+', '#38bdf8');

    sendResponse({ success: true, progressId: addResult.progressId });
  } catch (error) {
    console.error('[Background] Failed to add media to watchlist:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 3. Update Progress of a tracked MediaItem
async function handleUpdateProgress(progressId, episode, sendResponse) {
  try {
    const { token, apiUrl } = await getSettings();
    if (!token) {
      sendResponse({ success: false, error: 'Unauthorized: No token found.' });
      return;
    }

    const response = await fetch(`${apiUrl}/api/watchlist/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        progressId,
        type: 'custom',
        customValue: episode
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    // Show badge checkmark confirmation
    await showActionBadge('✓', '#10b981');

    sendResponse({ success: true });
  } catch (error) {
    console.error('[Background] Failed to update progress:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Flash notification badge text on the extension icon
async function showActionBadge(text, color) {
  try {
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color });
    setTimeout(async () => {
      await chrome.action.setBadgeText({ text: '' });
    }, 3000);
  } catch (err) {
    console.warn('[Background] Badge display not supported or failed:', err);
  }
}
