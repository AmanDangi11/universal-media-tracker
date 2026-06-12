// Generic Anime Content Script supporting Animepahe, Animesuge, 9anime, etc.
// Bypasses cross-origin iframe player restrictions using background tab state mapping.

let trackedMedia = null;
let toastInjected = false;
let updateSynced = false;

// 1. Parsing patterns from page title
function parseGenericMediaInfo() {
  const pageTitle = document.title;
  if (!pageTitle) return { title: '', episode: null };

  // Pattern A: "Watch [Title] Episode [No]..."
  const matchA = pageTitle.match(/Watch\s+(.+?)\s+Episode\s+(\d+)/i);
  if (matchA) return { title: matchA[1].trim(), episode: parseInt(matchA[2], 10) };

  // Pattern B: "[Title] Episode [No]..."
  const matchB = pageTitle.match(/(.+?)\s+Episode\s+(\d+)/i);
  if (matchB) return { title: matchB[1].trim(), episode: parseInt(matchB[2], 10) };

  // Pattern C: "[Title] - [Episode No] Sub/Dub..." (Animepahe / direct style)
  const matchC = pageTitle.match(/(.+?)\s+-\s+(\d+)/i);
  if (matchC) return { title: matchC[1].trim(), episode: parseInt(matchC[2], 10) };

  return { title: '', episode: null };
}

// 2. Initialize Parent Frame logic (detects media info and handles watchlist check)
function initializeParentFrame() {
  const { title, episode } = parseGenericMediaInfo();
  if (!title || isNaN(episode)) return;

  console.log(`[UMT Extension] Main Frame Detected: "${title}" - Episode ${episode}`);

  // Register this tab's active media with the background service worker
  chrome.runtime.sendMessage({
    type: 'REGISTER_TAB_MEDIA',
    title,
    episode
  });

  // Query server check
  chrome.runtime.sendMessage({ type: 'CHECK_WATCHLIST', title }, (response) => {
    if (chrome.runtime.lastError) return;

    if (response && response.exists) {
      console.log(`[UMT Extension] Tracked show exists in watchlist. Progress ID: ${response.progress.id}`);
      trackedMedia = {
        progressId: response.progress.id,
        currentProgress: response.progress.currentProgress,
        totalProgress: response.progress.media.totalProgress,
        title,
        episode
      };
    } else {
      console.log('[UMT Extension] Show not tracked. Displaying add prompt...');
      showAddToWatchlistToast(title, episode);
    }
  });
}

// 3. Inject add overlay card in the parent frame viewport
function showAddToWatchlistToast(title, episode) {
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
        <span style="font-size: 18px;">✨</span>
        <div style="font-weight: 700; font-size: 14px; letter-spacing: 0.5px; color: #38bdf8; text-transform: uppercase;">Universal Tracker</div>
      </div>
      <div style="font-size: 13px; line-height: 1.5; color: #cbd5e1; margin-bottom: 4px;">
        We noticed you are watching <strong style="color: #fff;">${title}</strong>. Add it to your watchlist?
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end; align-items: center; margin-top: 4px;">
        <button id="umt-dismiss-btn" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 12px; font-weight: 500; padding: 6px 12px; border-radius: 6px;">Dismiss</button>
        <button id="umt-add-btn" style="background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%); border: none; border-radius: 8px; color: #0f172a; padding: 6px 14px; font-weight: 600; font-size: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.2);">Add to List</button>
      </div>
    </div>
  `;

  document.body.appendChild(toast);

  const container = toast.querySelector('div');
  requestAnimationFrame(() => {
    container.style.transform = 'translateY(0)';
    container.style.opacity = '1';
  });

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
        <div style="font-size: 13px; color: #cbd5e1;">
          <strong>${title}</strong> added to watchlist. Syncing in progress!
        </div>
      `;

      // Inform background to update tracked media mapping
      chrome.runtime.sendMessage({
        type: 'REGISTER_TAB_MEDIA',
        title,
        episode,
        progressId: res.progressId,
        currentProgress: 0
      });

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

// 4. Iframe Frame logic (finds video players inside cross-origin embed iframes)
function setupIframeVideoMonitor() {
  setInterval(() => {
    const video = document.querySelector('video');
    if (!video || video.paused || updateSynced) return;

    const currentTime = video.currentTime;
    const duration = video.duration;

    if (duration > 0) {
      const progressPercent = currentTime / duration;
      // Report completed status to background script when watched >85%
      if (progressPercent > 0.85) {
        updateSynced = true;
        chrome.runtime.sendMessage({ type: 'IFRAME_VIDEO_COMPLETE' }, (response) => {
          if (chrome.runtime.lastError || !response || !response.success) {
            updateSynced = false; // Reset to retry if failed
          }
        });
      }
    }
  }, 5000);
}

// Startup execution checks
if (window === window.top) {
  // Main top window
  setTimeout(initializeParentFrame, 3000);
} else {
  // Nested player iframe
  setupIframeVideoMonitor();
}
