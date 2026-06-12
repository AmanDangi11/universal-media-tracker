# Chrome Web Store Publishing Guide: Universal Media Tracker

This document provides the metadata, description copy, permissions justifications, and packaging instructions required to publish the **Universal Media Tracker Auto-Sync** extension to the Chrome Web Store.

---

## 📝 1. Store Listing Metadata

### Extension Name
`Universal Media Tracker Auto-Sync`

### Summary (Max 150 characters)
`Auto-detect and sync your anime and show progress with Universal Media Tracker.`

### Detailed Description
```
Streamline your watchlist tracking. The Universal Media Tracker browser extension runs in the background to automatically sync your media progress as you watch. 

⚡ Core Features:
- Crunchyroll Auto-Sync: Detects active video playback on Crunchyroll and logs your current episode progress.
- Watchlist Detection: Alerts you with an in-page prompt to add untracked series to your dashboard on the fly.
- Metadata Aggregation: Pulls clean cover arts, descriptions, and episode counts from AniList GraphQL dynamically.
- Zero-Config Login: Sniffs authentication sessions from your dashboard tab automatically. No token copying required!

Note: Works directly with your local or self-hosted Universal Media Tracker server instances. Simply specify your custom API URL in the extension popup dashboard.
```

---

## 🔒 2. Permissions Justification
When submitting to the Chrome Developer Console, the review team will reject vague justifications. Use these copy-paste templates:

* **`storage`**
  * *Justification:* Needed to save configuration settings locally inside the browser, including the user's custom Server API URL and their secure session authorization token.
* **`<all_urls>` (Host Permission)**
  * *Justification:* Necessary to allow the background service worker to send progress logs and search queries to the user's custom self-hosted or local Express API server domain.

---

## 🕵️‍♂️ 3. Privacy & Data Use Disclosures
Chrome requires declaring what data you collect and how you use it.

1. **Does the extension collect personally identifiable information (PII)?**
   * *No.* It only transfers anonymized media titles and episode numbers to the user's configured backend server.
2. **How is the data used?**
   * *Required functionality:* The extension sends progress logs solely to sync user watchlists.
3. **Data Security:**
   * Confirm that data is transmitted over secure channels (HTTPS) and is never shared, sold, or rented to third parties.

---

## 📦 4. Packaging the Extension for Upload

To prepare your extension file for upload to the Chrome Web Store, package it as a `.zip` archive. 

### Step-by-Step Pack Instructions:
1. Open terminal and navigate to the project root directory.
2. Run this command to zip **only** the necessary extension files (excluding git, node modules, and this markdown guide):
   ```bash
   zip -r universal-media-tracker-extension.zip extension/ -x "*.DS_Store" -x "__MACOSX"
   ```
3. Upload `universal-media-tracker-extension.zip` in your **[Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole)**.
