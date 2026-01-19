# FlashFusion Next.js 14 Monorepo Scaffold

**Purpose:** Production-ready Next.js 14 monorepo structure consolidating 40+ deployments into a single, maintainable codebase.

---

## Architecture

```
flashfusion-monorepo/
├── apps/
│   └── web/                      # Main Next.js 14 application
│       ├── app/                  # App Router (Next.js 14+)
│       │   ├── (auth)/          # Auth route group
│       │   ├── (dashboard)/     # Dashboard route group
│       │   ├── api/             # API routes
│       │   ├── layout.tsx       # Root layout
│       │   └── page.tsx         # Home page
│       ├── components/          # React components
│       ├── lib/                 # Utilities
│       ├── public/              # Static assets
│       └── package.json
├── packages/
│   ├── ui/                      # Shared UI components
│   ├── config/                  # Shared config (ESLint, TS, Tailwind)
│   ├── supabase/                # Supabase client & types
│   └── utils/                   # Shared utilities
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI pipeline
│       └── deploy.yml           # CD pipeline
├── turbo.json                   # Turborepo config
├── package.json                 # Root package.json
└── README.md
```

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3+ (strict mode)
- **Styling:** Tailwind CSS 3.4
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL + RLS)
- **Auth:** Supabase Auth
- **Monorepo:** Turborepo
- **Package Manager:** pnpm
- **Testing:** Jest + React Testing Library + Playwright
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel
- **Error Tracking:** Sentry
- **Analytics:** Vercel Analytics

---

## Quick Start

```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
cd packages/supabase && pnpm db:push

# Start development server
pnpm dev

# Open browser
open http://localhost:3000
```

---

## Project Structure Details

### `/apps/web` - Main Application

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   ├── signup/
│   │   │   └── page.tsx           # Signup page
│   │   └── layout.tsx             # Auth layout (no sidebar)
│   ├── (dashboard)/
│   │   ├── generate/
│   │   │   └── page.tsx           # App generation page
│   │   ├── deployments/
│   │   │   └── page.tsx           # Deployments list
│   │   ├── settings/
│   │   │   └── page.tsx           # User settings
│   │   └── layout.tsx             # Dashboard layout (with sidebar)
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts           # POST /api/generate
│   │   ├── deployments/
│   │   │   └── route.ts           # GET /api/deployments
│   │   └── health/
│   │       └── route.ts           # GET /api/health
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Global styles
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── forms/
│   │   └── GenerationForm.tsx
│   ├── layouts/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── providers/
│       ├── SupabaseProvider.tsx
│       └── ThemeProvider.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   └── server.ts              # Server client
│   ├── api/
│   │   └── client.ts              # tRPC client
│   └── utils.ts                   # Utility functions
└── middleware.ts                  # Auth middleware
```

### `/packages` - Shared Code

```
packages/
├── ui/                            # Shared UI components
│   ├── src/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   └── package.json
├── config/
│   ├── eslint/                    # ESLint config
│   ├── typescript/                # TS config
│   └── tailwind/                  # Tailwind config
├── supabase/
│   ├── src/
│   │   ├── client.ts              # Supabase client factory
│   │   ├── types.ts               # Database types
│   │   └── queries.ts             # Reusable queries
│   └── migrations/                # SQL migrations
└── utils/
    ├── src/
    │   ├── validators.ts          # Zod schemas
    │   ├── formatters.ts          # Date, currency formatters
    │   └── constants.ts           # Shared constants
    └── package.json
