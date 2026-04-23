DO $$
DECLARE
    t_name text;
BEGIN
    -- 1. Capa 2: Bloquear accesos a meta-datos al oracle
    REVOKE ALL ON SCHEMA information_schema FROM oracle_readonly;
    REVOKE ALL ON SCHEMA pg_catalog FROM oracle_readonly;

    -- 2. Reforzar todas las tablas RLS con el control combinado
    FOR t_name IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND column_name = 'tenant_id'
    LOOP
        -- Borramos politica anterior
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I;', t_name);
        
        -- Si la tabla es employment_records o workers, aplicamos el candado de confidencialidad
        IF t_name = 'employment_records' THEN
            EXECUTE format('
                CREATE POLICY tenant_isolation_policy ON %I 
                FOR SELECT TO oracle_readonly 
                USING (
                  tenant_id = current_setting(''app.current_tenant_id'', true)::uuid
                  AND (
                    is_confidential = false 
                    OR current_setting(''app.has_confidential'', true) = ''true''
                  )
                );
            ', t_name);
        ELSIF t_name = 'workers' THEN
            EXECUTE format('
                CREATE POLICY tenant_isolation_policy ON %I 
                FOR SELECT TO oracle_readonly 
                USING (
                  tenant_id = current_setting(''app.current_tenant_id'', true)::uuid
                  AND (
                    current_setting(''app.has_confidential'', true) = ''true''
                    OR id NOT IN (SELECT worker_id FROM employment_records WHERE is_confidential = true)
                  )
                );
            ', t_name);
        ELSIF t_name = 'payroll_receipts' THEN
            EXECUTE format('
                CREATE POLICY tenant_isolation_policy ON %I 
                FOR SELECT TO oracle_readonly 
                USING (
                  tenant_id = current_setting(''app.current_tenant_id'', true)::uuid
                  AND (
                    current_setting(''app.has_confidential'', true) = ''true''
                    OR worker_id NOT IN (SELECT worker_id FROM employment_records WHERE is_confidential = true)
                  )
                );
            ', t_name);
        ELSE
            -- Las demas tablas (asistencia, etc) mantienen el aislamiento normal o las adaptas despues
            EXECUTE format('
                CREATE POLICY tenant_isolation_policy ON %I 
                FOR SELECT TO oracle_readonly 
                USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);
            ', t_name);
        END IF;

    END LOOP;
END
$$;
