#!/bin/sh

# Exit if any command in the script fails
set -e

echo "Installing dependencies..."
npm install

echo "Syncing database with schema.prisma..."
npx prisma db push

echo "Starting package.json and schema.prisma watchers..."

npx nodemon --legacy-watch --watch package.json --ext json --delay 500ms --exec "npm install && $@" &
npx nodemon --legacy-watch --watch prisma/schema.prisma --ext prisma --delay 500ms --exec "npx prisma db push" &

npx prisma studio

echo "Starting the app..."

wait