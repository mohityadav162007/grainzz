-- 041_fix_blogs_rls_and_is_active.sql
-- Standardize blogs table RLS to use the is_admin() helper function,
-- consistent with every other table in the schema.
-- The old "Admins have full access to blogs" policy used a verbose inline
-- EXISTS() check instead of is_admin() — replace it for consistency and
-- to guarantee the admin panel can always read, write, update, and delete blogs.

-- Drop the old verbose admin policy (created in 034_blogs.sql)
DROP POLICY IF EXISTS "Admins have full access to blogs" ON public.blogs;

-- Re-create using the standard is_admin() helper used across the entire schema
CREATE POLICY "Admin full access on blogs"
    ON public.blogs
    FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
