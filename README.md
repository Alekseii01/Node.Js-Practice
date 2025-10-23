
# Node.Js-Practice: Article App

## Quick Start

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd Node.Js-Practice
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
node index.js
```

#### Frontend:
```sh
cd client
npm install
npm run dev
```

## Structure
- `client/` — React app (frontend)
- `server/` — Express server (backend)
- `server/data/` — Sample articles (JSON)

## Environment variables
- For FE: if needed, change the backend URL in `client/.env.dev`:
  ```
  VITE_API_URL=http://localhost:4000
  ```