```

---

## Key Features

### 1. App Router (Next.js 14)
- Server Components by default
- Route Groups for layouts
- Server Actions for mutations
- Streaming with Suspense

### 2. Type Safety
- TypeScript strict mode
- Supabase type generation
- tRPC for end-to-end type safety
- Zod validation

### 3. Authentication
- Supabase Auth (Google, GitHub, Email)
- Protected routes with middleware
- RLS policies enforce data isolation

### 4. Performance
- Static generation where possible
- Image optimization
- Font optimization
- Bundle analysis

### 5. Testing
- Unit tests (Jest + RTL)
- E2E tests (Playwright)
- API tests (Supertest)
- 80%+ coverage target

### 6. CI/CD
- Lint + Type-check on PR
- Run tests before merge
- Auto-deploy to Vercel on main push
- Preview deployments for PRs

---

## Scripts

### Development
```bash
pnpm dev              # Start dev server (all apps)
pnpm dev --filter web # Start only web app
pnpm build            # Build for production
pnpm start            # Start production server
```

### Database
```bash
pnpm db:push          # Apply migrations
pnpm db:seed          # Seed sample data
pnpm db:reset         # Reset database
pnpm db:types         # Generate TypeScript types
```

### Testing
```bash
pnpm test             # Run all tests
pnpm test:watch       # Watch mode
pnpm test:e2e         # E2E tests
pnpm test:coverage    # Coverage report
```

### Code Quality
```bash
pnpm lint             # Lint all packages
pnpm lint:fix         # Fix linting issues
pnpm type-check       # TypeScript check
pnpm format           # Format with Prettier
```

---

## Environment Variables

### Required (apps/web/.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Auth Providers (optional)
AUTH_GOOGLE_CLIENT_ID=your-google-client-id
AUTH_GOOGLE_CLIENT_SECRET=your-google-secret
AUTH_GITHUB_CLIENT_ID=your-github-client-id
AUTH_GITHUB_CLIENT_SECRET=your-github-secret
```

### Optional (Production)

```bash
# Monitoring
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Feature Flags
ENABLE_EXPERIMENTAL_FEATURES=false
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Auto-deploy:** Push to `main` branch triggers production deployment via GitHub Actions.

### Manual Deployment

```bash
# Build
pnpm build

# Start production server
pnpm start
```

---

## Migration Strategy

### Phase 1: Core Setup (Week 1)
1. Initialize monorepo structure
2. Set up Supabase integration
3. Implement auth flow
4. Create dashboard layout

### Phase 2: Feature Migration (Week 2-3)
1. Migrate triage AI → `/apps/web/app/(dashboard)/triage`
2. Migrate animation studio → `/apps/web/app/(dashboard)/animation`
3. Migrate component library → `/packages/ui`

### Phase 3: Deprecation (Week 4)
1. Archive old deployments
2. Set up redirects
3. Update DNS records
4. Monitor for errors

---

## Testing Strategy

### Unit Tests (80%+ coverage)
```typescript
// components/forms/GenerationForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GenerationForm } from './GenerationForm';

describe('GenerationForm', () => {
  it('validates required fields', () => {
    render(<GenerationForm />);
    fireEvent.click(screen.getByText('Generate'));
    expect(screen.getByText('App name is required')).toBeInTheDocument();
  });
});
```

### E2E Tests (Critical paths)
```typescript
// e2e/generation-flow.spec.ts
import { test, expect } from '@playwright/test';

test('user can generate app', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  // ... complete flow
});
```

---

## Security Checklist

Before production:

- [ ] RLS policies verified
- [ ] Auth middleware on protected routes
- [ ] Input validation with Zod
- [ ] Rate limiting enabled
- [ ] CSRF protection (Next.js built-in)
- [ ] Secrets in environment variables
- [ ] Dependency scanning (Snyk)
- [ ] HTTPS enforced
- [ ] Error messages sanitized
- [ ] Audit logging enabled

---

## Performance Targets

- **LCP (Largest Contentful Paint):** < 2.5s
- **INP (Interaction to Next Paint):** < 200ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTFB (Time to First Byte):** < 800ms
- **Bundle Size:** < 200KB (initial load)

---

## Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Turborepo Docs:** https://turbo.build/repo/docs
- **shadcn/ui:** https://ui.shadcn.com

---

## Next Steps

After scaffold is set up:

1. **Review structure** - Ensure folder organization matches team conventions
2. **Configure CI/CD** - Test GitHub Actions workflows
3. **Seed database** - Run `pnpm db:seed` for sample data
4. **Start migrating features** - Begin with highest-value features
5. **Update DNS** - Point flashfusion.vercel.app to new deployment

**Estimated Setup Time:** 2-4 hours
