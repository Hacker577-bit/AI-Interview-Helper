#!/bin/bash
set -e

echo "Setting up database..."

# Check if DATABASE_URL is PostgreSQL
if [[ "$DATABASE_URL" == postgresql://* ]]; then
  echo "Detected PostgreSQL database"
  echo "Running Prisma migrations..."
  npx prisma migrate deploy

  echo "Seeding database..."
  npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts

  echo "Database setup complete!"
else
  echo "Detected SQLite database (local development)"
  npx prisma db push
  npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts
  echo "Database setup complete!"
fi
