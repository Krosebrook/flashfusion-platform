# 01_INTEGRATION_ROADMAP.md
## Applied Integration Roadmap for FlashFusion Ecosystem

**Generated:** 2025-11-22  
**Scope:** FlashFusion Universal App Generator + Deployed Instances Audit  
**Status:** Phase 1 Complete — Integration & Improvement Plan

---

## Executive Summary

**Context:** FlashFusion is a distributed SaaS ecosystem with 40+ deployed instances across 7 platforms (Base44, Vercel, Netlify, Lovable, Bolt, Replit, Blink), built primarily with React/TypeScript/Next.js stack. The core application is a Universal App Generator with modular configuration wizards supporting multiple platforms (Web, Mobile, Desktop, Edge).

**Key Findings:**
- **High deployment fragmentation** across Base44 (7 apps), Vercel (7 apps), Replit (6 apps), and 4 other platforms
- **Mature frontend codebase** with React 18+, TypeScript, Zustand state management, Socket.io realtime updates
- **Missing backend infrastructure** — no visible Supabase schema, auth implementation, or API endpoints
- **Unverified deployments** — 90% completion status unclear; many URLs may be stale or deprecated

**Recommended Action:** Consolidate to Vercel-hosted monorepo with Supabase backend, deprecate 30+ redundant deployments, implement CI/CD pipeline with schema versioning.

---

## File & Deliverable Inventory

| Asset Type | Source/Function | Status | Proposed Action | Rationale |
|-----------|----------------|--------|----------------|-----------|
| **FlashFusion App Generator (React)** | Front-end TypeScript codebase with 13-step wizard | KEEP | Refactor into modular components | Core deliverable; production-ready UI but needs decomposition |
| **Base44 Deployments (7)** | flash-fusion, arch-designer, archon-orchestrator, sole-ignite, aura-flow, fusion-ai, sedona-soul-sessions | AUDIT | Verify live status, migrate or deprecate | Unclear which are active; Base44 platform sustainability unknown |
| **Vercel Deployments (7)** | flashfusion-genesis, int-smart-triage-ai-2-0, v0-template-evaluation-academy, v0-ai-agent-builder, etc. | KEEP (Primary) | Consolidate into monorepo | Vercel is preferred deployment target; merge overlapping projects |
| **Replit Deployments (6)** | flashfusion, auth-connect, spud-signup, sole-much-better, dev-chat, flash-fusion-1 | DEPRECATE | Migrate auth-connect to Supabase | Replit suited for prototyping, not production; extract working auth module |
| **Netlify/Lovable/Bolt** | radiant-elf, cortex-second-brain, lovable-prompt-artist, flashfusion-design-system | AUDIT | Determine unique features | Likely duplicates; preserve only differentiated functionality |
| **Integration Roadmap Template** | Google Doc (Oct 29, 2025) | KEEP | Use as governance baseline | Already defines Supabase schema diff methodology |
| **Master Project Registry** | Google Doc (Aug 28, 2025) | KEEP | Update with FlashFusion status | Contains project management framework; needs FlashFusion entry |
| **Supabase Schema** | NOT FOUND | CREATE | Implement migrations per template | Critical gap — no database layer identified |
| **CI/CD Pipeline** | NOT FOUND | CREATE | GitHub Actions + Supabase CLI | Essential for deterministic deployment |
| **Auth System** | Partial (Replit auth-connect) | MIGRATE | Port to Supabase Auth + RLS | Centralize authentication; enable row-level security |

### Overlaps & Redundancies

**High-Risk Duplicates:**
- `flash-fusion-4e98fe60.base44.app` vs `flashfusion.replit.app` vs `flashfusion-genesis.vercel.app` — **3 instances of same app**
- `v0-template-evaluation-academy` (both Vercel domain and subdomain) — **2 URLs, 1 project**
- `auth-connect-kylerosebrook.replit.app` vs integrated auth in App Generator — **Competing auth implementations**

