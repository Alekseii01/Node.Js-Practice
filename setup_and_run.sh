#!/bin/bash

set -e

echo "Setting up backend..."
cd server

if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
else
  echo "Backend dependencies already installed"
fi

if [ ! -d "uploads" ]; then
  echo "Creating uploads directory..."
  mkdir -p uploads
fi

echo "Checking database connection..."
DB_NAME=$(grep DB_NAME .env.dev | cut -d '=' -f2)
DB_USER=$(grep DB_USER .env.dev | cut -d '=' -f2)

if command -v psql &> /dev/null; then
  if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Database $DB_NAME already exists"
  else
    echo "Creating database $DB_NAME..."
    createdb -U "$DB_USER" "$DB_NAME" || echo "Failed to create database. Please create it manually: createdb $DB_NAME"
  fi
else
  echo "PostgreSQL client not found. Please ensure database $DB_NAME exists."
fi

echo "Running database migrations..."
npx sequelize-cli db:migrate

echo "Starting backend server..."
npm run start &
BACKEND_PID=$!
echo "Backend server started (PID: $BACKEND_PID)"

echo ""
echo "Setting up frontend..."
cd ../client

if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
else
  echo "Frontend dependencies already installed"
fi

echo ""
echo "Starting frontend server..."
npm run dev

trap "echo 'Stopping servers...'; kill $BACKEND_PID 2>/dev/null" EXIT