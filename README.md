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

### 3. Run Database Migrations
```sh
cd server
npm install
npm run db:migrate
```

### 4. Install dependencies and run (with script)
```sh
chmod +x setup_and_run.sh
./setup_and_run.sh
```

### 5. Manual run
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
  - `client/src/components/CommentList/` - Comment display and management
  - `client/src/components/WorkspaceSelector/` - Workspace filter dropdown
- `server/` — Express server (WebSocket, Multer for uploads, Sequelize ORM)
  - `server/article/` - Article API logic (controller, model, service)
  - `server/comment/` - Comment API logic (controller, service)
  - `server/workspace/` - Workspace API logic (controller, service)
  - `server/models/` - Sequelize models (Article, Comment, Workspace)
  - `server/migrations/` - Database migrations
  - `server/config/` - Database configuration
  - `server/middleware/upload.js` - File upload configuration
  - `server/websocket/notificationService.js` - WebSocket broadcasts
  - `server/uploads/` — Uploaded files

## Database
- **PostgreSQL** with Sequelize ORM
- **Tables:**
  - `articles`: id (UUID), title, content, attachments (JSON), workspace_id, created_at, updated_at
  - `comments`: id (UUID), content, author, article_id (FK), created_at, updated_at
  - `workspaces`: id (UUID), name, description, created_at, updated_at
  - `article_versions`: id (UUID), article_id (FK), version_number, title, content, attachments (JSONB), workspace_id (FK), created_at

### Database Management Scripts
Run from the `server/` directory:

```sh
# Run all pending migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:undo

# Check migration status
npm run db:migrate:status

# Reset database (undo all, migrate, seed)
npm run db:reset

# Generate new migration
npm run migration:generate -- <migration-name>
```

## Features
- **CRUD Operations**: Create, Read, Update, Delete for articles, comments, and workspaces
- **Article Versioning**: Automatic version history on article updates, view and restore old versions
- **Comments**: Add comments to articles with author names
- **Workspaces**: Organize articles in workspaces, filter articles by workspace
- **File Attachments**: Upload and manage files for articles (images, PDFs)
- **Real-time Notifications**: WebSocket notifications for all CRUD operations
- **Rich Text Editor**: TipTap editor for formatted article content

## API
### Articles
- `GET /articles` - Get all articles (optional: `?workspace_id=<id>`)
- `GET /articles/:id` - Get article by ID (includes comments)
- `GET /articles/:id/versions` - Get article version history
- `GET /articles/:id/versions/:versionNumber` - Get specific article version
- `POST /articles` - Create article (body: `{title, content, workspace_id}`)
- `PUT /articles/:id` - Update article (body: `{title, content, workspace_id}`) - creates version automatically
- `DELETE /articles/:id` - Delete article

### Comments
- `GET /articles/:articleId/comments` - Get all comments for an article
- `POST /articles/:articleId/comments` - Add comment (body: `{content, author}`)
- `PUT /comments/:commentId` - Update comment (body: `{content, author}`)
- `DELETE /comments/:commentId` - Delete comment

### Workspaces
- `GET /workspaces` - Get all workspaces
- `GET /workspaces/:id` - Get workspace by ID
- `POST /workspaces` - Create workspace (body: `{name, description}`)
- `PUT /workspaces/:id` - Update workspace (body: `{name, description}`)
- `DELETE /workspaces/:id` - Delete workspace

### Attachments
- `POST /articles/:id/attachments` - Upload file
- `DELETE /articles/:id/attachments/:filename` - Delete file
- `GET /uploads/:filename` - Access uploaded file

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