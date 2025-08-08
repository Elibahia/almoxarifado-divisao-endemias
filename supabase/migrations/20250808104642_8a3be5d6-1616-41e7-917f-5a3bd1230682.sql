
-- Phase 1: Critical Data Protection - Drop unnecessary backup tables
DROP TABLE IF EXISTS backup_user_profiles_final;
DROP TABLE IF EXISTS backup_user_profiles_temp;

-- Fix database function security by adding search_path configuration
ALTER FUNCTION admin_create_user_safe SET search_path = public, pg_temp;
ALTER FUNCTION admin_create_user SET search_path = public, pg_temp;
ALTER FUNCTION admin_create_user_temp SET search_path = public, pg_temp;
ALTER FUNCTION handle_new_user SET search_path = public, pg_temp;
ALTER FUNCTION is_admin SET search_path = public, pg_temp;
ALTER FUNCTION has_access SET search_path = public, pg_temp;
ALTER FUNCTION generate_product_alerts SET search_path = public, pg_temp;
ALTER FUNCTION update_updated_at_column SET search_path = public, pg_temp;
