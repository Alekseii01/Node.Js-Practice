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
  - `src/components/`
    - `ArticleCreate/` - Article creation form
    - `ArticleEdit/` - Article editing form (with permission checks)
    - `ArticleList/` - Articles list with filters
    - `ArticleView/` - Article view with comments and versioning
    - `CommentList/` - Comment display and management
    - `Header/` - Navigation header with user info and logout
    - `Login/` - Login and registration forms
    - `Navigation/` - Main navigation menu
    - `ProtectedRoute.jsx` - Route protection wrapper (requires authentication)
    - `UserManagement/` - Admin panel for user role management
    - `VersionHistory/` - Article version history viewer with restore functionality
    - `WorkspaceManager/` - Workspace CRUD operations
    - `WorkspaceSelector/` - Workspace filter dropdown
    - `ui/` - Reusable UI components
      - `AttachmentManager/` - File upload and management
      - `Button/` - Custom button component
      - `ConfirmationDialog/` - Modal confirmation dialogs
      - `NotificationDisplay/` - WebSocket notification toasts
      - `StatusMessage/` - Success/error message display
      - `TipTapEditor/` - Rich text editor component
  - `src/context/`
    - `AuthContext.jsx` - Authentication state and functions
    - `WebSocketContext.jsx` - WebSocket connection and notifications
  - `src/utils/`
    - `apiService.js` - API request wrapper with auth headers
    - `constants.js` - App constants (API URL, etc.)
    - `validation.js` - Form validation functions
- `server/` — Express server (WebSocket, Multer for uploads, Sequelize ORM)
  - `app.js` - Express app configuration and routes
  - `server.js` - HTTP server and WebSocket initialization
  - `constants.js` - Server constants
  - `auth/` - Authentication (login, register, JWT generation)
  - `article/` - Article API (controller, model, service)
  - `comment/` - Comment API (controller, service, directRouter)
  - `workspace/` - Workspace API (controller, service)
  - `users/` - User management API (get users, update role)
  - `models/` - Sequelize models
    - `Article.js`, `ArticleVersion.js`, `Comment.js`, `User.js`, `Workspace.js`
    - `associations.js` - Model relationships
  - `migrations/` - Database migrations
  - `config/` - Database configuration
  - `middleware/`
    - `auth.js` - JWT authentication and role-based access middleware
    - `upload.js` - Multer file upload configuration
  - `websocket/`
    - `notificationService.js` - WebSocket broadcasting with user-specific notifications
  - `uploads/` — Uploaded files storage

## Database
- **PostgreSQL** with Sequelize ORM
- **Tables:**
  - `users`: id (UUID), email, firstName, lastName, password (hashed), role (admin/user), created_at, updated_at
  - `articles`: id (UUID), title, content, attachments (JSON), workspace_id, created_by (FK to users), created_at, updated_at
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
- **Authentication & Authorization**: 
  - User registration and login with JWT tokens
  - Role-based access control (Admin and User roles)
  - First registered user becomes administrator automatically
  - Protected routes requiring authentication
- **Article Management**: CRUD operations with full permission system
  - Only article creators or administrators can edit/delete articles
  - Automatic owner assignment when articles are created
  - Legacy article support with auto-assignment
- **Article Versioning**: Automatic version history on article updates, view and restore old versions
- **Comments**: Add comments to articles with author names
- **Workspaces**: Organize articles in workspaces, filter articles by workspace
- **File Attachments**: Upload and manage files for articles (images, PDFs)
- **User Management**: 
  - Admin panel for viewing all users
  - Role switching (admin ↔ user) with real-time UI updates via WebSocket
  - Accessible only to administrators
- **Real-time Notifications**: 
  - WebSocket notifications for article changes (create, update, delete)
  - Personalized role update notifications sent only to affected user
  - Comment notifications
  - Connection auto-authentication with user ID
- **Rich Text Editor**: TipTap editor with formatting support for article content

## API
### Authentication
- `POST /auth/register` - Register new user (body: `{email, password, firstName, lastName}`)
  - First user automatically becomes admin
- `POST /auth/login` - Login user (body: `{email, password}`)
  - Returns JWT token and user info

### Articles
- `GET /articles` - Get all articles (optional: `?workspace_id=<id>`)
- `GET /articles/:id` - Get article by ID (includes comments)
- `GET /articles/:id/versions` - Get article version history
- `GET /articles/:id/versions/:versionNumber` - Get specific article version
- `POST /articles` - Create article (body: `{title, content, workspace_id}`) - requires authentication
- `PUT /articles/:id` - Update article (body: `{title, content, workspace_id}`) - requires ownership or admin role
- `DELETE /articles/:id` - Delete article - requires ownership or admin role
- `POST /articles/:id/attachments` - Upload file - requires ownership or admin role
- `DELETE /articles/:id/attachments/:filename` - Delete file - requires ownership or admin role

### Comments
- `GET /articles/:articleId/comments` - Get all comments for an article
- `POST /articles/:articleId/comments` - Add comment (body: `{content, author}`)
- `PUT /comments/:commentId` - Update comment (body: `{content, author}`)
- `DELETE /comments/:commentId` - Delete comment

### Workspaces
- `GET /workspaces` - Get all workspaces
- `GET /workspaces/:id` - Get workspace by ID
- `POST /workspaces` - Create workspace (body: `{name, description}`) - requires authentication
- `PUT /workspaces/:id` - Update workspace (body: `{name, description}`)
- `DELETE /workspaces/:id` - Delete workspace

### Users & Roles
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID (admin only)
- `GET /users/current` - Get current authenticated user info
- `PUT /users/:id/role` - Update user role (body: `{role: 'admin' | 'user'}`) - admin only

### Attachments
- `POST /articles/:id/attachments` - Upload file - requires ownership or admin role
- `DELETE /articles/:id/attachments/:filename` - Delete file - requires ownership or admin role
- `GET /uploads/:filename` - Access uploaded file

### WebSocket
- Connection: `ws://localhost:4000`
- Authentication: Send `{type: 'auth', userId: '<userId>'}` on connection
- Notifications:
  - `article_created` - New article created
  - `article_updated` - Article updated
  - `article_deleted` - Article deleted
  - `attachment_added` - File attached to article
  - `attachment_removed` - File removed from article
  - `comment_added` - Comment added to article
  - `comment_updated` - Comment updated
  - `comment_deleted` - Comment deleted
  - `user_role_updated` - User role changed (sent only to affected user)