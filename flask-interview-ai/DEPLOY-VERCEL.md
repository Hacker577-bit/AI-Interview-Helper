# Deploy Flask Interview Prep to Vercel (with Turso database)

This guide walks through deploying this Flask app to Vercel with a persistent serverless SQLite database via Turso.

## Why Turso?

Vercel's serverless functions run on an ephemeral, read-only filesystem. A local `sqlite:///interview_ai.db` file is wiped between function invocations. Turso is a serverless SQLite-compatible database, so your Flask-SQLAlchemy code keeps working with just a different connection URL.

## Step 1: Create a Turso database (one-time)

```bash
# Install Turso CLI
curl -sSfL https://get.turso.tech/setup.sh | sh

# Add to PATH
export PATH="$HOME/.turso:$PATH"

# Login (opens a browser)
turso auth login

# Create a database
turso db create interview-ai

# Get the connection URL (libsql://interview-ai-<your-org>.turso.io)
turso db show interview-ai --url

# Generate an auth token (eyJ...)
turso db tokens create interview-ai
```

Save both values. You will need them in Step 3 and Step 5.

## Step 2: Provision the tables in Turso

Run this from your local machine (it connects to Turso using the env vars):

```bash
cd flask-interview-ai

# Point the app at Turso
export TURSO_DATABASE_URL="libsql://interview-ai-<your-org>.turso.io"
export TURSO_AUTH_TOKEN="eyJ..."

# Install deps and create all tables in the remote database
pip install -r requirements.txt
python init_db.py
# -> "Tables created at: libsql://interview-ai-<your-org>.turso.io"
```

## Step 3: Prepare the project for Vercel

The project is already configured:

- `api/index.py` — serverless entry point exposing the Flask app
- `vercel.json` — routes all traffic to the Flask handler
- `.vercelignore` — excludes `venv/`, `.env`, cache files from the bundle
- `requirements.txt` — includes `sqlalchemy-libsql` (Turso driver)
- `run.py` — `get_database_uri()` builds the Turso URL from env vars

## Step 4: Deploy with the Vercel CLI

```bash
cd flask-interview-ai

# Install the Vercel CLI
npm i -g vercel

# Login (opens browser, one-time)
vercel login

# Deploy to production
vercel --prod
```

The CLI uploads the project, installs `requirements.txt`, builds the Python function, and gives you a production URL.

## Step 5: Set environment variables on Vercel

```bash
# From the project directory
vercel env add TURSO_DATABASE_URL production
# paste: libsql://interview-ai-<your-org>.turso.io

vercel env add TURSO_AUTH_TOKEN production
# paste: eyJ...

vercel env add SECRET_KEY production
# paste: a long random string, e.g. `openssl rand -hex 32`

vercel env add OPENAI_API_KEY production
# paste: sk-... (optional; without it, the app uses fallback questions/feedback)

# Redeploy so the env vars take effect
vercel --prod
```

Or set them in the Vercel dashboard: **Project → Settings → Environment Variables**.

## Step 6: Verify

1. Open your `https://<project>.vercel.app` URL.
2. Visit `/health` — you should see `{"status": "healthy", "database": "connected"}`.
3. Register an account, create an interview, answer the questions, and generate feedback.
4. Log out and back in — your data persists because it lives in Turso, not Vercel.

## Notes

- **File uploads / SQLite file storage don't work on Vercel** — any `sqlite:///...` file usage would be ephemeral. Only the Turso connection works.
- **Cold starts**: the first request after inactivity may take a few seconds.
- **Timeout**: Vercel serverless functions have a max duration. Very long AI feedback calls on the free tier may time out. If you hit this, move feedback generation to a background job or upgrade Vercel.
- **Locally**: the app still uses `sqlite:///interview_ai.db` when `TURSO_DATABASE_URL` is unset — no behavior change for local development.

## Rollback / Undeploy

```bash
vercel remove <project-name> --yes
```
