-- Migration: move to single-seller admin-managed model (MySQL)
-- Steps:
-- 1) Set SELLER_USER_ID
-- 2) Run this script in the target database
-- 3) Verify with the SELECT statements at the end
-- 4) If needed, run rollback_single_seller_admin_model.sql

SET @SELLER_USER_ID := 1;

-- Backup snapshots for rollback
CREATE TABLE IF NOT EXISTS backup_ss_admin_users_roles_admin (
  user_id BIGINT NOT NULL,
  role_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, role_name)
);

CREATE TABLE IF NOT EXISTS backup_ss_admin_books_seller (
  book_id BIGINT NOT NULL PRIMARY KEY,
  seller_user_id BIGINT NULL
);

CREATE TABLE IF NOT EXISTS backup_ss_admin_shops LIKE shops;

CREATE TABLE IF NOT EXISTS backup_ss_admin_seller_requests (
  id BIGINT NOT NULL PRIMARY KEY,
  status VARCHAR(20) NOT NULL,
  reject_reason VARCHAR(255) NULL
);

TRUNCATE TABLE backup_ss_admin_users_roles_admin;
TRUNCATE TABLE backup_ss_admin_books_seller;
TRUNCATE TABLE backup_ss_admin_shops;
TRUNCATE TABLE backup_ss_admin_seller_requests;

INSERT INTO backup_ss_admin_users_roles_admin (user_id, role_name)
SELECT ur.user_id, ur.role_name
FROM users_roles ur
WHERE ur.role_name = 'ROLE_ADMIN';

INSERT INTO backup_ss_admin_books_seller (book_id, seller_user_id)
SELECT b.book_id, b.seller_user_id
FROM books b;

INSERT INTO backup_ss_admin_shops
SELECT * FROM shops;

INSERT INTO backup_ss_admin_seller_requests (id, status, reject_reason)
SELECT sr.id, sr.status, sr.reject_reason
FROM seller_requests sr;

START TRANSACTION;

-- Ensure core roles exist
INSERT INTO roles (role_name, description)
VALUES
  ('ROLE_ADMIN', 'Administrator'),
  ('ROLE_USER', 'Customer')
ON DUPLICATE KEY UPDATE
  description = VALUES(description);

-- Make selected seller account an admin
INSERT IGNORE INTO users_roles (user_id, role_name)
VALUES
  (@SELLER_USER_ID, 'ROLE_ADMIN');

-- Optional hard rule: keep exactly one admin account
DELETE ur
FROM users_roles ur
WHERE ur.role_name = 'ROLE_ADMIN'
  AND ur.user_id <> @SELLER_USER_ID;

-- Assign all books to the single seller account
UPDATE books
SET seller_user_id = @SELLER_USER_ID
WHERE seller_user_id IS NULL OR seller_user_id <> @SELLER_USER_ID;

-- Keep only one shop for the single seller account
DELETE FROM shops
WHERE user_id <> @SELLER_USER_ID;

INSERT INTO shops (user_id, shop_name, description, logo_url, created_at, updated_at)
SELECT
  @SELLER_USER_ID,
  'Admin Managed Shop',
  'Single-seller shop managed from admin page',
  NULL,
  NOW(6),
  NOW(6)
WHERE NOT EXISTS (
  SELECT 1
  FROM shops s
  WHERE s.user_id = @SELLER_USER_ID
);

-- Optional: stop open seller registration requests in single-seller mode
UPDATE seller_requests
SET
  status = 'rejected',
  reject_reason = 'Disabled by single-seller admin model'
WHERE status = 'pending';

COMMIT;

-- Verification
SELECT user_id, email
FROM users
WHERE user_id = @SELLER_USER_ID;

SELECT ur.user_id, ur.role_name
FROM users_roles ur
WHERE ur.role_name = 'ROLE_ADMIN';

SELECT COUNT(*) AS books_outside_single_seller
FROM books
WHERE seller_user_id <> @SELLER_USER_ID OR seller_user_id IS NULL;

SELECT shop_id, user_id, shop_name
FROM shops;
