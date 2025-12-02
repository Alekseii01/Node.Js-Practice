# Node.Js-Practice: Article App

## Quick Start

### 1. Clone the repository
```sh
git clone https://github.com/Alekseii01/Node.Js-Practice
cd Node.Js-Practice
git checkout feature/database-setup
```

### 2. Set up PostgreSQL Database
```sh
createdb article_app_dev

psql -U postgres -c "CREATE DATABASE article_app_dev;"
```

### 3. Configure Backend Environment
```sh
cd server
cp .env.example .env
```

### 4. Run Database Migrations
```sh
cd server
npx sequelize-cli db:migrate
```

### 5. Install dependencies and run (with script)
```sh
chmod +x setup_and_run.sh
./setup_and_run.sh
```

### 6. Manual run
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
- `server/` — Express server (WebSocket, Multer for uploads, Sequelize ORM)
  - `server/article/` - Article API logic (controller, model, service)
  - `server/models/` - Sequelize models
  - `server/migrations/` - Database migrations
  - `server/config/` - Database configuration
  - `server/middleware/upload.js` - File upload configuration
  - `server/websocket/notificationService.js` - WebSocket broadcasts
  - `server/uploads/` — Uploaded files

## Database
- **PostgreSQL** with Sequelize ORM
- **Articles table**: id (UUID), title, content, attachments (JSON), created_at, updated_at
- Run migrations: `npx sequelize-cli db:migrate`
- Rollback migrations: `npx sequelize-cli db:migrate:undo`

## API
- Articles: `GET/POST/PUT/DELETE /articles`
- Attachments: `POST /articles/:id/attachments`, `DELETE /articles/:id/attachments/:filename`
- Static files: `GET /uploads/:filename`

## Environment variables
- **Frontend** (`client/.env.dev`):
  ```
  VITE_API_URL=http://localhost:4000
  ```
- **Backend** (`server/.env.dev`):
  ```
  PORT=4000
  DB_HOST=127.0.0.1
  DB_PORT=5432
  DB_NAME=article_app_dev
  DB_USER=postgres
  DB_PASSWORD=postgres
  NODE_ENV=development
  ```