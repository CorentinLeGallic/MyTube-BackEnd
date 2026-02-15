#!/bin/sh

# Sync the database with schema.prisma
npx prisma db push

exec "$@"