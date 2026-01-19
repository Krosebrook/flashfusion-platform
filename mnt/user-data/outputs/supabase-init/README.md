# FlashFusion Supabase Initialization Kit

**Purpose:** Complete Supabase project setup with schema migration, RLS policies, and local development environment.

---

## Prerequisites

- Node.js 20+
- Supabase CLI (`npm install -g supabase`)
- Supabase account (https://supabase.com)

---

## Quick Start

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project (or create new)
supabase link --project-ref your-project-ref

# 4. Run migrations
supabase db push

# 5. Verify RLS policies
npm run verify-rls

# 6. Seed sample data (optional)
npm run seed
```

---

## Project Structure

```
supabase-init/
├── README.md                          # This file
├── package.json                       # NPM scripts
├── .env.example                       # Environment template
├── migrations/
│   └── 20251122_flashfusion_core.sql # Schema migration
├── scripts/
│   ├── verify-rls.ts                 # Test RLS policies
│   ├── seed.ts                       # Sample data generator
│   └── health-check.ts               # Connection test
└── tests/
    └── rls.test.ts                   # Automated RLS tests
```

---

## Step-by-Step Setup

### Step 1: Create Supabase Project

**Option A: Via CLI**
```bash
supabase projects create flashfusion --org-id your-org-id --db-password your-secure-password
```

**Option B: Via Dashboard**
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: FlashFusion
4. Database Password: (save securely)
5. Region: Choose closest to users (us-east-1 recommended)
6. Pricing Plan: Free tier for MVP

### Step 2: Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit .env with your values
nano .env
```

Required variables:
```env
# From Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Keep secret!

# Database connection (for migrations)
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
```

### Step 3: Run Schema Migration

```bash
# Dry run (preview changes)
supabase db diff --no-check-migration-history

# Apply migration
supabase db push

# Verify tables created
supabase db list
```

**Expected Output:**
```
✓ user_profiles table created
✓ app_generations table created
✓ deployments table created
✓ 9 indexes created
✓ 6 RLS policies enabled
✓ 3 triggers created
```

### Step 4: Enable Authentication

```bash
# Configure auth providers
supabase secrets set AUTH_GOOGLE_CLIENT_ID=your-google-client-id
supabase secrets set AUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret
supabase secrets set AUTH_GITHUB_CLIENT_ID=your-github-client-id
supabase secrets set AUTH_GITHUB_CLIENT_SECRET=your-github-client-secret
```

**In Supabase Dashboard:**
1. Go to Authentication > Providers
2. Enable Google OAuth
3. Enable GitHub OAuth
4. Enable Email/Password
5. Configure redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://flashfusion.vercel.app/auth/callback` (production)

### Step 5: Verify RLS Policies

```bash
npm run verify-rls
```

**This script tests:**
- Users can only read their own profile
- Users can only create generations with their user_id
- Users cannot access other users' generations
- Anonymous users are blocked from all operations

### Step 6: Seed Sample Data (Optional)

```bash
npm run seed
```

**Creates:**
- 3 sample user profiles
- 10 sample app generations
- 5 sample deployments

---

## Testing RLS Policies

Run automated tests:
```bash
npm test
```

Manual testing:
```bash
# Test as authenticated user
npm run test-rls:authenticated

# Test as anonymous user (should fail)
npm run test-rls:anonymous
```

---

## Troubleshooting

### Error: "relation public.user_profiles does not exist"
**Cause:** Migration not applied  
**Fix:** Run `supabase db push`

### Error: "JWT expired"
**Cause:** Anon key is old  
**Fix:** Regenerate from Supabase Dashboard > Settings > API

### Error: "new row violates row-level security policy"
**Cause:** User trying to access unauthorized data  
**Fix:** This is expected behavior; RLS is working correctly

### Error: "Could not connect to database"
**Cause:** Invalid DATABASE_URL  
**Fix:** Verify connection string from Supabase Dashboard

---

## Security Checklist

Before production deployment:

- [ ] Change default database password
- [ ] Rotate all API keys
- [ ] Enable RLS on all tables
- [ ] Test RLS policies with real users
- [ ] Configure auth provider production credentials
- [ ] Set up database backups (Supabase Dashboard > Database > Backups)
- [ ] Enable 2FA on Supabase account
- [ ] Review audit logs weekly
- [ ] Set up alerting for suspicious activity

---

## Monitoring & Maintenance

### Database Health Check
```bash
npm run health-check
```

### View Active Connections
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'postgres';
```

### Monitor Table Sizes
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Next Steps

After Supabase setup is complete:

1. **Integrate with Next.js** → Follow `/monorepo-scaffold/README.md`
2. **Build API routes** → Use Supabase client in `/app/api` endpoints
3. **Implement auth flow** → Add login/signup pages
4. **Test end-to-end** → User signup → Generate app → Download

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com
- **Status Page:** https://status.supabase.com

**Estimated Setup Time:** 30-60 minutes
