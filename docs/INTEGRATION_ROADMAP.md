# Integration Roadmap

**Document Version**: 1.0
**Date**: November 22, 2025
**Scope**: FlashFusion Universal App Generator + Deployed Instances Audit
**Status**: Phase 1 Complete

---

## Executive Summary

FlashFusion is a distributed SaaS ecosystem with 40+ deployed instances across 7 platforms (Base44, Vercel, Netlify, Lovable, Bolt, Replit, Blink), built primarily with React/TypeScript/Next.js stack. The core application is a Universal App Generator with modular configuration wizards supporting multiple platforms (Web, Mobile, Desktop, Edge).

### Key Findings

- High deployment fragmentation across Base44 (7 apps), Vercel (7 apps), Replit (6 apps), and 4 other platforms
- Mature frontend codebase with React 18+, TypeScript, Zustand state management, Socket.io real-time updates
- Missing backend infrastructure: no visible Supabase schema, auth implementation, or API endpoints
- Unverified deployments: 90% completion status unclear; many URLs may be stale or deprecated

### Recommended Action

Consolidate to Vercel-hosted monorepo with Supabase backend, deprecate 30+ redundant deployments, implement CI/CD pipeline with schema versioning.

---

## Asset Inventory

### Deployment Catalog

| Asset Type | Source/Function | Status | Action | Rationale |
|------------|-----------------|--------|--------|-----------|
| FlashFusion App Generator (React) | Front-end TypeScript codebase with 13-step wizard | KEEP | Refactor into modular components | Core deliverable; production-ready UI |
| Base44 Deployments (7) | flash-fusion, arch-designer, archon-orchestrator, sole-ignite, aura-flow, fusion-ai, sedona-soul-sessions | AUDIT | Verify live status, migrate or deprecate | Platform sustainability unknown |
| Vercel Deployments (7) | flashfusion-genesis, int-smart-triage-ai-2-0, v0-template-evaluation-academy, v0-ai-agent-builder | KEEP | Consolidate into monorepo | Preferred deployment target |
| Replit Deployments (6) | flashfusion, auth-connect, spud-signup, sole-much-better, dev-chat, flash-fusion-1 | DEPRECATE | Migrate auth-connect to Supabase | Not suitable for production |
| Netlify/Lovable/Bolt | radiant-elf, cortex-second-brain, lovable-prompt-artist, flashfusion-design-system | AUDIT | Determine unique features | Likely duplicates |
| Supabase Schema | NOT FOUND | CREATE | Implement migrations | Critical gap |
| CI/CD Pipeline | NOT FOUND | CREATE | GitHub Actions + Supabase CLI | Essential for deployment |
| Auth System | Partial (Replit auth-connect) | MIGRATE | Port to Supabase Auth + RLS | Centralize authentication |

### Identified Duplicates

**High-Risk Duplicates**:
- `flash-fusion-4e98fe60.base44.app` vs `flashfusion.replit.app` vs `flashfusion-genesis.vercel.app` (3 instances of same app)
- `v0-template-evaluation-academy` (both Vercel domain and subdomain - 2 URLs, 1 project)
- `auth-connect-kylerosebrook.replit.app` vs integrated auth in App Generator (competing implementations)

**Preservation Candidates**:
- `int-smart-triage-ai-2-0.vercel.app` - Unique triage feature set
- `cortex-second-brain-4589.lovable.app` - Knowledge management differentiation
- `v0-ai-powered-animation-studio` - Specialized animation tooling

---

## Database Schema

### Core Tables

```sql
-- Migration: 20251122_flashfusion_core_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- App generation requests
CREATE TABLE IF NOT EXISTS public.app_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles NOT NULL,
    app_name TEXT NOT NULL,
    platform TEXT NOT NULL,
    framework TEXT NOT NULL,
    config JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    logs TEXT[] DEFAULT '{}',
    download_url TEXT,
    cost_estimate JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Deployment tracking
CREATE TABLE IF NOT EXISTS public.deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_generation_id UUID REFERENCES public.app_generations,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    last_verified TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_generations_user_id ON public.app_generations (user_id);
CREATE INDEX IF NOT EXISTS idx_app_generations_status ON public.app_generations (status);
CREATE INDEX IF NOT EXISTS idx_deployments_app_generation_id ON public.deployments (app_generation_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON public.deployments (status);
```

### Row Level Security

