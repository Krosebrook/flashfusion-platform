# Deployment Guide

This guide covers deploying FlashFusion to production environments.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Supabase Configuration](#supabase-configuration)
- [Vercel Deployment](#vercel-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring Setup](#monitoring-setup)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Node.js >= 20.0.0
- [ ] npm or pnpm installed
- [ ] Git repository with your code
- [ ] Supabase account and project
- [ ] Vercel account
- [ ] Domain name (optional)

---

## Environment Setup

### Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | Yes | Production URL |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` | Sentry error tracking |
| `VERCEL_ANALYTICS_ID` | Vercel Analytics |

### Setting Up Environment Files

1. **Local Development**: `.env.local`
2. **Staging**: Set in Vercel project settings
3. **Production**: Set in Vercel project settings

Never commit `.env.local` or files containing secrets.

---

## Supabase Configuration

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project details:
   - Name: `flashfusion-production`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. Click "Create new project"

### 2. Run Database Migrations

Connect to your database and run the schema migration:

```sql
-- Copy contents of 20251122_flashfusion_core.sql
```

Or use Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Configure Authentication

1. Go to Authentication > Providers
2. Enable desired providers:
   - Email/Password (default)
   - Google OAuth
   - GitHub OAuth

For OAuth providers, configure:
- Client ID
- Client Secret
- Redirect URL: `https://your-domain.com/auth/callback`

### 4. Verify RLS Policies

```bash
# Run RLS verification
npm run verify-rls
```

Expected output:
```
RLS Verification Results
========================
user_profiles: PASS
app_generations: PASS
deployments: PASS

All policies verified successfully.
```

### 5. Get API Keys

1. Go to Project Settings > API
2. Copy the following:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Your Project

```bash
cd your-project
vercel link
```

### 4. Configure Environment Variables

```bash
# Add production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
```

Or configure in Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add each variable for Production environment

### 5. Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### 6. Configure Domain (Optional)

1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### 7. Verify Deployment

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T14:30:00Z"
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  deploy-preview:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Preview
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}

  database-migration:
    needs: deploy-production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Run Migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

### Required Secrets

Add these secrets in GitHub Repository Settings > Secrets:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `SUPABASE_ACCESS_TOKEN` | Supabase access token |
| `SUPABASE_PROJECT_ID` | Supabase project ID |
| `CODECOV_TOKEN` | Codecov upload token |

---

## Monitoring Setup

### Sentry Error Tracking

1. Create a Sentry project at [sentry.io](https://sentry.io)

2. Install Sentry:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. Configure in `sentry.client.config.ts`:
   ```typescript
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 1.0,
     environment: process.env.NODE_ENV,
   });
   ```

### Vercel Analytics

1. Enable in Vercel Dashboard > Analytics

2. Add to your layout:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

### Uptime Monitoring

Set up with UptimeRobot or similar:

1. Create HTTP(s) monitor
2. URL: `https://your-domain.com/api/health`
3. Interval: 5 minutes
4. Alert contacts: Your team email/Slack

---

## Production Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] RLS policies verified
- [ ] Security headers configured

### Deployment

- [ ] Preview deployment tested
- [ ] Database migrations applied
- [ ] Production deployment completed
- [ ] DNS configured (if custom domain)
- [ ] SSL certificate active

### Post-Deployment

- [ ] Health check endpoint responding
- [ ] Authentication flow working
- [ ] Core features functional
- [ ] Error tracking active
- [ ] Analytics recording
- [ ] Uptime monitoring configured

### Security

- [ ] HTTPS enforced
- [ ] Secrets not exposed
- [ ] RLS enabled on all tables
- [ ] Rate limiting active
- [ ] CORS configured correctly
- [ ] Security headers present

---

## Troubleshooting

### Build Failures

**Error**: `Module not found`

Solution:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Error**: `Type errors`

Solution:
```bash
# Run type check locally first
npm run type-check
```

### Database Issues

**Error**: `Connection refused`

Check:
1. Supabase project is active
2. IP not blocked by Supabase
3. Correct connection string

**Error**: `RLS policy violation`

Check:
1. User is authenticated
2. RLS policies are correct
3. Service role key for admin operations

### Deployment Issues

**Error**: `Environment variable not found`

Check:
1. Variable added to Vercel
2. Correct environment (production/preview)
3. Redeploy after adding variables

**Error**: `504 Gateway Timeout`

Check:
1. Function timeout limits (Vercel: 10s hobby, 60s pro)
2. Database query performance
3. External API response times

### Performance Issues

**Slow page loads**:
1. Check Vercel Analytics for bottlenecks
2. Enable caching headers
3. Optimize images with next/image
4. Use SSG/ISR where possible

**High database latency**:
1. Add database indexes
2. Use connection pooling
3. Optimize RLS policies with `(SELECT auth.uid())`
4. Consider read replicas

---

## Rollback Procedures

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

Or in Vercel Dashboard:
1. Go to Deployments
2. Find the previous working deployment
3. Click "..." > "Promote to Production"

### Database Rollback

1. Restore from backup in Supabase Dashboard
2. Or run down migration:
   ```bash
   supabase db reset
   ```

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Issues](https://github.com/flashfusion/uargo/issues)
