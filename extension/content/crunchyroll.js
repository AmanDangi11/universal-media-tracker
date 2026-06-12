// Content script for Crunchyroll auto-detection and progress synchronization
let trackedMedia = null;
let toastInjected = false;
let updateSynced = false;

// 1. Core logic to extract media info from Crunchyroll DOM or Page Title
function getCrunchyrollMediaInfo() {
  let title = '';
  let episode = null;

  // Method A: Parse Page Title (highly reliable on Crunchyroll)
  // Format: "Watch [Series Name] Episode [No] - [Ep Name] on Crunchyroll" or similar
  const pageTitle = document.title;
  const watchRegex = /Watch\s+(.+?)\s+Episode\s+(\d+)/i;
  const match = pageTitle.match(watchRegex);

  if (match) {
    title = match[1].trim();
    episode = parseInt(match[2], 10);
  } else {
    // Fallback title matching: "[Series Name] Episode [No]"
    const altRegex = /(.+?)\s+Episode\s+(\d+)/i;
    const altMatch = pageTitle.match(altRegex);
    if (altMatch) {
      title = altMatch[1].trim();
      episode = parseInt(altMatch[2], 10);
    }
  }

  // Method B: DOM Query fallback (if playing in full screen or title changed)
  if (!title) {
    const titleEl = document.querySelector('.show-title-link a, .show-title-link, .erc-current-media-info h1.title, h4.show-title-link');
    if (titleEl) {
      title = titleEl.textContent.trim();
    }
  }

  if (!episode) {
    const epEl = document.querySelector('.erc-current-media-info h2, .episode-number-selector');
    if (epEl) {
      const epMatch = epEl.textContent.match(/Episode\s+(\d+)/i) || epEl.textContent.match(/\d+/);
      if (epMatch) {
        episode = parseInt(epMatch[0], 10);
      }
    }
  }

  // Clean up title (remove Crunchyroll prefixes/suffixes if present)
  if (title) {
    title = title.replace(/\s+-\s+Watch\s+on\s+Crunchyroll/gi, '')
                 .replace(/on\s+Crunchyroll/gi, '')
                 .trim();
  }

  return { title, episode };
}

// 2. Initialize tracking check
async function initializeTracking() {
  const { title, episode } = getCrunchyrollMediaInfo();
  if (!title || isNaN(episode)) {
    return;
  }

  console.log(`[UMT Extension] Detected Playback: "${title}" - Episode ${episode}`);

  // Query background service worker to check if this is in our watchlist
  chrome.runtime.sendMessage({ type: 'CHECK_WATCHLIST', title }, (response) => {
    // Guard against message channel issues
    if (chrome.runtime.lastError) {
      console.warn('[UMT Extension] Failed to check watchlist: runtime error');
      return;
    }

    if (response && response.exists) {
      console.log(`[UMT Extension] Found in watchlist! Progress ID: ${response.progress.id}. Current progress: ${response.progress.currentProgress}`);
      trackedMedia = {
        progressId: response.progress.id,
        currentProgress: response.progress.currentProgress,
        totalProgress: response.progress.media.totalProgress,
        title: title,
        episode: episode
      };

      // Check if we need to sync progress immediately
      checkAndSyncProgress(episode);
    } else {
      console.log('[UMT Extension] Media is not in watchlist. Prompting user to add.');
      trackedMedia = null;
      showAddToWatchlistToast(title);
    }
  });
}

