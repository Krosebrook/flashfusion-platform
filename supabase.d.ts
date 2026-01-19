/**
 * Supabase Client Utilities
 *
 * Provides type-safe Supabase clients for:
 * - Client Components (browser)
 * - Server Components (server)
 * - Server Actions (server with mutations)
 */
export declare function createClient(): any;
export declare function createServerSupabaseClient(): Promise<any>;
export declare function createServerActionClient(): Promise<any>;
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export interface Database {
    public: {
        Tables: {
            user_profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            app_generations: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    description: string | null;
                    config: Record<string, any>;
                    status: 'pending' | 'processing' | 'completed' | 'failed';
                    error_message: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    description?: string | null;
                    config?: Record<string, any>;
                    status?: 'pending' | 'processing' | 'completed' | 'failed';
                    error_message?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    description?: string | null;
                    config?: Record<string, any>;
                    status?: 'pending' | 'processing' | 'completed' | 'failed';
                    error_message?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            deployments: {
                Row: {
                    id: string;
                    generation_id: string;
                    platform: string;
                    url: string | null;
                    status: 'pending' | 'deploying' | 'active' | 'failed';
                    metadata: Record<string, any> | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    generation_id: string;
                    platform: string;
                    url?: string | null;
                    status?: 'pending' | 'deploying' | 'active' | 'failed';
                    metadata?: Record<string, any> | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    generation_id?: string;
                    platform?: string;
                    url?: string | null;
                    status?: 'pending' | 'deploying' | 'active' | 'failed';
                    metadata?: Record<string, any> | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Enums: {};
    };
}
//# sourceMappingURL=supabase.d.ts.map