**Preservation Candidates:**
- `int-smart-triage-ai-2-0.vercel.app` — Unique triage feature set
- `cortex-second-brain-4589.lovable.app` — Knowledge management differentiation
- `v0-ai-powered-animation-studio` — Specialized animation tooling

---

## Integration & Improvement Plan

### Supabase Schema Diff Migration

```sql
-- Migration: 20251122_flashfusion_core_schema.sql
-- Purpose: Establish baseline database for FlashFusion ecosystem

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
    platform TEXT NOT NULL, -- web, mobile, desktop, edge, extension, cli
    framework TEXT NOT NULL, -- react, nextjs, flutter, tauri, etc.
    config JSONB NOT NULL, -- Stores full GenerationRequest object
    status TEXT NOT NULL DEFAULT 'pending', -- pending, validating, generating, complete, error
    progress INTEGER DEFAULT 0,
    logs TEXT[] DEFAULT '{}',
    download_url TEXT,
    cost_estimate JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Deployment tracking (for audit purposes)
CREATE TABLE IF NOT EXISTS public.deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_generation_id UUID REFERENCES public.app_generations,
    platform TEXT NOT NULL, -- vercel, base44, replit, netlify, etc.
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, deprecated, stale
    last_verified TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_generations_user_id ON public.app_generations (user_id);
CREATE INDEX IF NOT EXISTS idx_app_generations_status ON public.app_generations (status);
CREATE INDEX IF NOT EXISTS idx_deployments_app_generation_id ON public.deployments (app_generation_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON public.deployments (status);

-- Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own generations" ON public.app_generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations" ON public.app_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their deployments" ON public.deployments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.app_generations
            WHERE app_generations.id = deployments.app_generation_id
            AND app_generations.user_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_generations_updated_at BEFORE UPDATE ON public.app_generations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deployments_updated_at BEFORE UPDATE ON public.deployments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### CI/CD Implementation Plan

**GitHub Actions Workflow** (``.github/workflows/deploy.yml`):

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

**Pre-Merge Quality Gates:**
1. TypeScript compilation (`tsc --noEmit`)
2. ESLint with security rules (`eslint . --ext .ts,.tsx`)
3. Unit tests with 80%+ coverage (`jest --coverage`)
4. Supabase schema diff validation
5. Integration tests against staging Supabase

**Deployment Steps (Post-Merge):**
1. Execute schema migrations (`supabase db push`)
2. Build Next.js production bundle (`npm run build`)
3. Deploy to Vercel production (`vercel --prod`)
4. Run smoke tests against production URL
5. Update deployment tracking table

---

## Phase Roadmap

| Phase | Deliverable | Dependencies | Timeline | Owner |
|-------|------------|--------------|----------|-------|
| **1.1** | Deployment Audit | Access to all platform dashboards | Week 1 | DevOps |
| **1.2** | Supabase Setup | Schema migration script approved | Week 1-2 | Backend |
| **1.3** | Monorepo Migration | Vercel project configured | Week 2-3 | Frontend |
| **1.4** | Auth Integration | Supabase Auth enabled, RLS policies | Week 3 | Full-Stack |
| **1.5** | CI/CD Pipeline | GitHub Actions secrets configured | Week 3-4 | DevOps |
| **1.6** | Deprecation Campaign | Deployment audit complete | Week 4 | Product |
| **1.7** | Production Launch | All phases complete, QA passed | Week 5 | All |

### Dependencies Graph

```
1.1 Deployment Audit
  ↓
1.2 Supabase Setup → 1.4 Auth Integration
  ↓                        ↓
1.3 Monorepo Migration  → 1.5 CI/CD Pipeline
                             ↓
                        1.6 Deprecation
                             ↓
                        1.7 Production Launch
```

---

## Cumulative Output Projection

### Final System Architecture

**Post-Integration State:**

