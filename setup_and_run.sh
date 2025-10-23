#!/bin/bash

set -e

cd server
if [ ! -d "node_modules" ]; then
  echo "Downloading dependencies for backend..."
  npm install
fi
node index.js &
echo "Backend started at http://localhost:4000/"
cd ..

cd client
if [ ! -d "node_modules" ]; then
  echo "Downloading dependencies for frontend..."
  npm install
fi
npm run dev