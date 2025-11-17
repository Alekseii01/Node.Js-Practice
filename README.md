# Node.Js-Practice: Article App

## Quick Start

### 1. Clone the repository
```sh
git clone https://github.com/Alekseii01/Node.Js-Practice
cd Node.Js-Practice
git checkout feature/attachments-&-notifications
```

### 2. Install dependencies and run (with script)
```sh
chmod +x setup_and_run.sh
./setup_and_run.sh
```

### 3. Manual run
#### Backend:
```sh
cd server
npm install
npm run start
```

#### Frontend:
```sh
cd client
npm install
npm run dev
```

## Structure
- `client/` — React app (Vite, React Router, TipTap editor)
- `server/` — Express server (WebSocket, Multer for uploads)
  - `server/article/` - Article API logic (controller, model, service)
  - `server/middleware/upload.js` - File upload configuration
  - `server/websocket/notificationService.js` - WebSocket broadcasts
  - `server/data/` — Article JSON files
  - `server/uploads/` — Uploaded files

## API
- Articles: `GET/POST/PUT/DELETE /articles`
- Attachments: `POST /articles/:id/attachments`, `DELETE /articles/:id/attachments/:filename`
- Static files: `GET /uploads/:filename`

## Environment variables
- **Frontend** (`client/.env.development`):
  ```
  VITE_API_URL=http://localhost:4000
  ```
- **Backend** (`server/.env`):
  ```
  PORT=4000
  ```