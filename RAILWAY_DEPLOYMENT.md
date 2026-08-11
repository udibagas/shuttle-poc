# Railway Deployment Guide

## Prerequisites

1. Railway account ([railway.app](https://railway.app))
2. Railway CLI (optional): `npm i -g @railway/cli`

## Setup Steps

### 1. Create New Project on Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 2. Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a `DATABASE_URL` variable

### 3. Configure Environment Variables

In Railway project settings, add these variables:

```
DATABASE_URL=<automatically set by Railway PostgreSQL>
JWT_SECRET=<generate a secure random string>
NODE_ENV=production
PORT=3000
```

To generate a secure JWT_SECRET, run:

```bash
openssl rand -base64 32
```

### 4. Configure Build Settings

The project includes `nixpacks.toml` and `railway.json` that automatically configure:

- Bun runtime installation
- Dependency installation
- Prisma client generation
- Start command

### 5. Deploy

#### Option A: From GitHub (Recommended)

1. Connect your GitHub repository to Railway
2. Railway will automatically deploy on every push to main branch

#### Option B: From CLI

```bash
railway login
railway link
railway up
```

### 6. Run Database Migrations

After first deployment, run migrations:

```bash
railway run bun run db:migrate
```

Or from Railway CLI:

```bash
railway run cd apps/api && bun run db:migrate
```

Or add as a deployment hook in railway.json (already configured).

### 7. Seed Database (Optional)

```bash
railway run cd apps/api && bun run db:seed
```

## Environment Variables Reference

| Variable     | Description                  | Required | Default    |
| ------------ | ---------------------------- | -------- | ---------- |
| DATABASE_URL | PostgreSQL connection string | Yes      | -          |
| JWT_SECRET   | Secret key for JWT tokens    | Yes      | -          |
| PORT         | API server port              | No       | 3000       |
| NODE_ENV     | Environment mode             | No       | production |

## Troubleshooting

### "bun not found" Error

✅ Fixed by nixpacks.toml configuration

### Build Fails at Prisma Generate

Ensure DATABASE_URL is set before build runs

### Database Connection Issues

- Check DATABASE_URL format: `postgresql://user:pass@host:port/database`
- Ensure PostgreSQL service is running
- Check Railway service networking is enabled

### Port Issues

Railway automatically sets PORT variable. The app uses `process.env.PORT || 3000`.

## Frontend Configuration

After deploying the API, update frontend environment variables:

1. Get your Railway API URL (e.g., `https://your-app.railway.app`)
2. In Railway, add these variables to your web service:
   ```
   VITE_API_URL=https://your-api.railway.app
   VITE_WS_URL=wss://your-api.railway.app
   ```

## Monitoring

- Check logs in Railway dashboard
- Set up health check endpoint (recommended)
- Monitor database connections in PostgreSQL service

## Custom Domain (Optional)

1. Go to Railway project settings
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
