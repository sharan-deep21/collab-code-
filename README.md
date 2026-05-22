# CollabCode — Real-time Collaborative Code Editor

> Multiple people editing code simultaneously — like Google Docs for code.  
> Live cursors · Syntax highlighting · Room sharing · Chat

![Tech Stack](https://img.shields.io/badge/Node.js-18+-green) ![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black) ![Express](https://img.shields.io/badge/Express-4.x-blue)

---

## Features

- **Real-time collaboration** — edits sync instantly across all users via WebSockets
- **Live cursors** — see exactly where each collaborator is in the code
- **Syntax highlighting** — JavaScript, Python, TypeScript
- **Room system** — create a room, share the link, start collaborating
- **In-editor chat** — communicate without leaving the editor
- **Auto-save indicator** — visual feedback when changes are saved to server state

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Real-time | Socket.io (WebSockets) |
| Frontend | Vanilla HTML/CSS/JS |
| Syntax | Custom tokenizer |

---

## Getting Started

### Prerequisites
- Node.js 16+
- npm

### Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/collabcode.git
cd collabcode

# 2. Install dependencies
npm install

# 3. Start the server
npm start
# → http://localhost:3000

# For development with auto-reload:
npm run dev
```

Open `http://localhost:3000` in two browser tabs to test collaboration.

---

## How It Works

```
User A types → socket.emit('code:change') → Server broadcasts → User B receives update
```

1. User creates or joins a **room** (unique ID like `ROOM-XK47P`)
2. Server stores room state (code, language, connected users) in memory
3. Every keystroke is emitted as a `code:change` event and broadcast to all room members
4. Cursor positions sync via `cursor:move` events at low frequency
5. Chat messages are broadcast via `chat:message` to all room members

---

## Deployment

### Option 1 — Railway (Recommended, free tier)
1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo → Railway auto-detects Node.js and deploys
4. Done — get your live URL

### Option 2 — Render
1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect repo, set Build Command: `npm install`, Start Command: `npm start`
4. Deploy

### Option 3 — Fly.io
```bash
npm install -g flyctl
flyctl launch
flyctl deploy
```

---

## Project Structure

```
collabcode/
├── client/
│   └── index.html      # Frontend (single-file, no build step)
├── server/
│   └── index.js        # Node.js + Socket.io backend
├── package.json
├── README.md
└── .gitignore
```

---

## License
MIT