// 3. Inject slide-in glassmorphism Toast Overlay to prompt adding to watchlist
function showAddToWatchlistToast(title) {
  if (toastInjected || document.getElementById('umt-toast-overlay')) return;
  toastInjected = true;

  const toast = document.createElement('div');
  toast.id = 'umt-toast-overlay';
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
      max-width: 320px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transform: translateY(150px);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    ">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">📺</span>
        <div style="font-weight: 700; font-size: 14px; letter-spacing: 0.5px; color: #38bdf8; text-transform: uppercase;">Universal Tracker</div>
      </div>
      <div style="font-size: 13px; line-height: 1.5; color: #cbd5e1; margin-bottom: 4px;">
        We detected you are watching <strong style="color: #fff;">${title}</strong>. Add it to your watchlist?
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end; align-items: center; margin-top: 4px;">
        <button id="umt-dismiss-btn" style="
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 6px;
          transition: background 0.2s;
        ">Dismiss</button>
        <button id="umt-add-btn" style="
          background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
          border: none;
          border-radius: 8px;
          color: #0f172a;
          padding: 6px 14px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(56, 189, 248, 0.2);
          transition: transform 0.2s, box-shadow 0.2s;
        ">Add to List</button>
      </div>
    </div>
  `;

  document.body.appendChild(toast);

  // Trigger browser animation reflow
  const container = toast.querySelector('div');
  requestAnimationFrame(() => {
    container.style.transform = 'translateY(0)';
    container.style.opacity = '1';
  });

  // Event Listeners
  document.getElementById('umt-dismiss-btn').addEventListener('click', () => {
    dismissToast(container);
  });

  document.getElementById('umt-add-btn').addEventListener('click', () => {
    const addBtn = document.getElementById('umt-add-btn');
    addBtn.innerText = 'Adding...';
    addBtn.disabled = true;

    chrome.runtime.sendMessage({ type: 'ADD_TO_WATCHLIST', title }, (res) => {
      if (chrome.runtime.lastError || !res || !res.success) {
        addBtn.innerText = 'Failed';
        addBtn.disabled = false;
        addBtn.style.background = '#ef4444';
        return;
      }

      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px; color: #4ade80;">✓</span>
          <div style="font-weight: 700; font-size: 14px; color: #4ade80; text-transform: uppercase;">Added!</div>
        </div>
        <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 2px;">
          <strong>${title}</strong> was successfully added to your tracker. Keep watching to auto-sync!
        </div>
      `;

      // Cache tracked details locally
      trackedMedia = {
        progressId: res.progressId,
        currentProgress: 0,
        totalProgress: 12,
        title: title,
        episode: episode
      };

      // Auto-trigger sync check
      checkAndSyncProgress(episode);

      setTimeout(() => {
        dismissToast(container);
      }, 3000);
    });
  });
}

function dismissToast(container) {
  container.style.transform = 'translateY(150px)';
  container.style.opacity = '0';
  setTimeout(() => {
    const el = document.getElementById('umt-toast-overlay');
    if (el) el.remove();
  }, 400);
}

// 4. Video player monitor loop
function setupVideoMonitor() {
  setInterval(() => {
    const video = document.querySelector('video');
    if (!video || video.paused || !trackedMedia) return;

    // Monitor playback progress
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    if (duration > 0) {
      const progressPercent = currentTime / duration;
      // Trigger update when user has watched 85% of the video
      if (progressPercent > 0.85 && !updateSynced) {
        checkAndSyncProgress(trackedMedia.episode);
      }
    }
  }, 5000); // Check video progress every 5 seconds
}

// 5. Check and synchronize progress with server
function checkAndSyncProgress(episode) {
  if (!trackedMedia || updateSynced) return;

  // Only update if current watch episode exceeds logged progress
  if (episode > trackedMedia.currentProgress) {
    updateSynced = true;
    console.log(`[UMT Extension] Syncing episode progress: ${episode} for ID: ${trackedMedia.progressId}`);
    
    chrome.runtime.sendMessage({
      type: 'UPDATE_PROGRESS',
      progressId: trackedMedia.progressId,
      episode: episode
    }, (res) => {
      if (chrome.runtime.lastError || !res || !res.success) {
        console.error('[UMT Extension] Failed to synchronize progress with backend server.');
        updateSynced = false; // Reset to retry later
        return;
      }
      
      console.log(`[UMT Extension] Successfully synced episode ${episode}!`);
      trackedMedia.currentProgress = episode;
    });
  }
}

// 6. Observe page navigations (Crunchyroll is a single-page app and changes pages dynamically)
let lastPath = window.location.pathname;
const observer = new MutationObserver(() => {
  if (window.location.pathname !== lastPath) {
    lastPath = window.location.pathname;
    console.log('[UMT Extension] Path change detected, re-initializing tracking...');
    toastInjected = false;
    updateSynced = false;
    // Wait a brief delay for page content to load before initialization
    setTimeout(initializeTracking, 2000);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Run initial startup sequence
setTimeout(() => {
  initializeTracking();
  setupVideoMonitor();
}, 3000);
