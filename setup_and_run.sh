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