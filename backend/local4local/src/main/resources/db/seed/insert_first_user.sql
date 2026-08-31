-- Seed script: create the first (municipality) user for a fresh local environment.
-- Run AFTER the backend has started once, so Flyway migrations have created the schema.
--
-- Replace before running:
--   :email      -> your email address
--   :tenant_id  -> a tenant id from l4l_security.tenants
--
-- The password hash below corresponds to 'Password1!' (bcrypt).
-- Generate a different hash at https://bcrypt-generator.com if needed.

INSERT INTO l4l_security."user"
    (username, password, is_active, tenant_id, supplier_id, is_approved, first_name, last_name, is_enabled)
VALUES
    ('your_email@example.com',
     '$2y$12$CFBzxx0/9JT5/x.x9/40gOIgJKCwMrfaWdSA4OxvtgkXrGrazWgqu',
     true,
     'tenant_id',   -- replace with a real tenant id (see l4l_security.tenants)
     null,
     true,
     'First Name',
     'Last Name',
     true);

-- Assign the municipality admin role (role_id 0) to the newly created user:
INSERT INTO l4l_security.user_role (user_id, role_id)
SELECT id, 0
FROM l4l_security."user"
WHERE username = 'your_email@example.com';
