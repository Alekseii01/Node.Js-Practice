#!/bin/bash

set -e

cd server
if [ ! -d "node_modules" ]; then
  echo "Downloading dependencies for backend..."
  npm install
fi
npm run start &

cd ../client
if [ ! -d "node_modules" ]; then
  echo "Downloading dependencies for frontend..."
  npm install
fi
npm run dev