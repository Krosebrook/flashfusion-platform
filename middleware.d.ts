import { type NextRequest } from 'next/server';
/**
 * Middleware: Authentication & Security
 *
 * Runs on every request to:
 * 1. Refresh Supabase session
 * 2. Protect authenticated routes
 * 3. Add security headers
 * 4. Rate limiting (via edge config)
 */
export declare function middleware(request: NextRequest): Promise<any>;
export declare const config: {
    matcher: string[];
};
//# sourceMappingURL=middleware.d.ts.map