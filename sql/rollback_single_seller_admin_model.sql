-- Rollback: restore data changed by migrate_to_single_seller_admin_model.sql (MySQL)
-- Required backup tables (created by migration script):
--   backup_ss_admin_users_roles_admin
--   backup_ss_admin_books_seller
--   backup_ss_admin_shops
--   backup_ss_admin_seller_requests

START TRANSACTION;

-- Restore ROLE_ADMIN assignments
DELETE FROM users_roles
WHERE role_name = 'ROLE_ADMIN';

INSERT INTO users_roles (user_id, role_name)
SELECT b.user_id, b.role_name
FROM backup_ss_admin_users_roles_admin b;

-- Restore books.seller_user_id
UPDATE books b
JOIN backup_ss_admin_books_seller bb ON bb.book_id = b.book_id
SET b.seller_user_id = bb.seller_user_id;

-- Restore shops table content
DELETE FROM shops;

INSERT INTO shops
SELECT *
FROM backup_ss_admin_shops;

-- Restore seller_requests status/reject_reason
UPDATE seller_requests sr
JOIN backup_ss_admin_seller_requests b ON b.id = sr.id
SET
  sr.status = b.status,
  sr.reject_reason = b.reject_reason;

COMMIT;

-- Verification
SELECT ur.user_id, ur.role_name
FROM users_roles ur
WHERE ur.role_name = 'ROLE_ADMIN';

SELECT COUNT(*) AS changed_books_after_rollback
FROM books b
JOIN backup_ss_admin_books_seller bb ON bb.book_id = b.book_id
WHERE NOT (
  (b.seller_user_id IS NULL AND bb.seller_user_id IS NULL)
  OR b.seller_user_id = bb.seller_user_id
);

SELECT COUNT(*) AS shops_count_after_rollback
FROM shops;
