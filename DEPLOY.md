# Deploy to Vercel with Supabase

## Prerequisites

- GitHub account
- Vercel account (https://vercel.com)
- Supabase account (https://supabase.com)
- Node.js 18+

## Step 1: Set up Supabase

1. Go to https://supabase.com and create a new project
2. Choose a region close to your users
3. Set a secure database password (save it!)
4. Wait for the database to provision (~2 minutes)
5. Go to Project Settings > Database
6. Under "Connection string", select "URI"
7. Copy the "Transaction" pooler connection string (port 6543) - this is `DATABASE_URL`
8. Copy the "Session" pooler connection string (port 5432) - this is `DIRECT_DATABASE_URL`
9. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-interview-copilot.git
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - Framework: Next.js (auto-detected)
   - Build Command: `npx prisma generate && next build`
   - Install Command: `npm install`
   - Output Directory: `.next`
4. Add Environment Variables (copy from `.env`):
   - `DATABASE_URL` - Your Supabase transaction pooler URL
   - `DIRECT_DATABASE_URL` - Your Supabase session pooler URL
   - `JWT_SECRET` - A random 64-character string
   - `OPENAI_API_KEY` - (optional) Your OpenAI API key
   - `STRIPE_SECRET_KEY` - (optional) Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - (optional) Your Stripe webhook secret
   - `STRIPE_PRO_MONTHLY_PRICE_ID` - (optional) Stripe price ID for Pro monthly
   - `STRIPE_PRO_YEARLY_PRICE_ID` - (optional) Stripe price ID for Pro yearly
   - `STRIPE_ENTERPRISE_PRICE_ID` - (optional) Stripe price ID for Enterprise
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - (optional) Stripe publishable key
   - `ADMIN_EMAIL` - Your email for admin access
   - `NEXT_PUBLIC_APP_URL` - Your Vercel app URL (after first deploy)
   - `NEXT_PUBLIC_APP_NAME` - "AI Interview Copilot"
5. Click "Deploy"

### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Follow the prompts. Add environment variables when asked.

## Step 4: Run Database Migrations

After deployment, run Prisma migrations on Supabase:

```bash
# Set the DATABASE_URL to your Supabase connection string
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres"
export DIRECT_DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# Run migrations
npx prisma migrate deploy

# Seed the database
npm run db:seed
```

## Step 5: Configure Stripe Webhooks (Optional)

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://YOUR_APP.vercel.app/api/webhook/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add `STRIPE_WEBHOOK_SECRET` to Vercel environment variables
6. Redeploy

## Step 6: Verify Deployment

1. Visit your Vercel app URL
2. Sign up with a test account
3. Upload a resume
4. Start an interview
5. Verify feedback generation works

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase transaction pooler URL (port 6543) |
| `DIRECT_DATABASE_URL` | Yes | Supabase session pooler URL (port 5432) |
| `JWT_SECRET` | Yes | Random string for JWT signing |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for payments |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | No | Stripe price ID for Pro monthly plan |
| `STRIPE_PRO_YEARLY_PRICE_ID` | No | Stripe price ID for Pro yearly plan |
| `STRIPE_ENTERPRISE_PRICE_ID` | No | Stripe price ID for Enterprise plan |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key |
| `ADMIN_EMAIL` | No | Email for admin panel access |
| `NEXT_PUBLIC_APP_URL` | Yes | Your deployed app URL |
| `NEXT_PUBLIC_APP_NAME` | No | App display name (default: "AI Interview Copilot") |

## Troubleshooting

### Build fails with "Prisma Client not found"

Add `npx prisma generate` to your build command in `vercel.json` or Vercel dashboard.

### Database connection errors

- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure IP restrictions are not blocking Vercel (use `0.0.0.0/0` or disable)

### 500 errors on API routes

- Check Vercel function logs in the dashboard
- Verify `JWT_SECRET` is set
- Ensure `DIRECT_DATABASE_URL` is set correctly

### File uploads not working

- Vercel's filesystem is ephemeral
- Configure Supabase Storage for production file uploads
- Or use an S3-compatible storage service