```sql
-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Policies (optimized with cached auth.uid())
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can view their own generations" ON public.app_generations
    FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own generations" ON public.app_generations
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their deployments" ON public.deployments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.app_generations
            WHERE app_generations.id = deployments.app_generation_id
            AND app_generations.user_id = (SELECT auth.uid())
        )
    );
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy FlashFusion

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  database-diff:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase db diff --no-check-migration-history
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

  deploy:
    runs-on: ubuntu-latest
    needs: [test, database-diff]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Quality Gates

1. TypeScript compilation (`tsc --noEmit`)
2. ESLint with security rules
3. Unit tests with 80%+ coverage
4. Supabase schema diff validation
5. Integration tests against staging

---

## Implementation Phases

| Phase | Deliverable | Dependencies | Timeline | Owner |
|-------|-------------|--------------|----------|-------|
| 1.1 | Deployment Audit | Platform dashboard access | Week 1 | DevOps |
| 1.2 | Supabase Setup | Schema migration approved | Week 1-2 | Backend |
| 1.3 | Monorepo Migration | Vercel project configured | Week 2-3 | Frontend |
| 1.4 | Auth Integration | Supabase Auth enabled | Week 3 | Full-Stack |
| 1.5 | CI/CD Pipeline | GitHub Actions secrets | Week 3-4 | DevOps |
| 1.6 | Deprecation Campaign | Deployment audit complete | Week 4 | Product |
| 1.7 | Production Launch | All phases complete | Week 5 | All |

### Dependency Graph

```
1.1 Deployment Audit
  |
  v
1.2 Supabase Setup --> 1.4 Auth Integration
  |                          |
  v                          v
1.3 Monorepo Migration --> 1.5 CI/CD Pipeline
                               |
                               v
                          1.6 Deprecation
                               |
                               v
                          1.7 Production Launch
```

---

## Target Architecture

### Post-Integration State

1. **Single Production URL**: `https://flashfusion.vercel.app`
2. **Unified Codebase**: Next.js 14+ monorepo (`/apps/web`, `/packages/ui`, `/packages/db`)
3. **Centralized Database**: Supabase PostgreSQL with RLS
4. **Authentication**: Supabase Auth with OAuth providers (Google, GitHub, Email)
5. **Real-time Updates**: Supabase Realtime subscriptions
6. **File Storage**: Supabase Storage for generated app archives
7. **CI/CD**: GitHub Actions with automated schema migrations
8. **Monitoring**: Vercel Analytics + Supabase Logs + Sentry

### Retired Assets

30+ redundant deployments across Base44, Replit, Netlify, Lovable, Bolt

### Preserved Features

- 13-step configuration wizard (refactored)
- Platform/framework selection matrix
- Real-time generation progress tracking
- Cost estimation engine
- Download management system
- Triage AI features (from int-smart-triage-ai-2-0)
- Animation studio tools (from v0-ai-powered-animation-studio)

---

## Known Gaps

### Identified Gaps

1. No Backend API - Frontend references `localhost:3000/api` but no implementation
2. Missing Environment Config - No `.env.example` or environment documentation
3. Unverified Deployment Status - Cannot confirm which URLs are live
4. No Test Suite - Zero test files identified
5. Unclear Domain Ownership - www.flashfusion.co mentioned but not verified
6. No Documentation - Missing README, API docs, deployment guides

### Blindspots

1. Unknown codebase size - Full repository structure unclear
2. Licensing ambiguity - No LICENSE file
3. Performance metrics - No baseline measurements
4. Security posture - No audit evidence
5. Data retention policy - Undefined
6. Cost attribution - No tracking per user

---

## Acceptance Criteria

- [x] All assets categorized (KEEP/MODIFY/REMOVE) with technical rationale
- [x] Supabase schema migration script generated
- [x] CI/CD implementation plan with GitHub Actions workflow
- [x] Cumulative output projection with final architecture

**Status**: Phase 1 Complete

---

## Next Steps

1. Validate deployment status - Run health checks on all 40+ URLs
2. Initialize Supabase project - Create project, run schema migration
3. Create monorepo structure - Scaffold Turborepo with Next.js
4. Implement backend API - Build API routes matching frontend expectations
5. Write tests - Achieve 80%+ coverage before production
6. Document everything - README, API docs, deployment guides, ADRs
7. Security audit - OWASP Top 10 compliance check
8. Cost modeling - Establish per-user cost attribution

---

**Document Owner**: Engineering Team
**Review Date**: One week from document date
**Approval Required**: Product Owner, Tech Lead, Security Lead
