# Universal Media Tracker

A universal media tracker application with a client (Next.js) and backend server (Express + Prisma).

---

## 🚀 How to Run the App Locally

Ensure you prefix your commands with the local node-env bin directory to use the workspace's node environment correctly.

### 1. Run Client (Next.js)
The client development server runs on **port 3000**.

```bash
# Navigate to the client folder from the workspace root
cd client

# Prefix the workspace's node-env bin to your PATH and start the dev server
export PATH="$PWD/../node-env/bin:$PATH" && npx next dev -H 0.0.0.0
```

### 2. Run Backend (Express + Prisma)
The backend server runs on **port 5001** (as configured in `server/.env`).

```bash
# Navigate to the server folder from the workspace root
cd server

# Prefix the workspace's node-env bin to your PATH and start the backend server
export PATH="$PWD/../node-env/bin:$PATH" && npm run dev
```

---

## ⚠️ Troubleshooting Port Conflicts

### Port 3000 (Client) Already in Use
If you get an error saying port 3000 is in use, check for active processes and forcefully terminate them:

1. Find the process ID (PID) running on port 3000:
   ```bash
   lsof -i :3000
   ```
2. Kill the process forcefully (replace `<PID>` with the actual PID found, e.g. `2013`):
   ```bash
   kill -9 <PID>
   ```

### macOS Port 5000 Conflict
macOS AirPlay Receiver listens on port 5000 by default. 
* **Note:** The server in this repository is pre-configured to run on **port 5001** via the `PORT=5001` variable in the `server/.env` file. This avoids the conflict entirely.

---

## 📖 System Manual
For more detailed infrastructure info, public reverse tunnels, and core architecture mappings, refer to [AGENTS.md](AGENTS.md).
