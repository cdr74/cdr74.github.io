# Cloudflare Worker Deployment Guide

This directory contains the Cloudflare Worker backend for the German learning app.

## Prerequisites

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Authenticate with Cloudflare:
```bash
wrangler login
```

## Setup Steps

### 1. Create D1 Databases

Create production database:
```bash
wrangler d1 create cdr74-learning-db
```

Copy the `database_id` from the output and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "cdr74-learning-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

Create development database:
```bash
wrangler d1 create cdr74-learning-db-dev
```

Copy the `database_id` and update `wrangler.toml` under `[env.dev]`:
```toml
[[env.dev.d1_databases]]
binding = "DB"
database_name = "cdr74-learning-db-dev"
database_id = "YOUR_DEV_DATABASE_ID_HERE"
```

### 2. Initialize Database Schema

Production:
```bash
wrangler d1 execute cdr74-learning-db --file=./schema.sql
```

Development:
```bash
wrangler d1 execute cdr74-learning-db-dev --file=./schema.sql --env=dev
```

### 3. Test Locally

```bash
cd /home/chris/dev/cdr74.github.io/workers
wrangler dev
```

This will start a local development server. Test the endpoints using curl:

```bash
# Create user
curl -X POST http://localhost:8787/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"TestUser"}'

# Get all users
curl http://localhost:8787/api/users

# Login
curl -X POST http://localhost:8787/api/session/login \
  -H "Content-Type: application/json" \
  -d '{"username":"TestUser"}'

# Record activity
curl -X POST http://localhost:8787/api/users/TestUser/activity \
  -H "Content-Type: application/json" \
  -d '{"module":"groessen","score":10,"timestamp":1234567890}'

# Get daily activity
curl http://localhost:8787/api/users/TestUser/daily-activity?days=30
```

### 4. Deploy to Production

```bash
wrangler deploy
```

After deployment, you'll get a URL like:
```
https://cdr74-learning-api.YOUR-SUBDOMAIN.workers.dev
```

### 5. Update Frontend API URL

Edit `/src/js/modules/api-client.js` and update the API_BASE_URL:

```javascript
const API_BASE_URL = 'https://cdr74-learning-api.YOUR-SUBDOMAIN.workers.dev/api';
```

### 6. Deploy Frontend

```bash
cd /home/chris/dev/cdr74.github.io
git add .
git commit -m "Add Cloudflare D1 backend integration"
git push origin main
```

## Database Management

### Query the database

Production:
```bash
wrangler d1 execute cdr74-learning-db --command="SELECT * FROM users"
```

Development:
```bash
wrangler d1 execute cdr74-learning-db-dev --command="SELECT * FROM users" --env=dev
```

### View logs

```bash
wrangler tail
```

## API Endpoints

### User Management

- `POST /api/users` - Create new user
- `GET /api/users` - Get all users
- `GET /api/users/:username` - Get user with stats
- `DELETE /api/users/:username` - Delete user

### Activity Tracking

- `POST /api/users/:username/activity` - Record game completion
- `GET /api/users/:username/daily-activity` - Get daily activity history

### Session Management

- `POST /api/session/login` - Login user

## Troubleshooting

### Database not found
Make sure you've created the D1 database and updated `wrangler.toml` with the correct `database_id`.

### CORS errors
The worker includes CORS headers. If you still see errors, check that the API_BASE_URL in the frontend matches your deployed worker URL.

### Worker not deploying
Run `wrangler whoami` to ensure you're logged in. Check that all files are valid JavaScript.

### Schema errors
If you need to reset the database:
```bash
# Drop all tables (be careful!)
wrangler d1 execute cdr74-learning-db --command="DROP TABLE IF EXISTS daily_activity"
wrangler d1 execute cdr74-learning-db --command="DROP TABLE IF EXISTS users"

# Re-run schema
wrangler d1 execute cdr74-learning-db --file=./schema.sql
```