1. **Single Production URL:** `https://flashfusion.vercel.app`
2. **Unified Codebase:** Next.js 14+ monorepo (`/apps/web`, `/packages/ui`, `/packages/db`)
3. **Centralized Database:** Supabase Postgres with RLS
4. **Authentication:** Supabase Auth with OAuth providers (Google, GitHub, Email)
5. **Real-time Updates:** Supabase Realtime subscriptions (replaces Socket.io)
6. **File Storage:** Supabase Storage for generated app archives
7. **CI/CD:** GitHub Actions with automated schema migrations
8. **Monitoring:** Vercel Analytics + Supabase Logs + Sentry error tracking

**Retired Assets:** 30+ redundant deployments across Base44, Replit, Netlify, Lovable, Bolt

**Preserved Features:**
- 13-step configuration wizard (refactored)
- Platform/framework selection matrix
- Real-time generation progress tracking
- Cost estimation engine
- Download management system
- Triage AI features (from int-smart-triage-ai-2-0)
- Animation studio tools (from v0-ai-powered-animation-studio)

---

## Gaps & Blindspots

### Known Gaps
1. **No Backend API** — Frontend references `localhost:3000/api` but no implementation found
2. **Missing Environment Config** — No `.env.example` or environment documentation
3. **Unverified Deployment Status** — Cannot confirm which of 40+ URLs are actually live
4. **No Test Suite** — Zero test files identified in codebase sample
5. **Unclear Domain Ownership** — www.flashfusion.co mentioned but not verified
6. **No Documentation** — Missing README, API docs, deployment guides

### Blindspots
1. **Unknown Codebase Size** — Only saw single file; full repo structure unknown
2. **Licensing Ambiguity** — No LICENSE file or OSS contribution guidelines
3. **Performance Metrics** — No baseline load times, bundle sizes, or SLOs defined
4. **Security Posture** — No evidence of security audits, OWASP compliance, or penetration testing
5. **Data Retention Policy** — Undefined how long generated apps are stored
6. **Cost Attribution** — No tracking of compute/storage costs per user

### Unknown Unknowns
- **Actual User Base** — Are these deployments for testing or do they have production traffic?
- **Revenue Model** — Is Stripe integration live? Any paying customers?
- **Technical Debt Scope** — How much legacy code exists in 90% completed projects?
- **Team Size** — Solo developer or team? Impacts maintenance strategy
- **Legal Compliance** — GDPR, CCPA, SOC2 requirements if handling user data

---

## Acceptance Criteria Validation

✅ **A/C 1.1:** All assets categorized (KEEP/MODIFY/REMOVE) with technical rationale  
✅ **A/C 1.2:** Supabase schema migration script generated  
✅ **A/C 1.3:** CI/CD implementation plan with GitHub Actions workflow  
✅ **A/C 1.4:** Cumulative output projection with final architecture diagram  

**Status:** Phase 1 Complete — Ready for Phase 2 Meta-Analytic Report

---

## Next Steps

1. **Validate Deployment Status** — Run health checks on all 40+ URLs, mark stale instances
2. **Initialize Supabase Project** — Create new project, run schema migration
3. **Create Monorepo Structure** — Scaffold Turborepo with Next.js, shared packages
4. **Implement Backend API** — Build Express/Next.js API routes matching frontend expectations
5. **Write Tests** — Achieve 80%+ coverage before production migration
6. **Document Everything** — README, API docs, deployment guides, architecture decision records (ADRs)
7. **Security Audit** — OWASP Top 10 compliance check, dependency vulnerability scan
8. **Cost Modeling** — Establish per-user cost attribution for Vercel/Supabase usage
9. **Trigger Phase 2** — Begin Meta-Analytic Research & Hardened Output Roadmap

**Owner:** Kyle Rosebrook  
**Review Date:** 2025-11-29  
**Approval Required:** Product Owner, Tech Lead, Security Lead
