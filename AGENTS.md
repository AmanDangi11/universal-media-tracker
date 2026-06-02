# 🤖 AI Agent System Manual: Universal Media Tracker

This manual documents the entire application infrastructure, dynamic vs. static status, and the precise commands to spin up the servers and public tunnels. **AI Agents: Read this file FIRST before performing any code edits or running startup tasks.**

---

## 🚀 1. Quick Startup & Running Procedures

Always execute commands inside the virtual environment by prefixing the `PATH` of the workspace's node environment:

### 🔹 Run Client (Next.js)
*   **Directory**: `client/`
*   **Port**: `3000`
*   **Command**:
    ```bash
    export PATH="$PWD/../node-env/bin:$PATH" && npx next dev -H 0.0.0.0
    ```

### 🔹 Run Backend (Express + Prisma)
*   **Directory**: `server/`
*   **Port**: `5000`
*   **Command**:
    ```bash
    export PATH="$PWD/../node-env/bin:$PATH" && npm run dev
    ```

### 🔹 Public Reverse Tunnels (`localhost.run` via SSH)
To allow external devices (like mobile phones) to bypass router isolation and access the dev environment:
*   **Client Tunnel (Port 3000)**:
    ```bash
    ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 nokey@localhost.run
    ```
*   **Server Tunnel (Port 5000)**:
    ```bash
    ssh -o StrictHostKeyChecking=no -R 80:localhost:5000 nokey@localhost.run
    ```

---

## 🏗️ 2. Infrastructure Ledger

### 🟢 100% Dynamic Components
The application has zero static mock listings or stubbed behaviors:
*   **Watchlist Ledger**: Synchronized with Supabase/PostgreSQL database via REST endpoints (`/api/watchlist`).
*   **Progress Operations**: Increments, completions, custom value saves, and resets call `/api/watchlist/update` in real-time.
*   **User Authentication**: JWT-based user sign-up, login, and profile tracking block client routes cleanly.
*   **Anime Search & Discovery**: Queries the live public **AniList GraphQL API** on the client.
*   **Manga & Novel Search**: Queries the live public **AniList GraphQL API** on the client.
*   **TV Series Search (`TV_SHOW`)**: Queries the live public **TVmaze API** (`https://api.tvmaze.com`) via backend `/api/search` (keyless, 100% dynamic).
*   **Movies Search (`MOVIE`)**: Queries the live public **YTS API** (`https://yts.mx`) via backend `/api/search` (keyless, 100% dynamic).
*   **Airing Calendar**: Excludes all static release schedules. Fetches live real-time countdown schedules directly from AniList on client render, filtering out items that do not have active upcoming episodes.

### 🟡 Pending Enhancements / Configurables
*   **TMDB API Key Integration**: Currently using TVmaze and YTS as keyless defaults. If the user provides a `TMDB_API_KEY` in the server's `.env`, the `/api/search` route will seamlessly switch to official TMDB searches.
*   **Real-time Webhook Synchronization**: Prepared to accept incoming HMAC-signed extension triggers for background sync, but actual client settings interface controls are pending.

### 🔴 Static/Mock Components
*   **None**: All fallbacks have been replaced with live dynamic third-party open-access APIs.

---

## 📁 3. Core Architecture File Mapping

*   **Frontend Main Interface**: `client/src/app/page.tsx`
    *   *Includes: Mobile bottom navigation view shells, discovery, calendar filters, custom category segment controllers, API database calls, and authentication states.*
*   **Next.js HMR Network Whitelisting**: `client/next.config.ts`
    *   *Contains Top-level `allowedDevOrigins` to bypass webpack blocking through public tunnels.*
*   **Backend REST Server Index**: `server/src/index.ts`
    *   *Includes: Express routes, auth middleware, TVmaze/YTS keyless search mapping logic, database Prisma transactions, and health checks.*
*   **Prisma Database Schema**: `server/prisma/schema.prisma`
    *   *Contains PostgreSQL/Supabase database tables (`User`, `Media`, `UserMediaProgress`, `ProgressHistory`).*
