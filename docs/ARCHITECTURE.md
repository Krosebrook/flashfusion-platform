# Architecture Documentation

This document describes the system architecture of the FlashFusion platform.

---

## Table of Contents

- [System Overview](#system-overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
- [Database Schema](#database-schema)
- [Security Architecture](#security-architecture)
- [Design Decisions](#design-decisions)

---

## System Overview

FlashFusion is a deployment health audit and universal app generator platform built on a modern TypeScript stack. The system consists of two primary components:

1. **Audit Engine**: CLI-based tools for monitoring deployment health across multiple platforms
2. **Web Application**: Next.js-based SaaS platform for app generation and management

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FlashFusion Platform                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────┐    ┌────────────────────────────┐           │
│  │      Audit Subsystem       │    │     Web Application        │           │
│  ├────────────────────────────┤    ├────────────────────────────┤           │
│  │                            │    │                            │           │
│  │  ┌──────────┐              │    │  ┌──────────┐              │           │
│  │  │ audit.ts │──────────┐   │    │  │ Next.js  │              │           │
│  │  └──────────┘          │   │    │  │  Server  │              │           │
│  │        │               │   │    │  └────┬─────┘              │           │
│  │        ▼               │   │    │       │                    │           │
│  │  ┌──────────┐          │   │    │       ▼                    │           │
│  │  │analyze.ts│          │   │    │  ┌──────────┐              │           │
│  │  └──────────┘          │   │    │  │   API    │              │           │
│  │        │               │   │    │  │  Routes  │              │           │
│  │        ▼               │   │    │  └────┬─────┘              │           │
│  │  ┌──────────┐          │   │    │       │                    │           │
│  │  │export.ts │          │   │    │       ▼                    │           │
│  │  └──────────┘          │   │    │  ┌──────────┐              │           │
│  │        │               │   │    │  │   UI     │              │           │
│  │        ▼               │   │    │  │Components│              │           │
│  │  ┌──────────┐          │   │    │  └──────────┘              │           │
│  │  │ reports/ │          │   │    │                            │           │
│  │  └──────────┘          │   │    └────────────────────────────┘           │
│  │                        │   │                 │                            │
│  └────────────────────────┘   │                 │                            │
│                               │                 │                            │
│  ┌────────────────────────────┴─────────────────┴───────────────┐           │
│  │                                                               │           │
│  │                         Supabase                              │           │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │           │
│  │  │  PostgreSQL │  │    Auth     │  │   Storage   │           │           │
│  │  │    + RLS    │  │   Service   │  │   Bucket    │           │           │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │           │
│  │                                                               │           │
│  └───────────────────────────────────────────────────────────────┘           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Audit Engine Components

```
Audit Engine
├── audit.ts          # Core health checking
│   ├── testUrl()     # HTTP/SSL testing
│   ├── determineStatus()  # Status classification
│   └── makeRecommendation()  # Action recommendation
│
├── analyze.ts        # Analysis and recommendations
│   ├── analyzeDeployment()  # Per-deployment analysis
│   ├── generateReport()     # Report compilation
│   └── checkRLS()           # Security validation
│
├── export.ts         # Report generation
│   ├── exportCSV()   # CSV format
│   ├── exportMarkdown()  # Markdown format
│   └── exportJSON()  # JSON format
│
├── health-check.ts   # Infrastructure validation
│   ├── checkDatabase()  # DB connectivity
│   ├── checkAuth()      # Auth service
│   └── checkTables()    # Schema validation
│
└── verify-rls.ts     # RLS policy testing
    ├── testReadPolicy()   # SELECT policies
    ├── testWritePolicy()  # INSERT/UPDATE policies
    └── testCrossUser()    # Isolation testing
```

### Web Application Components

```
Next.js Application
├── app/
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Landing page
│   └── api/
│       └── health/
│           └── route.ts  # Health endpoint
│
├── middleware.ts     # Request interceptor
│   ├── Authentication
│   ├── Rate limiting
│   ├── CSRF protection
│   └── Security headers
│
└── lib/
    └── supabase.ts   # Database clients
        ├── createClient()           # Browser client
        ├── createServerSupabaseClient()  # Server read
        └── createServerActionClient()    # Server write
```

---

## Data Flow

### Audit Pipeline Flow

```
┌─────────────┐
│deployments  │
│   .json     │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                         audit.ts                                  │
├──────────────────────────────────────────────────────────────────┤
│  1. Load deployments from JSON                                    │
│  2. Group by platform                                             │
│  3. For each URL (parallel):                                      │
│     ├── Send HTTP GET request                                     │
│     ├── Measure response time                                     │
│     ├── Validate SSL certificate                                  │
│     └── Record HTTP status                                        │
│  4. Classify status (alive/slow/degraded/dead/ssl-invalid)        │
│  5. Generate recommendations                                      │
│  6. Write audit-TIMESTAMP.json                                    │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                        analyze.ts                                 │
├──────────────────────────────────────────────────────────────────┤
│  1. Load audit results                                            │
│  2. Join with deployment metadata                                 │
│  3. Analyze each deployment:                                      │
│     ├── Evaluate health status                                    │
│     ├── Check purpose (primary/testing/deprecated)                │
│     ├── Assess platform risk                                      │
│     └── Determine action (KEEP/MIGRATE/DEPRECATE/REVIEW)          │
│  4. Calculate platform statistics                                 │
│  5. Identify migration phases                                     │
│  6. Write analysis-TIMESTAMP.json                                 │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                         export.ts                                 │
├──────────────────────────────────────────────────────────────────┤
│  1. Load analysis results                                         │
│  2. Transform to output format                                    │
│  3. Generate:                                                     │
│     ├── CSV (spreadsheet-compatible)                              │
│     ├── Markdown (documentation)                                  │
│     └── JSON (programmatic access)                                │
│  4. Write to reports/ directory                                   │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│  reports/   │
│  ├── .csv   │
│  ├── .md    │
│  └── .json  │
└─────────────┘
```

### Web Application Request Flow

```
┌──────────┐
│  Client  │
│ (Browser)│
└────┬─────┘
     │ HTTPS Request
     ▼
┌──────────────────────────────────────────────────────────────────┐
│                      middleware.ts                                │
├──────────────────────────────────────────────────────────────────┤
│  1. Rate limiting check                                           │
│  2. CSRF validation (for mutations)                               │
│  3. Session refresh                                               │
│  4. Protected route enforcement                                   │
│  5. Security headers injection                                    │
└──────────────────────────────────────────────────────────────────┘
     │
     ├─────────────────────┬─────────────────────┐
     ▼                     ▼                     ▼
┌──────────┐        ┌──────────┐         ┌──────────┐
│   Page   │        │   API    │         │  Server  │
│Component │        │  Route   │         │  Action  │
└────┬─────┘        └────┬─────┘         └────┬─────┘
     │                   │                    │
     │                   │                    │
     └───────────────────┴────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                       supabase.ts                                 │
├──────────────────────────────────────────────────────────────────┤
│  Client Selection:                                                │
│  ├── Browser → createClient() [anon key]                          │
│  ├── Server Component → createServerSupabaseClient() [read-only]  │
│  └── Server Action → createServerActionClient() [read-write]      │
└──────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Supabase                                   │
├──────────────────────────────────────────────────────────────────┤
│  1. JWT validation                                                │
│  2. RLS policy enforcement                                        │
│  3. Query execution                                               │
│  4. Response                                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | >= 20.0.0 | JavaScript runtime |
| Language | TypeScript | 5.3.3 | Type-safe JavaScript |
| Framework | Next.js | 14.0.4 | React framework with SSR |
| UI Library | React | 18.x | Component library |

### Frontend

| Technology | Purpose |
|------------|---------|
| Tailwind CSS 3.4 | Utility-first CSS |
| Radix UI | Accessible components |
| Lucide React | Icon library |
| Zustand 4.4 | State management |

### Backend

| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL database + Auth |
| Next.js API Routes | REST endpoints |
| Server Actions | Mutations |
| Zod | Runtime validation |

### Build & DevOps

| Technology | Purpose |
|------------|---------|
| Turborepo 1.11 | Monorepo management |
| pnpm 8.14 | Package manager |
| tsx 4.7 | TypeScript executor |
| Vitest | Testing framework |
| Playwright | E2E testing |

### Monitoring

| Technology | Purpose |
|------------|---------|
| Sentry | Error tracking |
| Vercel Analytics | Performance monitoring |

---

## Directory Structure

```
uargo/
├── Configuration
│   ├── package.json          # Dependencies and scripts
│   ├── tsconfig.json         # TypeScript configuration
│   ├── turbo.json            # Turborepo pipeline
│   ├── next.config.js        # Next.js settings
│   ├── tailwind.config.ts    # Tailwind CSS
│   ├── vitest.config.ts      # Test configuration
│   └── .env.example          # Environment template
│
├── Application Core
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── globals.css       # Global styles
│   │   └── api/              # API routes
│   │
│   ├── middleware.ts         # Request middleware
│   └── lib/
│       ├── supabase.ts       # Database clients
│       ├── env.ts            # Environment validation
│       └── errors.ts         # Error classes
│
├── Audit Engine
│   ├── audit.ts              # Health checking
│   ├── analyze.ts            # Analysis engine
│   ├── export.ts             # Report generation
│   ├── health-check.ts       # Infrastructure checks
│   ├── verify-rls.ts         # RLS validation
│   └── seed.ts               # Database seeding
│
├── Data
│   ├── deployments.json      # URL catalog
│   └── migrations/           # SQL migrations
│
├── Documentation
│   ├── README.md
│   ├── CONTRIBUTING.md
│   ├── SECURITY.md
│   ├── CHANGELOG.md
│   └── docs/
│       ├── ARCHITECTURE.md   # This file
│       ├── API.md            # API reference
│       └── DEPLOYMENT.md     # Deployment guide
│
├── Testing
│   ├── __tests__/            # Unit tests
│   └── e2e/                  # E2E tests
│
└── Output
    └── reports/              # Generated reports (gitignored)
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐
│    auth.users       │
│  (Supabase Auth)    │
└──────────┬──────────┘
           │
           │ 1:1
           ▼
┌─────────────────────┐
│   user_profiles     │
├─────────────────────┤
│ id (PK, FK)         │
│ email               │
│ display_name        │
│ avatar_url          │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│  app_generations    │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ app_name            │
│ platform            │
│ framework           │
│ config (JSONB)      │
│ status              │
│ progress            │
│ logs                │
│ download_url        │
│ cost_estimate       │
│ error_message       │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│    deployments      │
├─────────────────────┤
│ id (PK)             │
│ app_generation_id   │
│ platform            │
│ url                 │
│ status              │
│ last_verified       │
│ metadata (JSONB)    │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

### Table Definitions

See `20251122_flashfusion_core.sql` for complete schema.

---

## Security Architecture

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│ Supabase │────▶│  Auth    │
│          │     │   Auth   │     │ Provider │
└──────────┘     └──────────┘     └──────────┘
     │                │
     │                │ JWT Token
     │                ▼
     │           ┌──────────┐
     │           │  Cookie  │
     │           │ (httpOnly)│
     │           └──────────┘
     │                │
     ▼                ▼
┌─────────────────────────────────────┐
│           middleware.ts              │
├─────────────────────────────────────┤
│  1. Read session cookie              │
│  2. Validate JWT                     │
│  3. Refresh if needed                │
│  4. Attach to request                │
└─────────────────────────────────────┘
```

### Row-Level Security (RLS)

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can view own generations"
  ON app_generations FOR SELECT
  USING (user_id = (SELECT auth.uid()));
```

### Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| Strict-Transport-Security | max-age=63072000 | Force HTTPS |
| X-Frame-Options | SAMEORIGIN | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer |

---

## Design Decisions

### ADR-001: TypeScript Strict Mode

**Status**: Accepted

**Context**: Need to ensure type safety across the codebase.

**Decision**: Enable TypeScript strict mode with additional strict checks.

**Consequences**:
- Catches type errors at compile time
- Requires explicit type annotations
- May require more initial setup for third-party libraries

### ADR-002: Supabase for Backend

**Status**: Accepted

**Context**: Need a backend solution with authentication, database, and real-time capabilities.

**Decision**: Use Supabase as the primary backend service.

**Consequences**:
- Rapid development with managed services
- Built-in RLS for security
- PostgreSQL flexibility
- Vendor lock-in considerations

### ADR-003: Parallel Health Checks

**Status**: Accepted

**Context**: Sequential health checks for 40+ URLs take too long.

**Decision**: Implement concurrent URL testing with configurable concurrency limit.

**Consequences**:
- Faster audit completion (5min → 30s)
- Need to manage concurrency to avoid rate limiting
- More complex error handling

### ADR-004: Monorepo with Turborepo

**Status**: Accepted

**Context**: Multiple packages need to be managed together.

**Decision**: Use Turborepo for monorepo management.

**Consequences**:
- Shared configuration and dependencies
- Efficient caching and incremental builds
- Learning curve for team members

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
