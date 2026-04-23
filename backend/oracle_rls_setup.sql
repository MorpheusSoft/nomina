DO $$
DECLARE
    t_name text;
BEGIN
    -- 1. Create the role if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'oracle_readonly') THEN
        CREATE ROLE oracle_readonly;
    END IF;

    -- 2. Grant basic connect/usage
    GRANT USAGE ON SCHEMA public TO oracle_readonly;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO oracle_readonly;
    
    -- 3. Optionally alter default privileges so future tables are also readable
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO oracle_readonly;

    -- 4. Enable RLS and create policy for all tables containing tenant_id
    FOR t_name IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND column_name = 'tenant_id'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t_name);
        
        -- Drop policy if it already exists to avoid errors
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I;', t_name);
        
        -- Create the policy restricted to oracle_readonly
        EXECUTE format('
            CREATE POLICY tenant_isolation_policy ON %I 
            FOR SELECT TO oracle_readonly 
            USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);
        ', t_name);
    END LOOP;
END
$$;
