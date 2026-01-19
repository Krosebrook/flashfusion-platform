-- Migration: 20251122_flashfusion_core_schema.sql
-- Purpose: Establish baseline database for FlashFusion ecosystem
-- Author: FlashFusion UARGP v2.0
-- Date: 2025-11-22

-- ==============================================================================
-- EXTENSIONS
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLES
-- ==============================================================================

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
    platform TEXT NOT NULL CHECK (platform IN ('web', 'mobile', 'desktop', 'edge', 'extension', 'cli')),
    framework TEXT NOT NULL CHECK (framework IN ('react', 'nextjs', 'vue', 'nuxt', 'svelte', 'sveltekit', 'flutter', 'react-native', 'tauri', 'electron')),
    config JSONB NOT NULL, -- Stores full GenerationRequest object
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validating', 'generating', 'complete', 'error')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
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
    platform TEXT NOT NULL CHECK (platform IN ('vercel', 'base44', 'replit', 'netlify', 'lovable', 'bolt', 'blink')),
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'stale')),
    last_verified TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_app_generations_user_id 
    ON public.app_generations (user_id);

CREATE INDEX IF NOT EXISTS idx_app_generations_status 
    ON public.app_generations (status);

CREATE INDEX IF NOT EXISTS idx_app_generations_created_at 
    ON public.app_generations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deployments_app_generation_id 
    ON public.deployments (app_generation_id);

CREATE INDEX IF NOT EXISTS idx_deployments_status 
    ON public.deployments (status);

CREATE INDEX IF NOT EXISTS idx_deployments_platform 
    ON public.deployments (platform);

-- GIN index for JSONB config search
CREATE INDEX IF NOT EXISTS idx_app_generations_config 
    ON public.app_generations USING GIN (config);

-- Full-text search on app names
CREATE INDEX IF NOT EXISTS idx_app_generations_app_name_fts 
    ON public.app_generations USING GIN (to_tsvector('english', app_name));

-- Compound index for user's recent generations
CREATE INDEX IF NOT EXISTS idx_user_recent_generations 
    ON public.app_generations (user_id, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" 
    ON public.user_profiles
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.user_profiles
    FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.user_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- App Generations Policies
CREATE POLICY "Users can view their own generations" 
    ON public.app_generations
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations" 
    ON public.app_generations
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations" 
    ON public.app_generations
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Deployments Policies
CREATE POLICY "Users can view their deployments" 
    ON public.deployments
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.app_generations
            WHERE app_generations.id = deployments.app_generation_id
            AND app_generations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create deployments for their generations" 
    ON public.deployments
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.app_generations
            WHERE app_generations.id = deployments.app_generation_id
            AND app_generations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their deployments" 
    ON public.deployments
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.app_generations
            WHERE app_generations.id = deployments.app_generation_id
            AND app_generations.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- TRIGGERS
-- ==============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: app_generations updated_at
CREATE TRIGGER update_app_generations_updated_at 
    BEFORE UPDATE ON public.app_generations
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: deployments updated_at
CREATE TRIGGER update_deployments_updated_at 
    BEFORE UPDATE ON public.deployments
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- FUNCTIONS
-- ==============================================================================

-- Function: Create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function: Get user's generation statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_generations', COUNT(*),
        'completed_generations', COUNT(*) FILTER (WHERE status = 'complete'),
        'failed_generations', COUNT(*) FILTER (WHERE status = 'error'),
        'pending_generations', COUNT(*) FILTER (WHERE status IN ('pending', 'validating', 'generating')),
        'total_deployments', (
            SELECT COUNT(*) 
            FROM public.deployments d
            JOIN public.app_generations ag ON d.app_generation_id = ag.id
            WHERE ag.user_id = user_uuid
        ),
        'active_deployments', (
            SELECT COUNT(*) 
            FROM public.deployments d
            JOIN public.app_generations ag ON d.app_generation_id = ag.id
            WHERE ag.user_id = user_uuid AND d.status = 'active'
        )
    ) INTO stats
    FROM public.app_generations
    WHERE user_id = user_uuid;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- VIEWS
-- ==============================================================================

-- View: User dashboard summary
CREATE OR REPLACE VIEW public.user_dashboard AS
SELECT 
    ag.user_id,
    ag.id AS generation_id,
    ag.app_name,
    ag.platform,
    ag.framework,
    ag.status,
    ag.progress,
    ag.download_url,
    ag.created_at,
    ag.updated_at,
    COUNT(d.id) AS deployment_count,
    COUNT(d.id) FILTER (WHERE d.status = 'active') AS active_deployment_count
FROM public.app_generations ag
LEFT JOIN public.deployments d ON ag.id = d.app_generation_id
GROUP BY ag.id, ag.user_id, ag.app_name, ag.platform, ag.framework, ag.status, ag.progress, ag.download_url, ag.created_at, ag.updated_at;

-- ==============================================================================
-- GRANTS
-- ==============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.app_generations TO authenticated;
GRANT ALL ON public.deployments TO authenticated;

-- Grant sequence permissions (for auto-incrementing IDs if needed)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function execution
GRANT EXECUTE ON FUNCTION public.get_user_stats TO authenticated;

-- ==============================================================================
-- COMMENTS
-- ==============================================================================

COMMENT ON TABLE public.user_profiles IS 'User profile information extending auth.users';
COMMENT ON TABLE public.app_generations IS 'App generation requests and their status';
COMMENT ON TABLE public.deployments IS 'Deployment tracking for audit and management';

COMMENT ON COLUMN public.app_generations.config IS 'Full GenerationRequest JSONB: {platform, framework, features, styling, auth, database, deployment}';
COMMENT ON COLUMN public.app_generations.cost_estimate IS 'Estimated infrastructure costs: {vercel: 10, supabase: 5, total: 15}';
COMMENT ON COLUMN public.app_generations.logs IS 'Array of timestamped log entries for debugging';

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================

-- Verify tables created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('user_profiles', 'app_generations', 'deployments');
    
    IF table_count = 3 THEN
        RAISE NOTICE 'SUCCESS: All 3 tables created';
    ELSE
        RAISE EXCEPTION 'FAILURE: Expected 3 tables, found %', table_count;
    END IF;
END $$;
