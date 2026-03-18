-- MySQL migration: create addresses table and persist checkout address/payment data in orders

CREATE TABLE IF NOT EXISTS addresses (
  address_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  ward VARCHAR(100) NOT NULL,
  address_type VARCHAR(30) NOT NULL DEFAULT 'home',
  state VARCHAR(100) DEFAULT NULL,
  postal_code VARCHAR(20) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (address_id),
  KEY IDX_addresses_user_id (user_id),
  CONSTRAINT FK_addresses_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE addresses
  MODIFY COLUMN phone VARCHAR(20) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS district VARCHAR(100) NOT NULL DEFAULT 'Unknown District' AFTER city,
  ADD COLUMN IF NOT EXISTS ward VARCHAR(100) NOT NULL DEFAULT 'Unknown Ward' AFTER district,
  ADD COLUMN IF NOT EXISTS address_type VARCHAR(30) NOT NULL DEFAULT 'home' AFTER ward;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS address_id BIGINT NULL AFTER order_discount_id,
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NULL AFTER address_id,
  ADD COLUMN IF NOT EXISTS order_code VARCHAR(40) NULL AFTER user_id,
  ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50) NULL AFTER order_discount_id,
  ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2) NULL AFTER payment_method,
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) NULL AFTER subtotal_amount,
  ADD COLUMN IF NOT EXISTS shipping_full_name VARCHAR(100) NULL AFTER status,
  ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20) NULL AFTER shipping_full_name,
  ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100) NULL AFTER shipping_phone,
  ADD COLUMN IF NOT EXISTS shipping_district VARCHAR(100) NULL AFTER shipping_city,
  ADD COLUMN IF NOT EXISTS shipping_ward VARCHAR(100) NULL AFTER shipping_district,
  ADD COLUMN IF NOT EXISTS shipping_address_line VARCHAR(255) NULL AFTER shipping_ward,
  ADD COLUMN IF NOT EXISTS shipping_address_type VARCHAR(30) NULL AFTER shipping_address_line;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS book_title VARCHAR(255) NULL AFTER subtotal,
  ADD COLUMN IF NOT EXISTS category_name VARCHAR(100) NULL AFTER book_title;

SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'orders'
    AND CONSTRAINT_NAME = 'FK_orders_address_id'
);

SET @fk_sql := IF(
  @fk_exists = 0,
  'ALTER TABLE orders ADD CONSTRAINT FK_orders_address_id FOREIGN KEY (address_id) REFERENCES addresses (address_id) ON DELETE SET NULL',
  'SELECT 1'
);

PREPARE stmt FROM @fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @order_code_idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'orders'
    AND INDEX_NAME = 'UK_orders_order_code'
);

SET @order_code_idx_sql := IF(
  @order_code_idx_exists = 0,
  'ALTER TABLE orders ADD UNIQUE KEY UK_orders_order_code (order_code)',
  'SELECT 1'
);

PREPARE stmt FROM @order_code_idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Seed one default address from existing user profile data if user has not had any address yet.
INSERT INTO addresses (
  user_id,
  full_name,
  phone,
  address_line,
  city,
  district,
  ward,
  address_type,
  state,
  postal_code,
  country,
  is_default,
  created_at,
  updated_at
)
SELECT
  u.user_id,
  COALESCE(NULLIF(TRIM(u.full_name), ''), CONCAT('User ', u.user_id)),
  COALESCE(NULLIF(TRIM(u.phone), ''), ''),
  COALESCE(NULLIF(TRIM(u.address), ''), 'Default Address'),
  'Unknown City',
  'Unknown District',
  'Unknown Ward',
  'home',
  NULL,
  NULL,
  'VN',
  1,
  NOW(6),
  NOW(6)
FROM users u
WHERE NOT EXISTS (
  SELECT 1
  FROM addresses a
  WHERE a.user_id = u.user_id
);

-- Link existing orders to each user's default address when address_id is missing.
UPDATE orders o
JOIN (
  SELECT a1.user_id, a1.address_id
  FROM addresses a1
  JOIN (
    SELECT user_id, MIN(address_id) AS min_address_id
    FROM addresses
    GROUP BY user_id
  ) am ON am.user_id = a1.user_id AND am.min_address_id = a1.address_id
) da ON da.user_id = o.user_id
SET o.address_id = da.address_id
WHERE o.address_id IS NULL;

UPDATE orders
SET order_code = CONCAT('ORD-', LPAD(order_id, 10, '0'))
WHERE order_code IS NULL;

UPDATE orders o
LEFT JOIN addresses a ON a.address_id = o.address_id
SET
  o.shipping_full_name = COALESCE(o.shipping_full_name, a.full_name),
  o.shipping_phone = COALESCE(o.shipping_phone, a.phone),
  o.shipping_city = COALESCE(o.shipping_city, a.city),
  o.shipping_district = COALESCE(o.shipping_district, a.district),
  o.shipping_ward = COALESCE(o.shipping_ward, a.ward),
  o.shipping_address_line = COALESCE(o.shipping_address_line, a.address_line),
  o.shipping_address_type = COALESCE(o.shipping_address_type, a.address_type),
  o.subtotal_amount = COALESCE(o.subtotal_amount, o.total_amount),
  o.discount_amount = COALESCE(o.discount_amount, 0),
  o.payment_method = COALESCE(o.payment_method, 'cod')
WHERE o.order_id IS NOT NULL;

UPDATE order_items oi
LEFT JOIN books b ON b.book_id = oi.book_id
LEFT JOIN categories c ON c.category_id = b.category_id
SET
  oi.book_title = COALESCE(oi.book_title, b.title),
  oi.category_name = COALESCE(oi.category_name, c.category_name)
WHERE oi.order_item_id IS NOT NULL;
